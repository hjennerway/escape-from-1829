import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {batchAerialMeshes} from './dist/aerial-performance.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
const timeline=prepareEstateTimeline(THREE,exterior,layouts);timeline.setPeriod(1916);
const walker=createAsylumOutside(THREE,exterior);
// A wall-side landing must not acquire a railing across its door leaf.
const doorRay=new THREE.Raycaster(new THREE.Vector3(8.9,5.8,-36.3),new THREE.Vector3(-1,0,0),0,1.1);
const visibleGuards=[];exterior.model.traverseVisible(o=>{if(o.userData.stairGuard)visibleGuards.push(o);});
assert.equal(doorRay.intersectObjects(visibleGuards).length,0,'Central landing door remains open to its platform');
function follow(actor,points){
 for(const [x,z] of points){
  for(let i=0;i<2000&&Math.hypot(actor.x-x,actor.z-z)>.025;i++){
   const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz);walker.update(actor,dx/d*.025,dz/d*.025,.01);
  }
  assert(Math.hypot(actor.x-x,actor.z-z)<.04,'Guarded route remains open '+JSON.stringify({target:[x,z],actor}));
 }
}
// Include the upper flights and the remote rear return, beyond the seven
// first-floor exit routes covered by test-asylum-outside.
for(const [name,start,points,top] of [
 ['West garden',{x:-61.3,y:.3,z:20.5},[[-61.3,26.05],[-62.55,26.05],[-62.55,22.1],[-62.55,21],[-63.4,21]],8.5],
 ['East court',{x:66.6,y:.3,z:1.7},[[72.4,1.7],[72.4,3],[68.75,3],[67.5,3],[67.5,4]],8.5],
 ['Rear return',{x:67,y:.25,z:-30.1},[[63.3,-30.1],[63.3,-31.75],[66.4,-31.75]],4.25]
]){
 const actor={...start};follow(actor,points);assert(actor.y>top-.15,name+' reaches its highest landing');
 follow(actor,[...points].reverse().slice(1).concat([[start.x,start.z]]));assert(actor.y<.7,name+' returns to the ground');
}
// Try walking directly through every authored guard from each supported side.
// Actual feet support and body clearance select valid probes, including the
// mirrored and scaled stairs. No teleport or synthetic collision is used.
function probeGuards(){
 let guards=0,probes=0,pharmacyProbes=0,annexeProbes=0;
 exterior.model.traverseVisible(o=>{
  const g=o.userData.stairGuard;if(!g)return;guards++;
  const a=new THREE.Vector3(...g.a).applyMatrix4(o.matrixWorld),b=new THREE.Vector3(...g.b).applyMatrix4(o.matrixWorld);
  const length=Math.hypot(b.x-a.x,b.z-a.z);if(length<.3)return;
  const nx=(b.z-a.z)/length,nz=-(b.x-a.x)/length;
  for(const t of [.2,.5,.8])for(const side of [-1,1]){
   const p=a.clone().lerp(b,t),x=p.x+nx*.38*side,z=p.z+nz*.38*side,y=walker.heightAt(x,z,p.y);
   if(Math.abs(y-p.y)>.35||!walker.clear(x,z,y))continue;
   const actor={x,y,z};
   for(let i=0;i<35;i++)walker.update(actor,-nx*.04*side,-nz*.04*side,.016);
   assert(((actor.x-p.x)*nx+(actor.z-p.z)*nz)*side>.1,'Cannot walk through '+o.name+' '+JSON.stringify({a:g.a,b:g.b,start:{x,y,z},actor}));
   assert(actor.y>y-.5,'Guard prevents falling off its supported side');probes++;
   if(o.name.startsWith('Pharmacy'))pharmacyProbes++;
   if(o.name==='Blue external stair guard')annexeProbes++;
  }
 });
 assert(guards>=99,'All estate stair families have visible guards: '+guards);assert(probes>200,'Probe elevated landing and sloping edges throughout the estate: '+probes);
 assert(pharmacyProbes>=12,'Pharmacy guards must follow the moved, supported stairs');
 assert(annexeProbes>=12,'Probe both mirrored annexe stairs before their demolition');
 return {guards,probes};
}
const source=probeGuards();
// Removing a period/layout must also remove the corresponding collisions.
timeline.setPeriod(1829);walker.refresh();assert(walker.clear(-62.1,26.65,4.3),'Absent west wing cannot leave invisible landing rails');
timeline.setPeriod(2021);walker.refresh();
batchAerialMeshes(THREE,exterior.model,{exclude:[exterior.trees,exterior.terrain]});
const visibility=[];exterior.model.traverse(o=>visibility.push([o,o.visible]));walker.refresh();
for(const [o,visible] of visibility)assert.equal(o.visible,visible,'Guard collision refresh preserves render batching');
// Hidden originals are retained for walking; check a formerly open edge.
const actor={x:-62.1,y:4.32,z:26.05};for(let i=0;i<40;i++)walker.update(actor,0,.05,.016);
assert(actor.z<26.45&&actor.y>4.2,'Batched west landing retains its end guard');
console.log('PASS: upper and remote stair round trips, '+source.guards+' guards / '+source.probes+' fall-prevention probes, timeline removal and batched collision parity.');
