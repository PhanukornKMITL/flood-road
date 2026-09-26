import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const external=process.env.TEST_BASE_URL;const base=external||'http://127.0.0.1:8891';let child;
if(!external){const migration=spawnSync('npx',['wrangler','d1','migrations','apply','klaeng-road-reports','--local'],{encoding:'utf8'});if(migration.status)throw Error(migration.stderr);child=spawn('npx',['wrangler','dev','--port','8891'],{stdio:'ignore',detached:true});}
try{
for(let i=0;i<60;i++){try{if((await fetch(base+'/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,300));}
const road=JSON.parse(await readFile(new URL('../dist/roads.geojson',import.meta.url))).features[0].properties.key;
const send=body=>fetch(base+'/api/reports',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(body)});
const r={id:randomUUID(),roadKey:road,reporterId:randomUUID(),status:'flood',time:Date.now()-1000,note:'<script>local integration test</script>'};
assert.equal((await send(r)).status,201);assert.equal((await send(r)).status,201);
const another={...r,id:randomUUID(),reporterId:randomUUID(),status:'clear',time:r.time-1000};assert.equal((await send(another)).status,201);
const detail=await(await fetch(base+'/api/roads/'+encodeURIComponent(road))).json();assert.equal(detail.reports.filter(x=>x.id===r.id).length,1);assert.equal(detail.reports.find(x=>x.id===r.id).note,r.note);assert.ok(detail.reporterCount>=2);assert.equal(detail.reports[0].status,'flood');
const snapshot=await(await fetch(base+'/api/reports')).json();assert.equal(snapshot[road][0].status,'flood');
assert.equal((await send({...r,id:randomUUID(),time:Date.now()+60000})).status,400);assert.equal((await send({...r,id:randomUUID(),roadKey:'fake'})).status,400);assert.equal((await send({...r,id:randomUUID(),status:'safe'})).status,400);
assert.equal((await fetch(base+'/api/reports',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify(r)})).status,403);
console.log('PASS shared reports, unique reporters, timeline order, idempotency, invalid input and origin checks');
}finally{if(child)process.kill(-child.pid,'SIGTERM');}
