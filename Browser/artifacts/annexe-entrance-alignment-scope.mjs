import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {ANNEXE_MAP_SCALE} from '../dist/annexe.mjs';
import {ANNEXE_ACCESS_PAVING,ANNEXE_ACCESS_KERBS} from '../dist/annexe-access.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {annexe}=createEscapeExterior(THREE,1.5);annexe.updateMatrixWorld(true);
const rows=[],instance=new THREE.Matrix4();
annexe.traverse(o=>{
  // Later additive Oakmere work is independently checked by test-oakmere-court.
  for(let p=o;p;p=p.parent)if(p.name==='Oakmere rear court additions')return;
 if(!o.isMesh)return;
 const hash=createHash('sha256');
 for(const [name,a] of Object.entries(o.geometry.attributes).sort())hash.update(name).update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
 const geometry=hash.digest('hex'),local=o.matrix.clone();
 for(let p=o.parent;p&&p!==annexe;p=p.parent)local.premultiply(p.matrix);
 o.geometry.computeBoundingBox();
 const record=m=>{
  const box=o.geometry.boundingBox.clone().applyMatrix4(m);
  rows.push({key:JSON.stringify([o.name,geometry,[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]),m.elements.map(n=>+n.toFixed(5)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]),bounds:[...box.min.toArray(),...box.max.toArray()]});
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(local,instance));}else record(local);
});
const path=new URL('../../Research/annexe-frontage-adjustment/entrance-alignment-before.json',import.meta.url);
// This spatial envelope contains only the marked low entrance range. The
// fingerprint was derived from the original pre-edit primitive records.
const entranceRow=row=>{
 const [x,y,z,X,Y,Z]=row.bounds;
 return x>=-9*ANNEXE_MAP_SCALE-1&&X<=9*ANNEXE_MAP_SCALE+1&&y>=-.2&&Y<=8.5&&z>=10*ANNEXE_MAP_SCALE-.5&&Z<=21*ANNEXE_MAP_SCALE+3.5;
};
const protectedRows=rows.filter(row=>!entranceRow(row));
const protectedGeometry={primitives:protectedRows.length,sha256:createHash('sha256').update(protectedRows.map(row=>row.key).sort().join('\n')).digest('hex')};
const before=JSON.parse(readFileSync(path));
assert.deepEqual(annexe.matrix.toArray().map(n=>n||0),before.root);
assert.deepEqual(protectedGeometry,before.protectedGeometry,'Every primitive outside the marked low entrance range remains exact');
// The later whole-annexe loop fit supersedes the old rigid sweep translation.
// test-annexe-access checks the resized apron, kerbs, complete walkable sweep,
// wall contacts and its fixed-road mouth in the current site frame.
console.log('PASS: protected local entrance geometry retained after the whole-annexe loop fit.',protectedGeometry);
