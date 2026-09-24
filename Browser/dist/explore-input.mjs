// Keep keyboard and touch input separate so releasing one cannot cancel the other.
export function bindExploreInput(walker,{canvas,hint,look,touchControls}){
  let active=false,drag=null;
  const keyboard=new Set(),pointers=new Map();
  const movement=new Set(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight']);
  const buttons=[...touchControls.querySelectorAll('[data-key]')];
  const touchMedia=matchMedia('(any-pointer:coarse)');
  function enableTouch(){document.body.classList.add('explore-touch');}
  if(touchMedia.matches||navigator.maxTouchPoints>0)enableTouch();
  touchMedia.addEventListener('change',e=>{if(e.matches)enableTouch();});
  function sync(){
    walker.keys.clear();
    for(const key of keyboard)walker.keys.add(key);
    for(const key of pointers.values())walker.keys.add(key);
    for(const button of buttons)button.classList.toggle('held',[...pointers.values()].includes(button.dataset.key));
  }
  function stop(){
    active=false;drag=null;keyboard.clear();pointers.clear();sync();
    hint.textContent='Click Start exploring to resume, or drag the view to look around.';
  }
  function begin(){
    active=true;canvas.focus({preventScroll:true});
    hint.textContent='Walk with WASD. If the cursor stays visible, hold and drag to look around.';
  }
  function lock(){
    begin();
    if(document.body.classList.contains('explore-touch'))return;
    try{canvas.requestPointerLock?.()?.catch(()=>{hint.textContent='Mouse capture is unavailable here. Hold and drag the view to look around; WASD moves.';});}
    catch{hint.textContent='Hold and drag the view to look around; WASD moves.';}
  }
  look.disabled=false;look.onclick=lock;
  hint.textContent='Click Start exploring for mouse look, or hold and drag the view.';
  document.body.classList.add('explore-ready');
  for(const controls of document.querySelectorAll('.explore-nav,#layoutControls')){
    controls.addEventListener('pointerdown',stop);
    controls.addEventListener('focusin',stop);
  }
  for(const button of buttons){
    button.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      e.preventDefault();enableTouch();begin();
      pointers.set(e.pointerId,button.dataset.key);sync();button.setPointerCapture(e.pointerId);
    });
    for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>{
      pointers.delete(e.pointerId);sync();
    });
    button.addEventListener('contextmenu',e=>e.preventDefault());
  }
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0||drag)return;
    if(e.pointerType==='touch')enableTouch();
    begin();drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{
    if(drag?.id===e.pointerId)drag=null;
  });
  canvas.addEventListener('pointermove',e=>{
    if(document.pointerLockElement===canvas||drag?.id!==e.pointerId)return;
    walker.look(e.clientX-drag.x,e.clientY-drag.y);drag.x=e.clientX;drag.y=e.clientY;
  });
  document.addEventListener('mousemove',e=>{if(active&&document.pointerLockElement===canvas)walker.look(e.movementX,e.movementY);});
  document.addEventListener('pointerlockchange',()=>{
    const locked=document.pointerLockElement===canvas;document.body.classList.toggle('mouse-locked',locked);
    if(locked)begin();else stop();
  });
  document.addEventListener('keydown',e=>{
    if(e.code==='Escape'){stop();document.exitPointerLock?.();return;}
    if(active&&movement.has(e.code)){e.preventDefault();keyboard.add(e.code);sync();}
  });
  document.addEventListener('keyup',e=>{keyboard.delete(e.code);sync();});
  window.addEventListener('blur',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  return {get active(){return active;}};
}
