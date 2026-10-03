import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {modelSourceHash} from '../../model-build-inputs.mjs';

const root=new URL('../../../',import.meta.url),dist=new URL('../../dist/',import.meta.url),tag='?redesmereBefore';
const original=execFileSync('git',['show','HEAD:Browser/dist/rear-court-photo-detail.mjs'],{cwd:root,encoding:'utf8',windowsHide:true});
const sourceHash=await modelSourceHash(),records={},courseTriangles={};
let phase='before';
globalThis.recordCourtyardScope=(scope,rows)=>{
 if(phase==='before'){
  const counts=new Map();
  for(const row of rows){
   const key=createHash('sha256').update(row).digest('hex'),parsed=JSON.parse(row),p=parsed[3].slice(12,15);
   const reviewable=(p[0]>=63.9&&p[0]<=84.4&&p[1]>=0&&p[1]<=8.6&&p[2]>=-33.1&&p[2]<=-29.1)||parsed[0]==='Estate joined stone courses';
   const entry=counts.get(key)??{count:0,...(reviewable?{row:parsed}:{})};entry.count++;counts.set(key,entry);
  }
  records[scope]={counts,beforeCount:rows.length};
 }else{
  const r=records[scope];r.added=[];
  for(const row of rows){
   const key=createHash('sha256').update(row).digest('hex'),entry=r.counts.get(key);
   if(entry?.count)entry.count--;else r.added.push(JSON.parse(row));
  }
  r.removed=[];
  for(const entry of r.counts.values())if(entry.count){assert(entry.row,'No primitive outside the reviewed courtyard region may change');for(let i=0;i<entry.count;i++)r.removed.push(entry.row);}
  r.unchanged=r.beforeCount-r.removed.length;delete r.counts;
 }
};
registerHooks({
 resolve(specifier,context,next){const r=next(specifier,context);if(context.parentURL?.endsWith(tag)&&r.url.startsWith(dist.href)&&r.url.endsWith('.mjs'))r.url+=tag;return r;},
 load(url,context,next){
  if(url.endsWith(tag)){
   const base=url.slice(0,-tag.length),source=base.endsWith('/rear-court-photo-detail.mjs')?original:readFileSync(new URL(base),'utf8');
   return {format:'module',source,shortCircuit:true};
  }
  const result=next(url,context);
  if(url.endsWith('/jarman-scope.mjs'))return {...result,source:String(result.source).replace('return {primitives:','globalThis.recordCourtyardScope("jarman",rows);return {primitives:')};
  if(url.endsWith('/leighton-scope.mjs'))return {...result,source:String(result.source).replace('return {count:','globalThis.recordCourtyardScope("leighton",rows);return {count:')};
  return result;
 }
});
const {jarmanProtected}=await import('../jarman-scope.mjs'),{leightonProtected}=await import('../leighton-scope.mjs');
const jURL=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lURL=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const jarman=JSON.parse(readFileSync(jURL)),leighton=JSON.parse(readFileSync(lURL));
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
function triangles(model){
 model.updateMatrixWorld(true);const result=[];
 model.traverse(o=>{
  if(o.name!=='Estate joined stone courses')return;
  const g=o.geometry,attrs=Object.entries(g.attributes).sort(),indices=g.index?.array??Array.from({length:g.attributes.position.count},(_,i)=>i);
  for(let i=0;i<indices.length;i+=3){
   const vertices=[];
   for(let j=0;j<3;j++){
    const index=indices[i+j],p=new THREE.Vector3().fromBufferAttribute(g.attributes.position,index).applyMatrix4(o.matrixWorld);
    vertices.push({position:p.toArray(),attributes:attrs.map(([name,a])=>[name,Array.from(a.array.subarray(index*a.itemSize,(index+1)*a.itemSize))])});
   }
   result.push(JSON.stringify(vertices));
  }
 });return result;
}
const before=(await import(new URL('escape-exterior.mjs'+tag,dist))).createEscapeExterior(THREE,1.6);
const old={jarman:jarmanProtected(THREE,before.model),leighton:leightonProtected(THREE,before.model)};
// A stale pre-existing comparison is never refreshed by this repair.
writeFileSync(new URL('before-fingerprints.json',import.meta.url),JSON.stringify(old,null,2)+'\n');
const baselineMatches={jarman:JSON.stringify(old.jarman)===JSON.stringify(jarman),leighton:JSON.stringify(old.leighton)===JSON.stringify(leighton.geometry)};
courseTriangles.before=triangles(before.model);
phase='after';
const after=(await import('../../dist/escape-exterior.mjs')).createEscapeExterior(THREE,1.6);
assert.deepEqual(after.annexe.userData.wards['leighton-newton'].userData.ranges,leighton.ranges);
const updated={jarman:jarmanProtected(THREE,after.model),leighton:leightonProtected(THREE,after.model)};
courseTriangles.after=triangles(after.model);
function difference(a,b){const counts=new Map();for(const row of b)counts.set(row,(counts.get(row)??0)+1);return a.filter(row=>{const n=counts.get(row)??0;if(n){counts.set(row,n-1);return false;}return true;});}
const courseChanges={removed:difference(courseTriangles.before,courseTriangles.after).map(JSON.parse),added:difference(courseTriangles.after,courseTriangles.before).map(JSON.parse)};
for(const triangle of [...courseChanges.removed,...courseChanges.added])for(const {position:[x,y,z]} of triangle)
 assert(x>=63.9&&x<=84.4&&y>=4.8&&y<=5.1&&z>=-33.1&&z<=-29,'Changed joined-course triangles are confined to the rear-return door band');
for(const scope of ['jarman','leighton'])for(const row of [...records[scope].removed,...records[scope].added]){
 const [x,y,z]=row[3].slice(12,15);
 if(row[0]==='Estate joined stone courses')continue;
 assert(row[0]===''&&x>=63.9&&x<=84.4&&y>=0&&y<=8.6&&z>=-33.1&&z<=-29.1,'Changed primitive is confined to the requested courtyard windows or trim');
}
assert.equal(await modelSourceHash(),sourceHash,'Model sources must remain stable during the audit');
const report={sourceHash,originalSource:'HEAD:Browser/dist/rear-court-photo-detail.mjs',baselineMatches,before:old,after:updated,scopes:records,courseChanges};
writeFileSync(new URL('audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
if(process.argv.includes('--write')){
 assert(Object.values(baselineMatches).every(Boolean),'Do not refresh pre-existing comparison mismatches');
 writeFileSync(jURL,JSON.stringify(updated.jarman,null,2)+'\n');
 writeFileSync(lURL,JSON.stringify({...leighton,geometry:updated.leighton},null,2)+'\n');
}
console.log(JSON.stringify({baselineMatches,before:old,after:updated,scopes:Object.fromEntries(Object.entries(records).map(([scope,r])=>[scope,{unchanged:r.unchanged,removed:r.removed.length,added:r.added.length}])),courseTriangles:{removed:courseChanges.removed.length,added:courseChanges.added.length},updated:process.argv.includes('--write')},null,2));
