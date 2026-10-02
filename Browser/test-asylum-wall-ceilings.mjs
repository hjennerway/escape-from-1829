import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
const ray=new THREE.Raycaster();let walls=0,headers=0,samples=0;
for(const floor of floors){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const ceiling=scene.getObjectByName('Asylum ceiling').position.y,plaster=scene.getObjectByName('Asylum Plaster');
 assert.equal(ceiling,floor.id===2?2.9:3.8,'Room ceiling and stair headroom stay at the established height');
 const above=floors.filter(f=>f.elevation>floor.elevation).sort((a,b)=>a.elevation-b.elevation)[0];
 const heights=[ceiling-.001,ceiling+.01];
 if(above)heights.push(above.elevation-floor.elevation+.0005);
 function covered(x,z,dx,dz,depth,label){
  for(const y of heights)for(const side of [-1,1]){
   ray.set(new THREE.Vector3(x-dz*side*(depth/2+.12),y,z+dx*side*(depth/2+.12)),new THREE.Vector3(dz*side,0,-dx*side));ray.far=depth+.24;
   if(floor.walls.some(w=>segmentDistance(ray.ray.origin.x,ray.ray.origin.z,w.a,w.b)<.09)){
    // Continuous masonry removes internal caps at intersecting runs. Check
    // that the target remains solid through this height from above instead.
    ray.set(new THREE.Vector3(x,ceiling+5,z),new THREE.Vector3(0,-1,0));ray.far=6;
    assert(ray.intersectObject(plaster,false)[0]?.point.y>=y,`${label}: buried junction remains solid through the ceiling`);samples++;continue;
   }
   assert(ray.intersectObject(plaster,false).length,`${label}: masonry seals the ceiling/floor junction at ${x},${y},${z} from side ${side}`);samples++;
  }
 }
 // Sample the actual rendered surface on every run, including short returns,
 // both sides of partitions, window headers and the wall beside D13/S1.
 for(const wall of floor.walls){
  const [a,b]=[wall.a,wall.b],length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
  for(const t of [.1,.5,.9])covered(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,dx,dz,.18,`Floor ${floor.id} wall`);
  walls++;
 }
 for(const door of floor.doorways){
  for(const u of [-.7,0,.7])covered(door.x+door.dx*u,door.z+door.dz*u,door.dx,door.dz,door.depth,`Floor ${floor.id} doorway ${door.roomId??door.partitionId}`);
  if(above){
   // Lower headers must not become tiny raised thresholds on the upper floor.
   ray.set(new THREE.Vector3(door.x-door.dz*(door.depth/2+.12),above.elevation-floor.elevation+.002,door.z+door.dx*(door.depth/2+.12)),new THREE.Vector3(door.dz,0,-door.dx));ray.far=door.depth+.24;
   assert.equal(ray.intersectObject(plaster,false).length,0,'Lower masonry stays below the next walking surface');
  }
  headers++;
 }
}
console.log(`PASS: ${walls} wall runs and ${headers} doorway headers meet ceilings and adjoining floors, ${samples} rendered masonry samples from both sides; room ceiling heights retained.`);
