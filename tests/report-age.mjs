import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');const start=source.indexOf('function state('),end=source.indexOf('function decorate(');const context=vm.createContext({history:()=>[{status:'closed',time:Date.now()-7200000}]});vm.runInContext(source.slice(start,end),context);assert.equal(vm.runInContext("state({properties:{key:'road'}})",context),'closed');context.history=()=>[];assert.equal(vm.runInContext("state({properties:{key:'road'}})",context),'unknown');
console.log('PASS old reports retain their color; missing reports remain unknown');

const ageStart=source.indexOf('function reportAge('),ageEnd=source.indexOf('function updateReportAge(');vm.runInContext(source.slice(ageStart,ageEnd),context);assert.equal(vm.runInContext('reportAge(0,7200000)',context),'ข้อมูลล่าสุด · 2 ชั่วโมงที่แล้ว');assert.equal(vm.runInContext('reportAge(0,300000)',context),'ข้อมูลล่าสุด · 5 นาทีที่แล้ว');
