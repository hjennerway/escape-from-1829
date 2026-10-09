import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const jarmanPath=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),leightonPath=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const jarmanText=readFileSync(jarmanPath,'utf8'),leightonText=readFileSync(leightonPath,'utf8'),jarman=JSON.parse(jarmanText),leighton=JSON.parse(leightonText);
const exterior=createEscapeExterior(THREE,1.5),current={jarman:jarmanProtected(THREE,exterior.model),leighton:leightonProtected(THREE,exterior.model)};
const source=readFileSync(new URL('before-entrance-walks.mjs',import.meta.url),'utf8').replace("'./west-side-basement.mjs'",JSON.stringify(new URL('../../dist/west-side-basement.mjs',import.meta.url).href));
const {addEntranceWalks}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const original=new THREE.Group();addEntranceWalks(THREE,{model:original,material:color=>new THREE.MeshStandardMaterial({color,roughness:.9})});
const changed=[];
for(const name of ['West entrance wing walk','East entrance wing walk']){
 const mesh=exterior.model.getObjectByName(name),before=original.getObjectByName(name);assert(mesh&&before);
 assert.equal(mesh.geometry.attributes.position.count,before.geometry.attributes.position.count,'Retain apron vertex count');
 changed.push({name,mesh,geometry:mesh.geometry});mesh.geometry=before.geometry;
}
// Replacing only these two aprons must reproduce both complete estate fixtures.
// This protects every other material, primitive, placement and vertex buffer.
assert.deepEqual(jarmanProtected(THREE,exterior.model),jarman);
assert.deepEqual(leightonProtected(THREE,exterior.model),leighton.geometry);
for(const row of changed)row.mesh.geometry=row.geometry;
assert.equal(current.jarman.primitives,jarman.primitives);assert.equal(current.leighton.count,leighton.geometry.count);
assert.equal(readFileSync(jarmanPath,'utf8'),jarmanText,'Fixture changed during audit');
assert.equal(readFileSync(leightonPath,'utf8'),leightonText,'Fixture changed during audit');
writeFileSync(jarmanPath,JSON.stringify(current.jarman,null,2)+'\n');
writeFileSync(leightonPath,JSON.stringify({...leighton,geometry:current.leighton},null,2)+'\n');
writeFileSync(new URL('snapshot-refresh.json',import.meta.url),JSON.stringify({changed:changed.map(r=>r.name),original:{jarman,leighton:leighton.geometry},current,allOtherGeometryExact:true},null,2)+'\n');
console.log('PASS: only the two entrance-wing apron geometries differ; both complete estate fingerprints reproduced before their intentional update.');
