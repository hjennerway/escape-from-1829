import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {MAIN_ADMIN_VIEWS} from './dist/main-admin-building.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
const admin=exterior.mainAdmin,service=layouts.towerBuildings,ray=new THREE.Raycaster();
exterior.model.updateMatrixWorld(true);
const bounds=name=>new THREE.Box3().setFromObject(admin.getObjectByName(name));
const roofAt=(x,z,group=admin)=>{
 ray.set(new THREE.Vector3(x,40,z),new THREE.Vector3(0,-1,0));
 return ray.intersectObject(group,true)[0];
};
const tall=bounds('East projecting pavilion walls'),shoulder=bounds('East rear shoulder walls');
assert(tall.max.y-shoulder.max.y>2,'Annexe end must step down at the rear');
assert(Math.abs(tall.min.z-shoulder.max.z)<1e-5,'The stepped shoulder must join the tall pavilion');
assert(roofAt(231,18.3).point.y<14.1,'No old full-height roof may remain over the lowered shoulder');
assert(roofAt(228,34).point.y>14.1,'The front portion retains its tall roof');
assert(!admin.getObjectByName('Low east side room walls'),'The blue-circled projection must be removed');
assert(!admin.userData.openings.some(o=>['east low end','east low chamfer','east low south'].includes(o.face)),'No detached windows may remain over the removed footprint');
const step=bounds('East stepped rear link walls'),rear=bounds('East square rear room walls');
assert(Math.abs(rear.max.z-step.min.z)<1e-5,'Retained red sections must stay joined');
for(const part of ['East stepped rear link','East square rear room']){
 assert(!admin.getObjectByName(part+' flat roof')&&!admin.getObjectByName(part+' brick parapet'),'Remove the red section flat roofs and parapets');
}
const peak=roofAt(242.25,13.56),eastEave=roofAt(247.4,13.56),southEave=roofAt(242.25,19.3);
assert.equal(peak.object.name,'East pointed side wing slate roof');
assert(peak.point.y>10.5&&peak.point.y-eastEave.point.y>2.8&&peak.point.y-southEave.point.y>2.8,'The red wing must rise to a point from both roof axes');
assert.equal(admin.userData.openings.filter(o=>o.face==='rear grouped upper').length,3);
const stair=bounds('Rear canted stair bay walls'),court=bounds('Rear flat court block walls');
assert(Math.abs(court.max.z-stair.min.z)<1e-5,'The flat court block meets the stair bay');
assert(stair.max.y>court.max.y+3,'The hipped stair bay must be visible above the flat block');
assert(roofAt(228,8).object.name==='Rear flat court block flat roof');
assert(roofAt(228,12).object.name==='Rear canted stair bay slate roof');

// Check actual pane areas, not only their centres: the new roof joins and
// neighbouring blocks must leave the photo-supported windows exposed.
for(const opening of admin.userData.openings.filter(o=>/^(east low|east step|east rear|east square|east shoulder|rear )/.test(o.face))){
 const n=new THREE.Vector3(Math.sin(opening.rotation),0,Math.cos(opening.rotation));
 const tangent=new THREE.Vector3(Math.cos(opening.rotation),0,-Math.sin(opening.rotation));
 for(const u of [-.4,0,.4])for(const v of [-.4,0,.4]){
  const p=admin.localToWorld(new THREE.Vector3(opening.x,opening.y+v*opening.h,opening.z)).addScaledVector(tangent,u*opening.w);
  ray.set(p.addScaledVector(n,.65),n.clone().negate());
  assert(ray.intersectObject(admin,true)[0]?.object.isInstancedMesh,'Photo window must be exposed across its pane: '+opening.face);
 }
}
for(const group of [admin,service])group.traverse(o=>{
 if(!o.isMesh)return;
 for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite),'Geometry must be finite');
 if(o.name.endsWith('slate roof')){
  const n=o.geometry.attributes.normal;
  for(let i=0;i<n.count;i++)assert(n.getY(i)>0,'Slate must face skywards: '+o.name);
 }
});
const serviceWall=new THREE.Box3().setFromObject(service.getObjectByName('Long east service range walls'));
assert(serviceWall.max.y>=9,'The photographed service range has a taller upper storey');
assert.equal(service.userData.openings.filter(o=>o.label==='Rear lane upper sash').length,6);
assert.equal(service.userData.openings.filter(o=>o.label==='Rear lane ground sash').length,2);
assert(service.userData.openings.some(o=>o.label==='Rear lane recessed door'));
const obs=exteriorObstacles(THREE,exterior.model);
for(const x of [235,240,245,247])for(const z of [22,26,30]){
 const hit=roofAt(x,z);
 assert(!hit||hit.point.y<.5,'No roof, wall or trim may remain in the blue-circled footprint');
 assert(!obs.some(o=>obstacleContains(o,x,z)),'The removed bay and old connection must leave walkable ground');
}
for(const view of ['main-admin-annexe-end','main-admin-rear-court']){
 const p=MAIN_ADMIN_VIEWS[view].position;
 assert(!obs.some(o=>obstacleContains(o,p[0],p[2])),'Comparison camera must be in open ground');
}
for(const p of [[228,8],[228,12],[243,10],[243,16]])assert(obs.some(o=>obstacleContains(o,...p)),'New masonry must block walking');
// Img2's blue-circled foreground structure remains outside the reconstruction.
for(const x of [243,245,249])for(const z of [-42,-38,-34]){
 assert(!roofAt(x,z,service)&&!roofAt(x,z,admin),'The excluded blue-circled block must remain unmodelled');
}
console.log('PASS: stepped annexe-end mass, removed blue bay with open ground, pointed red-wing roof, rear projection/stair/flat block, exposed full panes, roof normals, two-storey service edge, camera starts, masonry collisions and blue-block exclusion.');
