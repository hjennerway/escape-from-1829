// Evidence-gated reconciliation of the two whole-estate photo comparisons.
// Historical imports never overwrite the working tree or change exclusions.
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
const ref='16abbbb',tag='?jarmanComparison='+ref,sources=new Map();
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

// Independently reproduce the original helper rows, then group them by full
// named ancestry. This distinguishes otherwise unnamed host meshes and keeps
// every changed primitive available for a region/feature audit.
function collect(model,scope){
 model.updateMatrixWorld(true);const rows=[],groups=new Map(),instance=new THREE.Matrix4();
 model.traverse(o=>{
  if(!o.isMesh)return;
  const ancestors=[];for(let p=o;p;p=p.parent)ancestors.push(p);
  if(ancestors.some(p=>{
   const tree=p.userData.oakTree??p.userData.adminPineTree;
   return tree&&[...KML_12_ADDITIONS,...KML_13_ADDITIONS].some(point=>point.name===tree.name&&point.coordinates[0]===tree.longitude&&point.coordinates[1]===tree.latitude);
  }))return;
  if(scope==='jarman'&&ancestors.some(p=>p.name==='Oakmere rear court additions'||p.name==='West court front elevation'||p.userData.lampPost||p.userData.willowTree||(p.userData.oakTree?.name==='Oak21'&&p.userData.oakTree.longitude===-2.903725817733399)))return;
  if(scope==='leighton'&&ancestors.some(p=>p.userData.wardId==='leighton-newton'))return;
  const h=createHash('sha256');
  for(const [key,a] of Object.entries(o.geometry.attributes).sort()){h.update(key);h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
  if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=h.digest('hex'),materials=[o.material].flat().map(m=>scope==='jarman'?[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]:[m.type,m.color?.getHex(),m.roughness,m.metalness]);
  const key=ancestors.map(p=>p.name).filter(Boolean).reverse().join(' / ')||'(unnamed estate geometry)';
  if(!groups.has(key))groups.set(key,[]);
  const record=m=>{const row=JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]);rows.push(row);groups.get(key).push(row);};
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(o.matrixWorld,instance));}else record(o.matrixWorld);
 });
 const digest=createHash('sha256').update(rows.sort().join('\n')).digest('hex');
 return {geometry:scope==='jarman'?{primitives:rows.length,sha256:digest}:{count:rows.length,sha256:digest},groups};
}
function difference(a,b){const counts=new Map();for(const row of b)counts.set(row,(counts.get(row)??0)+1);return a.filter(row=>{const count=counts.get(row)??0;if(count){counts.set(row,count-1);return false;}return true;});}
const jURL=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lURL=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const saved={jarman:JSON.parse(readFileSync(jURL)),leighton:JSON.parse(readFileSync(lURL))};
const before=(await import(new URL('escape-exterior.mjs'+tag,dist))).createEscapeExterior(THREE,1.6);
const after=(await import('../../dist/escape-exterior.mjs')).createEscapeExterior(THREE,1.6);
const report={historicalRef:ref,historicalModules:sources.size,sourceHash,scopes:{},changedSources:[...sources].filter(([name,source])=>readFileSync(new URL(name,dist),'utf8').replaceAll('\r\n','\n')!==source.replaceAll('\r\n','\n')).map(([name])=>name).sort()};
assert.deepEqual(after.annexe.userData.wards['leighton-newton'].userData.ranges,saved.leighton.ranges,'Approved L footprint must stay exact');
for(const scope of ['jarman','leighton']){
 const old=collect(before.model,scope),updated=collect(after.model,scope),fingerprint=scope==='jarman'?jarmanProtected:leightonProtected;
 assert.deepEqual(old.geometry,fingerprint(THREE,before.model),'Independent collector must preserve the historical production exclusions');
 assert.deepEqual(updated.geometry,fingerprint(THREE,after.model),'Independent collector must preserve the current production exclusions');
 assert.deepEqual(old.geometry,scope==='jarman'?saved.jarman:saved.leighton.geometry,'Historical sources must reproduce the saved comparison exactly');
 const result={before:old.geometry,after:updated.geometry,unchangedPrimitives:0,changed:[]};
 for(const name of new Set([...old.groups.keys(),...updated.groups.keys()])){
  const a=old.groups.get(name)??[],b=updated.groups.get(name)??[],removed=difference(a,b),added=difference(b,a);
  result.unchangedPrimitives+=a.length-removed.length;
  if(removed.length||added.length){
   const summary=rows=>rows.map(JSON.parse).map(row=>({mesh:row[0],position:row[3].slice(12,15)}));
   result.changed.push({name,before:a.length,after:b.length,removed:removed.length,added:added.length,removedPositions:summary(removed),addedPositions:summary(added)});
  }
 }
 report.scopes[scope]=result;
}
assert.equal(await modelSourceHash(),sourceHash,'Exterior source changed during the comparison audit');
writeFileSync(new URL('audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({historicalRef:ref,changedSources:report.changedSources,scopes:Object.fromEntries(Object.entries(report.scopes).map(([scope,r])=>[scope,{before:r.before,after:r.after,unchangedPrimitives:r.unchangedPrimitives,changed:r.changed.map(({name,before,after,removed,added})=>({name,before,after,removed,added}))}]))},null,2));
