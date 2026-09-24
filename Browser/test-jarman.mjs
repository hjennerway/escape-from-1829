import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {jarmanProtected} from './artifacts/jarman-scope.mjs';
import {ANNEXE_VIEWS} from './dist/annexe.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,16/9),a=e.annexe,g=a.userData.courtFronts[0];e.model.updateMatrixWorld(true);
const baseline=JSON.parse(readFileSync(new URL('../Research/jarman/protected-geometry.json',import.meta.url)));
assert.deepEqual(jarmanProtected(THREE,e.model),baseline,'All geometry outside the marked frontage stays exact');
assert.equal(g.parent,a.userData.wards['tarvin-jarman']);
const ray=new THREE.Raycaster(),out=new THREE.Vector3(0,0,1).transformDirection(g.matrixWorld);
for(const o of g.userData.openings){
 const p=g.localToWorld(new THREE.Vector3(o.x,o.y+.19,o.z+.7));ray.set(p,out.clone().negate());
 const hit=ray.intersectObject(a,true)[0];assert(hit?.object.parent===g&&hit.object.isInstancedMesh,'Exposed glazing: '+JSON.stringify(o)+' hit '+hit?.object.name);
}
assert.equal(g.userData.openings.filter(o=>o.name==='Jarman ward sash'&&o.y>5).length,13,'Photographed 2 + 3 + 5 + 3 upper window arrangement');
assert.equal(g.children.filter(o=>o.name==='Court projecting gable brick walls').length,2);
assert.equal(g.children.filter(o=>o.name==='Jarman broad chimney stack').length,4);
const obstacles=exteriorObstacles(THREE,e.model),v=g.userData.veranda,mid=(v.left+v.right)/2;
for(const [z,blocked] of [[v.front-.3,true],[v.front+1,false]]){
 const p=g.localToWorld(new THREE.Vector3(mid,1,z));assert.equal(obstacles.some(o=>obstacleContains(o,p.x,p.z,.1)),blocked,'Veranda collision follows the new front');
}
const walker=createWalker(e.camera,obstacles);walker.setView({position:g.localToWorld(new THREE.Vector3(mid,1.8,v.front+5)).toArray(),target:g.localToWorld(new THREE.Vector3(mid,1.8,v.back)).toArray()});walker.keys.add('KeyW');for(let i=0;i<30;i++)walker.update(.1);assert(g.worldToLocal(e.camera.position.clone()).z>v.front,'Walking stops at the veranda');
const view=ANNEXE_VIEWS['annexe-jarman-photo'];assert(!obstacles.some(o=>obstacleContains(o,view.position[0],view.position[2],.3)),'Reference camera starts in clear lawn');
ray.set(g.localToWorld(new THREE.Vector3(mid,20,(v.back+v.front)/2)),new THREE.Vector3(0,-1,0));assert.equal(ray.intersectObject(g,true)[0]?.object.name,'Jarman veranda metal roof','Roof faces upward over the veranda');
console.log('PASS: Jarman photographed elevation, exposed sashes, veranda roof and walking collision; '+baseline.primitives+' outside primitives unchanged.');
