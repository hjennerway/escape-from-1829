import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE_MAP_SCALE,annexePoint} from './dist/annexe.mjs';
import {LARKTON_SHIFT} from './dist/annexe-larkton-recess.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {recessProtected} from './artifacts/larkton-recess-scope.mjs';
import {larktonProtected} from './artifacts/larkton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5),a=e.annexe,before=JSON.parse(readFileSync(new URL('../Research/larkton-jodrell/recess-protected-before.json',import.meta.url)));
// Isolate the concurrent additive Oakmere task for the immutable pre-edit
// fingerprint; restore it before every live collision/visibility assertion.
const concurrent=a.getObjectByName('Oakmere rear court additions'),concurrentParent=concurrent?.parent;
if(concurrent)concurrentParent.remove(concurrent);
assert.deepEqual(larktonProtected(THREE,a),before.outside,'All non-Larkton geometry stays exact');
assert.deepEqual(recessProtected(THREE,a),before.retained,'Retained wing geometry only translates');
if(concurrent)concurrentParent.add(concurrent);
for(const old of before.ranges){if(old.name==='West court outer link')continue;const r=a.userData.ranges.find(r=>r.name===old.name);assert(Math.abs(r.x-old.x-LARKTON_SHIFT*ANNEXE_MAP_SCALE)<1e-9);for(const k of ['z','w','d','h','r'])assert.equal(r[k],old[k]);}
e.model.updateMatrixWorld(true);const obstacles=exteriorObstacles(THREE,e.model),point=(x,z,y=1.8)=>annexePoint(x*ANNEXE_MAP_SCALE,y,z*ANNEXE_MAP_SCALE);
const blocked=(x,z)=>{const p=point(x,z);return obstacles.some(o=>obstacleContains(o,p[0],p[2],.1));};
assert(blocked(-113,-30),'Moved long wing blocks walking');assert(!blocked(-100,-30),'Vacated strip is clear');
assert(!blocked(-71.6,-1),'Recess approach is accessible');assert(blocked(-71.6,-4),'Rear wall blocks walking');assert(blocked(-68.4,1),'Low room blocks walking');
const walker=createWalker(e.camera,obstacles);walker.setView({position:point(-71.6,2),target:point(-71.6,-5)});walker.keys.add('KeyW');for(let i=0;i<30;i++)walker.update(.1);assert(e.camera.position.distanceTo(new THREE.Vector3(...point(-71.6,-5)))>2,'Walker stops at the recessed door');
const ray=new THREE.Raycaster(),group=a.userData.larktonRecess.group;
for(const name of ['Recess shadowed entrance door','Recess pale room door']){const o=group.getObjectByName(name),p=o.getWorldPosition(new THREE.Vector3()),out=new THREE.Vector3(0,0,1).transformDirection(group.matrixWorld);p.y-=.3;ray.set(p.clone().addScaledVector(out,.5),out.negate());assert.equal(ray.intersectObject(a,true)[0]?.object.name,o.name,'Door stays visible');}
const back=group.getObjectByName('West court outer link brick walls'),low=group.getObjectByName('Recess low entrance room brick walls');assert(low.geometry.parameters.height<back.geometry.parameters.height);assert(low.position.z+low.geometry.parameters.depth/2>back.position.z+back.geometry.parameters.depth/2+4,'Low room projects ahead of recessed wall');
console.log('PASS: complete wing translation, unchanged neighbouring wards, recessed doors, low room and walking clearance.');
