import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {buildAsylumLayout,flatWalkable,moveAsylumActor} from './dist/asylum-layout.mjs';
import {furnishAsylum} from './dist/asylum-furniture.mjs';
import {SANITARY_CATALOG,PRIVY_ROOMS} from './dist/sanitary-furnishings.mjs';
import {createSanitaryFurnitureModels} from './dist/sanitary-furniture-models.mjs';
import {roomWallColour} from './dist/asylum-room-finishes.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
assert.deepEqual(plan,JSON.parse(await readFile(new URL('../Research/1829-interior-proposal/plan-data.json',import.meta.url))));
const floors=buildAsylumLayout(plan).floors,models=createSanitaryFurnitureModels(THREE);
let triangles=0,walks=0,baseline;
for(const [kind,parts] of Object.entries(models)){
 const bounds=new THREE.Box3(),catalog=SANITARY_CATALOG[kind];
 for(const part of parts){
  bounds.union(part.geometry.boundingBox);triangles+=part.geometry.attributes.position.count/3;
  for(const attribute of ['position','normal'])assert(Array.from(part.geometry.attributes[attribute].array).every(Number.isFinite));
 }
 assert(bounds.getSize(new THREE.Vector3()).distanceTo(new THREE.Vector3(catalog.width,catalog.height,catalog.depth))<1e-5,'Meshes match walking footprints');
 assert(Math.abs(bounds.min.y)<1e-6,'Fixture rests on floor');
}
assert(triangles<5000,'The three shared designs stay below 5k triangles');
const seat=new THREE.Group();for(const part of models.privySeat)seat.add(new THREE.Mesh(part.geometry,part.material));seat.updateMatrixWorld(true);
const top=(x,z)=>new THREE.Raycaster(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0)).intersectObject(seat,true)[0]?.point.y;
assert(top(0,.035)<top(.30,.035)-.05,'A real hole through the seat reveals the recessed pan');
const origin={x:0,z:17.5,floor:0,y:0};
for(const seed of [1829,1,42,4294967295]){
 furnishAsylum(floors,{seed});
 const fixtures=floors.flatMap(f=>f.furniture.filter(i=>i.kind in SANITARY_CATALOG));
 assert.equal(fixtures.length,56);assert.equal(fixtures.filter(i=>i.kind==='privySeat').length,20);
 if(baseline)assert.deepEqual(fixtures,baseline,'Sanitation stays fixed across games');else baseline=structuredClone(fixtures);
 for(const f of floors.filter(f=>f.id<2))for(const id of PRIVY_ROOMS){
  const room=f.rooms.find(r=>r.id===id),items=f.furniture.filter(i=>i.roomId===id);
  const seats=items.filter(i=>i.kind==='privySeat'),screens=items.filter(i=>i.kind==='privyScreen');
  assert.equal(room.purpose,'privy');assert.equal(roomWallColour(f,room),-1,'Plain masonry replaces decorative wallpaper');
  assert.equal(seats.length,['R5','R16'].includes(id)?3:2);assert.equal(screens.length,seats.length+1);
  assert.equal(items.filter(i=>i.kind==='washstand').length,1);
  assert(items.every(i=>!i.variable&&f.furnitureObstacles.includes(i)));
  assert(flatWalkable(f,...room.label,.5),'Common aisle remains open');
  for(const item of [...seats,...items.filter(i=>i.kind==='washstand')]){
   const d=item.depth/2+.80,target={x:item.x+Math.sin(item.rotation)*d,z:item.z+Math.cos(item.rotation)*d,floor:f.id,y:f.elevation};
   assert(flatWalkable(f,target.x,target.z,.36),`${item.id}: standing space in front`);
   const route=routeBetweenFloors(floors,origin,target);assert(route.length,`${item.id}: access route`);
   const actor={...origin};
   for(const p of route){let attempts=0;while(Math.hypot(actor.x-p.x,actor.z-p.z)>.025&&attempts++<100){const distance=Math.hypot(p.x-actor.x,p.z-actor.z),step=Math.min(.055,distance);moveAsylumActor(floors,actor,(p.x-actor.x)*step/distance,(p.z-actor.z)*step/distance);}assert(attempts<100,`${item.id}: player can physically follow the access route`);}
   assert.equal(actor.floor,f.id);assert(Math.hypot(actor.x-target.x,actor.z-target.z)<.08);walks++;
  }
 }
}
console.log(`PASS: eight shared privy rooms, twenty accessible seats, eight washstands, fixed fixtures across four seeds, ${walks} physically followed access routes, real seat openings, plain walls and ${triangles} model triangles.`);
