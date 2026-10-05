// Reconstruct the saved references without altering the working model.
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
import {KML_12_ADDITIONS} from '../../dist/kml-12-data.mjs';
import {KML_13_ADDITIONS} from '../../dist/kml-13-data.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';

const root=new URL('../../../',import.meta.url),dist=new URL('../../dist/',import.meta.url);
const ref='db70a03',tag='?testRepair='+ref,sources=new Map(),geometryInfo=new Map();
const sourceHash=await modelSourceHash();
registerHooks({
 resolve(specifier,context,next){const r=next(specifier,context);if(context.parentURL?.endsWith(tag)&&r.url.startsWith(dist.href)&&r.url.endsWith('.mjs'))r.url+=tag;return r;},
 load(url,context,next){
  if(!url.endsWith(tag))return next(url,context);
  const name=url.slice(dist.href.length,-tag.length);
  if(!sources.has(name))sources.set(name,execFileSync('git',['show',ref+':Browser/dist/'+name],{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024}));
  return {format:'module',source:sources.get(name),shortCircuit:true};
 }
});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};

function collect(model,scope){
 model.updateMatrixWorld(true);const rows=[],groups=new Map(),instance=new THREE.Matrix4(),cache=new WeakMap();
 model.traverse(o=>{
  if(!o.isMesh)return;
  const ancestors=[];for(let p=o;p;p=p.parent)ancestors.push(p);
  if(ancestors.some(p=>{
   const tree=p.userData.oakTree??p.userData.adminPineTree;
   return tree&&[...KML_12_ADDITIONS,...KML_13_ADDITIONS].some(point=>point.name===tree.name&&point.coordinates[0]===tree.longitude&&point.coordinates[1]===tree.latitude);
  }))return;
  if(scope==='jarman'&&ancestors.some(p=>p.name==='Oakmere rear court additions'||p.name==='West court front elevation'||p.userData.lampPost||p.userData.willowTree||(p.userData.oakTree?.name==='Oak21'&&p.userData.oakTree.longitude===-2.903725817733399)))return;
  if(scope==='leighton'&&ancestors.some(p=>p.userData.wardId==='leighton-newton'))return;
  let geometry=cache.get(o.geometry);
  if(!geometry){
   const full=createHash('sha256'),shape=createHash('sha256');
   for(const [key,a] of Object.entries(o.geometry.attributes).sort()){
    const bytes=Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength);full.update(key);full.update(bytes);
   }
   if(o.geometry.index)full.update(Buffer.from(o.geometry.index.array.buffer));
   // Index expansion changes storage, not the rendered triangles. Compare the
   // same expanded attributes so the UV-only classification includes that case.
   const expanded=o.geometry.index?o.geometry.toNonIndexed():o.geometry;
   for(const [key,a] of Object.entries(expanded.attributes).sort())if(key!=='uv'){
    shape.update(key);shape.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
   }
   geometry=full.digest('hex');cache.set(o.geometry,geometry);
   if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
   geometryInfo.set(geometry,{shape:shape.digest('hex'),min:o.geometry.boundingBox.min.toArray(),max:o.geometry.boundingBox.max.toArray()});
  }
  const materials=[o.material].flat().map(m=>scope==='jarman'?[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]:[m.type,m.color?.getHex(),m.roughness,m.metalness]);
  const key=ancestors.map(p=>p.name).filter(Boolean).reverse().join(' / ')||'(unnamed estate geometry)';
  if(!groups.has(key))groups.set(key,[]);
  const record=m=>{const row=JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]);rows.push(row);groups.get(key).push(row);};
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(o.matrixWorld,instance));}else record(o.matrixWorld);
 });
 const digest=createHash('sha256').update(rows.sort().join('\n')).digest('hex');
 return {geometry:scope==='jarman'?{primitives:rows.length,sha256:digest}:{count:rows.length,sha256:digest},groups};
}
function difference(a,b,key=x=>x){const counts=new Map();for(const row of b){const k=key(row);counts.set(k,(counts.get(k)??0)+1);}return a.filter(row=>{const k=key(row),count=counts.get(k)??0;if(count){counts.set(k,count-1);return false;}return true;});}
function withoutUV(row){const r=JSON.parse(row);r[1]=geometryInfo.get(r[1]).shape;return JSON.stringify(r);}
function summary(rows){return rows.map(JSON.parse).map(row=>{
 const info=geometryInfo.get(row[1]),box=new THREE.Box3(new THREE.Vector3(...info.min),new THREE.Vector3(...info.max)).applyMatrix4(new THREE.Matrix4().fromArray(row[3]));
 return {mesh:row[0],position:row[3].slice(12,15),bounds:{min:box.min.toArray(),max:box.max.toArray()}};
});}
const jURL=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lURL=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const saved={jarman:JSON.parse(readFileSync(jURL)),leighton:JSON.parse(readFileSync(lURL))};
const before=(await import(new URL('escape-exterior.mjs'+tag,dist))).createEscapeExterior(THREE,1.6);
const after=(await import('../../dist/escape-exterior.mjs')).createEscapeExterior(THREE,1.6);
const report={historicalRef:ref,historicalModules:sources.size,sourceHash,scopes:{},changedSources:[...sources].filter(([name,source])=>readFileSync(new URL(name,dist),'utf8').replaceAll('\r\n','\n')!==source.replaceAll('\r\n','\n')).map(([name])=>name).sort()};
assert.deepEqual(after.annexe.userData.wards['leighton-newton'].userData.ranges,saved.leighton.ranges,'Approved L dimensions remain exact');
for(const scope of ['jarman','leighton']){
 const old=collect(before.model,scope),updated=collect(after.model,scope),fingerprint=scope==='jarman'?jarmanProtected:leightonProtected;
 assert.deepEqual(old.geometry,fingerprint(THREE,before.model),'Independent historical collector matches production exclusions');
 assert.deepEqual(updated.geometry,fingerprint(THREE,after.model),'Independent current collector matches production exclusions');
 assert.deepEqual(old.geometry,scope==='jarman'?saved.jarman:saved.leighton.geometry,'Historical model reproduces the saved comparison exactly');
 const result={before:old.geometry,after:updated.geometry,unchangedPrimitives:0,uvOnlyPrimitives:0,changed:[]};
 for(const name of new Set([...old.groups.keys(),...updated.groups.keys()])){
  const a=old.groups.get(name)??[],b=updated.groups.get(name)??[],removed=difference(a,b),added=difference(b,a);
  result.unchangedPrimitives+=a.length-removed.length;
  if(removed.length||added.length){
   const structuralRemoved=difference(removed,added,withoutUV),structuralAdded=difference(added,removed,withoutUV),uvOnly=removed.length-structuralRemoved.length;
   result.uvOnlyPrimitives+=uvOnly;
   result.changed.push({name,before:a.length,after:b.length,removed:removed.length,added:added.length,uvOnly,structuralRemoved:summary(structuralRemoved),structuralAdded:summary(structuralAdded)});
  }
 }
 report.scopes[scope]=result;
 console.log(scope+' audit: '+result.unchangedPrimitives+' exact, '+result.uvOnlyPrimitives+' UV-only, '+result.changed.length+' changed groups.');
}
assert.equal(await modelSourceHash(),sourceHash,'Model sources remain stable throughout the audit');
writeFileSync(new URL('snapshot-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({historicalRef:ref,changedSources:report.changedSources,scopes:Object.fromEntries(Object.entries(report.scopes).map(([scope,r])=>[scope,{before:r.before,after:r.after,unchangedPrimitives:r.unchangedPrimitives,uvOnlyPrimitives:r.uvOnlyPrimitives,changed:r.changed.map(({name,removed,added,uvOnly,structuralRemoved,structuralAdded})=>({name,removed,added,uvOnly,structuralRemoved:structuralRemoved.length,structuralAdded:structuralAdded.length}))}]))},null,2));
