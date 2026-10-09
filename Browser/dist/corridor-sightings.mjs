import {flatWalkable,segmentDistance} from './asylum-layout.mjs';
import {doorRectangle} from './asylum-doors.mjs';

export const SIGHTING_DISTANCE={min:18,max:42};
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
function clearLine(floor,from,to,{doors=true}={}){
 if(floor.walls.some(w=>intersection(from,to,w.a,w.b)))return false;
 return !doors||!(floor.roomDoors??[]).some(door=>{
  const polygon=doorRectangle(door);
  return polygon.some((p,i)=>intersection(from,to,p,polygon[(i+1)%polygon.length]));
 });
}

export function createCorridorSightings(THREE,scene,floors,{random=Math.random,isReady=()=>true}={}){
 const routes=buildCorridorCrossings(floors),figure=new THREE.Group(),body=new THREE.Group();
 figure.name='Distant corridor silhouette';figure.visible=false;figure.add(body);scene.add(figure);
 // An unlit, featureless human outline: no face, reflective eyes or light.
 const material=new THREE.MeshBasicMaterial({color:0x020303});
 const sphere=new THREE.SphereGeometry(1,8,6),limb=new THREE.CapsuleGeometry(.085,.48,2,6);
 function shape(geometry,position,scale,parent=body){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);mesh.scale.set(...scale);parent.add(mesh);return mesh;}
 shape(sphere,[0,1.25,0],[.23,.38,.16]);shape(sphere,[0,1.72,.04],[.13,.17,.13]);
 const legs=[],arms=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.12,.85,0);body.add(leg);shape(limb,[0,-.33,0],[1,1.15,1],leg);legs.push(leg);
  const arm=new THREE.Group();arm.position.set(side*.25,1.48,0);body.add(arm);shape(limb,[0,-.26,.07],[.8,.9,.8],arm);arms.push(arm);
 }
 const projected=new THREE.Vector3();let remaining=0,active=null,lastRoute=null;
 const delay=(first=false)=>(first?45:85)+random()*(first?45:95);
 function reset(){active=null;lastRoute=null;figure.visible=false;remaining=delay(true);}
 function end(){active=null;figure.visible=false;remaining=delay();}
 function eligible(route,actor,camera){
  const floor=floors[actor.floor],from=[actor.x,actor.z];
  if(route.floor!==actor.floor||route===lastRoute)return false;
  if(segmentDistance(actor.x,actor.z,route.a,route.b)<SIGHTING_DISTANCE.min||Math.max(...[route.a,route.b].map(p=>Math.hypot(p[0]-actor.x,p[1]-actor.z)))>SIGHTING_DISTANCE.max)return false;
  const dx=route.center[0]-actor.x,dz=route.center[1]-actor.z,distance=Math.hypot(dx,dz);
  if(Math.abs((dx*route.direction[0]+dz*route.direction[1])/distance)>.35)return false;
  projected.set(route.center[0],floor.elevation+1.05,route.center[1]).project(camera);
  if(projected.z<0||projected.z>1||Math.abs(projected.x)<.18||Math.abs(projected.x)>.82||Math.abs(projected.y)>.7)return false;
  if(!clearLine(floor,from,route.center))return false;
  // The full outline starts and ends behind masonry, never visibly popping
  // into existence at the middle of an open passage or through a glass pane.
  if(![route.a,route.b].every(p=>[-.45,.45].every(x=>[-.45,.45].every(z=>!clearLine(floor,from,[p[0]+x,p[1]+z],{doors:false})))))return false;
  if(!samples(route).every(([x,z])=>isReady({x,z,floor:actor.floor})&&flatWalkable(floor,x,z,.28)))return false;
  for(let t=0;t<=1;t+=.1)if(!isReady({x:actor.x+dx*t,z:actor.z+dz*t,floor:actor.floor}))return false;
  return true;
 }
 function update(actor,camera,dt){
  const floor=floors[actor.floor];
  if(!(dt>0)||dt>.5||actor.outside||actor.stair||!floor||!camera){if(active)end();return;}
  if(active){
   const {route,direction,duration}=active;
   if(actor.floor!==route.floor||segmentDistance(actor.x,actor.z,route.a,route.b)<SIGHTING_DISTANCE.min){end();return;}
   active.time+=dt;if(active.time>=duration){end();return;}
   const t=direction>0?active.time/duration:1-active.time/duration;
   figure.position.set(route.a[0]+(route.b[0]-route.a[0])*t,floor.elevation,route.a[1]+(route.b[1]-route.a[1])*t);
   figure.rotation.y=Math.atan2(route.direction[0]*direction,route.direction[1]*direction);
   const stride=Math.sin(active.time*24);body.position.y=.035+Math.abs(stride)*.035;body.rotation.x=.12;
   legs.forEach((leg,i)=>leg.rotation.x=stride*(i?-.7:.7));arms.forEach((arm,i)=>arm.rotation.x=stride*(i?.55:-.55)-.25);
   return;
  }
  if(!inCorridor(floor,actor.x,actor.z))return;
  remaining-=dt;if(remaining>0)return;
  camera.updateMatrixWorld(true);
  const candidates=routes.filter(route=>eligible(route,actor,camera));
  if(!candidates.length){remaining=3+random()*5;return;}
  const route=candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))],direction=random()<.5?-1:1;
  active={route,direction,time:0,duration:route.length/(8+random()*2)};lastRoute=route;
  const start=direction>0?route.a:route.b;figure.position.set(start[0],floor.elevation,start[1]);figure.visible=true;
 }
 reset();
 return {update,reset,dispose(){figure.removeFromParent();sphere.dispose();limb.dispose();material.dispose();},
  get active(){return active!==null;}};
}
