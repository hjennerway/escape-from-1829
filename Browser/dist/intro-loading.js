// Run before the canvas and scene modules so navigation never paints an empty
// WebGL canvas over the last intro frame. This also works without session storage.
(()=>{
  const url=new URL(location.href);
  if(url.searchParams.get('intro')!=='1')return;
  url.searchParams.delete('intro');history.replaceState(history.state,'',url);
  let source;
  try{
    const saved=JSON.parse(sessionStorage.getItem('1829-intro'));
    sessionStorage.removeItem('1829-intro');
    if(saved?.path===url.pathname&&Date.now()-saved.created<60000)source=saved;
  }catch{}
  document.body.classList.add('intro-arriving');
  const overlay=document.createElement('div');overlay.id='introTransition';
  const preview=document.createElement('img');preview.alt='';preview.id='introStill';
  preview.src=source?.preview?.startsWith('data:image/jpeg')?source.preview:
    (matchMedia('(max-width:760px)').matches?'./exterior/landing-aerial-mobile.webp':'./exterior/landing-aerial.webp');
  const caption=document.createElement('div');caption.className='intro-travel-caption';
  const status=document.createElement('span');status.setAttribute('role','status');status.textContent='Preparing your view…';
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
  window.introHandoff={source,preview,
    ready(skip){skipFlight=skip;status.textContent=url.pathname.endsWith('/explore.html')?'Arriving on foot':'Rising to aerial view';
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){caption.querySelector('button').hidden=false;}
    },
    finish(){overlay.remove();document.body.classList.remove('intro-arriving');window.removeEventListener('keydown',keydown,true);},
    fail(){status.textContent='The view could not load. Return to the intro to try again.';}
  };
  // Keep a useful way out if a scene module fails before it can start rendering.
  window.addEventListener('error',()=>{if(overlay.isConnected)status.textContent='The view could not load. Return to the intro to try again.';});
  window.addEventListener('unhandledrejection',()=>{if(overlay.isConnected)status.textContent='The view could not load. Return to the intro to try again.';});
})();
