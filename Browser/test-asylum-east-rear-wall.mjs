import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,moveAsylumActor,segmentDistance,stairRoute} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
if(process.argv.includes('--baseline'))delete plan.rooms.find(r=>r.id==='R16').variants[0].solidEdges;
const floors=buildAsylumLayout(plan).floors,floor=floors[0],scene=new THREE.Scene();
buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster();let samples=0;
// Fixed survey of the owner's purple line, from the existing room wall end
// to the wall beside R16's framed entrance, across the front of stair S4.
for(let i=1;i<25;i++){
 const x=29.110869565217392+(34.6-29.110869565217392)*i/25,z=-32.4;
 assert(!flatWalkable(floor,x,z,.01),'The marked wall is solid in collision and map data');
 for(const side of [-1,1])for(const [kind,y,depth] of [['Brick',.55,.09],['Plaster',1.65,.09],['Plaster',4.19,.09],['Skirting',.13,.1075]]){
  ray.set(new THREE.Vector3(x,y,z+side*.4),new THREE.Vector3(0,0,-side));ray.far=.6;
  const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
  assert(hit&&Math.abs(hit.distance-(.4-depth))<1e-5,`${kind} continuously joins the marked walls on face ${side}, sample ${i}`);samples++;
 }
}
assert(floor.walls.filter(w=>segmentDistance(34.6,-32.4,w.a,w.b)<1e-6).length>=2,'The new wall meets the doorway side wall');
assert(flatWalkable(floors[1],32,-32.4,.01),'The closure is limited to the ground floor');
for(const side of [-1,1]){
 const actor={x:32,z:-32.4+side*.7,y:0,floor:0};
 moveAsylumActor(floors,actor,0,-side*1.4);
 assert((actor.z+32.4)*side>.42,'Walking cannot pass through either face of the new wall');
}
for(const route of [
 [[35.8,-34],[33,-34],[30,-34]], // Existing framed entrance into R16.
 [[35.8,-31.7],[32,-31.7],[29.95,-31.7]], // Stair entry in front of the new wall.
 [[35.8,-25.8],[28,-25.8],[25.55,-25.8]], // Existing fire-exit lobby.
 [[29.8,-33],[33.8,-33]], // Room side of the new wall.
])for(const reverse of [false,true]){
 const points=reverse?[...route].reverse():route,actor={x:points[0][0],z:points[0][1],y:0,floor:0};
 for(const [x,z] of points.slice(1)){moveAsylumActor(floors,actor,x-actor.x,z-actor.z);assert(Math.hypot(actor.x-x,actor.z-z)<1e-6,'Room, stair and fire-exit approaches remain walkable in both directions');}
}
// Walk the complete stair and independently specified exits, including the
// sideways ground-floor turn needed to leave the flight beside the new wall.
const route=stairRoute(plan.stairs.find(s=>s.id==='S4'),0,4.2);
for(const reverse of [false,true]){
 const points=reverse?[...route].reverse():route,first=points[0],actor={x:first[0],z:first[2]-.1,y:first[1],floor:reverse?1:0};
 const departure=reverse?[30.45,0,-31.75]:[33.85,4.2,-32.55];
 for(const [x,,z] of [...points,departure]){
  for(let n=0;n<1000&&Math.hypot(actor.x-x,actor.z-z)>.025;n++){
   const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.055,d);moveAsylumActor(floors,actor,dx/d*step,dz/d*step);
  }
  assert(Math.hypot(actor.x-x,actor.z-z)<.04,'The rear stair is walked completely, including the landing turn');
 }
 assert.equal(actor.floor,reverse?0:1);assert.equal(actor.stair,null,'The landing turn leaves the flight');
}
console.log(`PASS: ${samples} rear ground-floor masonry/skirting rays, joined doorway wall, collision, room/stair/fire-exit approaches, full stair walks and retained upper-floor opening.`);
