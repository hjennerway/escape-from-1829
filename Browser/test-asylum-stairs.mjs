import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,stairRoute} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
assert.deepEqual(plan.stairs.find(s=>s.id==='S1').connections,[[2,0],[0,1]],'Reception must reach the basement');
const scene=new THREE.Scene();
for(const floor of floors){const group=new THREE.Group();buildAsylumArchitecture(THREE,group,floor);group.position.y=floor.elevation;scene.add(group);}
scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),solids=[],rails=[];
scene.traverse(m=>{if(['Asylum floor','Asylum ceiling','Asylum Stone','Asylum Carpet'].includes(m.name))solids.push(m);if(m.name==='Asylum Handrails')rails.push(m);});
function cast(meshes,x,y,z,dy){ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(0,dy,0));ray.far=8;return ray.intersectObjects(meshes,false);}
let supports=0,guards=0;
for(const stair of plan.stairs){
 const [[x0,z0],[x1],,[,z1]]=stair.points;
 assert(Math.abs(x1-x0-(z1-z0))<1e-6,stair.id+' has a square footprint');
 for(const [lower,upper] of stair.connections){
  const route=stairRoute(stair,floors[lower].elevation,floors[upper].elevation);
  for(let j=1;j<route.length;j++)for(let i=0;i<=20;i++){
   const a=route[j-1],b=route[j],t=i/20,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;
   const floorHit=cast(solids,x,y+.22,z,-1)[0];
   assert(floorHit&&Math.abs(floorHit.point.y-y)<=.195,`${stair.id}: continuous visible support at ${[x,y,z]}: ${floorHit?.object.name}/${floorHit?.point.y}`);
   assert(!cast(solids,x,y+.25,z,1).some(hit=>hit.distance<1.4),stair.id+' has clear headroom');supports++;
  }
  // Try walking through both sides of each flight and the rear landing.
  for(const index of [1,3,5]){
   const a=route[index],b=route[index+1],x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,z=(a[2]+b[2])/2;
   const alongX=Math.abs(b[0]-a[0])>.1;
   for(const sign of [-1,1]){
    const actor={x,y,z,floor:lower,stair:{id:stair.id,lower,upper,route}};
    for(let n=0;n<40;n++)moveAsylumActor(floors,actor,alongX?0:sign*.08,alongX?sign*.08:0);
    assert(Math.hypot(actor.x-x,actor.z-z)<.34,stair.id+' railing blocks a sideways fall');guards++;
   }
  }
 }
 // Every upper exposed shaft rim has a visible rail and a physical barrier.
 for(const floor of floors.filter(f=>stair.connections.some(([,b])=>b===f.id))){
  for(const [x,z,dx,dz] of [[x0-.7,(z0+z1)/2,.08,0],[x1+.7,(z0+z1)/2,-.08,0],[(x0+x1)/2,z1+.7,0,-.08],[(x0+x1)/2,z0+.6,0,.08]]){
   const actor={x,z,y:floor.elevation,floor:floor.id};
   for(let n=0;n<30;n++)moveAsylumActor(floors,actor,dx,dz);
   assert(!actor.stair,stair.id+' rim cannot drop onto another flight');
   assert(Math.hypot(actor.x-x,actor.z-z)<.4,stair.id+' rim blocks the opening');guards++;
  }
  for(const [x,z] of [[x0,(z0+z1)/2],[x1,(z0+z1)/2],[(x0+x1)/2,z1],[(x0+x1)/2,z0+1.3]]){
   assert(cast(rails,x,floor.elevation+1.2,z,-1).some(h=>Math.abs(h.point.y-floor.elevation-1.085)<1e-4),stair.id+' visible landing guard');
  }
 }
 // The centre remains open between levels but has a floor at the lowest level.
 const x=(x0+x1)/2,z=(z0+z1)/2,low=Math.min(...stair.floors.map(f=>floors[f].elevation)),top=Math.max(...stair.floors.map(f=>floors[f].elevation));
 assert(Math.abs(cast(solids,x,top+.2,z,-1)[0].point.y-low)<.02,stair.id+' clear central well with a solid bottom');
}
// Walk the full generated navigation routes, including the basement door next
// to Reception, rather than merely checking that the pathfinder returns points.
for(const floor of floors)for(const exit of floor.exits){
 const actor={x:0,z:14,y:0,floor:0},route=routeBetweenFloors(floors,actor,{...exit.inside,floor:floor.id});assert(route.length);
 for(const target of route){
  for(let n=0;n<400&&Math.hypot(target.x-actor.x,target.z-actor.z)>.025;n++){
   const dx=target.x-actor.x,dz=target.z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.05,d);moveAsylumActor(floors,actor,dx/d*step,dz/d*step);
  }
  assert(Math.hypot(target.x-actor.x,target.z-actor.z)<.04,`Walk to ${exit.id}/${floor.id} at ${JSON.stringify({target,actor})}`);
 }
 assert.equal(actor.floor,floor.id);
}
console.log(`PASS: square guarded wells, Reception basement connection, ${supports} visible support/headroom samples, ${guards} fall barriers, all 23 door routes physically walked.`);
