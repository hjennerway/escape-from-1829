import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {prepareExteriorShadows,installExteriorShadowFiltering} from './dist/exterior-shadows.mjs';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';

// Check the pinned renderer's integration points, including repeat initialization
// when source scenes and compiled scenes are loaded in the same session.
const originalShader=THREE.ShaderChunk.shadowmap_pars_fragment;
installExteriorShadowFiltering(THREE);
const filteredShader=THREE.ShaderChunk.shadowmap_pars_fragment;
assert.notEqual(filteredShader,originalShader);
assert.equal((filteredShader.match(/estateShadowTap\( shadowMap,/g)||[]).length,5,'Preserve all five PCF sample positions');
assert.equal((filteredShader.match(/float estateShadowTap\(/g)||[]).length,1);
for(const branch of ['#elif defined( SHADOWMAP_TYPE_VSM )','#else // SHADOWMAP_TYPE_BASIC'])
 assert.equal(filteredShader.slice(filteredShader.indexOf(branch)),originalShader.slice(originalShader.indexOf(branch)),'Leave other shadow filters unchanged');
installExteriorShadowFiltering(THREE);assert.equal(THREE.ShaderChunk.shadowmap_pars_fragment,filteredShader,'Installation is idempotent');

// Protect cutout foliage, deliberately sided materials and non-casting detail.
const group=new THREE.Group(),geometry=new THREE.BoxGeometry();
const make=options=>{const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial(options));mesh.castShadow=true;group.add(mesh);return mesh;};
const opaque=make({}),cutout=make({alphaTest:.5}),transparent=make({transparent:true}),custom=make({shadowSide:THREE.FrontSide}),detail=make({}),tree=make({});
detail.castShadow=false;
prepareExteriorShadows(THREE,group,{exclude:[tree]});
assert.equal(opaque.material.side,THREE.FrontSide,'Visible face culling is unchanged');
assert.equal(opaque.material.shadowSide,THREE.DoubleSide,'Both opaque wall skins block sunlight');
for(const mesh of [cutout,transparent,detail,tree])assert.equal(mesh.material.shadowSide,null);
assert.equal(custom.material.shadowSide,THREE.FrontSide);

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);
const sun=exterior.scene.children.find(o=>o.isDirectionalLight);
assert(sun.shadow.normalBias<=.025,'Receiver offsets stay below the surveyed masonry seam widths');
assert(Math.abs(sun.shadow.bias)*(sun.shadow.camera.far-sun.shadow.camera.near)<.025,'Depth offset stays below 2.5 cm throughout the estate');
let casters=0;
exterior.model.traverse(o=>{
 if(!o.isMesh||!o.castShadow)return;
 for(let p=o;p;p=p.parent)if(p===exterior.trees)return;
 for(const m of [o.material].flat())if(m&&!m.transparent&&!m.alphaTest){assert.notEqual(m.shadowSide,null,'Opaque estate caster uses its sun-facing skin: '+o.name);casters++;}
});
assert(casters>1000,'Survey all assembled architectural shadow casters');
sun.shadow.needsUpdate=false;exterior.invalidateShadows();assert(sun.shadow.needsUpdate,'Runtime changes still refresh cached shadows');
console.log(`PASS: ${casters} opaque exterior shadow casters, bounded contact offsets, unchanged visible culling, preserved foliage/custom shadows and cached-map invalidation.`);
