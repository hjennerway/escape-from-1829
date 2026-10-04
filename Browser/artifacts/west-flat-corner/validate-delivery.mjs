import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import * as THREE from '../../dist/vendor/three.module.js';
import {decodeModel} from '../../dist/model-binary.mjs';
import {restoreAerialScene} from '../../dist/aerial-scene.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';
import {exteriorObstacles,obstacleContains} from '../../dist/explore-controls.mjs';
const manifest=JSON.parse(await readFile(new URL('../../dist/compiled/manifest.json',import.meta.url)));
assert.equal(manifest.sourceHash,await modelSourceHash(),'The delivery model must match the current source');
const packed=await readFile(new URL('../../dist/compiled/'+manifest.file,import.meta.url));
assert.equal(createHash('sha256').update(packed).digest('hex'),manifest.sha256);
const raw=gunzipSync(packed),snapshot=decodeModel(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length));
const {exterior}=restoreAerialScene(THREE,snapshot,16/9),model=exterior.model;model.updateMatrixWorld(true);
// The period controller splits named meshes and clips their collision polygons.
const roofs=[],bodies=[];
model.traverse(o=>{if(o.name==='West inside corner flat roof')roofs.push(o);if(o.name==='West inside corner stepped infill masonry')bodies.push(o);});
assert(roofs.length&&bodies.length,'Both new named meshes survive compilation');
const obstacles=bodies.flatMap(body=>{const visible=body.visible;body.visible=true;const parts=exteriorObstacles(THREE,body);body.visible=visible;return parts;});
const ray=new THREE.Raycaster();
for(const [x,z] of [[-34.4,16.5],[-34,17.5],[-34.4,20.5],[-33,19.1],[-32.3,20.5]]){
 ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObjects(roofs,false)[0];
 assert(h&&Math.abs(h.point.y-8.83)<1e-5&&h.face.normal.y>.99,'The compiled roof is flat');
 assert(obstacles.some(o=>obstacleContains(o,x,z,0)),'Period-split compiled collisions cover the addition');
}
for(const [x,z] of [[-33.3,17],[-32.5,18],[-31.5,20]])assert(!obstacles.some(o=>obstacleContains(o,x,z,.05)),'The compiled step leaves the court clear');
const windows=model.userData.frontInsideCornerOpenings.filter(o=>o.face==='west-inside-corner-3'||o.face==='west-inside-corner-4');
assert.equal(windows.length,4);for(const o of windows)assert(Math.abs(o.rotation-Math.PI/2)<1e-6);
const report={sourceHash:manifest.sourceHash,asset:manifest.file,flatRoofProbes:5,retainedWindows:windows.length,collisionFootprints:obstacles.map(o=>o.corners)};
await writeFile(new URL('delivery-validation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('PASS: current-source fingerprint, binary checksum, five level-roof probes, stepped collision footprint and four moved window records in the final compiled asset.');
