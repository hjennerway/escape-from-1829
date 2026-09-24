import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE,ANNEXE_SITE,ANNEXE_MAP_SCALE,annexePoint,annexeLocal,annexeSitePoint} from './dist/annexe.mjs';
import {HISTORIC_ROAD_TRACES,ADMIN_TEARDROP} from './dist/historic-road-layout.mjs';
import {SHARED_HISTORIC_LANES} from './dist/historic-road-clearance.mjs';
import {existingBuildingFootprints,pointInFootprint} from './dist/historic-footprints.mjs';
import {ANNEXE_FRONT_ROAD_REFERENCE} from './dist/annexe-front-roads.mjs';
import {ANNEXE_ACCESS_PAVING} from './dist/annexe-access.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);e.model.updateMatrixWorld(true);
const previous=JSON.parse(readFileSync(new URL('../Research/annexe-photo-placement/fixed-roads.json',import.meta.url)));
const roads=[...HISTORIC_ROAD_TRACES,...SHARED_HISTORIC_LANES];
// Protect the annexe's surrounding loop, avenue and teardrop.
// The September 24 fork curve is checked separately in test-parsons-retrace.
// Selecting every route with any point east of x=240 also froze later-approved
// Vivienne Smith Lane, garage-junction and Main/admin pine-road revisions.
for(const name of ['Northern Parsons Lane connection',
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
assert.deepEqual(e.annexe.scale.toArray(),[.648,.9,.648]);
assert.deepEqual([ANNEXE_SITE.x,ANNEXE_SITE.z,ANNEXE_SITE.scale],[378,-34,.72]);
const buildingFront=annexePoint(ANNEXE.frontAnchor[0],0,ANNEXE.frontAnchor[1]);
const pavedAxis=annexeSitePoint(ANNEXE.frontAnchor[0],0,ANNEXE.frontAnchor[1]);
const c=Math.cos(ANNEXE_SITE.rotation),s=Math.sin(ANNEXE_SITE.rotation);
assert(Math.abs(s*(buildingFront[0]-pavedAxis[0])+c*(buildingFront[2]-pavedAxis[2]))<1e-10,'Sideways centring retains the entrance setback');
// Measure the actual inward masonry faces and the actual paving, rather than
// comparing two points derived from the same placement anchor.
const along=([x,z])=>c*(x-ANNEXE_SITE.x)-s*(z-ANNEXE_SITE.z);
const inwardFaces=['West','East'].map((side,i)=>{
 const wall=e.annexe.getObjectByName(side+' court inner return brick walls');
 wall.geometry.computeBoundingBox();const b=wall.geometry.boundingBox;
 const p=wall.localToWorld(new THREE.Vector3(i?b.min.x:b.max.x,0,0));
 return along([p.x,p.z]);
});
const apron=ANNEXE_ACCESS_PAVING.find(p=>p.name==='Annexe central asphalt forecourt');
const edges=apron.points.map(along),grassGaps=[Math.min(...edges)-inwardFaces[0],inwardFaces[1]-Math.max(...edges)];
assert(grassGaps.every(gap=>gap>5),'Both sides of the narrowed paving retain clear grass');
assert(Math.abs(grassGaps[1]-grassGaps[0])<1e-8,'The new apron is centred between the symmetric court wings');
const door=e.annexe.getObjectByName('Entrance recessed double door').getWorldPosition(new THREE.Vector3());
assert(Math.abs((Math.min(...edges)+Math.max(...edges))/2-along([door.x,door.z]))<1e-8,'The purple-line apron centres on the actual doorway');
console.log('PASS: annexe retains its scale and setback, centres the narrower paving on the doorway with equal side grass, and clears surrounding roads; minimum gaps',JSON.stringify({grass:grassGaps,loop:loopGap,teardrop:teardropGap,admin:adminGap,frontLine:frontGap}));
