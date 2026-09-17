import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE_VIEWS} from './dist/annexe.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},strokeText(){},fillText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,16/9);e.scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),groups=e.annexe.userData.outerFronts,courts=e.annexe.userData.courtFronts;
assert.equal(groups.length,2);
assert.equal(courts.length,2);
assert.deepEqual(groups[0].userData.openings,groups[1].userData.openings);
for(const group of [...groups,...courts]){
 const outward=new THREE.Vector3(0,0,1).transformDirection(group.matrixWorld);
 for(const o of group.userData.openings){
  const p=group.localToWorld(new THREE.Vector3(o.x,o.y+.22,o.z+.7));
  ray.set(p,outward.clone().negate());const hit=ray.intersectObject(e.annexe,true)[0];
  assert(hit?.object.parent===group&&hit.object.isInstancedMesh,'Exposed new glazing '+group.name+' '+JSON.stringify(o));
 }
}
const obstacles=exteriorObstacles(THREE,e.model);
for(const [index,group] of courts.entries()){
 assert.equal(group.parent,e.annexe.userData.wards[index?'picton-carden':'tarvin-jarman']);
 const gables=group.children.filter(o=>o.name==='Court projecting gable brick walls');
 assert.equal(gables.length,2,'Each marked face has a pair of full-height projecting apex bays');
 assert.equal(group.children.filter(o=>o.name==='Court circular gable vent').length,2);
 for(const gable of gables){
  const front=gable.position.z+gable.geometry.parameters.depth/2;
  const inside=group.localToWorld(new THREE.Vector3(gable.position.x,1.8,front-.1));
  const outside=group.localToWorld(new THREE.Vector3(gable.position.x,1.8,front+.5));
  assert(obstacles.some(o=>obstacleContains(o,inside.x,inside.z,0)),'Copied bay blocks walking through its projecting wall');
  assert(!obstacles.some(o=>obstacleContains(o,outside.x,outside.z,.1)),'Lawn approach remains clear');
 }
 const host=e.annexe.userData.ranges.find(b=>b.name===(index?'East':'West')+' court front range');
 assert(!e.annexe.userData.annexeOpenings.some(o=>o.rotation===0&&Math.abs(o.z-host.z-host.d/2-.035)<.01&&Math.abs(o.x-host.x)<host.w/2),'Old front and return windows cannot overlap the copied elevation');
 // Cross-gable geometry is shared with the red-marked source design.
 const originals=groups[index].children.filter(o=>/Outer (decorated brick gable|cross-gable slate roof|circular gable vent|circular vent surround)/.test(o.name));
 const copies=group.children.filter(o=>/Court (decorated brick gable|cross-gable slate roof|circular gable vent|circular vent surround)/.test(o.name));
 assert.equal(copies.length,originals.length);
 copies.forEach((copy,i)=>{
  assert.deepEqual(copy.geometry.attributes.position.array,originals[i].geometry.attributes.position.array);
  assert.deepEqual(copy.position.toArray(),originals[i].position.toArray());
  assert.equal(copy.material.color.getHex(),originals[i].material.color.getHex());
 });
}
for(const side of ['west','east']){const p=ANNEXE_VIEWS['annexe-outer-'+side].position;assert(!obstacles.some(o=>obstacleContains(o,p[0],p[2],.3)),'Clear approach '+side);}
console.log('PASS: original and copied paired apex fronts, exposed glazing without duplicate windows, projecting-bay collisions, clear approaches and ward ownership.');
