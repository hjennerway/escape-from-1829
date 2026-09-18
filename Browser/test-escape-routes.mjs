import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {makeFloors,routeBetweenFloors} from './dist/floors.mjs';
import {nearExit} from './dist/core.mjs';
import {ACTIVE_EXIT_COUNT,selectEscapeRoutes,exitDirection} from './dist/escape-routes.mjs';
import {buildArchitecture} from './dist/architecture.mjs';

const layout=JSON.parse(await readFile(new URL('./dist/layout.json',import.meta.url)));
const candidates=makeFloors(layout),before=JSON.stringify(candidates),seen=new Set(),combinations=new Set();
const key=(floor,exit)=>floor+':'+exit.x+','+exit.z;
const reception={x:layout.spawn.x*layout.cellSize,z:layout.spawn.z*layout.cellSize,floor:0};
function check(random,geometry=false){
 const floors=selectEscapeRoutes(candidates,random),active=floors.flatMap((f,i)=>f.exits.map(e=>key(i,e)));
 assert.equal(active.length,ACTIVE_EXIT_COUNT);assert.equal(new Set(active).size,5);
 combinations.add(active.join('|'));active.forEach(k=>seen.add(k));
 for(const [i,floor] of floors.entries()){
  assert.notEqual(floor,candidates[i]);assert.notEqual(floor.exits,candidates[i].exits);
  let scene,ray;
  if(geometry){scene=new THREE.Scene();buildArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);ray=new THREE.Raycaster();ray.far=3;
   assert.equal(scene.children.find(m=>m.name==='Layout Panel')?.count||0,floor.exits.length);
  }
  for(const exit of candidates[i].exits){
   const point={x:exit.x*floor.cellSize,z:exit.z*floor.cellSize,floor:i},selected=floor.exits.includes(exit);
   assert.equal(!!nearExit(floor,point),selected,'Interaction matches selection');
   if(selected)assert(routeBetweenFloors(floors,reception,point).length,'Active route reachable from reception');
   if(geometry){
    const {dx,dz}=exitDirection(exit);
    ray.set(new THREE.Vector3(point.x-dx*1.5,1.65,point.z-dz*1.5),new THREE.Vector3(dx,0,dz));
    assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name==='Layout Panel',selected,'Door visibility matches selection, including east/west walls');
   }
  }
  assert(!nearExit(floor,{x:20*floor.cellSize,z:21*floor.cellSize}),'No portico escape');
 }
 return floors;
}
let seed=1829;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
for(let run=0;run<256;run++)check(random,run<4);
check(()=>0,true);
const groundOnly=check(()=>.999999,true);
let shuffleIndex=14;
const upperOnly=check(()=>{const i=--shuffleIndex;return (i>=9?13-i:i)/(i+1);},true);
assert.equal(groundOnly[1].exits.length,0,'A fair draw may leave the upper floor with no exits');
assert.equal(upperOnly[0].exits.length,0,'A fair draw may leave the ground floor with no exits');
assert.equal(seen.size,14,'Every candidate can spawn');
assert(combinations.size>200,'Repeated loads produce varied sets');
assert.equal(JSON.stringify(candidates),before,'Selection must not mutate source floors or candidate arrays');
assert.throws(()=>selectEscapeRoutes([{exits:[]}]),/Not enough/);
console.log('PASS: exactly five distinct routes per load, all fourteen eligible, varied draws, unchanged candidates, reachability, inactive/old exits disabled and correctly oriented doors, including floors with zero exits.');
