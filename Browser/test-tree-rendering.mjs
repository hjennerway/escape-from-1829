import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {isSoftwareRenderer,applyTreeRenderingDefault} from './dist/tree-rendering.mjs';
import {createTreeLayer,bindTreeToggle} from './dist/tree-layer.mjs';
import {createWalker,exteriorObstacles} from './dist/explore-controls.mjs';

function context(name,{extension=true,masked='WebKit WebGL',throws=false}={}){
  return {RENDERER:1,getExtension(){if(throws)throw new Error('Restricted');return extension?{UNMASKED_RENDERER_WEBGL:2}:null;},getParameter(key){return key===2?name:masked;}};
}
for(const name of ['ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)','llvmpipe (LLVM 15.0.7, 256 bits)','softpipe','Mesa lavapipe','swrast','Software Rasterizer','Apple Software Renderer','ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11)','Microsoft WARP','GDI Generic']){
  assert.equal(isSoftwareRenderer(context(name)),true,name);
  assert.equal(isSoftwareRenderer(context(null,{extension:false,masked:name})),true,'Masked '+name);
}
for(const name of ['ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)','ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11)','AMD Radeon RX 6800','Apple M3','Adreno (TM) 740','Mali-G78','Mesa Intel(R) UHD Graphics 630','ANGLE (Microsoft, D3D12 (NVIDIA GeForce RTX 3080))','WebKit WebGL',null,''])assert.equal(isSoftwareRenderer(context(name)),false,String(name));
assert.equal(isSoftwareRenderer(context(null,{extension:false})),false);
assert.equal(isSoftwareRenderer(context(null,{throws:true})),false);
assert.equal(isSoftwareRenderer(context(null,{throws:true,masked:'llvmpipe'})),true);
assert.equal(isSoftwareRenderer({getExtension(){throw new Error('Restricted');},getParameter(){throw new Error('Lost');}}),false);
assert.equal(isSoftwareRenderer(null),false);

// Exercise actual scene visibility, cached shadows, and walking through a trunk.
const model=new THREE.Group(),trees=createTreeLayer(THREE,model);
const trunk=new THREE.Mesh(new THREE.BoxGeometry(1,4,1));trunk.position.set(0,2,0);trees.add(trunk);
const camera=new THREE.PerspectiveCamera(),walker=createWalker(camera,exteriorObstacles(THREE,model));
let shadows=0,changes=0;
const exterior={trees,invalidateShadows(){shadows++;}};
const refresh=()=>{changes++;walker.setObstacles(exteriorObstacles(THREE,model));};
const renderer={getContext:()=>context('SwiftShader')};
function walkPastTree(){walker.setView({position:[0,1.8,2],target:[0,1.8,-2]});walker.keys.add('KeyW');for(let i=0;i<8;i++)walker.update(.1);return camera.position.z;}
assert(walkPastTree()>.5,'Visible trunk blocks walking');
applyTreeRenderingDefault(renderer,exterior,refresh);
assert.equal(trees.visible,false);assert.equal(shadows,1);assert.equal(changes,1);
assert(walkPastTree()<-1.9,'Automatic hiding refreshes the collision index');
applyTreeRenderingDefault(renderer,exterior,refresh);
assert.equal(changes,1,'An already-hidden layer needs no second refresh');
const target=new EventTarget();bindTreeToggle(exterior,target,refresh);
const toggle=()=>{const event=new Event('keydown',{cancelable:true});event.code='KeyT';target.dispatchEvent(event);};
toggle();assert.equal(trees.visible,true);assert(walkPastTree()>.5,'Manual override restores trunk collisions');
toggle();assert.equal(trees.visible,false);assert(walkPastTree()<-1.9);
for(const gl of [context('Intel UHD'),context(null,{extension:false})]){
  trees.visible=true;const before=changes;
  applyTreeRenderingDefault({getContext:()=>gl},exterior,refresh);
  assert.equal(trees.visible,true);assert.equal(changes,before);
}
console.log('PASS: software renderer detection, restricted information, GPU defaults, shadow refresh and tree collision overrides.');
