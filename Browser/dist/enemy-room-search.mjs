import {path,walkable} from './core.mjs';
import {insidePolygon,segmentDistance} from './asylum-layout.mjs';

export const ROOM_SEARCH_SECONDS=6;
const SEARCH_COOLDOWN=8;
const contains=(room,actor)=>insidePolygon(actor.x,actor.z,room.points);
const routeLength=(from,route)=>{
 let length=0,previous=from;
 for(const point of route){length+=Math.hypot(point.x-previous.x,point.z-previous.z);previous=point;}
 return length;
};

export function resetEnemyRoomSearch(enemy){
 enemy.roomSearch=null;enemy.roomSearchCooldown=0;
}
function finishSearch(enemy){
 enemy.roomSearch=null;enemy.roomSearchCooldown=SEARCH_COOLDOWN;
 enemy.path=[];enemy.target=null;enemy.memory=0;enemy.rethink=0;
}
function roomDestination(floor,room,door){
 const normal={north:[0,1],south:[0,-1],west:[1,0],east:[-1,0]}[room.doorSide];
 for(const depth of [2.4,3.2,1.8,4])for(const offset of [0,-.5,.5,-1,1]){
  const target={x:door.x+normal[0]*depth+door.dx*offset,z:door.z+normal[1]*depth+door.dz*offset,floor:floor.id,y:floor.elevation};
  if(!contains(room,target)||!walkable(floor,target.x,target.z,.4))continue;
  // Room polygons sometimes include part of a gallery. Wait beyond the
  // actual corridor edge, leaving room for the player's body to pass.
  if(floor.corridors.some(c=>c.points.slice(1).some((p,i)=>segmentDistance(target.x,target.z,c.points[i],p)<c.width/2+.7)))continue;
  return target;
 }
 return null;
}

// Return true while a committed room search owns the NPC's route. Approaching
// along the corridor does not recall it; entering its room still starts a chase.
export function updateEnemyRoomSearch(floors,enemy,player,dt){
 const floor=floors[enemy.floor];
 if(floor.geometrySource!=='asylum-plan')return false;
 enemy.roomSearchCooldown=Math.max(0,(enemy.roomSearchCooldown??0)-dt);
 const search=enemy.roomSearch;
 if(search){
  const room=floor.rooms.find(r=>r.id===search.roomId);
  if(enemy.floor!==search.floor||!room||(player.floor===enemy.floor&&contains(room,player))){finishSearch(enemy);return false;}
  if(search.phase==='enter'){
   search.timeout-=dt;
   if(Math.hypot(enemy.x-search.target.x,enemy.z-search.target.z)<.15){
    enemy.path=[];search.phase='wait';search.remaining=ROOM_SEARCH_SECONDS;
   }else if(search.timeout<=0){finishSearch(enemy);return false;}
  }else{
   search.remaining-=dt;
   if(search.remaining<=0){finishSearch(enemy);return false;}
  }
  return true;
 }
 if(enemy.roomSearchCooldown>0||enemy.rethink>0||enemy.stair||player.stair||player.outside||enemy.floor!==player.floor)return false;
 // A close encounter in the same room must never become a room-search escape.
 if(floor.rooms.some(r=>r.doorSide&&contains(r,enemy)&&contains(r,player)))return false;
 const nearby=floor.doorways.filter(d=>floor.roomDoors.some(r=>r.roomId===d.roomId)).map(door=>({door,room:floor.rooms.find(r=>r.id===door.roomId),distance:Math.hypot(enemy.x-door.x,enemy.z-door.z)})).filter(c=>c.room?.doorSide).sort((a,b)=>a.distance-b.distance);
 if(!nearby.length)return false;
 const playerRoute=path(floor,enemy,player);
 if(!playerRoute.length)return false;
 const playerDistance=routeLength(enemy,playerRoute);
 const frontage=({door,room})=>{const values=room.points.map(p=>p[0]*door.dx+p[1]*door.dz);return Math.max(...values)-Math.min(...values);};
 if(playerDistance<=frontage(nearby[0])+1e-6)return false;
 for(const {door,room,distance} of nearby){
  // One room means the frontage of this room along its corridor, measured
  // against the walkable route to the player rather than through a wall.
  const span=frontage({door,room});
  if(distance>span||contains(room,player))continue;
  const target=roomDestination(floor,room,door);if(!target)continue;
  const route=path(floor,enemy,target),length=routeLength(enemy,route);
  if((!route.length&&Math.hypot(enemy.x-target.x,enemy.z-target.z)>.15)||length>span+4)continue;
  enemy.roomSearch={roomId:room.id,floor:enemy.floor,target,phase:'enter',timeout:length/.55+3};
  enemy.target=target;enemy.memory=0;
  enemy.path=route.map(p=>({...p,floor:enemy.floor,y:floor.elevation}));
  return true;
 }
 return false;
}
