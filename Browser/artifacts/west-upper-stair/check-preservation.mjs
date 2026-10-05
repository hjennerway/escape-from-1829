import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import * as before from './before-stairs.mjs';
import * as after from '../../dist/asylum-stairs.mjs';
const former=JSON.parse(await readFile(new URL('before-plan.json',import.meta.url))),current=JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url)));
let connections=0,flights=0;
for(const oldStair of former.stairs){
 const stair=current.stairs.find(s=>s.id===oldStair.id);
 assert.deepEqual(stair.points,oldStair.points);assert.deepEqual(stair.connections,oldStair.connections);
 for(const [lower,upper] of stair.connections){
  const lo=current.floors[lower].elevation,hi=current.floors[upper].elevation,changed=stair.id==='S5'&&lower===1&&upper===3;
  if(!changed){assert.deepEqual(after.stairRoute(stair,lo,hi,lower,upper),before.stairRoute(oldStair,lo,hi));connections++;}
  else assert.deepEqual(after.stairRoute(stair,lo,hi,lower,upper).slice(0,3),before.stairRoute(oldStair,lo,hi).slice(0,3));
  const s=before.stairShape(oldStair),mid=(lo+hi)/2,steps=Math.ceil((mid-lo)/.18);
  const formerFlights=[[[s.left,lo,s.front],[s.left,mid,s.back]],[[s.right,mid,s.back],[s.right,hi,s.front]]];
  const newFlights=after.stairFlights(after.stairConnection(stair,lower,upper),lo,hi);
  for(let i=0;i<(changed?1:2);i++){
   const [a,b]=formerFlights[i],[c,d]=newFlights[i];
   const oldGeometry=before.stairFlightGeometry(THREE,a[0],before.STAIR_WIDTH,a[2],b[2],a[1],b[1],steps);
   const newGeometry=after.stairFlightGeometry(THREE,c[0],after.STAIR_WIDTH,c[2],d[2],c[1],d[1],steps,d[0]);
   assert.deepEqual(newGeometry.attributes.position.array,oldGeometry.attributes.position.array,'Unchanged flight keeps its exact geometry');
   oldGeometry.dispose();newGeometry.dispose();flights++;
  }
 }
}
await writeFile(new URL('preservation.json',import.meta.url),JSON.stringify({unchangedConnections:connections,unchangedFlights:flights,shaftFootprintsPreserved:true},null,2)+'\n');
console.log(`PASS: ${connections} unchanged walking connections, ${flights} identical flight vertex buffers, all original shafts and storey connections retained.`);
