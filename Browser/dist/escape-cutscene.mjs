// DOM-only ending; the original photographs are bundled with the game.
export function createEscapeCutscene(root,onComplete,{reducedMotion=false}={}){
  let active=false,elapsed=0;
  const duration=10,first=root.querySelector('[data-shot="wide"]'),second=root.querySelector('[data-shot="detail"]');
  const skip=root.querySelector('button');
  function render(){
    const blend=reducedMotion?(elapsed>=5?1:0):Math.max(0,Math.min(1,(elapsed-4)/2));
    first.style.opacity='1';second.style.opacity=String(blend);
    first.style.transform=reducedMotion?'none':`scale(${1+Math.min(elapsed/6,1)*.055})`;
    second.style.transform=reducedMotion?'none':`scale(${1.045-Math.max(0,Math.min(1,(elapsed-4)/6))*.045})`;
  }
  function finish(){if(!active)return;active=false;root.hidden=true;onComplete();}
  skip.onclick=finish;
  return {
    start(){elapsed=0;active=true;root.hidden=false;render();skip.focus();},
    update(dt){if(!active)return;elapsed+=Math.max(0,dt);render();if(elapsed>=duration)finish();},
    skip:finish,
    reset(){active=false;elapsed=0;root.hidden=true;},
    get active(){return active;}
  };
}
