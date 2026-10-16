import {moveAsylumActor,flatWalkable,insidePolygon,segmentDistance} from './asylum-layout.mjs';
import {stairOpenings,stairConnection,stairFlights,stairShape,stairLandingPolygons,stairRoute,STAIR_WIDTH,RAIL_HEIGHT,STAIR_SLAB_THICKNESS} from './asylum-stairs.mjs';
import {furnitureBlocks} from './furniture-collision.mjs';
import {roomDoorsBlock} from './asylum-doors.mjs';
import {JUMP_SPEED,GRAVITY} from './jump.mjs';

// Slab openings follow each connection's current flight footprint.
// Slabs and doorway headers limit headroom, including in the lower basement.
export function asylumJumpCeiling(floors,actor){
 let ceiling=Infinity;
 for(const floor of floors){
  for(const [dx,dz] of [[0,0],[-.27,-.27],[.27,-.27],[-.27,.27],[.27,.27]]){
   const x=actor.x+dx,z=actor.z+dz;
   if(!floor.outline.loops.some(loop=>insidePolygon(x,z,loop)))continue;
   for(const [y,end] of [[floor.elevation-.2,1],[floor.elevation+(floor.id===2?2.9:3.8),0]]){
    if(y<=actor.y+.1)continue;
    const open=floor.stairs.some(stair=>stairOpenings(stair,floor.id,!end).some(b=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ));
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

export function createAsylumJump(floors,{allowMove=()=>true}={}){
 const radius=.34,bodyHeight=1.8,epsilon=.025;
 // Keep absolute feet height in the air: crossing a rail must not snap the
 // jump to a different flight or carry the takeoff floor into an open shaft.
 const flights=floors.flatMap(floor=>floor.stairs.flatMap(source=>source.connections.filter(([a])=>a===floor.id).map(([lower,upper])=>{
  const stair=stairConnection(source,lower,upper),lo=floors[lower].elevation,hi=floors[upper].elevation,s=stairShape(stair);
  const polygons=stairLandingPolygons(stair);
  return {id:stair.id,lower,upper,route:stairRoute(source,lo,hi,lower,upper),runs:stairFlights(stair,lo,hi),
   decks:polygons.length?polygons.map((points,i)=>({points,y:i?hi:(lo+hi)/2})):stair.straightFlight?[]:
    [{points:[[s.minX,s.back],[s.maxX,s.back],[s.maxX,s.maxZ],[s.minX,s.maxZ]],y:(lo+hi)/2}]};
 })));
 const openings=floors.map(floor=>floor.stairs.flatMap(stair=>stairOpenings(stair,floor.id,false)));
 const probes=[[0,0],[-.27,-.27],[.27,-.27],[-.27,.27],[.27,.27]];
 const contains=(floor,x,z)=>floor.outline.loops.some(loop=>insidePolygon(x,z,loop));
 function solidsAt(x,z){
  const solids=[];
  for(const floor of floors)if(probes.some(([dx,dz])=>contains(floor,x+dx,z+dz)&&!openings[floor.id].some(b=>x+dx>b.minX&&x+dx<b.maxX&&z+dz>b.minZ&&z+dz<b.maxZ)))
   solids.push({bottom:floor.elevation-.2,y:floor.elevation,floor:floor.id,stair:null});
  for(const flight of flights){
   for(const [a,b] of flight.runs){
    const dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),t=((x-a[0])*dx+(z-a[2])*dz)/(length*length);
    if(t<0||t>1||Math.abs((x-a[0])*dz-(z-a[2])*dx)>length*STAIR_WIDTH/2)continue;
    const y=a[1]+(b[1]-a[1])*t;
    solids.push({bottom:y-STAIR_SLAB_THICKNESS,y,floor:flight.lower,stair:flight});
   }
   for(const deck of flight.decks)if(insidePolygon(x,z,deck.points))solids.push({bottom:deck.y-STAIR_SLAB_THICKNESS,y:deck.y,floor:flight.lower,stair:flight});
  }
  for(const floor of floors)for(const rail of floor.stairRails)for(let i=1;i<rail.length;i++){
   const a=rail[i-1],b=rail[i],dx=b[0]-a[0],dz=b[2]-a[2],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz||1)));
   if(Math.hypot(x-a[0]-dx*t,z-a[2]-dz*t)>=radius+.04)continue;
   const base=floor.elevation+a[1]+(b[1]-a[1])*t;
   solids.push({bottom:base-.16,y:base+RAIL_HEIGHT+.035,floor:floor.id,rail:true});
  }
  return solids;
 }
 function supportAt(x,z,y){return solidsAt(x,z).filter(s=>s.y<=y+epsilon).sort((a,b)=>b.y-a.y)[0];}
 function ceilingAt(actor){
  let ceiling=asylumJumpCeiling(floors,actor);
  for(const solid of solidsAt(actor.x,actor.z))if(solid.bottom>=actor.y+bodyHeight-epsilon)ceiling=Math.min(ceiling,solid.bottom);
  return ceiling;
 }
 function clear(actor){
  if(!probes.every(([dx,dz])=>floors.some(floor=>contains(floor,actor.x+dx,actor.z+dz))))return false;
  for(const floor of floors){
   if(floor.stairWells.some(w=>actor.y+bodyHeight>w.bottom&&actor.y<w.top&&actor.x>w.minX-radius&&actor.x<w.maxX+radius&&actor.z>w.minZ-radius&&actor.z<w.maxZ+radius))return false;
   if(actor.y+bodyHeight<=floor.elevation||actor.y>=floor.elevation+(floor.id===2?2.9:3.8))continue;
   const nearby=floor.wallIndex?.get(Math.floor(actor.x/4)+','+Math.floor(actor.z/4))??floor.walls;
   if(nearby.some(w=>segmentDistance(actor.x,actor.z,w.a,w.b)<radius+.09)||roomDoorsBlock(floor,actor.x,actor.z,radius)||furnitureBlocks(floor,actor.x,actor.z,radius))return false;
  }
  return actor.y+bodyHeight<=asylumJumpCeiling(floors,actor)+.001&&!solidsAt(actor.x,actor.z).some(s=>s.y>actor.y+epsilon&&s.bottom<actor.y+bodyHeight-.01);
 }
 function onSupport(actor,support){
  actor.floor=support.floor;
  // A perched rail retains the last flight until the player steps off it.
  if(!support.rail)actor.stair=support.stair;
 }
 let velocity=0,airborne=false,free=false;
 return {
  get airborne(){return airborne;},
  reset(){velocity=0;airborne=false;free=false;},
  start(){if(airborne)return false;free=airborne=true;velocity=JUMP_SPEED;return true;},
  update(actor,dx,dz,dt){
   if(!free){const next={...actor};moveAsylumActor(floors,next,dx,dz);if(allowMove(actor,next))Object.assign(actor,next);return;}
   if(dt<=0)return;
   const duration=Math.min(dt,.1),count=Math.max(1,Math.ceil(duration*120),Math.ceil(Math.hypot(dx,dz)/.08)),step=duration/count;
   for(let i=0;i<count;i++){
    if(airborne){
     const next={...actor,y:actor.y+velocity*step-GRAVITY*step*step/2};velocity-=GRAVITY*step;
     let landing;
     if(next.y>actor.y){const limit=ceilingAt(actor)-bodyHeight;if(next.y>limit){next.y=Math.max(actor.y,limit);velocity=0;}}
     else{landing=supportAt(actor.x,actor.z,actor.y);if(landing&&next.y<=landing.y){next.y=landing.y;onSupport(next,landing);}else landing=null;}
     if(allowMove(actor,next)){Object.assign(actor,next);if(landing){velocity=0;airborne=false;}}
     else velocity=0;
    }
    for(const [sx,sz] of [[dx/count,0],[0,dz/count]]){
     if(!sx&&!sz)continue;
     const next={...actor,x:actor.x+sx,z:actor.z+sz};
     const support=supportAt(next.x,next.z,next.y+(airborne?0:.2));
     if(!airborne&&support&&support.y>=actor.y-.2){next.y=support.y;onSupport(next,support);}
     if(clear(next)&&allowMove(actor,next))Object.assign(actor,next);
    }
    const support=supportAt(actor.x,actor.z,actor.y);
    // Keep the two connected storeys lit while falling towards a flight.
    if(airborne&&support?.stair)actor.stair=support.stair;
    if(!airborne&&(!support||support.y<actor.y-epsilon)){airborne=true;velocity=0;}
    // Return ordinary floor walking to the shared navigation controller.
    // Continue physical support on flights/rails so landing near an edge
    // cannot strand the player outside the narrower walking route.
    if(!airborne&&support&&!support.stair&&!support.rail&&flatWalkable(floors[support.floor],actor.x,actor.z))free=false;
    if(!airborne&&support?.stair){
     const probe={...actor};moveAsylumActor(floors,probe,.000001,0);
     if(probe.x>actor.x&&Math.abs(probe.y-actor.y)<epsilon)free=false;
    }
   }
  }
 };
}
