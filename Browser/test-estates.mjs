import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {ESTATES_SOURCE_FOOTPRINT,ESTATES_FOOTPRINT,ESTATES_VIEWS} from './dist/estates-department.mjs';
import {historicOSPoint,pointInFootprint} from './dist/historic-footprints.mjs';
import {MAIN_ADMIN_VIEWS} from './dist/main-admin-building.mjs';
import {OS_FOOTPRINTS} from './dist/historic-footprint-data.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),building=exterior.estatesDepartment;
const layouts=createAerialLayouts(THREE,exterior);exterior.scene.updateMatrixWorld(true);
assert.equal(building.name,'Estates department');assert.equal(building.parent,layouts.historic);
assert.deepEqual(ESTATES_SOURCE_FOOTPRINT,OS_FOOTPRINTS[1].loops[0].map(p=>historicOSPoint(...p)),'Keep the selected OS shape');
assert(Math.abs(building.rotation.y+19*Math.PI/180)<1e-12,'The yellow guide requires a 19-degree clockwise turn');
assert.deepEqual(building.position.toArray(),[246.3,0,-49.5],'Move the blue-marked edge onto the yellow guide without another rotation');
const world=([x,z],y=0)=>building.localToWorld(new THREE.Vector3(x-244,y,z+49.5));
const ground=p=>{const v=world(p);return [v.x,v.z];};
const samples=points=>points.map(ground);
for(let i=0;i<ESTATES_SOURCE_FOOTPRINT.length;i++){
 const a=ESTATES_SOURCE_FOOTPRINT[i],b=ESTATES_SOURCE_FOOTPRINT[(i+1)%ESTATES_SOURCE_FOOTPRINT.length];
 const p=ESTATES_FOOTPRINT[i],q=ESTATES_FOOTPRINT[(i+1)%ESTATES_FOOTPRINT.length];
 assert(Math.abs(Math.hypot(b[0]-a[0],b[1]-a[1])-Math.hypot(q[0]-p[0],q[1]-p[1]))<1e-9,'Rotation must preserve every wall length');
 assert(Math.hypot(...p.map((v,k)=>v-ground(a)[k]))<1e-9,'Exported footprint must follow the rendered transform');
}
const wallBounds=new THREE.Box3();
for(const s of building.userData.ranges)wallBounds.union(new THREE.Box3().setFromObject(building.getObjectByName(s.name)));
const xs=ESTATES_FOOTPRINT.map(p=>p[0]),zs=ESTATES_FOOTPRINT.map(p=>p[1]);
assert(Math.abs(wallBounds.min.x-Math.min(...xs))<.001&&Math.abs(wallBounds.max.x-Math.max(...xs))<.001);
assert(Math.abs(wallBounds.min.z-Math.min(...zs))<.001&&Math.abs(wallBounds.max.z-Math.max(...zs))<.001);
// Independent points distinguish every wing, the left step and open entrance.
const solids=samples([[251,-49],[251,-60],[245,-39],[237,-39],[244,-59],[236,-54]]);
const open=samples([[236,-47],[240,-48],[244,-52],[229,-47],[232,-58],[256,-49]]);
const obstacles=exteriorObstacles(THREE,exterior.model),ray=new THREE.Raycaster();
const down=(x,z)=>{ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(building,true)[0];};
for(const p of solids){
 assert(pointInFootprint(p,ESTATES_FOOTPRINT),'OS mass missing at '+p);
 assert(down(...p)?.point.y>2.8,'Every range needs a roof at '+p);
 assert(obstacles.some(o=>obstacleContains(o,...p)),'Every range must block walking at '+p);
}
for(const p of open){
 assert(!pointInFootprint(p,ESTATES_FOOTPRINT),'Court or external ground filled at '+p);
 assert((down(...p)?.point.y??0)<.5,'Roof must not cover open ground at '+p);
}
// Sample the whole solid trace, including the upper roof valley.
for(let x=234.4;x<253.5;x+=.8)for(let z=-62.2;z<-36.8;z+=.8)
 if(pointInFootprint([x,z],ESTATES_SOURCE_FOOTPRINT))assert(down(...ground([x,z]))?.point.y>2.75,'Uncovered building area at '+[x,z]);
for(const p of [...samples([[236,-47],[240,-48],[244,-52]]),ESTATES_VIEWS['estates-photo'].position.filter((_,i)=>i!==1)])
 assert(!obstacles.some(o=>obstacleContains(o,...p)),'Court and photo start must be walkable at '+p);
const walker=createWalker(exterior.camera,obstacles);
const walkStart=world([228,-47.5],1.9),walkTarget=world([248,-47.5],1.9);
walker.setView({position:walkStart.toArray(),target:walkTarget.toArray()});walker.keys.add('KeyW');
for(let i=0;i<30;i++)walker.update(.1);
assert(exterior.camera.position.clone().sub(walkStart).dot(walkTarget.clone().sub(walkStart).normalize())>14,'Walking must pass through the rotated gate into the court');
const adminShot=MAIN_ADMIN_VIEWS['main-admin-rear-court'];
const adminStart=new THREE.Vector3(...adminShot.position),adminDirection=new THREE.Vector3(...adminShot.target).sub(adminStart);
ray.set(adminStart,adminDirection.clone().normalize());ray.far=adminDirection.length();
assert.equal(ray.intersectObject(building,true).length,0,'Estates must leave the existing Main/admin camera sightline clear');
ray.far=Infinity;
assert.equal(building.userData.doors.length,2,'The photo has two blue office doors');
for(const o of building.userData.openings){
 const n=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r)).transformDirection(building.matrixWorld),point=building.localToWorld(new THREE.Vector3(o.x,o.y,o.z));
 ray.set(point.clone().addScaledVector(n,.65),n.negate());
 assert(ray.intersectObject(building,true)[0]?.object.isInstancedMesh,'Window must be exposed: '+JSON.stringify(o));
}
for(const sign of building.children.filter(o=>o.name==='Estates department entrance plaque')){
 for(const u of [-.62,0,.62]){const p=sign.localToWorld(new THREE.Vector3(u,0,0)),n=new THREE.Vector3(0,0,1).transformDirection(sign.matrixWorld);ray.set(p.clone().addScaledVector(n,.5),n.negate());assert.equal(ray.intersectObject(building,true)[0]?.object,sign,'Gate piers must not obscure plaque lettering');}
}
building.traverse(o=>{
 if(!o.isMesh)return;
 for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite),'Geometry must be finite');
 if(o.name.endsWith('slate roof')){const n=o.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(n.getY(i)>0,'Roof must face upwards');}
});
const remaining=layouts.historicRoads.userData.missingFootprints.segments;
assert(!remaining.some(s=>s.sourceBuilding===1),'Retire the selected outline');
assert(remaining.some(s=>s.sourceBuilding===2),'Retain the small neighbouring outline');
for(const historic of [false,true])for(const modern of [false,true]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 let visible=true;for(let o=building;o;o=o.parent)visible&&=o.visible;
 assert.equal(visible,historic);
 assert.equal(exteriorObstacles(THREE,exterior.model).some(o=>obstacleContains(o,...ground([251,-49]))),historic,'Hidden Estates must not leave collisions');
}
console.log('PASS: Estates clockwise alignment, preserved OS dimensions, stepped wings, open court, roof coverage, exposed glazing, door pair, walking access, selective trace retirement and Historic visibility.');
