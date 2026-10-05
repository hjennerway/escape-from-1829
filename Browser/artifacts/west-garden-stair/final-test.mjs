import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {batchAerialMeshes} from './dist/aerial-performance.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
const timeline=prepareEstateTimeline(THREE,exterior,layouts);timeline.setPeriod(1916);
const walker=createAsylumOutside(THREE,exterior),ray=new THREE.Raycaster(),meshes=[];
exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
for(const y of [4.25,8.5]){
  for(const dx of [-.55,-.25,.25,.55]){
    ray.set(new THREE.Vector3(-63+dx,y+1.36,14.3),new THREE.Vector3(0,0,-1));ray.far=1;
    assert.equal(ray.intersectObjects(meshes)[0]?.object.material.color.getHex(),0x172e50,'Both door leaves face the recessed wall');
  }
  for(const z of y===4.25?[14.1,15,17,19]:[14.1,14.8,15.2])for(const dx of [-.45,0,.45]){
    ray.set(new THREE.Vector3(-63+dx,y+.2,z),new THREE.Vector3(0,-1,0));ray.far=.3;
    assert(Math.abs(ray.intersectObjects(meshes)[0]?.point.y-(y+.07))<1e-5,'Uniform door approach has visible floor across its full width');
  }
}
for(const [y,z] of [[4.25,15.6],[8.5,15]]){
  ray.set(new THREE.Vector3(-63.3,y+1.36,z),new THREE.Vector3(-1,0,0));ray.far=1;
  assert.notEqual(ray.intersectObjects(meshes)[0]?.object.material.color.getHex(),0x172e50,'The former side-wall door is removed');
}
for(const name of ['West garden middle door walkway','West garden upper door walkway','West garden upper flight landing']){
  const box=new THREE.Box3().setFromObject(exterior.model.getObjectByName(name));assert(Math.abs(box.max.x-box.min.x-1.2)<1e-5,'Door approach matches stair width '+name);
}
for(const file of ['./dist/asylum-plan.json','../Research/1829-interior-proposal/plan-data.json']){
  const plan=JSON.parse(readFileSync(new URL(file,import.meta.url))),exit=plan.exits.find(e=>e.id==='F4');
  assert.deepEqual(exit.levels[0].destination,[-63,4.25,14.3],'The playable exit arrives beside its relocated door');
  assert(walker.clear(-63,14.3,4.25),'The new arrival clears the door and both guards');
}
const route=[[-60.3,14.8],[-60.3,20],[-63,20],[-63,14.3],[-63,20],[-61.65,20],[-61.65,16],[-61.65,14.9],[-63,14.9],[-63,14.3]];
const actor={x:route[0][0],z:route[0][1],y:.3};
function follow(points){
  for(const [x,z] of points){
    for(let i=0;i<1800&&Math.hypot(actor.x-x,actor.z-z)>.025;i++){
      const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.025,d),prior=actor.y;
      walker.update(actor,dx/d*step,dz/d*step,.01);
      assert(walker.clear(actor.x,actor.z,actor.y),'Every movement clears the railings');
      assert(Math.abs(actor.y-prior)<.3,'No sudden height change');
      if(i%17===0){const height=actor.y;walker.update(actor,0,0,.1);assert(Math.abs(actor.y-height)<.01,'Stops retain support');}
    }
    assert(Math.hypot(actor.x-x,actor.z-z)<.04,'Stair route remains open '+JSON.stringify({actor,target:[x,z]}));
  }
}
follow(route.slice(1));assert(actor.y>8.4,'Upper doorway accessible');
follow([...route].reverse().slice(1));assert(actor.y<.7,'Ground return accessible');
function guards(){
  for(const [x,y,z,dx,dz] of [[-63,4.32,17,-.04,0],[-63,4.32,17,.04,0],[-63,8.57,14.1,-.04,0],[-63,8.57,14.1,.04,0],[-61.2,4.32,20,0,.04]]){
    const actor={x,y,z};for(let i=0;i<35;i++)walker.update(actor,dx,dz,.016);
    assert(Math.hypot(actor.x-x,actor.z-z)<.35&&Math.abs(actor.y-y)<.02,'Approach and turning guards prevent falls');
  }
}
guards();batchAerialMeshes(THREE,exterior.model,{exclude:[exterior.trees,exterior.terrain]});walker.refresh();guards();
timeline.setPeriod(1829);walker.refresh();assert(walker.clear(-63,17,4.32),'Absent wing leaves no invisible walkway guard');
console.log('PASS: relocated door leaves, former door removal, constant-width floor support, arrivals, stopped/restarted climb and descent, guards and batched/timeline collision parity.');
