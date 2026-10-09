import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {compileVisibleScene} from './dist/visible-shaders.mjs';
import {loadExploreLayout} from './dist/explore-layout-loading.mjs';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';

const scene=new THREE.Scene(),shown=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial()),hidden=new THREE.Group();
hidden.visible=false;hidden.add(new THREE.Mesh(shown.geometry,shown.material));scene.add(shown,hidden,new THREE.DirectionalLight());
const visited=[],parents=scene.children.map(o=>o.parent),camera=new THREE.PerspectiveCamera();
await compileVisibleScene(THREE,{compileAsync(view,c,target){assert.equal(c,camera);assert.equal(target,scene);view.traverse(o=>visited.push(o));}},scene,camera);
assert(visited.includes(shown));assert(!visited.includes(hidden.children[0]));
assert.deepEqual(scene.children.map(o=>o.parent),parents);assert.equal(hidden.visible,false);

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),expected=buildAsylumLayout(plan).floors;
const fetchFile=async()=>({ok:true,json:async()=>plan});let terminated=0;
const loaded=await loadExploreLayout({fetchFile,makeWorker:()=>({postMessage(value){assert.equal(value,plan);queueMicrotask(()=>this.onmessage({data:{floors:structuredClone(expected)}}));},terminate(){terminated++;}})});
assert.deepEqual(loaded.floors,expected,'Worker restoration keeps every wall, door, stair, collision index and navigation cell');assert.equal(loaded.plan,plan);assert.equal(terminated,1);
const fallback=await loadExploreLayout({fetchFile,makeWorker:()=>({postMessage(){queueMicrotask(()=>this.onerror());},terminate(){terminated++;}})});
assert.deepEqual(fallback.floors,expected);assert.equal(terminated,2);
const unavailable=await loadExploreLayout({fetchFile,makeWorker:()=>{throw Error('Workers disabled');}});
assert.deepEqual(unavailable.floors,expected);
await assert.rejects(loadExploreLayout({fetchFile:async()=>({ok:false})}),/Floor plans could not load/);
console.log('PASS: visible shader selection preserves the scene; worker layout matches shared collision/navigation data; failure and unavailable-worker fallbacks.');
