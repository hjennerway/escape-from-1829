import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const outside=[],roofs=[],details=[],m=new THREE.Matrix4(),w=new THREE.Matrix4();
e.model.traverse(o=>{
 if(!o.isMesh)return;let local=false;for(let p=o;p;p=p.parent)if(p===e.towerBuildings)local=true;
 const hash=createHash('sha256');
 for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer,o.geometry.index.array.byteOffset,o.geometry.index.array.byteLength));
 const geometry=hash.digest('hex'),material=[o.material.type,o.material.color?.getHex(),o.material.roughness,o.material.metalness,o.material.side];
 const row=matrix=>JSON.stringify([o.name,geometry,material,matrix.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow]);
 if(!local){outside.push(row(o.matrixWorld)+(o.isInstancedMesh?createHash('sha256').update(Buffer.from(o.instanceMatrix.array.buffer)).digest('hex'):''));return;}
 if(o.material.userData.roofTilePixels&&!o.userData.roofWallClosure)roofs.push(row(o.matrixWorld));
 if(o.userData.roofWallClosure||/brick gable|gable base course/.test(o.name))return;
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){
  o.getMatrixAt(i,m);w.multiplyMatrices(o.matrixWorld,m);const p=new THREE.Vector3().setFromMatrixPosition(w);
  if(p.x>228.2&&p.x<229&&p.y>9.4&&p.y<12&&p.z>-4.6&&p.z<-2.7)continue;
  details.push(row(w));
 }else details.push(row(o.matrixWorld));
});
const summary=rows=>({count:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')});
const result={outside:summary(outside),slate:summary(roofs),wallsAndOtherDetails:summary(details)},stage=process.argv[2];
writeFileSync(new URL(stage+'-scope.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
if(stage==='after'){
 const before=JSON.parse(readFileSync(new URL('before-scope.json',import.meta.url)));
 assert.deepEqual(result,before,'Keep the outside estate, original slate, walls, doors and all details except the shifted high sash exact');
 writeFileSync(new URL('preservation.json',import.meta.url),JSON.stringify({passed:true,before,after:result},null,2)+'\n');
}
console.log(result);
