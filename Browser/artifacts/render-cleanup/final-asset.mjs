import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import * as THREE from '../../dist/vendor/three.module.js';
import {decodeModel} from '../../dist/model-binary.mjs';
import {restoreAerialScene,buildAerialScene} from '../../dist/aerial-scene.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const root=new URL('../../dist/compiled/',import.meta.url),manifest=JSON.parse(await readFile(new URL('manifest.json',root)));
assert.equal(manifest.sourceHash,await modelSourceHash());
const packed=await readFile(new URL(manifest.file,root));assert.equal(createHash('sha256').update(packed).digest('hex'),manifest.sha256);
const raw=gunzipSync(packed),{exterior}=restoreAerialScene(THREE,decodeModel(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length)),1.6);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const {exterior:source}=await buildAerialScene(THREE,1.6,{detail:false});source.model.updateMatrixWorld(true);exterior.model.updateMatrixWorld(true);
const names=['East lawn continuous upper floor band','East lawn bay continuous floor band'];
for(const side of ['West','East'])for(const i of side==='West'?[0,1,2,5]:[0,1,2,3,4])for(const part of ['brick facet','roof junction','continuous coping'])names.push(side+' inside corner '+part+' '+i);
for(const name of names){
 const a=source.model.getObjectByName(name),b=exterior.model.getObjectByName(name);assert(a&&b,name);
 for(const key of Object.keys(a.geometry.attributes))assert.deepEqual(b.geometry.attributes[key].array,a.geometry.attributes[key].array,name+' '+key);
 assert.deepEqual(b.matrixWorld.elements,a.matrixWorld.elements,name+' transform');
}
const visible=[];exterior.model.traverseVisible(o=>{if(o.isMesh)visible.push(o);});const ray=new THREE.Raycaster();let probes=0;
for(const y of [4.165,8.63])for(const z of [19.9,20.3,20.7,22,23]){
 ray.set(new THREE.Vector3(31.88,y+.04,z),new THREE.Vector3(0,-1,0));ray.far=.08;
 const hits=ray.intersectObjects(visible,false);assert.equal(hits.length,z<21?0:1,'Visible compiled render stops at the diagonal wall');probes++;
}
const report={sourceHash:manifest.sourceHash,file:manifest.file,sha256:manifest.sha256,namedParts:names.length,visibleProbes:probes};await writeFile(new URL('final-asset.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log('PASS: current fingerprint/checksum, '+names.length+' source-identical repaired parts and '+probes+' visible compiled band probes.');
