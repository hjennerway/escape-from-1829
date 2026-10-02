import {visible} from './core.mjs';
import {insidePolygon,segmentDistance} from './asylum-layout.mjs';

export const REVEAL_RADIUS=11;
export const OUTSIDE_BOUNDS=[-96,96,-52,82];
export const notebookView=player=>player.outside?'outside':`floor:${player.floor}`;
export const floorTitle=(floor,index)=>floor.name||(index?'Upper floor':'Ground floor');

const archiveNotes={
 'daily-account-patients-1854.png':{
  title:'Daily account · 7–9 December 1854',
  text:'Table XVIII records three days, Thursday 7 to Saturday 9 December 1854. It lists work in the gardens, workshops, wards, kitchen and laundry, alongside daily patient totals and period categories of care.',
  source:'Copied from the displayed daily account · historical terminology'
 },
 'cheshire-asylum-1860-discharge-etc.png':{
  title:'Annual report · 1860',
  text:'Table II counts admissions, discharges and deaths month by month for 1860. The discharge heading uses the period wording “cured and relieved”. The date belongs to the document, rather than the date this building opened.',
  source:'Copied from the displayed Cheshire County Asylum table · historical terminology'
 },
 '1854-plaque':{
  title:'Statistical note · 1854',
  text:'The plaque gives 102 admissions in 1854 and 254 patients on 1 January 1855: 108 men and 146 women. Its period categories include “epilepsy” and “general paralysis”. These are the report’s historical classifications.',
  source:'Copied from the displayed historical plaque · period categories'
 },
 'asylum-service-tunnels.png':{
  title:'Service-space image',text:'The picture shows a brick service space and exposed pipes. I have copied the image into my notes; I have not established a playable route through it.',source:'Observation of wall artwork'
 }
};

// A journal belongs to one escape attempt. It never reads future objectives or NPC routes.
export function createNotebook(floors,{outsideStairs=[]}={}){
 const notes=new Map(),areas=new Map(),wings=new Map(),fog=new Map(),lastReveal=new Map();
 let revision=0,generation=0;
 const views=floors.map((floor,index)=>({key:`floor:${index}`,name:floorTitle(floor,index),floor,index}));
 if(floors[0].geometrySource==='asylum-plan')views.push({key:'outside',name:'Grounds',floor:floors[0],outside:true,routes:outsideStairs});
 for(const view of views){
  const f=view.floor,s=f.cellSize;
  const origin=f.origin??{x:0,z:0};
  const bounds=view.outside?OUTSIDE_BOUNDS:f.bounds??[origin.x-s/2,origin.x+(f.width-.5)*s,origin.z-s/2,origin.z+(f.height-.5)*s];
  const cols=Math.ceil(bounds[1]-bounds[0]),rows=Math.ceil(bounds[3]-bounds[2]);
  fog.set(view.key,{bounds,cols,rows,cells:new Uint8Array(cols*rows),revision:0});
 }
 function add(entry){
  const previous=notes.get(entry.id);
  if(previous&&previous.text===entry.text&&previous.kind===(entry.kind??'fact'))return false;
  notes.set(entry.id,{kind:'fact',...entry,order:++revision});return true;
 }
 function known(key,x,z){
  const f=fog.get(key);if(!f)return false;
  const col=Math.floor(x-f.bounds[0]),row=Math.floor(z-f.bounds[2]);
  return col>=0&&row>=0&&col<f.cols&&row<f.rows&&!!f.cells[row*f.cols+col];
 }
 function reveal(player){
  const key=notebookView(player),f=fog.get(key),prior=lastReveal.get(key);
  if(!f||prior&&Math.hypot(player.x-prior.x,player.z-prior.z)<.25)return;
  lastReveal.set(key,{x:player.x,z:player.z});let changed=false;
  const floor=floors[player.floor];
  for(let row=Math.max(0,Math.floor(player.z-REVEAL_RADIUS-f.bounds[2]));row<Math.min(f.rows,Math.ceil(player.z+REVEAL_RADIUS-f.bounds[2]));row++){
   for(let col=Math.max(0,Math.floor(player.x-REVEAL_RADIUS-f.bounds[0]));col<Math.min(f.cols,Math.ceil(player.x+REVEAL_RADIUS-f.bounds[0]));col++){
    const n=row*f.cols+col,x=f.bounds[0]+col+.5,z=f.bounds[2]+row+.5;
    if(f.cells[n]||Math.hypot(x-player.x,z-player.z)>REVEAL_RADIUS)continue;
    if(!player.outside&&Math.hypot(x-player.x,z-player.z)>1&&!visible(floor,player,{x,z}))continue;
    f.cells[n]=1;changed=true;
   }
  }
  if(changed)f.revision++;
 }
 function recordDoor(exit,floor,{used=false}={}){
  const key=`door:${floor}:${exit.id??exit.name}`,prior=notes.get(key),traversed=used||prior?.used;
  const name=floorTitle(floors[floor],floor);
  add({id:key,title:exit.name,view:`floor:${floor}`,used:traversed,
   text:traversed?'I used this door and reached the outside. I can return through the same door.':floors[floor].geometrySource==='asylum-plan'?'I found a marked outside door here. Its landing or path is still untested.':'I found a marked escape door here.',
   source:`${name} · ${exit.id??'exit'} · ${traversed?'tested route':'observed sign'}`});
 }
 function recordArt(art){
  const key=art.clueId??art.url.split('/').at(-1),copy=archiveNotes[key];
  add({id:`archive:${key}`,title:copy?.title??art.title,view:`floor:${art.floor}`,
   text:copy?.text??`I inspected “${art.title}”. This is a displayed archive image, rather than proof of an accessible route in the present building.`,
   source:copy?.source??art.credit??'Inspected wall artwork'});
 }
 function explore(player){
  reveal(player);const key=notebookView(player),floor=floors[player.floor],name=floorTitle(floor,player.floor);
  if(player.outside){
   add({id:'grounds',title:'Outside the asylum',view:key,text:'I have reached the grounds. The outside sketch records the ground and landings I have explored.',source:'Personal observation'});return;
  }
  add({id:`arrival:${player.floor}`,title:name,view:key,text:'I have reached this level. The sketch fills in nearby as I explore; blank areas are still unknown.',source:'Personal observation'});
  if(!areas.has(key))areas.set(key,new Map());const visited=areas.get(key);
  for(const room of floor.rooms??[]){
   const inside=room.points?insidePolygon(player.x,player.z,room.points):Math.hypot(player.x-room.x*floor.cellSize,player.z-room.z*floor.cellSize)<2;
   if(inside)visited.set(room.id??room.name,room.id?`${room.id} · ${room.name}`:room.name);
  }
  for(const corridor of floor.corridors??[]){
   if(corridor.points.slice(1).some((p,i)=>segmentDistance(player.x,player.z,corridor.points[i],p)<=corridor.width/2))visited.set(corridor.id,`${corridor.id} · ${corridor.name}`);
  }
  if(visited.size)add({id:`places:${player.floor}`,title:`Places explored · ${name}`,view:key,text:[...visited.values()].join('; ')+'.',source:'Personal observations · room uses in this game are fictional'});
  for(const stair of floor.stairs??[]){
   const near=player.stair?.id===stair.id||(stair.points?stair.points.some((p,i)=>segmentDistance(player.x,player.z,p,stair.points[(i+1)%stair.points.length])<1.6):Math.hypot(player.x-stair.x*floor.cellSize,player.z-stair.z*floor.cellSize)<1.8);
   if(!near)continue;
   const id=`stair:${stair.id??stair.name}`,previous=notes.get(id),levels=new Set(previous?.levels??[]);levels.add(player.floor);
   const multipleLevels=levels.size>1;
   add({id,title:stair.name,view:key,levels:[...levels],text:multipleLevels?`I have found this stair on ${[...levels].map(i=>floorTitle(floors[i],i)).join(' and ')}.`:'I found a stair here. I have only recorded it on this level so far.',source:multipleLevels?'Personal observations on these levels':'Personal observation'});
  }
  const b=fog.get(key).bounds,centre=(b[0]+b[1])/2;
  if(!wings.has(key))wings.set(key,new Set());const sides=wings.get(key);
  if(player.x<centre-(b[1]-b[0])*.16)sides.add('west');if(player.x>centre+(b[1]-b[0])*.16)sides.add('east');
  if(sides.size===2)add({id:'wing-pattern',title:'A repeated pattern?',kind:'deduction',text:'The east and west wings repeat several room and corridor patterns. A passage on one side may help me recognise the other, though the two sides are not identical.',source:'My deduction after exploring both wings'});
 }
 return {views,fog,explore,recordDoor,recordArt,known,
  get entries(){return [...notes.values()].sort((a,b)=>b.order-a.order);},get revision(){return revision;},get generation(){return generation;},
  availableViews(){return views.filter(v=>notes.has(v.outside?'grounds':`arrival:${v.index}`));},
  reset(){notes.clear();areas.clear();wings.clear();lastReveal.clear();revision=0;generation++;for(const f of fog.values()){f.cells.fill(0);f.revision=0;}}
 };
}
