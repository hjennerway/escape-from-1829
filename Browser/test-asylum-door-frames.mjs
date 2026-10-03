import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),snapshot=JSON.stringify(plan);
const floors=buildAsylumLayout(plan).floors,ray=new THREE.Raycaster(),matrix=new THREE.Matrix4();
let exits=0,rooms=0,entrances=0,samples=0;
for(const floor of floors){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const masonry=['Asylum Brick','Asylum Plaster'].map(name=>scene.getObjectByName(name));
 function supported(point,normal,frame,label,expectedDepth,maxGap=.075){
  for(const side of [-1,1]){
   ray.set(point.clone().addScaledVector(normal,side*(expectedDepth/2+.25)),normal.clone().multiplyScalar(-side));ray.far=expectedDepth+.5;
   const casing=ray.intersectObject(frame,false)[0],wall=ray.intersectObjects(masonry,false)[0];
   assert(casing,`${label}: casing is present`);
   assert(wall,`${label}: masonry supports the casing`);
   const gap=wall.distance-casing.distance;
   assert(gap>.003&&gap<maxGap,`${label}: casing fits its wall face without floating, intersecting or sharing faces (${gap})`);samples++;
  }
 }
 const panel=scene.getObjectByName('Asylum Panel'),stone=scene.getObjectByName('Asylum Stone');
 let instance=0;
 for(const exit of floor.exits){
  const original=plan.exits.find(e=>e.id===exit.id);
  assert.equal(exit.worldX,original.x);assert.equal(exit.worldZ,original.z);
  assert.deepEqual(exit.destination,original.levels.find(l=>l.floor===floor.id).destination,'Outside arrivals remain fixed');
  if(exit.id==='D1'){
   const frame=scene.getObjectByName('Asylum EntranceFrame');frame.getMatrixAt(0,matrix);
   const centre=new THREE.Vector3().setFromMatrixPosition(matrix),normal=new THREE.Vector3(0,0,1);
   for(const side of [-1,1])for(const y of [.35,1.65,3.4]){
    const p=centre.clone();p.x=exit.worldX+side*1.055;p.y=y;
    supported(p,normal,frame,'Reception entrance jamb',.6,.4);
   }
   for(const u of [-1.05,-.6,0,.6,1.05]){
    const p=centre.clone();p.x=exit.worldX+u;p.y=3.7;
    supported(p,normal,frame,'Reception entrance lintel',.6,.4);
   }
   entrances++;continue;
  }
  panel.getMatrixAt(instance++,matrix);const centre=new THREE.Vector3().setFromMatrixPosition(matrix);
  const normal=new THREE.Vector3(exit.axis==='x'?1:0,0,exit.axis==='z'?1:0),tangent=new THREE.Vector3(normal.z,0,normal.x);
  // Read the leaf's actual transform, then measure against the independent
  // reviewed envelope rather than the opening metadata used by the renderer.
  const host=floor.outline.loops.flatMap(loop=>loop.map((a,i)=>[a,loop[(i+1)%loop.length]])).find(([a,b])=>
   exit.axis==='x'?Math.abs(a[0]-b[0])<1e-7&&Math.abs(centre.x-a[0])<1e-5&&centre.z>Math.min(a[1],b[1])&&centre.z<Math.max(a[1],b[1]):
    Math.abs(a[1]-b[1])<1e-7&&Math.abs(centre.z-a[1])<1e-5&&centre.x>Math.min(a[0],b[0])&&centre.x<Math.max(a[0],b[0]));
  assert(host,`Floor ${floor.id} ${exit.id}: leaf is fitted to its wall plane`);
  for(const side of [-1,1])for(const u of [.80,.845,.885])for(const y of [.35,1.65,2.42]){
   const p=centre.clone().addScaledVector(tangent,side*u);p.y=y;
   supported(p,normal,stone,`Floor ${floor.id} ${exit.id} jamb ${side}`, .22);
  }
  for(const u of [-.9,-.6,-.3,0,.3,.6,.9]){
   const p=centre.clone().addScaledVector(tangent,u);p.y=2.53;
   supported(p,normal,stone,`Floor ${floor.id} ${exit.id} lintel`, .22);
  }
  for(const side of [-1,1])for(const y of [.35,1.65,2.44]){
   const p=centre.clone();p.y=y;ray.set(p.addScaledVector(normal,side*.4),normal.clone().multiplyScalar(-side));ray.far=.8;
   assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Asylum Panel',`${exit.id}: leaf closes the opening to the head`);
  }
  exits++;
 }
 for(const door of floor.doorways){
  const normal=new THREE.Vector3(-door.dz,0,door.dx),tangent=new THREE.Vector3(door.dx,0,door.dz),centre=new THREE.Vector3(door.x,0,door.z);
  for(const side of [-1,1])for(const y of [.35,1.65,2.4]){
   const p=centre.clone().addScaledVector(tangent,side*(door.width/2+.08));p.y=y;
   supported(p,normal,scene.getObjectByName('Asylum DoorFrame'),`Floor ${floor.id} ${door.roomId??door.partitionId} jamb`,door.depth+.108);
  }
  for(const u of [-door.width/2,0,door.width/2]){
   const p=centre.clone().addScaledVector(tangent,u);p.y=door.height+.065;
   supported(p,normal,scene.getObjectByName('Asylum DoorFrame'),`Floor ${floor.id} ${door.roomId??door.partitionId} lintel`,door.depth+.108);
  }
  rooms++;
 }
}
assert.equal(JSON.stringify(plan),snapshot,'Frame fitting does not mutate the shared plan');
assert.equal(exits,22);assert.equal(entrances,1);assert.equal(rooms,89);
console.log(`PASS: ${exits+entrances} outside frames and ${rooms} room frames on four floors, ${samples} masonry support/face-clearance rays, closed leaves and unchanged exterior anchors.`);
