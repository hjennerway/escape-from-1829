// Give the browser a paint between completed preparation stages. The timeout
// also lets preparation continue when requestAnimationFrame is paused in a tab.
const yieldFrame=()=>new Promise(resolve=>{
  const timer=setTimeout(resolve,100);
  requestAnimationFrame(()=>setTimeout(()=>{clearTimeout(timer);resolve();},0));
});

export function createLoadingProgress(document,{paint=yieldFrame}={}){
  const launch=document.getElementById('gameLaunch'),panel=document.getElementById('buildingLoading');
  const bar=document.getElementById('buildingProgress'),percent=document.getElementById('loadingPercent'),stage=document.getElementById('loadingStage');
  let value=0;
  return {
    async step(next,label){
      value=Math.max(value,Math.min(99,Math.round(next)));
      bar.value=value;percent.textContent=value+'%';stage.textContent=label;
      await paint();
    },
    finish(){bar.value=100;percent.textContent='100%';stage.textContent='Ready to enter';launch.setAttribute('aria-busy','false');panel.hidden=true;},
    fail(){launch.setAttribute('aria-busy','false');panel.hidden=true;}
  };
}
