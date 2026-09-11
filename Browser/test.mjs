import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {path,walkable,visible,nearExit} from './dist/core.mjs';
const l=JSON.parse(await readFile(new URL('./dist/layout.json',import.meta.url)));
const spawn={x:l.spawn.x*l.cellSize,z:l.spawn.z*l.cellSize};
assert.equal(l.exits.length,5);assert.equal(l.cells.length,l.width*l.height);
for(const e of l.exits){const target={x:e.x*l.cellSize,z:e.z*l.cellSize},route=path(l,spawn,target);assert(route.length>0,e.name+' unreachable');let prev=spawn;for(const p of route){assert.equal(Math.hypot(p.x-prev.x,p.z-prev.z),l.cellSize);assert(walkable(l,p.x,p.z));prev=p;}assert.equal(nearExit(l,target).name,e.name);console.log(e.name+': reachable in '+route.length+' grid steps');}
assert(!walkable(l,0,0));assert(walkable(l,spawn.x,spawn.z));assert(!visible(l,{x:20,z:10},{x:80,z:10}));assert(visible(l,{x:20,z:40},{x:80,z:40}));
// Every walkable cell is in the spawn component, including side rooms.
for(let i=0;i<l.cells.length;i++)if(l.cells[i]){const p={x:i%l.width*l.cellSize,z:Math.floor(i/l.width)*l.cellSize};if(p.x!==spawn.x||p.z!==spawn.z)assert(path(l,spawn,p).length>0,'Disconnected cell '+i);}
console.log('PASS: five exits, all rooms connected, wall collision and sight obstruction.');
assert.equal(l.geometrySource,'layout','Browser must not use stale binary walls');
assert.equal(l.stairs.length,2);
const [left,right]=l.stairs;
assert(left.x<20&&right.x>20);
assert.equal(left.x+right.x,40);
assert.equal(left.z,right.z);
assert.equal(left.mirror,-right.mirror);
for(const t of l.stairs){
  assert(path(l,{x:20*l.cellSize,z:14*l.cellSize},{x:t.x*l.cellSize,z:t.z*l.cellSize}).length>0);
  for(let z=t.z;z<=16;z++)assert(walkable(l,t.x*l.cellSize,z*l.cellSize));
}
for(let z=0;z<l.height;z++)for(let x=0;x<l.width;x++)assert.equal(l.cells[z*l.width+x],l.cells[z*l.width+l.width-1-x]);
const canonical=JSON.parse(await readFile(new URL('../Assets/Resources/layout.json',import.meta.url)));
assert.deepEqual(l,canonical);
console.log('PASS: mirrored reception stair approaches, canonical/browser parity.');
