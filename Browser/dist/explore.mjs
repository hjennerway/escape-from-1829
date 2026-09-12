import * as THREE from './vendor/three.module.js';
import {createEscapeExterior,loadEscapeFrontage} from './escape-exterior.mjs';
import {createWalker,exteriorObstacles} from './explore-controls.mjs';
const canvas=document.getElementById('game'),hint=document.getElementById('lookHint'),look=document.getElementById('look');
try{
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const exterior=createEscapeExterior(THREE,innerWidth/innerHeight);
  exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();
  const walker=createWalker(exterior.camera,exteriorObstacles(THREE,exterior.model));
  let active=false,dragging=false,last=null;
  const movement=new Set(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight']);
  function stop(){active=false;dragging=false;last=null;walker.keys.clear();hint.textContent='Click Start exploring to resume, or drag the view to look around.';look.textContent='START EXPLORING ↗';}
  function begin(){active=true;canvas.focus();hint.textContent='Walk with WASD. If the cursor stays visible, hold and drag to look around.';}
  function lock(){begin();try{canvas.requestPointerLock?.()?.catch(()=>{hint.textContent='Mouse capture is unavailable here. Hold and drag the view to look around; WASD moves.';});}catch{hint.textContent='Hold and drag the view to look around; WASD moves.';}}
  look.disabled=false;hint.textContent='Click Start exploring for mouse look, or hold and drag the view.';look.onclick=lock;
  document.getElementById('resetView').onclick=()=>{walker.reset();begin();};
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;begin();dragging=true;last={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointerup',()=>{dragging=false;last=null;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;last=null;walker.keys.clear();});
  canvas.addEventListener('pointermove',e=>{if(document.pointerLockElement===canvas||!dragging)return;if(last)walker.look(e.clientX-last.x,e.clientY-last.y);last={x:e.clientX,y:e.clientY};});
  document.addEventListener('mousemove',e=>{if(active&&document.pointerLockElement===canvas)walker.look(e.movementX,e.movementY);});
  document.addEventListener('pointerlockchange',()=>{const locked=document.pointerLockElement===canvas;document.body.classList.toggle('mouse-locked',locked);if(locked)begin();else stop();});
  document.addEventListener('keydown',e=>{if(e.code==='Escape'){stop();document.exitPointerLock?.();return;}if(active&&movement.has(e.code)){e.preventDefault();walker.keys.add(e.code);}});
  document.addEventListener('keyup',e=>walker.keys.delete(e.code));
  window.addEventListener('blur',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);exterior.camera.aspect=innerWidth/innerHeight;exterior.camera.updateProjectionMatrix();});
  const clock=new THREE.Clock();
  renderer.setAnimationLoop(()=>{const dt=clock.getDelta();if(active&&!document.hidden)walker.update(dt);renderer.render(exterior.scene,exterior.camera);});
  loadEscapeFrontage(THREE,exterior).catch(error=>console.warn('Frontage photo unavailable',error));
}catch(error){console.error(error);hint.textContent='The grounds could not load. Reload the page to try again.';look.disabled=false;look.textContent='RELOAD ↗';look.onclick=()=>location.reload();}
