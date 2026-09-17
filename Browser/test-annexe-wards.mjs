import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE_WARDS,ANNEXE_WARD_VIEWS,ANNEXE_WARD_WALKS} from './dist/annexe.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {createWalker,exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},strokeText(){},fillText(){},measureText(text){return {width:text.length*16}}})})};
const exterior=createEscapeExterior(THREE,16/9),annexe=exterior.annexe;
const layouts=createAerialLayouts(THREE,exterior),obstacles=exteriorObstacles(THREE,exterior.model);
const expected=[['Larkton/Jodrell','yellow'],['Tarvin/Jarman','blue'],['Leighton/Newton','red'],['Oakmere','purple'],['Picton/Carden','green']];
assert.deepEqual(ANNEXE_WARDS.map(w=>[w.name,w.referenceColor]),expected);
const claimed=new Set();
for(const ward of ANNEXE_WARDS){
 const group=annexe.userData.wards[ward.id];
 assert.equal(group.name,ward.name);assert.equal(group.parent,annexe);
 assert.deepEqual(group.position.toArray(),[0,0,0]);assert.deepEqual(group.scale.toArray(),[1,1,1]);
 assert.deepEqual(group.userData.ranges.map(r=>r.name).sort(),[...ward.rangeNames].sort());
 for(const name of ward.rangeNames){
  assert(!claimed.has(name),'each existing range belongs to only one ward');claimed.add(name);
  for(const suffix of [' brick walls',' slate roof'])assert.equal(annexe.getObjectByName(name+suffix).parent,group);
 }
 assert(group.children.some(o=>o.isInstancedMesh),'ward owns its glazing and facade details');
 assert(group.children.some(o=>o.name.endsWith('chimney stack')),'ward owns its chimneys');
 const walk=ANNEXE_WARD_WALKS[ward.id],p=walk.position;
 assert.equal(p[1],1.8);assert(!obstacles.some(b=>obstacleContains(b,p[0],p[2])),ward.name+' walking start is clear');
 const walker=createWalker(exterior.camera,obstacles);walker.setView(walk);
 const start=exterior.camera.position.clone();walker.keys.add('KeyW');walker.update(.1);
 assert(exterior.camera.position.distanceTo(start)>.45,ward.name+' walking start allows movement');
 const bounds=new THREE.Box3().setFromObject(group);
 for(const aspect of [16/9,390/844]){
  const view=ANNEXE_WARD_VIEWS[ward.id],camera=new THREE.PerspectiveCamera(view.fov,aspect,.1,2000),target=new THREE.Vector3(...view.target);
  camera.position.fromArray(view.position).sub(target).multiplyScalar(Math.max(1,1.4/aspect)).add(target);
  camera.lookAt(target);camera.updateMatrixWorld(true);
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
   const point=new THREE.Vector3(x,y,z).project(camera);
   assert(Math.abs(point.x)<1&&Math.abs(point.y)<1&&point.z>-1&&point.z<1,ward.name+' fits aerial view at '+aspect);
  }
 }
 for(const page of ['aerial.html','explore.html'])assert(readFileSync(new URL('./dist/'+page,import.meta.url),'utf8').includes('href="?view='+ward.id+'"'),page+' links to '+ward.name);
}
for(const name of ['Central hall','Entrance range','Central rear spine','East front connecting ward','East end ward'])assert.equal(annexe.getObjectByName(name+' brick walls').parent,annexe,'shared and unmarked ranges retain their ownership');
for(const historic of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',!historic);
 for(const group of Object.values(annexe.userData.wards)){
  let visible=true;for(let o=group;o;o=o.parent)visible&&=o.visible;
  assert.equal(visible,historic,'ward follows Historic visibility');
 }
}
console.log('PASS: five ward groups and reference colours, complete range ownership, aerial framing, accessible walking destinations and Historic visibility.');
