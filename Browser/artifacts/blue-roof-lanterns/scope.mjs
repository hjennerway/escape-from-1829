import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {createHash} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior),{model}=exterior;
model.updateMatrixWorld(true);
const regions=layouts.towerBuildings.userData.dormers.map(d=>new THREE.Box3(new THREE.Vector3(d.x-3.5,8,d.z-2.8),new THREE.Vector3(d.x+3.5,17,d.z+2.8)));
const mortuary=exterior.garagesMortuary.userData.mortuary;
regions.push(new THREE.Box3(new THREE.Vector3(-1.9,4.3,2.2),new THREE.Vector3(1.9,6.2,4.8)).applyMatrix4(mortuary.matrixWorld));
const outside=[],hostRoofs=[],matrix=new THREE.Matrix4(),world=new THREE.Matrix4(),p=new THREE.Vector3();
const target=/blue dormer|Mortuary (?:blue ridge vent|ridge vent)/i;
model.traverse(o=>{
 if(!o.isMesh)return;
 if(target.test(o.name)||o.userData.blueRoofLantern)return;
 const hash=createHash('sha256');
 for(const [key,a]of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer,o.geometry.index.array.byteOffset,o.geometry.index.array.byteLength));
 const geometry=hash.digest('hex'),material=[o.material.type,o.material.color?.getHex(),o.material.roughness,o.material.metalness,o.material.side];
 const record=m=>{
  const row=JSON.stringify([o.name,geometry,material,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow]);
  if(o.isInstancedMesh&&regions.some(r=>r.containsPoint(p.setFromMatrixPosition(m))))return;
  outside.push(row);
  if(o.name.endsWith('slate roof')&&!o.userData.roofWallClosure)hostRoofs.push(row);
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);record(world);}else record(o.matrixWorld);
});
const summarize=rows=>({count:rows.length,hash:createHash('sha256').update(rows.sort().join('\n')).digest('hex')});
const result={outside:summarize(outside),hostRoofs:summarize(hostRoofs)};
writeFileSync(new URL(process.argv[2]+'-scope.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
if(process.argv[2].endsWith('after')){
 const prefix=process.argv[2].slice(0,-5);
 const before=JSON.parse(readFileSync(new URL(prefix+'before-scope.json',import.meta.url)));
 assert.deepEqual(result,before,'All non-lantern geometry and host slate roofs stay exact');
 writeFileSync(new URL(prefix+'preservation.json',import.meta.url),JSON.stringify({passed:true,before,after:result},null,2)+'\n');
}
console.log(result);
