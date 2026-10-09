import {navigateView,restoreCachedView} from './view-cache.mjs';
// Capture only on navigation: ordinary title frames do not retain a GPU buffer.
export function leaveIntro(destination){
  // A retained view needs no loading still or new camera flight. Avoid a GPU
  // readback and JPEG encode on this otherwise immediate history traversal.
  if(restoreCachedView(destination))return;
  const url=new URL(destination,location.href),detail={};
  document.dispatchEvent(new CustomEvent('capture-intro',{detail}));
  try{
    sessionStorage.setItem('1829-intro',JSON.stringify({...detail,path:url.pathname,created:Date.now()}));
  }catch{
    // Storage may be disabled or full; the destination still has a bundled still.
    try{sessionStorage.removeItem('1829-intro');}catch{}
  }
  url.searchParams.set('intro','1');
  navigateView(url,{intro:true});
}

// The camera is already at the destination's normal starting point on entry.
// Keep that exact pose for the handoff to its existing walking/orbit controls.
export function createIntroFlight(camera,{source,target,duration=2.4,reducedMotion=false}={}){
  const end={position:camera.position.clone(),quaternion:camera.quaternion.clone(),fov:camera.fov};
  const start={position:camera.position.clone().fromArray(source.position),quaternion:camera.quaternion.clone().fromArray(source.quaternion).normalize(),fov:source.fov};
  const startTarget=source.target?camera.position.clone().fromArray(source.target):null;
  const endTarget=camera.position.clone(),aim=camera.position.clone();
  function updateTarget(){
    if(target)endTarget.fromArray(target);
    else endTarget.set(0,0,-20).applyQuaternion(end.quaternion).add(end.position);
  }
  updateTarget();
  let elapsed=0,active=true;
  function sample(t){
    const ease=t*t*(3-2*t);
    camera.position.lerpVectors(start.position,end.position,ease);
    // Track the estate while rising; interpolating pitch alone points at the
    // horizon midway through the much longer portrait aerial flight.
    if(startTarget&&t>0&&t<1)camera.lookAt(aim.lerpVectors(startTarget,endTarget,ease));
    else camera.quaternion.slerpQuaternions(start.quaternion,end.quaternion,ease);
    camera.fov=start.fov+(end.fov-start.fov)*ease;
    camera.updateProjectionMatrix();
  }
  sample(reducedMotion?1:0);
  return {
    get active(){return active;},
    update(dt){
      if(!active)return;
      elapsed+=Math.min(.1,Math.max(0,dt));
      const t=reducedMotion?1:Math.min(1,elapsed/duration);
      sample(t);if(t===1)active=false;
    },
    finish(){sample(1);active=false;},
    retarget(){
      end.position.copy(camera.position);end.quaternion.copy(camera.quaternion);end.fov=camera.fov;
      updateTarget();
      sample(reducedMotion||!active?1:Math.min(1,elapsed/duration));
    }
  };
}

export function beginIntroFlight(camera,{fallback,target,onComplete=()=>{}}={}){
  const handoff=window.introHandoff;
  if(!handoff)return null;
  delete window.introHandoff;
  const saved=handoff.source;
  const validArray=(value,size)=>Array.isArray(value)&&value.length===size&&value.every(Number.isFinite);
  let source;
  if(validArray(saved?.position,3)&&validArray(saved?.quaternion,4)&&saved.fov>0&&saved.fov<180){source={...saved,target:validArray(saved.target,3)?saved.target:undefined};}
  else{
    const startCamera=camera.clone();
    startCamera.position.set(...fallback.position);startCamera.lookAt(...fallback.target);startCamera.fov=46;
    source={position:startCamera.position.toArray(),quaternion:startCamera.quaternion.toArray(),fov:startCamera.fov,target:fallback.target};
  }
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flight=createIntroFlight(camera,{source,target,duration:.8,reducedMotion});
  let revealed=false,blend=0,finished=false;
  handoff.ready(()=>{flight.finish();});
  function complete(){
    if(finished)return;finished=true;handoff.finish();onComplete();
  }
  return {
    get active(){return !finished;},
    retarget(){flight.retarget();},
    update(dt){
      if(!revealed)return;
      // Blend dusk into the destination's daylight before moving the camera.
      blend+=Math.min(.1,Math.max(0,dt));
      handoff.preview.style.opacity=String(Math.max(0,1-blend/.15));
      if(blend>=.15)flight.update(dt);
    },
    afterRender(){
      revealed=true;
      if(blend>=.15&&!flight.active)complete();
    }
  };
}
