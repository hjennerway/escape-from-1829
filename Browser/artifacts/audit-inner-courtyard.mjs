import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);e.scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),fail=[];
for(const side of [-1,1]){
 const openings=side<0?e.model.userData.westWingPhotoOpenings:e.model.userData.innerEastPhotoOpenings;
 for(const o of openings.filter(o=>o.face.startsWith('inner-east-'))){
  const isReturn=o.face.endsWith('return'),n=new THREE.Vector3(isReturn?0:-side,0,isReturn?-1:0),t=new THREE.Vector3(isReturn?side:0,0,isReturn?0:1),p=new THREE.Vector3(o.x,o.y,o.z);
  for(const u of [-.49,0,.49])for(const v of [-.49,0,.49]){
   const sample=p.clone().addScaledVector(t,u*o.w).add(new THREE.Vector3(0,v*o.h,0));
   ray.set(sample.clone().addScaledVector(n,7),n.clone().negate());ray.far=7.25;
   const hit=ray.intersectObject(e.model,true)[0];
   if(!hit||hit.point.distanceTo(sample)>.3)fail.push({side,face:o.face,x:o.x,y:o.y,z:o.z,u,v,hit:hit?.object.name,point:hit?.point.toArray()});
  }
 }
}
console.log(JSON.stringify(fail,null,2));
