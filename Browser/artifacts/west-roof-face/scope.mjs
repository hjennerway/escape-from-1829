import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createHash} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,16/9);model.updateMatrixWorld(true);
const scope=new THREE.Box3(new THREE.Vector3(-41.5,-1,6.5),new THREE.Vector3(-28,17,30.5));
const rows=[],local=new THREE.Matrix4(),world=new THREE.Matrix4(),bounds=new THREE.Box3();let intersecting=0;
model.traverse(o=>{
 if(!o.isMesh)return;
 o.geometry.computeBoundingBox();const hash=createHash('sha256');
 for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer,o.geometry.index.array.byteOffset,o.geometry.index.array.byteLength));
 const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
 const record=m=>{
  bounds.copy(o.geometry.boundingBox).applyMatrix4(m);
  if(scope.intersectsBox(bounds)){intersecting++;return;}
  rows.push(JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,o.userData.collisionFootprint,o.userData.collisionFootprints,!!o.userData.orientedCollision]));
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,local);world.multiplyMatrices(o.matrixWorld,local);record(world);}else record(o.matrixWorld);
});
const result={nonintersecting:{primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')},intersecting,scope:{min:scope.min.toArray(),max:scope.max.toArray()}};
const stage=process.argv[2];writeFileSync(new URL(stage+'-scope.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
if(stage==='after')assert.deepEqual(result.nonintersecting,JSON.parse(readFileSync(new URL('before-scope.json',import.meta.url),'utf8')).nonintersecting,'Every primitive whose bounds miss the correction area stays exact');
console.log(JSON.stringify(result));
