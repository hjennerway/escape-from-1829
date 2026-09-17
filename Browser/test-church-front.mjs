import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createChapel,ESCAPE_CHAPEL} from './dist/chapel.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
const material=new THREE.MeshStandardMaterial();
const chapel=createChapel(THREE,{brick:material,roof:material,stone:material,dark:material,worldUV:g=>g});
chapel.updateMatrixWorld(true);
assert.deepEqual(chapel.position.toArray(),[ESCAPE_CHAPEL.x,0,ESCAPE_CHAPEL.z]);
const front=chapel.getObjectByName('Church photographed clock front');
assert.equal(front.children.filter(o=>o.name==='Church diamond leaded lancet').length,2);
function hit(x,y){return new THREE.Raycaster(chapel.localToWorld(new THREE.Vector3(x,y,20)),new THREE.Vector3(0,0,-1)).intersectObject(chapel,true)[0];}
// Sample several clear points in each real opening, including the pointed head.
for(const x of [-.91,.91])for(const y of [4.15,6.07,10.31,11.40]){
 const name=hit(x,y).object.name;
 assert(['Church diamond leaded lancet','Church diamond lead came'].includes(name),`Lancet is exposed at ${x},${y}: ${name}`);
}
for(const x of [-3.65,3.65])assert.equal(hit(x,4).object.name,'Church front brick facing','False flanking front windows are removed');
assert.equal(hit(.32,15.11).object.name,'Church blue clock dial','Clock clears brick backing');
assert.equal(hit(0,19.0).object.name,'Church clock steep brick pediment','Pediment has exposed brick, not a front slate roof');
assert.equal(hit(0,2).object.name,'Church front brick facing','Masonry beneath the sill remains plain');
const obstacles=exteriorObstacles(THREE,chapel);
for(const x of [-2.78,2.78]){
 const p=chapel.localToWorld(new THREE.Vector3(x,0,14.7));
 assert(obstacles.some(b=>obstacleContains(b,p.x,p.z,0)),'Projecting buttress feet collide');
}
for(const x of [-5,0,5]){
 const p=chapel.localToWorld(new THREE.Vector3(x,0,16.5));
 assert(!obstacles.some(b=>obstacleContains(b,p.x,p.z,.4)),'Clock-end walk stays clear');
}
front.traverse(o=>{if(o.geometry)for(const a of Object.values(o.geometry.attributes))assert(a.array.every(Number.isFinite));});
assert.equal(material.color.getHex(),0xffffff,'Front weathering does not recolour shared estate materials');
console.log('PASS: exposed paired church lancets and clock, brick pediment, fixed registration, buttress collisions and clear front walk.');
