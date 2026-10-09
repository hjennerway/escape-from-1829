import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,segmentDistance} from './dist/asylum-layout.mjs';
import {buildCorridorCrossings,createCorridorSightings,SIGHTING_DISTANCE} from './dist/corridor-sightings.mjs';
import {createCorridorFigure} from './dist/corridor-figure.mjs';

const rig=createCorridorFigure(THREE),ankles=[];rig.model.traverse(o=>{if(o.name==='Ankle')ankles.push(o);});
const world=new THREE.Vector3();
for(let i=0;i<100;i++){
 rig.pose(i/100);rig.model.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(rig.model);
 assert(box.min.y>=-.001&&box.max.y<1.95,'Human-sized running silhouette stays above the floor');
 for(const ankle of ankles){ankle.getWorldPosition(world);assert(world.y>=.09-1e-6,'Jointed shoes never cut through the floor');}
}
rig.dispose();

const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
const routes=buildCorridorCrossings(floors);
assert(routes.some(r=>r.floor===0)&&routes.some(r=>r.floor===1),'Ground and first-floor junctions support sightings');
for(const route of routes)for(let i=0;i<=100;i++){
 const t=i/100,x=route.a[0]+(route.b[0]-route.a[0])*t,z=route.a[1]+(route.b[1]-route.a[1])*t;
 assert(flatWalkable(floors[route.floor],x,z,.28),'Complete crossings clear walls, stairs and doors');
}
function setup({floor=0,x=35.8,z=-18,lookX=46,lookZ=8.2,ready=true,random=()=>0}={}){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(74,1.5,.05,150);
 const actor={x,z,floor,y:floors[floor].elevation,outside:false,stair:null};
 camera.position.set(x,actor.y+1.65,z);camera.lookAt(lookX,actor.y+1.35,lookZ);camera.updateMatrixWorld(true);
 const sightings=createCorridorSightings(THREE,scene,floors,{random,isReady:()=>ready});
 const figure=scene.getObjectByName('Distant corridor silhouette');
 return {scene,camera,actor,sightings,figure,step:(dt=.1)=>sightings.update(actor,camera,dt)};
}
function awaitSighting(test,seconds=240){for(let t=0;t<seconds&&!test.sightings.active;t+=.1)test.step();return test.sightings.active;}
const test=setup();
for(let i=0;i<440;i++)test.step();assert(!test.sightings.active,'No sighting in first 44 seconds');
assert(awaitSighting(test),'A distant, oblique view of the real east junction admits a crossing');
const start=test.figure.position.clone();
test.step(.3);assert(test.figure.position.distanceTo(start)>2,'Figure darts across at least two metres in .3 seconds');
assert(Math.hypot(test.actor.x-test.figure.position.x,test.actor.z-test.figure.position.z)>=SIGHTING_DISTANCE.min);
const destination=test.figure.position.clone();
test.actor.x+=.4;test.step(.1);
assert.equal(test.figure.position.z,destination.z,'Player movement never changes its fixed crossing route');
test.step(.5);assert(!test.sightings.active&&!test.figure.visible,'Entire crossing finishes within one second');
for(let i=0;i<840;i++)test.step();assert(!test.sightings.active,'No immediate repeat');
assert(awaitSighting(test),'Revisiting the same junction can produce another sighting after the long cooldown');

const blocked=setup(),wall={a:[34.6,-3],b:[37,-3]};floors[0].walls.push(wall);
assert(!awaitSighting(blocked),'An intervening corridor wall blocks a sighting');floors[0].walls.pop();
assert(awaitSighting(blocked),'Removing the intervening wall restores the sightline');

for(const [label,options,change] of [
 ['nearby',{z:0},()=>{}],['too distant',{z:-34.2},()=>{}],['directly watched',{lookX:35.8},()=>{}],
 ['behind player',{lookX:35.8,lookZ:-40},()=>{}],['unloaded rooms',{ready:false},()=>{}],
 ['outside',{},t=>t.actor.outside=true],['stairs',{},t=>t.actor.stair={}],
 ['through walls',{x:20,z:-18},()=>{}]
]){
 const t=setup(options);change(t);assert(!awaitSighting(t),`No sighting ${label}`);t.sightings.dispose();
}
for(const [label,change] of [
 ['pause',t=>t.step(0)],['tab/frame stall',t=>t.step(3)],['outdoors',t=>{t.actor.outside=true;t.step();}],
 ['floor change',t=>{t.actor.floor=1;t.step();}],['approach',t=>{t.actor.z=0;t.step();}]
]){
 const t=setup();assert(awaitSighting(t));change(t);assert(!t.sightings.active&&!t.figure.visible,`${label} removes figure immediately`);
 t.sightings.reset();assert(!t.figure.visible);t.sightings.dispose();assert.equal(t.scene.children.length,0);
}
const upper=setup({floor:1});assert(awaitSighting(upper));assert.equal(upper.figure.position.y,4.2);
// Pause time must not advance the initial wait, including repeated menu draws.
const paused=setup();for(let i=0;i<1000;i++)paused.step(0);paused.step(.1);assert(!paused.sightings.active);
assert(routes.every(r=>segmentDistance(35.8,-18,r.a,r.b)>0));
console.log('PASS: actual corridor routes, distant peripheral sightings, fast fixed crossing, cooldown, occlusion, floor/loading gates, pause and proximity cancellation.');
