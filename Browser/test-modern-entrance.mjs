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
for(const x of [-40,30,70])assert.equal(surfaceAt(x,59).object.name,'Estate terrain','The frontage uses continuous terrain without the duplicate lawn panel');
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
// Follow both complete new routes at player width, checking actual rendered
// ground rather than only their control points or mesh bounding boxes.
const forecourt=exterior.model.getObjectByName('Semicircular Reception paved forecourt');
function pavedRoute(points){
 for(let i=1;i<points.length;i++){
  const [ax,az]=points[i-1],[bx,bz]=points[i],length=Math.hypot(bx-ax,bz-az),steps=Math.ceil(length/.2);
  for(let n=0;n<=steps;n++){
   const x=ax+(bx-ax)*n/steps,z=az+(bz-az)*n/steps;
   assert(!obs.some(o=>obstacleContains(o,x,z)),`Path must clear buildings, stair foundations and trees at ${x}, ${z}`);
   for(const offset of [-.35,0,.35]){
    ray.set(new THREE.Vector3(x-(bz-az)/length*offset,.5,z+(bx-ax)/length*offset),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObjects(surfaces,false)[0];
    assert(hit?.object.material===forecourt.material,`Continuous matching paving at ${x}, ${z}`);
   }
  }
 }
}
for(const side of [-1,1]){
 pavedRoute([[0,29],[24,29],[26.5,32.2],[26.5,38.8],[28,38.8],[28,46.6]].map(([x,z])=>[side*x,z]));
 const branch=exterior.model.getObjectByName((side<0?'West':'East')+' sweeping forecourt branch');
 assert.equal(branch.material,forecourt.material,'Both branches use the exact forecourt material');
 for(const z of [27.7,28.8,30.2])assert(!/kerb/.test(surfaceAt(side*Math.sqrt(169-(z-27.4)**2),z).object.name),'No kerb crosses the new branch mouth');
}
pavedRoute([[28,46.6],[44,46.6],[44,22]]);
pavedRoute([[44,29.5],[48.1,29.5]]);
pavedRoute([[-28,46.6],[-28,47.7],[-46.2,47.7]]);
// The outer west route follows the marked straight edge from Parsons Lane
// through the court and around the garden, with player-width clearance.
pavedRoute([[-73.12,-36],[-73.12,43.7],[-48,43.7]]);
for(const [x,z] of [[-64,-10],[-71,-20],[-71.8,1]])assert.equal(surfaceAt(x,z).object.material,forecourt.material,'Court and outer path use one gravel material');
assert.equal(exterior.model.getObjectByName('West end entrance path').material.color.getHex(),forecourt.material.color.getHex(),'West doorway approach matches the joined gravel');
assert.equal(surfaceAt(48.7,29.5).object.material,forecourt.material,'East branch and Redesmere cross-walk share one gravel material');
pavedRoute([[48.1,29.5],[76,29.5],[76,6]]);
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(entrance.visible,historic||modern,'The sweeping driveway is visible whenever either layout is enabled');
 assert.equal(entrance.getObjectByName('Sweeping entrance asphalt').material.color.getHex(),0x555b5c);
 assert.equal(forecourt.parent.visible,historic||modern,'The new entrance walks are shared by both layouts');
}
console.log('PASS: front boundary, curved driveway, shared sweeping forecourt branches, open kerb mouths and continuous clear routes to Redesmere and the west fire stairs.');
