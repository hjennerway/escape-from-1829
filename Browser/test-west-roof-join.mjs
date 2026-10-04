import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const material=model.getObjectByName('West end continuous slate roof').material;
const roofs=[];model.traverse(o=>{if(o.isMesh&&o.material===material)roofs.push(o);});
const ray=new THREE.Raycaster();
const join=model.getObjectByName('West cross-range continuous roof join');
assert(new THREE.Box3().setFromObject(join).min.y>14.5,'The raised roof cannot dip down to the separate low stair-bay roof');
const lowBay=model.getObjectByName('West court low bay flat roof');
assert.equal(lowBay.geometry.type,'BoxGeometry','The independent low roof retains its complete original solid deck');
function top(x,z){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObjects(roofs,false)[0];
  assert(hit?.face.normal.y>0,'Every roof-join probe has upward-facing slate');return hit.point.y;
}
// These are the actual tall masonry contacts marked yellow, independent of
// the new roof's triangulation: the outer pavilion and court bay's rear edge.
for(const x of [-64.25,-64.1,-63.9])for(const z of [12,12.5,13])
  assert(top(x,z)>15.5,'The raised shoulder covers the outer pavilion brick strip');
for(const x of [-61,-60,-59,-58,-57,-56])for(const z of [4.85,5.1])
  assert(top(x,z)>15.49,'The bay rear masonry and cornice sit beneath the joined slate');
for(const x of [-64,-63,-62,-61,-60,-59,-58,-57,-56]){
  assert(top(x,9.25)>16.7,'The small recessed hip joins the main ridge');
  assert(Math.abs(top(x,9.249)-top(x,9.251))<.003,'Both pitches meet without an open ridge or vertical step');
}
// Probe across the seams, including the retained garden branch's valley.
const gardenEnd=-48.6-21.2/2-.4+4.65*.83;
for(const z of [10,10.5,11,11.5,12,12.5,13,13.7])
  assert(Math.abs(top(gardenEnd-.001,z)-top(gardenEnd+.001,z))<.05,'The garden pitch meets the existing roof envelope');
for(const z of [5,6,7,8,9])
  assert(Math.abs(top(-52.501,z)-top(-52.499,z))<.005,'The court pitch meets the main range without a step');
console.log('PASS: both marked brick strips covered, continuous raised ridge, upward slate and matched roof valleys.');
