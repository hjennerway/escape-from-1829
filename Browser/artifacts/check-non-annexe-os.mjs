import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior as current} from '../dist/escape-exterior.mjs';
import {createEscapeExterior as baseline} from './escape-exterior-baseline.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
function digest(build){const e=build(THREE,1.5),rows=[];e.model.updateMatrixWorld(true);e.model.traverse(o=>{
 if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(p===e.annexe)return;
 const hash=createHash('sha256');for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
 if(o.instanceMatrix)hash.update(Buffer.from(o.instanceMatrix.array.buffer));
 rows.push(JSON.stringify([o.name,hash.digest('hex'),o.matrixWorld.elements,o.material.color?.getHex()]));
 });return {count:rows.length,digest:createHash('sha256').update(rows.sort().join('\n')).digest('hex')};}
const before=digest(baseline),after=digest(current);assert.deepEqual(after,before);console.log('PASS: non-annexe meshes, materials and world transforms unchanged',after);
