import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {modelSourceHash} from '../model-build-inputs.mjs';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const before=read('ground-contact-scope-before.json'),after=read('ground-contact-scope-after.json');
const jarman=read('../../Research/jarman/protected-geometry.json'),leighton=read('../../Research/leighton-newton/protected-before.json');
assert.deepEqual(before.geometry.jarman,jarman,'Reconstructed roots reproduce the existing Jarman baseline');
assert.deepEqual(before.geometry.leighton,leighton.geometry,'Reconstructed roots reproduce the existing Leighton baseline');
assert.equal(after.sourceHash,await modelSourceHash());assert.deepEqual(after.ranges,before.ranges);assert.deepEqual(after.ranges,leighton.ranges);
const report={scopes:{}};
for(const scope of ['jarman','leighton']){
 const a=before.names[scope],b=after.names[scope],changed=[];
 for(const name of new Set([...Object.keys(a),...Object.keys(b)]))if(JSON.stringify(a[name])!==JSON.stringify(b[name])){
  assert(name===''||/^Annexe roadside tree \d+$/.test(name)||/ (trunk|trunk and branches|trunk and limbs|trunk and drooping branches|EZ-Tree branches)$/.test(name),'Unexpected changed geometry '+name);
  assert.equal(a[name].count,b[name].count);changed.push(name);
 }
 report.scopes[scope]={changedNames:changed,unchangedPrimitives:Object.entries(a).filter(([n])=>!changed.includes(n)).reduce((sum,[,r])=>sum+r.count,0)};
}
const anonymous=stage=>JSON.parse(gunzipSync(readFileSync(new URL(`ground-contact-scope-${stage}.json.anonymous.gz`,import.meta.url))));
function difference(a,b){const counts=new Map();for(const row of b)counts.set(row,(counts.get(row)??0)+1);return a.filter(row=>{const count=counts.get(row)??0;if(count){counts.set(row,count-1);return false;}return true;}).map(JSON.parse);}
const old=anonymous('before'),now=anonymous('after'),removed=difference(old,now),added=difference(now,old);
assert.equal(removed.length,added.length);
for(const row of removed){
 assert.equal(row[2][0][1],0x5a4e3d,'Only the simple broadleaf trunk material changes among unnamed meshes');
 const match=added.find(r=>r[3][12]===row[3][12]&&r[3][14]===row[3][14]);assert(match);
 assert.deepEqual(match[2],row[2]);assert(Math.abs(match[3][13]-row[3][13]+.09)<1e-6);
 assert.deepEqual(match.slice(4),row.slice(4));
}
report.unchangedAnonymous=old.length-removed.length;report.extendedBroadleafRoots=removed.length;
if(process.argv.includes('--write')){
 writeFileSync(new URL('../../Research/jarman/protected-geometry.json',import.meta.url),JSON.stringify(after.geometry.jarman,null,2)+'\n');
 writeFileSync(new URL('../../Research/leighton-newton/protected-before.json',import.meta.url),JSON.stringify({...leighton,geometry:after.geometry.leighton},null,2)+'\n');
}
writeFileSync(new URL('ground-contact-snapshot-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('PASS: root-only changes, exact other estate geometry and original ward ranges; snapshots '+(process.argv.includes('--write')?'updated':'verified')+'.');
