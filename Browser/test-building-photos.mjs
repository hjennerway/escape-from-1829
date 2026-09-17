import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './dist/aerial-performance.mjs';
import {createBuildingDetail} from './dist/building-detail.mjs';
import {BUILDING_CATALOG} from './dist/building-catalog.mjs';
import {createBuildingSelection,isBuildingVisible} from './dist/building-selection.mjs';
import {decodeModel} from './dist/model-binary.mjs';
import {restoreAerialScene} from './dist/aerial-scene.mjs';
import {annexePoint,ANNEXE_MAP_SCALE} from './dist/annexe.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16};},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,16/9),layouts=createAerialLayouts(THREE,exterior);
const selection=createBuildingSelection(THREE,exterior);
assert.deepEqual(selection.entries.map(e=>e.id),BUILDING_CATALOG.map(e=>e.id),'Every catalogued building has selectable geometry');
const html=await readFile(new URL('./dist/aerial.html',import.meta.url),'utf8');
const menu=html.slice(html.indexOf('<div id="locationsPanel"'),html.indexOf('</ul></div>'));
for(const [,id] of menu.matchAll(/\?view=([^"&]+)/g))assert(BUILDING_CATALOG.some(e=>e.locations.includes(id)),`Named location ${id} is represented`);
for(const entry of BUILDING_CATALOG)for(const photo of [...entry.photos,...entry.contextPhotos??[]])assert((await stat(new URL(`./dist/${photo.src}`,import.meta.url))).size>0,photo.src);

const camera=new THREE.PerspectiveCamera(46,1,.1,3000),rect={left:0,top:0,width:1000,height:1000};
// Find a visible roof triangle, then pick through screen coordinates. This
// catches misplaced transformed wards, hidden sources and unselectable roofs.
const samples=[];
// The marked west frontage and its short court link select Larkton/Jodrell,
// while the neighbouring courtyard and central hall keep their own selections.
for(const [id,x,z] of [['larkton-jodrell',-90,-4],['larkton-jodrell',-63,-7],['tarvin-jarman',-45,25],['annexe',0,2]]){
 const target=annexePoint(x*ANNEXE_MAP_SCALE,0,z*ANNEXE_MAP_SCALE);
 const position=[target[0],200,target[2]+.001];
 camera.position.fromArray(position);camera.lookAt(...target);
 assert.equal(selection.pick(500,500,rect,camera)?.id,id,`Annexe ownership at ${x}, ${z}`);
 samples.push({id,position,target});
}
for(const entry of selection.entries){
 const p=entry.mesh.geometry.attributes.position,candidates=[];
 for(let i=0;i<p.count;i+=3){
  const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2);
  const normal=b.clone().sub(a).cross(c.clone().sub(a)).normalize();
  if(Math.abs(normal.y)>.25)candidates.push(a.add(b).add(c).multiplyScalar(1/3));
 }
 candidates.sort((a,b)=>b.y-a.y);
 let found;
 for(const point of candidates){
  camera.position.copy(point).add(new THREE.Vector3(0,200,.001));camera.lookAt(point);camera.updateMatrixWorld();
  if(selection.pick(500,500,rect,camera)?.id===entry.id){found={id:entry.id,position:camera.position.toArray(),target:point.toArray()};break;}
 }
 assert(found,`${entry.name} can be picked from its roof`);samples.push(found);
}
const exclusions=[exterior.trees,exterior.terrain,...layouts.visibilityObjects];
const detail=createBuildingDetail(THREE,exterior.model,{exclude:exclusions});
batchAerialMeshes(THREE,exterior.model,{exclude:exclusions});cacheAerialTransforms(exterior.scene);
const preparedSelection=createBuildingSelection(THREE,exterior);
assert.deepEqual(preparedSelection.entries.map(e=>e.id),selection.entries.map(e=>e.id),'Already prepared scenes retain every building');
for(const sample of samples){
 camera.position.set(...sample.position);camera.lookAt(...sample.target);detail.update(camera,900);
 assert.equal(selection.pick(500,500,rect,camera)?.id,sample.id,'Batching and detail changes retain building selection');
 assert.equal(preparedSelection.pick(500,500,rect,camera)?.id,sample.id,'Picking works when prepared after batching');
}
// No giant rectangle across the open front lawns or between wards.
camera.position.set(0,200,60);camera.lookAt(0,0,60);
assert.equal(selection.pick(500,500,rect,camera),null);
layouts.setVisible('historic',false);layouts.setVisible('modern',true);selection.refresh();
assert(!selection.entries.find(e=>e.id==='annexe').mesh.visible);
assert(selection.entries.find(e=>e.id==='1829-centre').mesh.visible);
layouts.setVisible('modern',false);selection.refresh();
assert(selection.entries.every(e=>!e.mesh.visible&&!isBuildingVisible(e.root)));
layouts.setVisible('historic',true);selection.refresh();assert(selection.entries.every(e=>e.mesh.visible));
const triangles=selection.entries.reduce((sum,e)=>sum+e.mesh.geometry.attributes.position.count/3,0);
assert(triangles<100000,'Selection uses compact wall/roof geometry');
// Compiled assets are optional locally, but exercise them whenever present.
let manifest;
try{manifest=JSON.parse(await readFile(new URL('./dist/compiled/manifest.json',import.meta.url),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
if(manifest){
 const raw=gunzipSync(await readFile(new URL('./dist/compiled/'+manifest.file,import.meta.url)));
 const compiled=restoreAerialScene(THREE,decodeModel(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length)),1);
 const loadedSelection=createBuildingSelection(THREE,compiled.exterior);
 assert.deepEqual(loadedSelection.entries.map(e=>e.id),BUILDING_CATALOG.map(e=>e.id),'Precompiled buildings retain their metadata and original structural surfaces');
 for(const sample of samples){camera.position.set(...sample.position);camera.lookAt(...sample.target);assert.equal(loadedSelection.pick(500,500,rect,camera)?.id,sample.id,'Precompiled selection matches source');}
 loadedSelection.dispose();console.log('PASS: precompiled building metadata and roof selection match the source scene.');
}
selection.dispose();preparedSelection.dispose();
console.log(`PASS: ${selection.entries.length} buildings, every named location, bundled photos, roof picking before/after batching and LOD, empty ground and layout visibility (${triangles} selection triangles).`);
