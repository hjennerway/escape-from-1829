import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {makeFloors} from './dist/floors.mjs';
import {createNotebook,REVEAL_RADIUS} from './dist/notebook.mjs';
import {drawNotebookMap} from './dist/notebook-map.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors,journal=createNotebook(floors,{outsideStairs:plan.outsideStairs});
const player={x:0,z:14,floor:0,y:0,outside:false};
const count=key=>journal.fog.get(key).cells.reduce((sum,v)=>sum+v,0);
assert.equal(journal.entries.length,0);assert.equal(journal.availableViews().length,0);
journal.explore(player);
assert(journal.known('floor:0',player.x,player.z));assert(!journal.known('floor:0',-31,-7));
assert.deepEqual(journal.availableViews().map(v=>v.key),['floor:0']);
assert.equal(count('floor:1'),0);assert.equal(count('floor:2'),0);assert.equal(count('outside'),0);
const first=count('floor:0'),revision=journal.revision;
for(let i=0;i<20;i++)journal.explore(player);
assert.equal(count('floor:0'),first);assert.equal(journal.revision,revision,'Standing still creates neither new notes nor map repaint work');
const fog=journal.fog.get('floor:0');
for(let n=0;n<fog.cells.length;n++)if(fog.cells[n]){
 const x=fog.bounds[0]+n%fog.cols+.5,z=fog.bounds[2]+Math.floor(n/fog.cols)+.5;
 assert(Math.hypot(x-player.x,z-player.z)<=REVEAL_RADIUS,'Reveal stays within the small exploration radius');
}
// A wall between the observer and target prevents a hidden room being mapped.
const wallFloor={width:12,height:12,cellSize:1,rooms:[],stairs:[],exits:[],cells:new Uint8Array(144).fill(1)};
for(let z=0;z<12;z++)wallFloor.cells[z*12+6]=0;
const wallJournal=createNotebook([wallFloor]);wallJournal.explore({x:4,z:5,floor:0});
assert(wallJournal.known('floor:0',4,5));assert(!wallJournal.known('floor:0',8,5),'Fog does not reveal through a wall');

Object.assign(player,{x:-20.5,z:8.2});journal.explore(player);const explored=count('floor:0');
assert(explored>first);assert(journal.known('floor:0',0,14),'Previously explored areas remain visible');
Object.assign(player,{floor:1,y:4.2});journal.explore(player);
assert.equal(count('floor:0'),explored);assert(count('floor:1')>0);assert.equal(count('floor:2'),0);
assert(!journal.known('floor:1',0,14),'The upstairs sketch does not inherit downstairs exploration');
Object.assign(player,{floor:2,x:-31.1,z:-7,y:-3.2});journal.explore(player);
assert(count('floor:2')>0);assert.equal(count('outside'),0);
Object.assign(player,{outside:true,x:-38.8,z:-34.7,y:-1.02});journal.explore(player);
assert(count('outside')>0);assert.equal(journal.availableViews().length,4);

const door=floors[0].exits.find(e=>e.id==='D3');journal.recordDoor(door,0);
let note=journal.entries.find(e=>e.id==='door:0:D3');assert(!note.used);assert(note.text.includes('untested'));
journal.recordDoor(door,0,{used:true});const usedRevision=journal.revision;
journal.recordDoor(door,0);note=journal.entries.find(e=>e.id==='door:0:D3');assert(note.used);assert(note.text.includes('return'));assert.equal(journal.revision,usedRevision,'Seeing a tested door again cannot erase confirmed knowledge');
const stair=floors[0].stairs.find(s=>s.id==='S5'),portal={x:stair.points[0][0]+.9,z:stair.points[0][1]-.3,outside:false};
journal.explore({...portal,floor:0,y:0});journal.explore({...portal,floor:2,y:-3.2});
assert.equal(journal.entries.find(e=>e.id==='stair:S5').levels.length,2,'Finding the same staircase on a new floor updates the note');
assert(journal.entries.find(e=>e.id==='stair:S5').text.includes('Ground floor and Basement'));

const art={url:'./art/daily-account-patients-1854.png',title:'Daily account',floor:0};journal.recordArt(art);const artRevision=journal.revision;journal.recordArt({...art,floor:1});
assert.equal(journal.revision,artRevision,'Copies of the same record on different floors produce one entry');
assert.equal(journal.entries.find(e=>e.id.includes('daily-account')).kind,'fact');
assert(journal.entries.find(e=>e.id.includes('daily-account')).text.includes('7 to Saturday 9 December 1854'));
journal.explore({x:-31,z:5,floor:0,outside:false});assert(!journal.entries.some(e=>e.kind==='deduction'));
journal.explore({x:31,z:5,floor:0,outside:false});assert(journal.entries.some(e=>e.kind==='deduction'&&e.text.includes('not identical')));

// Enemy markers require current, nearby, visible actors; remembered fog is never a radar.
const canvases=[];
function canvas(){
 const c={width:205,height:165},calls=[];
 const context=new Proxy({canvas:c,calls,drawImage(image){calls.push({op:'blit',image});},arc(x,z,r){calls.push({op:'arc',color:this.fillStyle,x,z,r});}},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
 c.getContext=()=>context;canvases.push(c);return c;
}
const target=canvas(),viewer={x:4,z:5,floor:0},enemies=[{x:3,z:5,floor:0,type:1},{x:8,z:5,floor:0,type:2},{x:3,z:5,floor:1,type:2}];
drawNotebookMap(target.getContext('2d'),wallJournal,'floor:0',viewer,enemies,0,{createCanvas:canvas});
const arcs=target.getContext('2d').calls.filter(c=>c.op==='arc');assert.equal(arcs.length,2);assert.equal(arcs[0].color,'#e1c278');assert.equal(arcs[1].color,'#fff8db');
const canvasCount=canvases.length;drawNotebookMap(target.getContext('2d'),wallJournal,'floor:0',viewer,[],0,{createCanvas:canvas});assert.equal(canvases.length,canvasCount,'Stationary map redraws reuse their cached canvases');
const generation=journal.generation;journal.reset();assert.equal(journal.generation,generation+1);assert.equal(journal.entries.length,0);assert.equal(journal.availableViews().length,0);for(const view of journal.views)assert.equal(count(view.key),0);
// The previous two-floor fallback still reveals correctly using its own cell scale.
const legacy=JSON.parse(await readFile(new URL('./dist/layout.json',import.meta.url))),oldFloors=makeFloors(legacy),oldJournal=createNotebook(oldFloors);
oldJournal.explore({x:legacy.spawn.x*legacy.cellSize,z:legacy.spawn.z*legacy.cellSize,floor:0});
assert.equal(oldJournal.availableViews().length,1);assert.equal(oldJournal.fog.get('floor:1').revision,0);
console.log('PASS: notebook discovery, radius/wall fog, independent three-floor/grounds maps, remembered routes, updated doors/stairs, archive deduplication, labelled deductions, hidden NPCs, cached drawing, retry and legacy layout.');
