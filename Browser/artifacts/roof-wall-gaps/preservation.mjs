import assert from 'node:assert/strict';
import * as T from '../../dist/vendor/three.module.js';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const importSaved=async name=>{
 const source=(await readFile(new URL('before-'+name,import.meta.url),'utf8')).replace(/from '(\.\/[^']+)'/g,(_,path)=>"from '"+new URL('../../dist/'+path.slice(2),import.meta.url).href+"'");
 return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
};
const oldExterior=await importSaved('escape-exterior.mjs'),oldLayouts=await importSaved('aerial-layouts.mjs');
const before=oldExterior.createEscapeExterior(T,1.5);oldLayouts.createAerialLayouts(T,before);
const after=createEscapeExterior(T,1.5);createAerialLayouts(T,after);
const hash=data=>createHash('sha256').update(new Uint8Array(data.buffer,data.byteOffset,data.byteLength)).digest('hex');
function snapshot(e){
 e.model.updateMatrixWorld(true);const records=[],counts=new Map();let addedTriangles=0,addedMeshes=0;
 e.model.traverse(o=>{
  if(!o.isMesh)return;
  if(o.userData.roofWallClosure){addedMeshes++;addedTriangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;return;}
  const parents=[];for(let p=o.parent;p&&p!==e.model;p=p.parent)parents.unshift(p.name);
  const base=[...parents,o.name].join('/'),index=counts.get(base)??0;counts.set(base,index+1);
  const g=o.geometry,m=o.material;
  records.push({key:base+'#'+index,attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,v])=>[k,hash(v.array)])),index:g.index?hash(g.index.array):null,matrix:o.matrixWorld.toArray(),instances:o.isInstancedMesh?hash(o.instanceMatrix.array):null,colour:m.color?.getHex(),side:m.side,shadow:[o.castShadow,o.receiveShadow],visible:o.visible});
 });
 return {records,addedTriangles,addedMeshes};
}
const a=snapshot(before),b=snapshot(after);assert.deepEqual(b.records,a.records,'All authored geometry, normals, UVs, transforms, materials and visibility must stay intact');
const result={originalMeshes:a.records.length,originalGeometryPreserved:true,addedMeshes:b.addedMeshes,addedTriangles:b.addedTriangles};
await writeFile(new URL('preservation.json',import.meta.url),JSON.stringify(result,null,2));console.log(result);
const originalFacade=await readFile(new URL('../../test-facade-courses.mjs',import.meta.url),'utf8');
const oldTest=originalFacade.replace(/from '(\.\/[^']+)'/g,(_,path)=>"from '"+new URL('../../'+path.slice(2),import.meta.url).href+"'").replace(/import \{createEscapeExterior\} from '[^']+';/,"const createEscapeExterior=globalThis.savedRoofExterior;");
globalThis.savedRoofExterior=oldExterior.createEscapeExterior;
try{await import('data:text/javascript;base64,'+Buffer.from(oldTest).toString('base64'));}catch(error){
 await writeFile(new URL('baseline-facade-failure.json',import.meta.url),JSON.stringify({message:error.message,actual:error.actual,expected:error.expected},null,2));
 console.log('Original facade check:',error.message.split('\n')[0],error.actual,error.expected);
}
