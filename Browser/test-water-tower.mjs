import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createWaterTower,ESCAPE_WATER_TOWER,WATER_TOWER_VIEWS} from './dist/water-tower.mjs';
import {ANNEXE} from './dist/annexe.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const material=new THREE.MeshStandardMaterial(),tower=createWaterTower(THREE,{brick:material,roof:material,dark:material,worldUV:g=>g});
tower.updateMatrixWorld(true);
const faces=[1,2,3,4].map(n=>tower.children.find(o=>o.userData.photoSide===n));
assert(faces.every(Boolean));
for(const [i,target] of [[1,new THREE.Vector3(0,0,13)],[3,new THREE.Vector3(ANNEXE.x,0,ANNEXE.z)]]){
 const normal=new THREE.Vector3(0,0,1).transformDirection(faces[i].matrixWorld);
 assert(normal.dot(target.sub(tower.position).normalize())>.8,'Numbered face must point toward its registered building');
}
function hit(face,x,y){
 const origin=face.localToWorld(new THREE.Vector3(x,y,8));
 const direction=new THREE.Vector3(0,0,-1).transformDirection(face.matrixWorld);
 return new THREE.Raycaster(origin,direction,0,4).intersectObject(tower,true)[0];
}
for(const [i,face] of faces.entries()){
 assert.equal(hit(face,i===1?.18:0,3).object.name,i===0?'Arched entrance':i===1?'1829-facing arched window':'Bricked ground doorway');
 if(i!==1){
  assert.equal(hit(face,0,9.5).object.name,'Large bricked upper opening');
  const scars=face.getObjectByName('Descending intersecting roof scars');
  assert(scars&&scars.children.length,'Former roof bands must survive detail batching');
  const scarX=i===0?3.8:-3.8,band=hit(face,scarX,11.1);assert(band.point.distanceTo(face.localToWorld(new THREE.Vector3(scarX,11.1,5.1)))<.2,'Roof traces stay shallow against masonry');
 }
 for(const y of [21.8,24.8,27.8])for(const x of [-.91,.91])assert.equal(hit(face,x,y).object.name,'Bricked slit recess','Upper slits must be visible rather than buried in the wall');
 face.traverse(o=>{if(o.geometry)for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite));});
 const shot=WATER_TOWER_VIEWS['tower-'+(i+1)];assert.equal(shot.position[1],1.8,'Reference cameras start at ground eye height');
 for(const aspect of [.8,16/9]){
  const camera=new THREE.PerspectiveCamera(shot.fov,aspect,.5,1000);camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
  for(const y of [0,33.9]){
   const p=face.localToWorld(new THREE.Vector3(0,y,5.1)).project(camera);
   assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,'The photographed wall fits in each comparison view');
  }
 }
}
// The user explicitly rules out ghosts on side 2 and its adjoining corners.
for(const [i,x] of [[0,-3.8],[2,3.8]])for(const y of [8,9,10,11.4])assert.equal(hit(faces[i],x,y).object.name,'Square brick shaft','Corners meeting side 2 must remain plain brick');
for(const x of [-3,3])for(const y of [4.9,6,8,10])assert.equal(hit(faces[1],x,y).object.name,'Square brick shaft','Side 2 has no triangular infill or roof scars');
const bounds=new THREE.Box3().setFromObject(tower);assert(Math.abs(bounds.max.y-ESCAPE_WATER_TOWER.height)<.01);
assert.equal(material.map,null,'Tower brick refinement must not mutate shared estate materials');
console.log('PASS: tower side registration, exposed doors and blind slits, shallow scars, finite geometry, photo framing and isolated materials.');

