import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {exteriorObstacles} from '../dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const moduleURL=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const original=moduleURL(await readFile(new URL('./redesmere-eaves/before-redesmere-passage.mjs.txt',import.meta.url),'utf8'));
const dist=new URL('../dist/',import.meta.url);
const source=(await readFile(new URL('escape-exterior.mjs',dist),'utf8')).replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${path==='./redesmere-passage.mjs'?original:new URL(path,dist).href}'`);
const {createEscapeExterior:beforeCreate}=await import(moduleURL(source));
function capture(create){
 const exterior=create(THREE,16/9);exterior.model.updateMatrixWorld(true);
 const hash=createHash('sha256'),changed=[];let primitives=0;
 const bytes=a=>hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));
 exterior.model.traverse(object=>{
  if(!object.isMesh)return;
  hash.update(JSON.stringify([object.name,object.matrixWorld.elements,object.castShadow,object.receiveShadow,object.visible,[object.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side])]));
  for(const [key,attribute] of Object.entries(object.geometry.attributes).sort()){hash.update(key);bytes(attribute.array);}
  if(object.geometry.index)bytes(object.geometry.index.array);
  primitives+=object.isInstancedMesh?object.count:1;
  if(object.isInstancedMesh){
   const matrices=object.instanceMatrix.array.slice();
   for(let i=0;i<object.count;i++){
    const start=i*16;
    if(object.material.color?.getHex()===0xa6a18e&&Math.abs(matrices[start+12]-89.675)<.001&&Math.abs(matrices[start+14]-16)<.001){
     changed.push(Array.from(matrices.subarray(start,start+16)));matrices.fill(0,start,start+16);
    }
   }
   bytes(matrices);
  }
 });
 assert.equal(changed.length,1,'Only one low-range eaves band is exempted');
 return {primitives,outsideBand:hash.digest('hex'),bandMatrix:changed[0],obstacles:createHash('sha256').update(JSON.stringify(exteriorObstacles(THREE,exterior.model))).digest('hex')};
}
const before=capture(beforeCreate),after=capture(createEscapeExterior);
assert.equal(before.primitives,after.primitives);assert.equal(before.outsideBand,after.outsideBand,'All geometry and transforms outside the eaves band stay exact');assert.equal(before.obstacles,after.obstacles,'Walking obstacles are unchanged');
const report={before,after,changedPrimitives:1,unchangedPrimitives:after.primitives-1};
await writeFile(new URL('./redesmere-eaves/scope.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(`PASS: only one eaves-band instance changed; ${report.unchangedPrimitives} other primitives and all walking obstacles are identical.`);
