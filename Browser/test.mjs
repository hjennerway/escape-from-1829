import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {exitDirection} from './dist/escape-routes.mjs';
import {path,walkable,visible,nearExit} from './dist/core.mjs';
import {makeFloors,changeFloor,nearStair,routeBetweenFloors} from './dist/floors.mjs';
const l=JSON.parse(await readFile(new URL('./dist/layout.json',import.meta.url)));
const spawn={x:l.spawn.x*l.cellSize,z:l.spawn.z*l.cellSize};
assert.equal(l.exits.length,7);assert.equal(l.cells.length,l.width*l.height);
for(const e of l.exits){const target={x:e.x*l.cellSize,z:e.z*l.cellSize},route=path(l,spawn,target);assert(route.length>0,e.name+' unreachable');let prev=spawn;for(const p of route){assert.equal(Math.hypot(p.x-prev.x,p.z-prev.z),l.cellSize);assert(walkable(l,p.x,p.z));prev=p;}assert.equal(nearExit(l,target).name,e.name);console.log(e.name+': reachable in '+route.length+' grid steps');}
assert(!walkable(l,0,0));assert(walkable(l,spawn.x,spawn.z));
assert(!visible(l,{x:30,z:30},{x:70,z:30}),'Rear courts separate the three arms');
assert(visible(l,{x:10,z:l.galleryZ*l.cellSize},{x:90,z:l.galleryZ*l.cellSize}),'Front gallery joins the wings');
// Every walkable cell is in the spawn component, including side rooms.
for(let i=0;i<l.cells.length;i++)if(l.cells[i]){const p={x:i%l.width*l.cellSize,z:Math.floor(i/l.width)*l.cellSize};if(p.x!==spawn.x||p.z!==spawn.z)assert(path(l,spawn,p).length>0,'Disconnected cell '+i);}
console.log('PASS: seven ground-floor candidates, all rooms connected, wall collision and sight obstruction.');
assert.equal(l.geometrySource,'layout','Browser must not use stale binary walls');
assert.equal(l.stairs.length,2);
const [left,right]=l.stairs;
assert(left.x<20&&right.x>20);
assert.equal(left.x+right.x,40);
assert.equal(left.z,right.z);
assert.equal(left.mirror,-right.mirror);
for(const t of l.stairs){
  assert(path(l,spawn,{x:t.x*l.cellSize,z:t.z*l.cellSize}).length>0);
  for(let z=t.z;z<=l.galleryZ;z++)assert(walkable(l,t.x*l.cellSize,z*l.cellSize));
}
// Model-derived silhouette: three rear arms, open courts, two forward feet,
// a longer eastern pavilion, and no eastern annexe or rear cross-range.
for(const floor of [l,l.upperFloor]){
  const open=(x,z)=>floor.cells[z*l.width+x]===1;
  for(const x of [12,20,28])for(let z=7;z<=20;z++)assert(open(x,z));
  assert(open(20,6)&&!open(12,6)&&!open(28,6),'Centre extends beyond side arms');
  for(let z=6;z<=15;z++){
    for(const x of [15,16,17,23,24,25])assert(!open(x,z),'Rear courtyard stays open');
    for(let x=31;x<l.width;x++)assert(!open(x,z),'Excluded eastern ranges stay absent');
  }
  for(const x of [11,29])for(let z=21;z<=26;z++)assert(open(x,z));
  for(let z=22;z<l.height;z++)assert(!open(20,z),'No long invented front central arm');
  assert(open(36,22)&&!open(4,22),'Keep unequal end pavilion shapes');
}
const canonical=JSON.parse(await readFile(new URL('../Assets/Resources/layout.json',import.meta.url)));
assert.deepEqual(l,canonical);
console.log('PASS: mirrored reception stair approaches, canonical/browser parity.');
const floors=makeFloors(l),upper=floors[1];
const expectedExits=[
  {x:12,z:7,axis:'z',facing:-1},{x:20,z:6,axis:'z',facing:-1},{x:28,z:7,axis:'z',facing:-1},
  {x:2,z:19,axis:'x',facing:-1},{x:38,z:19,axis:'x',facing:1},
  {x:11,z:26,axis:'z',facing:1},{x:29,z:26,axis:'z',facing:1}
];
for(const floor of floors){
  assert.deepEqual(floor.exits.map(({x,z,axis,facing})=>({x,z,axis,facing})),expectedExits,'Seven marked locations on each floor replace the old exit list');
  assert.equal(nearExit(floor,{x:20*l.cellSize,z:21*l.cellSize}),undefined,'The former main portico is no longer an exit');
  for(const exit of floor.exits){const {dx,dz}=exitDirection(exit);assert.equal(floor.cells[(exit.z+dz)*floor.width+exit.x+dx],0,'Exit faces an exterior wall');}
}
for(const exit of upper.exits){
  const destination={x:exit.x*upper.cellSize,z:exit.z*upper.cellSize,floor:1};
  assert(walkable(upper,destination.x,destination.z));
  assert.equal(nearExit(upper,destination),exit);
  assert.equal(routeBetweenFloors(floors,{...spawn,floor:0},destination).at(-1)?.floor,1,'Fire escape reachable from reception');
}
assert(upper.stairs.every(t=>t.direction==='DOWN'));
for(const floor of floors)for(const point of [...floor.patrol,...floor.rooms,...floor.enemies]){
  assert(walkable(floor,point.x*l.cellSize,point.z*l.cellSize),'Patrol, room label and pursuer positions stay inside');
  assert(path(floor,spawn,{x:point.x*l.cellSize,z:point.z*l.cellSize}).length||point.x===l.spawn.x&&point.z===l.spawn.z);
}
const traveller={...spawn,floor:0};
assert.equal(changeFloor(floors,traveller,l.stairs[0]),false,'Cannot teleport from spawn');
for(const stair of l.stairs){
  Object.assign(traveller,{x:stair.x*l.cellSize,z:stair.z*l.cellSize,floor:0});
  assert(changeFloor(floors,traveller,nearStair(floors,traveller)));
  assert.equal(traveller.floor,1);assert(walkable(upper,traveller.x,traveller.z));
  assert.equal(nearExit(upper,traveller),undefined);
  for(let i=0;i<upper.cells.length;i++)if(upper.cells[i]){
    const destination={x:i%upper.width*upper.cellSize,z:Math.floor(i/upper.width)*upper.cellSize,floor:1};
    if(destination.x!==traveller.x||destination.z!==traveller.z)assert(path(upper,traveller,destination).length>0);
    const route=routeBetweenFloors(floors,{...spawn,floor:0},destination);
    assert(route.length>0);assert.equal(route.at(-1).floor,1);
    assert.equal(route.filter((p,j)=>j>0&&p.floor!==route[j-1].floor).length,1);
  }
  for(const exit of l.exits){
    const route=routeBetweenFloors(floors,traveller,{x:exit.x*l.cellSize,z:exit.z*l.cellSize,floor:0});
    assert(route.length>0);assert.equal(route.at(-1).floor,0);
  }
  assert(changeFloor(floors,traveller,nearStair(floors,traveller)));assert.equal(traveller.floor,0);
}
console.log('PASS: both stairs up/down, all upper rooms reachable, cross-floor pursuer routes, fourteen reachable escape-route candidates across both floors.');
