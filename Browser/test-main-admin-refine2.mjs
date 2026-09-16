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
const near=(a,b,message)=>assert(Math.abs(a-b)<1e-4,message);
const roofAt=(x,z,group=admin)=>{ray.set(new THREE.Vector3(x,40,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(group,true)[0];};
const tall=bounds('East projecting pavilion walls'),shoulder=bounds('East rear shoulder walls');
assert(tall.max.y>shoulder.max.y,'Rear wall steps down from the tall pavilion');
near(tall.min.z,shoulder.max.z,'Shoulder joins the tall pavilion');
assert(roofAt(228,34).point.y>14.1,'The front pavilion keeps its tall roof');
for(const name of ['Low east side room','East square rear room','Recessed low east connection'])assert(!admin.getObjectByName(name+' walls'),'Do not restore a nonexistent or duplicate room: '+name);
assert(!admin.userData.openings.some(o=>['east low end','east low chamfer','east low south','east rear room sash'].includes(o.face)),'Removed rooms leave no floating windows');
// Blue img1: pitched room, lower link, then the SIDE of the same red court
// block whose frontage appears in img2. There is no extra flat end room.
const step=bounds('East stepped rear link walls'),link=bounds('East recessed rear link walls');
const upper=bounds('East upper return walls'),stair=bounds('Rear canted stair bay walls'),court=bounds('Rear flat court block walls');
near(link.max.z,step.min.z,'Link joins pitched room');near(link.min.z,court.max.z,'Link joins existing court block');near(link.min.x,court.max.x,'Link starts at court block side');
assert(link.max.x<step.max.x-3&&link.max.y<step.max.y-1,'Small-window link is recessed and lower');
near(step.min.x,tall.max.x,'Side room attaches to main building');
for(const [face,count] of [['east corner paired sash',2],['east corner recessed sash',1],['rear court east sash',1],['rear court east basement',1],['east upper return north',2]])assert.equal(admin.userData.openings.filter(o=>o.face===face).length,count,face);
// Three slope planes; a pronounced ridge terminates at the upper wall.
const sideRoof=admin.getObjectByName('East pointed side wing slate roof');
const vertices=sideRoof.geometry.attributes.position,normals=sideRoof.geometry.attributes.normal,points=[];
for(let i=0;i<vertices.count;i++)points.push(sideRoof.localToWorld(new THREE.Vector3().fromBufferAttribute(vertices,i)));
const maxY=Math.max(...points.map(p=>p.y)),minY=Math.min(...points.map(p=>p.y));assert(maxY-minY>2.3,'Pronounced roof pitch');
const ridge=points.filter(p=>Math.abs(p.y-maxY)<1e-5);
near(Math.min(...ridge.map(p=>p.x)),upper.max.x,'Ridge meets upper return wall');
assert(ridge.every(p=>p.z>upper.min.z&&p.z<upper.max.z),'Ridge meets a wall face');
assert(points.every(p=>p.z>=step.min.z-.23&&p.z<=step.max.z+.23),'Hip covers only the two-window room');
const slopes=new Set();for(let i=0;i<normals.count;i++)slopes.add([normals.getX(i),normals.getY(i),normals.getZ(i)].map(v=>v.toFixed(4)).join(','));
assert.equal(slopes.size,3,'Three slopes and no fourth hip against the wall');
const away=roofAt(239,16.2),edge=roofAt(241.5,16.2);
assert.equal(away.object,sideRoof);assert.equal(edge.object,sideRoof);assert(maxY>away.point.y&&away.point.y>edge.point.y,'Outer hip slopes down to eaves');
assert.equal(roofAt(236,11.6).object.name,'East recessed rear link flat roof');
// Freeze the accepted red masses independently of the revised blue sections.
for(const [actual,expected] of [[court.min.x,219],[court.max.x,231.5],[court.min.z,6.2],[court.max.z,10.2],[court.max.y,6.9],[stair.min.x,223.5],[stair.max.x,231.5],[stair.min.z,10.2],[stair.max.z,16.2],[stair.max.y,10.5]])near(actual,expected,'Accepted red block/bay stays in position');
assert.equal(admin.userData.openings.filter(o=>o.face==='rear grouped upper').length,3);
for(const [face,y,h] of [['rear stair upper',8.85,2.45],['rear court upper',4.65,2.65]]){
 const openings=admin.userData.openings.filter(o=>o.face===face);assert.equal(openings.length,2);
 for(const o of openings){near(o.y,y,'Accepted window height');near(o.h,h,'Accepted window proportions');}
}
assert.equal(roofAt(228,8).object.name,'Rear flat court block flat roof');assert.equal(roofAt(228,12).object.name,'Rear canted stair bay slate roof');
// Sample full panes: a roof or wall join must not cover the photograph windows.
for(const opening of admin.userData.openings.filter(o=>/^(east corner|east upper|rear )/.test(o.face))){
 const n=new THREE.Vector3(Math.sin(opening.rotation),0,Math.cos(opening.rotation)),tangent=new THREE.Vector3(Math.cos(opening.rotation),0,-Math.sin(opening.rotation));
 for(const u of [-.4,0,.4])for(const v of [-.4,0,.4]){
  const p=admin.localToWorld(new THREE.Vector3(opening.x,opening.y+v*opening.h,opening.z)).addScaledVector(tangent,u*opening.w);
  ray.set(p.addScaledVector(n,.65),n.clone().negate());assert(ray.intersectObject(admin,true)[0]?.object.isInstancedMesh,'Exposed photo window: '+opening.face);
 }
}
for(const group of [admin,service])group.traverse(o=>{
 if(!o.isMesh)return;for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite),'Finite geometry');
 if(o.name.endsWith('slate roof')){const n=o.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(n.getY(i)>0,'Slate faces skywards: '+o.name);}
});
const serviceWall=new THREE.Box3().setFromObject(service.getObjectByName('Long east service range walls'));assert(serviceWall.max.y>=9);
assert.equal(service.userData.openings.filter(o=>o.label==='Rear lane upper sash').length,6);assert.equal(service.userData.openings.filter(o=>o.label==='Rear lane ground sash').length,2);assert(service.userData.openings.some(o=>o.label==='Rear lane recessed door'));
const obs=exteriorObstacles(THREE,exterior.model);
for(const x of [239,243,247])for(const z of [22,26,30]){const hit=roofAt(x,z);assert(!hit||hit.point.y<.5,'Previously removed forward bay stays absent');assert(!obs.some(o=>obstacleContains(o,x,z)),'Removed forward bay leaves walkable ground');}
for(const view of ['main-admin-annexe-end','main-admin-rear-court']){const p=MAIN_ADMIN_VIEWS[view].position;assert(!obs.some(o=>obstacleContains(o,p[0],p[2])),'Camera starts in open ground');}
for(const p of [[228,8],[228,12],[239,16],[236,11.6]])assert(obs.some(o=>obstacleContains(o,...p)),'Corner masonry blocks walking');
// Green in main_refine3/img2 is the unrelated foreground structure.
for(const x of [243,245,249])for(const z of [-42,-38,-34])assert(!roofAt(x,z,service)&&!roofAt(x,z,admin),'Green-marked structure excluded');
console.log('PASS: shared corner in both photos, three-sided pitched room, recessed link, retained red block/bay, exposed panes, camera starts, collisions and green exclusion.');
