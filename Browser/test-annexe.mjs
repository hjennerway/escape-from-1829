import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE,ANNEXE_VIEWS,ANNEXE_MAP_SCALE,ANNEXE_REAR_EAST,annexeMapPoint,annexePoint} from './dist/annexe.mjs';
import {ANNEXE_OS_REFINEMENT,annexeRefinementPixel} from './dist/annexe-os-refinement.mjs';
import {ANNEXE_PLACEMENT_REFERENCE,annexePlacementMapPoint} from './dist/annexe-placement.mjs';
import {annexeGroundPoint} from './dist/annexe-ground-placement.mjs';
import {createWalker,exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),annexe=exterior.annexe;
exterior.scene.updateMatrixWorld(true);
assert.equal(annexe.name,'The annexe');
assert.equal(exterior.newHospital,annexe,'legacy integration resolves to the same model');
// The latest placement uses the front section and the three stationary landmarks.
assert.deepEqual(exterior.chapel.position.toArray(),[-4.9,0,-119.2]);
assert.deepEqual(exterior.churtonWard.position.toArray(),[-44.3,0,-65.9]);
assert.deepEqual(exterior.graftonEdge.position.toArray(),[73.5,0,-155.8]);
for(const {pixel,world} of ANNEXE_PLACEMENT_REFERENCE.landmarks){
 const fitted=annexePlacementMapPoint(pixel);
 assert(Math.hypot(...fitted.map((v,i)=>v-world[i]))<5,'Map registration agrees with all three fixed landmarks within scan precision');
}
const frontCorners=['West','East'].map((side,i)=>{
 const wall=annexe.getObjectByName(side+' front pavilion brick walls');wall.geometry.computeBoundingBox();
 const bounds=wall.geometry.boundingBox;
 return wall.localToWorld(new THREE.Vector3(i?bounds.max.x:bounds.min.x,0,bounds.max.z));
});
const line=ANNEXE_PLACEMENT_REFERENCE.frontLine.map(annexePlacementMapPoint),mid=frontCorners[0].clone().add(frontCorners[1]).multiplyScalar(.5);
const fittedFront=annexePoint(0,0,17*ANNEXE_MAP_SCALE);
assert(Math.hypot(mid.x-fittedFront[0],mid.z-fittedFront[2])<1e-8,'Actual front masonry follows the aerial site placement');
const direction=frontCorners[1].clone().sub(frontCorners[0]).normalize(),lineDirection=new THREE.Vector3(line[1][0]-line[0][0],0,line[1][1]-line[0][1]).normalize();
assert(direction.dot(lineDirection)>1-1e-10,'Front masonry runs parallel to the purple line, with the rear on the correct side');
assert(Math.abs(frontCorners[0].distanceTo(frontCorners[1])-64.82363778290825*.648)<1e-6,'The front section is 90% of its preceding size');
assert.deepEqual(annexe.scale.toArray(),[.648,.9,.648],'All three dimensions receive the same 90% reduction');
const legacyDrives=[];annexe.traverse(o=>{if(o.name==='Annexe drive')legacyDrives.push(o);});
for(const [i,centre] of [[0,[0,.025,64.5]],[1,[0,.025,65]],[2,[-144,.025,1.5]],[3,[144,.025,9.5]]]){
 assert(legacyDrives[i].getWorldPosition(new THREE.Vector3()).distanceTo(new THREE.Vector3(...annexeGroundPoint(...centre)))<1e-8,'Existing gameplay drives remain fixed');
}
console.log('PASS: fixed church/Churton/Grafton, retained frontage orientation, aerial plan scale and fixed gameplay roads.');
// The original outline transform still supplies unchanged local dimensions.
for(const [pixel,world] of [[[285,308],[0,13]],[[215,351],[-6,-120]]]){
 const p=annexeMapPoint(...pixel);assert(Math.hypot(p[0]-world[0],p[1]-world[1])<1e-8);
}
const redesmere=annexeMapPoint(242,265);
assert(Math.hypot(redesmere[0]-94.5,redesmere[1]+14)<2,'independent Redesmere control point remains aligned');
// A similarity transform preserves distances and angles in the OS outline.
const p=annexeMapPoint(138,83),u=annexeMapPoint(148,83),v=annexeMapPoint(138,93);
assert(Math.abs(Math.hypot(u[0]-p[0],u[1]-p[1])-Math.hypot(v[0]-p[0],v[1]-p[1]))<1e-8);
assert(Math.abs((u[0]-p[0])*(v[0]-p[0])+(u[1]-p[1])*(v[1]-p[1]))<1e-8);
assert.equal(annexe.getObjectByName('Central hall brick walls').material,exterior.model.getObjectByName('Redesmere outer brick elevation').material);
const obstacles=exteriorObstacles(THREE,exterior.model),ray=new THREE.Raycaster();
for(const [x,z] of [[-42,10],[40,10],[-91,-22],[97,-23],[-1,-34]]){
 const p=annexePoint(x*ANNEXE_MAP_SCALE,40,z*ANNEXE_MAP_SCALE);
 assert(!obstacles.some(b=>obstacleContains(b,p[0],p[2],0)),'OS courtyard centre remains walkable');
 ray.set(new THREE.Vector3(...p),new THREE.Vector3(0,-1,0));
 assert.equal(ray.intersectObject(annexe,true).filter(h=>h.object.name.endsWith('slate roof')).length,0,'court remains open to the sky');
}
for(const b of annexe.userData.ranges){
 const p=annexePoint(b.x,50,b.z);ray.set(new THREE.Vector3(...p),new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(annexe,true).find(h=>h.object.name.endsWith('slate roof'));
 assert(hit&&hit.face.normal.y>0,b.name+' has an upward-facing roof');
}
const arches=annexe.userData.annexeOpenings.filter(o=>o.arched);
assert.equal(arches.filter(o=>o.name==='Hall dormer').length,3);
assert.equal(arches.filter(o=>o.name.includes('pavilion')).length,2);
for(const name of ['West square tower brick walls','East square tower brick walls','Bell tower dome','Visible hanging bell','Blue gutters and downpipes','Entrance terracotta arch'])assert(annexe.getObjectByName(name),name);
const walk=createWalker(exterior.camera,obstacles);walk.setView(ANNEXE_VIEWS['annexe-ground']);
const before=exterior.camera.position.clone();walk.keys.add('KeyW');walk.update(.1);
assert(exterior.camera.position.distanceTo(before)>.45,'front approach is accessible');
const b=annexe.userData.ranges.find(b=>b.name==='West court front range');
const jarmanFront=annexe.userData.courtFronts[0].userData.veranda.front;
walk.setView({position:annexePoint(b.x,1.8,jarmanFront+5),target:annexePoint(b.x,1.8,b.z)});
walk.keys.add('KeyW');for(let i=0;i<30;i++)walk.update(.1);
const local=annexe.worldToLocal(exterior.camera.position.clone());
assert(local.z>jarmanFront&&local.z<jarmanFront+1/ANNEXE.scale,'walking stops at the scaled, rotated Jarman veranda face');
for(const o of arches){
 const outward=new THREE.Vector3(Math.sin(o.rotation),0,Math.cos(o.rotation));
 const start=new THREE.Vector3(o.x,o.y,o.z).addScaledVector(outward,.7);
 annexe.localToWorld(start);outward.transformDirection(annexe.matrixWorld);
 ray.set(start,outward.negate());const hit=ray.intersectObject(annexe,true)[0];
 assert(hit&&(hit.object.isInstancedMesh||hit.object.name.includes('glazing')),o.name+' glazing is exposed');
}
console.log('PASS: annexe OS registration and scale, independent Redesmere alignment, open courts, roofs, arched glazing, bell tower and walking collisions.');



for(const key of ['annexe-front','annexe-front-right','annexe-img1','annexe-side','annexe-side-right','annexe-ground']){
 const p=ANNEXE_VIEWS[key].position;assert(!obstacles.some(b=>obstacleContains(b,p[0],p[2])),key+' starts outside masonry');
}
ray.set(new THREE.Vector3(...annexePoint(-35,40,-11)),new THREE.Vector3(0,-1,0));
assert(ray.intersectObject(annexe,true).some(h=>h.object.name==='West canted bay slate roof'&&h.face.normal.y>0),'canted side bay roof faces upward');


// The orange/purple courts are separately traced, each with two open arms.
for(const [side,arms,notch] of [[-1,[[-53,7],[-42,7],[-42,17],[-38,-16.5]],[-52,17]],[1,[[40,8],[56,8],[40,19],[45,-16.5]],[53,19]]]){
 for(const [x,z] of arms){
  const p=annexePoint(x*ANNEXE_MAP_SCALE,40,z*ANNEXE_MAP_SCALE);
  assert(!obstacles.some(o=>obstacleContains(o,p[0],p[2],.25)),'court arms and former rear-gallery route are clear');
  ray.set(new THREE.Vector3(...p),new THREE.Vector3(0,-1,0));
  assert(!ray.intersectObject(annexe,true).some(h=>h.object.name.endsWith('slate roof')),'L court and removed gallery have no roof cover');
 }
 const p=annexePoint(notch[0]*ANNEXE_MAP_SCALE,1.8,notch[1]*ANNEXE_MAP_SCALE);
 assert(obstacles.some(o=>obstacleContains(o,p[0],p[2],0)),'masonry notch makes the court L-shaped');
 const label=side<0?'West':'East';
 assert(!annexe.getObjectByName(label+' low rear gallery brick walls'));
 ray.set(new THREE.Vector3(...annexePoint(side*35,40,-11)),new THREE.Vector3(0,-1,0));
 if(side<0)assert(ray.intersectObject(annexe,true).some(h=>h.object.name==='West canted bay slate roof'),'Unmarked west bay roof stays exposed');
 else assert(!annexe.getObjectByName('East canted bay slate roof'),'Marked east bay is removed');
}
const leftSide=annexe.getObjectByName('West mirrored side details'),rightSide=annexe.getObjectByName('East mirrored side details');
assert.equal(rightSide.children.length,leftSide.children.filter(o=>!/canted bay/.test(o.name)).length,'East bay is removed while every stair part remains');
assert(!annexe.userData.annexeOpenings.some(o=>o.name==='East low canted bay'),'No glazing remains from removed east bay');
const rear=annexe.userData.ranges.filter(b=>b.section==='rear-east');
assert.equal(rear.length,2);
assert(rear.every(b=>b.r>.3&&b.r<.5),'rear L wing rotates counter-clockwise relative to the frontage');
const pivot=ANNEXE_REAR_EAST.pivot.map(v=>v*ANNEXE_MAP_SCALE);
const joint=[pivot[0]+Math.cos(rear[0].r)*34*ANNEXE_MAP_SCALE,pivot[1]-Math.sin(rear[0].r)*34*ANNEXE_MAP_SCALE];
for(const b of rear){
 const dx=joint[0]-b.x,dz=joint[1]-b.z;
 assert(Math.abs(Math.cos(b.r)*dx-Math.sin(b.r)*dz)<b.w/2&&Math.abs(Math.sin(b.r)*dx+Math.cos(b.r)*dz)<b.d/2,'rotated sections retain their L junction');
}
for(const o of annexe.userData.annexeOpenings.filter(o=>o.name.startsWith('Rear east'))){
 const outward=new THREE.Vector3(Math.sin(o.rotation),0,Math.cos(o.rotation)),start=new THREE.Vector3(o.x,o.y,o.z).addScaledVector(outward,.5);
 annexe.localToWorld(start);outward.transformDirection(annexe.matrixWorld);ray.set(start,outward.negate());
 assert(ray.intersectObject(annexe,true)[0]?.object.isInstancedMesh,'rotated rear-wing windows remain exposed');
}
console.log('PASS: L-shaped courts, removed galleries, connected angled rear wing and retained west bay and paired stairs.');
// Independent pixel checks catch a mirrored courtyard or filled rear court.
for(const block of ANNEXE_OS_REFINEMENT.blocks.filter(b=>b.court)){
 const centre=block.court.reduce((p,q)=>p.map((v,i)=>v+q[i]/block.court.length),[0,0]);
 const [x,z]=annexeRefinementPixel(centre),p=annexePoint((x+(block.colour==='purple'?7:0))*ANNEXE_MAP_SCALE,40,z*ANNEXE_MAP_SCALE);
 assert(!obstacles.some(o=>obstacleContains(o,p[0],p[2],0)),block.colour+' source courtyard remains open');
 ray.set(new THREE.Vector3(...p),new THREE.Vector3(0,-1,0));
 assert(!ray.intersectObject(annexe,true).some(h=>h.object.name.endsWith('slate roof')),block.colour+' source courtyard has open sky');
}
console.log('PASS: orange, purple and brown OS courtyard picks are free of masonry and roofs.');
