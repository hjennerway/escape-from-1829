import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {writeFile,readFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
const stage=process.argv[2]??'after',out=new URL('./',import.meta.url);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.6);model.updateMatrixWorld(true);
const solids=[],cache=new WeakMap();let instances=0;
function geometryHash(g){
 if(cache.has(g))return cache.get(g);
 const hash=createHash('sha256');
 for(const [name,a] of Object.entries(g.attributes).sort(([a],[b])=>a.localeCompare(b))){hash.update(name+':'+a.itemSize);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(g.index)hash.update(Buffer.from(g.index.array.buffer,g.index.array.byteOffset,g.index.array.byteLength));
 const value=hash.digest('hex');cache.set(g,value);return value;
}
model.traverse(o=>{
 if(!o.isMesh||!o.material?.map||o.material.userData.mineralFinish)return;
 // Exclude the render/stone trim being corrected. All brick, pitched roofs,
 // roads and grounds with their existing authored textures remain exact.
 const hash=createHash('sha256');hash.update(o.material.color.getHexString()+geometryHash(o.geometry));hash.update(JSON.stringify(o.matrixWorld.elements));
 if(o.isInstancedMesh){const a=o.instanceMatrix.array;hash.update(Buffer.from(a.buffer,a.byteOffset,o.count*16*a.BYTES_PER_ELEMENT));instances+=o.count;}
 solids.push(hash.digest('hex'));
});
solids.sort();
const result={mappedSolids:solids,instances,openings:model.userData.eastPhotoOpenings};
await writeFile(new URL(stage+'-preservation.json',out),JSON.stringify(result)+'\n');
if(stage==='after'){
 const before=JSON.parse(await readFile(new URL('before-preservation.json',out),'utf8'));
 assert.deepEqual(result,before,'All mapped solids and every sash opening retain their geometry, position and dimensions');
 console.log('PASS: '+solids.length+' mapped masonry/roof/ground meshes, '+instances+' mapped instances and '+result.openings.length+' photo openings remain exact.');
}else console.log('Saved original trim scene preservation record.');
