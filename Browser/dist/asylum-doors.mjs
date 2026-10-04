import {asylumWallFootprints} from './asylum-wall-geometry.mjs';
import {ROOM_USES} from './asylum-room-uses.mjs';

const radians=Math.PI/180;
export const ROOM_DOOR_THICKNESS=.06;
export const ROOM_DOOR_HANDLE_DEPTH=.16;
export const ROOM_DOOR_FRAME_CASING_DEPTH=.054;
export const ROOM_DOOR_HINGE_RADIUS=.0175;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
function distance(p,a,b){
 const v=[b[0]-a[0],b[1]-a[1]],t=Math.max(0,Math.min(1,dot([p[0]-a[0],p[1]-a[1]],v)/(dot(v,v)||1)));
 return Math.hypot(p[0]-a[0]-v[0]*t,p[1]-a[1]-v[1]*t);
}
function inside(p,points){
 let result=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[i],b=points[j];
  if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])result=!result;
 }
 return result;
}
function randomAngle(floor,id){
 let n=1829^Math.imul(floor+1,2654435761);
 for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619);
 n^=n>>>16;n=Math.imul(n,2246822507);n^=n>>>13;
 return 100+(n>>>0)/4294967296*30;
}
export function doorRectangle(item){
 const c=Math.cos(item.rotation),s=Math.sin(item.rotation);
 return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>[item.x+c*u*item.width/2+s*v*item.depth/2,item.z-s*u*item.width/2+c*v*item.depth/2]);
}
export function doorPolygonsOverlap(a,b){
 for(const polygon of [a,b])for(let i=0;i<polygon.length;i++){
  const p=polygon[i],q=polygon[(i+1)%polygon.length],axis=[p[1]-q[1],q[0]-p[0]],aa=a.map(p=>dot(p,axis)),bb=b.map(p=>dot(p,axis));
  if(Math.min(...aa)>=Math.max(...bb)-1e-9||Math.min(...bb)>=Math.max(...aa)-1e-9)return false;
 }
 return true;
}
export function roomDoorPose(door,angle=door.openAngle){
 // Closed points from the hinge across the aperture. Positive opening always
 // swings into this room; 180 reverses that tangent along the hinge-side wall.
 const c=Math.cos(angle*radians),s=Math.sin(angle*radians),tx=-door.hingeSide*door.dx*c-door.dz*door.roomSide*s,tz=-door.hingeSide*door.dz*c+door.dx*door.roomSide*s;
 // The pin sits on the room-facing corner of the leaf, so the timber clears
 // the casing throughout its swing while the fixed hinge plate stays put.
 const hingeFace=-door.hingeSide*door.roomSide,offset=hingeFace*door.depth/2;
 return {...door,x:door.hingeX+tx*door.width/2+tz*offset,z:door.hingeZ+tz*door.width/2-tx*offset,rotation:-Math.atan2(tz,tx),tx,tz};
}
export function roomDoorHandle(door){
 return {...door,x:door.x+door.tx*(door.width/2-.18),z:door.z+door.tz*(door.width/2-.18),width:.065,depth:ROOM_DOOR_HANDLE_DEPTH};
}
export function roomDoorPanels(door){
 return {...door,width:door.width-.28,depth:door.depth+.016};
}
export function roomDoorHandlePlate(door){
 return {...roomDoorHandle(door),width:.07,depth:door.depth+.048};
}
export function roomDoorContains(door,x,z,radius=0){
 const c=Math.cos(door.rotation),s=Math.sin(door.rotation),dx=x-door.x,dz=z-door.z;
 const u=Math.max(0,Math.abs(c*dx-s*dz)-door.width/2),v=Math.max(0,Math.abs(s*dx+c*dz)-door.depth/2);
 return u*u+v*v<=radius*radius;
}
export function roomDoorsBlock(floor,x,z,radius){
 return (floor.roomDoorIndex?.get(Math.floor(x/4)+','+Math.floor(z/4))??floor.roomDoors??[]).some(d=>[d,roomDoorPanels(d),roomDoorHandle(d),roomDoorHandlePlate(d)].some(p=>roomDoorContains(p,x,z,radius)));
}
export function buildRoomDoors(floor){
 const masonry=asylumWallFootprints(floor.walls),skirting=asylumWallFootprints(floor.walls,{width:.215,endExtension:.012});
 const doors=[];
 for(const opening of floor.doorways){
  // A corridor partition has a surround, but never a leaf. Stair halls and
  // open circulation spaces have no framed room opening in the shared layout.
  const room=floor.rooms.find(r=>r.id===opening.roomId);
  if(!room||['stairs','porch','circulation'].includes(ROOM_USES[floor.id]?.[room.id]))continue;
  const tangent=[opening.dx,opening.dz],normal=[-opening.dz,opening.dx],centre=[opening.x,opening.z];
  const roomSide=['north','east'].includes(room.doorSide)?1:-1,width=opening.width-.16;
  // Use the visible walls, including exterior bay returns that are slightly
  // offset from the proposed room envelope. A perpendicular corridor wall
  // ending at the doorway plane does not extend into this room.
  const roomDepth=Math.max(...room.points.map(p=>dot([p[0]-centre[0],p[1]-centre[1]],normal)*roomSide));
  const perpendicular=floor.walls.flatMap(({a,b})=>{
   const v=[b[0]-a[0],b[1]-a[1]],length=Math.hypot(...v);
   if(length<1e-7||Math.abs(dot(v,tangent))/length>1e-6)return [];
   const av=dot([a[0]-centre[0],a[1]-centre[1]],normal)*roomSide,bv=dot([b[0]-centre[0],b[1]-centre[1]],normal)*roomSide;
   const lo=Math.max(.02,Math.min(av,bv)),hi=Math.min(roomDepth,Math.max(av,bv));if(hi<=lo)return [];
   const t=((lo+hi)/2-av)/(bv-av),p=[a[0]+v[0]*t,a[1]+v[1]*t];
   return [-1,1].some(side=>inside(p.map((n,i)=>n+tangent[i]*side*.15),room.points))?[{a,b}]:[];
  });
  const hingeDistances=[-1,1].map(side=>{
   const p=centre.map((v,i)=>v+tangent[i]*side*width/2);
   return Math.min(...perpendicular.filter(w=>dot([w.a[0]-centre[0],w.a[1]-centre[1]],tangent)*side>0).map(w=>distance(p,w.a,w.b)));
  });
  const hingeSide=hingeDistances[0]<=hingeDistances[1]+1e-7?-1:1;
  const hingeOffset=opening.depth/2+ROOM_DOOR_FRAME_CASING_DEPTH+ROOM_DOOR_HINGE_RADIUS;
  const door={roomId:room.id,openingX:opening.x,openingZ:opening.z,dx:opening.dx,dz:opening.dz,roomSide,hingeSide,hingeDistances,
   hingeX:opening.x+opening.dx*hingeSide*width/2+normal[0]*roomSide*hingeOffset,
   hingeZ:opening.z+opening.dz*hingeSide*width/2+normal[1]*roomSide*hingeOffset,
   width,depth:ROOM_DOOR_THICKNESS,y:.04,height:opening.height-.125,targetAngle:randomAngle(floor.id,room.id)};
  const nearby=polygons=>polygons.filter(p=>Math.min(...p.map(v=>v[0]))<door.hingeX+width+.5&&Math.max(...p.map(v=>v[0]))>door.hingeX-width-.5&&Math.min(...p.map(v=>v[1]))<door.hingeZ+width+.5&&Math.max(...p.map(v=>v[1]))>door.hingeZ-width-.5);
  const walls=nearby(masonry),skirts=nearby(skirting);
  const blocked=angle=>{
   const pose=roomDoorPose(door,angle),timber=[pose,roomDoorPanels(pose)].map(doorRectangle),hardware=[roomDoorHandle(pose),roomDoorHandlePlate(pose)].map(doorRectangle);
   return skirts.some(w=>timber.some(p=>doorPolygonsOverlap(p,w)))||walls.some(w=>hardware.some(p=>doorPolygonsOverlap(p,w)));
  };
  // Find the first obstruction through the whole swing, including oblique
  // walls. Bisection leaves the timber/handle touching its actual wall face.
  let openAngle=door.targetAngle,wallLimited=false;
  if(blocked(0))throw Error(`Closed room door intersects a wall: ${floor.id} ${room.id}`);
  for(let angle=1;angle<door.targetAngle+1;angle++){
   const end=Math.min(angle,door.targetAngle);if(!blocked(end))continue;
   let low=angle-1,high=end;
   for(let i=0;i<32;i++){const mid=(low+high)/2;if(blocked(mid))high=mid;else low=mid;}
   openAngle=low;wallLimited=true;break;
  }
  doors.push({...roomDoorPose(door,openAngle),openAngle,wallLimited});
 }
 floor.roomDoors=doors;floor.roomDoorIndex=new Map();
 for(const door of doors){
  const extent=door.width/2+.8;
  for(let x=Math.floor((door.x-extent)/4);x<=Math.floor((door.x+extent)/4);x++)for(let z=Math.floor((door.z-extent)/4);z<=Math.floor((door.z+extent)/4);z++){
   const key=x+','+z;if(!floor.roomDoorIndex.has(key))floor.roomDoorIndex.set(key,[]);floor.roomDoorIndex.get(key).push(door);
  }
 }
 return doors;
}
