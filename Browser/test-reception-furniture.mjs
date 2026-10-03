import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {buildAsylumLayout,flatWalkable,moveAsylumActor,insidePolygon,segmentDistance} from './dist/asylum-layout.mjs';
import {FURNITURE_CATALOG,furnishAsylum,furnitureCorners,RECEPTION_FURNITURE_SCALE} from './dist/asylum-furniture.mjs';
import {createReceptionFurnitureModels,RECEPTION_RULES} from './dist/reception-furniture-models.mjs';
import {createReceptionClockAudio} from './dist/reception-clock-audio.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';
const models=createReceptionFurnitureModels(THREE,{labels:false});let triangles=0;
assert.deepEqual(Object.keys(models).sort(),['receptionDesk','waitingBench','longcaseClock','keyCupboard','rulesNotice','clerkSet'].sort());
for(const [kind,parts] of Object.entries(models)){
 const bounds=new THREE.Box3();
 for(const {geometry,material} of parts){bounds.union(geometry.boundingBox);triangles+=geometry.attributes.position.count/3;assert(material.isMeshStandardMaterial);for(const key of ['position','normal'])assert(Array.from(geometry.attributes[key].array).every(Number.isFinite));}
 assert(Math.abs(bounds.min.y)<1e-6);
 const c=FURNITURE_CATALOG[kind];bounds.getSize(new THREE.Vector3()).toArray().forEach((v,i)=>assert(Math.abs(v-[c.width,c.height,c.depth][i])<1e-5,kind+' agrees with collision dimensions'));
}
assert(triangles<15000,'Reception props have a restrained mesh budget');assert.equal(RECEPTION_RULES.length,5);
for(const [kind,dimensions] of Object.entries({receptionDesk:[1.85,.92,.88],waitingBench:[2.45,.94,.52],longcaseClock:[.62,2.34,.36],keyCupboard:[.70,.72,.16],rulesNotice:[.76,.92,.045],clerkSet:[1.52,.35,.64]}))for(const [i,key] of ['width','height','depth'].entries())assert(Math.abs(FURNITURE_CATALOG[kind][key]/dimensions[i]-1.2)<1e-12,kind+' is 20% bigger in every dimension');
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
let baseline,walks=0;
for(const seed of [1829,1,42,4294967295]){
 furnishAsylum(floors,{seed});const floor=floors[0],items=floor.furniture.filter(i=>i.roomId==='Reception'),hall=floor.furnishingAreas[0];
 assert.equal(items.length,8);assert.equal(items.filter(i=>i.kind==='waitingBench').length,2);assert(items.every(i=>!i.variable));
 const desk=items.find(i=>i.kind==='receptionDesk'),chair=items.find(i=>i.kind==='chair');assert.equal(desk.x,0);assert.equal(desk.z,14.5);assert.equal(desk.rotation,0,'Desk faces the south entrance');assert(chair.z<desk.z&&chair.rotation===0,'Clerk faces the entrance from behind the desk');
 for(const key of ['width','height','depth'])assert(Math.abs(chair[key]/FURNITURE_CATALOG.chair[key]-RECEPTION_FURNITURE_SCALE)<1e-12,'Only Reception chair is 20% larger');
 assert(flatWalkable(floor,floor.spawn.x*floor.cellSize,floor.spawn.z*floor.cellSize,.5),'Player arrival clears the central desk');
 if(baseline)assert.deepEqual(items,baseline);else baseline=structuredClone(items);
 assert(floors.slice(1).every(f=>!f.furniture.some(i=>i.roomId==='Reception')),'Only ground Reception receives these props');
 for(const item of items){
  assert(furnitureCorners(item).every(([x,z])=>insidePolygon(x,z,hall.points)));
  if(item.mounted){const rear=[item.x-Math.sin(item.rotation)*item.depth/2,item.z-Math.cos(item.rotation)*item.depth/2];assert(floor.walls.some(w=>Math.abs(segmentDistance(...rear,w.a,w.b)-.10)<.012),'Wall props attach to a real partition');}
  else if(item.decorative){const support=items.find(i=>i.id===item.supportId);assert.equal(support.kind,'receptionDesk');assert(Math.abs(item.y-support.y-support.height-.008)<1e-6);assert(item.width<support.width&&item.depth<support.depth);}
  else {
   assert(!flatWalkable(floor,item.x,item.z));const s=Math.sin(item.rotation),c=Math.cos(item.rotation),actor={x:item.x+s*(item.depth/2+.8),z:item.z+c*(item.depth/2+.8),y:floor.elevation,floor:0};
   if(flatWalkable(floor,actor.x,actor.z)){moveAsylumActor(floors,actor,item.x-actor.x,item.z-actor.z);assert(Math.hypot(actor.x-item.x,actor.z-item.z)>=item.depth/2+.31);walks++;}
  }
 }
 // Entrance centreline, visitor approaches, clerk access, both window sills,
 // every room/exit and the existing stair departure remain reachable.
 for(const target of [[0,18.95],[-2,14],[2,14],[0,10],[4,14],[-5.4,11.65],[5.4,17],[-5.8,17.25],[6.1,12.5],[4.025,18.7],[-4.025,18.7]]){
  assert(flatWalkable(floor,...target,.36));assert(routeBetweenFloors(floors,{x:0,z:17.5,floor:0},{x:target[0],z:target[1],floor:0}).length,'Reception approach reachable: '+target);
 }
 for(const f of floors)for(const room of f.rooms)assert(routeBetweenFloors(floors,{x:0,z:17.5,floor:0},{x:room.label[0],z:room.label[1],floor:f.id}).length);
 for(const f of floors)for(const exit of f.exits)assert(routeBetweenFloors(floors,{x:0,z:17.5,floor:0},{...exit.inside,floor:f.id}).length);
}
// Test the audible behaviour through the actual oscillator scheduling API.
const notes=[],ctx={state:'running',currentTime:0,destination:{},createGain:()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}),createOscillator:()=>({frequency:{setValueAtTime(hz){notes.push(hz);},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){},stop(){}})};
const clock=floors[0].furniture.find(i=>i.kind==='longcaseClock'),actor={x:clock.x+1,z:clock.z,floor:0,outside:false};let enabled=true;
const audio=createReceptionClockAudio({getFloors:()=>floors,getContext:()=>ctx,enabled:()=>enabled,startSeconds:3599.5});audio.update(actor,.6);
assert.deepEqual(notes,[1250,480,720],'Hour boundary plays a tick and bell harmonics');notes.length=0;
audio.update({...actor,outside:true},1);audio.update({...actor,floor:1},1);audio.update({...actor,x:50},1);enabled=false;audio.update(actor,1);enabled=true;audio.update(actor,0);assert.deepEqual(notes,[],'Outside, upstairs, distant, muted and paused actors hear no clock');
audio.update(actor,1);assert(notes.length,'Nearby clock continues ticking');
console.log(`PASS: all six reception designs (${triangles} triangles), eight stable placements, mounted/supported contact, circulation/windows/stairs/all room and exit routes, ${walks} collision approaches, distance/floor/mute/pause-aware ticking and hourly strike.`);
