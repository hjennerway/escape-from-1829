import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {buildAsylumLayout,flatWalkable,moveAsylumActor,segmentDistance} from './dist/asylum-layout.mjs';
import {furnishAsylum,FURNITURE_CATALOG,furnitureFrontClearance} from './dist/asylum-furniture.mjs';
import {HALL_PROP_CATALOG} from './dist/hall-furnishings.mjs';
import {createHallFurnitureModels} from './dist/hall-furniture-models.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';
import {furnitureContains} from './dist/furniture-collision.mjs';
import {createNotebook} from './dist/notebook.mjs';
const models=createHallFurnitureModels(THREE,{labels:false}),plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
assert.deepEqual(Object.keys(models).sort(),Object.keys(HALL_PROP_CATALOG).sort());let triangles=0,walks=0;
for(const [kind,parts] of Object.entries(models)){
 const box=new THREE.Box3();for(const p of parts){box.union(p.geometry.boundingBox);triangles+=p.geometry.attributes.position.count/3;assert(Array.from(p.geometry.attributes.position.array).every(Number.isFinite));}
 const c=HALL_PROP_CATALOG[kind];assert(box.getSize(new THREE.Vector3()).distanceTo(new THREE.Vector3(c.width,c.height,c.depth))<1e-5,kind+' matches its collision dimensions');assert(Math.abs(box.min.y)<1e-6,kind+' is grounded');
}
assert(triangles<16000,'Hall props keep a modest shared geometry budget');
const ids=['Visitors','WardService','Recreation'],origin={x:0,z:17.5,floor:0,y:0};let baseline;
for(const seed of [1829,1,42,4294967295]){
 furnishAsylum(floors,{seed});const items=floors.flatMap(f=>f.furniture.filter(i=>ids.includes(i.roomId)));
 if(!baseline)baseline=structuredClone(items);else assert.deepEqual(items,baseline,'Hall furniture stays fixed between games');
 assert.equal(items.length,32);assert.deepEqual(floors.slice(2).flatMap(f=>f.furnishingAreas),[],'Only the requested ground/first-floor halls change');
 for(const f of floors)for(const a of f.furnishingAreas.filter(a=>ids.includes(a.id))){
  assert(flatWalkable(f,...a.label,.5));assert(routeBetweenFloors(floors,origin,{x:a.label[0],z:a.label[1],floor:f.id}).length,'Every hall is reachable');
  const local=f.furniture.filter(i=>i.roomId===a.id);
  for(const item of local){
   if(item.decorative){if(!item.mounted){const support=local.find(p=>p.id===item.supportId);assert(support&&Math.abs(item.y-support.y-support.height-.008)<1e-8);const c=Math.cos(support.rotation),s=Math.sin(support.rotation),dx=item.x-support.x,dz=item.z-support.z;assert(Math.abs(c*dx-s*dz)+item.width/2<=support.width/2&&Math.abs(s*dx+c*dz)+item.depth/2<=support.depth/2,'Complete prop rests within its support');}else{const x=item.x-Math.sin(item.rotation)*item.depth/2,z=item.z-Math.cos(item.rotation)*item.depth/2;assert(f.walls.some(w=>Math.abs(segmentDistance(x,z,w.a,w.b)-.09)<1e-6),'Mounted frame touches a real wall');}continue;}
   assert(!flatWalkable(f,item.x,item.z));
   const front=furnitureFrontClearance(item);if(front)assert(flatWalkable(f,front.x,front.z,.34),'Cabinet fronts remain accessible');
   const d=item.depth/2+.80,actor={x:item.x+Math.sin(item.rotation)*d,z:item.z+Math.cos(item.rotation)*d,floor:f.id,y:f.elevation};
   if(flatWalkable(f,actor.x,actor.z)){moveAsylumActor(floors,actor,item.x-actor.x,item.z-actor.z);assert(!furnitureContains(item,actor.x,actor.z,.32),'Walking stops outside the actual furniture');walks++;}
  }
  for(const chair of local.filter(i=>i.kind==='chair')){const t=local.filter(i=>i.kind==='table').sort((a,b)=>Math.hypot(a.x-chair.x,a.z-chair.z)-Math.hypot(b.x-chair.x,b.z-chair.z))[0];assert((t.x-chair.x)*Math.sin(chair.rotation)+(t.z-chair.z)*Math.cos(chair.rotation)>0,'Chairs face their tables');}
 }
 // The entire original corridor centreline remains open, including the east junction.
 for(const f of floors.slice(0,2))for(const c of f.corridors)for(let i=1;i<c.points.length;i++)for(let t=0;t<=1;t+=.05){const a=c.points[i-1],b=c.points[i],x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(flatWalkable(f,x,z,.36,{furniture:false}))assert(flatWalkable(f,x,z,.36),'Furniture preserves corridor walking lanes');}
 const notes=createNotebook(floors);for(const f of floors)for(const a of f.furnishingAreas.filter(a=>ids.includes(a.id)))notes.explore({x:a.label[0],z:a.label[1],floor:f.id,outside:false});for(const id of ids)assert(notes.entries.some(n=>n.text.includes(id)),'Notebook discovers '+id);
}
const visitors=baseline.filter(i=>i.roomId==='Visitors'),service=baseline.filter(i=>i.roomId==='WardService'),recreation=baseline.filter(i=>i.roomId==='Recreation');
assert.equal(visitors.filter(i=>i.kind==='chair').length,8);assert.equal(visitors.filter(i=>i.kind==='table').length,2);assert(visitors.some(i=>i.kind==='visitingNotice'));
assert.equal(service.filter(i=>i.kind==='linenCupboard').length,2);assert(service.some(i=>i.kind==='linenTrolley')&&service.some(i=>i.kind==='dutyBoard'));
for(const kind of ['draughtsSet','newspaperStand','sewingBasket','waitingBench'])assert(recreation.some(i=>i.kind===kind));
console.log(`PASS: nine hall models / ${triangles} triangles, 32 fixed furnishings, four seeds, physical support/wall mounts, chair directions, corridor lanes, accessible cabinets, ${walks} walked collisions and notebook names.`);
