import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,flatWalkable,segmentDistance} from '../../dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from '../../dist/asylum-architecture.mjs';
import {routeBetweenFloors} from '../../dist/floors.mjs';
import {addCentralBack} from '../../dist/central-back.mjs';
import {createNotebook} from './baseline-notebook.mjs';
import {furnishAsylum} from '../../dist/asylum-furniture.mjs';

const plan=JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors,upper=floors[3],receptionRooms=upper.rooms.filter(r=>r.label[0]>-18),receptionWindows=upper.windows.filter(w=>w.x>-18),scene=new THREE.Scene();
assert.equal(upper.name,'Second floor');assert.equal(upper.elevation,8.4);
assert.deepEqual(receptionRooms.map(r=>r.id),['R41','R42','R43','R44','R45']);
assert.deepEqual(upper.stairs.map(s=>s.id),['S1','S5']);assert.equal(upper.exits.length,1);
assert.deepEqual(receptionRooms.map(r=>[r.windows.filter(w=>w.axis==='z').length,r.windows.filter(w=>w.axis==='diagonal').length]),[[1,0],[1,1],[1,1],[0,0],[0,0]]);
assert.deepEqual(upper.doorways.filter(d=>d.x>-18).map(d=>d.roomId),['R41','R42','R43','R44','R45']);
assert.deepEqual(upper.doorways.filter(d=>d.x>-18).map(d=>d.width),[1.3,1.3,1.3,1.3,1.2]);
assert.deepEqual(upper.rooms.find(r=>r.id==='R41').points,[[-2,4.4],[2,4.4],[2,11.2],[-2,11.2]]);
assert.deepEqual(upper.rooms.find(r=>r.id==='R44').points,[[-8.6,13.2],[8.6,13.2],[8.6,16],[-8.6,16]]);
assert.deepEqual(upper.rooms.find(r=>r.id==='R45').points,[[-16,7],[-8.6,7],[-8.6,9.6],[-16,9.6]]);
assert.equal(upper.corridors.find(c=>c.id==='C24').width,2);
buildAsylumArchitecture(THREE,scene,upper);scene.updateMatrixWorld(true);
assert.equal(receptionWindows.length,5,'Exactly the five specified Reception windows');
// Read the actual exterior sash schedule, without constructing the estate.
const model=new THREE.Group(),mesh=()=>new THREE.Object3D();
addCentralBack(THREE,{model,mesh,box:mesh,worldUV:g=>g,material:()=>null,details:{sash(){}}});
const exterior=model.userData.centralBackOpenings.filter(w=>w.y===12.5);
assert.equal(exterior.length,5);
const ray=new THREE.Raycaster();let panes=0;
for(const w of receptionWindows){
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
// Passage and stair landing reach every room through its own framed door.
for(const x of [-8,-7,-3,-2,2,7.5])assert(!flatWalkable(upper,x,11.2,.05),'Windowed room fronts remain closed beside the three doors');
for(const z of [7.5,9,10.5])assert(!flatWalkable(upper,-8.6,z,.05),'Landing cannot erase the west room wall');
for(const x of [-7,-3,3,7])assert(!flatWalkable(upper,x,13.2,.05),'Archive retains its corridor boundary');
for(const x of [-15,-11])assert(!flatWalkable(upper,x,9.6,.05),'Stair clearance cannot erase the linen-store wall');
for(const [x,z] of [[-9.45,10.25],[-9.45,12.2],[-7,12.2],[0,12.2],[7,12.2]])assert(flatWalkable(upper,x,z),'Stair departure and passage remain unobstructed');
const labels=scene.getObjectByName('Asylum RoomDoorLabels');assert(labels);
assert.deepEqual([...new Set(labels.userData.labels.filter(l=>l.x>-18).map(l=>l.text))],['201 Records office','202 Staff office','203 Staff sitting room','204 Archive & stores','205 Linen store']);
assert.equal(labels.userData.labels.length,upper.roomDoors.length*2,'All second-floor numbers and retained Reception names appear on both leaf faces');
for(const label of labels.userData.labels){
 const door=upper.roomDoors.find(d=>d.roomId===label.roomId),nx=Math.sin(door.rotation)*label.face,nz=Math.cos(door.rotation)*label.face;
 ray.set(new THREE.Vector3(label.x+nx*.12,label.y,label.z+nz*.12),new THREE.Vector3(-nx,0,-nz));ray.far=.14;
 assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Asylum RoomDoorLabels','Nameplate is visible on the actual open door');
}
for(const floor of floors.slice(0,3)){
 const lower=new THREE.Scene();buildAsylumArchitecture(THREE,lower,floor);
 assert.equal(lower.getObjectByName('Asylum RoomDoorLabels').userData.labels.length,floor.roomDoors.length*2,'Every lower-floor room door has a two-sided number');
}
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
for(const room of receptionRooms)for(const start of starts){const end=walk(start,{x:room.label[0],z:room.label[1],floor:3});walk(end,start);}
const journal=createNotebook(floors);assert(!journal.availableViews().some(v=>v.index===3));
for(const room of receptionRooms)journal.explore({x:room.label[0],z:room.label[1],floor:3,y:8.4});
assert(journal.availableViews().some(v=>v.name==='Second floor'));assert(journal.entries.find(e=>e.id==='places:3').text.includes('R42'));
furnishAsylum(floors);
for(const room of receptionRooms){
 assert(flatWalkable(upper,...room.label),'Furnished room centre remains accessible');
 const items=upper.furniture.filter(i=>i.roomId===room.id);
 assert(items.length,'Every room has appropriate furnishings');
 if(['R41','R42'].includes(room.id))assert(items.some(i=>i.kind==='table')&&items.some(i=>i.kind==='chair'),'Working offices retain desks and seating');
 const end=walk({x:0,z:17.5,floor:0},{x:room.label[0],z:room.label[1],floor:3});walk(end,{x:0,z:17.5,floor:0});
}
console.log(`PASS: five second-floor rooms, five exterior-aligned sashes (${panes} clear panes), retained stairs/45-degree corners, compact passage, closed stores, five two-sided door names, 40 physically walked furnished/unfurnished cross-floor routes and notebook discovery.`);
