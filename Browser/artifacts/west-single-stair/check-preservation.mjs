import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import * as former from './before-stairs.mjs';
import * as current from '../../dist/asylum-stairs.mjs';
import {buildAsylumLayout} from '../../dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from '../../dist/asylum-architecture.mjs';
const before=JSON.parse(await readFile(new URL('before-plan.json',import.meta.url))),plan=JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url)));
assert.deepEqual(plan,JSON.parse(await readFile(new URL('../../../Research/1829-interior-proposal/plan-data.json',import.meta.url))));
for(const key of Object.keys(plan))if(!['rooms','corridors','stairs'].includes(key))assert.deepEqual(plan[key],before[key],key+' is preserved');
for(const room of plan.rooms){const old=before.rooms.find(r=>r.id===room.id);if(room.id==='R50'){assert.deepEqual({...room,points:old.points},old);}else assert.deepEqual(room,old);}
for(const corridor of plan.corridors)if(corridor.id!=='C26')assert.deepEqual(corridor,before.corridors.find(c=>c.id===corridor.id));
let connections=0,flights=0;
for(const stair of plan.stairs){
 const old=before.stairs.find(s=>s.id===stair.id);assert.deepEqual(stair.points,old.points);assert.deepEqual(stair.connections,old.connections);
 if(stair.id==='S5')assert.deepEqual({...stair,description:old.description,connectionVariants:old.connectionVariants},old);else assert.deepEqual(stair,old);
 for(const [a,b] of stair.connections){
  const lo=plan.floors[a].elevation,hi=plan.floors[b].elevation;
  if(stair.id==='S5'&&a===1&&b===3){assert.equal(current.stairFlights(current.stairConnection(stair,a,b),lo,hi).length,1);continue;}
  assert.deepEqual(current.stairRoute(stair,lo,hi,a,b),former.stairRoute(old,lo,hi,a,b));connections++;
  const was=former.stairFlights(former.stairConnection(old,a,b),lo,hi),now=current.stairFlights(current.stairConnection(stair,a,b),lo,hi);assert.deepEqual(now,was);
  for(let i=0;i<was.length;i++){
   const [p,q]=was[i],steps=Math.ceil((q[1]-p[1])/.18);
   const oldGeometry=former.stairFlightGeometry(THREE,p[0],former.STAIR_WIDTH,p[2],q[2],p[1],q[1],steps,q[0]),newGeometry=current.stairFlightGeometry(THREE,p[0],current.STAIR_WIDTH,p[2],q[2],p[1],q[1],steps,q[0]);
   assert.deepEqual(newGeometry.attributes.position.array,oldGeometry.attributes.position.array);flights++;oldGeometry.dispose();newGeometry.dispose();
  }
 }
}
const floor=buildAsylumLayout(plan).floors[1],scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.position.y=floor.elevation;scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),stone=[];scene.traverse(m=>{if(m.name==='Asylum Stone')stone.push(m);});let cleared=0;
for(const x of [-33.35,-32.25,-31.15,-29.5])for(const z of [10,11.5,12.4,13.2]){
 ray.set(new THREE.Vector3(x,7.95,z),new THREE.Vector3(0,-1,0));ray.far=3.5;
 assert.equal(ray.intersectObjects(stone,false).length,0,'No concrete from the former upper flights or return landing remains above the lower well');cleared++;
}
const receipt={unchangedConnections:connections,identicalFlightBuffers:flights,clearedFormerFlightAndLandingProbes:cleared,sharedPlanParity:true,otherRoomsCorridorsFloorsWindowsAndExitsPreserved:true};
await writeFile(new URL('preservation.json',import.meta.url),JSON.stringify(receipt,null,2)+'\n');console.log('PASS: '+JSON.stringify(receipt));
