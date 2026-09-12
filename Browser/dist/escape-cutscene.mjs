export const ESCAPE_DURATION=10;
export function sampleEscape(seconds,{reducedMotion=false,aspect=16/9}={}){
  const t=reducedMotion?.45:Math.max(0,Math.min(1,seconds/ESCAPE_DURATION));
  const eased=t*t*(3-2*t),angle=.48-.32*eased;
  // Keep the estate and rear-left mast in frame on portrait screens too.
  const distance=193*Math.max(1,Math.min(2.8,1.5/aspect));
  return {position:[Math.sin(angle)*distance,116+eased*6+(distance-193)*.55,Math.cos(angle)*distance],target:[0,1,-7]};
}

// The DOM supplies the caption and skip button; the game renders the 3D estate.
export function createEscapeCutscene(root,onComplete,{reducedMotion=false,getCamera=()=>null}={}){
  let active=false,elapsed=0;
  const skip=root.querySelector('button');
  function render(){
    const camera=getCamera();if(!camera)return;
    const shot=sampleEscape(elapsed,{reducedMotion,aspect:camera.aspect});
    camera.position.set(...shot.position);camera.lookAt(...shot.target);
  }
  function finish(){if(!active)return;active=false;root.hidden=true;onComplete();}
  skip.onclick=finish;
  return {
    start(){elapsed=0;active=true;root.hidden=false;render();skip.focus();},
    update(dt){if(!active)return;elapsed+=Math.max(0,dt);render();if(elapsed>=ESCAPE_DURATION)finish();},
    resize:render,
    skip:finish,
    reset(){active=false;elapsed=0;root.hidden=true;},
    get active(){return active;}
  };
}
