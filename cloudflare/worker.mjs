import roadKeys from './road-keys.json';
const keys=new Set(roadKeys);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const entry=r=>({id:r.id,reporterId:r.reporter_id,status:r.status,time:r.observed_at,submittedAt:r.submitted_at,note:r.note});
export default {async fetch(request,env,ctx){try{const url=new URL(request.url);
if(url.pathname==='/health'){await env.DB.prepare('SELECT 1').first();return json({ok:true})}
if(request.method==='GET'&&url.pathname==='/api/reports'){
// Bucketed keys bound staleness to 30 seconds, even across edge cache entries.
const cacheKey=new Request(url.origin+'/api/snapshot?bucket='+Math.floor(Date.now()/30000));const cache=caches.default;const hit=await cache.match(cacheKey);if(hit)return hit;
const {results}=await env.DB.prepare('SELECT * FROM road_latest').all();const data={};for(const r of results)data[r.road_key]=[entry(r)];const response=json(data,200,{'Cache-Control':'public,max-age=30'});ctx.waitUntil(cache.put(cacheKey,response.clone()));return response}
if(request.method==='GET'&&url.pathname.startsWith('/api/roads/')){const key=decodeURIComponent(url.pathname.slice(11));if(!keys.has(key))return json({error:'ไม่พบถนน'},404);
const {results}=await env.DB.prepare('SELECT * FROM road_reports WHERE road_key=? ORDER BY observed_at DESC,submitted_at DESC LIMIT 100').bind(key).all();const count=await env.DB.prepare('SELECT count(*) AS reportCount,count(DISTINCT reporter_id) AS reporterCount FROM road_reports WHERE road_key=?').bind(key).first();return json({...count,reports:results.map(entry)})}
if(request.method==='POST'&&url.pathname==='/api/reports'){
if(request.headers.get('Origin')!==url.origin)return json({error:'Origin rejected'},403);
if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required'},415);
const reader=request.body?.getReader();if(!reader)return json({error:'Missing body'},400);let size=0,chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();return json({error:'Report too large'},413)}chunks.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}let r;try{r=JSON.parse(new TextDecoder().decode(bytes))}catch{return json({error:'Invalid JSON'},400)}
const now=Date.now();if(!uuid.test(r.id)||!uuid.test(r.reporterId)||!keys.has(r.roadKey)||!['clear','flood','closed'].includes(r.status)||!Number.isSafeInteger(r.time)||r.time>now||r.time<now-7*86400000||typeof r.note!=='string'||r.note.length>300)return json({error:'ข้อมูลรายงานไม่ถูกต้อง หรือเก่าเกิน 7 วัน'},400);
const result=await env.DB.prepare(`INSERT OR IGNORE INTO road_reports(id,road_key,reporter_id,status,observed_at,submitted_at,note) SELECT ?,?,?,?,?,?,? WHERE (SELECT count(*) FROM road_reports WHERE reporter_id=? AND submitted_at>?)<30`).bind(r.id,r.roadKey,r.reporterId,r.status,r.time,now,r.note.trim(),r.reporterId,now-3600000).run();if(!result.meta.changes){const old=await env.DB.prepare('SELECT id FROM road_reports WHERE id=? AND reporter_id=?').bind(r.id,r.reporterId).first();if(!old)return json({error:'ส่งรายงานถี่เกินไป โปรดลองภายหลัง'},429)}return json({ok:true},201)}
if(url.pathname.startsWith('/api/'))return json({error:'Not found'},404);
return env.ASSETS.fetch(request);
}catch(error){console.error(JSON.stringify({event:'request_failed',name:error.name}));return json({error:'ระบบขัดข้องชั่วคราว โปรดลองอีกครั้ง'},503)}}};
