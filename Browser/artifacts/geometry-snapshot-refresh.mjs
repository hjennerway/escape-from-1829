// One-off, evidence-gated repair of the September 25 whole-estate baselines.
// Reconstruct both audits first; this never changes or excludes model geometry.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {modelSourceHash} from '../model-build-inputs.mjs';
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url)));
const baseline=read('geometry-snapshot-baseline.json'),current=read('geometry-snapshot-current.json');
const jarmanURL=new URL('../../Research/jarman/protected-geometry.json',import.meta.url);
const leightonURL=new URL('../../Research/leighton-newton/protected-before.json',import.meta.url);
const jarman=JSON.parse(readFileSync(jarmanURL)),leighton=JSON.parse(readFileSync(leightonURL));
assert.equal(baseline.ref,'58f8bf3');
assert.deepEqual(baseline.geometry.jarman,jarman,'Historical source must reproduce the saved Jarman snapshot');
assert.deepEqual(baseline.geometry.leighton,leighton.geometry,'Historical source must reproduce the saved Leighton/Newton snapshot');
assert.deepEqual(current.ranges,leighton.ranges,'Original Leighton/Newton footprint remains exact');
assert.equal(current.sourceHash,await modelSourceHash(),'Current source changed since the audit');
const allowedName=name=>name===''||/^(East|West) front lawn /.test(name)||/^(East|West) semi-basement /.test(name)||
  /^West side basement /.test(name)||/^(East|West) entrance (wall|wing) walk$/.test(name)||
  /^West (courtyard|front|curved bay|outer apron|rear approach)/.test(name)||
  /^(Estate terrain|Connecting corridor ridge|Main kitchen fascia|Main kitchen side gutter|(East|West) inside corner asphalt court)$/.test(name);
const report={historicalRef:baseline.ref,sourceHash:current.sourceHash,before:baseline.geometry,after:current.geometry,scopes:{}};
for(const scope of ['jarman','leighton']){
  const a=baseline.names[scope],b=current.names[scope],changed=[],unchanged=[];
  for(const name of new Set([...Object.keys(a),...Object.keys(b)])){
    if(JSON.stringify(a[name])===JSON.stringify(b[name]))unchanged.push(name);
    else{assert(allowedName(name),'Unexpected changed geometry: '+name);changed.push({name,before:a[name]?.count??0,after:b[name]?.count??0});}
  }
  report.scopes[scope]={unchangedNamedPrimitives:unchanged.reduce((sum,name)=>sum+a[name].count,0),changed};
}
const anonymous=state=>JSON.parse(gunzipSync(readFileSync(new URL(`geometry-snapshot-${state}.json.anonymous.gz`,import.meta.url))));
function difference(a,b){
  const counts=new Map();for(const row of b)counts.set(row,(counts.get(row)??0)+1);
  return a.filter(row=>{const n=counts.get(row)??0;if(n){counts.set(row,n-1);return false;}return true;}).map(JSON.parse);
}
function region([x,y,z]){
  if(x>=-80&&x<=-20&&z>=-50&&z<=40)return 'Documented west facade, courtyard and basement repairs';
  if(x>=23&&x<=25&&z>=46&&z<=48)return 'September 29 removed east lawn tree';
  if(x>=98&&x<=104&&Math.abs(z-39)<1e-6)return 'September 29 Hospital Shop lamp move';
  if(Math.abs(x-31)<1e-6&&Math.abs(z+27.5)<1e-6)return 'Inner court trim clearance correction';
  if(Math.abs(x-15.1)<1e-6&&Math.abs(y+.015)<1e-6&&z===2)return 'Former unexcavated access slab';
  if(x===0&&z===0&&(Math.abs(y+.15)<1e-6||Math.abs(y-.06)<1e-6))return 'Excavated terrain and access fills';
}
const oldAnonymous=anonymous('baseline'),newAnonymous=anonymous('current');
report.anonymous={unchanged:oldAnonymous.length-difference(oldAnonymous,newAnonymous).length};
for(const [kind,rows] of [['removed',difference(oldAnonymous,newAnonymous)],['added',difference(newAnonymous,oldAnonymous)]]){
  const groups={};for(const row of rows){const p=row[3].slice(12,15),name=region(p);assert(name,'Unexpected unnamed geometry change at '+p);groups[name]=(groups[name]??0)+1;}
  report.anonymous[kind]=groups;
}
// All existing assertions and helper exclusions remain intact. Only the two
// stale count/hash pairs change; ranges and every model source are preserved.
if(process.argv.includes('--write')){
  writeFileSync(jarmanURL,JSON.stringify(current.geometry.jarman,null,2)+'\n');
  writeFileSync(leightonURL,JSON.stringify({...leighton,geometry:current.geometry.leighton},null,2)+'\n');
}
writeFileSync(new URL('geometry-snapshot-repair.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({before:report.before,after:report.after,anonymous:report.anonymous,updated:process.argv.includes('--write')},null,2));
