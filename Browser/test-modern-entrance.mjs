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
const wall=exterior.model.getObjectByName('Front boundary wall');assert.deepEqual(wall.position.toArray(),[0,0,25]);assert.deepEqual(wall.rotation.toArray().slice(0,3),[0,0,0]);
const bounds=new THREE.Box3().setFromObject(wall);assert(bounds.min.z>73&&bounds.max.z<75,'Whole boundary must move toward the lane without rotation');
const obs=exteriorObstacles(THREE,exterior.model);
assert(obs.some(o=>obstacleContains(o,-10,FRONT_BOUNDARY.z)),'Moved masonry must block walking');assert(!obs.some(o=>obstacleContains(o,-10,49)),'No obsolete wall collision may remain');
const surfaces=[];exterior.model.traverseVisible(o=>{if(o.isMesh)surfaces.push(o)});const ray=new THREE.Raycaster();function surfaceAt(x,z){ray.set(new THREE.Vector3(x,40,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(surfaces,false)[0];}
for(const x of [-40,30,70])assert.equal(surfaceAt(x,59).object.name,'Extended front lawn','The old outer gravel strip must become lawn');
assert.equal(surfaceAt(-95,59).object.name,'Estate terrain');
// The eastern hedge must end before the bend crosses the frontage.
for(const x of [94,96,98,100])assert.equal(surfaceAt(x,FRONT_BOUNDARY.z).object.material.color.getHex(),0x555b5c,'The frontage hedge must not protrude through Vivienne Smith Lane');
const entrance=layouts.entrance;assert.equal(entrance.parent,layouts.shared);
for(const point of entrance.userData.mouth)assert.deepEqual(point,lanePointAtX(point[0]),'The driveway mouth must meet the unchanged lane centreline');
for(let z=30;z<=84;z+=.5){assert(!obs.some(o=>obstacleContains(o,0,z)),'Door approach through gate and entrance must stay clear');const hit=surfaceAt(0,z);assert(hit&&hit.point.y>.1,'Walk, curved drive and lane must have a continuous surface');}
for(const name of ['West curved entrance kerb','East curved entrance kerb']){
 const edge=entrance.getObjectByName(name),vertices=edge.geometry.attributes.position,last=vertices.count-2;assert(Math.abs(lanePointAtX(vertices.getX(last))[1]-vertices.getZ(last)-3.3)<.001,'Kerbs must merge into the near lane edge, not end in the carriageway');for(const y of edge.geometry.attributes.normal.array.filter((_,i)=>i%3===1))assert(y>.99,'Curved kerbs must face up');
}
const walk=createWalker(exterior.camera,obs);walk.setView({position:[0,1.8,80],target:[0,1.8,40]});walk.keys.add('KeyW');for(let i=0;i<100;i++)walk.update(.1);assert(exterior.camera.position.z<31,'Walking from the lane must pass through the relocated gate');
layouts.setVisible('modern',false);layouts.setVisible('historic',true);assert(entrance.visible&&entrance.parent.visible&&wall.parent.visible,'Historic retains the sweeping driveway and shared boundary');
// Surface sampling verifies the intended lawn clearance and filled forecourt.
for(const x of [-40,-20,20,40,60]){
 const clearance=lanePointAtX(x)[1]-3.6-(FRONT_BOUNDARY.z+.46);
 assert(clearance>4.4&&clearance<7,'Leave approximately one road width of grass beyond the wall');
 assert.equal(surfaceAt(x,FRONT_BOUNDARY.z+3).object.name,'Estate terrain');
}
for(const [x,z] of [[0,29],[0,39],[8,32],[-8,32]])assert.equal(surfaceAt(x,z).object.name,'Semicircular Reception paved forecourt');
assert.notEqual(surfaceAt(12,39).object.name,'Semicircular Reception paved forecourt','The court must have a rounded edge rather than rectangular corners');
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(entrance.visible,historic||modern,'The sweeping driveway is visible whenever either layout is enabled');
 assert.equal(entrance.getObjectByName('Sweeping entrance asphalt').material.color.getHex(),0x555b5c);
}
console.log('PASS: wall translated without rotation, outer gravel replaced by grass, fixed-lane curved junction, upward kerbs and clear gate-to-door access.');
