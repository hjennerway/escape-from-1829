import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createMainAdminBuilding} from '../dist/main-admin-building.mjs';
const source=readFileSync(new URL('./admin-front-corridor-baseline/main-admin-building.mjs',import.meta.url),'utf8')
 .replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL('../dist/'+path.slice(2),import.meta.url).href}'`);
const beforeFactory=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).createMainAdminBuilding;
const material=color=>new THREE.MeshStandardMaterial({color});
const materials={brick:material(0x884433),roof:material(0x334455),worldUV:g=>g,material};
const before=beforeFactory(THREE,materials),after=createMainAdminBuilding(THREE,materials);
function signature(o){
 const s={name:o.name,position:o.position.toArray(),rotation:o.quaternion.toArray(),scale:o.scale.toArray()};
 if(o.geometry){
  s.attributes=Object.fromEntries(Object.entries(o.geometry.attributes).map(([name,a])=>[name,Array.from(a.array)]));
  s.index=o.geometry.index?Array.from(o.geometry.index.array):null;
 }
 if(o.isInstancedMesh)s.instances=Array.from(o.instanceMatrix.array);
 s.children=o.children.map(signature);return s;
}
const preserved=[];
for(const o of before.corridor.children){
 // The cross-gallery's south window at the new attachment is intentionally
 // omitted. No corridor wall, roof, position or original branch may change.
 if(/^Corridor (south|north) windows$/.test(o.name))continue;
 const current=after.corridor.children.find(b=>b.name===o.name);assert(current,o.name);
 assert.deepEqual(signature(current),signature(o),o.name+' retains every original vertex and transform');preserved.push(o.name);
}
assert.deepEqual(after.corridor.userData.sections,before.corridor.userData.sections,'Original cross-gallery sections stay fixed');
for(const o of before.building.children){
 if(o.isInstancedMesh||o.name.startsWith('Low west side rooms')||o.name.startsWith('Recessed low west connection'))continue;
 const sameName=before.building.children.filter(c=>c.name===o.name),i=sameName.indexOf(o);
 const current=after.building.children.filter(c=>c.name===o.name)[i];
 assert.deepEqual(signature(current),signature(o),'Unrelated Main/admin geometry stays fixed: '+o.name);
}
const retained=o=>!['low west frontage','low west stepped return','recessed low connection'].includes(o.face);
const normalizedOpenings=group=>JSON.parse(JSON.stringify(group.userData.openings.filter(retained),(_,v)=>typeof v==='number'?Number(v.toFixed(10)):v));
assert.deepEqual(normalizedOpenings(after.building),normalizedOpenings(before.building),'Other Main/admin openings stay fixed within floating-point precision');
writeFileSync(new URL('./admin-front-corridor-verification.json',import.meta.url),JSON.stringify({preservedCorridorObjects:preserved,oldSectionsUnchanged:true,unrelatedAdminGeometryUnchanged:true},null,2));
console.log('PASS: '+preserved.length+' original corridor objects retain exact geometry and transforms; other Main/admin masses and openings are unchanged.');
