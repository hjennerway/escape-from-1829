// Real Three.js geometry/camera checks, without a WebGL context.
import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior,ESCAPE_MAST} from './dist/escape-exterior.mjs';
import {sampleEscape} from './dist/escape-cutscene.mjs';
import {sampleArrival} from './dist/arrival-cutscene.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9);
exterior.scene.updateMatrixWorld(true);
assert(exterior.mast.children.length>150,'mast must contain real lattice geometry');
const dragons=exterior.model.getObjectByName('Blue dragons and central coat of arms');
assert.equal(dragons.geometry.attributes.uv.count,3,'heraldic photo must map onto the triangular pediment');
for(const aspect of [16/9,4/3,9/16])for(const seconds of [0,1,1.75,2.5]){
  const shot=sampleArrival(seconds,{aspect}),camera=exterior.camera;
  camera.aspect=aspect;camera.updateProjectionMatrix();camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
  const door=new THREE.Vector3(0,3.5,19.9).project(camera);
  assert(Math.abs(door.x)<1e-10&&Math.abs(door.y)<1e-10,'front door stays centred throughout the rush');
  if(seconds===0)for(const x of [-54,54])for(const z of [-35,40]){
    const p=new THREE.Vector3(x,15,z).project(camera);
    assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'arrival initially frames the whole building');
  }
}
const ray=new THREE.Raycaster(new THREE.Vector3(20,80,12),new THREE.Vector3(0,-1,0));
const roof=ray.intersectObject(exterior.model,true)[0];
assert(roof&&roof.point.y>12,'principal range must have a visible roof from above');
assert(roof.face.normal.y>0,'roof triangles must face the aerial camera');
for(const x of [-23,23])for(const z of [-17,-26,-30,-34,-40]){
  ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'both W-shaped gaps must open through to the rear road');
}
for(const aspect of [16/9,4/3,9/16])for(const seconds of [0,5,10]){
  const shot=sampleEscape(seconds,{aspect}),camera=exterior.camera;camera.aspect=aspect;camera.updateProjectionMatrix();camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
  const tip=new THREE.Vector3(ESCAPE_MAST.x,ESCAPE_MAST.height,ESCAPE_MAST.z).project(camera);
  assert(tip.x<0&&tip.y>0,'mast must read as upper-left from the aerial perspective');
  assert(Math.abs(tip.x)<.95&&Math.abs(tip.y)<.95,'mast must stay in frame');
  for(const x of [-54,54])for(const z of [-35,40]){
    const p=new THREE.Vector3(x,15,z).project(camera);
    assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'building must stay in frame throughout the pan');
  }
}
delete globalThis.document;
console.log('PASS: real estate geometry, upward-facing roofs, W-shaped openings to the rear, rear-left lattice mast, building/mast framing throughout landscape and portrait pans.');
