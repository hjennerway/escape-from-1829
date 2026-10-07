import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {writeFile} from 'node:fs/promises';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);e.model.updateMatrixWorld(true);
const roofs=[],walls=[];
e.model.traverse(o=>{
  if(!o.isMesh||o.userData.roofWallClosure)return;
  const b=new THREE.Box3().setFromObject(o);
  if(b.max.x<55||b.min.x>101||b.max.z< -48||b.min.z>26)return;
  if(o.material?.userData.roofTilePixels){roofs.push(o);return;}
  if(o.material?.color&&[0xb3a5a0,0xe1e3dc].includes(o.material.color.getHex())&&!/chimney|ventilator|flue|tower|arch|finial/i.test(o.name))walls.push(o);
});
const ray=new THREE.Raycaster(),points=[];
for(const [x,z] of [[60.7,-32.87],[60.7,-32.72],[82.3,-32.8],[83.1,-32.8],[83.8,-32.8],[83.1,-31.7],[84.2,-31.7]]){
 ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));
 const hits=ray.intersectObject(e.model,true).filter(h=>h.point.y>7).slice(0,10).map(h=>({name:h.object.name,instance:h.instanceId,y:h.point.y,material:h.object.material.color.getHex().toString(16),roof:!!h.object.material.userData.roofTilePixels}));points.push({x,z,hits});
}
await writeFile(new URL('survey-points.json',import.meta.url),JSON.stringify(points,null,2));
const matrix=new THREE.Matrix4(),instance=new THREE.Matrix4(),violations=[],seen=new Set();let checked=0;
for(const o of walls){
 const p=o.geometry.attributes.position,index=o.geometry.index;
 for(let item=0;item<(o.isInstancedMesh?o.count:1);item++){
  if(o.isInstancedMesh){o.getMatrixAt(item,instance);matrix.multiplyMatrices(o.matrixWorld,instance);}else matrix.copy(o.matrixWorld);
  for(let i=0;i<(index?.count??p.count);i+=3){
   const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(matrix));
   const n=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).multiplyScalar(Math.sign(matrix.determinant())).normalize();
   if(n.y<.1)continue;
   for(const point of [v[0],v[1],v[2],v[0].clone().add(v[1]).add(v[2]).multiplyScalar(1/3)]){
    if(point.x<55||point.x>101||point.z< -48||point.z>26||point.y<7)continue;
    const key=point.toArray().map(v=>v.toFixed(3)).join(',');if(seen.has(key))continue;seen.add(key);
    ray.set(new THREE.Vector3(point.x,30,point.z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObjects(roofs,false)[0];if(!hit)continue;checked++;
    if(point.y>hit.point.y+.015)violations.push({name:o.name,instance:o.isInstancedMesh?item:undefined,point:point.toArray(),roof:hit.object.name,roofPosition:hit.object.position.toArray(),roofY:hit.point.y,above:point.y-hit.point.y});
   }
  }
 }
}
await writeFile(new URL('survey-overlaps.json',import.meta.url),JSON.stringify({checked,violations},null,2));
// The photographed stepped parapet and named chimney families are intentional.
// Unnamed chimney cap instances are above the main eaves, rather than wall trim.
const candidates=violations.filter(v=>v.above<.6&&v.point[1]<12&&!/parapet/i.test(v.name));
console.log(JSON.stringify({checked,candidates},null,2));
