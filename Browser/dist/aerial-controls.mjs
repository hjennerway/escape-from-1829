export function sampleLanding(seconds,{aspect=16/9,reducedMotion=false}={}){
  const radius=245*Math.max(1,Math.min(3.4,1.8/aspect));
  const angle=.35+(reducedMotion?0:seconds*.025);
  return {position:[12+Math.sin(angle)*radius,145+(radius-245)*.6,-12+Math.cos(angle)*radius],target:[12,5,-12]};
}

// Orbit about a target, pan in camera-relative directions, and retain an
// elevated view. No renderer or DOM dependency, so navigation can be tested.
export function createAerialControls(camera){
  const keys=new Set();let target={x:12,y:5,z:-12},radius=245,angle=.35,tilt=.98;
  function apply(){
    camera.position.set(target.x+Math.sin(angle)*Math.sin(tilt)*radius,target.y+Math.cos(tilt)*radius,target.z+Math.cos(angle)*Math.sin(tilt)*radius);
    camera.lookAt(target.x,target.y,target.z);
  }
  function sync(point=[12,5,-12]){
    target={x:point[0],y:point[1],z:point[2]};
    const dx=camera.position.x-target.x,dy=camera.position.y-target.y,dz=camera.position.z-target.z;
    radius=Math.max(45,Math.min(1000,Math.hypot(dx,dy,dz)));angle=Math.atan2(dx,dz);
    tilt=Math.max(.2,Math.min(1.2,Math.acos(Math.max(-1,Math.min(1,dy/radius)))));
  }
  function pan(right,forward){
    target.x=Math.max(-230,Math.min(230,target.x+Math.cos(angle)*right-Math.sin(angle)*forward));
    target.z=Math.max(-230,Math.min(140,target.z-Math.sin(angle)*right-Math.cos(angle)*forward));apply();
  }
  return {keys,sync,
    orbit(dx,dy){angle-=dx*.004;tilt=Math.max(.2,Math.min(1.2,tilt+dy*.003));apply();},
    panPixels(dx,dy){pan(-dx*radius*.0015,dy*radius*.0015);},
    zoom(delta){radius=Math.max(45,Math.min(1000,radius*Math.exp(Math.max(-1,Math.min(1,delta*.001)))));apply();},
    update(dt){const x=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),z=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),n=Math.hypot(x,z);if(!n)return;
      const distance=Math.min(.1,Math.max(0,dt))*radius*.3*(keys.has('ShiftLeft')||keys.has('ShiftRight')?2:1);pan(x/n*distance,z/n*distance);},
    get target(){return {...target};}
  };
}
