import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {CHURTON_VIEWS,churtonPoint} from './dist/churton-ward.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),ward=exterior.churtonWard;
exterior.scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),obs=exteriorObstacles(THREE,exterior.model);
// All six camera starts must be outside masonry, planting and mast foundations.
for(let n=1;n<=6;n++){
 const view=CHURTON_VIEWS['churton-'+n];assert(!obs.some(b=>obstacleContains(b,view.position[0],view.position[2])),`Photo ${n} starts in an obstacle`);
 const walker=createWalker(exterior.camera,obs);walker.setView(view);const p=exterior.camera.position.clone();walker.keys.add('KeyW');walker.update(.1);assert(exterior.camera.position.distanceTo(p)>.4,`Photo ${n} approach must permit movement`);
}
// Ward walls stop a walker, whilst the two rear recesses remain open to the sky.
for(const [x,z] of [[0,16],[10,18]]){
 const p=churtonPoint(x,40,z);ray.set(new THREE.Vector3(...p),new THREE.Vector3(0,-1,0));assert(!ray.intersectObject(ward,true).some(h=>h.point.y>1),'Rear recess must have no spanning walls or roofs');
}
const p=churtonPoint(-10,1.8,29),target=churtonPoint(-10,1.8,10),walker=createWalker(exterior.camera,obs);walker.setView({position:p,target});walker.keys.add('KeyW');for(let n=0;n<30;n++)walker.update(.1);const local=ward.worldToLocal(exterior.camera.position.clone());assert(local.z>19&&local.z<20,'Broad gable must stop the walker at its wall');
// Exposed window schedules: cast from just outside each face so overlapping
// wing geometry cannot silently conceal a photographed opening.
const concealed=[];
for(const o of ward.userData.openings){const world=ward.localToWorld(new THREE.Vector3(o.x,o.y,o.z));const normal=new THREE.Vector3(Math.sin(o.rotation),0,Math.cos(o.rotation)).transformDirection(ward.matrixWorld);ray.set(world.clone().addScaledVector(normal,.7),normal.clone().negate());const hit=ray.intersectObject(ward,true)[0];if(!hit?.object.isInstancedMesh)concealed.push(o.face+' '+o.x+','+o.z);}
assert.deepEqual(concealed,[],'Photographed openings must be visible ahead of the masonry');
// Roof normals must face the sky over every principal range and the lean-to.
for(const [x,z] of [[-10,10],[16.5,3],[3,-6],[5,6],[-18.9,10.9]]){
 ray.set(new THREE.Vector3(...churtonPoint(x+.3,40,z)),new THREE.Vector3(0,-1,0));const roof=ray.intersectObject(ward,true).find(h=>h.object.name.endsWith('slate roof'));assert(roof&&roof.face.normal.clone().transformDirection(roof.object.matrixWorld).y>0,'Each range must have an upward-facing slate roof at '+x+','+z);
}
// The oblique wing's formerly exposed rear gable must have continuous slate
// coverage all the way into the taller connecting roof, across both slopes.
for(const u of [-3,-2,0,2,3])for(let v=-12.5;v<=-5.5;v+=.25){
 const x=5+Math.cos(.52)*u+Math.sin(.52)*v,z=6.3-Math.sin(.52)*u+Math.cos(.52)*v;
 ray.set(new THREE.Vector3(...churtonPoint(x,40,z)),new THREE.Vector3(0,-1,0));
 const cover=ray.intersectObject(ward,true).find(h=>h.object.name.endsWith('slate roof'));
 assert(cover&&cover.point.y>5,'Roof junction must have continuous slate coverage at '+u+','+v);
}
const height=new THREE.Box3().setFromObject(ward).max.y;assert(height<12&&height>9,'Ward remains single storey beneath its chimneys');
console.log('Churton Ward: six walk starts, wall collisions, rear recesses, exposed openings, slate roofs and single-storey height passed.');
