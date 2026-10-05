import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {batchAerialMeshes} from './dist/aerial-performance.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),walker=createAsylumOutside(THREE,exterior);
const stair=exterior.model.getObjectByName('West forward end masonry return stair');
const meshes=[];stair.traverse(o=>{if(o.isMesh)meshes.push(o);});
const hoops=meshes.filter(o=>o.userData.fireExitHoop);
assert.equal(hoops.length,8,'Both flights and the door balcony have photographed arched frames');
assert.equal(meshes.filter(o=>o.name==='West forward fire-exit stone tread').length,24);
assert.equal(meshes.filter(o=>o.name==='West forward fire-exit yellow nosing').length,24);
assert.equal(meshes.filter(o=>o.name==='West forward fire-exit central brick cheek').length,1);
assert.equal(meshes.filter(o=>o.name==='West forward fire-exit outer brick cheek').length,1);
assert.equal(meshes.filter(o=>o.name==='West forward fire-exit balcony brick pier').length,1);
const ray=new THREE.Raycaster(),up=new THREE.Vector3(0,1,0),down=up.clone().negate();
let samples=0;
for(const hoop of hoops){
  const {base:[x,y,z],alongZ}=hoop.userData.fireExitHoop;
  for(const offset of [-.3,0,.3]){
    const px=x+(alongZ?0:offset),pz=z+(alongZ?offset:0);
    ray.set(new THREE.Vector3(px,y+.25,pz),down);ray.far=.6;
    const floor=ray.intersectObjects(meshes.filter(m=>!m.userData.noWalkingCollision))[0];
    assert(floor,'A frame must stand above a supported walking lane');
    ray.set(floor.point.clone().addScaledVector(up,.01),up);ray.far=3;
    const crown=ray.intersectObject(hoop)[0];
    assert(crown&&crown.distance>1.84,'The real curved crown leaves standing headroom');samples++;
  }
}
// Test only the F5 route, including stops, physical guards and its approach.
function follow(actor,points){
  for(const [x,z] of points){
    for(let i=0;i<1800&&Math.hypot(actor.x-x,actor.z-z)>.02;i++){
      const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),step=Math.min(d,.025);
      walker.update(actor,dx/d*step,dz/d*step,.01);
      assert(walker.clear(actor.x,actor.z,actor.y),'F5 remains clear at each tread');
      if(i%19===0){const y=actor.y;walker.update(actor,0,0,.08);assert(Math.abs(actor.y-y)<.01,'Stopping preserves tread support');}
    }
    assert(Math.hypot(actor.x-x,actor.z-z)<.03,'F5 route reaches '+JSON.stringify({target:[x,z],actor}));
  }
}
const route=[[-38.9,46.05],[-45.75,46.05],[-45.75,44.5],[-39,44.5],[-39,43.8]];
const actor={x:route[0][0],y:.3,z:route[0][1]};
follow(actor,route.slice(1));assert(actor.y>4.2,'F5 climb reaches its existing door');
follow(actor,[...route].reverse().slice(1));assert(actor.y<.7,'F5 returns to ground');
assert(!walker.clear(-39.9,43.64,.3),'The balcony pier is solid at ground level');
for(const x of [-46,-43,-40,-37,-34,-30])assert(walker.clear(x,48,.3),'The front path remains clear');
for(const x of [-46,-43,-40]){
  const y=walker.heightAt(x,46.05,2.4),probe={x,y,z:46.05};
  for(let i=0;i<40;i++)walker.update(probe,0,.035,.016);
  assert(probe.z<46.53,'The lower outer guard prevents falls');
}
// Keep the window/door schedule and view through the adjacent facade intact.
const openings=exterior.model.userData.westForwardEndPhotoOpenings;
assert.equal(openings.length,8);
for(const o of openings){
  ray.set(new THREE.Vector3(o.x,o.y,48),new THREE.Vector3(0,0,-1));ray.far=6;
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.z>43.1&&hit.point.z<43.4,'Adjacent facade glass remains exposed');
}
batchAerialMeshes(THREE,exterior.model,{exclude:[exterior.trees,exterior.terrain]});walker.refresh();
const batched={x:route[0][0],y:.3,z:route[0][1]};follow(batched,route.slice(1));
assert(batched.y>4.2,'Batched F5 retains the same walking route');
console.log(`PASS: west forward fire exit only; 24 stone/yellow steps, 8 arches, ${samples} crown headroom rays, F5 stopped climbs/descents, fall guards, solid pier, clear approach, facade and batching.`);
