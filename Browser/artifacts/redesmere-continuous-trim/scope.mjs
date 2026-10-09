import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const scope=new THREE.Box3(new THREE.Vector3(57.7,-.01,-46.5),new THREE.Vector3(100.3,13.5,22.5));
const yellow=new THREE.Box3(new THREE.Vector3(93.64,0,-17.86),new THREE.Vector3(99,10.2,-5.84));
const outside=[],protectedEntrance=[],roofs=[],m=new THREE.Matrix4(),world=new THREE.Matrix4(),bounds=new THREE.Box3();let local=0;
model.traverse(o=>{
 if(!o.isMesh)return;
 o.geometry.computeBoundingBox();const hash=createHash('sha256');
 for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer,o.geometry.index.array.byteOffset,o.geometry.index.array.byteLength));
 const geometry=hash.digest('hex'),material=[o.material.type,o.material.color?.getHex(),o.material.roughness,o.material.metalness,o.material.side];
 const record=matrix=>{
  bounds.copy(o.geometry.boundingBox).applyMatrix4(matrix);
  const row=JSON.stringify([o.name,geometry,material,matrix.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow]);
  if(scope.containsBox(bounds))local++;else outside.push(row);
  if(yellow.containsBox(bounds))protectedEntrance.push(row);
  if(o.material.userData.roofTilePixels&&!o.userData.roofWallClosure&&o.name!=='Redesmere chimney breast slate cap')roofs.push(row);
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);world.multiplyMatrices(o.matrixWorld,m);record(world);}else record(o.matrixWorld);
});
const summarize=rows=>({count:rows.length,hash:createHash('sha256').update(rows.sort().join('\n')).digest('hex')});
const result={outside:summarize(outside),entrance:summarize(protectedEntrance),existingRoofs:summarize(roofs),local};
writeFileSync(new URL(process.argv[2]+'-scope.json',import.meta.url),JSON.stringify(result,null,2));console.log(result);
