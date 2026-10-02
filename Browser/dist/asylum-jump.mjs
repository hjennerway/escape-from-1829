import {moveAsylumActor,insidePolygon,segmentDistance} from './asylum-layout.mjs';
import {stairOpening} from './asylum-stairs.mjs';
import {JUMP_SPEED,GRAVITY} from './jump.mjs';

// Keep the reviewed stair routes and banisters while allowing vertical movement.
// Slabs and doorway headers limit headroom, including in the lower basement.
export function asylumJumpCeiling(floors,actor){
 let ceiling=Infinity;
 for(const floor of floors){
  for(const [dx,dz] of [[0,0],[-.27,-.27],[.27,-.27],[-.27,.27],[.27,.27]]){
   const x=actor.x+dx,z=actor.z+dz;
   if(!floor.outline.loops.some(loop=>insidePolygon(x,z,loop)))continue;
   for(const [y,end] of [[floor.elevation-.2,1],[floor.elevation+(floor.id===2?2.9:3.8),0]]){
    if(y<=actor.y+.1)continue;
    const open=floor.stairs.some(stair=>{
     if(!stair.connections.some(pair=>pair[end]===floor.id))return false;
     const b=stairOpening(stair);return x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ;
    });
    if(!open)ceiling=Math.min(ceiling,y);
   }
  }
  for(const door of floor.doorways??[]){
   const a=[door.x-door.dx*door.width/2,door.z-door.dz*door.width/2],b=[door.x+door.dx*door.width/2,door.z+door.dz*door.width/2],y=floor.elevation+door.height;
   if(y>actor.y+.1&&segmentDistance(actor.x,actor.z,a,b)<.34+door.depth/2)ceiling=Math.min(ceiling,y);
  }
  for(const header of floor.exitHeaders??[]){const y=floor.elevation+header.height;if(y>actor.y+.1&&segmentDistance(actor.x,actor.z,header.a,header.b)<.5)ceiling=Math.min(ceiling,y);}
 }
 return ceiling;
}

export function createAsylumJump(floors){
 let offset=0,velocity=0,airborne=false;
 return {
  get airborne(){return airborne;},
  reset(){offset=0;velocity=0;airborne=false;},
  start(){if(airborne)return false;airborne=true;velocity=JUMP_SPEED;return true;},
  update(actor,dx,dz,dt){
   if(!airborne){moveAsylumActor(floors,actor,dx,dz);return;}
   const count=Math.max(1,Math.ceil(Math.min(dt,.1)*120),Math.ceil(Math.hypot(dx,dz)/.08)),step=Math.min(dt,.1)/count;
   for(let i=0;i<count;i++){
    actor.y-=offset;
    const next={...actor};moveAsylumActor(floors,next,dx/count,dz/count);
    if(next.y+offset+1.8<=asylumJumpCeiling(floors,next)+.001)Object.assign(actor,next);
    offset+=velocity*step-GRAVITY*step*step/2;velocity-=GRAVITY*step;
    const limit=Math.max(0,asylumJumpCeiling(floors,actor)-actor.y-1.8);
    if(offset>limit){offset=limit;velocity=Math.min(velocity,0);}
    if(offset<=0){offset=0;velocity=0;airborne=false;}
    actor.y+=offset;
   }
  }
 };
}
