import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16};},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,16/9),layouts=createAerialLayouts(THREE,exterior);
const timeline=prepareEstateTimeline(THREE,exterior,layouts);
const wall=exterior.model.getObjectByName('1829 east end wall');
assert(wall,'The exposed opening-period end has a closing wall');
timeline.setPeriod(1829);exterior.model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
// Rays from both exposed sides must meet outward-facing masonry at each
// storey and across the gable, rather than looking through the clipped shell.
for(const y of [1,6,11]){
 for(const x of [34,35.5,37.8]){
  ray.set(new THREE.Vector3(x,y,20),new THREE.Vector3(0,0,-1));
  assert(ray.intersectObject(wall,true).some(hit=>Math.abs(hit.point.z-17.3)<1e-5),'Closed front return');
 }
 for(const z of [7.1,10,12,15,17.2]){
  ray.set(new THREE.Vector3(40,y,z),new THREE.Vector3(-1,0,0));
  assert(ray.intersectObject(wall,true).some(hit=>Math.abs(hit.point.x-38)<1e-5),'Closed east end');
 }
}
for(const [z,y] of [[8,13.5],[10,14.6],[12,15.5],[14,14.6],[16,13.5]]){
 ray.set(new THREE.Vector3(40,y,z),new THREE.Vector3(-1,0,0));
 assert(ray.intersectObject(wall,true).length,'Brick infill reaches the existing roof slope');
}
const obstacles=exteriorObstacles(THREE,wall);
for(const [x,z] of [[35,17.25],[37.95,10]])assert(obstacles.some(o=>obstacleContains(o,x,z)),'The closing wall blocks walking');
for(const year of [1849,1870,1916,2021,1829]){
 timeline.setPeriod(year);
 assert.equal(wall.visible,year===1829);
 assert.equal(exteriorObstacles(THREE,wall).length>0,year===1829,'Collision follows the closing wall visibility');
}
console.log('PASS: 1829 east end is closed at every storey and up to the roof; wall and collision disappear with the 1849 wing.');
