import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const dist=new URL('../../dist/',import.meta.url),tag='?withoutPipeClearance';
const sourceHash=await modelSourceHash();
registerHooks({
 resolve(specifier,context,next){const r=next(specifier,context);if(context.parentURL?.endsWith(tag)&&r.url.startsWith(dist.href)&&r.url.endsWith('.mjs'))r.url+=tag;return r;},
 load(url,context,next){if(!url.endsWith(tag))return next(url,context);const r=next(url.slice(0,-tag.length),context);return url.startsWith(new URL('escape-exterior.mjs',dist).href)?{...r,source:String(r.source).replace('avoidWindowDownpipes(THREE,model);','/* diagnostic reconstruction */')}:r;}
});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const before=(await import(new URL('escape-exterior.mjs'+tag,dist))).createEscapeExterior(THREE,1.5);
const after=(await import('../../dist/escape-exterior.mjs')).createEscapeExterior(THREE,1.5);
function collect(root){
 root.updateMatrixWorld(true);const records=new Map(),instance=new THREE.Matrix4(),cache=new WeakMap();
 root.traverse(o=>{
  if(!o.isMesh||o.userData.roofWallClosure)return;
  let geometry=cache.get(o.geometry);
  if(!geometry){const h=createHash('sha256');for(const [k,a] of Object.entries(o.geometry.attributes).sort())h.update(k).update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer));geometry=h.digest('hex');cache.set(o.geometry,geometry);}
  const materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const record=(m,i)=>{
   const key=JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]);
   let assembly=false;for(let p=o;p;p=p.parent)assembly ||= !!p.userData.downpipeAssembly;
   const allowed=assembly||o.userData.downpipeInstances?.includes(i)||Object.values(o.userData.downpipeAttachments??{}).some(indices=>indices.includes(i))||/\bdownpipe\b/i.test(o.name);
   const values=records.get(key)??[];values.push({name:o.name,index:i,allowed,position:m.elements.slice(12,15)});records.set(key,values);
  };
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(o.matrixWorld,instance),i);}else record(o.matrixWorld,null);
 });return records;
}
const old=collect(before.model),updated=collect(after.model),removed=[],added=[];
for(const [key,rows] of old)removed.push(...rows.slice(updated.get(key)?.length??0));
for(const [key,rows] of updated)added.push(...rows.slice(old.get(key)?.length??0));
assert.equal(removed.length,added.length);
assert(removed.every(r=>r.allowed)&&added.every(r=>r.allowed),'Only pipe and fitting primitive transforms may change');
assert.equal(await modelSourceHash(),sourceHash);
writeFileSync(new URL('pipe-primitive-audit.json',import.meta.url),JSON.stringify({sourceHash,removed,added},null,2)+'\n');
console.log('PASS:',removed.length,'pipe/fitting records move; all architectural primitive records stay exact.');
