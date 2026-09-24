import {createHash} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {annexe}=createEscapeExterior(THREE,1.5);annexe.updateMatrixWorld(true);
const rows=[],instance=new THREE.Matrix4(),matrix=new THREE.Matrix4();
annexe.traverse(o=>{
 if(!o.isMesh||o.name==='Annexe drive')return;
 const hash=createHash('sha256');for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
 const geometry=hash.digest('hex'),local=o.matrix.clone();
 // Compose local ancestry directly to avoid translation-dependent rounding.
 for(let p=o.parent;p&&p!==annexe;p=p.parent)local.premultiply(p.matrix);
 const record=m=>rows.push(JSON.stringify([geometry,o.material.color?.getHex(),m.elements.map(n=>+n.toFixed(6))]));
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(matrix.multiplyMatrices(local,instance));}else record(local);
});
const snapshot={count:rows.length,digest:createHash('sha256').update(rows.sort().join('\n')).digest('hex')},path=new URL('../../Research/annexe-photo-placement/approved-shape.json',import.meta.url);
if(process.argv.includes('--save'))writeFileSync(path,JSON.stringify(snapshot,null,2)+'\n');else assert.deepEqual(snapshot,JSON.parse(readFileSync(path)),'Approved annexe local geometry remains unchanged');
console.log(snapshot);
