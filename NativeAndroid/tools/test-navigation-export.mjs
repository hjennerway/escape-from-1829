import assert from 'node:assert/strict';
import * as THREE from '../../Browser/node_modules/three/build/three.module.js';
import {batchAerialMeshes} from '../../Browser/dist/aerial-performance.mjs';
import {exteriorObstacles,obstacleContains} from '../../Browser/dist/explore-controls.mjs';
import {exportOutside} from './navigation-export.mjs';

const model=new THREE.Group(),material=new THREE.MeshStandardMaterial();
for(const x of [3,9]){
  const wall=new THREE.Mesh(new THREE.BoxGeometry(2,4,1),material);
  wall.position.set(x,2,0);model.add(wall);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(2,.2,2),material);
  deck.name='landing';deck.position.set(x,0,3);model.add(deck);
}
const expected=exportOutside(THREE,{model},exteriorObstacles);
batchAerialMeshes(THREE,model);
const states=[];model.traverse(o=>states.push([o,o.visible]));
const wrong=exteriorObstacles(THREE,model,{preciseFootprints:true});
assert(wrong.some(b=>obstacleContains(b,6,0,.27)),'Negative control: a render batch blocks the open space between separate walls');
const actual=exportOutside(THREE,{model},exteriorObstacles);
assert.deepEqual(actual,expected,'Collision, jump bounds, supports and walk surfaces use the original geometry');
assert(!actual.obstacles.some(b=>obstacleContains(b,6,0,.27)),'The open path remains walkable');
assert.equal(actual.supports.length,2,'Each separate landing retains its own support');
for(const [o,visible] of states)assert.equal(o.visible,visible,'Export restores exact render visibility');
assert.throws(()=>exportOutside(THREE,{model},()=>{throw Error('probe');}),/probe/);
for(const [o,visible] of states)assert.equal(o.visible,visible,'Failed export also restores render visibility');
console.log('PASS: batched-render negative control, exact source collisions/supports and visibility restoration.');
