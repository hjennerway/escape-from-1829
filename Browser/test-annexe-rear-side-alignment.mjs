import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {rearSideSnapshot} from './artifacts/rear-side-alignment-scope.mjs';
import {ANNEXE_MAP_SCALE,annexePoint} from './dist/annexe.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const before=JSON.parse(readFileSync(new URL('../Research/annexe-kitchen/side-alignment-before.json',import.meta.url))),e=createEscapeExterior(THREE,1.5),a=e.annexe;
if(!process.argv.includes('--original-east')){execFileSync(process.execPath,['--import',new URL('./artifacts/rear-side-original-east-loader.mjs',import.meta.url).href,fileURLToPath(import.meta.url),'--original-east'],{windowsHide:true});}
if(process.argv.includes('--original-east')){
assert.deepEqual(rearSideSnapshot(THREE,a,{normalise:true}),before.snapshot,'Every retained primitive preserves its shape, material and height; only the marked assemblies move');
assert.deepEqual(a.matrix.toArray().map(n=>n||0),before.root);
for(const old of before.ranges){const b=a.userData.ranges.find(b=>b.name===old.name);if(old.name==='Rear service court link'){assert(!b);continue;}assert(b);const shift=old.name==='Rear court west range'?[-9,0]:old.wardId==='oakmere'?[10*Math.cos(.43),-10*Math.sin(.43)]:[0,0];assert(Math.abs(b.x-old.x-shift[0]*ANNEXE_MAP_SCALE)<1e-9);assert(Math.abs(b.z-old.z-shift[1]*ANNEXE_MAP_SCALE)<1e-9);for(const k of ['w','d','h','r'])assert.equal(b[k]||0,old[k]||0);}
}
assert(!a.getObjectByName('Rear service court link assembly'));assert(!a.getObjectByName('Oakmere west low rear end room'));
e.scene.updateMatrixWorld(true);const obstacles=exteriorObstacles(THREE,e.model);
const contains=(x,z)=>{const p=annexePoint(x*ANNEXE_MAP_SCALE,1.8,z*ANNEXE_MAP_SCALE);return obstacles.some(o=>obstacleContains(o,p[0],p[2],.1));};
assert(contains(-25,-35),'Moved west range has collisions');assert(!contains(-10,-35),'Its vacated interior is open');assert(!contains(-22,-57),'Removed connector leaves a walkable gap');
const ray=new THREE.Raycaster();ray.set(new THREE.Vector3(...annexePoint(-15*ANNEXE_MAP_SCALE,2,-35*ANNEXE_MAP_SCALE)),new THREE.Vector3(0,-1,0));assert.equal(ray.intersectObject(a,true)[0]?.object.name,'Annexe rear courtyard paving','Expanded court stays paved');
// Independent pixel guides from the supplied 850 x 786 annotation.
const fit=JSON.parse(readFileSync(new URL('./artifacts/rear-side-camera.json',import.meta.url))),p=fit.parameters;
const right=[Math.cos(p[3]),0,-Math.sin(p[3])],up=[-Math.sin(p[3])*Math.sin(p[4]),Math.cos(p[4]),-Math.cos(p[3])*Math.sin(p[4])],forward=[-Math.sin(p[3])*Math.cos(p[4]),-Math.sin(p[4]),-Math.cos(p[3])*Math.cos(p[4])];
const project=q=>{const d=q.map((v,i)=>v-p[i]),dot=a=>a.reduce((v,n,i)=>v+n*d[i],0),z=dot(forward);return [p[6]+p[5]*dot(right)/z,p[7]-p[5]*dot(up)/z];};
const distance=(p,a,b)=>Math.abs((b[0]-a[0])*(a[1]-p[1])-(a[0]-p[0])*(b[1]-a[1]))/Math.hypot(b[0]-a[0],b[1]-a[1]);
for(const i of [2,3]){const q=[...fit.worldPoints[i]];q[0]-=9*ANNEXE_MAP_SCALE;assert(distance(project(q),[270,357],[279,583])<5,'Yellow edge aligns with blue guide');}
const q=[...fit.worldPoints[9]];q[0]+=10*Math.cos(.43)*ANNEXE_MAP_SCALE;q[2]-=10*Math.sin(.43)*ANNEXE_MAP_SCALE;assert(distance(project(q),[257,216],[310,325])<6,'Orange edge aligns with purple guide');
console.log('PASS: marked rear translations, removed connector, all retained primitives preserved, fixed root, paving and walking collisions.');


