import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {addBeechTrees,FRONT_LAWN_TREES} from './dist/front-lawn-trees.mjs';
import {createFrontLawnWind,installLeafWind} from './dist/front-lawn-wind.mjs';
import {exteriorObstacles,createObstacleIndex} from './dist/explore-controls.mjs';
import {serializeScene,deserializeScene,encodeModel,decodeModel} from './dist/model-binary.mjs';
import {createEscapeExterior} from './dist/escape-exterior.mjs';

const scene=new THREE.Scene(),trees=new THREE.Group(),camera=new THREE.PerspectiveCamera();scene.add(trees);
addBeechTrees(THREE,trees);scene.updateMatrixWorld(true);
const front=trees.children.filter(t=>t.userData.frontLawnTree);
assert.equal(front.length,6);
assert.deepEqual(FRONT_LAWN_TREES.slice(0,2).map(t=>[t.x,t.z,t.height,t.radius].map(v=>Number(v.toFixed(4)))),
  [[13,47.8,25.92,11.088],[-13,48.5,25.92,11.088]]);
const geometries=new Set(),foliage=new Set();
for(const [i,tree] of front.entries()){
  const spec=FRONT_LAWN_TREES[i],lod=tree.children[0];
  assert.deepEqual(tree.position.toArray(),[spec.x,.16,spec.z]);
  const leaf=lod.levels[0].object.children[1],b=leaf.geometry.boundingBox;
  assert(Math.abs((b.max.y-.24)*tree.scale.y-spec.height)<.001,'Requested height retained within the wind margin');
  assert(Math.abs((Math.max(Math.abs(b.min.x),Math.abs(b.max.x))-.24)*tree.scale.x-spec.radius)<.001,'Requested crown radius before rotation');
  tree.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);assert(o.castShadow&&o.receiveShadow);}});
  foliage.add(leaf.material);
  const count=level=>level.object.children.reduce((n,m)=>n+m.geometry.index.count/3,0);
  assert(count(lod.levels[1])<count(lod.levels[0])*.6);assert(count(lod.levels[2])<count(lod.levels[0])*.3);
  assert.equal(lod.levels.length,3);
  assert(tree.userData.ezTree.preset==='Oak Large');
}
assert.equal(geometries.size,6,'Six copies share three branch and three foliage geometries');
assert.equal(foliage.size,2,'Copper pair and green companions share two foliage materials');
const leafMaterial=tree=>tree.children[0].levels[0].object.children[1].material;
assert.equal(leafMaterial(front[0]),leafMaterial(front[1]));
assert.equal(leafMaterial(front[0]).color.getHex(),0xa18a70,'Restore the original copper-brown tint');
for(const tree of front.slice(2)){
  assert.equal(leafMaterial(tree),leafMaterial(front[2]));
  assert.equal(leafMaterial(tree).color.getHex(),0x719b4b,'Keep the four companion trees green');
  for(const original of front.slice(0,2)){
    assert(Math.abs(original.scale.x/tree.scale.x-1.2)<1e-12,'Original crown is 20% larger');
    assert(Math.abs(original.scale.y/tree.scale.y-1.2)<1e-12,'Original height is 20% larger');
  }
}
const obstacles=()=>createObstacleIndex(exteriorObstacles(THREE,trees));
for(const spec of FRONT_LAWN_TREES){assert(obstacles().contains(spec.x,spec.z));assert(!obstacles().contains(spec.x+2,spec.z),'Can walk under branches');}
trees.visible=false;assert.equal(exteriorObstacles(THREE,trees).length,0);trees.visible=true;
let invalidations=0;camera.position.set(27,1.8,27);
const exterior={trees,camera,invalidateShadows(){invalidations++;}};
const wind=createFrontLawnWind(THREE,exterior,{reducedMotion:false});wind.update(.05);
assert.equal(wind.time,.05);assert.equal(invalidations,1);
trees.traverse(o=>{if(o.material?.userData.frontLawnWind){
  assert.equal(installLeafWind(o.material).time.value,.05);
  assert.equal(installLeafWind(o.customDepthMaterial).time.value,.05,'Shadow follows leaf time');
}});
trees.visible=false;wind.update(.05);assert.equal(wind.time,.05);trees.visible=true;
camera.position.set(0,500,500);wind.update(.05);assert.equal(wind.time,.05,'Distant scenes retain cached shadows');
camera.position.set(27,1.8,27);
const frozen=createFrontLawnWind(THREE,exterior,{reducedMotion:true});frozen.update(.1);assert.equal(frozen.time,0);

const bytes=encodeModel(serializeScene(THREE,scene,camera));
const restored=deserializeScene(THREE,decodeModel(bytes.buffer));
const restoredTrees=restored.scene.children[0];
const restoredWind=createFrontLawnWind(THREE,{...exterior,trees:restoredTrees},{reducedMotion:false});restoredWind.update(.08);
assert.equal(restoredWind.time,.08);
restoredTrees.traverse(o=>{if(o.material?.userData.frontLawnWind){
  const shader={uniforms:{},vertexShader:'#include <begin_vertex>'};o.material.onBeforeCompile(shader);
  assert(shader.vertexShader.includes('transformed+=vec3'));
  assert.equal(shader.uniforms.lawnWindTime.value,.08);assert(o.customDepthMaterial);
}});
const restoredGeometry=new Set(),depths=new Set();
restoredTrees.traverse(o=>{if(o.material?.userData.frontLawnWind){restoredGeometry.add(o.geometry);depths.add(o.customDepthMaterial);}});
assert.equal(restoredGeometry.size,3);assert.equal(depths.size,2,'Compiled copies share one shadow-depth material per foliage tint');

// Regression: the old sunlight near plane excluded the western lawn crown.
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const estate=createEscapeExterior(THREE,16/9);delete globalThis.document;
estate.scene.updateMatrixWorld(true);
const sun=estate.scene.children.find(o=>o.isDirectionalLight);sun.shadow.updateMatrices(sun);
assert(sun.position.clone().sub(sun.target.position).normalize().distanceTo(new THREE.Vector3(-85,120,60).normalize())<1e-12,'Keep the approved sunlight angle');
const frustum=sun.shadow.getFrustum();
for(const tree of estate.trees.children.filter(t=>t.userData.frontLawnTree)){
  const box=new THREE.Box3().setFromObject(tree.children[0].levels[0].object);
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
    assert(frustum.containsPoint(new THREE.Vector3(x,y,z)),tree.name+' crown lies fully inside the sunlight shadow volume');
    assert(frustum.containsPoint(new THREE.Vector3(x+y*85/120,0,z-y*60/120)),tree.name+' ground shadow lies inside the shadow volume');
  }
}
assert(!estate.trees.children.some(t=>t.userData.broadleafTree?.x===24&&t.userData.broadleafTree?.z===46.7),'Red-circled tree and trunk are removed');
console.log('PASS: EZ-Tree lawn locations, envelope, LOD budgets, walkable crowns, solid trunks, visibility, wind/shadow time, reduced motion and binary restoration.');
