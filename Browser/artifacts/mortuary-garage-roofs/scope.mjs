import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createHash} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model,garagesMortuary}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const outside=[],roofs=[],details=[],matrix=new THREE.Matrix4(),world=new THREE.Matrix4();
model.traverse(o=>{
 if(!o.isMesh)return;
 const hash=createHash('sha256');
 for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer,o.geometry.index.array.byteOffset,o.geometry.index.array.byteLength));
 const geometry=hash.digest('hex'),material=[o.material.type,o.material.color?.getHex(),o.material.roughness,o.material.metalness,o.material.side];
 let local=false;for(let p=o;p;p=p.parent)if(p===garagesMortuary)local=true;
 const record=m=>{
  const row=JSON.stringify([o.name,geometry,material,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow]);
  if(!local)outside.push(row);
  if(o.material.userData.roofTilePixels&&!o.userData.roofWallClosure)roofs.push(row);
  if(local&&!o.userData.roofWallClosure&&!o.material.userData.roofTilePixels&&!/gables/.test(o.name))details.push(row);
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);record(world);}else record(o.matrixWorld);
});
const summarize=rows=>({count:rows.length,hash:createHash('sha256').update(rows.sort().join('\n')).digest('hex')});
const result={outside:summarize(outside),existingRoofs:summarize(roofs),wallsAndDetails:summarize(details)};
writeFileSync(new URL(process.argv[2]+'-scope.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
if(process.argv[2]==='after'){
 const before=JSON.parse(readFileSync(new URL('before-scope.json',import.meta.url)));
 assert.deepEqual(result,before,'Outside estate, original slate roofs, walls, doors, windows, ridges and other details remain exact');
 writeFileSync(new URL('preservation.json',import.meta.url),JSON.stringify({passed:true,before,after:result},null,2)+'\n');
}
console.log(result);
