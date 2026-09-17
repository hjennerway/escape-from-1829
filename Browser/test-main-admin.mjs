import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ESTATE_CHIMNEY} from './dist/estate-chimney.mjs';
import {ESCAPE_WATER_TOWER} from './dist/water-tower.mjs';
import {sampleEscape} from './dist/escape-cutscene.mjs';
import {MAIN_ADMIN,MAIN_ADMIN_VIEWS,adminMapPoint} from './dist/main-admin-building.mjs';
import {ADMIN_FRONT_CORRIDOR} from './dist/admin-front-corridor.mjs';
import {FARNDON_CORRIDOR} from './dist/farndon-corridor.mjs';
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
 assert(ray.intersectObject(building,true).some(h=>h.object.name.endsWith(range.roof==='flat'?'flat roof':'slate roof')&&h.face.normal.y>0),'Each range needs its upward-facing roof');
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


// The removed front corners must be open above ground and walkable; geometry
// and collision must both follow the chamfers, rather than their enclosing box.
const bays=[];building.traverse(o=>{if(o.name==='Chamfered two-storey bay walls')bays.push(o);});
assert.equal(bays.length,2);
for(const bay of bays){
 for(const side of [-1,1]){
  const p=bay.localToWorld(new THREE.Vector3(side*3.99,30,1.99));
  ray.set(p,new THREE.Vector3(0,-1,0));
  assert(!ray.intersectObject(building,true).some(h=>h.point.y>.5),'Cut bay corner must have no masonry or roof');
  assert(!obs.some(o=>obstacleContains(o,p.x,p.z)),'Cut bay corner must be walkable');
 }
 const p=bay.localToWorld(new THREE.Vector3(0,1.8,1));
 assert(obs.some(o=>obstacleContains(o,p.x,p.z)),'Central bay masonry must still stop walking');
}
// The new notch in the low west wing is open from the forecourt to the
// recessed corridor door. Its old full-depth wall and roof must both be gone.
for(const x of [156.6,158.7])for(const z of [32,33.4]){
 ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
 assert(!ray.intersectObject(building,true).some(h=>h.point.y>.5),'Low wing front recess must remain open to the sky');
 assert(!obs.some(o=>obstacleContains(o,x,z)),'Low wing front recess must remain walkable');
}
const lowFront=building.userData.openings.filter(o=>o.face==='low west frontage');
assert.equal(lowFront.length,3);
assert(!building.userData.openings.some(o=>o.face==='recessed low connection'),'The marked end has a door instead of the old sash');
assert(!building.getObjectByName('Recessed low west connection walls'),'The offset room is replaced by the aligned corridor');
const r=ADMIN_FRONT_CORRIDOR,corridor=exterior.adminCorridor;
const extension=corridor.getObjectByName(r.name),door=corridor.getObjectByName('Main/admin corridor front doorway');
const near=(a,b,message)=>assert(Math.abs(a-b)<1e-5,message);
assert.deepEqual(extension.userData.centerline,[[156.3,30.6],[156.3,9.8]],'Only the new front extension occupies the marked route');
const existingAxis=corridor.getObjectByName('Straight corridor to Farndon').userData.centerline;
assert.deepEqual(existingAxis[0],[156.3,9.8],'The existing Farndon corridor start stays fixed');
near(existingAxis[1][0],156.3,'Existing Farndon x stays fixed');near(existingAxis[1][1],-132.1,'Existing Farndon endpoint stays fixed');
near(door.userData.door.x,FARNDON_CORRIDOR.x,'Door is on the existing Farndon axis');
near(door.userData.door.z,30.6,'Door retains the marked recessed frontage');
assert(door.userData.door.z<MAIN_ADMIN.z+lowFront[0].z-3,'Door steps back behind the three-window room');
const roomBounds=new THREE.Box3().setFromObject(building.getObjectByName('Low west side rooms walls'));
near(roomBounds.min.x,147,'Outer low-room wall stays fixed');
near(roomBounds.min.z,17.8,'Low-room rear stays fixed');near(roomBounds.max.z,33.8,'Low-room frontage stays fixed');
near(roomBounds.max.x,r.x-r.width/2,'Only the inner room edge gives way to the corridor');
// Sample both sides of the T junction and the complete new corridor width.
for(let z=r.joinZ-.5;z<r.frontZ;z+=.25){
 for(const dx of [-2.5,0,2.5]){
  ray.set(new THREE.Vector3(r.x+dx,15,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(corridor,true).find(h=>h.object.name.endsWith('slate roof'));
  assert(hit&&hit.point.y>=r.height,'The front extension has continuous roof coverage');
  if(dx===0)near(hit.point.y,r.height+.06+r.rise,'A single level ridge runs through the existing junction');
  assert(obs.some(o=>obstacleContains(o,r.x+dx,z)),'Extension walls block exterior walking');
 }
}
for(const x of [r.x+.445,r.x-.445]){
 ray.set(new THREE.Vector3(x,2.12,r.frontZ+1),new THREE.Vector3(0,0,-1));
 assert.equal(ray.intersectObject(exterior.model,true)[0]?.object.name,'Corridor door glazing','New door panes are fully exposed');
}
ray.set(new THREE.Vector3(r.x,4.05,r.frontZ+1),new THREE.Vector3(0,0,-1));
assert.equal(ray.intersectObject(corridor,true)[0]?.object.name,'Main/admin corridor front brick gable','The roof end above the door is closed');
for(let z=r.frontZ+.8;z<=46;z+=.5)assert(!obs.some(o=>obstacleContains(o,r.x,z)),'Door can be approached directly from the front');
for(const group of [extension,door])group.traverse(o=>{
 if(!o.isMesh)return;
 for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite),'Finite new geometry');
 if(o.name.endsWith('slate roof'))for(const y of o.geometry.attributes.normal.array.filter((_,i)=>i%3===1))assert(y>0,'New slate faces upward');
});


// The east photo replaces the invented window grid and keeps the low wing exposed.
const eastShot=MAIN_ADMIN_VIEWS['main-admin-east'];
assert(!obs.some(o=>obstacleContains(o,eastShot.position[0],eastShot.position[2])),'East photo camera must start in open ground');
assert(eastShot.position[0]>eastShot.target[0]&&eastShot.position[2]>eastShot.target[2],'Marked camera must look northwest');
assert.equal(building.userData.openings.filter(o=>o.face==='east photo upper column').length,2);
assert.equal(building.userData.openings.filter(o=>o.face==='east low end').length,0);
assert(!building.userData.openings.some(o=>o.face==='east return inferred'));
for(const name of ['East curved carriage drive','East wing side access']){const road=building.getObjectByName(name);assert(road&&road.geometry.attributes.normal.getY(0)>.99,'East approach gravel must face upwards');}
const chimney=exterior.estateChimney,bounds=new THREE.Box3().setFromObject(chimney);
assert.equal(chimney.parent,exterior.model,'Freestanding chimney must be independent of the admin building');
assert(Math.abs(bounds.max.y-bounds.min.y-ESCAPE_WATER_TOWER.height*1.3)<1e-5,'Chimney must be exactly 1.3 times the water tower');
assert.deepEqual([chimney.position.x,chimney.position.z],[177.5,-35.5],'The chimney stays at the red X while the buildings move');
// The new chimney anchor lies to the right and forward of the water tower.
assert(chimney.position.x>ESCAPE_WATER_TOWER.x&&chimney.position.z>ESCAPE_WATER_TOWER.z);
assert(obs.some(o=>obstacleContains(o,ESTATE_CHIMNEY.x,ESTATE_CHIMNEY.z)),'Chimney base must block walking');
ray.set(new THREE.Vector3(ESTATE_CHIMNEY.x,ESTATE_CHIMNEY.height+1,ESTATE_CHIMNEY.z),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(chimney,true)[0].object.name,'Recessed chimney opening','The top must have an open, recessed throat');
for(const aspect of [16/9,4/3,9/16])for(const seconds of [0,5,10]){
 const shot=sampleEscape(seconds,{aspect}),camera=new THREE.PerspectiveCamera(46,aspect,.5,2000);camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
 for(const y of [0,ESTATE_CHIMNEY.height]){const p=new THREE.Vector3(ESTATE_CHIMNEY.x,y,ESTATE_CHIMNEY.z).project(camera);assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'Freestanding chimney must fit the escape pan');}
}

console.log('PASS: east photo geometry, marked camera, independent chimney height/location, chamfered bays, open low-wing recess, OS registration, four photo starts, exposed sashes, slate roofs, masonry collision, clear approach and separate corridor.');
