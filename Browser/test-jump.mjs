import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createWalker,createObstacleIndex,exteriorObstacles} from './dist/explore-controls.mjs';
import {createObstacleJump} from './dist/jump.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {createAsylumJump,asylumJumpCeiling} from './dist/asylum-jump.mjs';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {createEscapeExterior} from './dist/escape-exterior.mjs';

const box=(minX,maxX,minZ,maxZ,maxY,minY=0)=>({minX,maxX,minZ,maxZ,minY,maxY});
const low=box(-4,4,-.35,.35,1.22),tall=box(-4,4,-.35,.35,4);
function jumpAcross(obstacles,dt=1/120,speed=3.1){
 const actor={x:0,y:0,z:1.1},jump=createObstacleJump(createObstacleIndex(obstacles),{groundAt:()=>0});
 assert(jump.start(actor));assert(!jump.start(actor),'No mid-air second jump');
 let peak=0;
 for(let t=0;t<1.5;t+=dt){jump.update(actor,0,-speed*dt,dt);peak=Math.max(peak,actor.y);}
 return {actor,peak,jump};
}
for(const dt of [1/120,1/60,.1]){
 const {actor,peak}=jumpAcross([low],dt);
 assert(actor.z<-.75,'Jump clears a small wall at varied frame rates');assert.equal(actor.y,0);assert(peak>1.6&&peak<1.71);
 const blocked=jumpAcross([tall],dt);assert(blocked.actor.z>=.74,'Tall walls remain solid in mid-air');assert.equal(blocked.actor.y,0);
}
const actor={x:0,y:0,z:1.1},jump=createObstacleJump(createObstacleIndex([low]),{groundAt:()=>0});
jump.start(actor);
for(let i=0;i<120;i++)jump.update(actor,0,actor.z>0?-.05:0,1/120);
assert.equal(actor.y,1.22,'Releasing movement lands on the wall instead of inside it');
assert(!jump.airborne);assert(jump.start(actor),'Can jump again after landing on a wall');
for(let i=0;i<150;i++)jump.update(actor,0,-.04,1/120);
assert.equal(actor.y,0,'A second jump from the wall returns to the ground');
const overhead=box(-5,5,-5,5,2.4,2.1),head=jumpAcross([overhead]);
assert(head.peak<=.30001,'Low overhead geometry stops the jump');
assert.equal(head.actor.y,0,'Head impact still returns to ground');
const perched={x:0,y:0,z:1.1},stepOff=createObstacleJump(createObstacleIndex([low]),{groundAt:()=>0});stepOff.start(perched);
for(let i=0;i<120;i++)stepOff.update(perched,0,perched.z>0?-.05:0,1/120);
for(let i=0;i<100;i++)stepOff.update(perched,.06,0,1/120);
for(let i=0;i<120;i++)stepOff.update(perched,0,0,1/120);
assert.equal(perched.y,0,'Stepping off a wall settles even after releasing movement');
const unknown={minX:-4,maxX:4,minZ:-.35,maxZ:.35};assert(jumpAcross([unknown]).actor.z>=.74,'Obstacles without heights remain solid');

const camera=new THREE.PerspectiveCamera(),walk=createWalker(camera,[box(-4,4,38.65,39.35,1.22)]);
walk.keys.add('KeyW');for(let i=0;i<30;i++)walk.update(1/60);
assert(camera.position.z>39.7,'Walking alone cannot cross the wall');
assert(walk.jump());for(let i=0;i<42;i++)walk.update(1/60);
walk.keys.clear();for(let i=0;i<90;i++)walk.update(1/60);
assert(camera.position.z<38.2);assert.equal(camera.position.y,1.8,'Idle jump settles');
walk.jump();walk.update(.1);walk.reset();assert.equal(camera.position.y,1.8);assert(!walk.airborne);
walk.jump();walk.update(.1);walk.setView({position:[0,1.8,40],target:[0,1.8,30]});assert(!walk.airborne);
walk.jump();walk.update(.1);walk.setObstacles([]);assert(!walk.airborne);assert.equal(camera.position.y,1.8);

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),obstacles=exteriorObstacles(THREE,exterior.model),outside=createAsylumOutside(THREE,exterior),estateWalk=createWalker(exterior.camera,obstacles);
for(const x of [-10,45]){
 estateWalk.setView({position:[x,1.8,75.2],target:[x,1.8,70]});estateWalk.keys.add('KeyW');
 for(let i=0;i<30;i++)estateWalk.update(1/120);
 assert(exterior.camera.position.z>74.6,'Existing wall/hedge blocks ordinary walking');
 estateWalk.jump();for(let i=0;i<135;i++)estateWalk.update(1/120);
 assert(exterior.camera.position.z<73);assert.equal(exterior.camera.position.y,1.8);
 const escapeActor={x,y:0,z:75.1};outside.resetJump();assert(outside.jump(escapeActor));
 for(let i=0;i<150;i++)outside.update(escapeActor,0,-3.1/120,1/120);
 assert(escapeActor.z<73,'Escape movement clears the actual frontage wall/hedge');assert.equal(escapeActor.y,0);
}
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
for(const exit of plan.exits)for(const level of exit.levels){
 const [x,y,z]=level.destination,p={x,y,z};outside.resetJump();outside.update(p,0,0,.1);
 const base=p.y;assert(outside.jump(p),'Can jump after arriving at '+exit.id+'/'+level.floor);
 for(let i=0;i<150;i++)outside.update(p,0,0,1/120);
 assert(outside.clear(p.x,p.z,p.y),'Landing at '+exit.id+' remains clear');
 assert(Math.abs(p.y-base)<.36,'Jump returns to the same landing at '+exit.id);
}
delete globalThis.document;

const floors=buildAsylumLayout(plan).floors,indoors=createAsylumJump(floors);
for(const [floor,x,z] of [[0,0,14],[2,-34,0],[1,0,14]]){
 const p={x,z,floor,y:floors[floor].elevation,stair:null},base=p.y;
 indoors.reset();assert(indoors.start());assert(!indoors.start());let peak=base;
 for(let i=0;i<120;i++){indoors.update(p,0,0,1/120);peak=Math.max(peak,p.y);assert(p.y+1.8<=asylumJumpCeiling(floors,{...p,y:base})+.001);}
 assert(peak>base+.5);assert(Math.abs(p.y-base)<1e-9,'Interior jump lands on its own floor');assert.equal(p.floor,floor);
}
const door=floors[0].doorways[0],p={x:door.x,z:door.z,floor:0,y:0,stair:null};
indoors.reset();indoors.start();let peak=0;
for(let i=0;i<120;i++){indoors.update(p,0,0,1/120);peak=Math.max(peak,p.y);}
assert(peak<=door.height-1.8+.001,'Doorway header stops upward movement');assert.equal(p.y,0);
console.log('PASS: jump arc/frame rates, idle landing, wall-top support, tall walls, headroom, resets, actual estate walls/hedges in both modes, and interior floors/doorways.');
