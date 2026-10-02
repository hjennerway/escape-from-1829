// Shared jump arc; feet rise 1.69 units in an unobstructed jump.
export const JUMP_SPEED=7.8,GRAVITY=18;

// The index supplies exact padded footprints with their rendered vertical bounds.
// Ground walking remains with each mode's existing stair/terrain controller.
export function createObstacleJump(index,{groundAt,bodyHeight=1.8,withinBounds=()=>true}){
 let airborne=false,perched=false,velocity=0;
 const base=b=>b.minY??-Infinity,top=b=>b.maxY??Infinity;
 function support(x,z,y){
  let height=groundAt(x,z,y);
  for(const b of index.at(x,z))if(top(b)<=y+.025)height=Math.max(height,top(b));
  return height;
 }
 function clear(x,z,y){return withinBounds(x,z)&&groundAt(x,z,y)<=y+.025&&!index.at(x,z).some(b=>top(b)>y+.025&&base(b)<y+bodyHeight-.01);}
 return {
  get airborne(){return airborne;},
  reset(){airborne=false;perched=false;velocity=0;},
  setIndex(next){index=next;},
  start(actor){
   if(airborne||Math.abs(actor.y-support(actor.x,actor.z,actor.y))>.08)return false;
   airborne=true;velocity=JUMP_SPEED;return true;
  },
  update(actor,dx,dz,dt){
   if(!airborne&&!perched)return false;
   if(dt<=0)return true;
   const duration=Math.min(dt,.1),count=Math.max(1,Math.ceil(duration*120),Math.ceil(Math.hypot(dx,dz)/.08)),step=duration/count;
   for(let i=0;i<count;i++){
    if(airborne){
     const previous=actor.y;
     let y=previous+velocity*step-GRAVITY*step*step/2;
     velocity-=GRAVITY*step;
     if(y>previous){
      for(const b of index.at(actor.x,actor.z))if(base(b)>=previous+bodyHeight-.01&&base(b)<y+bodyHeight){y=Math.max(previous,base(b)-bodyHeight);velocity=0;}
     }else{
      const floor=support(actor.x,actor.z,previous);
      if(y<=floor){y=floor;velocity=0;airborne=false;}
     }
     actor.y=y;
    }
    const x=actor.x+dx/count,z=actor.z+dz/count;
    if(dx&&clear(x,actor.z,actor.y))actor.x=x;
    if(dz&&clear(actor.x,z,actor.y))actor.z=z;
    if(!airborne&&support(actor.x,actor.z,actor.y)<actor.y-.025){airborne=true;velocity=0;}
   }
   perched=!airborne&&actor.y>groundAt(actor.x,actor.z,actor.y)+.025;
   return true;
  }
 };
}
