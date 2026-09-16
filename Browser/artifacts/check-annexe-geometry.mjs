import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {exteriorObstacles} from '../dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {annexe}=createEscapeExterior(THREE,16/9);
annexe.updateMatrixWorld(true);
const records=[],instance=new THREE.Matrix4(),world=new THREE.Matrix4();
const digest=value=>createHash('sha256').update(value).digest('hex');
annexe.traverse(o=>{
 if(!o.isMesh)return;
 const hash=createHash('sha256');
 for(const [key,attribute] of Object.entries(o.geometry.attributes).sort()){
  hash.update(key);hash.update(Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength));
 }
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
 const geometry=hash.digest('hex'),material=JSON.stringify([o.material.type,o.material.color?.getHex(),o.material.roughness,o.material.metalness,o.material.side]);
 const record=matrix=>records.push(JSON.stringify([geometry,material,matrix.elements.map(n=>Number(n.toFixed(8))),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(world.multiplyMatrices(o.matrixWorld,instance));}
 else record(o.matrixWorld);
});
const collisions=exteriorObstacles(THREE,annexe).map(o=>JSON.stringify(o)).sort();
const result={primitives:records.length,geometry:digest(records.sort().join('\n')),collisionCount:collisions.length,collisions:digest(collisions.join('\n'))};
console.log(JSON.stringify(result));
if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');
