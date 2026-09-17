import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE,annexePoint,annexeLocal} from './dist/annexe.mjs';
import {HISTORIC_ROAD_TRACES,ADMIN_TEARDROP} from './dist/historic-road-layout.mjs';
import {SHARED_HISTORIC_LANES} from './dist/historic-road-clearance.mjs';
import {existingBuildingFootprints,pointInFootprint} from './dist/historic-footprints.mjs';
import {ANNEXE_FRONT_ROAD_REFERENCE} from './dist/annexe-front-roads.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);e.model.updateMatrixWorld(true);
const previous=JSON.parse(readFileSync(new URL('../Research/annexe-photo-placement/fixed-roads.json',import.meta.url)));
const roads=[...HISTORIC_ROAD_TRACES,...SHARED_HISTORIC_LANES];
// Protect the annexe's surrounding loop, avenue and teardrop. Selecting every
// route with any point east of x=240 also froze unrelated, later-approved
// Vivienne Smith Lane, garage-junction and Main/admin pine-road revisions.
for(const name of ['Northern Parsons Lane connection','Parsons Lane southern fork',
 'Admin teardrop circulation','Annexe front avenue','Northern estate boundary','Parsons Lane (North)']){
 const original=previous.roads.find(r=>r.name===name);
 assert(original,'The reference must contain the protected road: '+name);
 assert.deepEqual(roads.find(r=>r.name===name),original,'Annexe placement must retain '+name);
}
const removedRoads=previous.roads.filter(r=>/^Annexe rear /.test(r.name));
assert.equal(removedRoads.length,4,'The reference identifies all four removed rear routes');
for(const {name} of removedRoads)assert(!roads.some(r=>r.name===name),'The yellow-marked rear road stays removed: '+name);
const loop=previous.loop,footprints=existingBuildingFootprints(THREE,{model:e.annexe});
const dist=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz,t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/length)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
const edgeDistance=(p,polygon)=>Math.min(...polygon.map((a,i)=>dist(p,a,polygon[(i+1)%polygon.length])));
let loopGap=Infinity,teardropGap=Infinity,adminGap=Infinity;
const admin=existingBuildingFootprints(THREE,{model:e.mainAdmin});
for(const polygon of footprints)for(let i=0;i<polygon.length;i++){
 const a=polygon[i],b=polygon[(i+1)%polygon.length],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.5);
 for(let k=0;k<=steps;k++){
  const p=a.map((v,j)=>v+(b[j]-v)*k/steps);
  assert(pointInFootprint(p,loop),'Every annexe wall edge must remain inside the Parsons loop');
  loopGap=Math.min(loopGap,edgeDistance(p,loop));teardropGap=Math.min(teardropGap,edgeDistance(p,ADMIN_TEARDROP));
  for(const other of admin)adminGap=Math.min(adminGap,edgeDistance(p,other));
 }
}
assert(loopGap>4.5,'Masonry clears the loop carriageway and its kerbs');
assert(teardropGap>6,'The annexe stays clear of the teardrop island and carriageway');
assert(adminGap>15,'Main/admin remains separate from the closer annexe');
const front=annexePoint(0,0,27.55),frontGap=edgeDistance([front[0],front[2]],ANNEXE_FRONT_ROAD_REFERENCE.redLine);
assert(frontGap<50,'The front centre is brought closer to the red frontage line');
for(const p of [[-120,-40],[40,20],[0,0]]){
 const world=annexePoint(p[0],0,p[1]),local=annexeLocal([world[0],world[2]]);assert(Math.hypot(local[0]-p[0],local[1]-p[1])<1e-8);
}
assert.deepEqual(e.annexe.scale.toArray(),[.72,1,.72]);
assert.deepEqual([ANNEXE.x,ANNEXE.z],[378,-34]);
console.log('PASS: larger annexe moves closer to the red line inside the fixed loop, with only yellow rear roads removed; minimum gaps',JSON.stringify({loop:loopGap,teardrop:teardropGap,admin:adminGap,frontLine:frontGap}));
