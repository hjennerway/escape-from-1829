// Seconds: approach 0–3, fade out 3–3.5, reception reveal 3.5–4.
export const ARRIVAL_TIMING = Object.freeze({approach:3, blackout:3.5, duration:4, fade:.5});
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;

export function sampleArrival(seconds,{reducedMotion=false,aspect=16/9}={}){
  const t=Math.max(0,seconds),travel=reducedMotion?0:smooth(t/3.5);
  // Establish the whole estate from the supplied aerial viewpoint, then move
  // gently toward its front. Preserve the existing blackout/reception timing.
  const distance=193*Math.max(1,Math.min(2.8,1.5/aspect));
  const angle=mix(.12,.04,travel),radius=distance*mix(1,.94,travel);
  return {
    position:[Math.sin(angle)*radius,116+(distance-193)*.55-travel*4,Math.cos(angle)*radius],
    target:[0,1,-7],
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
