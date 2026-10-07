import {ESCAPE_CORRIDOR_POLYGONS,unionPolygons} from './escape-corridor-plan.mjs';
import {HALE_WARD,HALE_WARD_ROOFS} from './hale-daresbury-huxley-dunham.mjs';
import {wardPlacementOffset} from './ward-placement.mjs';
// Fictional Escape-only fittings. These coordinates never alter the dated estate.
// Retain the original outdoor approaches alongside the gallery. Its walls,
// rather than a fence on the passage edge, enclose the added interior routes.
// Carry the north rail into the ward's spine; runtime trimming joins its
// visible west wall. The old X=105 turn stopped inside the open western court.
const spine=HALE_WARD_ROOFS.find(r=>r.name==='Connecting spine').rect;
const wardJoinX=(spine[0]+spine[2])/2+wardPlacementOffset('haleWard',HALE_WARD).x;
const base=[[-98,66],[-98,-85],[wardJoinX,-85],[wardJoinX,-70],[144,-70],[153.6,-70],[153.6,-132.1],[159,-132.1],[159,-60.3],[180,-60.3],[180,-40.5],[162.3,-40.5],[162.3,-16.6],[159,-16.6],[159,9.8],[153.6,9.8],[153.6,-26.6],[144,-26.6],[144,60],[98,66]];
export const GROUNDS_OUTLINE=unionPolygons([base,...ESCAPE_CORRIDOR_POLYGONS])[0];
export const GROUNDS_GATES={pedestrian:{x:-80,z:-85,width:3},wicket:{x:87,z:-85,width:2.4}};
export const TOOL_STORE={x:147.3,z:-40.2};
export const GROUNDS_BOUNDS=[-132,224,-203,96];
export const GUARD_PATROL=[{x:-80,z:-80},{x:-81,z:-47},{x:-20,z:-48},{x:87,z:-80},{x:-20,z:-48}];
export function crossedGroundsExit(before,after,run){
 if(!before?.outside||!after.outside)return null;
 for(const [id,g] of Object.entries(GROUNDS_GATES)){
  if(!run[id+'Open']||before.z<g.z||after.z>=g.z)continue;
  const t=(g.z-before.z)/(after.z-before.z),x=before.x+(after.x-before.x)*t;
  if(Math.abs(x-g.x)<g.width/2-.25)return id;
 }
 return null;
}

// Sound carries a position, never the player's continuing position.
export function createGroundsGuard({actor,walker,route,sight,patrol=GUARD_PATROL}){
 let mode='patrol',target=null,points=[],index=0,wait=0,memory=0,rethink=0,stuck=0,revision=-1,searchAngle=0;
 const change=(next,point=null)=>{mode=next;target=point&&{x:point.x,z:point.z};points=[];rethink=0;stuck=0;wait=0;};
 function hear(point,radius){
  if(mode==='chase'||Math.hypot(actor.x-point.x,actor.z-point.z)>radius)return false;
  change('investigate',point);return true;
 }
 function update(player,dt,{crouch=false}={}){
  const distance=Math.hypot(actor.x-player.x,actor.z-player.z),heading=actor.heading??0;
  const facing=((player.x-actor.x)*Math.sin(heading)+(player.z-actor.z)*Math.cos(heading))/(distance||1);
  const seen=distance<(crouch?12:27)&&(distance<2.5||facing>.35)&&sight(actor,player);
  if(seen){if(mode!=='chase')change('chase',player);target={x:player.x,z:player.z};memory=5;}
  else if(mode==='chase'){memory-=dt;if(memory<=0){change('investigate',target);}}
  if(mode==='search'){
   wait-=dt;actor.heading=searchAngle+Math.sin((6-wait)*1.2)*1.25;
   if(wait<=0)change('return',patrol[index%patrol.length]);
   return {seen,mode,moved:0};
  }
  if(mode==='patrol'&&wait>0){wait-=dt;return {seen,mode,moved:0};}
  if(!target)target={...patrol[index%patrol.length]};
  if(Math.hypot(actor.x-target.x,actor.z-target.z)<.65){
   if(mode==='investigate'||mode==='chase'&&!seen){change('search');wait=6;searchAngle=actor.heading??0;}
   else if(mode==='return'){change('patrol');}
   else if(mode==='patrol'){index=(index+1)%patrol.length;target=null;points=[];wait=2;}
   return {seen,mode,moved:0};
  }
  rethink-=dt;
  if(revision!==walker.revision){revision=walker.revision;rethink=0;points=[];}
  if(rethink<=0){
   rethink=mode==='chase'?.8:2;
   if(mode==='chase'||!points.length)points=route(walker,actor,target);
   if(!points.length){
    // A closed gate or obstructed sound source cannot trap a patrol forever.
    if(mode==='patrol'||mode==='return'){index=(index+1)%patrol.length;change('patrol');wait=1;}
    else {change('search');wait=6;searchAngle=actor.heading??0;}
   }
  }
  const next=points[0];let moved=0;
  if(next){
   const dx=next.x-actor.x,dz=next.z-actor.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*(mode==='chase'?3.6:mode==='investigate'?2.8:2.2));
   if(d>.001){const x=actor.x,z=actor.z;walker.update(actor,dx/d*step,dz/d*step,dt,{jump:false});moved=Math.hypot(actor.x-x,actor.z-z);actor.heading=Math.atan2(dx,dz);}
   if(d<.15)points.shift();
   stuck=moved<.001?stuck+dt:0;
   if(stuck>2){points=[];rethink=0;stuck=0;if(mode==='patrol'){index++;target=null;}else {change('search');wait=6;searchAngle=actor.heading??0;}}
  }
  return {seen,mode,moved};
 }
 return {hear,update,get mode(){return mode},get target(){return target},get remaining(){return wait},reset(){change('patrol');index=0;memory=0;revision=-1;}};
}
