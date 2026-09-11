import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {path,walkable,visible,nearExit} from './core.mjs';
const $=id=>document.getElementById(id),canvas=$('game');
const keys=new Set(),touch=matchMedia('(pointer:coarse)').matches;
let layout,renderer,scene,camera,torch,torchTarget,clock,ready=false,state='menu',elapsed=0,stamina=1,yaw=0,pitch=0,hold=0,sprint=false,crouch=false,exhausted=false;
let enemies=[],lights=[],audioCtx,audioOn=true,lastStep=0,lastPulse=0,footPhase=0,dragging=false,previousPointer=null,modelLoaded=false;
const player={x:50,z:27.5},mapContext=$('map').getContext('2d');
const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.88,...extra});
const tmp=new THREE.Vector3();
function mesh(geometry,mat,p,parent=scene){const m=new THREE.Mesh(geometry,mat);m.position.set(...p);parent.add(m);return m;}
function box(size,p,mat,parent){return mesh(new THREE.BoxGeometry(...size),mat,p,parent);}
function lamp(x,z,color=0xd6c296){const l=new THREE.PointLight(color,14,13,1.4);l.position.set(x,2.9,z);scene.add(l);lights.push(l);box([.45,.06,.22],[x,3.28,z],material(0xd4c397,{emissive:color,emissiveIntensity:.6}));}
function label(text,x,y,z,rotate=0){const c=document.createElement('canvas');c.width=640;c.height=192;const g=c.getContext('2d');g.fillStyle='#163527';g.fillRect(0,0,640,192);g.strokeStyle='#a9d7af';g.lineWidth=5;g.strokeRect(10,10,620,172);g.textAlign='center';g.fillStyle='#d9f1c7';const title=text.split('|')[0],size=title.length>17?42:title.length>12?50:62;g.font=`bold ${size}px Arial`;g.fillText(title,320,85);g.font='22px Arial';g.fillText(text.split('|')[1]||'',320,141);const m=mesh(new THREE.PlaneGeometry(2.35,.72),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}),[x,y,z]);m.rotation.y=rotate;}
function wornSign(group,text,y,color=0x1a2b20){const board=box([.7,.29,.045],[0,y, .285],material(color),group);const c=document.createElement('canvas');c.width=512;c.height=160;const g=c.getContext('2d');g.fillStyle='#dce8c4';g.fillRect(0,0,512,160);g.strokeStyle='#31513e';g.lineWidth=10;g.strokeRect(8,8,496,144);g.fillStyle='#142119';g.font='bold 54px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,80);const sign=mesh(new THREE.PlaneGeometry(.65,.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}),[0,y,.31],group);sign.name=text+' sign';return board;}
function enemyModel(type){
 const group=new THREE.Group(),skin=material(type===2?0x91bcad:0xb09a7b),coat=material([0x643632,0x202f42,0x577b6e][type],type===2?{transparent:true,opacity:.68,emissive:0x345e51,emissiveIntensity:.4}:{});
 mesh(new THREE.CylinderGeometry(.23,.37,1.12,8),coat,[0,1.05,0],group);
 mesh(new THREE.SphereGeometry(.21,12,10),skin,[0,1.86,0],group);
 for(const s of [-1,1]){const arm=box([.14,.72,.17],[s*.34,1.2,0],coat,group);arm.rotation.z=s*.13;if(type!==2){box([.15,.58,.17],[s*.15,.31,0],material(0x1e241e),group);box([.19,.12,.32],[s*.15,.06,.08],material(0x11160f),group);}mesh(new THREE.SphereGeometry(.035,6,6),material(0xf5e0b0,{emissive:type===2?0x9cffe1:0xfa694b,emissiveIntensity:2}),[s*.074,1.89,.185],group);}
 if(type===0){mesh(new THREE.SphereGeometry(.22,12,10,0,Math.PI*2,0,Math.PI*.55),material(0x342a21),[0,1.91,0],group);box([.12,.18,.025],[.15,1.4,.25],material(0xc4c1a6),group);}
 if(type===1){box([.48,.12,.4],[0,2.02,0],material(0x151c26),group);box([.14,.16,.035],[-.13,1.44,.24],material(0xb5b783),group);}
 if(type===0)wornSign(group,'Sandra',1.33,0x5d322b);
 if(type===2){const l=new THREE.PointLight(0x81d6b5,6,5);l.position.y=1.3;group.add(l);wornSign(group,'Deva ghost',1.18,0x1c4a40);}
 scene.add(group);return group;
}
async function init(){
 try{
  layout=await fetch('./layout.json').then(r=>{if(!r.ok)throw Error('Level data could not load');return r.json();});
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x101811);scene.fog=new THREE.FogExp2(0x101b14,.024);
  camera=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.05,150);camera.rotation.order='YXZ';
  scene.add(new THREE.HemisphereLight(0xb5c8a0,0x33372a,1.05));
  const gltf=await new GLTFLoader().loadAsync('./level.glb');scene.add(gltf.scene);modelLoaded=true;
  gltf.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;if(o.material){o.material.roughness=.88;if(o.material.name==='Glass'){o.material.emissive=new THREE.Color(0x3a5743);o.material.emissiveIntensity=.2;}}}});
  for(let x=8;x<=32;x+=4)lamp(x*2.5,40);
  for(const x of [8,20,32])for(let z=5;z<=27;z+=6)if(layout.cells[z*layout.width+x])lamp(x*2.5,z*2.5,0xa3baa0);
  layout.exits.forEach((e,i)=>{lamp(e.x*2.5,e.z*2.5,0x77db97);label('EXIT '+(i+1)+'  →|'+e.name,e.x*2.5,2.8,e.z*2.5+(e.z===4?-.5:.5));});
  const roomLabels=[
   ['NECS Office',8,6,0],['Library',32,6,0],['MLCSU Office',8,13,0],
   ['Reception',20,14,0],['NHS England office',32,13,0],['Snug',8,23,0],['Arden and GEM office',32,23,0]
  ];
  roomLabels.forEach(([name,x,z,rotate])=>label(name+'|1829 BUILDING',x*2.5,2.7,z*2.5,rotate));
  torch=new THREE.SpotLight(0xffe4af,24,30,.50,.55,1.2);torchTarget=new THREE.Object3D();scene.add(torch,torchTarget);torch.target=torchTarget;
  enemies=[['Sandra',8,9],['Security',32,23],['Deva asylum ghost',20,21]].map(([name,x,z],type)=>({name,type,spawn:{x:x*2.5,z:z*2.5},x:x*2.5,z:z*2.5,mesh:enemyModel(type),path:[],memory:0,rethink:0,route:0,target:null}));
  resetPositions();clock=new THREE.Clock();ready=true;$('start').disabled=false;$('start').innerHTML='ENTER THE BUILDING <span>↗</span>';animate();
 }catch(e){console.error(e);$('start').textContent='RELOAD TO TRY AGAIN';$('start').disabled=false;$('start').onclick=()=>location.reload();$('intro').textContent='The building could not load. Check your connection and reload. '+e.message;}
}
function resetPositions(){player.x=layout.spawn.x*layout.cellSize;player.z=layout.spawn.z*layout.cellSize;yaw=Math.PI;pitch=0;enemies.forEach(e=>{Object.assign(e,{...e.spawn,path:[],memory:0,rethink:0,route:0,target:null});e.mesh.position.set(e.x,0,e.z);});}
function uiPlaying(value){document.body.classList.toggle('playing',value);$('menu').hidden=value;$('location').hidden=value;$('footer').hidden=value;$('hud').hidden=!value;$('pause').hidden=!value;$('touch').hidden=!value||!touch;}
function lock(){if(!touch&&canvas.requestPointerLock){try{const result=canvas.requestPointerLock();result?.catch(()=>{});}catch{}}}
function start(){if(!ready)return;resetPositions();elapsed=0;stamina=1;hold=0;exhausted=false;keys.clear();state='play';torch.visible=true;uiPlaying(true);$('instructions').hidden=true;$('result').hidden=true;$('floorMap').hidden=true;audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume().catch(()=>{});lock();}
function pause(){if(state!=='play')return;state='paused';keys.clear();document.exitPointerLock?.();$('resultTag').textContent='TAKE A MOMENT';$('resultTitle').textContent='Hold your breath.';$('resultBody').textContent='The building will wait. Resume when you’re ready.';$('resume').hidden=false;$('retry').textContent='RESTART';$('result').hidden=false;}
function finish(won,who){state=won?'won':'lost';keys.clear();document.exitPointerLock?.();$('resultTag').textContent=won?'OUTSIDE. AT LAST.':'THE BUILDING KEPT YOU';$('resultTitle').textContent=won?'You made it out.':'Return to office, 3 days per week';$('resultBody').textContent=won?`You escaped through ${who.toLowerCase()} in ${elapsed.toFixed(1)} seconds. Four other routes are waiting.`:`${who} captured you after ${elapsed.toFixed(1)} seconds. Break line of sight, save your sprint, and use the map to find a different route.`;$('resume').hidden=true;$('retry').textContent='TRY ANOTHER ROUTE ↗';$('result').hidden=false;$('interact').hidden=true;}
function resume(){state='play';$('result').hidden=true;lock();}
function beep(hz,length,volume){if(!audioCtx||!audioOn)return;const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(hz*.5,t+length);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+length);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+length);}
function update(dt){
 elapsed+=dt;const sx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),sz=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),moving=!!(sx||sz);
 crouch=keys.has('ControlLeft')||keys.has('KeyC');if(stamina<.02)exhausted=true;if(stamina>.25)exhausted=false;
 sprint=keys.has('ShiftLeft')&&moving&&!crouch&&!exhausted;stamina=THREE.MathUtils.clamp(stamina+dt*(sprint?-.19:.115),0,1);
 const speed=crouch?1.6:sprint?5.8:3.1,n=Math.hypot(sx,sz)||1;
 const dx=(Math.cos(yaw)*sx-Math.sin(yaw)*sz)/n*speed*dt,dz=(-Math.sin(yaw)*sx-Math.cos(yaw)*sz)/n*speed*dt;
 if(walkable(layout,player.x+dx,player.z,.34))player.x+=dx;if(walkable(layout,player.x,player.z+dz,.34))player.z+=dz;
 footPhase+=dt*(moving?(sprint?14:9):0);camera.position.set(player.x,THREE.MathUtils.lerp(camera.position.y,crouch?1.1:1.65,Math.min(1,dt*12))+(moving?Math.sin(footPhase)*.018:0),player.z);camera.rotation.set(pitch,yaw,0);
 if(moving&&!crouch&&elapsed-lastStep>(sprint?.30:.48)){beep(95,.11,sprint?.08:.035);lastStep=elapsed;}
 let nearest=99;const noise=sprint?22:crouch?2:moving?7:0;
 for(const e of enemies){
  let distance=Math.hypot(e.x-player.x,e.z-player.z);nearest=Math.min(nearest,distance);if(elapsed<5)continue;
  const seen=distance<(crouch?8:e.type===1?22:16)&&visible(layout,e,player),heard=e.type===0&&distance<noise;
  if(seen||heard||e.type===2){e.target={...player};e.memory=e.type===0?8:5;}else e.memory=Math.max(0,e.memory-dt);
  e.rethink-=dt;if(e.rethink<=0){e.rethink=.45;if(e.memory<=0&&(!e.path.length||Math.hypot(e.x-e.target?.x,e.z-e.target?.z)<1)){const routes=e.type===0?[[8,16],[20,22],[32,16],[20,11]]:[[32,26],[8,26],[8,5],[32,5]],r=routes[e.route++%4];e.target={x:r[0]*2.5,z:r[1]*2.5};}if(e.target)e.path=path(layout,e,e.target);}
  let speed=e.type===0?(e.memory?3.55:2.1):e.type===1?(e.memory?3.85:2.4):2.2;
  if(e.type===2&&torch.visible&&distance<23&&visible(layout,player,e)){camera.getWorldDirection(tmp);const dot=(tmp.x*(e.x-player.x)+tmp.z*(e.z-player.z))/(distance||1);if(dot>.88)speed=.55;}
  const target=e.path[0]||(e.memory?e.target:null);if(target){const vx=target.x-e.x,vz=target.z-e.z,d=Math.hypot(vx,vz),step=Math.min(speed*dt,d);if(d>.001){e.x+=vx/d*step;e.z+=vz/d*step;e.mesh.rotation.y=Math.atan2(vx,vz);}if(d<.08&&e.path.length)e.path.shift();}
  e.mesh.position.set(e.x,e.type===2?Math.sin(elapsed*2)*.11:Math.sin(elapsed*8)*.025,e.z);
  if(Math.hypot(e.x-player.x,e.z-player.z)<.8){finish(false,e.name);break;}
 }
 if(state!=='play')return;
 if(nearest<15&&elapsed-lastPulse>THREE.MathUtils.mapLinear(Math.min(nearest,15),0,15,.35,1.2)){beep(52,.18,.1*(1-nearest/18));lastPulse=elapsed;}
 $('warning').textContent=elapsed<5?'YOU HAVE A FIVE-SECOND HEAD START':nearest<4?'SOMEONE IS VERY CLOSE':nearest<10?'YOU ARE NOT ALONE':'';
 const exit=nearExit(layout,player);$('interact').hidden=!exit;if(exit){$('exitName').textContent=exit.name;hold=keys.has('KeyE')?hold+dt:0;$('exitFill').style.width=Math.min(100,hold/1.2*100)+'%';if(hold>=1.2)finish(true,exit.name);}else hold=0;
 $('timer').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;$('staminaFill').style.width=stamina*100+'%';$('stance').textContent=sprint?'SPRINTING · LOUD':crouch?'CROUCHING · QUIET':'STAMINA';
 if(!$('floorMap').hidden)drawMap();
}
function drawMap(){const c=mapContext,s=10;c.clearRect(0,0,410,330);for(let z=0;z<layout.height;z++)for(let x=0;x<layout.width;x++)if(layout.cells[z*layout.width+x]){c.fillStyle='#52654c';c.fillRect(x*s,z*s,s-1,s-1);}layout.exits.forEach((e,i)=>{c.fillStyle='#c7e19b';c.fillRect(e.x*s-2,e.z*s-2,13,13);c.font='bold 12px Arial';c.fillText(i+1,e.x*s+13,e.z*s+9);});c.fillStyle='#fff8db';c.beginPath();c.arc(player.x/2.5*s+5,player.z/2.5*s+5,4,0,7);c.fill();c.strokeStyle='#fff8db';c.beginPath();c.moveTo(player.x/2.5*s+5,player.z/2.5*s+5);c.lineTo(player.x/2.5*s+5-Math.sin(yaw)*12,player.z/2.5*s+5-Math.cos(yaw)*12);c.stroke();}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(state==='play')update(dt);else if(state==='menu'){const t=performance.now()/1000;camera.position.set(50,1.7,31);camera.rotation.set(-.035,Math.PI+.12+Math.sin(t*.13)*.07,0);}
 camera.getWorldDirection(tmp);torch.position.copy(camera.position);torchTarget.position.copy(camera.position).addScaledVector(tmp,12);renderer.render(scene,camera);}
$('start').onclick=start;$('help').onclick=()=>{$('instructions').hidden=false;};$('closeHelp').onclick=()=>{$('instructions').hidden=true;};$('helpPlay').onclick=start;$('retry').onclick=start;$('resume').onclick=resume;$('pause').onclick=pause;$('audio').onchange=e=>audioOn=e.target.checked;
function toggleMap(){if(state==='play'){$('floorMap').hidden=!$('floorMap').hidden;drawMap();}}
addEventListener('keydown',e=>{if(['Tab','Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Escape'||e.code==='KeyP'){if(state==='play')pause();else if(state==='paused')resume();return;}if(state!=='play')return;keys.add(e.code);if(e.code==='KeyF')torch.visible=!torch.visible;if(e.code==='Tab'||e.code==='KeyM')toggleMap();});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&state==='play'&&!touch)pause();});
function look(dx,dy){const s=Number($('sensitivity').value)*.0018;yaw-=dx*s;pitch=THREE.MathUtils.clamp(pitch-dy*s,-1.3,1.3);}
addEventListener('mousemove',e=>{if(state==='play'&&document.pointerLockElement===canvas)look(e.movementX,e.movementY);});
canvas.addEventListener('pointerdown',e=>{if(state!=='play')return;dragging=true;previousPointer=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(dragging&&state==='play'&&document.pointerLockElement!==canvas){look(e.clientX-previousPointer[0],e.clientY-previousPointer[1]);previousPointer=[e.clientX,e.clientY];}});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(b.dataset.key);b.setPointerCapture(e.pointerId);});for(const t of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(t,()=>keys.delete(b.dataset.key));});$('touchMap').onclick=toggleMap;$('touchTorch').onclick=()=>torch.visible=!torch.visible;if(touch)document.body.classList.add('touch');
addEventListener('resize',()=>{if(renderer){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}});
init();
