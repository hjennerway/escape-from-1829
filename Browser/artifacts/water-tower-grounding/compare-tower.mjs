import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from '../../dist/vendor/three.module.js';
import {createWaterTower} from '../../dist/water-tower.mjs';
const prior=(await readFile(new URL('./before-water-tower.mjs.txt',import.meta.url),'utf8')).replace("'./tower-roof-profiles.mjs'",JSON.stringify(new URL('../../dist/tower-roof-profiles.mjs',import.meta.url).href));
const {createWaterTower:createBefore}=await import('data:text/javascript;base64,'+Buffer.from(prior).toString('base64'));
function build(create){
 const textures=createHash('sha256');
 globalThis.document={createElement:()=>{const context={fillRect(...args){textures.update(JSON.stringify([this.fillStyle,...args]));}};return {getContext:()=>context};}};
 const material=new THREE.MeshStandardMaterial();
 const worldUV=(g,scale)=>{const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/scale,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/scale);return g;};
 const tower=create(THREE,{brick:material,roof:material,dark:material,worldUV});tower.updateMatrixWorld(true);
 const geometry=[];let bases=0;
 tower.traverse(o=>{
  if(!o.isMesh)return;const bounds=new THREE.Box3().setFromObject(o);
  if(o.parent===tower&&Math.abs(bounds.min.y)<1e-4&&Math.abs(bounds.max.y-.5)<1e-4){bases++;return;}
  const ancestors=[];for(let p=o.parent;p;p=p.parent)ancestors.push(p.name);
  geometry.push(JSON.stringify({name:o.name,ancestors,matrix:o.matrixWorld.elements,shadow:[o.castShadow,o.receiveShadow],material:{color:o.material.color.toArray(),roughness:o.material.roughness,metalness:o.material.metalness},index:o.geometry.index?Array.from(o.geometry.index.array):null,attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([key,a])=>[key,Array.from(a.array)]))}));
 });
 assert.equal(bases,1);return {geometry:geometry.sort(),textures:textures.digest('hex'),position:tower.position.toArray()};
}
const before=build(createBefore),after=build(createWaterTower);assert.deepEqual(after,before,'All tower geometry, transforms, materials and texture painting outside the footing stay exact');
const result={unchangedMeshes:after.geometry.length,texturePaintingUnchanged:true,position:after.position};
await writeFile(new URL('./unchanged-tower.json',import.meta.url),JSON.stringify(result,null,2));console.log('PASS: '+JSON.stringify(result));
