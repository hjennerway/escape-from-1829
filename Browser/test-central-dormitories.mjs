import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildAsylumLayout,flatWalkable,moveAsylumActor,segmentDistance,insidePolygon} from './dist/asylum-layout.mjs';
import {furnishAsylum,furnitureCorners} from './dist/asylum-furniture.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
assert.deepEqual(plan,JSON.parse(await readFile(new URL('../Research/1829-interior-proposal/plan-data.json',import.meta.url))));
const floors=furnishAsylum(buildAsylumLayout(plan).floors),floor=floors[1],origin={x:0,z:17.5,floor:0,y:0};
const central=room=>/^R(6|7|8|9|10|11)$/.test(room.id);
assert.deepEqual(floor.rooms.filter(central).map(r=>r.id),['R6','R8','R10'],'Six first-floor central rooms become three');
assert.deepEqual(floors[0].rooms.filter(central).map(r=>r.id),['R6','R7','R8','R9','R10','R11'],'Ground-floor uses retain their separate rooms');
for(const z of [-31.5,-17,-1]){
 assert(floors[0].walls.some(w=>segmentDistance(-1,z,w.a,w.b)<.01),'Ground-floor divider is retained');
 assert(!floor.walls.some(w=>segmentDistance(-1,z,w.a,w.b)<.01),'Merged first-floor divider is removed');
 assert(flatWalkable(floor,-1.8,z,.34),'The former divider can be crossed');
}
let bedCount=0,walks=0;
for(const room of floor.rooms.filter(central)){
 assert.equal(room.purpose,'centralDormitory');
 assert.equal(room.x,room.label[0]/floor.cellSize);assert.equal(room.z,room.label[1]/floor.cellSize,'Map coordinates use the merged room centre');
 const beds=floor.furniture.filter(i=>i.roomId===room.id&&i.kind==='bed');
 assert.equal(beds.length,14);bedCount+=beds.length;
 assert(!floor.furniture.some(i=>i.roomId===room.id&&i.kind==='chair'),'Dormitory chairs are removed');
 assert.equal(floor.doorways.filter(d=>d.roomId===room.id).length,1);
 assert(floor.roomDoors.find(d=>d.roomId===room.id).openAngle<=105,'The open entrance leaf clears the retained wall bed');
 for(const row of [0,1]){
  const items=beds.filter(i=>i.bedRow===row).sort((a,b)=>a.z-b.z);
  assert.equal(items.length,row===0?8:6,'Eight window-side beds and six entrance-side beds remain');
  assert.deepEqual(items.map(i=>i.bedSlot),row===0?[0,1,2,3,4,5,6,7]:[0,3,4,5,6,7],'Only the two entrance-side slots are removed');
  assert(items.every(i=>!i.variable&&Math.abs(i.rotation-(row===0?Math.PI/2:-Math.PI/2))<1e-10),'Stable rows face the middle aisle');
  for(let i=1;i<items.length;i++)assert(items[i].z-items[i-1].z>items[i].width+.15,'Beds remain visibly separate');
 }
 for(const bed of beds){
  const c=Math.cos(bed.rotation),s=Math.sin(bed.rotation);
  const head=[-.5,0,.5].map(u=>[bed.x+c*u*bed.width-s*bed.depth/2,bed.z-s*u*bed.width-c*bed.depth/2]);
  assert(floor.walls.some(w=>Math.abs((w.b[0]-w.a[0])*s+(w.b[1]-w.a[1])*c)<1e-7&&head.every(([x,z])=>Math.abs(segmentDistance(x,z,w.a,w.b)-.09)<1e-7)),`${room.id}: full headboard meets the visible wall face`);
  const target={x:bed.x+Math.sin(bed.rotation)*(bed.depth/2+.65),z:bed.z+Math.cos(bed.rotation)*(bed.depth/2+.65),floor:1,y:floor.elevation};
  assert(flatWalkable(floor,target.x,target.z,.34),`${room.id}: usable access at every bed foot`);
  const route=routeBetweenFloors(floors,origin,target);assert(route.length,`${room.id}: every bed has a navigation route`);
  const actor={...origin};
  for(const p of route){
   let steps=0;while(Math.hypot(actor.x-p.x,actor.z-p.z)>.025&&steps++<100){const d=Math.hypot(actor.x-p.x,actor.z-p.z),step=Math.min(.06,d);moveAsylumActor(floors,actor,(p.x-actor.x)*step/d,(p.z-actor.z)*step/d);}
   assert(steps<100,'A player/pursuer physically follows the furnished route');
  }
  assert.equal(actor.floor,1);walks++;
 }
 for(const row of room.bedRows){
  const [a,b]=row.wall,length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
  let nx=-dz,nz=dx;
  if(!insidePolygon((a[0]+b[0])/2+nx*.2,(a[1]+b[1])/2+nz*.2,room.points)){nx=-nx;nz=-nz;}
  for(const [index,p] of row.wall.entries()){
   const end=Array.isArray(row.endClearance)?row.endClearance[index]:row.endClearance;
   const along=Math.max(.45,end/2),x=p[0]+dx*(index===0?1:-1)*along,z=p[1]+dz*(index===0?1:-1)*along;
   for(let reach=.45;reach<=beds[0].depth+row.clearance+.35;reach+=.10)assert(flatWalkable(floor,x+nx*reach,z+nz*reach,.34),`${room.id}: clear turn around each row end at ${x+nx*reach},${z+nz*reach}`);
  }
 }
 assert(floor.furniture.some(i=>i.roomId===room.id&&i.kind==='cupboard'),'Wardrobe storage is retained');
 for(const item of floor.furniture.filter(i=>i.roomId===room.id))assert(furnitureCorners(item).every(([x,z])=>insidePolygon(x,z,room.points)),'Furniture remains in its enlarged room');
}
assert.equal(bedCount,42);
assert(!floor.roomDoors.some(d=>['R7','R9','R11'].includes(d.roomId)),'Removed small-room doors do not remain in the merged spaces');
console.log(`PASS: three first-floor central dormitories, ${bedCount} wall-fitted beds, six removed entrance-side slots, no chairs, clear open leaves, retained ground floor, storage, end aisles and ${walks} physically walked bed-access routes.`);
