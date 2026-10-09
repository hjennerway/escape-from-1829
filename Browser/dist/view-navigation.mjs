import {navigateView} from './view-cache.mjs';
// Carry a live camera location between the two pages, including direct links
// and reloads. No stored preset or intro flight replaces this position.
export function readViewLocation(search){
  const parts=new URLSearchParams(search).get('at')?.split(',');
  if(parts?.length!==3||parts.some(part=>!part.trim()))return null;
  const [x,z,heading]=parts.map(Number);
  if(![x,z,heading].every(Number.isFinite)||Math.abs(x)>100000||Math.abs(z)>100000)return null;
  return {x,z,heading};
}

export function cameraLocation(camera){
  return {x:camera.position.x,z:camera.position.z,heading:camera.rotation.clone().reorder('YXZ').y};
}

export function viewLocationURL(destination,location,{base,period,lighting}={}){
  const url=new URL(destination,base);
  url.searchParams.set('at',[location.x,location.z,location.heading].join(','));
  if(period!==undefined)url.searchParams.set('period',period);
  if(lighting)url.searchParams.set('lighting',lighting);
  return url;
}

export function bindViewSwitch(button,{camera,destination,period,lighting,capture}){
  button.disabled=false;
  button.addEventListener('click',()=>{
    const url=viewLocationURL(destination,cameraLocation(camera),{base:location.href,period:period(),lighting:lighting()});
    // Carry one still across the document navigation. Read the WebGL buffer
    // immediately after a fresh draw, without retaining it on ordinary frames.
    try{
      sessionStorage.removeItem('1829-view');
      const canvas=capture?.();
      if(canvas){
        const preview=document.createElement('canvas'),scale=Math.min(1,1280/canvas.width);
        preview.width=Math.round(canvas.width*scale);preview.height=Math.round(canvas.height*scale);
        preview.getContext('2d').drawImage(canvas,0,0,preview.width,preview.height);
        sessionStorage.setItem('1829-view',JSON.stringify({path:url.pathname,created:Date.now(),preview:preview.toDataURL('image/jpeg',.85)}));
      }
    }catch{/* The destination has a bundled still when storage is unavailable. */}
    url.searchParams.set('handoff','1');
    document.exitPointerLock?.();
    navigateView(url);
  });
}

export function aerialLocationView({x,z,heading},{aspect=16/9}={}){
  const height=90*Math.max(1,Math.min(2,1/aspect));
  return {position:[x,height,z],target:[x-Math.sin(heading)*height*.3,0,z-Math.cos(heading)*height*.3],fov:46};
}

// Use the destination's current collision/support cache. A roof or tree may
// occupy the drop point; in that case search locally for the nearest clearance.
export function groundLocationView(location,outside){
  function sample(x,z){
    const y=outside.heightAt(x,z,0);
    if(!outside.clear(x,z,y))return null;
    const {heading}=location;
    return {position:[x,y+1.8,z],target:[x-Math.sin(heading)*10,y+1.8,z-Math.cos(heading)*10],fov:46};
  }
  const exact=sample(location.x,location.z);if(exact)return exact;
  for(let radius=.5;radius<=100;radius+=.5)for(let n=0;n<64;n++){
    const angle=location.heading+n*Math.PI/32;
    const view=sample(location.x+Math.cos(angle)*radius,location.z+Math.sin(angle)*radius);
    if(view)return view;
  }
  return null;
}

export function viewLighting(search,fallback){
  const mode=new URLSearchParams(search).get('lighting');
  return ['day','dusk','night'].includes(mode)?mode:fallback;
}
