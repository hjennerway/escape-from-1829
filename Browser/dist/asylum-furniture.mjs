import {insidePolygon,flatWalkable} from './asylum-layout.mjs';
import {asylumWindowCenters} from './asylum-windows.mjs';
import {furnitureContains,furnitureBlocks,indexFurniture} from './furniture-collision.mjs';
import {ROOM_USES,ROOM_PURPOSES} from './asylum-room-uses.mjs';
import {HALL_PROP_CATALOG,hallFurnishings} from './hall-furnishings.mjs';
import {SANITARY_CATALOG,sanitaryFurnishings} from './sanitary-furnishings.mjs';
import {sewingFurnishings} from './sewing-furnishings.mjs';
import {doorRectangle,doorPolygonsOverlap,roomDoorHandle,roomDoorPanels,roomDoorHandlePlate} from './asylum-doors.mjs';

export const RECEPTION_FURNITURE_SCALE=1.2;
export const FURNITURE_CATALOG={
 cellMattress:{procedural:true,width:.92,depth:1.90,height:.18,era:'Interpretive padded confinement cell'},
 ...HALL_PROP_CATALOG,
 ...SANITARY_CATALOG,
 bed:{source:'bed_single_A',width:1.02*1.3,depth:2.10*1.3,height:.92*1.3},
 chair:{source:'windsor_chair',width:.48*1.3,depth:.47*1.3,height:.90*1.3},
 bookcase:{source:'shelf_B_large',width:1.25*1.5,depth:.38*1.5,height:1.90*1.5},
 cupboard:{procedural:true,width:1.50,depth:.65,height:1.90*1.5},
 table:{source:'table_medium',width:1.50*1.3,depth:.82*1.3,height:.76*1.3},
 bench:{source:'panca_50',width:.40,depth:.30,height:.45},
 books:{source:'book_set',width:.42,depth:.20,height:.27,decorative:true},
 receptionDesk:{procedural:true,width:1.85*RECEPTION_FURNITURE_SCALE,depth:.88*RECEPTION_FURNITURE_SCALE,height:.92*RECEPTION_FURNITURE_SCALE,era:'Early nineteenth-century clerk desk'},
 waitingBench:{procedural:true,width:2.45*RECEPTION_FURNITURE_SCALE,depth:.52*RECEPTION_FURNITURE_SCALE,height:.94*RECEPTION_FURNITURE_SCALE,era:'Plain timber waiting bench'},
 longcaseClock:{procedural:true,width:.62*RECEPTION_FURNITURE_SCALE,depth:.36*RECEPTION_FURNITURE_SCALE,height:2.34*RECEPTION_FURNITURE_SCALE,era:'Early nineteenth-century Chester clock'},
 keyCupboard:{procedural:true,width:.70*RECEPTION_FURNITURE_SCALE,depth:.16*RECEPTION_FURNITURE_SCALE,height:.72*RECEPTION_FURNITURE_SCALE,decorative:true,mounted:true,era:'Interpretive key cupboard'},
 rulesNotice:{procedural:true,width:.76*RECEPTION_FURNITURE_SCALE,depth:.045*RECEPTION_FURNITURE_SCALE,height:.92*RECEPTION_FURNITURE_SCALE,decorative:true,mounted:true,era:'Interpretive asylum rules'},
 clerkSet:{procedural:true,width:1.52*RECEPTION_FURNITURE_SCALE,depth:.64*RECEPTION_FURNITURE_SCALE,height:.35*RECEPTION_FURNITURE_SCALE,decorative:true,era:'Ledger, papers, ink, quill, candles and handbell'},
 hydroBath:{procedural:true,width:1.08,depth:2.30,height:1.33,era:'Victorian hydrotherapy'},
 hydroShower:{procedural:true,width:1.22*1.3,depth:1.10*1.3,height:2.28*1.3,era:'Early nineteenth-century cold bathing'},
 operatingTable:{procedural:true,width:.82*1.3,depth:2.08*1.3,height:1.02*1.3,era:'Circa 1830 surgical table'},
 electrotherapy:{procedural:true,width:1.10,depth:.68,height:1.35,era:'Late eighteenth / early nineteenth-century electrotherapy'},
 apothecary:{procedural:true,width:1.36,depth:.50,height:2.02,era:'Nineteenth-century dispensary'},
 bloodletting:{procedural:true,width:.62,depth:.38,height:.43,decorative:true,era:'Early nineteenth-century leech and cupping equipment'},
 ectMachine:{procedural:true,width:.66,depth:.62,height:1.27,era:'1940s electroconvulsive therapy'}
};
export function furnishingRandom(seed){let n=seed>>>0;return ()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296);}
function roomSeed(seed,floor,id){let n=seed^Math.imul(floor+1,2654435761);for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
export function furnitureCorners(item,padding=0){
 const c=Math.cos(item.rotation),s=Math.sin(item.rotation);
 return [-1,0,1].flatMap(u=>[-1,0,1].map(v=>{const a=u*(item.width/2+padding),b=v*(item.depth/2+padding);return [item.x+c*a+s*b,item.z-s*a+c*b];}));
}
export const FURNITURE_FRONT_CLEARANCE=1;
export function furnitureFrontClearance(item){
 if(!['bookcase','apothecary','linenCupboard','sideboard'].includes(item.kind))return null;
 // Both models open towards local +Z. Reserve the whole front, with a
 // small allowance beside the frame, even when fitted to a diagonal wall.
 const distance=item.depth/2+FURNITURE_FRONT_CLEARANCE/2;
 return {x:item.x+Math.sin(item.rotation)*distance,z:item.z+Math.cos(item.rotation)*distance,width:item.width+.20,depth:FURNITURE_FRONT_CLEARANCE,rotation:item.rotation};
}
function nearSegment(item,a,b,margin){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.max(1,Math.ceil(length/.12));
 for(let i=0;i<=steps;i++)if(furnitureContains(item,a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps,margin))return true;
 return false;
}
function overlaps(a,b,margin=.16){
 // Separating axes keep rotated chair corners clear of the adjacent furniture.
 const axes=[a.rotation,b.rotation].flatMap(r=>[[Math.cos(r),-Math.sin(r)],[Math.sin(r),Math.cos(r)]]);
 const project=(item,axis)=>{const c=Math.cos(item.rotation),s=Math.sin(item.rotation);return Math.abs(c*axis[0]-s*axis[1])*item.width/2+Math.abs(s*axis[0]+c*axis[1])*item.depth/2;};
 return axes.every(axis=>Math.abs((b.x-a.x)*axis[0]+(b.z-a.z)*axis[1])<project(a,axis)+project(b,axis)+margin);
}
function blocksFurnitureFront(a,b){
 const frontA=furnitureFrontClearance(a),frontB=furnitureFrontClearance(b);
 return (frontA&&overlaps(frontA,b,0))||(frontB&&overlaps(a,frontB,0));
}
function windowPoints(floor){
 if(floor.id===2||floor.windowMode==='scheduled')return (floor.windows??[]).map(w=>[w.x,w.z]);
 return floor.walls.flatMap(w=>asylumWindowCenters(w,floor.walls).map(t=>{const d=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);return [w.a[0]+(w.b[0]-w.a[0])*t/d,w.a[1]+(w.b[1]-w.a[1])*t/d];}));
}
function clearPlacement(floor,room,item,placed,windows){
 const fitted=['bookroom','library','privy','paddedCell'].includes(room.purpose)||item.kind==='bookcase';
 const wallStorage=['cupboard','bookcase','waitingBench','longcaseClock','linenCupboard','sideboard','privySeat','privyScreen','washstand'].includes(item.kind);
 const wallBed=item.kind==='bed'&&!!(room.bedRows||room.bedPositions);
 const c=Math.cos(item.rotation),s=Math.sin(item.rotation);
 // Storage backs and planned bed heads may touch masonry. Keep side/front
 // clearance, but probe the rear face just inside its host wall contact.
 const probes=wallStorage||wallBed?[-1,0,1].flatMap(u=>[-1,0,1].map(v=>{
  const a=u*(item.width/2+.10),b=v===-1?-item.depth/2+1e-6:v*(item.depth/2+.10);
  return {x:item.x+c*a+s*b,z:item.z-s*a+c*b,radius:v===-1?0:.14};
 })):furnitureCorners(item,.10).map(([x,z])=>({x,z,radius:.14}));
 if(!probes.every(({x,z,radius})=>insidePolygon(x,z,room.points)&&flatWalkable(floor,x,z,radius,{furniture:false})))return false;
 if(furnitureContains(item,...room.label,(fitted||room.bedRows||room.bedPositions||room.purpose==='privy')?.55:1.15))return false;
 if(placed.some(p=>!FURNITURE_CATALOG[p.kind].decorative&&overlaps(item,p)))return false;
 if(placed.some(p=>blocksFurnitureFront(item,p)))return false;
 if(room.bedPositions&&item.kind!=='bed'){
  // Chairs and small seats may move between games, but every planned bed
  // keeps its full-width foot approach connected to the central aisle.
  const bed=FURNITURE_CATALOG.bed;
  for(const position of room.bedPositions){
   const reach=bed.depth/2+.50;
   const foot={x:position.x+Math.sin(position.rotation)*reach,z:position.z+Math.cos(position.rotation)*reach,width:bed.width,depth:.80,rotation:position.rotation};
   if(overlaps(item,foot,.10))return false;
  }
 }
 if(room.bedRows&&item.kind!=='bed'){
  // Keep the routes around each row end open. Short-wall storage may use
  // the wider middle aisle, beyond the full bed depth and foot clearance.
  for(const row of room.bedRows){
   const [a,b]=row.wall,length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
   let nx=-dz,nz=dx;
   if(!insidePolygon((a[0]+b[0])/2+nx*.2,(a[1]+b[1])/2+nz*.2,room.points)){nx=-nx;nz=-nz;}
   for(const [index,p] of row.wall.entries()){
    const end=Array.isArray(row.endClearance)?row.endClearance[index]:row.endClearance;
    const along=Math.max(.45,end/2),x=p[0]+dx*(index===0?1:-1)*along,z=p[1]+dz*(index===0?1:-1)*along;
    const reach=FURNITURE_CATALOG.bed.depth+row.clearance+.40;
    if(nearSegment(item,[x+nx*.09,z+nz*.09],[x+nx*reach,z+nz*reach],.40))return false;
   }
  }
 }
 // Reserve complete open leaves and handles, including their ends between
 // the usual furniture probes. Shelves also need their access strip clear.
 const footprint=doorRectangle(item),doorFront=furnitureFrontClearance(item);
 for(const door of floor.roomDoors??[])for(const obstacle of [door,roomDoorPanels(door),roomDoorHandle(door),roomDoorHandlePlate(door)]){
  const polygon=doorRectangle(obstacle);
  if(doorPolygonsOverlap(footprint,polygon)||(doorFront&&doorPolygonsOverlap(doorRectangle(doorFront),polygon)))return false;
 }
 const front=furnitureFrontClearance(item);
 // The extra side allowance separates furniture; masonry must leave the
 // actual frame width clear. Check its centre with a player's radius too.
 if(front&&(!furnitureCorners({...front,width:item.width}).every(([x,z])=>insidePolygon(x,z,room.points)&&flatWalkable(floor,x,z,.02,{furniture:false}))||!flatWalkable(floor,front.x,front.z,.36,{furniture:false})))return false;
 // Wall-fitted furniture can meet a corridor's enclosing wall. Reserve the
 // full walking width without extending the extra buffer through masonry.
 for(const c of floor.corridors)for(let i=1;i<c.points.length;i++)if(nearSegment(item,c.points[i-1],c.points[i],c.width/2+(wallStorage||wallBed?0:.20)))return false;
 for(const door of floor.doorways){
  if(fitted){
   // Reserve the full opening and a player-width approach, even beside a
   // canted wall. The compact shelves keep the same collision checks.
   const approach={x:door.x,z:door.z,width:door.width+.30,depth:1.20,rotation:Math.atan2(-door.dz,door.dx)};
   if(overlaps(item,approach,.18))return false;
  }else if(furnitureContains(item,door.x,door.z,wallBed?door.width/2+.34:1.35))return false;
  // Dormitory entrance gaps and end aisles connect to the middle aisle.
  if(!room.bedRows&&!room.bedPositions&&door.roomId===room.id&&nearSegment(item,[door.x,door.z],room.label,fitted?.45:.75))return false;
 }
 for(const exit of floor.exits)if(furnitureContains(item,exit.inside.x,exit.inside.z,1.8))return false;
 for(const shaft of floor.shafts){const b={x:(shaft.minX+shaft.maxX)/2,z:(shaft.minZ+shaft.maxZ)/2,width:shaft.maxX-shaft.minX,depth:shaft.maxZ-shaft.minZ,rotation:0};if(overlaps(item,b,.85))return false;}
 // Leave the complete window sill, reveal and viewing space free.
 // Owner-directed dormitory rows put their headboards against the wall,
 // including beneath windows, rather than reserving a route behind them.
 // A low cell mattress stays below the sill; retain 30cm beside the window
 // wall instead of the standing/viewing strip used by tall furnishings.
 if(!wallBed&&windows.some(([x,z])=>furnitureContains(item,x,z,item.kind==='cellMattress'?.30:.85)))return false;
 return true;
}
function wallCandidates(room,kind,floor,model=FURNITURE_CATALOG[kind]){
 const fitted=['bookroom','library','paddedCell'].includes(room.purpose),wallStorage=['cupboard','bookcase'].includes(kind),out=[];
 let walls=room.points.map((a,i)=>({a,b:room.points[(i+1)%room.points.length]}));
 if(fitted||wallStorage){
  // Room envelopes are rectangular at the window bays. Fit to the actual
  // masonry, including the two diagonal cheeks, instead of that envelope.
  const min=[0,1].map(axis=>Math.min(...room.points.map(p=>p[axis]))),max=[0,1].map(axis=>Math.max(...room.points.map(p=>p[axis])));
  walls=floor.walls.flatMap(w=>{
   let start=0,end=1;
   for(const axis of [0,1]){
    const d=w.b[axis]-w.a[axis];
    if(Math.abs(d)<1e-8){if(w.a[axis]<min[axis]-.1||w.a[axis]>max[axis]+.1)return [];}
    else {const t=[(min[axis]-.1-w.a[axis])/d,(max[axis]+.1-w.a[axis])/d];start=Math.max(start,Math.min(...t));end=Math.min(end,Math.max(...t));}
   }
   if(end<=start)return [];
   const at=t=>w.a.map((v,axis)=>v+(w.b[axis]-v)*t);return [{a:at(start),b:at(end)}];
  });
 }
 for(const [edge,{a,b}] of walls.entries()){
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(length<model.width+(fitted?.36:.6))continue;
  let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  if(!insidePolygon((a[0]+b[0])/2+nx*.2,(a[1]+b[1])/2+nz*.2,room.points)){nx=-nx;nz=-nz;}
  const spacing=Math.max(model.width+(fitted?.16:.55),.85),n=Math.max(1,Math.floor((length-(fitted?.36:.5))/spacing));
  for(let i=0;i<n;i++){
   const t=(i+.5)/n,inset=model.depth/2+(wallStorage?.09:fitted?.35:.40);
   out.push({x:a[0]+(b[0]-a[0])*t+nx*inset,z:a[1]+(b[1]-a[1])*t+nz*inset,rotation:Math.atan2(nx,nz),edge});
  }
  // Enlarged storage needs positions between the grid's window/door cuts.
  if(kind==='cupboard'||kind==='bookcase'||kind==='cellMattress')for(let along=model.width/2+(fitted?.18:.30);along<=length-model.width/2-(fitted?.18:.30);along+=.10){
   const t=along/length,inset=model.depth/2+(kind==='cellMattress'?.35:.09);
   out.push({x:a[0]+(b[0]-a[0])*t+nx*inset,z:a[1]+(b[1]-a[1])*t+nz*inset,rotation:Math.atan2(nx,nz),edge});
  }
 }
 return out;
}
function placeRoom(floor,room,purpose,seed,windows){
 const placed=[],random=furnishingRandom(roomSeed(seed,floor.id,room.id)),fixed=[...purpose.fixed];
 if(room.bedRows||room.bedPositions){
  const additional=(room.bedPositions?.length??room.bedRows.reduce((count,row)=>count+row.count,0))-fixed.filter(kind=>kind==='bed').length;
  if(additional<0)throw Error(`Dormitory plan has fewer beds than its room use: ${floor.id} ${room.id}`);
  fixed.push(...Array(additional).fill('bed'));
 }
 const door=floor.doorways.find(d=>d.roomId===room.id);
 const bedPositions=room.bedPositions??(room.bedRows??[]).flatMap((row,rowIndex)=>{
  const [a,b]=row.wall,length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  if(!insidePolygon((a[0]+b[0])/2+nx*.2,(a[1]+b[1])/2+nz*.2,room.points)){nx=-nx;nz=-nz;}
  const model=FURNITURE_CATALOG.bed,inset=model.depth/2+row.clearance,ends=Array.isArray(row.endClearance)?row.endClearance:[row.endClearance,row.endClearance];
  const start=model.width/2+ends[0],end=length-model.width/2-ends[1];
  const slots=row.slots??row.count;
  const positions=Array.from({length:slots},(_,index)=>{
   const along=slots===1?(start+end)/2:start+(end-start)*index/(slots-1),t=along/length;
   return {x:a[0]+(b[0]-a[0])*t+nx*inset,z:a[1]+(b[1]-a[1])*t+nz*inset,rotation:Math.atan2(nx,nz),bedRow:rowIndex,bedSlot:index};
  }).filter(p=>!(row.omittedSlots??[]).includes(p.bedSlot));
  if(positions.length!==row.count)throw Error(`Dormitory row count differs from its plan: ${floor.id} ${room.id} ${rowIndex}`);
  return positions;
 });
 if((room.bedRows||room.bedPositions)&&bedPositions.length!==fixed.filter(kind=>kind==='bed').length)throw Error(`Dormitory bed count differs from its plan: ${floor.id} ${room.id}`);
 let bedIndex=0;
 function place(kind,variable,index){
  // Fitted bay cases keep their smaller proportions and follow the shared
  // bookcase scale on every axis, including walking footprints.
  const model=['bookroom','library'].includes(room.purpose)&&kind==='bookcase'?{...FURNITURE_CATALOG[kind],width:FURNITURE_CATALOG[kind].width*1.05/1.25,depth:FURNITURE_CATALOG[kind].depth*.28/.38,stocked:true}:FURNITURE_CATALOG[kind],id=`${floor.id}:${room.id}:${variable?'variable':'fixed'}:${index}`;
  if(model.decorative){
   const supports=placed.filter(p=>['table','cupboard'].includes(p.kind)&&p.width>=model.width+.12&&p.depth>=model.depth+.12);
   if(!supports.length)return false;
   const support=supports[Math.floor(random()*supports.length)],u=variable?(random()-.5)*(support.width-model.width-.12):0,c=Math.cos(support.rotation),s=Math.sin(support.rotation);
   const item={...model,id,kind,roomId:room.id,variable,x:support.x+c*u,z:support.z-s*u,rotation:support.rotation+(variable?(random()-.5)*.16:0),y:support.y+support.height+.008,supportId:support.id};
   if(placed.some(p=>blocksFurnitureFront(item,p)))return false;
   placed.push(item);return true;
  }
  const plannedBed=kind==='bed'&&bedPositions.length>0;
  let candidates=plannedBed?[bedPositions[bedIndex++]]:wallCandidates(room,kind,floor,model);
  if(plannedBed&&!candidates[0])throw Error(`Dormitory bed position missing: ${floor.id} ${room.id} ${index}`);
  // Large reading rooms can reserve central table positions in their plan.
  // They still pass the same full footprint, door and circulation checks.
  const centralTables=kind==='table'?(room.tablePositions??[]).map(([x,z])=>({x,z,rotation:0})):[];
  candidates.sort((a,b)=>{
   // Fit both cheeks of the narrow library bay before its flat end wall
   // consumes their front access now that the cases sit against masonry.
   if(room.purpose==='bookroom'&&room.id==='R31'){
    const diagonal=p=>Math.abs(Math.sin(p.rotation))>.5&&Math.abs(Math.cos(p.rotation))>.5;
    const difference=Number(diagonal(b))-Number(diagonal(a));if(difference)return difference;
   }
   if(room.purpose==='bookroom'){
    // Fill long walls before a corner case can block several neighbouring
    // shelves' access strips; the narrow bay's cheeks take priority above.
    const span=[0,1].map(axis=>Math.max(...room.points.map(p=>p[axis]))-Math.min(...room.points.map(p=>p[axis])));
    const frontage=p=>Math.abs(Math.cos(p.rotation))*span[0]+Math.abs(Math.sin(p.rotation))*span[1];
    const difference=frontage(b)-frontage(a);if(Math.abs(difference)>1e-6)return difference;
   }
   const score=p=>door?Math.hypot(p.x-door.x,p.z-door.z):Math.hypot(p.x-room.label[0],p.z-room.label[1]);
   return score(b)-score(a)||a.edge-b.edge;
  });
  candidates=[...centralTables,...candidates];
  if(['ward','centralDormitory','bedroom','staffBedroom'].includes(room.purpose)&&kind==='bench'){
   const bedside=placed.filter(p=>p.kind==='bed').flatMap(bed=>[-1,1].map(side=>{
    const c=Math.cos(bed.rotation),s=Math.sin(bed.rotation),u=side*((bed.width+model.width)/2+.22),v=.20;
    return {x:bed.x+c*u+s*v,z:bed.z-s*u+c*v,rotation:bed.rotation};
   }));
   candidates=[...bedside,...candidates];
  }
  if(kind==='chair'){
   const seats=placed.filter(p=>p.kind==='table').flatMap(table=>[-1,1].map(side=>{
    const u=side*(model.width+.24)/2;
    const c=Math.cos(table.rotation),s=Math.sin(table.rotation),v=table.depth/2+model.depth/2+.24;
    return {x:table.x+c*u+s*v,z:table.z-s*u+c*v,rotation:table.rotation+Math.PI};
   }));
   candidates=[...seats,...candidates];
  }
  if(variable){for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}}
  for(const point of candidates){
   const item={...model,...point,id,kind,roomId:room.id,variable,y:kind==='cellMattress'?.018:.008,rotation:point.rotation+(variable?(random()-.5)*.24:0)};
   if(clearPlacement(floor,room,item,placed,windows)){placed.push(item);return true;}
  }
  if(plannedBed)throw Error(`Dormitory bed has no clear placement: ${floor.id} ${room.id} ${index}`);
  return false;
 }
 // Allocate access to shelves/cabinets before fitting the other furniture.
 // Fit every planned bed before seats/storage can consume its row slots.
 // Keep original indices so their stable placement IDs remain unchanged.
 const priority=kind=>['bookcase','apothecary'].includes(kind)?2:(room.bedRows||room.bedPositions)&&kind==='bed'?1:0;
 const order=fixed.map((kind,i)=>i).sort((a,b)=>priority(fixed[b])-priority(fixed[a]));
 for(const i of order){
  const kind=fixed[i],success=place(kind,false,i);
  if(!success&&FURNITURE_CATALOG[kind].procedural&&kind!=='cupboard')throw Error(`Medical furnishing has no clear placement: ${floor.id} ${room.id} ${kind}`);
 }
 // Extra ward beds do not request extra loose chairs or seats.
 const looseBase=placed.length-(room.bedPositions?bedPositions.length-purpose.fixed.filter(kind=>kind==='bed').length:0);
 const count=Math.max(0,Math.round(looseBase/3));
 for(let i=0;i<count;i++){
  const options=[...purpose.variable];const first=Math.floor(random()*options.length);
  for(let j=0;j<options.length;j++)if(place(options[(first+j)%options.length],true,i))break;
 }
 return placed;
}
export function furnishAsylum(floors,{seed=1829}={}){
 for(const floor of floors){
  floor.architectureCells??=floor.cells.slice();floor.architectureSpawns??=floor.safeSpawns.slice();
  floor.furnitureObstacles=[];floor.furnitureIndex=null;floor.furnitureSeed=seed>>>0;
  const windows=windowPoints(floor);floor.furniture=[];
  for(const room of floor.rooms){
   const use=ROOM_USES[floor.id]?.[room.id];if(!use)throw Error(`Room use missing: ${floor.id} ${room.id}`);
   const purpose=ROOM_PURPOSES[use];room.purpose=use;room.name=purpose.name;
   if(use==='privy'||use==='sewing'){
    const fixtures=use==='privy'?sanitaryFurnishings(floor,room):sewingFurnishings(floor,room,FURNITURE_CATALOG),placed=[];
    for(const item of fixtures){
     if(!item.decorative&&!clearPlacement(floor,room,item,placed,windows))throw Error(`Room furnishing has no clear placement: ${item.id}`);
     placed.push(item);
    }
    floor.furniture.push(...placed);
   }else floor.furniture.push(...placeRoom(floor,room,purpose,seed,windows));
  }
  // Reception is open circulation rather than an enclosed numbered room.
  // A central desk faces the entrance; side passages leave R24 accessible.
  floor.furnishingAreas=[];
  if(floor.id===0){
   const hall={id:'Reception',name:'Reception entrance hall',purpose:'reception',label:[0,17.5],points:[[-7.1,9.4],[7.1,9.4],[7.1,19.6],[-7.1,19.6]]};
   floor.furnishingAreas.push(hall);
   // Reduce the desk's distance to the back wall by 30%, keeping its clerk
   // chair and supported accessories together.
   const deskZ=14.50-(14.50-hall.points[0][1])*.30;
   const fixed=[
    ['receptionDesk',0,deskZ,0],
    ['chair',0,deskZ-1.40,0],
    ['waitingBench',-7.01+FURNITURE_CATALOG.waitingBench.depth/2,11.65,Math.PI/2],
    ['waitingBench',7.01-FURNITURE_CATALOG.waitingBench.depth/2,17.00,-Math.PI/2],
    ['longcaseClock',-7.01+FURNITURE_CATALOG.longcaseClock.depth/2,17.25,Math.PI/2],
    ['keyCupboard',7.00-FURNITURE_CATALOG.keyCupboard.depth/2,11.15,-Math.PI/2,1.30],
    ['rulesNotice',-7.00+FURNITURE_CATALOG.rulesNotice.depth/2,14.15,Math.PI/2,1.28],
    ['clerkSet',0,deskZ,0,FURNITURE_CATALOG.receptionDesk.height+.016]
   ];
   for(const [index,[kind,x,z,rotation,y=.008]] of fixed.entries()){
    const item={...FURNITURE_CATALOG[kind],id:`0:Reception:fixed:${index}`,kind,roomId:hall.id,variable:false,x,z,rotation,y};
    if(kind==='chair')for(const dimension of ['width','depth','height'])item[dimension]*=RECEPTION_FURNITURE_SCALE;
    if(kind==='clerkSet')item.supportId='0:Reception:fixed:0';
    if(!item.decorative&&!clearPlacement(floor,hall,item,floor.furniture,windows))throw Error(`Reception furnishing has no clear placement: ${kind}`);
    floor.furniture.push(item);
   }
   // The old arrival position is now inside the requested central desk.
   floor.spawn={...floor.spawn,x:0,z:17.5/floor.cellSize,yaw:0};
  }
  const halls=hallFurnishings(floor,FURNITURE_CATALOG);
  floor.furnishingAreas.push(...halls.areas);
  for(const item of halls.items){
   const area=halls.areas.find(a=>a.id===item.roomId);
   if(!item.decorative&&!clearPlacement(floor,area,item,floor.furniture,windows))throw Error(`Hall furnishing has no clear placement: ${item.id} ${item.kind}`);
   floor.furniture.push(item);
  }
  floor.furnitureObstacles=floor.furniture.filter(item=>!FURNITURE_CATALOG[item.kind].decorative);indexFurniture(floor);
  floor.cells=floor.architectureCells.slice();
  for(let z=0;z<floor.height;z++)for(let x=0;x<floor.width;x++){
   const i=z*floor.width+x;if(floor.cells[i]&&furnitureBlocks(floor,floor.origin.x+x*floor.cellSize,floor.origin.z+z*floor.cellSize,.36))floor.cells[i]=0;
  }
  floor.safeSpawns=floor.architectureSpawns.filter(p=>flatWalkable(floor,p.x,p.z,.5));
 }
 return floors;
}
