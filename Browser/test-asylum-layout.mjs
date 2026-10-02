import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,stairRoute,flatWalkable,segmentDistance} from './dist/asylum-layout.mjs';
import {makeFloors,routeBetweenFloors} from './dist/floors.mjs';
import {path,nearExit} from './dist/core.mjs';
import {buildArchitecture} from './dist/architecture.mjs';
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
assert.deepEqual(plan,JSON.parse(await readFile(new URL('../Research/1829-interior-proposal/plan-data.json',import.meta.url))),'Review drawings and game use the same plan');
const started=performance.now(),floors=makeFloors(buildAsylumLayout(plan));
assert.deepEqual(floors.map(f=>f.elevation),[0,4.2,-3.2,8.4]);
assert(!plan.stairs.some(s=>s.id==='S2'));
assert(plan.stairs.find(s=>s.id==='S1').label[0]<-10);
assert(plan.corridors.find(c=>c.id==='C1').points.some(([x,z])=>x===-38.4&&z===1));
const spawn={x:0,z:14,floor:0,y:0},failures=[];
for(const floor of floors){
 for(const room of floor.rooms){const p={x:room.label[0],z:room.label[1],floor:floor.id};if(!flatWalkable(floor,p.x,p.z,.25)||!routeBetweenFloors(floors,spawn,p).length)failures.push('Room '+room.id+' floor '+floor.id);}
 for(const exit of floor.exits){const p={...exit.inside,floor:floor.id,y:floor.elevation};if(!flatWalkable(floor,p.x,p.z,.34)||!routeBetweenFloors(floors,spawn,p).length)failures.push('Exit '+exit.id+' floor '+floor.id);assert.equal(nearExit(floor,p)?.id,exit.id);}
 const scene=new THREE.Scene();buildArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 assert(scene.getObjectByName('Asylum floor'));assert(scene.getObjectByName('Asylum ceiling'));assert.equal(scene.getObjectByName('Asylum Panel')?.count??0,floor.exits.filter(e=>e.id!=='D1').length);
 if(floor.id===0||floor.id===1){
  // Probe the actual visible faces: short sampled steps and a leftover room
  // partition previously projected into the Reception corridor on either side.
  const ray=new THREE.Raycaster(),normal=new THREE.Vector3(),origin=new THREE.Vector3();
  const partitions=(plan.partitions??[]).filter(p=>p.floors.includes(floor.id));
  const atPartition=(x,z,clearance)=>partitions.some(p=>segmentDistance(x,z,...p.points)<clearance);
  for(const side of [-1,1]){
   normal.set(-side*Math.SQRT1_2,0,Math.SQRT1_2);
   const actor={x:side*6.5+normal.x*.65,z:4.9+normal.z*.65,floor:floor.id,y:floor.elevation};
   for(let i=1;i<50;i++){
    const t=i/50,x=side*(6.5+2.1*t),z=4.9+2.1*t;
    for(const [name,y,depth] of [['Brick',.55,.09],['Plaster',1.6,.09],['Skirting',.13,.1075]]){
     // A requested corridor partition now meets the start of the east bend.
     // Its joint is covered by doorway checks; inspect the exposed chamfer.
     if(atPartition(x,z,.2))continue;
     origin.set(x+normal.x*.6,y,z+normal.z*.6);ray.set(origin,normal.clone().negate());ray.far=.8;
     const hit=ray.intersectObject(scene.getObjectByName('Asylum '+name),false)[0];
     assert(hit&&Math.abs(hit.distance-(.6-depth))<1e-5,`${name} must form a continuous 45-degree face, floor ${floor.id}, side ${side}, sample ${i}`);
    }
    const target={x:x+normal.x*.65,z:z+normal.z*.65};
    if(atPartition(target.x,target.z,.55)){Object.assign(actor,target);continue;}
    moveAsylumActor(floors,actor,target.x-actor.x,target.z-actor.z);
    assert(Math.hypot(actor.x-target.x,actor.z-target.z)<1e-6,'Walking follows each straight Reception corner without snagging');
   }
  }
  // The central corridor used to open into R7 between its staggered wall ends.
  // Survey the requested 45-degree closure, including its visible finishes,
  // collision and the retained route around the bend in both directions.
  const cornerA=[4.1,-24.5],cornerB=[5.5,-25.9];
  normal.set(Math.SQRT1_2,0,Math.SQRT1_2);
  for(let i=1;i<20;i++){
   const t=i/20,x=cornerA[0]+1.4*t,z=cornerA[1]-1.4*t;
   assert(!flatWalkable(floor,x,z,.01),'The corridor corner has solid collision');
   for(const side of [-1,1])for(const [name,y,depth] of [['Brick',.55,.09],['Plaster',1.6,.09],['Plaster',2.8,.09],['Skirting',.13,.1075]]){
    ray.set(new THREE.Vector3(x+normal.x*.4*side,y,z+normal.z*.4*side),normal.clone().multiplyScalar(-side));ray.far=.5;
    const hit=ray.intersectObject(scene.getObjectByName('Asylum '+name),false)[0];
    assert(hit&&Math.abs(hit.distance-(.4-depth))<1e-5,`${name} seals the central corridor at 45 degrees, floor ${floor.id}, side ${side}, sample ${i}`);
   }
  }
  for(const [x,z] of [cornerA,cornerB]){
   assert(floor.walls.filter(w=>[w.a,w.b].some(p=>Math.hypot(p[0]-x,p[1]-z)<1e-6)).length>=2,'Both angled wall ends join the adjacent runs');
  }
  for(const reverse of [false,true]){
   const route=[[5.3,-22],[5.3,-24.1],[6.7,-25.5],[6.7,-30]],points=reverse?route.reverse():route;
   const actor={x:points[0][0],z:points[0][1],floor:floor.id,y:floor.elevation};
   for(const [x,z] of points.slice(1)){
    moveAsylumActor(floors,actor,x-actor.x,z-actor.z);
    assert(Math.hypot(actor.x-x,actor.z-z)<1e-6,'The corridor stays walkable around the closed corner');
   }
  }
 }
}
assert.deepEqual(failures,[],'All proposed rooms and physical doors must connect to Reception');
for(const stair of plan.stairs)for(const [lower,upper] of stair.connections){
 const route=stairRoute(stair,floors[lower].elevation,floors[upper].elevation);
 for(const reverse of [false,true]){
  const points=reverse?[...route].reverse():route,first=points[0],actor={x:first[0],z:first[2]-.7,y:first[1],floor:reverse?upper:lower};
  const samples=[first,...points.slice(1),[points.at(-1)[0],points.at(-1)[1],points.at(-1)[2]-.9]];
  let previous=actor.y;
  for(const p of samples){for(let n=0;n<1000&&Math.hypot(actor.x-p[0],actor.z-p[2])>.025;n++){const d=Math.hypot(p[0]-actor.x,p[2]-actor.z),step=Math.min(.055,d);moveAsylumActor(floors,actor,(p[0]-actor.x)/d*step,(p[2]-actor.z)/d*step);assert(Math.abs(actor.y-previous)<.1,'Stairs rise continuously');previous=actor.y;}assert(Math.hypot(actor.x-p[0],actor.z-p[2])<.04,stair.id+' traversable '+reverse);}
  assert.equal(actor.floor,reverse?lower:upper,stair.id+' changes floor by walking');assert.equal(actor.stair,null);
 }
}
assert(floors[0].safeSpawns.length>100);
for(const [from,to] of [[{x:0,z:14,floor:1,y:4.2},{x:-31.1,z:-7,floor:2}], [{x:-31.1,z:-7,floor:2,y:-3.2},{x:0,z:14,floor:1}]]){
 const actor={...from},route=routeBetweenFloors(floors,actor,to);assert(route.length);
 for(const target of route){for(let n=0;n<250&&Math.hypot(actor.x-target.x,actor.z-target.z)>.03;n++){const dx=target.x-actor.x,dz=target.z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.055,d);moveAsylumActor(floors,actor,dx/d*step,dz/d*step);}assert(Math.hypot(actor.x-target.x,actor.z-target.z)<.04,'Pursuer can follow every physical route point');}
 assert.equal(actor.floor,to.floor);assert(Math.abs(actor.y-floors[to.floor].elevation)<.05);
}
console.log(`PASS: revised four-floor footprint, all rooms/doors reachable, S1 relocation, S2 removal, S5 basement connection, continuous stairs up/down, batched architecture (${Math.round(performance.now()-started)} ms).`);
