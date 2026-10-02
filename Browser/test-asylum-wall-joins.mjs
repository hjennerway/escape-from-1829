import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {joinAsylumWalls} from './dist/asylum-wall-joins.mjs';

const wall=(a,b)=>({a,b,exterior:false});
for(const walls of [
 [wall([0,0],[1,0]),wall([1.22,0],[3,0])],
 [wall([0,0],[1,0]),wall([1.22,-1],[1.22,1])],
 [wall([0,0],[1,0]),wall([1.22,.1],[3,.1])],
 [wall([0,0],[1,0]),wall([1.22,-1],[1.22,-.2]),wall([2,0],[1.15,0])],
]){
 const snapshot=JSON.stringify(walls),joined=joinAsylumWalls(walls);
 assert.equal(JSON.stringify(walls),snapshot,'Joining leaves the sampled source intact');
 assert.notDeepEqual(joined,walls,'Short gaps must close');
 assert.deepEqual(joinAsylumWalls(joined),joined,'Joins must be stable');
 for(let i=0;i<walls.length;i++)for(const end of ['a','b'])assert(Math.hypot(joined[i][end][0]-walls[i][end][0],joined[i][end][1]-walls[i][end][1])<=.300001,'Repairs stay within the sampling tolerance');
}
const doorway=[wall([-3,0],[-.95,0]),wall([.95,0],[3,0])];
assert.deepEqual(joinAsylumWalls(doorway),doorway,'Intentional openings stay open');
const parallel=[wall([0,0],[1,0]),wall([1.2,.2],[3,.2])];
assert.deepEqual(joinAsylumWalls(parallel),parallel,'Separate parallel walls are not joined');
const collinear=joinAsylumWalls([wall([0,0],[1,0]),wall([1.2,0],[3,0])]);
assert.equal(collinear[0].b[0],collinear[1].a[0],'Straight repairs do not create overlapping faces');

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors;
// Fixed survey of the reported Reception seam and equivalent sampled gaps,
// retained independently of the joining algorithm for rendered regression tests.
const fixtures=JSON.parse(await readFile(new URL('./fixtures/asylum-wall-joins.json',import.meta.url)));
const ray=new THREE.Raycaster();let joins=0,samples=0;
for(const fixture of fixtures){
 const floor=floors[fixture.floor],scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 if(floor.id!==2)for(const side of [-1,1])for(const [kind,y] of [['Brick',.55],['Plaster',1.65]]){
  ray.set(new THREE.Vector3(-7.1,y,17.3+side*.5),new THREE.Vector3(0,0,-side));ray.far=.7;
  assert.equal(ray.intersectObject(scene.getObjectByName('Asylum '+kind),false).length,0,'Reception masonry has no internal caps or hairline butt seams');
 }
 for(const {from,to} of fixture.gaps){
  const length=Math.hypot(to[0]-from[0],to[1]-from[1]),dx=(to[0]-from[0])/length,dz=(to[1]-from[1])/length;
  for(const t of [.2,.5,.8]){
   const x=from[0]+(to[0]-from[0])*t,z=from[1]+(to[1]-from[1])*t;
   assert(!flatWalkable(floor,x,z,.01),'Collision includes repaired masonry');
   for(const side of [-1,1])for(const [kind,y] of [['Brick',.55],['Plaster',1.65],['Plaster',2.8]]){
    ray.set(new THREE.Vector3(x-dz*side*.45,y,z+dx*side*.45),new THREE.Vector3(dz*side,0,-dx*side));ray.far=.65;
    assert(ray.intersectObject(scene.getObjectByName('Asylum '+kind),false).length,`Sealed ${kind} join on floor ${floor.id} at ${x},${z}, side ${side}`);samples++;
   }
  }
  joins++;
 }
}
console.log(`PASS: ${joins} surveyed wall joins, ${samples} masonry rays from both sides at three heights, matching collision, stable joins and preserved doorway widths.`);
