import {createAsylumOutside} from './asylum-outside.mjs';
import {createAsylumJump} from './asylum-jump.mjs';
import {nearExit} from './core.mjs';
import {exitDirection} from './escape-routes.mjs';

// Exploration and Escape use the same physical stairs, collisions and jumps.
// Only this camera/input adapter differs; exploration has no game objectives.
export function createExploreWalker(THREE,exterior,floors){
 const camera=exterior.camera,keys=new Set(),defaultFov=camera.fov;
 const outside=createAsylumOutside(THREE,exterior),inside=createAsylumJump(floors);
 const actor={x:0,y:0,z:40,floor:0,outside:true,stair:null};
 let yaw=0,pitch=0,doorHeld=false;
 camera.rotation.order='YXZ';
 function sync(){camera.position.set(actor.x,actor.y+1.8,actor.z);camera.rotation.set(pitch,yaw,0);}
 function resetJumps(){outside.resetJump();inside.reset();}
 function reset(){resetJumps();keys.clear();doorHeld=false;yaw=pitch=0;Object.assign(actor,{x:0,y:0,z:40,floor:0,outside:true,stair:null,verticalTrend:0});camera.fov=defaultFov;camera.updateProjectionMatrix();sync();}
 function nearbyDoor(){
  if(!actor.outside)return nearExit(floors[actor.floor],actor);
  let nearest=null,distance=1.6;
  for(const floor of floors)for(const exit of floor.exits){
   const [x,y,z]=exit.destination,d=Math.hypot(actor.x-x,actor.y-y,actor.z-z);
   if(d<distance){nearest={...exit,floor:floor.id};distance=d;}
  }
  return nearest;
 }
 function useDoor(){
  const exit=nearbyDoor();if(!exit)return false;
  resetJumps();const {dx,dz}=exitDirection(exit,{outside:!actor.outside});
  if(actor.outside){Object.assign(actor,{...exit.inside,floor:exit.floor,y:floors[exit.floor].elevation,stair:null,outside:false,verticalTrend:0});yaw=Math.atan2(dx,dz);}
  else{const [x,y,z]=exit.destination;Object.assign(actor,{x,y,z,stair:null,outside:true,verticalTrend:0});yaw=Math.atan2(-dx,-dz);}
  pitch=0;sync();return true;
 }
 reset();
 return {keys,actor,outside,reset,nearbyDoor,useDoor,
  get airborne(){return actor.outside?outside.airborne:inside.airborne;},
  jump(){return actor.outside?outside.jump(actor):inside.start();},
  // Layout/tree changes rebuild support and collision together.
  setObstacles(){outside.refresh();},
  setView({position,target,fov}){
   resetJumps();keys.clear();doorHeld=false;
   Object.assign(actor,{x:position[0],y:position[1]-1.8,z:position[2],floor:0,outside:true,stair:null,verticalTrend:0});
   if(position[1]===1.8)actor.y=outside.heightAt(actor.x,actor.z,0);
   camera.position.set(actor.x,actor.y+1.8,actor.z);camera.lookAt(...target);yaw=camera.rotation.y;pitch=camera.rotation.x;
   if(fov){camera.fov=fov;camera.updateProjectionMatrix();}
  },
  look(dx,dy){yaw-=dx*.002;pitch=Math.max(-1.45,Math.min(1.45,pitch-dy*.002));camera.rotation.set(pitch,yaw,0);},
  update(dt){
   dt=Math.min(.1,Math.max(0,dt));if(!dt)return;
   const side=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS'));
   const distance=dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?12:5),n=Math.hypot(side,forward)||1;
   const dx=(Math.cos(yaw)*side-Math.sin(yaw)*forward)*distance/n,dz=(-Math.sin(yaw)*side-Math.cos(yaw)*forward)*distance/n;
   if(actor.outside)outside.update(actor,dx,dz,dt);else inside.update(actor,dx,dz,dt);
   if(keys.has('KeyE')&&!doorHeld)useDoor();doorHeld=keys.has('KeyE');sync();
  }
 };
}
