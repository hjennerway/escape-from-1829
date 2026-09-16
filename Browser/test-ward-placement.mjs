import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {createIrbyAshley,IRBY_ASHLEY_VIEWS} from './dist/irby-ashley.mjs';
import {createFarndon,FARNDON_VIEWS} from './dist/farndon-ward.mjs';
import {createWitbyWard,WITBY_VIEWS} from './dist/witby-ward.mjs';
import {createGraftonEdge,GRAFTON_EDGE_VIEWS} from './dist/grafton-edge.mjs';
import {createHaleWard,HALE_WARD_VIEWS} from './dist/hale-daresbury-huxley-dunham.mjs';
import {createMainAdminBuilding} from './dist/main-admin-building.mjs';
import {wardMapPoint} from './dist/ward-placement.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const material=color=>new THREE.MeshStandardMaterial({color});
const materials={brick:material(0x884433),roof:material(0x334455),worldUV:g=>g,material};
const sourceFarndon=createFarndon(THREE,materials),sourceWitby=createWitbyWard(sourceFarndon);
// Existing corridor-contact window omissions are preserved through the move.
sourceFarndon.getObjectByName('Farndon rear connection sash').removeFromParent();
sourceWitby.getObjectByName('Witby rear connection sash').removeFromParent();
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
exterior.model.updateMatrixWorld(true);
assert.deepEqual(exterior.chapel.position.toArray(),[-4.9,0,-119.2]);
assert.deepEqual(exterior.churtonWard.position.toArray(),[-44.3,0,-65.9]);
for(const [pixel,expected] of [[[208,318],[-4.9,-119.2]],[[252,322],[-44.3,-65.9]]]){
 assert(wardMapPoint(pixel).every((value,i)=>Math.abs(value-expected[i])<1e-10),'Both fixed map anchors match exactly');
}
function compareGeometry(moved,source,ignoreRootPosition=false){
 const actual=[],original=[];moved.traverse(o=>actual.push(o));source.traverse(o=>original.push(o));
 assert.equal(actual.length,original.length);
 for(let i=0;i<actual.length;i++){
  const a=actual[i],b=original[i];assert.equal(a.name,b.name);
  if(i!==0||!ignoreRootPosition)assert.deepEqual(a.position.toArray(),b.position.toArray(),a.name+' position');
  assert.deepEqual(a.quaternion.toArray(),b.quaternion.toArray(),a.name+' orientation');
  assert.deepEqual(a.scale.toArray(),b.scale.toArray(),a.name+' size');
  if(a.geometry)assert.deepEqual(a.geometry.attributes.position.array,b.geometry.attributes.position.array,a.name+' vertices');
  if(a.instanceMatrix)assert.deepEqual(a.instanceMatrix.array,b.instanceMatrix.array,a.name+' instance transforms');
 }
}
compareGeometry(exterior.adminCorridor,createMainAdminBuilding(THREE,materials).corridor);
const cases=[
 ['irbyAshley',createIrbyAshley(THREE,materials),[234,-93.4],IRBY_ASHLEY_VIEWS,'irby-ashley-1'],
 ['farndonWard',sourceFarndon,[173.7,-145.4],FARNDON_VIEWS,'farndon-2'],
 ['witbyWard',sourceWitby,[133,-207.5],WITBY_VIEWS,'witby-ground'],
 ['graftonEdge',createGraftonEdge(THREE,materials),[73.5,-155.8],GRAFTON_EDGE_VIEWS,'grafton-edge-ground'],
 ['haleWard',createHaleWard(THREE,materials),[121.3,-98.7],HALE_WARD_VIEWS,'hale-daresbury-huxley-dunham-ground']
];
const obstacles=exteriorObstacles(THREE,exterior.model);
for(const [key,source,[x,z],views,walkingView] of cases){
 const ward=exterior[key];assert.deepEqual(ward.position.toArray(),[x,0,z]);
 compareGeometry(ward,source,true);
 const dx=x-source.position.x,dz=z-source.position.z;
 const shifted=source.userData.footprint.map(([px,pz])=>[px+dx,pz+dz]);
 assert.deepEqual(ward.userData.footprint,shifted,'World footprint follows '+key);
 assert.equal(ward.userData.source.x,x);assert.equal(ward.userData.source.z,z);
 const camera=views[walkingView].position;
 assert(!obstacles.some(o=>obstacleContains(o,camera[0],camera[2])),key+' walking camera remains on open ground');
 const plan=Object.entries(views).find(([name])=>name.endsWith('-plan'))[1];
 assert(Math.hypot(plan.target[0]-x,plan.target[2]-z)<2,key+' plan stays centred');
 const bounds=new THREE.Box3().setFromObject(ward),sourceBounds=new THREE.Box3().setFromObject(source);
 assert(bounds.getSize(new THREE.Vector3()).distanceTo(sourceBounds.getSize(new THREE.Vector3()))<1e-8,'Complete building dimensions are preserved');
 const wardObstacles=exteriorObstacles(THREE,ward);
 assert(wardObstacles.length>0);
 for(const obstacle of wardObstacles)assert(obstacle.minX>=bounds.min.x-1&&obstacle.maxX<=bounds.max.x+1&&obstacle.minZ>=bounds.min.z-1&&obstacle.maxZ<=bounds.max.z+1,'Collision follows the moved building');
}
const collisionKeys=cases.map(([key])=>[key,JSON.stringify(exteriorObstacles(THREE,exterior[key])[0])]);
for(const historic of [false,true])for(const modern of [false,true]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 const visible=new Set(exteriorObstacles(THREE,exterior.model).map(obstacle=>JSON.stringify(obstacle)));
 for(const [key,collision] of collisionKeys)assert.equal(visible.has(collision),historic,key+' collisions follow Historic visibility');
}
console.log('PASS: five corrected positions, both fixed anchors, source building geometry, generated corridor geometry, translated footprints, plan/walking cameras and Historic collisions.');
