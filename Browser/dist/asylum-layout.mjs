// The reviewed plan is shared by the drawings, visible walls and navigation.
import {stairRoute,stairOpening,floorStairRails,STAIR_WIDTH,RAIL_HEIGHT} from './asylum-stairs.mjs';
import {joinAsylumWalls} from './asylum-wall-joins.mjs';
export {stairRoute} from './asylum-stairs.mjs';
export function insidePolygon(x,z,points){
 let inside=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[i],b=points[j];
  if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
export function segmentDistance(x,z,a,b){
 const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
 return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
}
const bounds=points=>({minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minZ:Math.min(...points.map(p=>p[1])),maxZ:Math.max(...points.map(p=>p[1]))});
const edges=points=>points.map((p,i)=>[p,points[(i+1)%points.length]]);
export const ROOM_DOOR_WIDTH=1.9;
export const ROOM_DOOR_HEIGHT=2.5;
export function asylumExitCenter(exit){
 const {inset=0,offset=0}=exit.wallOpening??{};
 return {x:exit.worldX+(exit.axis==='z'?offset:-exit.facing*inset),z:exit.worldZ+(exit.axis==='x'?offset:-exit.facing*inset)};
}
function outsideDoorOpening(exit,outsideEdges,floorId){
 // The frame's inner jambs/head define the masonry aperture. Fit its depth
 // to the hosting facade, since exterior door coordinates include setbacks.
 const normal=exit.axis==='x'?0:1,along=1-normal,position=[exit.x,exit.z];
 const hosts=outsideEdges.filter(([a,b])=>Math.abs(a[normal]-b[normal])<1e-7&&position[along]>=Math.min(a[along],b[along])-1e-7&&position[along]<=Math.max(a[along],b[along])+1e-7);
 hosts.sort((a,b)=>Math.abs(a[0][normal]-position[normal])-Math.abs(b[0][normal]-position[normal]));
 const inset=hosts.length?(position[normal]-hosts[0][0][normal])*exit.facing:0;
 const entrance=floorId===0&&exit.id==='D1';
 // Include the lintel ends (.91), adjoining masonry's half-thickness (.09)
 // and a .02 clearance. Shift the complete fitting along its own wall,
 // leaving the exterior destination and interaction coordinates intact.
 const margin=1.02,host=hosts[0];
 const offset=host&&!entrance?Math.max(Math.min(host[0][along],host[1][along])+margin,Math.min(Math.max(host[0][along],host[1][along])-margin,position[along]))-position[along]:0;
 return {width:entrance?1.9:1.58,height:entrance?3.6:2.465,inset,offset,...exit.wallOpening};
}
export function flatWalkable(floor,x,z,radius=.34){
 const contains=(x,z)=>floor.outline.loops.some(p=>insidePolygon(x,z,p));
 if(![[0,0],[-radius,-radius],[radius,-radius],[-radius,radius],[radius,radius]].every(([dx,dz])=>contains(x+dx,z+dz)))return false;
 for(const shaft of floor.shafts){if(x>shaft.minX-radius&&x<shaft.maxX+radius&&z>shaft.minZ-radius&&z<shaft.maxZ+radius)return false;}
 const nearby=floor.wallIndex?.get(Math.floor(x/4)+','+Math.floor(z/4))??floor.walls;
 return !nearby.some(w=>segmentDistance(x,z,w.a,w.b)<radius+.09);
}
export function stairDeparture(floor,portal){
 const [x,,z]=portal;
 // Leave the flight's narrow endpoint radius. An enclosed landing may need
 // a sideways turn instead of the usual straight step toward the room.
 const departure=[{x,z:z-.8},{x:x+.5,z},{x:x-.5,z}].find(p=>flatWalkable(floor,p.x,p.z));
 if(!departure)throw new Error(`No clear stair landing on floor ${floor.id} at ${x},${z}`);
 return departure;
}
export function buildAsylumLayout(plan){
 const floors=plan.floors.map(f=>{
  const rooms=plan.rooms.filter(r=>r.floors.includes(f.id)).map(r=>({...r,...r.variants?.[f.id],x:r.label[0]/.5,z:r.label[1]/.5}));
  const corridors=plan.corridors.filter(c=>c.floors.includes(f.id)).map(c=>({...c,...c.variants?.[f.id]}));
  const stairs=plan.stairs.filter(s=>s.floors.includes(f.id)).map(s=>({...s,physical:true,x:s.label[0]/.5,z:s.label[1]/.5}));
  const outsideEdges=f.outline.loops.flatMap(edges);
  const exits=plan.exits.flatMap(e=>e.levels.filter(l=>l.floor===f.id).map(l=>({...e,wallOpening:outsideDoorOpening(e,outsideEdges,f.id),worldX:e.x,worldZ:e.z,x:e.x/.5,z:e.z/.5,destination:l.destination,threshold:l.height})));
  // The lowest level has a solid floor beneath the stairs, never a false pit.
  // Keep the flight footprint out of flat navigation on every level.
  const shafts=stairs.map(stairOpening);
  const floor={...f,levelElevations:plan.floors.map(f=>f.elevation),geometrySource:'asylum-plan',cellSize:.5,origin:{x:-74,z:-41},width:290,height:172,rooms,corridors,stairs,exits,shafts,walls:[],galleryZ:8.2/.5};
  floor.stairRails=floorStairRails(floor);
  floor.windows=rooms.flatMap(r=>(r.windows??[]).map(w=>({...w,roomId:r.id})));
  const roomDoors=rooms.filter(r=>r.doorSide).map(r=>{const b=bounds(r.points),vertical=['west','east'].includes(r.doorSide);return {roomId:r.id,x:vertical?(r.doorSide==='west'?b.minX:b.maxX):r.door,z:vertical?r.door:(r.doorSide==='north'?b.minZ:b.maxZ),dx:vertical?0:1,dz:vertical?1:0};});
  const pieces=new Map();
  floor.exitHeaders=[];
  function addWall(a,b,exterior=false,corridorClipping=true,solid=false){
   const length=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(length/.22),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;let start=null;
   // Exact jamb cuts also align the overlapping wall planes in the bay rooms.
   // Corridor/stair clipping retains its existing fine samples.
   const doors=exterior?[]:roomDoors.filter(d=>Math.abs(dx*d.dz-dz*d.dx)<1e-6&&Math.abs((d.x-a[0])*dz-(d.z-a[1])*dx)<.95);
   const cuts=Array.from({length:count+1},(_,i)=>length*i/count);
   for(const d of doors)for(const side of [-1,1]){const t=(d.x-a[0])*dx+(d.z-a[1])*dz+side*ROOM_DOOR_WIDTH/2;if(t>0&&t<length)cuts.push(t);}
   // Every outside opening has exact jambs. The cut follows adjoining angled
   // returns too; their headers retain the same wall footprint and finish.
   const fittedExits=exits.filter(e=>segmentDistance(asylumExitCenter(e).x,asylumExitCenter(e).z,a,b)<1.05);
   for(const e of fittedExits)for(const [axis,centre,half] of [[0,asylumExitCenter(e).x,e.axis==='z'?e.wallOpening.width/2:1.05],[1,asylumExitCenter(e).z,e.axis==='x'?e.wallOpening.width/2:1.05]]){
    const direction=axis===0?dx:dz;if(Math.abs(direction)<1e-8)continue;
    for(const side of [-1,1]){const t=(centre+side*half-a[axis])/direction;if(t>0&&t<length)cuts.push(t);}
   }
   cuts.sort((a,b)=>a-b);
   for(let i=cuts.length-1;i>0;i--)if(cuts[i]-cuts[i-1]<1e-7)cuts.splice(i,1);
   for(let i=0;i<cuts.length;i++){
    const t=(cuts[i]+(cuts[i+1]??cuts[i]))/2,x=a[0]+dx*t,z=a[1]+dz*t;
    const at=[a[0]+dx*cuts[i],a[1]+dz*cuts[i]];
    const nearDoor=exits.find(e=>Math.abs(x-asylumExitCenter(e).x)<(e.axis==='z'?e.wallOpening.width/2:1.05)&&Math.abs(z-asylumExitCenter(e).z)<(e.axis==='x'?e.wallOpening.width/2:1.05));
    let keep=i<cuts.length-1&&cuts[i+1]-cuts[i]>1e-7;
    if(!exterior){
     keep=keep&&f.outline.loops.some(p=>insidePolygon(x,z,p))&&!outsideEdges.some(([c,d])=>segmentDistance(x,z,c,d)<.18);
     if(doors.some(d=>Math.abs((x-d.x)*d.dx+(z-d.z)*d.dz)<ROOM_DOOR_WIDTH/2))keep=false;
     // Keep partitions at the corridor edge; the previous extra clearance
     // erased entire room fronts that sit exactly half a corridor-width away.
     if(!solid&&corridorClipping&&corridors.some(c=>c.points.slice(1).some((p,j)=>segmentDistance(x,z,c.points[j],p)<c.width/2-.1)))keep=false;
     if(!solid&&stairs.some(s=>{const b=bounds(s.points);return x>b.minX-.2&&x<b.maxX+.2&&z>b.minZ-.25&&z<b.maxZ+.2;}))keep=false;
    }
    if(keep&&nearDoor){floor.exitHeaders.push({a:at,b:[a[0]+dx*cuts[i+1],a[1]+dz*cuts[i+1]],height:nearDoor.wallOpening.height,exitId:nearDoor.id});keep=false;}
    if(keep&&!start)start=at;
    if(!keep&&start){const key=[...start,...at].map(n=>n.toFixed(2)).join(',');const reverse=[...at,...start].map(n=>n.toFixed(2)).join(',');if(!pieces.has(reverse))pieces.set(key,{a:start,b:at,exterior});start=null;}
   }
  }
  for(const [a,b] of outsideEdges)addWall(a,b,true);
  // Open room edges describe continuous spaces, without a partition or frame.
  // Reviewed corridor boundaries already describe their turns exactly; retain
  // their free ends and doorway piers instead of resampling them by width.
  // Explicit solid edges enclose rooms beside stair landings without general
  // stair/corridor clearance erasing the reviewed boundary.
  for(const r of rooms)for(const [i,[a,b]] of edges(r.points).entries())if(!r.openEdges?.includes(i))addWall(a,b,false,r.corridorClipping!==false,r.solidEdges?.includes(i));
  // Deliberate corridor partitions bypass the room-edge corridor clipping.
  // Their centered openings feed the same rendering, map and collision data.
  const partitionWalls=[],partitionDoors=[];
  for(const partition of (plan.partitions??[]).filter(p=>p.floors.includes(f.id))){
   const [a,b]=partition.points,length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
   const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,width=ROOM_DOOR_WIDTH;
   partitionWalls.push({a,b:[x-dx*width/2,z-dz*width/2],exterior:false},{a:[x+dx*width/2,z+dz*width/2],b,exterior:false});
   partitionDoors.push({partitionId:partition.id,x,z,dx,dz,width,height:ROOM_DOOR_HEIGHT,depth:.18});
  }
  floor.walls=joinAsylumWalls([...pieces.values(),...partitionWalls]);
  floor.doorways=roomDoors.flatMap(d=>{
   const sideWalls=floor.walls.filter(w=>!w.exterior&&Math.abs((w.b[0]-w.a[0])*d.dz-(w.b[1]-w.a[1])*d.dx)<1e-6&&Math.abs((w.a[0]-d.x)*d.dz-(w.a[1]-d.z)*d.dx)<.95);
   const jambs=[-1,1].map(side=>sideWalls.filter(w=>[w.a,w.b].some(p=>Math.abs((p[0]-d.x)*d.dx+(p[1]-d.z)*d.dz-side*ROOM_DOOR_WIDTH/2)<1e-6)));
   // Stair mouths remain full height; do not float a frame across a stair hall.
   if(jambs.some(walls=>!walls.length))return [];
   const offsets=jambs.flat().map(w=>(w.a[0]-d.x)*-d.dz+(w.a[1]-d.z)*d.dx),low=Math.min(...offsets),high=Math.max(...offsets),offset=(low+high)/2;
   return [{...d,x:d.x-d.dz*offset,z:d.z+d.dx*offset,width:ROOM_DOOR_WIDTH,height:ROOM_DOOR_HEIGHT,depth:high-low+.18}];
  });
  floor.doorways.push(...partitionDoors);
  floor.wallIndex=new Map();
  for(const wall of floor.walls){const b=bounds([wall.a,wall.b]);for(let x=Math.floor((b.minX-.7)/4);x<=Math.floor((b.maxX+.7)/4);x++)for(let z=Math.floor((b.minZ-.7)/4);z<=Math.floor((b.maxZ+.7)/4);z++){const key=x+','+z;if(!floor.wallIndex.has(key))floor.wallIndex.set(key,[]);floor.wallIndex.get(key).push(wall);}}
  floor.cells=new Uint8Array(floor.width*floor.height);
  for(let z=0;z<floor.height;z++)for(let x=0;x<floor.width;x++)floor.cells[z*floor.width+x]=+flatWalkable(floor,floor.origin.x+x*.5,floor.origin.z+z*.5,.36);
  for(const exit of exits){
   const dx=exit.axis==='x'?exit.facing:0,dz=exit.axis==='z'?exit.facing:0,preferred=[exit.worldX-dx*.95,exit.worldZ-dz*.95];
   const choices=[];for(let x=preferred[0]-2;x<=preferred[0]+2;x+=.25)for(let z=preferred[1]-2;z<=preferred[1]+2;z+=.25)if(flatWalkable(floor,x,z,.4))choices.push({x,z,d:Math.hypot(x-preferred[0],z-preferred[1])});
   choices.sort((a,b)=>a.d-b.d);exit.inside=choices[0]??{x:preferred[0],z:preferred[1]};
  }
  floor.spawn={x:0,z:14/.5,yaw:0};floor.patrol=corridors.filter(c=>c.id.length<4).map(c=>({x:c.points[0][0]/.5,z:c.points[0][1]/.5})).filter(p=>flatWalkable(floor,p.x*.5,p.z*.5));
  if(!floor.patrol.length)floor.patrol=[{x:-31/.5,z:5/.5}];
  floor.enemies=[{name:'Security',x:35.8/.5,z:-6/.5,type:1},{name:'Deva asylum ghost',x:5.3/.5,z:-28/.5,type:2}];
  floor.safeSpawns=[];
  if(f.id===0){
   const seed=Math.round((14-floor.origin.z)/.5)*floor.width+Math.round(-floor.origin.x/.5),seen=new Uint8Array(floor.cells.length),queue=[seed];seen[seed]=1;
   for(let head=0;head<queue.length;head++){const n=queue[head],x=n%floor.width,z=Math.floor(n/floor.width),wx=floor.origin.x+x*.5,wz=floor.origin.z+z*.5;
    if(x%2===0&&z%2===0&&Math.hypot(wx,wz-14)>12&&flatWalkable(floor,wx,wz,.5)&&!exits.some(e=>Math.hypot(e.worldX-wx,e.worldZ-wz)<3)&&!stairs.some(s=>Math.hypot(s.label[0]-wx,s.label[1]-wz)<4))floor.safeSpawns.push({x:wx,z:wz,floor:0,y:0});
    for(const k of [x>0?n-1:-1,x<floor.width-1?n+1:-1,z>0?n-floor.width:-1,z<floor.height-1?n+floor.width:-1])if(k>=0&&!seen[k]&&floor.cells[k]){seen[k]=1;queue.push(k);}
   }
  }
  return floor;
 });
 return {...floors[0],floors,plan};
}

function onFlight(route,x,z,height){
 let best=null;
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i],dx=b[0]-a[0],dz=b[2]-a[2],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz||1)));
  const distance=Math.hypot(x-a[0]-dx*t,z-a[2]-dz*t),y=a[1]+(b[1]-a[1])*t;
  if(distance<STAIR_WIDTH/2-.34-.04&&Math.abs(y-height)<.38&&(!best||distance<best.distance))best={y,distance};
 }
 return best;
}
export function moveAsylumActor(floors,actor,dx,dz){
 actor.y??=floors[actor.floor].elevation;
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.09));
 function attempt(x,z){
  // Banisters are physical barriers, including the flat landing's well edge.
  for(const floor of floors)for(const rail of floor.stairRails)for(let i=1;i<rail.length;i++){
   const a=rail[i-1],b=rail[i],vx=b[0]-a[0],vz=b[2]-a[2],t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[2])*vz)/(vx*vx+vz*vz))),base=floor.elevation+a[1]+(b[1]-a[1])*t;
   if(actor.y+.65>base-.16&&actor.y+.65<base+RAIL_HEIGHT+.035&&Math.hypot(x-a[0]-vx*t,z-a[2]-vz*t)<.38)return false;
  }
  const current=floors[actor.floor],candidates=actor.stair?[actor.stair]:current.stairs.flatMap(s=>s.connections.filter(([a,b])=>a===actor.floor||b===actor.floor).map(([a,b])=>({id:s.id,lower:a,upper:b,route:stairRoute(s,floors[a].elevation,floors[b].elevation)})));
  for(const flight of candidates){
   const hit=onFlight(flight.route,x,z,actor.y);
   if(hit){actor.x=x;actor.z=z;actor.y=hit.y;actor.stair=flight;return true;}
  }
  if(actor.stair){
   const flight=actor.stair;
   for(const index of [0,flight.route.length-1]){const p=flight.route[index],floor=index===0?flight.lower:flight.upper;
    if(Math.hypot(x-p[0],z-p[2])<1.5&&Math.abs(actor.y-p[1])<.3&&flatWalkable(floors[floor],x,z)){Object.assign(actor,{x,z,y:p[1],floor,stair:null});return true;}
   }
   return false;
  }
  if(flatWalkable(current,x,z)){actor.x=x;actor.z=z;actor.y=current.elevation;return true;}
  return false;
 }
 for(let i=0;i<count;i++){if(dx)attempt(actor.x+dx/count,actor.z);if(dz)attempt(actor.x,actor.z+dz/count);}
}
