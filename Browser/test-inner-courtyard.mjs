import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {checkCourtyardLeanTo} from './test-support/courtyard-lean-to-probes.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,1.5);exterior.scene.updateMatrixWorld(true);
checkCourtyardLeanTo(THREE,exterior.model);
const ray=new THREE.Raycaster(),solids=[];
exterior.model.traverse(o=>{
 if(!o.isMesh||o.isInstancedMesh)return;
 const bounds=new THREE.Box3().setFromObject(o),size=bounds.getSize(new THREE.Vector3());
 if(o.name.endsWith('wing continuous eaves')||(o.geometry.type==='BoxGeometry'&&size.y>1&&size.x>.2&&size.z>.2&&bounds.min.z<7&&bounds.max.z>-25&&bounds.min.x<40&&bounds.max.x>-40))solids.push({o,bounds});
});
let windowSamples=0,roofSamples=0;
if(!process.argv.includes('--roofs-only'))for(const side of [-1,1]){
 const openings=(side<0?exterior.model.userData.westWingPhotoOpenings:exterior.model.userData.innerEastPhotoOpenings).filter(o=>o.face.startsWith('inner-east-'));
 assert(openings.length>25,'Survey all adjoining, projecting and stepped courtyard faces');
 for(const o of openings){
  const isReturn=o.face.endsWith('return'),n=new THREE.Vector3(isReturn?0:-side,0,isReturn?-1:0),t=new THREE.Vector3(isReturn?side:0,0,isReturn?0:1),centre=new THREE.Vector3(o.x,o.y,o.z);
  const samples=[];
  for(const u of [-.49,0,.49])for(const v of [-.49,-.3675,-.245,-.1225,0,.1225,.245,.3675,.49])samples.push([u*o.w,v*o.h]);
  // Include the full sill and head, not just the glazing's centre.
  for(const sign of [-1,1])samples.push([sign*(o.w/2+.16),-o.h/2-.09],[sign*(o.w/2+.11),o.h/2+.08]);
  for(const [u,v] of samples){
   const p=centre.clone().addScaledVector(t,u).addScaledVector(n,.1);p.y+=v;windowSamples++;
   const blocker=solids.find(({bounds})=>bounds.containsPoint(p));
   assert(!blocker,`Courtyard window intersects masonry: ${JSON.stringify({side,face:o.face,centre:centre.toArray(),point:p.toArray(),wall:blocker?.o.name})}`);
  }
 }
 const lower=openings.filter(o=>o.face==='inner-east-adjoining'&&o.z>-3.1&&o.y<9);
 assert.equal(lower.length,2,'One complete sash fits the exposed recess on each lower storey');
 for(const o of lower){
  assert(o.z-o.w/2-.16>-3.1&&o.z+o.w/2+.16<0,'Both sill ends have a brick reveal before the adjoining walls');
  for(const u of [-.48,0,.48])for(const v of [-.48,0,.48]){
   const p=new THREE.Vector3(o.x,o.y+v*o.h,o.z+u*o.w),n=new THREE.Vector3(-side,0,0);
   ray.set(p.clone().addScaledVector(n,7),n.clone().negate());ray.far=7.3;
   const hit=ray.intersectObject(exterior.model,true)[0];
   assert(hit?.object.isInstancedMesh&&hit.point.distanceTo(p)<.2,'The complete replacement sash is visible from the court');
  }
 }
}
if(!process.argv.includes('--windows-only'))for(const side of [-1,1]){
 const x=side*31;
 for(const edge of [-1,1])for(const z of [-29.8,-27,-24,-22,-20,-18.7,-9,-6,-4,-2,0,2,4]){
  const half=z<=-6?6.9:z>=2?6.4:6.9-(z+6)*.5/8;
  const roofX=x+edge*half;
  // Shallow rays used to pass above the narrow cornice into the open roof.
  ray.set(new THREE.Vector3(roofX+edge*.05,13.035,z),new THREE.Vector3(-edge,0,0));ray.far=.15;
  assert(ray.intersectObject(exterior.model,true).length,`Open wing eave at ${side}, ${edge}, ${z}`);roofSamples++;
  // Looking vertically up at the overhang must also hit a real underside.
  ray.set(new THREE.Vector3(roofX-edge*.08,12.5,z),new THREE.Vector3(0,1,0));ray.far=.4;
  assert(ray.intersectObject(exterior.model,true).length,`Transparent wing underside at ${side}, ${edge}, ${z}`);roofSamples++;
 }
 for(const dx of [-6.7,-4,-2,0,2,4,6.7]){
  ray.set(new THREE.Vector3(x+dx,13.035,-30.95),new THREE.Vector3(0,0,1));ray.far=.15;
  assert(ray.intersectObject(exterior.model,true).length,'Rear hip eave is closed across its full width');roofSamples++;
 }
 // The small corner-room hips also overhang their original cornices.
 for(const edge of [-1,1])for(const t of [-2.8,-1.4,0,1.4,2.8])for(const axis of ['x','z']){
  const p=axis==='x'?new THREE.Vector3(side*22.5+edge*3.32,7.1,3+t):new THREE.Vector3(side*22.5+t,7.1,3+edge*3.32);
  ray.set(p,new THREE.Vector3(0,1,0));ray.far=.4;
  assert(ray.intersectObject(exterior.model,true).length,`Transparent corner-room underside: ${side}, ${axis}, ${edge}, ${t}`);roofSamples++;
 }
}
console.log(`PASS: ${windowSamples} courtyard window/frame clearance samples and ${roofSamples} low-angle roof coverage samples across both wings.`);
