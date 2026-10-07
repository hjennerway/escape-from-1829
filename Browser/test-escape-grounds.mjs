import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeGrounds} from './dist/escape-grounds.mjs';
import {createGroundsGuard,crossedGroundsExit,GROUNDS_GATES,GROUNDS_OUTLINE} from './dist/escape-grounds-state.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {outdoorPath} from './dist/escape-world.mjs';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});globalThis.document={createElement:()=>({getContext:()=>context})};
const model=new THREE.Group(),exterior={model,invalidateShadows(){}},walker=createAsylumOutside(THREE,exterior),run={};
const notes=[],sounds=[],creaks=[];const world=createEscapeGrounds(THREE,exterior,walker,{run,recordGrounds:(...n)=>notes.push(n)},{noise:(...n)=>sounds.push(n),creak:n=>creaks.push(n)});
// Exercise partial poses, reversal, closing from inside and a blocked swing.
for(const d of world.workshops.roomDoors){
 const node=world.nodes.find(n=>n.id===d.id),actor={outside:true,x:node.x-d.side,z:node.z,y:0};
 assert.equal(world.near(actor)?.id,node.id);world.use(node);
 assert.equal(d.pivot.rotation.y,0,'Use begins an animation');world.update(.3,actor);
 const partial=d.pivot.rotation.y;assert(Math.abs(partial)>0&&Math.abs(partial)<Math.PI/2);
 const b=world.workshops.roomDoorObstacles()[world.workshops.roomDoors.indexOf(d)];assert.equal(b.corners.length,4,'Collision uses the rotated leaf');
 world.use(node);assert.equal(d.pivot.rotation.y,partial,'Reversal retains current pose');world.update(1,actor);
 assert.equal(d.pivot.rotation.y,0);assert(!walker.clear(node.x,node.z),'Closed leaf blocks its opening');
 world.use(node);world.update(1,actor);assert(walker.clear(node.x,node.z));
 assert.equal(world.near({...actor,x:node.x+d.side})?.id,node.id,'Can close from inside');assert.equal(world.action(node),'CLOSE');
 world.use(node);const doorway={outside:true,x:node.x,z:node.z,y:0};
 for(let i=0;i<30;i++)world.update(.04,doorway);
 assert(Math.abs(d.pivot.rotation.y)>.05,'Door waits instead of closing through the player');const waiting=d.pivot.rotation.y;
 world.update(.2,doorway);assert.equal(d.pivot.rotation.y,waiting);world.update(1,actor);assert.equal(d.pivot.rotation.y,0,'Swing resumes when player steps clear');
}
assert.equal(creaks.length,12,'Each opening, closing and reversal creaks once');assert(creaks.some(n=>n.opening)&&creaks.some(n=>!n.opening));
// Every boundary sample is blocked in an empty scene, including attempted jumps.
for(let i=0;i<GROUNDS_OUTLINE.length;i++){
 const a=GROUNDS_OUTLINE[i],b=GROUNDS_OUTLINE[(i+1)%GROUNDS_OUTLINE.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);
 for(let s=0;s<=d;s+=.1){const x=a[0]+(b[0]-a[0])*s/d,z=a[1]+(b[1]-a[1])*s/d;assert(!walker.clear(x,z),'Perimeter hole '+x+','+z);assert(!walker.clear(x,z,1.69),'Jump bypass '+x+','+z);}
}
assert(!outdoorPath(walker,{x:-80,z:-80},{x:-80,z:-90}).length,'Cannot route around the closed perimeter');
const gate=world.nodes.find(n=>n.id==='pedestrian');world.use(gate);assert(run.pedestrianOpen);assert.equal(sounds.length,1);
assert(walker.clear(gate.x,gate.z));assert(walker.clearSight(-75,-85),'Iron railings permit sight');
assert(outdoorPath(walker,{x:-80,z:-80},{x:-80,z:-90}).length);
const before={outside:true,x:-80,z:-84},after={outside:true,x:-80,z:-86};assert.equal(crossedGroundsExit(before,after,run),'pedestrian');
assert.equal(crossedGroundsExit({...before,x:0},{...after,x:0},run),null);
assert.equal(crossedGroundsExit({...before,outside:false},after,run),null);
const wicket=world.nodes.find(n=>n.id==='wicket');world.workOn(wicket,true,10);assert(!run.wicketOpen,'No crowbar, no opening');
world.use(world.nodes.find(n=>n.id==='crowbar'));world.workOn(wicket,true,1);world.workOn(wicket,false,.1);assert.equal(world.work,0,'Releasing use abandons partial work');
for(let i=0;i<76;i++)world.workOn(wicket,true,.04);assert(run.wicketOpen);assert(walker.clear(wicket.x,wicket.z));
run.pedestrianOpen=false;run.oil=true;world.sync();const heard=sounds.length;world.use(gate);assert.equal(sounds.length,heard,'Oil removes gate noise');
const revision=walker.revision;walker.refresh();assert(walker.revision>revision);assert(!walker.clear(-98,0),'Tree refresh retains scenario collisions');
world.dispose();assert(walker.clear(-98,0));assert.equal(model.children.length,0);
// Deterministic behaviour checks: hearing, facing, stale knowledge, searching,
// unreachable destinations and returning; these do not need a graphics device.
const actor={x:0,z:0,y:0,heading:0},navigation={revision:0,update(a,dx,dz){a.x+=dx;a.z+=dz;}};
let reachable=true,sight=true;const guard=createGroundsGuard({actor,walker:navigation,route:(_,a,b)=>reachable?[{...b}]:[],sight:()=>sight,patrol:[{x:0,z:10},{x:0,z:0}]});
assert(!guard.hear({x:100,z:100},20));assert(guard.hear({x:6,z:0},20));
const hidden={x:200,z:200};for(let i=0;i<100;i++)guard.update(hidden,.04);assert.equal(guard.mode,'search');
for(let i=0;i<200;i++)guard.update(hidden,.04);assert(['return','patrol'].includes(guard.mode));
guard.reset();Object.assign(actor,{x:0,z:0,heading:0});guard.update({x:0,z:-10},.01);assert.notEqual(guard.mode,'chase','Cannot see behind itself');
guard.update({x:0,z:10},.01);assert.equal(guard.mode,'chase');assert(!guard.hear({x:5,z:0},20),'Visible pursuit takes priority');
sight=false;guard.update({x:20,z:20},.04);assert.deepEqual(guard.target,{x:0,z:10},'Unseen motion does not update knowledge');
for(let i=0;i<140;i++)guard.update(hidden,.04);assert.notEqual(guard.mode,'chase');
guard.reset();reachable=false;guard.hear({x:5,z:0},30);guard.update(hidden,.04);assert.equal(guard.mode,'search');
for(let i=0;i<250;i++)guard.update(hidden,.04);assert.notEqual(guard.mode,'investigate','Unreachable sound cannot wedge the guard');
console.log('Escape grounds: continuous physical boundary, both routes, tools, noise, refresh/disposal and guard behaviour pass.');
