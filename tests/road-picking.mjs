import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');const functions=source.slice(source.indexOf('function nearestRoad'),source.indexOf('function unselect'));
const road=(id,y)=>({id,geometry:{type:'LineString',coordinates:[[0,y],[100,y]]}});
let queries=0,chosen=null,cleared=false,features=[road(1,10),road(2,1)];const context=vm.createContext({collection:{},map:{getLayer:()=>true,project:([x,y])=>({x,y}),queryRenderedFeatures:()=>{queries++;return features}},choose:r=>{chosen=r.id;features=[]},unselect:()=>{cleared=true}});vm.runInContext(functions,context);
vm.runInContext('handleRoadClick({point:{x:50,y:0}})',context);assert.equal(chosen,2);assert.equal(queries,1);assert.equal(cleared,false,'selection must survive a layout change after choosing');
vm.runInContext('handleRoadClick({point:{x:50,y:0}})',context);assert.equal(cleared,true);
console.log('PASS closest road selection, one hit query before layout changes, empty map deselection');
