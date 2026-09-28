import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {addBeechTrees,FRONT_LAWN_TREES} from './dist/front-lawn-trees.mjs';
import {createFrontLawnWind,installLeafWind} from './dist/front-lawn-wind.mjs';
import {exteriorObstacles,createObstacleIndex} from './dist/explore-controls.mjs';
import {serializeScene,deserializeScene,encodeModel,decodeModel} from './dist/model-binary.mjs';

const scene=new THREE.Scene(),trees=new THREE.Group(),camera=new THREE.PerspectiveCamera();scene.add(trees);
addBeechTrees(THREE,trees);scene.updateMatrixWorld(true);
const front=trees.children.filter(t=>t.userData.frontLawnTree);
assert.equal(front.length,2);
for(const [i,tree] of front.entries()){
  const spec=FRONT_LAWN_TREES[i],lod=tree.children[0];
  assert.deepEqual(tree.position.toArray(),[spec.x,.16,spec.z]);
  const b=new THREE.Box3().setFromObject(lod.levels[0].object);
  assert(Math.abs(b.max.y-(spec.height+.16+.24))<.001,'Original height retained within the wind margin');
  assert(b.max.x<=spec.x+spec.radius+.25&&b.min.x>=spec.x-spec.radius-.25,'Original crown footprint');
  const count=level=>level.object.children.reduce((n,m)=>n+m.geometry.index.count/3,0);
  assert(count(lod.levels[1])<count(lod.levels[0])*.6);assert(count(lod.levels[2])<count(lod.levels[0])*.3);
  assert.equal(lod.levels.length,3);
  assert(tree.userData.ezTree.preset==='Oak Large');
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
console.log('PASS: EZ-Tree lawn locations, envelope, LOD budgets, walkable crowns, solid trunks, visibility, wind/shadow time, reduced motion and binary restoration.');
