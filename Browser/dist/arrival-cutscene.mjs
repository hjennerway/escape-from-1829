// Seconds: hold 0–1, fast approach and fade out 1–2.5, reception reveal 2.5–3.
export const ARRIVAL_TIMING = Object.freeze({delay:1, approach:1.5, blackout:2.5, duration:3, fade:.5});
const clamp=v=>Math.max(0,Math.min(1,v));
const mix=(a,b,t)=>a+(b-a)*t;

export function sampleArrival(seconds,{reducedMotion=false,aspect=16/9}={}){
  const t=Math.max(0,seconds),approachTime=Math.max(0,t-ARRIVAL_TIMING.delay);
  const travel=reducedMotion?0:clamp(approachTime/ARRIVAL_TIMING.approach);
  // Rush from the aerial view toward the red front door at (0, 3.5, 19.9).
  // Stop outside the portico so the camera never passes through its roof.
  const distance=193*Math.max(1,Math.min(2.8,1.5/aspect));
  return {
    position:[mix(Math.sin(.12)*distance,0,travel),mix(116+(distance-193)*.55,3.5,travel),mix(Math.cos(.12)*distance,25,travel)],
    target:[0,3.5,19.9],
    opacity:t<ARRIVAL_TIMING.blackout?clamp(approachTime/ARRIVAL_TIMING.approach):clamp((ARRIVAL_TIMING.duration-t)/ARRIVAL_TIMING.fade),
    inside:t>=ARRIVAL_TIMING.blackout,done:t>=ARRIVAL_TIMING.duration
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
