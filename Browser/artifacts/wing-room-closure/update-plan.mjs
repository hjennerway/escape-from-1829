import assert from 'node:assert/strict';
import {readFile,writeFile,copyFile} from 'node:fs/promises';
const runtime=new URL('../../dist/asylum-plan.json',import.meta.url),review=new URL('../../../Research/1829-interior-proposal/plan-data.json',import.meta.url);
const plan=JSON.parse(await readFile(runtime)),old=JSON.parse(await readFile(new URL('./plan-before.json',import.meta.url)));
assert.deepEqual(plan,JSON.parse(await readFile(review)));
const changedBefore=plan.rooms.filter(r=>JSON.stringify(r)!==JSON.stringify(old.rooms.find(v=>v.id===r.id))).map(r=>r.id);
console.log('Existing changes since initial audit:',changedBefore);
const room=id=>plan.rooms.find(r=>r.id===id),corridor=id=>plan.corridors.find(c=>c.id===id);
function variant(id,floor,values){const r=room(id);r.variants??={};r.variants[floor]={...r.variants[floor],...values};}
// Explicit boundaries join the room-side ends at bends. They replace the
// old sampled corner fragments and keep fitted door widths and positions.
for(const floor of [0,1]){
 variant('R33',floor,{points:[[-41,19.1],[-36.9,19.1],[-34.5,22.85],[-34.5,27],[-41,27]],corridorClipping:false});
 variant('R32',floor,{points:[[-41,27],[-33.8375,27],[-31.45,29.42],[-31.45,36.9],[-41,36.9]],corridorClipping:false});
 variant('R22',floor,{points:[[-47,2.2],[-39.09756097560975,2.2],[-38,5.265822784810127],[-38,19.5],[-47,19.5]],corridorClipping:false});
 variant('R17',floor,{points:[[-69.65,7.4],[-66,7.4],[-66,16.7],[-69.65,16.7]],corridorClipping:false});
 variant('R11',floor,{points:[[-6.5,-1],[4.1,-1],[4.1,5.1],[3.9,4.9],[-6.5,4.9]],corridorClipping:false});
}
variant('R35',1,{points:room('R35').variants[0].points,corridorClipping:false});
variant('R36',1,{points:room('R36').variants[0].points,corridorClipping:false});
// R27 already has its reviewed ground diagonal and first-floor L return.
// Preserve both existing enclosed variants, including concurrent corrections.
variant('R27',0,{points:old.rooms.find(r=>r.id==='R27').variants[0].points,corridorClipping:false});
// Close the room beyond D8 while leaving its perpendicular door lobby open.
variant('R30',0,{points:[[61.25,19.5],[67.1,19.5],[69.7,20.5],[69.7,25],[61.25,25]],corridorClipping:false});
// The basement room follows the east side of the Reception stair/door lobby.
variant('B11',2,{points:[[-7.8,9.4],[0,9.4],[0,19.6],[-7.1,19.6],[-7.1,17.3],[-7.8,17.3]],corridorClipping:false});
const eastRoute=corridor('C6').variants[0].points;
for(const floor of [0,1]){
 corridor('C5').variants??={};corridor('C5').variants[floor]={points:eastRoute.map(([x,z])=>[-x,z===38.1?38.15:z])};
 corridor('C6').variants??={};corridor('C6').variants[floor]={points:eastRoute.map(p=>[...p])};
}
// Match the already reviewed east ground-floor clearance at all four bends.
for(const floor of [0,1])for(const side of [-1,1]){
 const loop=plan.floors[floor].outline.loops[0],i=loop.findIndex(([x,z])=>x===side*32&&z===27);
 if(i>=0){
  const next=loop[(i+1)%loop.length],before=loop[(i+loop.length-1)%loop.length];
  if(next[1]===27)loop.splice(i,1,[side*32,25.25],[side*30.25,27]);
  else if(before[1]===27)loop.splice(i,1,[side*30.25,27],[side*32,25.25]);
  else throw Error('Unexpected forward corner');
  plan.floors[floor].outline.area+=1.75*1.75/2;
 }
}
await writeFile(runtime,JSON.stringify(plan)+'\n');await copyFile(runtime,review);
console.log('Updated room boundaries and matching corridor bends on ground, first and basement floors; second-floor rooms are already closed.');
