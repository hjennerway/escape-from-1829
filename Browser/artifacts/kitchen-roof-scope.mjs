import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createMainAdminBuilding} from '../dist/main-admin-building.mjs';

// These two sources were clean at task start. Compare their saved Git versions
// with the repair, keeping every other module at its current workspace version.
const dist=new URL('../dist/',import.meta.url);
const baselineRevision='593b8f67eb5e28f9caecc447b6dae4c7370b2cad';
const original=file=>execFileSync('git',['show',baselineRevision+':Browser/dist/'+file],{encoding:'utf8',windowsHide:true});
const moduleURL=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const kitchenURL=moduleURL(original('main-kitchen.mjs'));
const beforeSource=original('main-admin-building.mjs').replace(/from '(\.\/[^']+)'/g,(_,path)=>
 `from '${path==='./main-kitchen.mjs'?kitchenURL:new URL(path,dist).href}'`);
const {createMainAdminBuilding:beforeCreate}=await import(moduleURL(beforeSource));
function capture(create){
 const material=color=>new THREE.MeshStandardMaterial({color});
 const groups=create(THREE,{brick:material(0x884433),roof:material(0x334444),worldUV:g=>g,material});
 const rows=[];
 for(const [part,group] of Object.entries(groups)){
  group.updateMatrixWorld(true);
  group.traverse(o=>{
   if(!o.isMesh)return;
   const hash=createHash('sha256');
   hash.update(JSON.stringify({name:o.name,matrix:o.matrixWorld.elements,color:o.material.color.getHex(),count:o.count}));
   for(const [key,attribute] of Object.entries(o.geometry.attributes)){
    hash.update(key);hash.update(Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength));
   }
   for(const attribute of [o.geometry.index,o.instanceMatrix])if(attribute)hash.update(Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength));
   rows.push({part,name:o.name,hash:hash.digest('hex')});
  });
 }
 return rows;
}
const before=capture(beforeCreate),after=capture(createMainAdminBuilding);
assert.equal(before.length,after.length,'No model objects are added or removed');
const changed=[];
for(let i=0;i<before.length;i++){
 assert.equal(before[i].name,after[i].name);
 if(before[i].hash!==after[i].hash)changed.push(after[i].name);
}
assert.deepEqual(changed.sort(),['Connecting corridor ridge','Main kitchen fascia','Main kitchen fascia','Main kitchen side gutter','Main kitchen side gutter']);
const report={baselineRevision,meshes:before.length,changed,unchanged:before.length-changed.length};
writeFileSync(new URL('kitchen-roof-scope.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('PASS: only the four kitchen trim pieces and single cross-gallery ridge cap changed.',report);
