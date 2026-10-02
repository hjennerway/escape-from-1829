import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,flatWalkable,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';
import {addCentralBack} from './dist/central-back.mjs';
import {createNotebook} from './dist/notebook.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors,upper=floors[3],scene=new THREE.Scene();
assert.equal(upper.name,'Second floor');assert.equal(upper.elevation,8.4);
assert.deepEqual(upper.rooms.map(r=>r.id),['R41','R42']);
assert.deepEqual(upper.stairs.map(s=>s.id),['S1']);assert.equal(upper.exits.length,0);
assert.deepEqual(upper.rooms.map(r=>[r.windows.filter(w=>w.axis==='z').length,r.windows.filter(w=>w.axis==='diagonal').length]),[[2,1],[1,1]]);
assert.deepEqual(upper.doorways.map(d=>d.roomId),['R41','R42']);
buildAsylumArchitecture(THREE,scene,upper);scene.updateMatrixWorld(true);
assert.equal(scene.getObjectByName('Asylum Glass').count,5,'Exactly the five specified windows, without inferred extra sashes');
// Read the actual exterior sash schedule, without constructing the estate.
const model=new THREE.Group(),mesh=()=>new THREE.Object3D();
addCentralBack(THREE,{model,mesh,box:mesh,worldUV:g=>g,material:()=>null,details:{sash(){}}});
const exterior=model.userData.centralBackOpenings.filter(w=>w.y===12.5);
assert.equal(exterior.length,5);
const ray=new THREE.Raycaster();let panes=0;
for(const w of upper.windows){
 const outside=exterior.find(p=>Math.hypot(w.x-(p.x-p.nx*.065),w.z-(p.z-p.nz*.065))<1e-6);
 assert(outside,'Interior sash aligns with a circled exterior sash');assert.equal(w.width,outside.w);assert.equal(w.height,outside.h);
 const wall=upper.walls.find(p=>segmentDistance(w.x,w.z,p.a,p.b)<1e-6);assert(wall);
 const length=Math.hypot(wall.b[0]-wall.a[0],wall.b[1]-wall.a[1]),dx=(wall.b[0]-wall.a[0])/length,dz=(wall.b[1]-wall.a[1])/length;
 if(w.axis==='diagonal')assert(Math.abs(Math.abs(dx)-Math.SQRT1_2)<1e-6&&Math.abs(Math.abs(dz)-Math.SQRT1_2)<1e-6,'Corner face is 45 degrees');
 for(const u of [-w.width/3,0,w.width/3])for(let row=0;row<6;row++){
  ray.set(new THREE.Vector3(w.x+dx*u-outside.nx*.6,w.sill+w.height*(row+.5)/6,w.z+dz*u-outside.nz*.6),new THREE.Vector3(outside.nx,0,outside.nz));ray.far=.8;
  assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Asylum Glass','Each pane is open through the masonry, including angled walls');panes++;
 }
 assert(!flatWalkable(upper,w.x,w.z),'Windows remain solid to movement');
}
// The semi-open landing connects to rooms only through their framed doors.
for(const x of [-8,-6,0,2.5,7.5])assert(!flatWalkable(upper,x,11.6,.05),'Room fronts stay closed beside the two doors');
for(const z of [7.5,9,10.5])assert(!flatWalkable(upper,-8.6,z,.05),'Landing cannot erase the west room wall');
function walk(from,to){
 const actor={...from,y:floors[from.floor].elevation},route=routeBetweenFloors(floors,actor,to);assert(route.length,'A continuous route exists');
 for(const target of route){
  for(let n=0;n<400&&Math.hypot(target.x-actor.x,target.z-actor.z)>.025;n++){
   const dx=target.x-actor.x,dz=target.z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.04,d),oldY=actor.y;
   moveAsylumActor(floors,actor,dx/d*step,dz/d*step);assert(Math.abs(actor.y-oldY)<.08,'Stair height stays continuous');
  }
  assert(Math.hypot(actor.x-target.x,actor.z-target.z)<.04,JSON.stringify({target,actor}));
 }
 assert.equal(actor.floor,to.floor);assert.equal(actor.y,floors[to.floor].elevation);return actor;
}
const starts=[{x:0,z:14,floor:0},{x:0,z:14,floor:1},{x:-31.1,z:-7,floor:2}];
for(const room of upper.rooms)for(const start of starts){const end=walk(start,{x:room.label[0],z:room.label[1],floor:3});walk(end,start);}
const journal=createNotebook(floors);assert(!journal.availableViews().some(v=>v.index===3));
for(const room of upper.rooms)journal.explore({x:room.label[0],z:room.label[1],floor:3,y:8.4});
assert(journal.availableViews().some(v=>v.name==='Second floor'));assert(journal.entries.find(e=>e.id==='places:3').text.includes('R42'));
console.log(`PASS: two second-floor rooms, five exterior-aligned sashes (${panes} clear panes), 45-degree corners, closed partitions, 12 physically walked cross-floor routes and notebook discovery.`);
