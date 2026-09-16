import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE_VIEWS} from './dist/annexe.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},strokeText(){},fillText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,16/9);e.scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),groups=e.annexe.userData.outerFronts;
assert.equal(groups.length,2);
assert.deepEqual(groups[0].userData.openings,groups[1].userData.openings);
for(const group of groups){
 const outward=new THREE.Vector3(0,0,1).transformDirection(group.matrixWorld);
 for(const o of group.userData.openings){
  const p=group.localToWorld(new THREE.Vector3(o.x,o.y+.22,o.z+.7));
  ray.set(p,outward.clone().negate());const hit=ray.intersectObject(e.annexe,true)[0];
  assert(hit?.object.parent===group&&hit.object.isInstancedMesh,'Exposed new glazing '+group.name+' '+JSON.stringify(o));
 }
}
const obstacles=exteriorObstacles(THREE,e.model);
for(const side of ['west','east']){const p=ANNEXE_VIEWS['annexe-outer-'+side].position;assert(!obstacles.some(o=>obstacleContains(o,p[0],p[2],.3)),'Clear approach '+side);}
console.log('PASS: reflected facade openings are visible and both photo viewpoints are outside masonry.');
