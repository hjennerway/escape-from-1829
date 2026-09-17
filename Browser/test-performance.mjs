import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {bindTreeToggle} from './dist/tree-layer.mjs';
import {createObstacleIndex,createWalker,exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16};},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,16/9),layouts=createAerialLayouts(THREE,exterior);
const sun=exterior.scene.children.find(o=>o.isDirectionalLight&&o.castShadow);
assert.equal(sun.shadow.autoUpdate,false,'Fixed sunlight should reuse its shadow map');
assert.equal(sun.shadow.needsUpdate,true,'The first frame must create shadows');
let seed=1829;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
for(const historic of [true,false])for(const modern of [true,false]){
  sun.shadow.needsUpdate=false;
  layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
  assert(sun.shadow.needsUpdate,'Layout changes must refresh shadows');
  const obstacles=exteriorObstacles(THREE,exterior.model),index=createObstacleIndex(obstacles);
  function check(x,z){assert.equal(index.contains(x,z),obstacles.some(b=>obstacleContains(b,x,z)),`Collision mismatch at ${x}, ${z}`);}
  for(let i=0;i<6000;i++)check(-180+random()*760,-245+random()*415);
  // Probe foundations and padding on both sides of every bounds edge.
  for(const b of obstacles){
    for(const offset of [-.401,-.399,0,.399,.401]){
      check(b.minX+offset,(b.minZ+b.maxZ)/2);check(b.maxX+offset,(b.minZ+b.maxZ)/2);
      check((b.minX+b.maxX)/2,b.minZ+offset);check((b.minX+b.maxX)/2,b.maxZ+offset);
    }
  }
}
// Padding must cross positive and negative grid boundaries.
for(const x of [-24,-12,0,12,24]){
  const b={minX:x+.1,maxX:x+2,minZ:-2,maxZ:2},index=createObstacleIndex([b]);
  assert(index.contains(x-.2,0));assert(!index.contains(x-.31,0));
}
const camera=new THREE.PerspectiveCamera(),walker=createWalker(camera);
const wall={minX:-2,maxX:2,minZ:38,maxZ:39};
walker.setObstacles([wall]);walker.keys.add('KeyW');walker.update(.1);
assert.equal(camera.position.z,39.5,'New obstacles must immediately stop movement');
walker.update(.1);assert(camera.position.z>39.39);
walker.setObstacles([]);walker.update(.1);assert(camera.position.z<39.1,'Hidden obstacles must stop blocking movement');
// A local query should not touch distant obstacles; idle input should do no collision work.
let reads=0;
const distant=Array.from({length:2000},(_,i)=>({get minX(){reads++;return 100+i;},maxX:101+i,minZ:100,maxZ:101}));
walker.setObstacles(distant);reads=0;walker.reset();walker.update(1/60);
assert.equal(reads,0);walker.keys.add('KeyD');walker.update(1/60);assert.equal(reads,0);
let toggle;
bindTreeToggle(exterior,{addEventListener(type,listener){toggle=listener;}});
sun.shadow.needsUpdate=false;
toggle({code:'KeyT',preventDefault(){}});
assert(!exterior.trees.visible);assert(sun.shadow.needsUpdate,'Tree visibility must refresh shadows');
sun.shadow.needsUpdate=false;exterior.invalidateShadows();assert(sun.shadow.needsUpdate);
delete globalThis.document;
console.log('PASS: indexed collisions match full scans across all layouts and padded boundaries; idle and distant collision work skipped; refreshed obstacles and cached-shadow invalidation.');
