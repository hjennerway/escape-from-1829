import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {EAST_FORWARD_END_PHOTO_VIEW} from './dist/east-forward-end-photo-detail.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,4/3);
model.updateMatrixWorld(true);
const openings=model.userData.eastForwardEndPhotoOpenings,ray=new THREE.Raycaster();
assert.equal(openings.length,8);
assert.deepEqual(openings.filter(o=>o.y<4).map(o=>o.x),openings.filter(o=>o.y>4).map(o=>o.x));
for(const o of openings){
  ray.set(new THREE.Vector3(o.x,o.y,47),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.z>43.06,'all eight sash windows must be exposed in the completed scene');
}
for(const x of [31.95,34.95,37.95,40.4]){
  ray.set(new THREE.Vector3(x,1.5,47),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(model,true)[0];
  assert(hit.object.material.map&&Math.abs(hit.point.z-43)<.01,'brickwork must continue across the ground floor');
}
for(const o of model.userData.eastPhotoOpenings.filter(o=>o.face==='forward-wing-east')){
  ray.set(new THREE.Vector3(41.7,o.y,o.z),new THREE.Vector3(-1,0,0));
  const hit=ray.intersectObject(model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.x>41.05&&hit.point.x<41.3,'side sashes must move onto the narrowed wall');
}
const obstacles=exteriorObstacles(THREE,model);
for(const z of [25,30,35,40,45]){
  assert(!obstacles.some(o=>obstacleContains(o,46,z)),'the forecourt route alongside the moved fire escape must stay open');
}
ray.set(new THREE.Vector3(46,30,40),new THREE.Vector3(0,-1,0));
assert(ray.intersectObject(model,true)[0].point.y<.5,'the removed outer roof and wall must leave open ground');
for(const o of model.children.filter(o=>o.name==='East front chimney')){
  const b=new THREE.Box3().setFromObject(o);
  assert(b.max.x-b.min.x<.8&&b.max.y<(o.position.z>30?13.3:15.3),'east stacks must have the photographed slender proportions');
}
assert(EAST_FORWARD_END_PHOTO_VIEW.target[2]<EAST_FORWARD_END_PHOTO_VIEW.position[2],'photo view must face north');
assert(!obstacles.some(o=>obstacleContains(o,EAST_FORWARD_END_PHOTO_VIEW.position[0],EAST_FORWARD_END_PHOTO_VIEW.position[2])));
console.log('PASS: img1 end/side glazing exposed, continuous brick base, slender stacks, open forecourt route and north-facing camera.');
