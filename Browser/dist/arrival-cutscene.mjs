// Seconds: approach 0–3, fade out 3–3.5, reception reveal 3.5–4.
export const ARRIVAL_TIMING = Object.freeze({approach:3, blackout:3.5, duration:4, fade:.5});
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;

export function sampleArrival(seconds,{reducedMotion=false,aspect=16/9}={}){
  const t=Math.max(0,seconds),travel=smooth(t/3.5),tilt=smooth(t/1.25),door=smooth((t-1.25)/1.75);
  // Pull back in portrait so the central block and its pediment still fit.
  const distance=Math.max(1,Math.min(1.8,1/aspect));
  return {
    position:reducedMotion?[0,2.5,31*distance]:[mix(-2.8,0,smooth(t/2.6)),mix(2,3.6,travel),mix(31*distance,1.5,travel)],
    target:reducedMotion?[0,7,0]:[0,mix(mix(5.6,12.8,tilt),3.65,door),0],
    opacity:t<3?0:t<3.5?clamp((t-3)/.5):clamp((4-t)/.5),
    inside:t>=3.5,done:t>=4
  };
}

export function createArrivalCutscene({camera,overlay,onEnter,onComplete,reducedMotion=false}){
  let active=false,elapsed=0,inside=false;
  function render(){
    const shot=sampleArrival(elapsed,{reducedMotion,aspect:camera.aspect});
    overlay.style.opacity=String(shot.opacity);
    camera.position.set(...shot.position);camera.lookAt(...shot.target);
    // Always conceal the scene swap completely, even between frame boundaries.
    if(shot.inside&&!inside){inside=true;overlay.style.opacity='1';onEnter();}
    if(shot.done&&active){active=false;overlay.hidden=true;onComplete();}
  }
  return {
    start(){elapsed=0;inside=false;active=true;overlay.hidden=false;render();},
    update(dt){if(!active)return;elapsed+=Math.max(0,dt);render();},
    reset(){elapsed=0;inside=false;active=false;overlay.hidden=true;overlay.style.opacity='0';},
    get active(){return active;},get inside(){return inside;}
  };
}
