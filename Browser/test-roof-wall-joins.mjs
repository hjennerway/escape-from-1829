import assert from 'node:assert/strict';
import {readFile,writeFile,rm} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {closeRoofWallGaps} from './dist/roof-wall-joins.mjs';
import {checkRedesmereRoofProtrusions} from './test-support/redesmere-roof-probes.mjs';
import {checkGarageRoofJoins} from './test-support/garage-roof-probes.mjs';
import {checkBlueRoofLanternPanes} from './test-support/blue-roof-lantern-probes.mjs';
import {checkCourtyardLeanTo} from './test-support/courtyard-lean-to-probes.mjs';
import {checkServiceGableJoins} from './test-support/service-gable-probes.mjs';
import {checkFrontCornerFlicker} from './test-support/front-corner-flicker-probes.mjs';
import {checkRoofWallFlicker} from './test-support/roof-wall-flicker-probes.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
// A reflected parent must preserve outward fascia faces as well as the roof
// backing. Horizontal rays below the slate cannot be satisfied by its underside.
for(const reflection of [1,-1]){
 const model=new THREE.Group();model.scale.x=reflection;
 const render=new THREE.MeshStandardMaterial({color:0xffffff});
 const wall=new THREE.Mesh(new THREE.BoxGeometry(2,3,2),render);wall.position.y=1.5;model.add(wall);
 const slate=new THREE.MeshStandardMaterial({color:0x334455});slate.userData.roofTilePixels=true;
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute([-1.2,3.25,-1.2,-1.2,3.25,1.2,1.2,3.25,1.2,1.2,3.25,-1.2],3));
 g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();
 const roof=new THREE.Mesh(g,slate);roof.name='Fixture slate roof';model.add(roof);
 closeRoofWallGaps(THREE,model);model.updateMatrixWorld(true);
 for(const [x,z] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const ray=new THREE.Raycaster(new THREE.Vector3(x*2,3.12,z*2),new THREE.Vector3(-x,0,-z));
  const hit=ray.intersectObject(model,true)[0];
  assert(hit?.object.userData.roofWallClosure,'Opaque fascia from every side, including mirrored buildings');
  assert.equal(hit.object.material,render,'Fascia uses its cornice material');
  assert(Math.abs(hit.distance-.8)<.002,'Outward fascia is visible at the slate edge under parent reflection '+reflection);
 }
}
let exterior;
if(process.argv.includes('--compiled')){
 const {gunzipSync}=await import('node:zlib'),{decodeModel}=await import('./dist/model-binary.mjs'),{restoreAerialScene}=await import('./dist/aerial-scene.mjs'),{modelSourceHash}=await import('./model-build-inputs.mjs');
 const manifest=JSON.parse(await readFile(new URL('./dist/compiled/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.sourceHash,await modelSourceHash(),'Compiled roof checks require current sources');
 const raw=gunzipSync(await readFile(new URL('./dist/compiled/'+manifest.file,import.meta.url)));
 ({exterior}=restoreAerialScene(THREE,decodeModel(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength)),1.5));
}else{exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);}
exterior.model.updateMatrixWorld(true);
const flickerProbes=JSON.parse(await readFile(new URL('./test-support/roof-wall-flicker-rays.json',import.meta.url),'utf8'));
console.log(`PASS: ${checkRoofWallFlicker(THREE,exterior.model,flickerProbes)} formerly competing estate roof/wall surfaces remain covered without duplicate fascias.`);
console.log(`PASS: ${checkFrontCornerFlicker(THREE,exterior.model)} front-wing brick surfaces without competing roof fillers.`);
checkRedesmereRoofProtrusions(THREE,exterior.model);
checkServiceGableJoins(THREE,exterior.towerBuildings);
checkGarageRoofJoins(THREE,exterior.garagesMortuary);
const lanternGroup=exterior.model.getObjectByName('Tower service buildings');
assert.equal(checkBlueRoofLanternPanes(THREE,lanternGroup,lanternGroup.userData.openings.filter(o=>o.label.includes('blue dormer')&&o.label.endsWith('glazing'))),96);
assert.equal(checkBlueRoofLanternPanes(THREE,exterior.garagesMortuary.userData.mortuary,[-1,1].map(side=>({x:0,y:5.34,z:3.5+side*.86,r:side===1?0:Math.PI,w:2.5,h:.4,label:'Mortuary blue ridge vent'}))),16);
checkCourtyardLeanTo(THREE,exterior.model,{walking:!process.argv.includes('--compiled')});
const objects=[],skins=[];let surveyed=0,solids=0,closures=0;
exterior.model.traverse(o=>{if(!o.isMesh)return;objects.push(o);if(o.material?.userData.roofTilePixels)skins.push(o);if(o.userData.roofWallJoinsFinished){surveyed++;solids+=Number(!!o.userData.roofWallJoinSummary.solid);}if(o.userData.roofWallClosure)closures++;});
assert(surveyed>=560&&solids>=280,'Survey the complete estate, including closed slabs, dormers and late tower buildings');
assert(skins.filter(o=>!o.isInstancedMesh&&!o.userData.roofWallClosure&&!o.userData.aerialBatch).every(o=>o.userData.roofWallJoinsFinished),'Every original tiled roof must be surveyed');
assert(closures>200,'Repair the open roof families across the estate');
const rays=JSON.parse(await readFile(new URL('./test-support/roof-wall-rays.json',import.meta.url),'utf8')),ray=new THREE.Raycaster(),failures=[];
for(const probe of rays){
 ray.set(new THREE.Vector3(...probe.origin),new THREE.Vector3(...probe.direction));
 // October 7 raises these old internal eaves into the continuous 15.66 ridge
 // roof. Keep the frozen ray origins/directions, reaching its new underside.
 ray.far=probe.roof==='Redesmere aligned frontage slate roof'&&probe.direction[1]===1?1.7:probe.distance;
 // The subsequent garden-side cut lowers this old eave below the frozen
 // origin. Keep its footprint and upward direction, starting below the new
 // entrance pitch so the probe still verifies an opaque roof underside.
 if(probe.roof==='Redesmere aligned frontage slate roof'&&probe.direction[1]===1&&
    Math.abs(probe.origin[0]-40.575)<.001&&probe.origin[2]===17){
  ray.ray.origin.y=13.06+(17.4-probe.origin[2])*2.6/5.4-.3;ray.far=.31;
 }
 if(!ray.intersectObjects(objects,false).length)failures.push(probe);
}
assert(rays.length>200,'Retain wide coverage of independently frozen, formerly open eaves');
const failureReport=new URL('./artifacts/roof-wall-gaps/remaining-rays.json',import.meta.url);
if(failures.length)await writeFile(failureReport,JSON.stringify(failures,null,2));
else await rm(failureReport,{force:true});
assert.deepEqual(failures,[],'Ground viewing rays must meet solid roof/wall joins instead of sky');
if(!process.argv.includes('--compiled')){
 const before=objects.length;const repeat=closeRoofWallGaps(THREE,exterior.model,{exclude:[exterior.trees,exterior.terrain]});
 assert.equal(repeat.roofs,0,'Running the finish again must not add duplicate faces');
 let count=0;exterior.model.traverse(o=>{if(o.isMesh)count++;});assert.equal(count,before);
}
console.log(`PASS: ${surveyed} roof meshes surveyed (${solids} solid undersides), ${rays.length} formerly open ground rays closed; slate sources retained.`);
