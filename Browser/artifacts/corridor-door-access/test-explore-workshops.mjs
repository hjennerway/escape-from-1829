import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {createExploreWalker} from './dist/explore-walker.mjs';
import {createExploreWorkshops} from './dist/explore-workshops.mjs';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {EXPLORE_CORRIDOR_ENTRANCE,EXPLORE_CORRIDOR_RUNS} from './dist/explore-corridor-plan.mjs';
import {ESCAPE_CORRIDOR_DOORS} from './dist/escape-corridor-plan.mjs';
import {ADMIN_FRONT_CORRIDOR} from './dist/admin-front-corridor.mjs';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior),timeline=prepareEstateTimeline(THREE,exterior,layouts);
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
let controller;const walker=createExploreWalker(THREE,exterior,floors,{doorInteractions:{nearbyDoor:actor=>controller?.nearbyDoor(actor),useDoor:door=>controller.useDoor(door)}});
controller=createExploreWorkshops(THREE,exterior,walker,timeline);controller.refresh();
const actor=walker.actor,w=controller.workshops,[cx,frontZ]=EXPLORE_CORRIDOR_ENTRANCE.point;
function pose(x,z,tx=x,tz=z-1){walker.setView({position:[x,1.8,z],target:[tx,1.8,tz]});}
function step(dt=.04){walker.update(dt);controller.update(dt,actor);}
function press(){walker.keys.add('KeyE');step();walker.keys.delete('KeyE');step();}
function settle(){for(let i=0;i<30;i++)step();}
function follow(points){
 for(const [x,z] of points){
  for(let i=0;i<5000&&Math.hypot(actor.x-x,actor.z-z)>.025;i++){
   const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),yaw=Math.atan2(-dx,-dz);
   walker.look((exterior.camera.rotation.y-yaw)/.002,0);walker.keys.add('KeyW');step(Math.min(.04,d/5));
  }
  walker.keys.clear();assert(Math.hypot(actor.x-x,actor.z-z)<.04,'Physical walk reaches '+JSON.stringify({target:[x,z],actor}));
 }
}
assert.equal(w.doors.length,5);assert.equal(w.lockedDoors.length,8);
assert(ESCAPE_CORRIDOR_DOORS.some(d=>d.id==='corridor-lock:gallery:0'),'Escape retains its stopping doors');
assert(!w.lockedDoors.some(d=>d.id==='corridor-lock:gallery:0'));
assert(walker.outside.clear(cx,24.4),'Old admin stopping line is open');
// The extended doorway has a closed facade all the way to its sloping roof.
const meshes=[];w.group.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
const left=w.group.userData.gallery.minX,right=ADMIN_FRONT_CORRIDOR.adminWallX,ridge=ADMIN_FRONT_CORRIDOR.x;
const roofY=x=>w.group.userData.gallery.height+.06+ADMIN_FRONT_CORRIDOR.rise-ADMIN_FRONT_CORRIDOR.rise*Math.abs(x-ridge)/(x<ridge?ridge-left+.22:ADMIN_FRONT_CORRIDOR.width/2+.22);
for(let x=left+.05;x<right-.05;x+=.15){
 for(const y of [4.1,roofY(x)-.02]){
  const ray=new THREE.Raycaster(new THREE.Vector3(x,y,frontZ+1),new THREE.Vector3(0,0,-1),0,1.2);
  assert(ray.intersectObjects(meshes,false).length,'Closed entrance gable at '+JSON.stringify({x,y}));
 }
 const ray=new THREE.Raycaster(new THREE.Vector3(x,7,frontZ-1),new THREE.Vector3(0,-1,0),0,3);
 const hit=ray.intersectObjects(meshes,false)[0];assert(hit&&Math.abs(hit.point.y-roofY(x))<1e-4,'Continuous entrance roof at '+x);
}
pose(cx,frontZ+1.5);assert.equal(walker.nearbyDoor()?.id,'admin-corridor-door');
assert(!walker.outside.clear(cx,frontZ),'Closed entrance blocks walking');
press();const entrance=w.doors.find(d=>d.id==='admin-corridor-door');
assert(entrance.pivot.rotation.y>0&&entrance.pivot.rotation.y<.1,'Opening starts with a partial swing');settle();
assert.equal(entrance.pivot.rotation.y,Math.PI/2);assert(actor.outside,'Corridors share the grounds scene');
follow([[cx,frontZ-1.5],[cx,24.4],[cx,9.8],[cx,-44.75]]);
for(const run of EXPLORE_CORRIDOR_RUNS){
 const dx=run.end[0]-run.start[0],dz=run.end[1]-run.start[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length;
 const start=[run.start[0]+ux*2,run.start[1]+uz*2],end=[run.end[0]-ux*2,run.end[1]-uz*2];
 pose(...start,...end);follow([end,start]);
}
for(const door of w.doors){
 const side=door.id==='admin-corridor-door'?null:door.side;
 if(side===null)pose(cx,frontZ+1.5);else pose(door.x-side*1.3,door.z,door.x,door.z);
 if(w.isOpen(door.id)){press();settle();}
 assert.equal(walker.nearbyDoor()?.id,door.id);assert(!walker.outside.clear(door.x,door.z));
 walker.keys.add('KeyE');for(let i=0;i<30;i++)step();walker.keys.delete('KeyE');step();
 assert(w.isOpen(door.id),'Held E opens once');assert(walker.outside.clear(door.x,door.z),'Open doorway is clear');
 if(side!==null)follow([[door.x,door.z],[door.x+side*1.3,door.z]]);
}
// A closing leaf waits for the player, then finishes once the sweep is clear.
pose(cx,frontZ);w.setDoorOpen(entrance.id,false);settle();assert(entrance.pivot.rotation.y>0);
pose(cx,frontZ+1.5);settle();assert.equal(entrance.pivot.rotation.y,0);
controller.refresh();assert(controller.workshops.isOpen('tower-door'),'Visibility refresh retains door state');
for(const year of [1829,2010,1916]){
 timeline.setPeriod(year);controller.refresh();assert.equal(!!controller.workshops,year===1916);
 if(year===1916){assert(walker.outside.clear(cx,24.4));assert(!walker.outside.clear(cx,frontZ));}
}
// The original asylum entrances still switch to the interior and back.
const exit=floors[0].exits.find(e=>e.id==='D1');const [x,y,z]=exit.destination;
walker.setView({position:[x,y+1.8,z],target:[x,y+1.8,z-1]});press();assert(!actor.outside);press();assert(actor.outside);
console.log('PASS: Explore corridor entry, eight physical routes, five animated doors, held E, swept collisions, timeline/tree refresh and original asylum entry.');
