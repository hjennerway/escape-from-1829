import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {PHARMACY_VIEWS,PHARMACY_TANKS} from './dist/pharmacy-court.mjs';
import {TOWER_RANGES,TOWER_WORKSHOP_COPY} from './dist/tower-buildings.mjs';
import {ESTATE_CHIMNEY} from './dist/estate-chimney.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,4/3),layouts=createAerialLayouts(THREE,exterior),group=layouts.towerBuildings;
exterior.model.updateMatrixWorld(true);
const tanks=group.children.filter(o=>o.userData.pharmacyTank);
assert.equal(tanks.length,2,'Exactly two ground-mounted gas cylinders');
const obstacles=exteriorObstacles(THREE,exterior.model);
const buildingParts=group.children.filter(o=>!o.userData.pharmacyTank),clearanceRay=new THREE.Raycaster();
for(const tank of tanks){
 const {x,z,radius,height,name}=tank.userData.pharmacyTank;
 const bounds=new THREE.Box3().setFromObject(tank);
 assert(Math.abs(bounds.min.y)<1e-6&&bounds.max.y>height,'Each complete tank stands on the ground');
 assert.equal(tank.parent,group,'Tanks belong to the same Historic layer as their court');
 assert.equal(tank.getObjectByName(name+' vertical corrugations').count,128);
 for(const range of TOWER_RANGES){
  const [x0,z0,x1,z1]=range.rect,dx=Math.max(x0-x,0,x-x1),dz=Math.max(z0-z,0,z-z1);
  const gap=Math.hypot(dx,dz)-(radius+.12);
  if(range.name==='Chimney service hall')assert(gap>.25&&gap<.8,'Both cylinder bases must almost touch the blue-circled hall without overlap');
  else assert(gap>.68,'Gas cylinder must clear other walls and workshop entrances: '+range.name);
 }
 const chimneyDistance=Math.hypot(x-ESTATE_CHIMNEY.x,z-ESTATE_CHIMNEY.z);
 assert(chimneyDistance>radius+2.8+.8,'Relocated cylinders clear the fixed chimney foundation');
 assert(Math.abs(bounds.getCenter(new THREE.Vector3()).z+18.9)<1e-5,'The complete cylinders move towards Main/admin');
 // Check the real roof, coping, and wall surfaces at several cylinder heights.
 clearanceRay.far=radius+.14;
 for(const y of [.3,2.7,6.4,6.55,9,11.5])for(let i=0;i<64;i++){
  const angle=i*Math.PI/32;
  clearanceRay.set(new THREE.Vector3(x,y,z),new THREE.Vector3(Math.cos(angle),0,Math.sin(angle)));
  assert(!clearanceRay.intersectObjects(buildingParts,true).length,'Cylinder shell and plinth must clear the actual building geometry');
 }
 assert(obstacles.some(b=>obstacleContains(b,x,z)),'Gas cylinder must block walking through its base');
 assert(!obstacles.some(b=>obstacleContains(b,x+radius*.83,z+radius*.83,0)),'Tank collisions follow the round footprint, not an oversized square');
 tank.traverse(o=>{if(o.isMesh)for(const attribute of Object.values(o.geometry.attributes))assert([...attribute.array].every(Number.isFinite),'Tank geometry must be finite');});
}
const [a,b]=PHARMACY_TANKS;
assert(Math.hypot(a.x-b.x,a.z-b.z)>a.radius+b.radius+2,'There must be a walking gap between the two cylinders');
const photo=PHARMACY_VIEWS['pharmacy-photo'];
assert(!obstacles.some(b=>obstacleContains(b,photo.position[0],photo.position[2])),'New photo viewpoint starts outside all collisions');
// The hall-side gap is deliberately narrow. Walk behind, beside and between
// the moved cylinders, rather than through their near-touching wall gap.
for(const [start,target] of [
 [[184,-44],[232,-44]],
 [[163,-25],[163,-14]],
 [[174.8,-26],[174.8,-14]],
 [[186.99,-26],[186.99,-14]],
 [[164,-24.5],[186,-24.5]]
]){
 const camera=new THREE.PerspectiveCamera(),walker=createWalker(camera,obstacles);
 walker.setView({position:[start[0],1.8,start[1]],target:[target[0],1.8,target[1]]});walker.keys.add('KeyW');
 for(let i=0;i<Math.ceil(Math.hypot(target[0]-start[0],target[1]-start[1])/.5);i++)walker.update(.1);
 assert(Math.hypot(camera.position.x-target[0],camera.position.z-target[1])<.6,'The cylinder access route remains open: '+start+' to '+target+'; stopped at '+camera.position.toArray());
}
// The Irby corridor correction moves the common rear edge towards Main/admin.
// Irby's placement stays fixed, with clearance around its extended end.
assert.deepEqual(exterior.irbyAshley.position.toArray(),[234,0,-93.4]);
const irbyEnd=exterior.irbyAshley.userData.roofs.find(r=>r.name==='Tower-side return').rect[3];
const irbyObstacles=exteriorObstacles(THREE,exterior.irbyAshley);
for(const range of [...TOWER_RANGES.filter(r=>r.name.startsWith('Rear ')),TOWER_WORKSHOP_COPY]){
 assert(Math.abs(range.rect[1]+63.9)<1e-9,'All three rear walls meet the new Irby corridor');
 assert(range.rect[1]>irbyEnd,'Workshop rear clears Irby without overlap');
 const bounds=new THREE.Box3().setFromObject(group.getObjectByName(range.name+' walls'));
 for(let x=bounds.min.x+.1;x<bounds.max.x;x+=.5)for(let z=bounds.min.z+.1;z<bounds.max.z;z+=.5){
  assert(!irbyObstacles.some(o=>obstacleContains(o,x,z,.25)),'No moved workshop may intersect Irby');
 }
}
const rear=group.userData.pharmacy.windows;
assert(rear.filter(w=>w.y>4).length>=9&&rear.filter(w=>w.y<4).length>=7,'The three existing rear ranges need both rows of windows');
const ray=new THREE.Raycaster();
for(const w of rear){
 ray.set(new THREE.Vector3(w.x,w.y,w.z-.65),new THREE.Vector3(0,0,1));
 assert(ray.intersectObject(group,true)[0]?.object.isInstancedMesh,'Rear glazing must be exposed in front of its host wall');
}
assert.equal(group.userData.pharmacy.stairs.length,2);
for(const stair of group.userData.pharmacy.stairs){
 const treads=group.children.filter(o=>o.name===stair.name+' stone tread');
 assert.equal(treads.length,6);
 assert(treads.every((o,i)=>i===0||o.position.y>treads[i-1].position.y),'Treads rise monotonically to the door landing');
 const landing=group.getObjectByName(stair.name+' stone landing');
 assert(Math.abs(treads.at(-1).position.y+.055-(landing.position.y+.06))<.025,'Stair flight meets its landing without a height gap');
 assert(obstacles.some(b=>obstacleContains(b,stair.x,stair.z-1)),'Raised landings retain solid foundations');
}
for(const historic of [false,true])for(const modern of [false,true]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 const visibleObstacles=exteriorObstacles(THREE,exterior.model);
 for(const tank of PHARMACY_TANKS)assert.equal(visibleObstacles.some(b=>obstacleContains(b,tank.x,tank.z)),historic,'Tank collisions must follow Historic visibility');
}
console.log('PASS: pharmacy rear glazing and stairs, two ribbed gas cylinders, building clearance, circular collisions, Historic visibility and walking routes around both tanks.');
