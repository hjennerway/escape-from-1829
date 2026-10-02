// Apply only fingerprints whose historical test passed with the stair edits
// removed. Keep a record of every replaced value for the modelling history.
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
const out=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url);
const audits=JSON.parse(readFileSync(new URL('snapshot-audit.json',out))),changes=new Map();
function collect(actual,expected,test){
 if(!expected||typeof expected!=='object')return;
 for(const key of ['sha256','hash','digest'])if(expected[key]&&actual?.[key]&&expected[key]!==actual[key]){
  const prior=changes.get(expected[key]),change={actual,expected,test,key};
  if(prior&&!isDeepStrictEqual(prior.actual,actual))throw Error('Conflicting captured fingerprints');
  changes.set(expected[key],change);return;
 }
 for(const key of Object.keys(expected))collect(actual?.[key],expected[key],test);
}
for(const audit of audits){
 if(audit.before!==0)continue;
 // These two captures were completed after adding support for nested/hash and
 // digest fingerprints; all their remaining assertions passed normally.
 if(audit.after!==0&&!['test-annexe-rear-side-alignment.mjs','test-annexe-os-refinement.mjs'].includes(audit.file))continue;
 for(const record of JSON.parse(readFileSync(new URL(audit.capture,out))))collect(record.actual,record.expected,audit.file);
}
const updates=[],used=new Set();
function visit(value,file,path=[]){
 if(!value||typeof value!=='object')return;
 for(const key of ['sha256','hash','digest']){
  const change=changes.get(value[key]);if(!change)continue;
  const before=structuredClone(value),{actual,expected,test}=change;
  for(const field of ['count','primitives'])if(actual[field]!==undefined){
   const target=field in value?field:field==='count'&&'primitives' in value?'primitives':null;
   if(!target||value[target]!==expected[field])throw Error('Count mismatch: '+file+' '+path.join('.'));
   value[target]=actual[field];
  }
  value[key]=actual[key];used.add(expected[key]);
  updates.push({file,path:path.join('.'),test,before,after:structuredClone(value)});
 }
 for(const [key,child] of Object.entries(value))visit(child,file,[...path,key]);
}
function scan(dir){
 for(const entry of readdirSync(new URL(dir,root),{withFileTypes:true})){
  const file=dir+'/'+entry.name;
  if(entry.isDirectory())scan(file);
  else if(entry.name.endsWith('.json')){
   const value=JSON.parse(readFileSync(new URL(file,root))),count=updates.length;visit(value,file);
   if(updates.length>count&&process.argv.includes('--write'))writeFileSync(new URL(file,root),JSON.stringify(value,null,2)+'\n');
  }
 }
}
scan('Research');
if(used.size!==changes.size)throw Error('Unmatched fingerprints: '+[...changes.keys()].filter(k=>!used.has(k)).join(','));
if(process.argv.includes('--write'))writeFileSync(new URL('Research/exterior-stair-rails/snapshot-updates.json',root),JSON.stringify(updates,null,2)+'\n');
console.log(JSON.stringify(updates.map(({file,path,test})=>({file,path,test})),null,2));
