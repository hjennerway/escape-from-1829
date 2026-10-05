import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {WEST_RANGE_PLAN} from './dist/west-range-plan.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const cornices=[],iron=[],ray=new THREE.Raycaster();
model.traverse(o=>{
  if(!o.isMesh)return;
  if(/^West outer corner joined cornice/.test(o.name))cornices.push(o);
  if(o.material?.color?.getHex()===0x454b49)iron.push(o);
});
const overlaps=[];let corniceSamples=0;
// Probe the real upper cornice across both flanks and the central projection.
// A gutter top at the same height inside this footprint causes the flicker.
for(const x of [-72.82,-72.7,-72.6,-72.55,-72.52,-72.49,-72.4,-72.2]){
  for(const z of [5.2,6.5,8,9.8,10.5,12,14,15,16,18,20.2]){
    ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));
    const cap=ray.intersectObjects(cornices,false)[0];if(!cap)continue;
    const metal=ray.intersectObjects(iron,false).find(h=>h.face.normal.y>.5&&Math.abs(h.point.y-cap.point.y)<.00002);
    if(metal)overlaps.push([x,z,cap.point.y]);corniceSamples++;
  }
}
assert.equal(overlaps.length,0,'Gutter and cornice must have no competing coplanar top faces: '+JSON.stringify(overlaps));
const eave=WEST_RANGE_PLAN.roofEaveHeight;
let gutterSamples=0;
for(const [x,zz] of [[-72.635,[5.2,6.5,8,9.8,15.6,17,19,20.3]],[-72.895,[10.4,11,12.75,14,15.2]]]){
  for(const z of zz){
    ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));
    const h=ray.intersectObjects(iron,false)[0];
    assert(h&&Math.abs(h.point.y-eave)<.00002,'The gutter follows the whole outer cornice, including the pier: '+[x,z,h?.point.y]);gutterSamples++;
  }
}
for(const z of [10.09,15.41])for(const x of [-72.68,-72.75,-72.84]){
  ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));
  const h=ray.intersectObjects(iron,false)[0];assert(h&&Math.abs(h.point.y-eave)<.00002,'Both gutter returns have continuous mitres');gutterSamples++;
}
console.log('PASS: '+corniceSamples+' cornice probes without coplanar metal overlap, '+gutterSamples+' continuous gutter/pier-return probes.');
