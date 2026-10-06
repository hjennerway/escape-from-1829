import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildAsylumLayout,flatWalkable,moveAsylumActor,insidePolygon} from './dist/asylum-layout.mjs';
import {furnishAsylum,furnitureCorners} from './dist/asylum-furniture.mjs';
import {asylumRoomNumbers} from './dist/asylum-room-numbers.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';
import {createNotebook} from './dist/notebook.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
assert.deepEqual(plan,JSON.parse(await readFile(new URL('../Research/1829-interior-proposal/plan-data.json',import.meta.url))));
const original={
 R20:[[-48.765,18.41875,-Math.PI/2],[-54.525,17.735,-Math.PI],[-48.765,16.25625,-Math.PI/2],[-48.765,14.09375,-Math.PI/2]],
 R22:[[-43.625,17.735,-Math.PI],[-39.765,16.449819168173597,-Math.PI/2],[-39.765,14.416365280289334,-Math.PI/2],[-45.235,14.09375,Math.PI/2]]
};
const origin={x:0,z:17.5,floor:0,y:0};let walks=0;
function walk(floors,target){
 const floor=floors[target.floor];assert(flatWalkable(floor,target.x,target.z,.34),'Furniture has usable standing space');
 const route=routeBetweenFloors(floors,origin,target);assert(route.length,`Seed ${floor.furnitureSeed}: standing space is connected to the entrance: `+JSON.stringify(target));
 const actor={...origin};
 for(const p of route){
  let steps=0;while(Math.hypot(actor.x-p.x,actor.z-p.z)>.025&&steps++<100){const distance=Math.hypot(p.x-actor.x,p.z-actor.z),step=Math.min(.055,distance);moveAsylumActor(floors,actor,(p.x-actor.x)*step/distance,(p.z-actor.z)*step/distance);}
  assert(steps<100,'Player and pursuer can physically follow the furnished route');
 }
 assert.equal(actor.floor,target.floor);walks++;
}
let baseline;
for(const seed of [1829,1,42,4294967295]){
 const floors=furnishAsylum(buildAsylumLayout(plan).floors,{seed}),f=floors[1],numbers=asylumRoomNumbers(f);
 assert.deepEqual(['R19','R20','R22'].map(id=>numbers.get(id)),['116','117','119']);
 const fixed=f.furniture.filter(i=>!i.variable&&['R19','R20','R22'].includes(i.roomId));
 if(baseline)assert.deepEqual(fixed,baseline,'Beds and sewing furniture retain their poses across new games');else baseline=structuredClone(fixed);
 for(const id of ['R20','R22']){
  const room=f.rooms.find(r=>r.id===id),beds=f.furniture.filter(i=>i.roomId===id&&i.kind==='bed');
  assert.equal(beds.length,14,'Ten additional beds in each ward');
  for(const [index,pose]of original[id].entries()){
   const bed=beds.find(i=>i.id===`1:${id}:fixed:${index}`);assert(bed);
   assert.deepEqual([bed.x,bed.z,bed.rotation],pose,'Original four beds retain their positions and orientation');
  }
  assert(beds.every(i=>!i.variable&&i.width===1.326&&Math.abs(i.depth-2.73)<1e-10),'All beds keep their full model and collision dimensions');
  assert(beds.slice(4).every(i=>Math.abs(Math.cos(i.rotation))<1e-10),'New beds extend the existing long-wall orientation');
  assert(f.furniture.filter(i=>i.roomId===id&&i.variable).length<=2,'Bed additions do not multiply loose chairs');
  assert.equal(f.furniture.filter(i=>i.roomId===id&&i.kind==='cupboard').length,2,'Wardrobe storage is retained');
  for(const bed of beds)walk(floors,{x:bed.x+Math.sin(bed.rotation)*(bed.depth/2+.65),z:bed.z+Math.cos(bed.rotation)*(bed.depth/2+.65),floor:1,y:f.elevation});
  walk(floors,{x:room.label[0],z:room.label[1],floor:1,y:f.elevation});
 }
 const room=f.rooms.find(r=>r.id==='R19'),sewing=f.furniture.filter(i=>i.roomId===room.id);
 assert.equal(room.name,'Sewing room');assert.equal(room.purpose,'sewing');
 assert(!sewing.some(i=>i.kind==='bed'),'The bedroom fittings are replaced');
 for(const [kind,count]of [['table',2],['chair',4],['sewingBasket',2],['foldedLinen',2],['cupboard',1]])assert.equal(sewing.filter(i=>i.kind===kind).length,count);
 for(const item of sewing){
  assert(furnitureCorners(item).every(([x,z])=>insidePolygon(x,z,room.points)),'Sewing furniture fits its room');
  if(item.decorative){
   const support=sewing.find(i=>i.id===item.supportId);assert(support&&support.kind==='table');
   assert(Math.abs(item.y-support.y-support.height-.008)<1e-10,'Cloth and baskets rest on the worktables');
   assert(Math.abs(item.x-support.x)+item.width/2<support.width/2,'The whole decoration fits the tabletop');
  }
 }
 for(const chair of sewing.filter(i=>i.kind==='chair'))walk(floors,{x:chair.x+.8,z:chair.z,floor:1,y:f.elevation});
 const cupboard=sewing.find(i=>i.kind==='cupboard');walk(floors,{x:cupboard.x,z:cupboard.z-cupboard.depth/2-.6,floor:1,y:f.elevation});
 walk(floors,{x:room.label[0],z:room.label[1],floor:1,y:f.elevation});
 const notebook=createNotebook(floors);notebook.explore({x:room.label[0],z:room.label[1],floor:1,outside:false});assert(notebook.entries.some(n=>n.text.includes('Sewing room')),'Notebook uses the new room purpose');
 assert.equal(floors[0].rooms.find(r=>r.id==='R19').purpose,'reading','Ground-floor room uses retain their previous layouts');
 assert(!floors[0].rooms.find(r=>r.id==='R20').bedPositions);assert(!floors[0].rooms.find(r=>r.id==='R22').bedPositions);
}
console.log(`PASS: rooms 117/119 have fourteen beds each, original poses retained, chairs/storage clear, room 116 sewing furniture and notebook name, four seeds and ${walks} physically walked bed/workstation/room routes.`);
