import {flatWalkable,segmentDistance} from './asylum-layout.mjs';
import {doorRectangle} from './asylum-doors.mjs';
import {createCorridorFigure} from './corridor-figure.mjs';

export const SIGHTING_INTERVAL=20;
export const SIGHTING_DISTANCE={min:20,farFraction:.8};
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
function intersection(a,b,c,d){
 const u=[b[0]-a[0],b[1]-a[1]],v=[d[0]-c[0],d[1]-c[1]],den=cross(u,v);
 if(Math.abs(den)<1e-7)return null;
 const w=[c[0]-a[0],c[1]-a[1]],t=cross(w,v)/den,s=cross(w,u)/den;
 return t>=0&&t<=1&&s>=0&&s<=1?[a[0]+t*u[0],a[1]+t*u[1]]:null;
}
const inCorridor=(floor,x,z)=>floor.corridors.some(c=>c.points.slice(1).some((p,i)=>segmentDistance(x,z,c.points[i],p)<c.width/2-.1));
const samples=route=>Array.from({length:25},(_,i)=>route.a.map((v,j)=>v+(route.b[j]-v)*i/24));

// Only real crossing passages qualify. Both ends must be walkable corridor,
// so the figure cannot run through a wall, enter a room or use a stair flight.
export function buildCorridorCrossings(floors){
 const routes=[];
 for(const floor of floors){
  const segments=floor.corridors.flatMap(c=>c.points.slice(1).map((b,i)=>({a:c.points[i],b,width:c.width})));
  for(const s of segments)for(const t of segments){
   const center=intersection(s.a,s.b,t.a,t.b);if(!center)continue;
   const length=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]),otherLength=Math.hypot(t.b[0]-t.a[0],t.b[1]-t.a[1]);
   const direction=s.b.map((v,i)=>(v-s.a[i])/length),other=t.b.map((v,i)=>(v-t.a[i])/otherLength);
   if(Math.abs(cross(direction,other))<.8)continue;
   const half=t.width/2+2.4,a=center.map((v,i)=>v-direction[i]*half),b=center.map((v,i)=>v+direction[i]*half);
   const route={floor:floor.id,center,a,b,direction,length:half*2};
   if(routes.some(r=>r.floor===route.floor&&Math.hypot(...r.center.map((v,i)=>v-center[i]))<.2&&Math.abs(cross(r.direction,direction))<.1))continue;
   if(samples(route).every(([x,z])=>inCorridor(floor,x,z)&&flatWalkable(floor,x,z,.28,{furniture:false})))routes.push(route);
  }
 }
 return routes;
}
// Ordinary long passages need opportunities too: a junction-only catalogue
// leaves most of the building (and the reverse walking direction) uncovered.
// The apparition crosses between the passage edges, dissolving at each side.
// Only the open middle is exposed; it has no physical route/collision actor.
export function buildPassageCrossings(floors){
 const routes=[];
 for(const floor of floors)for(const corridor of floor.corridors)for(let i=1;i<corridor.points.length;i++){
  const a=corridor.points[i-1],b=corridor.points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  // A short segment can be the far end of a much longer continuous view.
  // Distance and sightline checks, rather than segment length, qualify it.
  if(length<2)continue;
  const along=b.map((v,j)=>(v-a[j])/length),direction=[-along[1],along[0]],half=corridor.width/2+2.4;
  for(let distance=1;distance<=length-1;distance++){
   const center=a.map((v,j)=>v+along[j]*distance);
   const route={floor:floor.id,center,direction,length:half*2,passage:true,visibleHalf:corridor.width/2+.35,
    a:center.map((v,j)=>v-direction[j]*half),b:center.map((v,j)=>v+direction[j]*half)};
   // Check the exposed running strip, not the hidden space behind the walls.
   const clearance=Math.max(0,corridor.width/2-.5);
   route.exposed=Array.from({length:9},(_,j)=>center.map((v,k)=>v+direction[k]*clearance*(j/4-1)));
   if(route.exposed.every(([x,z])=>flatWalkable(floor,x,z,.28,{furniture:false})))routes.push(route);
  }
 }
 return routes;
}
function clearLine(floor,from,to,{doors=true}={}){
 if(floor.walls.some(w=>intersection(from,to,w.a,w.b)))return false;
 return !doors||!(floor.roomDoors??[]).some(door=>{
  const polygon=doorRectangle(door);
  return polygon.some((p,i)=>intersection(from,to,p,polygon[(i+1)%polygon.length]));
 });
}

export function createCorridorSightings(THREE,scene,floors,{random=Math.random,isReady=()=>true}={}){
 const routes=[...buildCorridorCrossings(floors),...buildPassageCrossings(floors)],rig=createCorridorFigure(THREE),figure=rig.model;
 figure.visible=false;scene.add(figure);
 const projected=new THREE.Vector3();let remaining=0,checkIn=0,active=null,lastRoute=null;
 function reset(){active=null;lastRoute=null;figure.visible=false;remaining=SIGHTING_INTERVAL;checkIn=0;}
 function end(){
  // A crossing abandoned behind a wall or outside the view is not a sighting.
  // Keep it due, rather than making the player wait a full interval for nothing.
  if(active?.exposure<.05)remaining=0;
  checkIn=0;active=null;figure.visible=false;
 }
 function inView(x,y,z,camera,margin=.82){
  projected.set(x,y,z).project(camera);
  return projected.z>=0&&projected.z<=1&&Math.abs(projected.x)<=margin&&Math.abs(projected.y)<=.7;
 }
 function eligible(route,actor,camera){
  const floor=floors[actor.floor],from=[actor.x,actor.z];
  if(route.floor!==actor.floor)return false;
  if(segmentDistance(actor.x,actor.z,route.a,route.b)<SIGHTING_DISTANCE.min)return false;
  const dx=route.center[0]-actor.x,dz=route.center[1]-actor.z,distance=Math.hypot(dx,dz);
  if(Math.abs((dx*route.direction[0]+dz*route.direction[1])/distance)>.35)return false;
  if(!inView(route.center[0],floor.elevation+1.05,route.center[1],camera))return false;
  // A pinhole past a corner is not a readable crossing. Keep enough of the
  // middle exposed for the torso and a short lateral movement to be seen.
  if(![-.6,0,.6].every(offset=>clearLine(floor,from,route.center.map((v,i)=>v+route.direction[i]*offset))))return false;
  // Junction routes use masonry for concealment; ordinary passages dissolve
  // at the edges, including open landings where masonry cannot hide both ends.
  if(!route.passage&&![route.a,route.b].every(p=>[-.75,.75].every(x=>[-.75,.75].every(z=>!clearLine(floor,from,[p[0]+x,p[1]+z],{doors:false})))))return false;
  if(!(route.exposed??samples(route)).every(([x,z])=>isReady({x,z,floor:actor.floor})&&flatWalkable(floor,x,z,.28)))return false;
  for(let t=0;t<=1;t+=.1)if(!isReady({x:actor.x+dx*t,z:actor.z+dz*t,floor:actor.floor}))return false;
  return true;
 }
 function corridorEnd(route,actor,camera){
  const floor=floors[actor.floor],dx=route.center[0]-actor.x,dz=route.center[1]-actor.z,length=Math.hypot(dx,dz);
  let distance=length,previous=route.center;
  // Continue the furthest usable sightline to its actual wall/turn, rather
  // than treating the last sampled crossing as the end of the corridor.
  for(let d=length+.25;d<camera.far;d+=.25){
   const x=actor.x+dx*d/length,z=actor.z+dz*d/length,next=[x,z];
   if(!inCorridor(floor,x,z)||!flatWalkable(floor,x,z,.1)||!clearLine(floor,previous,next)||!isReady({x,z,floor:actor.floor}))return d;
   distance=d;previous=next;
  }
  return distance;
 }
 function update(actor,camera,dt){
  const floor=floors[actor.floor];
  if(!(dt>0)||dt>.5||actor.outside||actor.stair||!floor||!camera){if(active)end();return;}
  // Count from crossing start to crossing start, including its animation.
  // Randomness chooses a route/direction only; it never skips a due sighting.
  remaining=Math.max(0,remaining-dt);
  if(active){
   const {route,direction,duration}=active;
   if(actor.floor!==route.floor||segmentDistance(actor.x,actor.z,route.a,route.b)<SIGHTING_DISTANCE.min){end();return;}
   active.time+=dt;if(active.time>=duration){end();return;}
   const t=direction>0?active.time/duration:1-active.time/duration;
   figure.position.set(route.a[0]+(route.b[0]-route.a[0])*t,floor.elevation,route.a[1]+(route.b[1]-route.a[1])*t);
   figure.rotation.y=Math.atan2(route.direction[0]*direction,route.direction[1]*direction);
   rig.pose(active.time);
   const opacity=route.passage?Math.max(0,Math.min(1,(route.visibleHalf-Math.abs(t-.5)*route.length)/.6)):1;
   rig.setOpacity(opacity);
   camera.updateMatrixWorld(true);
   if(opacity>.5&&inView(figure.position.x,floor.elevation+1.05,figure.position.z,camera,.98)&&clearLine(floor,[actor.x,actor.z],[figure.position.x,figure.position.z]))active.exposure+=dt;
   return;
  }
  // Count active indoor exploration, including room visits. Once due, retain
  // the opportunity and sample often enough to catch a walking/sprinting view.
  if(remaining>1e-6||!inCorridor(floor,actor.x,actor.z))return;
  checkIn-=dt;if(checkIn>0)return;checkIn=.15;
  camera.updateMatrixWorld(true);
  const candidates=routes.filter(route=>eligible(route,actor,camera));
  if(!candidates.length)return;
  // Choose only the furthest 20% of the clear corridor ahead. There is no
  // fixed upper distance cap pulling a long-corridor sighting back toward us.
  const distance=route=>Math.hypot(route.center[0]-actor.x,route.center[1]-actor.z);
  const furthest=candidates.reduce((a,b)=>distance(a)>distance(b)?a:b);
  const minimum=corridorEnd(furthest,actor,camera)*SIGHTING_DISTANCE.farFraction;
  const preferred=candidates.filter(route=>distance(route)>=minimum);
  if(!preferred.length)return;
  const alternatives=preferred.filter(route=>route!==lastRoute),choices=alternatives.length?alternatives:preferred;
  const route=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))],direction=random()<.5?-1:1;
  active={route,direction,time:0,exposure:0,duration:route.length/(8+random()*2)};lastRoute=route;remaining=SIGHTING_INTERVAL;
  const start=direction>0?route.a:route.b;figure.position.set(start[0],floor.elevation,start[1]);rig.pose(0);rig.setOpacity(route.passage?0:1);figure.visible=true;
 }
 reset();
 return {update,reset,dispose:rig.dispose,
  get active(){return active!==null;}};
}
