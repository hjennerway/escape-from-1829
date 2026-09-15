import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {sampleEscape} from './dist/escape-cutscene.mjs';
import {MAIN_ADMIN,MAIN_ADMIN_VIEWS,adminMapPoint} from './dist/main-admin-building.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),building=exterior.mainAdmin;
exterior.scene.updateMatrixWorld(true);
assert.equal(building.name,'Main/admin building');
assert.equal(exterior.adminCorridor.parent,exterior.model);
assert(!building.children.includes(exterior.adminCorridor),'Corridor must remain a separate editable structure');
const obs=exteriorObstacles(THREE,exterior.model),ray=new THREE.Raycaster();
for(let i=1;i<=4;i++){
 const view=MAIN_ADMIN_VIEWS['main-admin-'+i];
 assert(!obs.some(o=>obstacleContains(o,view.position[0],view.position[2])),`Photo ${i} must start outside walls`);
}
const concealed=[];
for(const o of building.userData.openings){
 const p=building.localToWorld(new THREE.Vector3(o.x,o.y,o.z)),n=new THREE.Vector3(Math.sin(o.rotation),0,Math.cos(o.rotation));
 ray.set(p.clone().addScaledVector(n,.7),n.clone().negate());
 const hit=ray.intersectObject(exterior.model,true)[0];
 if(!hit?.object.isInstancedMesh)concealed.push([o.face,o.x,o.y,o.z,hit?.object.name]);
}
assert.deepEqual(concealed,[],'Scheduled windows must be exposed');
for(const range of building.userData.ranges){
 const [a,b,c,d]=range.rect,p=adminMapPoint(a,b),q=adminMapPoint(c,d);
 assert(Math.abs(range.x+MAIN_ADMIN.x-(p[0]+q[0])/2)<1e-8);
 assert(Math.abs(range.w-(q[0]-p[0]))<1e-8);
 ray.set(new THREE.Vector3(range.x+MAIN_ADMIN.x+.3,40,range.z+MAIN_ADMIN.z+.7),new THREE.Vector3(0,-1,0));
 assert(ray.intersectObject(building,true).some(h=>h.object.name.endsWith('slate roof')&&h.face.normal.y>0),'Each range needs upward-facing slate');
 assert(obs.some(o=>obstacleContains(o,range.x+MAIN_ADMIN.x,range.z+MAIN_ADMIN.z)),'Masonry must block walking');
}
for(let x=140;x<245;x+=2)assert(!obs.some(o=>obstacleContains(o,x,47)),'Front carriage approach stays walkable');


// The expanded escape pan must retain the new facade in every supported aspect.
for(const aspect of [16/9,4/3,9/16])for(const seconds of [0,5,10]){
 const shot=sampleEscape(seconds,{aspect}),camera=new THREE.PerspectiveCamera(46,aspect,.5,2000);
 camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
 for(const x of [140,235])for(const z of [5,42])for(const y of [0,22]){
  const p=new THREE.Vector3(x,y,z).project(camera);assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'Admin building must remain in the escape pan');
 }
}

console.log('PASS: OS registration, four photo starts, exposed sashes, slate roofs, masonry collision, clear approach and separate corridor.');
