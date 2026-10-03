import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,flatWalkable} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const baseline=structuredClone(plan);
delete baseline.rooms.find(r=>r.id==='R27').variants[1];
const floors=buildAsylumLayout(process.argv.includes('--baseline')?baseline:plan).floors;
const floor=floors[1],scene=new THREE.Scene();
buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster();let samples=0;

// Fixed points follow the owner's marked first-floor R27 entrance view.
// The old north-wall tongue is removed; the purple line closes an L-shaped
// return from its retained green door to the existing western wall end.
for(const x of [46.8,47.4,48]){
 assert(flatWalkable(floor,x,7,.34),'The former projecting wall is walkable');
 for(const [kind,y] of [['Brick',.55],['Plaster',1.65],['Skirting',.13]]){
  ray.set(new THREE.Vector3(x,y,6.6),new THREE.Vector3(0,0,1));ray.far=.65;
  assert.equal(ray.intersectObject(scene.getObjectByName('Asylum '+kind),false).length,0,'No masonry or skirting remains along the removed section');
 }
}
const a=[45.1,8.535087719298245],b=[48.62,8.535087719298245],c=[48.62,7];
for(const [from,to] of [[a,b],[b,c]]){
 const length=Math.hypot(to[0]-from[0],to[1]-from[1]),dx=(to[0]-from[0])/length,dz=(to[1]-from[1])/length;
 for(let i=1;i<25;i++){
  const t=.15+.7*i/25,x=from[0]+(to[0]-from[0])*t,z=from[1]+(to[1]-from[1])*t;
  assert(!flatWalkable(floor,x,z,.01),'Both new wall runs have solid walking collision');
  for(const side of [-1,1])for(const [kind,y,depth] of [['Brick',.55,.09],['Plaster',1.65,.09],['Plaster',3.79,.09],['Skirting',.13,.1075]]){
   ray.set(new THREE.Vector3(x-dz*side*.35,y,z+dx*side*.35),new THREE.Vector3(dz*side,0,-dx*side));ray.far=.5;
   const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
   assert(hit&&Math.abs(hit.distance-(.35-depth))<1e-5,`${kind} closes both faces of the marked return, sample ${i}, side ${side}`);samples++;
  }
  if(i%4===0)for(const side of [-1,1]){
   const actor={x:x-dz*side*.65,z:z+dx*side*.65,floor:1,y:floor.elevation};
   moveAsylumActor(floors,actor,dz*side*1.3,-dx*side*1.3);
   assert((actor.x-x)*(-dz*side)+(actor.z-z)*(dx*side)>0,'Actors cannot cross either new wall run');
  }
 }
}
for(const [x,z] of [a,b,c])assert(floor.walls.filter(w=>[w.a,w.b].some(p=>Math.hypot(p[0]-x,p[1]-z)<1e-6)).length>=2,'The new enclosure joins the doorway pier and existing wall');
assert(floor.doorways.some(d=>d.roomId==='R27'&&d.x===49.75&&d.z===7),'The green room doorway remains in place');
for(const route of [
 [[43.8,8.2],[45.7,7.55],[45.7,5.7],[49.75,5.7],[49.75,9],[49.75,13.25]],
 [[43.8,8.2],[45.7,7.55],[45.7,5.7],[55.8,5.7]],
])for(const reverse of [false,true]){
 const points=reverse?[...route].reverse():route,actor={x:points[0][0],z:points[0][1],floor:1,y:floor.elevation};
 for(const [x,z] of points.slice(1)){
  moveAsylumActor(floors,actor,x-actor.x,z-actor.z);
  assert(Math.hypot(actor.x-x,actor.z-z)<1e-6,`The room doorway and cross corridor remain walkable in both directions: ${actor.x},${actor.z} → ${x},${z}, reverse ${reverse}`);
 }
}
const originalFloors=buildAsylumLayout(baseline).floors;
for(const id of [0,2,3]){
 assert.deepEqual(floors[id].walls,originalFloors[id].walls,'This repair changes only the first-floor walls');
 assert.deepEqual(floors[id].cells,originalFloors[id].cells,'Other floors retain their walking/navigation maps');
}
console.log(`PASS: ${samples} first-floor masonry/skirting rays, removed projecting section, joined L-shaped enclosure, solid collision, room/corridor walks and preserved other floors.`);
