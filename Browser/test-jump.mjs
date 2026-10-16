import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createWalker,createObstacleIndex,exteriorObstacles} from './dist/explore-controls.mjs';
import {createObstacleJump} from './dist/jump.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {createAsylumJump,asylumJumpCeiling} from './dist/asylum-jump.mjs';
import {buildAsylumLayout,flatWalkable,stairRoute,stairDeparture} from './dist/asylum-layout.mjs';
import {stairConnection,stairFlights,RAIL_HEIGHT} from './dist/asylum-stairs.mjs';
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
let railCrossings=0;
for(const stair of plan.stairs)for(const [lower,upper] of stair.connections)for(const dt of [1/120,1/60,.1]){
 const lo=floors[lower].elevation,hi=floors[upper].elevation,c=stairConnection(stair,lower,upper);
 const [a,b]=stairFlights(c,lo,hi).at(-1),x=a[0]+1.35,z=(a[2]+b[2])/2;
 const p={x,z,y:hi,floor:upper,stair:null},jump=createAsylumJump(floors);
 assert(flatWalkable(floors[upper],x,z),'Railing approach is on a real walkable floor');
 for(let t=0;t<1;t+=dt)jump.update(p,-3.1*dt,0,dt);
 assert(p.x>a[0]+.65,'Walking cannot cross the landing rail');
 assert(jump.start());let previous=p.y;
 for(let t=0;t<3;t+=dt){
  jump.update(p,-Math.min(3.1*dt,Math.max(0,p.x-a[0])),0,dt);
  assert(Math.abs(p.y-previous)<18*dt,'Crossing the rim never snaps down to a flight');previous=p.y;
  if(p.x<a[0]+.25&&jump.airborne)assert.equal(p.stair?.id,stair.id,'Airborne stair metadata keeps lighting continuous before landing');
 }
 assert(Math.abs(p.x-a[0])<1e-8,`${stair.id}/${lower}-${upper}: jump crosses the landing rail at ${dt}`);
 assert(Math.abs(p.y-(a[1]+b[1])/2)<1e-8,'Idle landing finds the flight below the rim');
 assert.equal(p.stair?.id,stair.id);assert.equal(p.floor,lower);assert(!jump.airborne);
 // A landed player can still climb out using the ordinary stair mouth.
 const route=stairRoute(stair,lo,hi,lower,upper),departure=stairDeparture(floors[upper],route.at(-1));
 for(const target of [b,route.at(-1),[departure.x,hi,departure.z]]){
  for(let n=0;n<800&&Math.hypot(target[0]-p.x,target[2]-p.z)>.01;n++){
   const dx=target[0]-p.x,dz=target[2]-p.z,d=Math.hypot(dx,dz),step=Math.min(.04,d);jump.update(p,dx/d*step,dz/d*step,1/120);
  }
  assert(Math.hypot(target[0]-p.x,target[2]-p.z)<.02,`Can keep walking after landing on ${stair.id}/${lower}-${upper}: ${JSON.stringify({target,p})}`);
 }
 assert.equal(p.floor,upper);assert.equal(p.stair,null);assert(Math.abs(p.y-hi)<1e-8);
 // Near the top, the same jump also clears the rail from flight to floor.
 const t=.93,flight={id:stair.id,lower,upper,route};
 Object.assign(p,{x:a[0],z:a[2]+(b[2]-a[2])*t,y:a[1]+(b[1]-a[1])*t,floor:lower,stair:flight});jump.reset();
 assert(jump.start());
 for(let time=0;time<2;time+=dt)jump.update(p,Math.min(3.1*dt,Math.max(0,x-p.x)),0,dt);
 assert(Math.abs(p.x-x)<1e-8,`${stair.id}: jump back onto the upper floor`);assert(Math.abs(p.y-hi)<1e-8);assert(!jump.airborne);
 railCrossings+=2;
}
// Stop directly over a rim, then step off into the stairwell. A rail is a
// support, never a place to sink through or become trapped after releasing W.
{
 const p={x:35.2,z:-29.8,y:4.2,floor:1,stair:null},jump=createAsylumJump(floors);
 jump.start();for(let i=0;i<240;i++)jump.update(p,-Math.min(3.1/120,Math.max(0,p.x-34.5)),0,1/120);
 assert(Math.abs(p.y-(4.2+RAIL_HEIGHT+.035))<1e-8);assert(!jump.airborne);
 for(let i=0;i<300;i++)jump.update(p,-Math.min(3.1/120,Math.max(0,p.x-33.85)),0,1/120);
 assert(Math.abs(p.y-3.15)<1e-8);assert.equal(p.stair?.id,'S4');assert(!jump.airborne);
}
// Full-height masonry and a denied runtime crossing remain solid in the air.
for(const locked of [false,true]){
 const p={x:33.85,z:-29.8,y:3.15,floor:0,stair:null},start={...p};
 const jump=createAsylumJump(floors,{allowMove:(_from,to)=>!locked||to.x<=34});jump.start();
 for(let i=0;i<180;i++)jump.update(p,(locked?1:-1)*3.1/120,0,1/120);
 assert(locked?p.x<=34:p.x>33.5-.001,'Jumping preserves runtime barriers and the solid central stair enclosure');
 assert(p.y>=start.y-.001);
}
console.log(`PASS: jump arc/frame rates, idle landing, wall-top support, tall walls, headroom, resets, estate walls/hedges, interior floors/doorways, ${railCrossings} stair rail crossings, perched rails, continued stair walks and solid well/runtime barriers.`);
