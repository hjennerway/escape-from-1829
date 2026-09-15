import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {FRONT_BOUNDARY} from './dist/front-boundary-wall.mjs';
import {lanePointAtX} from './dist/modern-entrance.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16}},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,16/9),layouts=createAerialLayouts(THREE,exterior);
layouts.setVisible('historic',false);layouts.setVisible('modern',true);exterior.scene.updateMatrixWorld(true);
const wall=exterior.model.getObjectByName('Front boundary wall');assert.deepEqual(wall.position.toArray(),[0,0,18]);assert.deepEqual(wall.rotation.toArray().slice(0,3),[0,0,0]);
const bounds=new THREE.Box3().setFromObject(wall);assert(bounds.min.z>66&&bounds.max.z<68,'Whole boundary must move toward the lane without rotation');
const obs=exteriorObstacles(THREE,exterior.model);
assert(obs.some(o=>obstacleContains(o,-10,FRONT_BOUNDARY.z)),'Moved masonry must block walking');assert(!obs.some(o=>obstacleContains(o,-10,49)),'No obsolete wall collision may remain');
const surfaces=[];exterior.model.traverseVisible(o=>{if(o.isMesh)surfaces.push(o)});const ray=new THREE.Raycaster();function surfaceAt(x,z){ray.set(new THREE.Vector3(x,40,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(surfaces,false)[0];}
for(const x of [-40,30,70])assert.equal(surfaceAt(x,59).object.name,'Extended front lawn','The old outer gravel strip must become lawn');
assert.equal(surfaceAt(-95,59).object.name,'Estate terrain');
const entrance=layouts.entrance;assert.equal(entrance.parent,layouts.modern);
for(const point of entrance.userData.mouth)assert.deepEqual(point,lanePointAtX(point[0]),'The driveway mouth must meet the unchanged lane centreline');
for(let z=30;z<=84;z+=.5){assert(!obs.some(o=>obstacleContains(o,0,z)),'Door approach through gate and entrance must stay clear');const hit=surfaceAt(0,z);assert(hit&&hit.point.y>.1,'Walk, curved drive and lane must have a continuous surface');}
for(const name of ['West curved entrance kerb','East curved entrance kerb']){
 const edge=entrance.getObjectByName(name),vertices=edge.geometry.attributes.position,last=vertices.count-2;assert(Math.abs(lanePointAtX(vertices.getX(last))[1]-vertices.getZ(last)-3.3)<.001,'Kerbs must merge into the near lane edge, not end in the carriageway');for(const y of edge.geometry.attributes.normal.array.filter((_,i)=>i%3===1))assert(y>.99,'Curved kerbs must face up');
}
const walk=createWalker(exterior.camera,obs);walk.setView({position:[0,1.8,80],target:[0,1.8,40]});walk.keys.add('KeyW');for(let i=0;i<100;i++)walk.update(.1);assert(exterior.camera.position.z<31,'Walking from the lane must pass through the relocated gate');
layouts.setVisible('modern',false);layouts.setVisible('historic',true);assert(!entrance.parent.visible&&wall.parent.visible,'The modern drive follows Modern, while the moved wall stays shared');
console.log('PASS: wall translated without rotation, outer gravel replaced by grass, fixed-lane curved junction, upward kerbs and clear gate-to-door access.');
