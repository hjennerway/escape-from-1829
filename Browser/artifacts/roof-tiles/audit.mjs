import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:text=>({width:text.length*16}),strokeText(){},fillText(){}})})};
const stage=process.argv[2]??'before',out=new URL('./',import.meta.url);
await mkdir(out,{recursive:true});
const exterior=createEscapeExterior(THREE,1.6),{model}=exterior;
if(process.argv.includes('--layouts'))createAerialLayouts(THREE,exterior);
model.updateMatrixWorld(true);
const maps=new Set([model.getObjectByName('West end continuous slate roof').material.map,
 model.getObjectByName('Outhouse continuous slate roof').material.map]);
const tiled=[],other=[],cache=new WeakMap(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
function hashGeometry(g,tiles){
 const key=tiles?'tiles':'other';let cached=cache.get(g);if(cached?.[key])return cached[key];
 const hash=createHash('sha256');
 if(tiles){
  for(const name of ['position','normal']){
   const attr=g.attributes[name];hash.update(name);
   for(let i=0;i<(g.index?.count??attr.count);i++){
    const n=g.index?g.index.getX(i):i;
    hash.update(JSON.stringify(Array.from({length:attr.itemSize},(_,j)=>attr.array[n*attr.itemSize+j])));
   }
  }
 }else{
  for(const [name,attr] of Object.entries(g.attributes).sort()){
   hash.update(name);hash.update(Buffer.from(attr.array.buffer,attr.array.byteOffset,attr.array.byteLength));
  }
  if(g.index)hash.update(Buffer.from(g.index.array.buffer,g.index.array.byteOffset,g.index.array.byteLength));
 }
 const result=hash.digest('hex');cached??={};cached[key]=result;cache.set(g,cached);return result;
}
const roofInventory=[];
model.traverse(o=>{
 if(!o.isMesh)return;
 const tiles=maps.has(o.material?.map),hash=createHash('sha256');
 hash.update(o.name+hashGeometry(o.geometry,tiles)+JSON.stringify(o.matrixWorld.elements));
 hash.update(JSON.stringify([o.material?.color?.getHex(),o.castShadow,o.receiveShadow,o.visible]));
 if(o.isInstancedMesh)hash.update(Buffer.from(o.instanceMatrix.array.buffer,0,o.count*16*4));
 (tiles?tiled:other).push(hash.digest('hex'));
 if(!tiles)return;
 const p=o.geometry.attributes.position,index=o.geometry.index;let sloping=0;
 for(let i=0;i<(index?.count??p.count);i+=3){
  a.fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(o.matrixWorld);
  b.fromBufferAttribute(p,index?index.getX(i+1):i+1).applyMatrix4(o.matrixWorld);
  c.fromBufferAttribute(p,index?index.getX(i+2):i+2).applyMatrix4(o.matrixWorld);
  const normal=b.clone().sub(a).cross(c.clone().sub(a)).normalize();
  if(Math.abs(normal.y)>.001&&Math.abs(normal.y)<.999999)sloping++;
 }
 roofInventory.push({name:o.name,vertices:p.count,indexed:!!index,instances:o.isInstancedMesh?o.count:0,sloping});
});
const result={tiled:tiled.sort(),other:other.sort()};
await writeFile(new URL(stage+'-preservation.json',out),JSON.stringify(result)+'\n');
await writeFile(new URL(stage+'-inventory.json',out),JSON.stringify(roofInventory,null,2)+'\n');
if(stage.startsWith('after'))assert.deepEqual(result,JSON.parse(await readFile(new URL(stage.replace('after','before')+'-preservation.json',out),'utf8')),
 'Roof triangle positions/normals, all other geometry, transforms, colours and visibility are preserved');
console.log(JSON.stringify({stage,tiledMeshes:tiled.length,otherMeshes:other.length,
 slopingTriangles:roofInventory.reduce((n,o)=>n+o.sloping,0),indexedSlopes:roofInventory.filter(o=>o.indexed&&o.sloping),
 instanced:roofInventory.filter(o=>o.instances)},null,2));
