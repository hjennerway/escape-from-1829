import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {asylumDoorLabels} from './dist/asylum-door-labels.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),snapshot=JSON.stringify(plan);
const floors=buildAsylumLayout(plan).floors,counts=[38,33,11,10],numbers=[];
const expectedNumber=(floor,n)=>floor===0?`G${n}`:floor===1?String(100+n):floor===2?`B${n}`:String(200+n);
let faces=0;
for(const floor of floors){
 const labelled=asylumDoorLabels(floor),scene=new THREE.Scene();
 assert.equal(labelled.length,counts[floor.id]);
 assert.deepEqual(labelled.map(l=>l.number),Array.from({length:counts[floor.id]},(_,i)=>expectedNumber(floor.id,i+1)),'Every floor is consecutive, with no gaps or duplicate room numbers');
 assert.deepEqual(asylumDoorLabels({...floor,roomDoors:[...floor.roomDoors].reverse(),rooms:[...floor.rooms].reverse()}),labelled,'Room/door array order cannot change numbering (R2 sorts before R10)');
 numbers.push(...labelled.map(l=>l.number));
 buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const mesh=scene.getObjectByName('Asylum RoomDoorLabels');
 assert.equal(mesh.userData.labels.length,labelled.length*2);
 for(const entry of labelled){
  const plaques=mesh.userData.labels.filter(l=>l.roomId===entry.door.roomId);
  assert.deepEqual(plaques.map(l=>l.face),[-1,1]);
  assert(plaques.every(l=>l.number===entry.number&&l.text===entry.lines.join(' ')),'The number and treatment/name are on each actual rendered plaque');
  for(const plaque of plaques){
   const nx=Math.sin(entry.door.rotation)*plaque.face,nz=Math.cos(entry.door.rotation)*plaque.face;
   const ray=new THREE.Raycaster(new THREE.Vector3(plaque.x+nx*.1,plaque.y,plaque.z+nz*.1),new THREE.Vector3(-nx,0,-nz),0,.14);
   assert.equal(ray.intersectObject(mesh)[0]?.object,mesh,'Both text planes follow the parked door leaf and face outwards');faces++;
  }
 }
 const uv=mesh.geometry.attributes.uv;
 for(let i=0;i<uv.count;i++)assert(uv.getX(i)>0&&uv.getX(i)<1&&uv.getY(i)>0&&uv.getY(i)<1,'Atlas tiles remain padded inside the texture');
}
assert.equal(new Set(numbers).size,92,'Numbers are unique across all floors');
assert.equal(JSON.stringify(plan),snapshot,'Player numbers do not rewrite shared modelling IDs');
const treatments=asylumDoorLabels(floors[0]).filter(l=>l.lines.length>1);
assert.deepEqual(treatments.map(l=>[l.door.roomId,l.number,l.lines[1]]),[
 ['R1','G1','Hydrotherapy'],['R6','G6','Surgery'],['R7','G7','Bloodletting'],['R8','G8','ECT'],['R12','G12','Cold-water shower'],['R29','G28','Electrical therapy']
],'All six actual treatment rooms name the treatment alongside their number');
assert.deepEqual(asylumDoorLabels(floors[3]).slice(0,5).map(l=>l.lines[1]),['Records office','Staff office','Staff sitting room','Archive & stores','Linen store'],'Existing upstairs names are retained');
console.log(`PASS: 92 unique consecutive floor-specific numbers, six treatment names, retained upstairs names, ${faces} actual two-sided plaques, natural numeric sorting and unchanged plan inputs.`);
