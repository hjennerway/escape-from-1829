import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildAsylumLayout,flatWalkable,moveAsylumActor,insidePolygon,segmentDistance,stairRoute,stairDeparture} from './dist/asylum-layout.mjs';
import {furnishAsylum,FURNITURE_CATALOG,furnitureCorners} from './dist/asylum-furniture.mjs';
import {furnitureContains,furnitureOccludes} from './dist/furniture-collision.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';
import {path,visible} from './dist/core.mjs';
import * as THREE from 'three';
import {createWardrobeModel} from './dist/wardrobe-model.mjs';
import {createMedicalFurnitureMaterials} from './dist/medical-furniture-models.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
const origin={x:0,z:17.5,floor:0,y:0},fixed=()=>floors.flatMap(f=>f.furniture.filter(i=>!i.variable)),variation=()=>floors.flatMap(f=>f.furniture.filter(i=>i.variable));
const seeds=[1829,1,2,3,42,65535,2147483648,4294967295];let routes=0,collisionProbes=0,frontChecks=0,wallContacts=0;
// Project actual rotated footprints onto both polygons' edge normals. This
// audits the complete one-metre access strip, including corner intrusions,
// across the whole floor, regardless of which item was placed first.
function polygonsOverlap(a,b){
 const axes=[a,b].flatMap(points=>points.map((p,i)=>{const q=points[(i+1)%points.length];return [p[1]-q[1],q[0]-p[0]];}));
 return axes.every(([x,z])=>{const p=a.map(v=>v[0]*x+v[1]*z),q=b.map(v=>v[0]*x+v[1]*z);return Math.min(...p)<Math.max(...q)-1e-8&&Math.min(...q)<Math.max(...p)-1e-8;});
}
function footprint(item){return [-1,1].flatMap(u=>(u===-1?[-1,1]:[1,-1]).map(v=>{const c=Math.cos(item.rotation),s=Math.sin(item.rotation);return [item.x+c*u*item.width/2+s*v*item.depth/2,item.z-s*u*item.width/2+c*v*item.depth/2];}));}
function frontStrip(item){const c=Math.cos(item.rotation),s=Math.sin(item.rotation);return [[-item.width/2-.10,0],[item.width/2+.10,0],[item.width/2+.10,1],[-item.width/2-.10,1]].map(([u,v])=>[item.x+c*u+s*(item.depth/2+v),item.z-s*u+c*(item.depth/2+v)]);}
assert.equal(Object.keys(FURNITURE_CATALOG).length,20);
assert.equal(FURNITURE_CATALOG.chair.source,'windsor_chair');assert.equal(FURNITURE_CATALOG.cupboard.procedural,true);assert.equal(FURNITURE_CATALOG.bench.source,'panca_50');
for(const [key,value] of Object.entries({width:1.02,depth:2.10,height:.92}))assert(Math.abs(FURNITURE_CATALOG.bed[key]/value-1.3)<1e-12,'Beds are 130% in every dimension, including collisions');
for(const [kind,previous] of Object.entries({chair:{width:.48,depth:.47,height:.90},table:{width:1.50,depth:.82,height:.76}}))for(const [key,value] of Object.entries(previous))assert(Math.abs(FURNITURE_CATALOG[kind][key]/value-1.3)<1e-12,`${kind}: 130% in every dimension, including collisions`);
const wardrobe=new THREE.Group(),wardrobeBounds=new THREE.Box3(),dispensaryMaterials=createMedicalFurnitureMaterials(THREE);
for(const part of createWardrobeModel(THREE)){
 wardrobe.add(new THREE.Mesh(part.geometry,part.material));wardrobeBounds.union(part.geometry.boundingBox);
 const reference=Object.values(dispensaryMaterials).find(m=>m.name===part.material.name);
 assert(reference&&reference.color.equals(part.material.color)&&reference.roughness===part.material.roughness&&reference.metalness===part.material.metalness,'Wardrobe shares the dispensary timber and brass finish');
 assert(!part.material.transparent,'Wardrobe has solid doors, without frosted glass');
}
wardrobe.updateMatrixWorld(true);
assert(wardrobeBounds.getSize(new THREE.Vector3()).distanceTo(new THREE.Vector3(1.5,FURNITURE_CATALOG.bookcase.height,.65))<1e-5,'Wardrobe matches the bookshelf height and its walking footprint');
for(const x of [-.5,0,.5])for(const originalY of [.24,.5,1.15,1.8,2.02]){
 const y=originalY*FURNITURE_CATALOG.cupboard.height/2.15;
 const hit=new THREE.Raycaster(new THREE.Vector3(x,y,2),new THREE.Vector3(0,0,-1)).intersectObject(wardrobe,true)[0];
 assert(hit&&hit.point.z>.20,'Doors close the full front, including the old open-shelf and drawer areas');
}
furnishAsylum(floors,{seed:seeds[0]});const baseline=structuredClone(fixed()),firstVariation=structuredClone(variation());
const changedCells=floors.map(f=>Array.from(f.cells));
furnishAsylum(floors,{seed:seeds[0]});assert.deepEqual(fixed(),baseline);assert.deepEqual(variation(),firstVariation,'Same seed restores the complete layout');
assert.deepEqual(floors.map(f=>Array.from(f.cells)),changedCells,'Regeneration preserves matching navigation');
for(const seed of seeds){
 furnishAsylum(floors,{seed});assert.deepEqual(fixed(),baseline,'Main furnishings stay fixed across new games');
 for(const floor of floors){
  assert(floor.furniture.length>0);assert.equal(new Set(floor.furniture.map(i=>i.id)).size,floor.furniture.length);
  for(const room of floor.rooms){
   assert(room.purpose&&room.name,'Every room has a designated use');
   if(room.purpose==='bookroom'){
    const shelves=floor.furniture.filter(i=>i.roomId===room.id);
    assert(shelves.length>=(room.id==='R31'?2:3),`${floor.id} ${room.id}: enlarged stocked shelves retain clear small-room circulation`);
    assert(shelves.every(i=>i.kind==='bookcase'&&i.stocked&&!i.variable&&Math.abs(i.width-1.05*1.5)<1e-12&&Math.abs(i.depth-.28*1.5)<1e-12&&Math.abs(i.height-1.90*1.5)<1e-12),'Fitted book-filled shelves scale to 150% in every dimension and remain fixed');
    if(room.id==='R31')assert.equal(shelves.filter(i=>Math.abs(Math.sin(i.rotation))>.5&&Math.abs(Math.cos(i.rotation))>.5).length,1,'The open door reserves one east bay cheek; the opposite cheek retains an aligned shelf');
   }
   const target={x:room.label[0],z:room.label[1],floor:floor.id,y:floor.elevation};
   assert(flatWalkable(floor,target.x,target.z,.5),`${seed}: room centre remains clear ${floor.id} ${room.id}`);
   assert(routeBetweenFloors(floors,origin,target).length,`${seed}: room reachable ${floor.id} ${room.id}`);routes++;
   if(['stairs','porch','circulation'].includes(room.purpose))assert(!floor.furniture.some(i=>i.roomId===room.id),'Stair halls and entrance lobbies stay clear');
  }
  for(const exit of floor.exits){assert(flatWalkable(floor,exit.inside.x,exit.inside.z,.5));assert(routeBetweenFloors(floors,origin,{...exit.inside,floor:floor.id}).length);routes++;}
  for(const door of floor.doorways)for(const side of [-1,1]){
   const a={x:door.x-door.dz*side*.6,z:door.z+door.dx*side*.6,floor:floor.id,y:floor.elevation},target={x:door.x+door.dz*side*.6,z:door.z-door.dx*side*.6};
   assert(flatWalkable(floor,a.x,a.z));moveAsylumActor(floors,a,target.x-a.x,target.z-a.z);assert(Math.hypot(a.x-target.x,a.z-target.z)<1e-6,'Every framed doorway can still be walked both ways');
  }
  for(const item of floor.furniture){
   if(['cupboard','bookcase'].includes(item.kind)){
    const c=Math.cos(item.rotation),s=Math.sin(item.rotation),back=[-.5,0,.5].map(u=>[item.x+c*u*item.width-s*item.depth/2,item.z-s*u*item.width-c*item.depth/2]);
    assert(floor.walls.some(w=>Math.abs((w.b[0]-w.a[0])*s+(w.b[1]-w.a[1])*c)<1e-7&&back.every(([x,z])=>Math.abs(segmentDistance(x,z,w.a,w.b)-.09)<1e-7)),`${seed}: ${item.id} has its full back flush with actual masonry`);wallContacts++;
   }
   if(['bookcase','apothecary'].includes(item.kind)){
    const strip=frontStrip(item);
    for(const other of floor.furniture)if(other.id!==item.id)assert(!polygonsOverlap(strip,footprint(other)),`${seed}: ${item.id} needs one metre clear across its front; obstructed by ${other.id}`);
    const distance=item.depth/2+.5,x=item.x+Math.sin(item.rotation)*distance,z=item.z+Math.cos(item.rotation)*distance;
    assert(flatWalkable(floor,x,z,.34),`${seed}: ${item.id} has a usable standing space in front`);frontChecks++;
   }
   if(item.kind==='cupboard')assert(!item.source&&!item.medical&&item.width===1.5&&item.depth===.65&&item.height===FURNITURE_CATALOG.bookcase.height,'Every former cupboard uses the solid wardrobe at bookshelf height');
   const room=[...floor.rooms,...floor.furnishingAreas].find(r=>r.id===item.roomId);assert(furnitureCorners(item).every(([x,z])=>insidePolygon(x,z,room.points)),'Visible furniture stays within its room or furnishing area');
   if(item.kind==='bench')assert(['ward','bedroom','staffBedroom','store','workshop'].includes(room.purpose),'Panca seats have appropriate room uses');
   if(FURNITURE_CATALOG[item.kind].decorative){if(!item.mounted){const support=floor.furniture.find(i=>i.id===item.supportId);assert(support&&Math.abs(item.y-support.y-support.height-.008)<1e-6,'Decorations rest on the furniture');}continue;}
   assert(!flatWalkable(floor,item.x,item.z),'Solid furniture blocks player and pursuer movement');
   assert(floor.cells[Math.round((item.z-floor.origin.z)/.5)*floor.width+Math.round((item.x-floor.origin.x)/.5)]===0,'Pursuer navigation contains the furniture');
   assert(flatWalkable(floor,item.x,item.z,.02,{furniture:false}),'Furniture has not been placed inside architectural masonry');
   const c=Math.cos(item.rotation),s=Math.sin(item.rotation),a={x:item.x+s*(item.depth/2+.8),z:item.z+c*(item.depth/2+.8),floor:floor.id,y:floor.elevation};
   if(flatWalkable(floor,a.x,a.z)){
    moveAsylumActor(floors,a,item.x-a.x,item.z-a.z);assert(!furnitureContains(item,a.x,a.z,.32),'A walked approach stops outside the visible object');collisionProbes++;
   }
   const before={x:item.x+s*(item.depth/2+.2),z:item.z+c*(item.depth/2+.2),y:floor.elevation},after={x:item.x-s*(item.depth/2+.2),z:item.z-c*(item.depth/2+.2),y:floor.elevation};
   const single={...floor,furnitureObstacles:[item]};assert.equal(furnitureOccludes(single,before,after),item.height>=1.5,'Eye-height sight distinguishes tall storage from low furniture');
  }
  for(const spawn of floor.safeSpawns)assert(flatWalkable(floor,spawn.x,spawn.z,.5),'NPC spawns stay outside furniture');
 }
}
assert.notDeepEqual(variation(),firstVariation,'Different seeds vary small items');
// Walk a genuine pursuer route around the furnishings, including floor travel.
for(const target of [{x:-36.225,z:31.95,floor:0},{x:29.8,z:-21.4,floor:1},{x:-34.65,z:-12.25,floor:2},{x:-3.3,z:8.1,floor:3}]){
 const actor={...origin},route=routeBetweenFloors(floors,actor,target);assert(route.length);
 for(const p of route){let attempts=0;while(Math.hypot(actor.x-p.x,actor.z-p.z)>.025&&attempts++<100){const d=Math.hypot(p.x-actor.x,p.z-actor.z),step=Math.min(.055,d);moveAsylumActor(floors,actor,(p.x-actor.x)*step/d,(p.z-actor.z)*step/d);}assert(attempts<100,'Pursuer follows every route point around furniture');}
 assert.equal(actor.floor,target.floor);
}
assert(floors[0].furniture.some(i=>i.kind==='bed')&&floors[0].furniture.some(i=>i.kind==='bookcase'));
const ratio=fixed().length/(fixed().length+variation().length);assert(ratio>=.70&&ratio<=.85,'Most furnishings remain fixed');
console.log(`PASS: twenty furniture models, all room uses, ${seeds.length} reproducible layouts, ${wallContacts} flush storage backs, ${frontChecks} unobstructed one-metre shelf/cabinet fronts, ${routes} room/exit routes, all door crossings, ${collisionProbes} walked furniture collisions, NPC paths/spawns, supported decorations and eye-height sight (${Math.round(ratio*100)}% fixed).`);
