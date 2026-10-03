import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
// Recreate the original corner placement independently of automatic fitting.
if(process.argv.includes('--baseline'))plan.exits.find(e=>e.id==='D10').wallOpening.offset=0;
const floors=buildAsylumLayout(plan).floors,floor=floors[0],scene=new THREE.Scene();
buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster();let samples=0;
function across(x,z,dx,dz,y,kind){
 for(const side of [-1,1]){
  ray.set(new THREE.Vector3(x-dz*side*.4,y,z+dx*side*.4),new THREE.Vector3(dz*side,0,-dx*side));ray.far=.6;
  const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
  assert(hit&&Math.abs(hit.distance-.31)<1e-5,`D10 ${kind} closes its wall at ${x},${y},${z}, side ${side}`);samples++;
 }
}
// Fixed probes span the former full-height cut, including the angled left
// return. These derive from the reviewed envelope, not generated headers.
for(let i=0;i<=20;i++){
 const x=30.9+i*.08;
 for(const y of [2.61,2.96,3.79,4.19])across(x,15.5,1,0,y,'Plaster');
}
for(let i=1;i<=5;i++){
 const x=30.8-i*.07,z=15.5+i*.07;
 for(const y of [2.61,3.2,3.79])across(x,z,Math.SQRT1_2,-Math.SQRT1_2,y,'Plaster');
}
// The complete frame now centres at x=31.82 to clear the angled corner;
// inspect its restored narrow left pier and the new right jamb as well.
for(const [x,z,dx,dz] of [[30.85,15.5,1,0],[32.69,15.5,1,0],[30.59,15.71,Math.SQRT1_2,-Math.SQRT1_2]]){
 for(const [kind,y] of [['Brick',.55],['Plaster',1.65],['Skirting',.13]]){
  if(kind==='Skirting'){
   ray.set(new THREE.Vector3(x-dz*.4,y,z+dx*.4),new THREE.Vector3(dz,0,-dx));ray.far=.6;
   assert(ray.intersectObject(scene.getObjectByName('Asylum Skirting'),false).length,'Skirting meets both fitted jambs');
  }else across(x,z,dx,dz,y,kind);
 }
 assert(floor.walls.some(w=>segmentDistance(x,z,w.a,w.b)<1e-6),'Restored side masonry is in the shared collision/map walls');
}
for(const x of [31.1,31.54,32])for(const y of [.2,1.65,2.42]){
 ray.set(new THREE.Vector3(x,y,14.9),new THREE.Vector3(0,0,1));ray.far=1;
 assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Asylum Panel','The leaf remains visible and closes the frame up to its head');
}
const door=floor.exits.find(e=>e.id==='D10');
for(const reverse of [false,true]){
 const route=[[36.3,13.8],[31.54,13.8],[door.inside.x,door.inside.z]];if(reverse)route.reverse();
 const actor={x:route[0][0],z:route[0][1],floor:0,y:0};
 for(const [x,z] of route.slice(1)){moveAsylumActor(floors,actor,x-actor.x,z-actor.z);assert(Math.hypot(actor.x-x,actor.z-z)<1e-6,'D10 approach remains walkable in both directions');}
}
console.log(`PASS: D10 fitted wall/header, ${samples} masonry rays, angled return, skirting and collision, closed leaf and two approach walks.`);
