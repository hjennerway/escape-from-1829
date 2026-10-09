import {buildArchitecture} from './architecture.mjs';
import {createInteriorLights} from './interior-lights.mjs';
import {createFurnitureFloor} from './furniture-models.mjs';
import {createReceptionClockAudio} from './reception-clock-audio.mjs';
import {createInteriorSectionLoader} from './interior-streaming.mjs';
import {createCorridorSightings} from './corridor-sightings.mjs';

export function createExploreInterior(THREE,floors,furnitureModels,{streaming=false,renderer=null,camera=null}={}){
 const scene=new THREE.Scene(),lamps=[];
 scene.background=new THREE.Color(0x343731);scene.fog=new THREE.FogExp2(0x343731,.018);
 scene.add(new THREE.HemisphereLight(0xc5d6d4,0x686253,1.1));
 for(const floor of floors){
  const group=new THREE.Group();group.name=floor.name;group.position.y=floor.elevation;
  if(!streaming){buildArchitecture(THREE,group,floor);if(furnitureModels)createFurnitureFloor(THREE,group,floor,furnitureModels);}scene.add(group);
  const lamp=(x,z)=>lamps.push({x,z,y:floor.elevation+(floor.id===2?2.35:2.9),floor:floor.id,color:0xffdbac});
  for(const c of floor.corridors)for(let i=1;i<c.points.length;i++){
   const a=c.points[i-1],b=c.points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6));
   for(let k=0;k<n;k++)lamp(a[0]+(b[0]-a[0])*(k+.5)/n,a[1]+(b[1]-a[1])*(k+.5)/n);
  }
  for(const room of floor.rooms)lamp(...room.label);
  for(const stair of floor.stairs)lamp(...stair.label);
 }
 const lights=createInteriorLights(THREE,scene,lamps);
 const loading=streaming?createInteriorSectionLoader(THREE,{scene,floors,models:furnitureModels,renderer,camera,floorGroups:scene.children.filter(o=>floors.some(f=>f.name===o.name))}):null;
 const sightings=createCorridorSightings(THREE,scene,floors,{isReady:actor=>!loading||loading.isReady(actor)});
 let audioContext;
 // Browser audio is unlocked by a gesture; no sound is played while loading.
 const unlock=()=>{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});};
 window.addEventListener('pointerdown',unlock,{once:true});window.addEventListener('keydown',unlock,{once:true});
 const receptionClock=createReceptionClockAudio({getFloors:()=>floors,getContext:()=>audioContext});
 return {scene,loading,update:(actor,dt=0)=>{lights.update(actor);receptionClock.update(actor,dt);loading?.update(actor);sightings.update(actor,camera,dt);}};
}
