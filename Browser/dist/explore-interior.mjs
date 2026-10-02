import {buildArchitecture} from './architecture.mjs';
import {createInteriorLights} from './interior-lights.mjs';

export function createExploreInterior(THREE,floors){
 const scene=new THREE.Scene(),lamps=[];
 scene.background=new THREE.Color(0x343731);scene.fog=new THREE.FogExp2(0x343731,.018);
 scene.add(new THREE.HemisphereLight(0xc5d6d4,0x686253,1.1));
 for(const floor of floors){
  const group=new THREE.Group();group.name=floor.name;group.position.y=floor.elevation;
  buildArchitecture(THREE,group,floor);scene.add(group);
  const lamp=(x,z)=>lamps.push({x,z,y:floor.elevation+(floor.id===2?2.35:2.9),floor:floor.id,color:0xffdbac});
  for(const c of floor.corridors)for(let i=1;i<c.points.length;i++){
   const a=c.points[i-1],b=c.points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6));
   for(let k=0;k<n;k++)lamp(a[0]+(b[0]-a[0])*(k+.5)/n,a[1]+(b[1]-a[1])*(k+.5)/n);
  }
  for(const room of floor.rooms)lamp(...room.label);
  for(const stair of floor.stairs)lamp(...stair.label);
 }
 const lights=createInteriorLights(THREE,scene,lamps);
 return {scene,update:actor=>lights.update(actor)};
}
