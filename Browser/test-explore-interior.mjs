import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createExploreWalker} from './dist/explore-walker.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {buildAsylumLayout,stairRoute,stairDeparture} from './dist/asylum-layout.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors,exterior=createEscapeExterior(THREE,16/9);
const layouts=createAerialLayouts(THREE,exterior);
const walker=createExploreWalker(THREE,exterior,floors),actor=walker.actor;
for(const floor of floors)for(const exit of floor.exits){
 const [x,y,z]=exit.destination;walker.setView({position:[x,y+1.8,z],target:[x,y+1.8,z-1]});
 assert.equal(walker.nearbyDoor()?.id,exit.id);walker.keys.add('KeyE');walker.update(.01);
 assert(!actor.outside);assert.equal(actor.floor,floor.id);walker.update(.01);assert(!actor.outside,'Held E cannot bounce across a door');
 walker.keys.delete('KeyE');walker.update(.01);walker.keys.add('KeyE');walker.update(.01);assert(actor.outside);assert.deepEqual([actor.x,actor.y,actor.z],exit.destination);
}
function follow(points){
 walker.keys.clear();
 for(const [x,z] of points){
  for(let i=0;i<3000&&Math.hypot(actor.x-x,actor.z-z)>.025;i++){
   const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),desired=Math.atan2(-dx,-dz);
   walker.look((exterior.camera.rotation.y-desired)/.002,0);walker.keys.add('KeyW');walker.update(Math.min(.01,d/5));
  }
  assert(Math.hypot(actor.x-x,actor.z-z)<.04,'Walk reaches '+JSON.stringify({target:[x,z],actor}));
 }
 walker.keys.clear();
}
let stairCount=0;
for(const stair of plan.stairs)for(const [lower,upper] of stair.connections){
 const route=stairRoute(stair,floors[lower].elevation,floors[upper].elevation),start=route[0],end=route.at(-1);
 Object.assign(actor,{x:start[0],y:start[1],z:start[2]-.1,floor:lower,outside:false,stair:null});
 const upperDeparture=stairDeparture(floors[upper],end),lowerDeparture=stairDeparture(floors[lower],start);
 follow(route.map(p=>[p[0],p[2]]).concat([[upperDeparture.x,upperDeparture.z]]));assert.equal(actor.floor,upper);
 follow([...route].reverse().map(p=>[p[0],p[2]]).concat([[lowerDeparture.x,lowerDeparture.z]]));assert.equal(actor.floor,lower);stairCount++;
}
// Split front entrance: both branches reach Reception and return to the lawn.
for(const side of [-1,1]){
 walker.reset();const route=[[0,28],[0,24.8],[side*3.3,24.8],[side*3.3,21.7],[0,21.7]];
 follow(route);assert(actor.y>1.7);assert.equal(walker.nearbyDoor()?.id,'D1');
 follow([...route].reverse().concat([[0,29]]));assert(actor.y<.4);
}
// These pharmacy stairs and both annexe stairs have no enterable interior.
for(const {x,z} of layouts.towerBuildings.userData.pharmacy.stairs){
 walker.setView({position:[x-5.2,1.8,z-1.125],target:[x,1.8,z-1.125]});
 follow([[x,z-1.125]]);assert(actor.y>1.1);assert.equal(walker.nearbyDoor(),null);
 follow([[x-5.2,z-1.125]]);assert(actor.y<.4);
}
let annexeStairs=0;
exterior.model.traverse(group=>{
 const treads=group.children.filter(o=>o.name==='Blue external stair tread');if(!treads.length)return;
 const route=treads.map(o=>new THREE.Box3().setFromObject(o)).sort((a,b)=>a.max.y-b.max.y).map(b=>[(b.min.x+b.max.x)/2,b.max.y,(b.min.z+b.max.z)/2]);
 const a=route[0],b=route[1],length=Math.hypot(b[0]-a[0],b[2]-a[2]);
 const start=[a[0]-(b[0]-a[0])/length,a[2]-(b[2]-a[2])/length];
 walker.setView({position:[start[0],1.8,start[1]],target:[a[0],1.8,a[2]]});
 const points=route.map(p=>[p[0],p[2]]);follow(points);assert(actor.y>=route.at(-1)[1]-.02&&actor.y<=route.at(-1)[1]+.48,JSON.stringify({actor,top:route.at(-1)}));assert.equal(walker.nearbyDoor(),null);
 const landing=group.children.find(o=>o.name==='Fire stair landing'),box=new THREE.Box3().setFromObject(landing),center=box.getCenter(new THREE.Vector3());
 const stairTurn=group.localToWorld(new THREE.Vector3(treads[0].position.x,5.125,-4));
 follow([[stairTurn.x,stairTurn.z],[center.x,center.z]]);assert(Math.abs(actor.y-box.max.y)<.02);
 // Walk around the open stairwell to the tower door on both mirrored sides.
 const turn=group.localToWorld(new THREE.Vector3(-29.78,5.125,-4)),door=group.localToWorld(new THREE.Vector3(-29.78,5.125,-.2));
 follow([[turn.x,turn.z],[door.x,door.z],[turn.x,turn.z],[center.x,center.z]]);
 follow([[stairTurn.x,stairTurn.z],...points.slice().reverse(),start]);assert(actor.y<.4);annexeStairs++;
});
assert.equal(annexeStairs,2);
let entranceStairs=0;
exterior.model.traverse(group=>{
 const steps=group.children.filter(o=>o.name==='Entrance step');if(!steps.length)return;
 const route=steps.map(o=>new THREE.Box3().setFromObject(o)).sort((a,b)=>a.max.y-b.max.y).map(b=>[(b.min.x+b.max.x)/2,b.max.y,(b.min.z+b.max.z)/2]);
 const a=route[0],b=route[1],length=Math.hypot(b[0]-a[0],b[2]-a[2]),start=[a[0]-(b[0]-a[0])/length*1.5,a[2]-(b[2]-a[2])/length*1.5];
 walker.setView({position:[start[0],1.8,start[1]],target:[a[0],1.8,a[2]]});follow(route.map(p=>[p[0],p[2]]));
 assert(Math.abs(actor.y-route.at(-1)[1])<.02);follow([...route].reverse().map(p=>[p[0],p[2]]).concat([start]));assert(actor.y<.4);entranceStairs++;
});
assert.equal(entranceStairs,2,'Both main/admin and annexe entrance steps are covered');
walker.reset();walker.keys.add('KeyS');for(let i=0;i<80;i++)walker.update(.1);assert(actor.z>75,'Exploration never triggers an escape ending');
assert(walker.jump());walker.update(.1);assert(actor.y>.1);walker.reset();assert.equal(actor.y,0);
console.log(`PASS: 23 door round trips, E release latch, ${stairCount} interior connections both ways, both entrance branches, pharmacy steps, both annexe fire stairs without doors, free roaming and jumps.`);
