import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const rows=[],instance=new THREE.Matrix4(),centre=new THREE.Vector3();
model.traverse(o=>{
  if(!o.isMesh)return;
  o.geometry.computeBoundingBox();const local=o.geometry.boundingBox.getCenter(new THREE.Vector3());
  const hash=createHash('sha256');
  for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
  if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  function record(matrix){
    centre.copy(local).applyMatrix4(matrix);
    if(!(centre.x>=-25||centre.z<=0||((centre.x>=-41&&centre.z>=16)||(centre.x>=-46&&centre.z>=27))))return;
    rows.push(JSON.stringify([o.name,geometry,materials,matrix.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,o.userData.collisionFootprint]));
  }
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(o.matrixWorld,instance));}else record(o.matrixWorld);
});
const result={primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')};
const baseline=new URL('west-front-e-width-protected-before.json',import.meta.url);
if(process.argv.includes('--record'))await writeFile(baseline,JSON.stringify(result,null,2)+'\n');
else assert.deepEqual(result,JSON.parse(await readFile(baseline,'utf8')),'East side, rear ranges, Reception and forward wing stay exactly unchanged');
console.log('PASS: protected geometry '+JSON.stringify(result));
