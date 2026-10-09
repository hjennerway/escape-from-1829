// Run before the canvas and scene modules so navigation never paints an empty
// WebGL canvas over the last intro frame. This also works without session storage.
(()=>{
  const url=new URL(location.href);
  const viewSwitch=url.searchParams.get('handoff')==='1';
  if(!viewSwitch&&url.searchParams.get('intro')!=='1')return;
  url.searchParams.delete('intro');url.searchParams.delete('handoff');history.replaceState(history.state,'',url);
  let source;
  try{
    const key=viewSwitch?'1829-view':'1829-intro',saved=JSON.parse(sessionStorage.getItem(key));
    sessionStorage.removeItem(key);
    if(saved?.path===url.pathname&&Date.now()-saved.created<60000)source=saved;
  }catch{}
  document.body.classList.add('intro-arriving');
  const overlay=document.createElement('div');overlay.id='introTransition';
  const preview=document.createElement('img');preview.alt='';preview.id='introStill';
  preview.src=source?.preview?.startsWith('data:image/jpeg')?source.preview:
    (matchMedia('(max-width:760px)').matches?'./exterior/landing-aerial-mobile.webp':'./exterior/landing-aerial.webp');
  const caption=document.createElement('div');caption.className='intro-travel-caption';
  const status=document.createElement('span');status.setAttribute('role','status');status.textContent=viewSwitch&&url.pathname.endsWith('/explore.html')?'Preparing the grounds…':'Preparing your view…';
  const skip=document.createElement('button');skip.type='button';skip.textContent='Skip movement';skip.hidden=true;
  const back=document.createElement('a');back.href='./';back.textContent='← Back to intro';
  caption.append(status,skip,back);overlay.append(preview,caption);document.body.append(overlay);
  let skipFlight;
  function keydown(event){
    if(event.code==='Escape'){event.preventDefault();skipFlight?.();}
    // Tab and activation keys remain available for the overlay's controls.
    if(!['Tab','Enter','Space'].includes(event.code))event.stopImmediatePropagation();
  }
  window.addEventListener('keydown',keydown,true);
  skip.onclick=()=>skipFlight?.();
  const handoff={source,preview,
    async paint(message){
      status.textContent=message;
      await preview.decode().catch(()=>{});
      await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
    },
    ready(skip){skipFlight=skip;status.textContent=url.pathname.endsWith('/explore.html')?'Arriving on foot':'Rising to aerial view';
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){caption.querySelector('button').hidden=false;}
    },
    finish(){overlay.remove();document.body.classList.remove('intro-arriving');window.removeEventListener('keydown',keydown,true);},
    fail(){status.textContent='The view could not load. Return to the intro to try again.';}
  };
  if(viewSwitch)window.viewHandoff=handoff;else window.introHandoff=handoff;
  // Keep a useful way out if a scene module fails before it can start rendering.
  window.addEventListener('error',()=>{if(overlay.isConnected)status.textContent='The view could not load. Return to the intro to try again.';});
  window.addEventListener('unhandledrejection',()=>{if(overlay.isConnected)status.textContent='The view could not load. Return to the intro to try again.';});
})();
