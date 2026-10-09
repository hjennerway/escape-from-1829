import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const area=new THREE.Box3(new THREE.Vector3(40.8,3.94,4.4),new THREE.Vector3(69.9,4.18,25.15));
const rows=[],roofs=[],matrix=new THREE.Matrix4(),world=new THREE.Matrix4(),bounds=new THREE.Box3();let local=0;
model.traverse(o=>{
 if(!o.isMesh)return;
 o.geometry.computeBoundingBox();const hash=createHash('sha256');
 for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer,o.geometry.index.array.byteOffset,o.geometry.index.array.byteLength));
 const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
 const record=m=>{
  bounds.copy(o.geometry.boundingBox).applyMatrix4(m);
  const row=JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow]);
  if(area.containsBox(bounds))local++;else rows.push(row);
  if(o.material.userData.roofTilePixels)roofs.push(row);
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);record(world);}else record(o.matrixWorld);
});
const summarize=rows=>({primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')});
const result={outside:summarize(rows),roofs:summarize(roofs),local};
writeFileSync(new URL(process.argv[2]+'-scope.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(result);
