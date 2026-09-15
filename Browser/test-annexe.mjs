import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE,ANNEXE_VIEWS,ANNEXE_MAP_SCALE,annexeMapPoint,annexePoint} from './dist/annexe.mjs';
import {createWalker,exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),annexe=exterior.annexe;
exterior.scene.updateMatrixWorld(true);
assert.equal(annexe.name,'The annexe');
assert.equal(exterior.newHospital,annexe,'legacy integration resolves to the same model');
for(const [pixel,world] of [[[285,308],[0,13]],[[215,351],[-6,-120]]]){
 const p=annexeMapPoint(...pixel);assert(Math.hypot(p[0]-world[0],p[1]-world[1])<1e-8);
}
const redesmere=annexeMapPoint(242,265);
assert(Math.hypot(redesmere[0]-94.5,redesmere[1]+14)<2,'independent Redesmere control point remains aligned');
// A similarity transform preserves distances and angles in the OS outline.
const p=annexeMapPoint(138,83),u=annexeMapPoint(148,83),v=annexeMapPoint(138,93);
assert(Math.abs(Math.hypot(u[0]-p[0],u[1]-p[1])-Math.hypot(v[0]-p[0],v[1]-p[1]))<1e-8);
assert(Math.abs((u[0]-p[0])*(v[0]-p[0])+(u[1]-p[1])*(v[1]-p[1]))<1e-8);
assert.equal(annexe.getObjectByName('Central hall brick walls').material,exterior.model.getObjectByName('Redesmere outer brick elevation').material);
const obstacles=exteriorObstacles(THREE,exterior.model),ray=new THREE.Raycaster();
for(const [x,z] of [[-39,17],[39,17],[-38,-5],[38,-5]]){
 const p=annexePoint(x*ANNEXE_MAP_SCALE,40,z*ANNEXE_MAP_SCALE);
 assert(!obstacles.some(b=>obstacleContains(b,p[0],p[2],0)),'OS courtyard centre remains walkable');
 ray.set(new THREE.Vector3(...p),new THREE.Vector3(0,-1,0));
 assert.equal(ray.intersectObject(annexe,true).filter(h=>h.object.name.endsWith('slate roof')).length,0,'court remains open to the sky');
}
for(const b of annexe.userData.ranges){
 const p=annexePoint(b.x,50,b.z);ray.set(new THREE.Vector3(...p),new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(annexe,true).find(h=>h.object.name.endsWith('slate roof'));
 assert(hit&&hit.face.normal.y>0,b.name+' has an upward-facing roof');
}
const arches=annexe.userData.annexeOpenings.filter(o=>o.arched);
assert.equal(arches.filter(o=>o.name==='Hall dormer').length,3);
assert.equal(arches.filter(o=>o.name.includes('pavilion')).length,2);
for(const name of ['West square tower brick walls','East square tower brick walls','Bell tower dome','Visible hanging bell','Blue gutters and downpipes','Entrance terracotta arch'])assert(annexe.getObjectByName(name),name);
const walk=createWalker(exterior.camera,obstacles);walk.setView(ANNEXE_VIEWS['annexe-ground']);
const before=exterior.camera.position.clone();walk.keys.add('KeyW');walk.update(.1);
assert(exterior.camera.position.distanceTo(before)>.45,'front approach is accessible');
const b=annexe.userData.ranges.find(b=>b.name==='West court front range');
walk.setView({position:annexePoint(b.x,1.8,b.z+b.d/2+5),target:annexePoint(b.x,1.8,b.z)});
walk.keys.add('KeyW');for(let i=0;i<30;i++)walk.update(.1);
const local=annexe.worldToLocal(exterior.camera.position.clone());
assert(local.z>b.z+b.d/2&&local.z<b.z+b.d/2+1,'walking stops at the rotated masonry face');
for(const o of arches){
 const outward=new THREE.Vector3(Math.sin(o.rotation),0,Math.cos(o.rotation));
 const start=new THREE.Vector3(o.x,o.y,o.z).addScaledVector(outward,.7);
 annexe.localToWorld(start);outward.transformDirection(annexe.matrixWorld);
 ray.set(start,outward.negate());const hit=ray.intersectObject(annexe,true)[0];
 assert(hit&&(hit.object.isInstancedMesh||hit.object.name.includes('glazing')),o.name+' glazing is exposed');
}
console.log('PASS: annexe OS registration and scale, independent Redesmere alignment, open courts, roofs, arched glazing, bell tower and walking collisions.');



for(const key of ['annexe-front','annexe-front-right','annexe-img1','annexe-side','annexe-ground']){
 const p=ANNEXE_VIEWS[key].position;assert(!obstacles.some(b=>obstacleContains(b,p[0],p[2])),key+' starts outside masonry');
}
ray.set(new THREE.Vector3(...annexePoint(-35,40,-11)),new THREE.Vector3(0,-1,0));
assert(ray.intersectObject(annexe,true).some(h=>h.object.name==='West canted bay slate roof'&&h.face.normal.y>0),'canted side bay roof faces upward');

