import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);e.scene.updateMatrixWorld(true);
const materials=new Set(),roofs=[],parts=[];
e.model.traverse(o=>{if(o.isMesh&&/slate roof/i.test(o.name))materials.add(o.material);});
e.model.traverse(o=>{
 if(!o.isMesh||o.isInstancedMesh)return;
 if((/roof/i.test(o.name)||materials.has(o.material))&&!/chimney|finial|vane|ventilator base/i.test(o.name))roofs.push(o);
 if(/chimney (stack|shaft)$|^(West|East) front chimney$|Rear court tall chimney|brick chimney$|Rear office chimney|Bell tower base|roof ventilator base|lead ventilator base|Hall dormer cheek|Rear hall dormer cheek|Water tower roof finial/i.test(o.name)&&!o.parent.name.includes('Freestanding'))parts.push(o);
});
const ray=new THREE.Raycaster(),failures=[];let samples=0;
for(const o of parts){
 o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
 for(let edge=0;edge<4;edge++)for(let i=0;i<=8;i++){
  const t=i/8,coords=[[b.min.x+(b.max.x-b.min.x)*t,b.min.z],[b.max.x,b.min.z+(b.max.z-b.min.z)*t],[b.max.x-(b.max.x-b.min.x)*t,b.max.z],[b.min.x,b.max.z-(b.max.z-b.min.z)*t]][edge];
  const p=new THREE.Vector3(coords[0],b.min.y,coords[1]).applyMatrix4(o.matrixWorld);
  ray.set(new THREE.Vector3(p.x,50,p.z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObjects(roofs,false).find(h=>h.object!==o);
  samples++;if(!hit||p.y>hit.point.y+.012)failures.push({name:o.name,point:p.toArray(),gap:hit?p.y-hit.point.y:null});
 }
}
assert(parts.length>75,'Audit must include all roof-mounted chimney families and ornaments');
assert.deepEqual(failures,[],'Every sampled bottom edge must penetrate the supporting roof');
console.log(`PASS: ${parts.length} roof attachments, ${samples} perimeter contacts; no floating edges.`);
