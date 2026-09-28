import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {MAIN_KITCHEN as b,MAIN_KITCHEN_WALK} from './dist/main-kitchen.mjs';
import {FARNDON_CORRIDOR} from './dist/farndon-corridor.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
const kitchen=exterior.adminCorridor.getObjectByName('Main kitchen');
exterior.model.updateMatrixWorld(true);
assert(kitchen);assert.equal(kitchen.userData.storeys,1);
const walls=new THREE.Box3().setFromObject(kitchen.getObjectByName('Main kitchen walls'));
for(const [value,expected] of [[walls.min.x,120],[walls.max.x,153.6],[walls.min.z,-26.6],[walls.max.z,6.6],[walls.max.y,4.8]])assert(Math.abs(value-expected)<1e-5);
assert(Math.abs(b.maxX-(FARNDON_CORRIDOR.x-FARNDON_CORRIDOR.width/2))<1e-8,'East wall joins the existing gallery exactly');
const connector=exterior.adminCorridor.userData.sections.find(s=>s.name==='Connecting corridor');
assert(Math.abs(b.maxZ-(connector.cz-connector.depth/2))<1e-8,'South wall joins the low connector exactly');
for(const section of exterior.adminCorridor.userData.sections){
 const area=Math.max(0,Math.min(b.maxX,section.end)-Math.max(b.minX,section.start))*Math.max(0,Math.min(b.maxZ,section.cz+section.depth/2)-Math.max(b.minZ,section.cz-section.depth/2));
 assert(area<1e-8,'Kitchen and connector footprints must not overlap');
}
const roofs=kitchen.children.filter(o=>/^Main kitchen white hipped roof \d$/.test(o.name));assert.equal(roofs.length,3);
for(const roof of roofs){
 assert(roof.material.color.r>.82&&roof.material.color.g>.82&&roof.material.color.b>.82,'All three roof sections are white (linear colour channels)');
 const normals=roof.geometry.attributes.normal;
 for(let i=0;i<normals.count;i++)assert(normals.getY(i)>0,'Every hip/slope faces upwards');
}
const ray=new THREE.Raycaster();
function hits(objects,x,z){ray.set(new THREE.Vector3(x,40,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(objects,true);}
// The pale trim must stand clear of the masonry, rather than share its
// outward face and flicker as the camera moves along the roof edge.
for(const side of [-1,1]){
 const z=side<0?b.minZ:b.maxZ;
 for(const x of [b.minX+3,(b.minX+b.maxX)/2,b.maxX-3]){
  ray.set(new THREE.Vector3(x,b.eaves-.07,z+side),new THREE.Vector3(0,0,-side));
  const trimHit=ray.intersectObjects(kitchen.children.filter(o=>o.name==='Main kitchen fascia'))[0];
  const wallHit=ray.intersectObject(kitchen.getObjectByName('Main kitchen walls'))[0];
  assert(trimHit&&wallHit&&wallHit.distance-trimHit.distance>=.015,'Fascia face must project clear of the kitchen brickwork');
 }
 const x=side<0?b.minX:b.maxX;
 ray.set(new THREE.Vector3(x+side,b.eaves-.07,(b.minZ+b.maxZ)/2),new THREE.Vector3(-side,0,0));
 const gutterHit=ray.intersectObjects(kitchen.children.filter(o=>o.name==='Main kitchen side gutter'))[0];
 const wallHit=ray.intersectObject(kitchen.getObjectByName('Main kitchen walls'))[0];
 assert(gutterHit&&wallHit&&wallHit.distance-gutterHit.distance>=.015,'Side gutter face must project clear of the kitchen brickwork');
}
// Three arms meet: the cross-gallery cap ends flush at the west face of the
// continuing north/south ridge, with no fourth arm or coplanar cap overlap.
const crossRidge=new THREE.Box3().setFromObject(exterior.adminCorridor.getObjectByName('Connecting corridor ridge'));
for(const name of ['Straight corridor to Farndon ridge','Main/admin front corridor ridge']){
 const throughRidge=new THREE.Box3().setFromObject(exterior.adminCorridor.getObjectByName(name));
 assert(Math.abs(crossRidge.max.x-throughRidge.min.x)<1e-5,'Cross-gallery ridge must terminate flush at the through ridge to form a T');
 assert(Math.abs(crossRidge.max.y-throughRidge.max.y)<1e-5,'All three ridge arms meet at one height');
}
// Sample the entire footprint, especially the cut-away stores corner and the
// formerly deeper connector, to catch hidden foundation and roof overlaps.
for(let x=b.minX+.4;x<b.maxX;x+=.8)for(let z=b.minZ+.4;z<b.maxZ;z+=.8){
 assert(hits(roofs,x,z).length,'No holes between the three hipped sections');
 assert(!hits([layouts.towerBuildings],x,z).some(h=>h.point.y>.6),'Stores walls, trim and roof must clear the kitchen');
}
const midZ=(b.minZ+b.maxZ)/2,bay=(b.maxX-b.minX)/3;
for(let i=0;i<3;i++){
 const ridge=hits(roofs,b.minX+(i+.5)*bay,midZ)[0];
 const eave=hits(roofs,b.minX+i*bay+.01,midZ)[0];
 assert(ridge.point.y-eave.point.y>2.6,'Each section supplies a distinct /\\ peak');
 // Both ends slope down to the same eave: actual hips, not vertical gables.
 for(const z of [b.minZ+.02,b.maxZ-.02])assert(hits(roofs,b.minX+(i+.5)*bay,z)[0].point.y<4.92);
}
const storesWalls=layouts.towerBuildings.getObjectByName('West stores flat front walls');
assert.equal(storesWalls.userData.collisionFootprint.length,6,'Stores retain a real L-shaped footprint');
for(const p of [[150,-30],[158,-20]])assert(hits([storesWalls],...p).length,'Retain both arms of the stores');
for(const historic of [false,true])for(const modern of [false,true]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 const obstacles=exteriorObstacles(THREE,exterior.model);
 for(const p of [[130,-10],[150,-23],[128,4]])assert.equal(obstacles.some(o=>obstacleContains(o,...p)),historic,'Kitchen collisions follow Historic visibility');
 assert(!obstacles.some(o=>obstacleContains(o,MAIN_KITCHEN_WALK.position[0],MAIN_KITCHEN_WALK.position[2])),'Walking view starts outside buildings');
}
console.log('PASS: three white four-sided hips, continuous roof coverage, /\\/\\/\\ profile, clear eave trim, T-shaped ridge caps, flush gallery joins, no connector/stores overlap, preserved L-shaped stores, and layout-aware walking collisions.');
