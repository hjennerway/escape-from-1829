import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,moveAsylumActor,segmentDistance,stairRoute} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {furnishAsylum} from './dist/asylum-furniture.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';
import {createNotebook} from './dist/notebook.mjs';
import {WEST_RANGE_PLAN} from './dist/west-range-plan.mjs';
import {stairConnection,stairFlights} from './dist/asylum-stairs.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors,upper=floors[3],rooms=upper.rooms.filter(r=>/^R(?:46|47|48|49|50)$/.test(r.id));
assert.equal(upper.elevation,8.4,'Third storey follows the existing interior floor spacing');
assert.equal(rooms.length,5,'Library and four adjoining rooms');
assert.equal(upper.outline.loops.length,2,'Reception and west-wing upper envelopes');
assert(upper.outline.loops[1].some(([x,z])=>x===-40&&z===WEST_RANGE_PLAN.innerFrontZ),'New outline includes the current inner square return');
assert(upper.outline.loops[1].some(([x,z])=>x===-53.65&&z===WEST_RANGE_PLAN.bayFrontZ),'New outline follows the canted garden bay');
assert.equal(rooms.flatMap(r=>r.windows).length,26,'Only exposed upper west-wing windows are scheduled');
const exit=upper.exits.find(e=>e.id==='F4');assert(exit);assert.equal(exit.axis,'z');assert.equal(exit.worldZ,WEST_RANGE_PLAN.gardenZ);assert.deepEqual(exit.destination,[-63,8.5,14.3]);
assert.equal(floors[1].exits.find(e=>e.id==='F4').worldZ,21.6,'Existing first-floor interior anchor is preserved');
assert.deepEqual(plan.stairs.find(s=>s.id==='S5').connections,[[2,0],[0,1],[1,3]]);
for(const floor of [floors[1],upper])for(const z of [10,11,12.5]){
 assert(!floor.walls.some(w=>!w.exterior&&segmentDistance(-34.2,z,w.a,w.b)<.1),'West stair enclosure is removed');
}
for(const z of [10,11,12.5])assert(!floors[1].walls.some(w=>segmentDistance(-28.1,z,w.a,w.b)<.1),'Marked first-floor wall is removed');
const upperRoute=stairRoute(plan.stairs.find(s=>s.id==='S5'),4.2,8.4,1,3);
assert(upperRoute.at(-1).every((v,i)=>Math.abs(v-[-34.85,8.4,7.7][i])<1e-9),'Single upper flight arrives on the Library corridor landing');
const flights=stairFlights(stairConnection(plan.stairs.find(s=>s.id==='S5'),1,3),4.2,8.4);
assert.equal(flights.length,1,'Library access has one flight without a return landing');
assert.equal(flights[0][0][0],flights[0][1][0]);assert(flights[0][1][2]<flights[0][0][2],'Flight rises north along the blue arrow');
assert(flatWalkable(upper,-31.15,10.75),'The former upper well is filled with usable floor');
assert.equal(upper.stairs.find(s=>s.id==='S5').label[0],-34.85,'Library notebook marker follows the relocated flight');
let walks=0;
function walk(from,to){
 const actor={...from,y:floors[from.floor].elevation},route=routeBetweenFloors(floors,actor,to);assert(route.length,'Physical route exists: '+JSON.stringify({from,to}));
 for(const target of route){
  for(let n=0;n<800&&Math.hypot(target.x-actor.x,target.z-actor.z)>.025;n++){
   const dx=target.x-actor.x,dz=target.z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.04,d),oldY=actor.y;
   moveAsylumActor(floors,actor,dx/d*step,dz/d*step);assert(Math.abs(actor.y-oldY)<.08,'Stair height changes continuously');
  }
  assert(Math.hypot(target.x-actor.x,target.z-actor.z)<.04,'Walk reaches '+JSON.stringify({target,actor}));
 }
 assert.equal(actor.floor,to.floor);assert.equal(actor.y,floors[to.floor].elevation);walks++;return actor;
}
const starts=[{x:0,z:17.5,floor:0},{x:0,z:14,floor:1},{x:0,z:8.3,floor:3},{...exit.inside,floor:3}];
for(const furnished of [false,true]){
 if(furnished)furnishAsylum(floors);
 for(const room of rooms)for(const start of starts){const end=walk(start,{x:room.label[0],z:room.label[1],floor:3});walk(end,start);}
}
const library=upper.rooms.find(r=>r.id==='R46'),shelves=upper.furniture.filter(i=>i.roomId==='R46'&&i.kind==='bookcase');
assert.equal(library.name,'Library');assert(shelves.length>=6&&shelves.every(s=>s.stocked),'Library contains stocked shelves');
assert(upper.furniture.some(i=>i.roomId==='R46'&&i.kind==='table'),'Library has reading tables');
const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,upper);scene.updateMatrixWorld(true);
assert.equal(scene.getObjectByName('Asylum Glass').count,31,'Reception windows plus new Library windows');
assert.equal(scene.children.filter(m=>m.name==='Asylum floor').length,2,'Both upper envelopes have slabs');
const journal=createNotebook(floors);journal.explore({x:library.label[0],z:library.label[1],floor:3,y:8.4});
assert(journal.entries.some(e=>e.text.includes('Library')),'Library is discoverable in the notebook');
console.log(`PASS: five exterior-shaped Library rooms, 26 upper sashes, single straight S5 continuation, both F4 levels, stocked shelves/tables, notebook discovery and ${walks} furnished/unfurnished physical routes including disconnected upper wings.`);
