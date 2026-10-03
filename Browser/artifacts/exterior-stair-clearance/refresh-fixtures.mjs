import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const root=new URL('../../../',import.meta.url),out=new URL('./',import.meta.url);
const audits=JSON.parse(readFileSync(new URL('fixture-audit.json',out))),changes=new Map();
function collect(actual,expected,test){
 if(!expected||typeof expected!=='object')return;
 for(const key of ['sha256','hash','digest'])if(expected[key]&&actual?.[key]&&expected[key]!==actual[key]){
  const next={actual,expected,test,key},prior=changes.get(expected[key]);
  if(prior)assert.deepEqual(prior.actual,actual,'Captured hashes must agree');
  changes.set(expected[key],next);return;
 }
 for(const key of Object.keys(expected))collect(actual?.[key],expected[key],test);
}
for(const audit of audits)if(audit.before===0&&audit.after===0)for(const record of JSON.parse(readFileSync(new URL(audit.capture,out))))collect(record.actual,record.expected,audit.test);
const previous=JSON.parse(readFileSync(new URL('Research/exterior-stair-rails/snapshot-updates.json',root)));
const files=new Set(previous.map(r=>r.file)),updates=[],used=new Set();
function visit(value,file,path=[]){
 if(!value||typeof value!=='object')return;
 for(const key of ['sha256','hash','digest']){
  const change=changes.get(value[key]);if(!change)continue;
  const {actual,expected,test}=change,before=structuredClone(value);
  for(const field of ['count','primitives'])if(actual[field]!==undefined){
   const target=field in value?field:field==='count'&&'primitives' in value?'primitives':null;
   assert(target&&value[target]===expected[field],'Saved primitive counts must match the original capture');
   assert.equal(actual[field],expected[field],'The annexe repair changes positions/geometry, not primitive counts');
  }
  value[key]=actual[key];used.add(expected[key]);updates.push({file,path:path.join('.'),test,before,after:structuredClone(value)});
 }
 for(const [key,child] of Object.entries(value))visit(child,file,[...path,key]);
}
const pending=[];
for(const file of files){const value=JSON.parse(readFileSync(new URL(file,root))),count=updates.length;visit(value,file);if(updates.length>count)pending.push({file,value});}
assert.equal(used.size,changes.size,'Every changed fingerprint has a known fixture');
if(process.argv.includes('--write')){
 for(const {file,value} of pending)writeFileSync(new URL(file,root),JSON.stringify(value,null,2)+'\n');
 const history=new URL('Research/exterior-stair-rails/overlap-snapshot-updates.json',root),prior=existsSync(history)?JSON.parse(readFileSync(history)):[];
 writeFileSync(history,JSON.stringify([...prior,...updates],null,2)+'\n');
}
console.log(JSON.stringify(updates.map(({file,path,test})=>({file,path,test})),null,2));
