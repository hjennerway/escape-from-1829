import {createAsylumOutside} from '../dist/asylum-outside.mjs';

// Inspect actual meshes, including the original sources retained by batching.
export function probeServiceRamp(THREE,exterior){
 const ramp=exterior.model.getObjectByName('Sloping service ramp');
 const retaining=exterior.model.getObjectByName('Ramp brick retaining wall');
 exterior.model.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(ramp),base=new THREE.Box3().setFromObject(retaining);
 const ray=new THREE.Raycaster(),leaks=[],walks=[];
 const height=x=>bounds.max.y+(x-bounds.min.x)/(bounds.max.x-bounds.min.x)*(bounds.min.y-bounds.max.y);
 let probes=0;
 for(const t of [.01,.25,.5,.75,.99]){
  const x=bounds.min.x+t*(bounds.max.x-bounds.min.x);
  for(const [z,sign] of [[bounds.min.z,-1],[bounds.max.z,1]])for(const y of [-.10,.01,.17,height(x)-.015]){
   ray.set(new THREE.Vector3(x,y,z+sign*.25),new THREE.Vector3(0,0,-sign));ray.far=.255;
   if(!ray.intersectObject(retaining,false).length)leaks.push({x,y,z});probes++;
  }
 }
 for(const [x,sign] of [[bounds.min.x,-1],[bounds.max.x,1]])for(const t of [.01,.5,.99])for(const y of [-.10,.01,.17,height(x)-.015]){
  const z=bounds.min.z+t*(bounds.max.z-bounds.min.z);
  ray.set(new THREE.Vector3(x+sign*.25,y,z),new THREE.Vector3(-sign,0,0));ray.far=.255;
  if(!ray.intersectObject(retaining,false).length)leaks.push({x,y,z});probes++;
 }
 const outside=createAsylumOutside(THREE,exterior);
 for(const z of [bounds.min.z+.4,(bounds.min.z+bounds.max.z)/2,bounds.max.z-.4]){
  const actor={x:bounds.max.x+1.2,y:outside.heightAt(bounds.max.x+1.2,z,0),z};
  const errors=[];
  for(let i=0;i<Math.ceil((bounds.max.x-bounds.min.x+.9)/.1);i++){
   const before=actor.x;outside.update(actor,-.1,0,.02);
   if(actor.x>=before-1e-6){errors.push({reason:'blocked',x:actor.x,y:actor.y});break;}
   if(actor.x<bounds.max.x&&actor.x>bounds.min.x&&Math.abs(actor.y-height(actor.x))>1e-5)errors.push({reason:'height',x:actor.x,y:actor.y,expected:height(actor.x)});
  }
  const upper={...actor};
  const descentSteps=Math.ceil((bounds.max.x+1.2-actor.x)/.1);
  for(let i=0;i<descentSteps;i++)outside.update(actor,.1,0,.02);
  walks.push({z,upper,end:{...actor},errors});
 }
 const actor={x:(bounds.min.x+bounds.max.x)/2,y:0,z:(bounds.min.z+bounds.max.z)/2};
 actor.y=outside.heightAt(actor.x,actor.z,0);
 // Reach this elevated support normally before starting the jump.
 actor.y=height(actor.x);const jumped=outside.jump(actor);
 for(let i=0;i<160;i++)outside.update(actor,0,0,.01);
 return {bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},base:base.min.y,probes,leaks,walks,jump:{started:jumped,airborne:outside.airborne,y:actor.y,expected:height(actor.x)}};
}
