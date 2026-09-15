import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {REDESMERE_GARDEN_VIEW} from './dist/redesmere-garden-photo-detail.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,4/3);
model.updateMatrixWorld(true);
const openings=model.userData.redesmereGardenOpenings,ray=new THREE.Raycaster();
assert.equal(openings.filter(o=>o.face==='garden-pavilion-upper-pair').length,2);
assert.equal(openings.filter(o=>o.face==='garden-pavilion-middle-glazing').length,3);
assert.equal(openings.filter(o=>o.face==='garden-pavilion-upper-right').length,2);
for(const o of openings){
  ray.set(new THREE.Vector3(73,o.y,o.z),new THREE.Vector3(-1,0,0));
  const hit=ray.intersectObject(model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.x>o.x,'new side glazing must be exposed ahead of the finished masonry and connecting head');
}
for(const y of [6.3,11.4]){
  ray.set(new THREE.Vector3(73,y,23.2),new THREE.Vector3(-1,0,0));
  assert.equal(ray.intersectObject(model,true)[0].object.name,'Garden pavilion east wall','front section of east return must remain blank brick');
}
const obstacles=exteriorObstacles(THREE,model);
for(const z of [6,8.5,10,13,18,21,24,27,30]){
  assert(!obstacles.some(o=>obstacleContains(o,76,z)),'the passage beneath the shallow head must remain walkable');
}
for(const z of [13,18.5,21]){
  ray.set(new THREE.Vector3(76,30,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(model,true)[0].point.y<.5,'the passage must stay open to the sky away from its shallow head');
}
ray.set(new THREE.Vector3(76,30,8.5),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(model,true)[0].object.name,'1829 Redesmere lintel coping');
for(const [x,z] of [[80.4,26.8],[87,26],[73,33.5],[69,37]])assert(obstacles.some(o=>obstacleContains(o,x,z)),'solid timber beds must block walking through their centres');
assert.equal(model.children.filter(o=>o.name==='Redesmere garden bench').length,2);
assert.equal(model.children.filter(o=>o.name==='Redesmere garden timber bed').length,4);
assert(model.children.filter(o=>o.name==='Redesmere garden ivy').reduce((sum,o)=>sum+o.count,0)>5000,'ivy should use fine instanced leaves');
assert(!obstacles.some(o=>obstacleContains(o,REDESMERE_GARDEN_VIEW.position[0],REDESMERE_GARDEN_VIEW.position[2])),'camera must start on clear ground');
ray.set(new THREE.Vector3(65.5,30,14),new THREE.Vector3(0,-1,0));
const roof=ray.intersectObject(model,true)[0];
assert.equal(roof.object.name,'Garden pavilion slate roof');
assert(roof.face.normal.y>0,'the rear return roof must face upwards');
// The red-marked tower is gone: one wider wall, one roof, no outward step.
assert.equal(model.getObjectByName('Garden pavilion rear return'),undefined);
assert.equal(model.getObjectByName('Garden pavilion shallow centre'),undefined);
const pavilion=new THREE.Box3().setFromObject(model.getObjectByName('East garden pavilion'));
assert(Math.abs(pavilion.min.z-5)<1e-5&&Math.abs(pavilion.max.z-25)<1e-5);
const wallPlanes=[];
for(const z of [5.5,7,10,13,16,19,22,24.5]){
  ray.set(new THREE.Vector3(74,9.65,z),new THREE.Vector3(-1,0,0));
  const hit=ray.intersectObject(model,true)[0];
  assert.equal(hit.object.name,'Garden pavilion east wall');
  wallPlanes.push(hit.point.x);
}
assert(Math.max(...wallPlanes)-Math.min(...wallPlanes)<1e-5,'the whole east side must share one wall plane');
for(const [x,z] of [[71.5,5],[71.5,8],[69,1]]){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(model,true)[0].point.y<10,'no tall wall or roof may remain in the red-marked tower position');
}
for(const o of model.userData.courtyardPhotoOpenings.filter(o=>o.face==='courtyard-stair-block')){
  ray.set(new THREE.Vector3(o.x,o.y,4.5),new THREE.Vector3(0,0,1));
  const hit=ray.intersectObject(model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.z<5,'courtyard glazing must be attached to the new return face');
}
console.log('PASS: one widened coplanar pavilion face, no separate rear tower, exposed glazing, attached courtyard details and clear passage.');

