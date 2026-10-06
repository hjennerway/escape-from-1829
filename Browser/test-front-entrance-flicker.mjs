import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.6);model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();ray.far=.04;
let probes=0;
// The older front sash at x=7 had a sill ending at z=17.3, exactly on the
// replacement brick facade. Probe its former top/bottom and centre, from
// outside the real wall, including the area left of the first current sash.
for(const side of [-1,1])for(const x of [7.19,7.31,7.46,7.61])
 for(const row of [3.8,7.2,10.6])for(const y of [row-1.315-.035,row-1.315,row-1.315+.035]){
  ray.set(new THREE.Vector3(side*x,y,17.32),new THREE.Vector3(0,0,-1));
  const hits=ray.intersectObject(model,true);
  assert.equal(hits.length,1,'One wall surface beside Reception, without a buried sill competing at '+JSON.stringify({side,x,y,hits:hits.map(h=>({name:h.object.name,point:h.point.toArray(),colour:h.object.material.color.getHexString()}))}));
  assert.equal(hits[0].object.name,`Entrance ${side>0?'east':'west'} recessed wall${y<3.1?' white lower storey':''}`);
  assert(Math.abs(hits[0].point.z-17.3)<1e-5);probes++;
 }
const openings=model.userData.eastPhotoOpenings;
assert(!openings.some(o=>o.face==='1829-range-sash'&&o.z>17&&o.z<17.1&&Math.abs(o.x)<32),
 'Replacement entrance and Reception facades own their front window details');
for(const side of [-1,1]){
 for(const y of [5.45,9.75])assert(openings.some(o=>o.face===`entrance-${side>0?'east':'west'}-recess`&&Math.abs(o.x-side*8.4)<1e-6&&o.y===y),'Retain both photographed sashes beside Reception');
 for(const y of [4.3,8.9,12.4])for(const x of [-4,0,4])if(x!==0||y!==4.3)
  assert(openings.some(o=>o.face==='reception-front-sash'&&o.x===x&&o.y===y),'Retain the current Reception sashes');
}
assert(openings.some(o=>o.face==='1829-range-sash'&&o.z<8),'Retain the main range rear windows');
assert(openings.some(o=>o.face==='1829-range-sash'&&o.z>17&&Math.abs(o.x)>32),'Retain exposed outer main-range front windows');
console.log(`PASS: ${probes} complete-scene entrance wall probes, current Reception/entrance windows and retained rear/outer range glazing.`);
