import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {createWaterTower} from '../../dist/water-tower.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const text=(await readFile(new URL('before.mjs.txt',import.meta.url),'utf8')).replace("'./tower-roof-profiles.mjs'",JSON.stringify(new URL('../../dist/tower-roof-profiles.mjs',import.meta.url).href));
const previous=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
const material=new THREE.MeshStandardMaterial(),records=[];
for(const [label,build] of [['previous',previous.createWaterTower],['current',createWaterTower]]){
  const tower=build(THREE,{brick:material,roof:material,dark:material,worldUV:g=>g});tower.updateMatrixWorld(true);
  const probe=new THREE.Raycaster(new THREE.Vector3(153.5,.15,-59.5),new THREE.Vector3(-1,0,0),0,4).intersectObject(tower,true)[0];
  records.push({label,object:probe.object.name,point:probe.point.toArray(),normal:probe.face.normal.toArray()});
}
assert.deepEqual(records[0].point,records[1].point);assert.deepEqual(records[0].normal,records[1].normal);
assert.equal(records[0].object,records[1].object);
await writeFile(new URL('workshop-surface-control.json',import.meta.url),JSON.stringify(records,null,2)+'\n');
console.log('PASS: the tower plinth surface at the reported workshop-contact failure is identical in the previous and corrected tower.');
