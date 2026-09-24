import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {cardenHeightSnapshot} from './artifacts/annexe-carden-height-scope.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5),a=e.annexe,d=a.userData.cardenElevation;
const before=JSON.parse(readFileSync(new URL('../Research/carden-picton/height-extension-before.json',import.meta.url))),after=cardenHeightSnapshot(THREE,a);
assert.deepEqual(after.protected,before.protected,'Every primitive outside the marked Carden/tower work and concurrent Jarman frontage stays exact');
assert.deepEqual(after.conservatory,before.conservatory,'All conservatory masonry, glazing, bars, roof geometry, materials and transforms stay exact');
assert.deepEqual(after.conservatoryFootprint,before.conservatoryFootprint);assert.deepEqual(after.root.map(n=>n||0),before.root);
const key=r=>JSON.stringify([r[0],r[1],r[2],r[3][12],r[3][14],r[3][0],r[3][10],r[3][13]]),sort=rows=>rows.sort((a,b)=>key(a).localeCompare(key(b)));
const expected=sort(before.towerRows.map(r=>{r[3]=r[3].map((v,i)=>[1,5,9,13].includes(i)?v*.85:v);return r;})),actual=sort(after.towerRows);
assert.equal(actual.length,expected.length);
for(let i=0;i<actual.length;i++){
 assert.deepEqual(actual[i].slice(0,3),expected[i].slice(0,3));assert.deepEqual(actual[i].slice(4),expected[i].slice(4));
 for(let j=0;j<16;j++)assert(Math.abs(actual[i][3][j]-expected[i][3][j])<6e-6,'Tower vertical-only 15% reduction: '+actual[i][0]+' matrix '+j);
}
for(const t of a.userData.ranges.filter(b=>/square tower/.test(b.name))){assert.equal(t.h,20.8*.85);assert.equal(t.rise,3.1*.85);}
const wing=d.userData.towerRange;assert.equal(wing.eave,12.4*.85);assert.equal(wing.rise,3.2*.85);
const cap=d.getObjectByName('Carden tower gabled range slate roof'),bounds=new THREE.Box3().setFromObject(cap);
assert(Math.abs(bounds.max.y-15.6*.85*.9)<1e-5,'New high roof is exactly 15% shorter');
const rear=d.userData.conservatoryRearLink;assert.equal(rear.z-rear.d/2,-36.5);assert.equal(rear.z+rear.d/2,-18);assert(Math.abs(rear.x+rear.w/2-29.17)<1e-9);assert.equal(rear.h,4.7);assert.equal(rear.rise,1.9);
const ray=new THREE.Raycaster(),obstacles=exteriorObstacles(THREE,e.model);
for(const [x,z] of [[24,-32],[25,-35]]){const p=a.localToWorld(new THREE.Vector3(x,1,z));assert(obstacles.some(o=>obstacleContains(o,p.x,p.z,0)),'Extended masonry blocks walking');ray.set(a.localToWorld(new THREE.Vector3(x,20,z)),new THREE.Vector3(0,-1,0));assert(ray.intersectObject(d,true).some(h=>h.object.name==='Carden conservatory low rear link slate roof'),'Roof covers extended footprint');}
for(const o of d.userData.openings){const outward=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r)),p=new THREE.Vector3(o.x,o.y+.12,o.z).addScaledVector(outward,.7);a.localToWorld(p);outward.transformDirection(a.matrixWorld);ray.set(p,outward.negate());const hit=ray.intersectObject(a,true)[0];assert(hit&&(hit.object.isInstancedMesh||/glazing/.test(hit.object.name)),'Exposed glazing after height/length changes: '+o.name);}
console.log('PASS: '+actual.length+' tower primitives shortened exactly 15%; new roof shortened 15%; '+after.conservatory.primitives+' conservatory primitives exact; extended low roof/wall, visible windows and collision coverage.');
