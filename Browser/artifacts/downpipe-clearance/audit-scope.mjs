import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,mkdir,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
const directory=new URL('./baseline/',import.meta.url);await mkdir(directory,{recursive:true});
for(const name of await readdir(new URL('../../dist/',import.meta.url)))if(name.endsWith('.mjs'))await copyFile(new URL('../../dist/'+name,import.meta.url),new URL(name,directory));
// Freeze current sources for both sides: concurrent roof work must not be
// attributed to the pipe repair. The baseline keeps every original pipe matrix.
const clearance=new URL('downpipe-clearance.mjs',directory);
await writeFile(clearance,(await readFile(clearance,'utf8')).replace('export function avoidWindowDownpipes(THREE,root){','export function avoidWindowDownpipes(THREE,root){ return {};'));
for(const name of await readdir(directory))if(name.endsWith('.mjs')){
 const file=new URL(name,directory),source=await readFile(file,'utf8');
 await writeFile(file,source.replace(/(['"])\.\/vendor\/([^'"]+)\1/g,(_,quote,path)=>quote+new URL('../../dist/vendor/'+path,import.meta.url).href+quote));
}
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},clearRect(){},measureText(t){return {width:t.length*16};}})})};
const before=(await import(new URL('escape-exterior.mjs',directory))).createEscapeExterior(THREE,1.5),after=createEscapeExterior(THREE,1.5);
const gameplayScopes={before:{jarman:jarmanProtected(THREE,before.model),leighton:leightonProtected(THREE,before.model)},after:{jarman:jarmanProtected(THREE,after.model),leighton:leightonProtected(THREE,after.model)}};
(await import(new URL('aerial-layouts.mjs',directory))).createAerialLayouts(THREE,before);createAerialLayouts(THREE,after);
function rows(root){
 root.updateMatrixWorld(true);const records=new Map(),instance=new THREE.Matrix4();
 root.traverse(o=>{
  if(!o.isMesh||o.userData.roofWallClosure)return;
  const hash=createHash('sha256');for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const record=(matrix,i)=>{
   const key=JSON.stringify([geometry,materials,matrix.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]);
   const values=records.get(key)??[];values.push({name:o.name,index:i,centre:new THREE.Vector3().setFromMatrixPosition(matrix).toArray(),pipe:o.userData.downpipeInstances?.includes(i)||/\bdownpipe\b/i.test(o.name),attachment:o.parent?.userData.downpipeAssembly||Object.values(o.userData.downpipeAttachments??{}).some(indices=>indices.includes(i))});records.set(key,values);
  };
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(o.matrixWorld,instance),i);}else record(o.matrixWorld,null);
 });return records;
}
const original=rows(before.model),current=rows(after.model),removed=[],added=[];
for(const [key,values] of original){const next=current.get(key)??[];removed.push(...values.slice(next.length));}
for(const [key,values] of current){const previous=original.get(key)??[];added.push(...values.slice(previous.length));}
const receipt={removed,added,...gameplayScopes};
await writeFile(new URL('scope-audit.json',import.meta.url),JSON.stringify(receipt,null,2));
console.log(JSON.stringify({removed:removed.length,added:added.length,unrelated:added.filter(r=>!r.pipe&&!r.attachment),before:receipt.before,after:receipt.after},null,2));
assert.equal(added.length,removed.length,'All original geometry primitives are retained');
assert(added.every(r=>r.pipe||r.attachment),'Only pipes and their attachments move');
