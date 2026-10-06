import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildAsylumLayout,moveAsylumActor,insidePolygon,segmentDistance} from './dist/asylum-layout.mjs';
import {furnishAsylum} from './dist/asylum-furniture.mjs';
import {walkable,path} from './dist/core.mjs';
import {ROOM_SEARCH_SECONDS,resetEnemyRoomSearch,updateEnemyRoomSearch} from './dist/enemy-room-search.mjs';

const {floors}=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))));
const cases=[
 {floor:0,x:35.8,z:-6,player:{x:35.8,z:-21.4}},
 {floor:1,x:-35.8,z:-6,player:{x:-35.8,z:-21.4}},
 {floor:2,x:-31.1,z:-6,player:{x:-31.1,z:-22}},
 {floor:3,x:-8,z:12.3,player:{x:6,z:12.3}}
];
const actor=c=>({...c,player:undefined,y:floors[c.floor].elevation,rethink:0,path:[],memory:5});
function tick(enemy,player,dt=.04){
 const active=updateEnemyRoomSearch(floors,enemy,player,dt),target=enemy.path[0];
 if(active&&target){
  const dx=target.x-enemy.x,dz=target.z-enemy.z,d=Math.hypot(dx,dz),step=Math.min(2.2*dt,d);
  if(d>.001)moveAsylumActor(floors,enemy,dx/d*step,dz/d*step);
  if(d<.1&&Math.abs(enemy.y-target.y)<.4)enemy.path.shift();
 }
 return active;
}
let searches=0;
for(const seed of [0,1,1829,0xffffffff]){
 furnishAsylum(floors,{seed});
 for(const c of cases)for(const type of [1,2]){
  const enemy={...actor(c),type},player={...c.player,floor:c.floor};
  assert(walkable(floors[c.floor],enemy.x,enemy.z));assert(walkable(floors[c.floor],player.x,player.z));
  assert(tick(enemy,player),'Far NPC must search a nearby side room on floor '+c.floor);
  const search=enemy.roomSearch,room=floors[c.floor].rooms.find(r=>r.id===search.roomId);
  assert(walkable(floors[c.floor],search.target.x,search.target.z,.4),'Target clears actual doors and furniture');
  assert(insidePolygon(search.target.x,search.target.z,room.points));
  for(const corridor of floors[c.floor].corridors)for(let i=1;i<corridor.points.length;i++)assert(segmentDistance(search.target.x,search.target.z,corridor.points[i-1],corridor.points[i])>=corridor.width/2+.7,'Wait outside the walking corridor');
  for(let i=0;i<600&&search.phase==='enter';i++)assert(tick(enemy,player),'Search must stay committed while walking');
  assert.equal(search.phase,'wait','NPC physically reaches the furnished room');
  assert(Math.hypot(enemy.x-search.target.x,enemy.z-search.target.z)<.15);
  const position={x:enemy.x,z:enemy.z};
  // A nearby player in the corridor cannot immediately recall the search.
  Object.assign(player,{x:c.x,z:c.z});
  for(let i=0;i<100;i++)assert(tick(enemy,player));
  assert.deepEqual({x:enemy.x,z:enemy.z},position,'Four seconds to squeeze past without movement');
  assert.equal(enemy.roomSearch,search);
  Object.assign(player,c.player);
  assert.equal(tick(enemy,player,ROOM_SEARCH_SECONDS),false,'The room search eventually ends');
  assert.equal(enemy.roomSearch,null);assert(enemy.roomSearchCooldown>0);
  assert.equal(tick(enemy,player,.1),false,'No immediate repeated room search');
  resetEnemyRoomSearch(enemy);assert.equal(enemy.roomSearchCooldown,0);assert.equal(enemy.roomSearch,null);
  searches++;
 }
}

furnishAsylum(floors,{seed:1829});
const base=cases[0],floor=floors[0],enemy=actor(base);
for(const separation of [0,3,7]){
 resetEnemyRoomSearch(enemy);Object.assign(enemy,{x:35.5,z:-7,rethink:0});
 assert.equal(updateEnemyRoomSearch(floors,enemy,{x:35.5,z:-7-separation,floor:0},0),false,'Within one room retains pursuit');
}
// Exactly one local room frontage (R14: 7.7 units) is still close.
assert.equal(updateEnemyRoomSearch(floors,enemy,{x:35.5,z:-14.7,floor:0},0),false);
assert(updateEnemyRoomSearch(floors,enemy,{x:35.5,z:-15,floor:0},0),'Beyond one room searches');
const selected=enemy.roomSearch;
assert.equal(updateEnemyRoomSearch(floors,enemy,{...selected.target},.04),false,'Entering the searched room restores pursuit');
assert.equal(enemy.roomSearch,null);
resetEnemyRoomSearch(enemy);
Object.assign(enemy,{x:base.x,z:base.z,rethink:0});
assert.equal(updateEnemyRoomSearch(floors,enemy,{...base.player,floor:1},0),false,'Cross-floor staircase pursuit remains available');
enemy.stair={};assert.equal(updateEnemyRoomSearch(floors,enemy,{...base.player,floor:0},0),false,'Do not divert on a stair');enemy.stair=null;
assert(updateEnemyRoomSearch(floors,enemy,{...base.player,floor:0},0));
assert.equal(updateEnemyRoomSearch(floors,enemy,{...base.player,floor:0},100),false,'Blocked entry cannot trap an NPC forever');
assert.equal(enemy.roomSearch,null);
resetEnemyRoomSearch(enemy);enemy.rethink=0;
const room=floor.rooms.find(r=>r.id==='R2'),clear=[];
for(let x=-32;x<-22;x+=.5)if(insidePolygon(x,-14.5,room.points)&&walkable(floor,x,-14.5))clear.push({x,z:-14.5,floor:0});
Object.assign(enemy,clear[0]);assert(path(floor,enemy,clear.at(-1)).length);
assert.equal(updateEnemyRoomSearch(floors,enemy,clear.at(-1),0),false,'Sharing a large room does not trigger a detour');
assert.equal(updateEnemyRoomSearch([{geometrySource:'layout'}],{floor:0},{floor:0},0),false,'Legacy grid fixture remains supported');
console.log(`PASS: ${searches} guard/ghost searches across four furnished floors and four seeds, physical entry, six-second passing window, local room distance, close/same-room pursuit, cooldown, stairs, timeout and reset.`);
