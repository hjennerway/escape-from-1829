import * as THREE from 'three';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';
import {path,walkable,visible,nearExit} from './core.mjs';
import {buildArchitecture} from './architecture.mjs';
import {createEscapeCutscene} from './escape-cutscene.mjs';
import {FLOOR_HEIGHT,makeFloors,nearStair,changeFloor,routeBetweenFloors} from './floors.mjs';
const $=id=>document.getElementById(id),canvas=$('game');
const keys=new Set(),touch=matchMedia('(pointer:coarse)').matches;
let layout,renderer,scene,camera,torch,torchTarget,clock,ready=false,state='menu',elapsed=0,stamina=1,yaw=0,pitch=0,hold=0,sprint=false,crouch=false,exhausted=false;
let enemies=[],lights=[],audioCtx,audioOn=true,lastStep=0,lastPulse=0,footPhase=0,dragging=false,previousPointer=null,modelLoaded=false;
const player={x:50,z:27.5,floor:0},mapCanvas=$('map'),mapContext=mapCanvas.getContext('2d'),miniMapCanvas=$('miniMap'),miniMapContext=miniMapCanvas.getContext('2d');
let mapRefresh=0,floors=[],floorGroups=[],stairHold=0,stairLatch=false,artPanels=[],artViewing=null,placedWallPanels=[];
const escapeCutscene=createEscapeCutscene($('escapeCutscene'),()=>{
 if(state!=='cutscene')return;
 state='won';$('result').hidden=false;$('retry').focus();
},{reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});
function groupSince(snapshot,height){const group=new THREE.Group();for(const o of [...scene.children])if(!snapshot.has(o))group.add(o);group.position.y=height;scene.add(group);return group;}
function showFloor(){layout=floors[player.floor];floorGroups.forEach((g,i)=>g.visible=i===player.floor);$('floorName').textContent=player.floor?'UPPER FLOOR':'GROUND FLOOR';$('mapFloorName').textContent=player.floor?'UPPER FLOOR · GAME ROUTES':'GROUND FLOOR · GAME ROUTES';$('miniFloorName').textContent=player.floor?'UPPER FLOOR':'GROUND FLOOR';}
const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.88,...extra});
const tmp=new THREE.Vector3();
function mesh(geometry,mat,p,parent=scene){const m=new THREE.Mesh(geometry,mat);m.position.set(...p);parent.add(m);return m;}
function box(size,p,mat,parent){return mesh(new THREE.BoxGeometry(...size),mat,p,parent);}
function lamp(x,z,color=0xd6c296){const l=new THREE.PointLight(color,14,13,1.4);l.position.set(x,2.9,z);scene.add(l);lights.push(l);box([.45,.06,.22],[x,3.28,z],material(0xd4c397,{emissive:color,emissiveIntensity:.6}));}
function twoSidedTextPlane(geometry,texture,frontPosition,parent){
 const mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.FrontSide});
 const front=mesh(geometry,mat,frontPosition,parent);
 const back=mesh(geometry.clone(),mat,[frontPosition[0],frontPosition[1],-frontPosition[2]],parent);
 back.rotation.y=Math.PI;
 return {front,back};
}
function label(text,x,y,z,rotate=0){const c=document.createElement('canvas');c.width=640;c.height=192;const g=c.getContext('2d');g.clearRect(0,0,640,192);g.textAlign='center';g.fillStyle='#d9f1c7';const title=text.split('|')[0],size=title.length>17?42:title.length>12?50:62;g.font=`bold ${size}px Arial`;g.fillText(title,320,85);g.font='22px Arial';g.fillText(text.split('|')[1]||'',320,141);const signGroup=new THREE.Group();signGroup.position.set(x,y,z);signGroup.rotation.y=rotate;scene.add(signGroup);const texture=new THREE.CanvasTexture(c);twoSidedTextPlane(new THREE.PlaneGeometry(2.35,.72),texture,[0,0,.012],signGroup);}
function wornSign(group,text,y,color=0x1a2b20){const board=box([.7,.29,.045],[0,y, .285],material(color),group);const c=document.createElement('canvas');c.width=512;c.height=160;const g=c.getContext('2d');g.fillStyle='#dce8c4';g.fillRect(0,0,512,160);g.strokeStyle='#31513e';g.lineWidth=10;g.strokeRect(8,8,496,144);g.fillStyle='#142119';g.font='bold 54px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,80);const texture=new THREE.CanvasTexture(c);const signs=twoSidedTextPlane(new THREE.PlaneGeometry(.65,.2),texture,[0,y,.31],group);signs.back.position.z=.26;signs.front.name=text+' sign';signs.back.name=text+' sign (reverse)';return board;}
const heritageSources=[
 {url:'https://www.whateversleft.co.uk/wp-content/uploads/2008/11/031.jpg',title:'DEVA ASYLUM · CORRIDOR',credit:'Public Deva archive · Whatevers Left'},
 {url:'https://www.whateversleft.co.uk/wp-content/uploads/2008/11/007-1.jpg',title:'DEVA ASYLUM · WARD',credit:'Public Deva archive · Whatevers Left'},
 {url:'https://basedinchurton.co.uk/wp-content/uploads/2025/05/cheshire-lunatic-asylum-report-1855-diagnosis.jpg?w=450',title:'1855 REPORT · DIAGNOSIS',credit:'Based in Churton · Cheshire reports'},
 {url:'https://basedinchurton.co.uk/wp-content/uploads/2025/05/total-forms-mental-disorder-asylum-1854-1867.jpg',title:'1854–1867 · FORMS OF DISORDER',credit:'Based in Churton · Cheshire reports'},
 {url:'https://basedinchurton.co.uk/wp-content/uploads/2025/05/1855-occupations-of-patients-admitted.jpg',title:'1855 REPORT · ADMISSIONS',credit:'Based in Churton · Cheshire reports'}
];
const localArtSources=[
 {url:'./art/front.png',title:'CHESHIRE LUNATIC ASYLUM · FRONT',credit:'Artwork supplied for the 1829 building'},
 {url:'./art/front2.png',title:'THE ASYLUM · FRONT VIEW',credit:'Artwork supplied for the 1829 building'},
 {url:'./art/front3.png',title:'THE ASYLUM · ARCHIVE VIEW',credit:'Artwork supplied for the 1829 building'},
 {url:'./art/annexe.png',title:'THE ASYLUM · ANNEXE',credit:'Artwork supplied for the 1829 building'},
 {url:'./art/annexe2.png',title:'THE ASYLUM · ANNEXE DETAIL',credit:'Artwork supplied for the 1829 building'},
 {url:'./art/chimney.png',title:'THE ASYLUM · CHIMNEY',credit:'Artwork supplied for the 1829 building'},
 {url:'./art/watertower.png',title:'THE ASYLUM · WATER TOWER',credit:'Artwork supplied for the 1829 building'},
 {url:'./art/cheshire-asylum-1860-discharge-etc.png',title:'CHESHIRE COUNTY ASYLUM · 1860',credit:'Artwork supplied for the 1829 building'}
];
function heritagePhotoTexture(item){
 const c=document.createElement('canvas');c.width=640;c.height=420;const g=c.getContext('2d');
 const drawFallback=()=>{g.fillStyle='#26372d';g.fillRect(0,0,640,420);g.fillStyle='#b9d5bd';g.font='bold 28px Arial';g.textAlign='center';g.fillText(item.title,320,190);g.font='20px Arial';g.fillText('Historical reference panel',320,230);g.font='16px Arial';g.fillStyle='#d4e8cd';g.fillText(item.credit,320,380);};
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;drawFallback();
 const image=new Image();image.crossOrigin='anonymous';image.onload=()=>{const w=600,h=330,scale=Math.max(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;g.fillStyle='#172219';g.fillRect(0,0,640,420);g.drawImage(image,(640-dw)/2,(h-dh)/2,dw,dh);g.fillStyle='rgba(12,24,17,.92)';g.fillRect(0,330,640,90);g.fillStyle='#d9f1c7';g.font='bold 22px Arial';g.textAlign='center';g.fillText(item.title,320,362);g.font='16px Arial';g.fillStyle='#b7d5ba';g.fillText(item.credit,320,390);texture.needsUpdate=true;};image.onerror=()=>{};image.src=item.url;return texture;
}
function heritagePlaqueTexture(){
 const c=document.createElement('canvas');c.width=640;c.height=420;const g=c.getContext('2d');g.fillStyle='#d8c79c';g.fillRect(0,0,640,420);g.strokeStyle='#4d3b25';g.lineWidth=10;g.strokeRect(16,16,608,388);g.fillStyle='#2d261b';g.textAlign='center';g.font='bold 30px Georgia';g.fillText('CHESHIRE ASYLUM · 1854',320,60);g.font='20px Georgia';g.fillText('A statistical note from the annual report',320,92);g.textAlign='left';g.font='bold 22px Arial';g.fillText('Average residents',54,142);g.fillText('Admissions',54,178);g.fillText('Epilepsy',54,214);g.fillText('General paralysis',54,250);g.fillText('Suicidal tendency',54,286);g.fillText('Attempts before admission',54,322);g.fillText('1 Jan 1855',54,358);g.textAlign='right';g.font='bold 22px Arial';g.fillText('255.75',586,142);g.fillText('102',586,178);g.fillText('8',586,214);g.fillText('9',586,250);g.fillText('42',586,286);g.fillText('26',586,322);g.fillText('254 patients · 108 men / 146 women',586,358);g.textAlign='center';g.font='14px Arial';g.fillStyle='#55462e';g.fillText('Historical terms and categories are transcribed from 19th-century reports.',320,388);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function heritageWallSurfaces(){
 const surfaces=[];
 for(let z=0;z<layout.height;z++)for(let x=0;x<layout.width;x++)if(layout.cells[z*layout.width+x])for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=x+dx,nz=z+dz,inside=nx>=0&&nx<layout.width&&nz>=0&&nz<layout.height&&layout.cells[nz*layout.width+nx];if(inside)continue;
  const px=x*layout.cellSize,pz=z*layout.cellSize,rotation=dx===1?-Math.PI/2:dx===-1?Math.PI/2:dz===1?Math.PI:0;
  surfaces.push({x:px+dx*layout.cellSize*.5-dx*.07,z:pz+dz*layout.cellSize*.5-dz*.07,rotation});
 }
 return surfaces;
}
function addHeritagePanel(surface,texture,name,width=1.48,height=1.02){
 const group=new THREE.Group();group.position.set(surface.x,1.88,surface.z);group.rotation.y=surface.rotation;scene.add(group);const panel=mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}),[0,0,.02],group);panel.name=name;placedWallPanels.push({x:surface.x,z:surface.z,floor:0});return panel;
}
function placeHeritagePanels(){
 const surfaces=heritageWallSurfaces();for(let i=0;i<surfaces.length;i+=30){if(i===0)addHeritagePanel(surfaces[i],heritagePlaqueTexture(),'1854 history plaque',1.58,1.04);else{const item=heritageSources[(i/30-1)%heritageSources.length];addHeritagePanel(surfaces[i],heritagePhotoTexture(item),item.title);}}
}
function localArtTexture(item){
 const c=document.createElement('canvas');c.width=640;c.height=420;const g=c.getContext('2d');
 const drawFallback=()=>{g.clearRect(0,0,640,420);};
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;drawFallback();
 const image=new Image();image.onload=()=>{const w=610,h=350,scale=Math.max(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;g.fillStyle='#152219';g.fillRect(0,0,640,420);g.drawImage(image,(640-dw)/2,(350-dh)/2,dw,dh);g.fillStyle='rgba(12,24,17,.9)';g.fillRect(0,350,640,70);g.fillStyle='#d9f1c7';g.font='bold 18px Arial';g.textAlign='center';g.fillText(item.title,320,378);g.font='14px Arial';g.fillStyle='#b7d5ba';g.fillText(item.credit,320,401);texture.needsUpdate=true;};image.onerror=()=>{};image.src=item.url;return texture;
}
function addLocalArtPanel(surface,item,floorIndex,index){
 const group=new THREE.Group();group.position.set(surface.x,1.88,surface.z);group.rotation.y=surface.rotation;scene.add(group);
 const panel=mesh(new THREE.PlaneGeometry(1.48,1.02),new THREE.MeshBasicMaterial({map:localArtTexture(item),side:THREE.DoubleSide,transparent:true}),[0,0,.02],group);
 panel.name=item.title+' wall art';placedWallPanels.push({x:surface.x,z:surface.z,floor:floorIndex});
 artPanels.push({panel,x:surface.x,z:surface.z,floor:floorIndex,rotation:surface.rotation,normalX:Math.sin(surface.rotation),normalZ:Math.cos(surface.rotation),title:item.title,credit:item.credit,url:item.url,index});
}
function placeLocalArtPanels(floorIndex){
 const surfaces=heritageWallSurfaces();const count=Math.min(12,surfaces.length),step=Math.max(1,Math.floor(surfaces.length/count));
 let placed=0;
 for(let i=0;i<surfaces.length&&placed<count;i++){
  const surface=surfaces[(i*step+floorIndex*7)%surfaces.length];
  if(placedWallPanels.some(p=>p.floor===floorIndex&&Math.hypot(p.x-surface.x,p.z-surface.z)<1.7))continue;
  addLocalArtPanel(surface,localArtSources[(placed+floorIndex*3)%localArtSources.length],floorIndex,placed++);
 }
}
function nearbyArt(){
 const forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw);let best=null,bestDistance=2.75;
 for(const art of artPanels){if(art.floor!==player.floor)continue;const dx=art.x-player.x,dz=art.z-player.z,d=Math.hypot(dx,dz);if(d>.001&&d<bestDistance){const viewerX=-dx/d,viewerZ=-dz/d,viewDot=forwardX*(dx/d)+forwardZ*(dz/d),normalDot=art.normalX*viewerX+art.normalZ*viewerZ;if(viewDot>.05&&normalDot>.15){best=art;bestDistance=d;}}}
 return best;
}
function openArtViewer(art){
 if(artViewing===art)return;artViewing=art;$('artViewerImage').src=art.url;$('artViewerImage').alt=art.title;$('artViewerTitle').textContent=art.title;$('artViewerCredit').textContent=art.credit;$('artViewer').hidden=false;$('interact').hidden=true;
}
function closeArtViewer(){if(!artViewing)return;artViewing=null;$('artViewer').hidden=true;}
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
function buildProcedural(){
 const floor=material(0x34382f),wall=material(0x697365),trim=material(0x273a2d);
 for(let z=0;z<layout.height;z++)for(let x=0;x<layout.width;x++)if(layout.cells[z*layout.width+x]){
  const px=x*layout.cellSize,pz=z*layout.cellSize,s=layout.cellSize;
  box([s,.24,s],[px,-.12,pz],floor);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(!layout.cells[(z+dz)*layout.width+x+dx]){
   const vertical=dx!==0;box([vertical?.18:s,3.6,vertical?s:.18],[px+dx*s*.5,1.8,pz+dz*s*.5],wall);
   box([vertical?.21:s+.06,.75,vertical?s+.06:.21],[px+dx*s*.5,0.6,pz+dz*s*.5],trim);
  }
 }
}
async function init(){
 try{
  layout=await fetch('./layout.json').then(r=>{if(!r.ok)throw Error('Level data could not load');return r.json();});
  floors=makeFloors(layout);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x101811);scene.fog=new THREE.FogExp2(0x101b14,.024);
  camera=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.05,150);camera.rotation.order='YXZ';
  scene.add(new THREE.HemisphereLight(0xb5c8a0,0x33372a,1.05));
  const groundSnapshot=new Set(scene.children);
  if(layout.geometrySource==='layout')buildArchitecture(THREE,scene,layout);
  else try{
   const gltf=await new GLTFLoader().loadAsync('./level.glb');scene.add(gltf.scene);modelLoaded=true;
   gltf.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;if(o.material){o.material.roughness=.88;if(o.material.name==='Glass'){o.material.emissive=new THREE.Color(0x3a5743);o.material.emissiveIntensity=.2;}}}});
  }catch(error){console.warn('Blender level unavailable; using the browser-safe layout fallback.',error);buildProcedural();}
  placeHeritagePanels();placeLocalArtPanels(0);
  for(const stair of layout.stairs||[]){lamp(stair.x*layout.cellSize,(stair.z+1)*layout.cellSize);label(stair.name+'|HOLD E TO GO UP',stair.x*layout.cellSize,2.6,stair.z*layout.cellSize);}
  for(let x=8;x<=32;x+=4)lamp(x*2.5,40);
  for(const x of [8,20,32])for(let z=5;z<=27;z+=6)if(layout.cells[z*layout.width+x])lamp(x*2.5,z*2.5,0xa3baa0);
  layout.exits.forEach((e,i)=>{lamp(e.x*2.5,e.z*2.5,0x77db97);label('EXIT '+(i+1)+'  →|'+e.name,e.x*2.5,2.8,e.z*2.5+(e.z===4?-.5:.5));});
  const roomLabels=[
   ['NECS Office',8,6,0],['Library',32,6,0],['MLCSU Office',8,13,0],
   ['Reception',20,14,0],['NHS England office',32,13,0],['Snug',8,23,0],['Arden and GEM office',32,23,0]
  ];
  roomLabels.forEach(([name,x,z,rotate])=>label(name+'|1829 BUILDING',x*2.5,2.7,z*2.5,rotate));
  floorGroups.push(groupSince(groundSnapshot,0));
  layout=floors[1];const upperSnapshot=new Set(scene.children);
  buildArchitecture(THREE,scene,layout);placeLocalArtPanels(1);
  for(const x of [14,26])for(const z of [8,12,16])lamp(x*layout.cellSize,z*layout.cellSize);
  for(const x of [18,22])for(const z of [8,16])lamp(x*layout.cellSize,z*layout.cellSize);
  for(const [x,z] of [[11,10],[29,10],[20,6]])lamp(x*layout.cellSize,z*layout.cellSize);
  for(const stair of layout.stairs)label(stair.name+'|HOLD E TO GO DOWN',stair.x*layout.cellSize,2.6,stair.z*layout.cellSize);
  label('UPPER GALLERY|BOTH STAIRS LEAD TO EXITS',20*layout.cellSize,2.7,16*layout.cellSize);
  floorGroups.push(groupSince(upperSnapshot,FLOOR_HEIGHT));layout=floors[0];floorGroups[1].visible=false;
  torch=new THREE.SpotLight(0xffe4af,24,30,.50,.55,1.2);torchTarget=new THREE.Object3D();scene.add(torch,torchTarget);torch.target=torchTarget;
  enemies=[['Sandra',8,9],['Security',32,23],['Deva asylum ghost',20,21]].map(([name,x,z],type)=>({name,type,floor:0,spawn:{x:x*2.5,z:z*2.5,floor:0},x:x*2.5,z:z*2.5,mesh:enemyModel(type),path:[],memory:0,rethink:0,route:0,target:null}));
  resetPositions();clock=new THREE.Clock();ready=true;$('start').disabled=false;$('start').innerHTML='ENTER THE BUILDING <span>↗</span>';animate();
 }catch(e){console.error(e);$('start').textContent='RELOAD TO TRY AGAIN';$('start').disabled=false;$('start').onclick=()=>location.reload();$('intro').textContent='The building could not load. Check your connection and reload. '+e.message;}
}
function resetPositions(){player.floor=0;showFloor();stairHold=0;stairLatch=false;mapRefresh=0;lastStep=0;lastPulse=0;camera.position.y=1.65;player.x=layout.spawn.x*layout.cellSize;player.z=layout.spawn.z*layout.cellSize;yaw=Math.PI;pitch=0;enemies.forEach(e=>{Object.assign(e,{...e.spawn,path:[],memory:0,rethink:0,route:0,target:null});e.mesh.position.set(e.x,0,e.z);e.mesh.visible=true;});}
function uiPlaying(value){document.body.classList.toggle('playing',value);$('menu').hidden=value;$('location').hidden=value;$('footer').hidden=value;$('hud').hidden=!value;$('pause').hidden=!value;$('touch').hidden=!value||!touch;}
function lock(){if(!touch&&canvas.requestPointerLock){try{const result=canvas.requestPointerLock();result?.catch(()=>{});}catch{}}}
function start(){if(!ready)return;escapeCutscene.reset();resetPositions();elapsed=0;stamina=1;hold=0;exhausted=false;keys.clear();state='play';torch.visible=true;uiPlaying(true);$('instructions').hidden=true;$('result').hidden=true;$('floorMap').hidden=true;audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume().catch(()=>{});lock();}
function pause(){if(state!=='play')return;closeArtViewer();state='paused';keys.clear();document.exitPointerLock?.();$('resultTag').textContent='TAKE A MOMENT';$('resultTitle').textContent='Hold your breath.';$('resultBody').textContent='The building will wait. Resume when you’re ready.';$('resume').hidden=false;$('retry').textContent='RESTART';$('result').hidden=false;}
function finish(won,who){closeArtViewer();state=won?'cutscene':'lost';keys.clear();document.exitPointerLock?.();$('resultTag').textContent=won?'OUTSIDE. AT LAST.':'THE BUILDING KEPT YOU';$('resultTitle').textContent=won?'You made it out.':'Return to office, 3 days per week';$('resultBody').textContent=won?`You escaped through ${who.toLowerCase()} in ${elapsed.toFixed(1)} seconds. Four other routes are waiting.`:`${who} captured you after ${elapsed.toFixed(1)} seconds. Break line of sight, save your sprint, and use the map to find a different route.`;$('resume').hidden=true;$('retry').textContent='TRY ANOTHER ROUTE ↗';$('result').hidden=won;$('interact').hidden=true;
 if(won){$('hud').hidden=true;$('touch').hidden=true;$('pause').hidden=true;escapeCutscene.start();}
}
function resume(){state='play';$('result').hidden=true;lock();}
function beep(hz,length,volume){if(!audioCtx||!audioOn)return;const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(hz*.5,t+length);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+length);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+length);}
function update(dt){
 if(artViewing){if(!keys.has('KeyE'))closeArtViewer();return;}
 elapsed+=dt;const sx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),sz=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),moving=!!(sx||sz);
 crouch=keys.has('ControlLeft')||keys.has('KeyC');if(stamina<.02)exhausted=true;if(stamina>.25)exhausted=false;
 sprint=keys.has('ShiftLeft')&&moving&&!crouch&&!exhausted;stamina=THREE.MathUtils.clamp(stamina+dt*(sprint?-.19:.115),0,1);
 const speed=crouch?1.6:sprint?5.8:3.1,n=Math.hypot(sx,sz)||1;
 const dx=(Math.cos(yaw)*sx-Math.sin(yaw)*sz)/n*speed*dt,dz=(-Math.sin(yaw)*sx-Math.cos(yaw)*sz)/n*speed*dt;
 if(walkable(layout,player.x+dx,player.z,.34))player.x+=dx;if(walkable(layout,player.x,player.z+dz,.34))player.z+=dz;
 footPhase+=dt*(moving?(sprint?14:9):0);camera.position.set(player.x,THREE.MathUtils.lerp(camera.position.y,player.floor*FLOOR_HEIGHT+(crouch?1.1:1.65),Math.min(1,dt*12))+(moving?Math.sin(footPhase)*.018:0),player.z);camera.rotation.set(pitch,yaw,0);
 if(moving&&!crouch&&elapsed-lastStep>(sprint?.30:.48)){beep(95,.11,sprint?.08:.035);lastStep=elapsed;}
 let nearest=99;const noise=sprint?22:crouch?2:moving?7:0;
 if(keys.has('KeyE')){enemies.forEach(e=>e.mesh.visible=e.floor===player.floor);}
 else for(const e of enemies){
  const sameFloor=e.floor===player.floor,enemyLayout=floors[e.floor];let distance=Math.hypot(e.x-player.x,e.z-player.z);e.mesh.visible=sameFloor;if(sameFloor)nearest=Math.min(nearest,distance);if(elapsed<5)continue;
  const seen=sameFloor&&distance<(crouch?8:e.type===1?22:16)&&visible(enemyLayout,e,player),heard=sameFloor&&e.type===0&&distance<noise;
  if(seen||heard||e.type===2){e.target={...player};e.memory=e.type===0?8:5;}else e.memory=Math.max(0,e.memory-dt);
  e.rethink-=dt;if(e.rethink<=0){e.rethink=.45;if(e.memory<=0&&(!e.path.length||Math.hypot(e.x-e.target?.x,e.z-e.target?.z)<1)){const routes=e.floor===1?[[14,8],[26,8],[26,16],[14,16]]:e.type===0?[[8,16],[20,22],[32,16],[20,11]]:[[32,26],[8,26],[8,5],[32,5]],r=routes[e.route++%4];e.target={x:r[0]*layout.cellSize,z:r[1]*layout.cellSize,floor:e.floor};}if(e.target)e.path=routeBetweenFloors(floors,e,e.target);}
  let speed=e.type===0?(e.memory?3.55:2.1):e.type===1?(e.memory?3.85:2.4):2.2;
  if(sameFloor&&e.type===2&&torch.visible&&distance<23&&visible(layout,player,e)){camera.getWorldDirection(tmp);const dot=(tmp.x*(e.x-player.x)+tmp.z*(e.z-player.z))/(distance||1);if(dot>.88)speed=.55;}
  const target=e.path[0];if(target&&target.floor!==e.floor){const stair=nearStair(floors,e);if(changeFloor(floors,e,stair))e.path.shift();else e.path=[];}else if(target){const vx=target.x-e.x,vz=target.z-e.z,d=Math.hypot(vx,vz),step=Math.min(speed*dt,d);if(d>.001){e.x+=vx/d*step;e.z+=vz/d*step;e.mesh.rotation.y=Math.atan2(vx,vz);}if(d<.08&&e.path.length)e.path.shift();}
  e.mesh.position.set(e.x,e.floor*FLOOR_HEIGHT+(e.type===2?Math.sin(elapsed*2)*.11:Math.sin(elapsed*8)*.025),e.z);e.mesh.visible=e.floor===player.floor;
  if(e.floor===player.floor&&Math.hypot(e.x-player.x,e.z-player.z)<.8){finish(false,e.name);break;}
 }
 if(state!=='play')return;
 if(nearest<15&&elapsed-lastPulse>THREE.MathUtils.mapLinear(Math.min(nearest,15),0,15,.35,1.2)){beep(52,.18,.1*(1-nearest/18));lastPulse=elapsed;}
 $('warning').textContent=elapsed<5?'YOU HAVE A FIVE-SECOND HEAD START':nearest<4?'SOMEONE IS VERY CLOSE':nearest<10?'YOU ARE NOT ALONE':'';

  const stair=nearStair(floors,player),exit=nearExit(layout,player),art=nearbyArt();
 if(!keys.has('KeyE'))stairLatch=false;
  $('interact').hidden=!stair&&!exit&&!art;
 if(stair){
  hold=0;$('interact').querySelector('b').textContent=player.floor?'HOLD E TO GO DOWN':'HOLD E TO GO UP';
  $('exitName').textContent=stair.name;stairHold=keys.has('KeyE')&&!stairLatch?stairHold+dt:0;
  $('exitFill').style.width=Math.min(100,stairHold/.8*100)+'%';
  if(stairHold>=.8&&changeFloor(floors,player,stair)){
   stairHold=0;stairLatch=true;showFloor();camera.position.y=player.floor*FLOOR_HEIGHT+(crouch?1.1:1.65);
   camera.position.x=player.x;camera.position.z=player.z;
   enemies.forEach(e=>{if(e.memory>0||e.type===2){e.target={...player};e.rethink=0;}e.mesh.visible=e.floor===player.floor;});
   drawMap();
  }
  }else if(art){
   stairHold=0;hold=0;$('interact').querySelector('b').textContent='HOLD E TO VIEW';$('exitName').textContent=art.title;$('exitFill').style.width='0%';if(keys.has('KeyE'))openArtViewer(art);
  }else{
  stairHold=0;
  if(exit){$('interact').querySelector('b').textContent='HOLD E TO ESCAPE';$('exitName').textContent=exit.name;hold=keys.has('KeyE')&&!stairLatch?hold+dt:0;$('exitFill').style.width=Math.min(100,hold/1.2*100)+'%';if(hold>=1.2)finish(true,exit.name);}else hold=0;
 }
 $('timer').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;$('staminaFill').style.width=stamina*100+'%';$('stance').textContent=sprint?'SPRINTING · LOUD':crouch?'CROUCHING · QUIET':'STAMINA';
 mapRefresh-=dt;if(mapRefresh<=0){mapRefresh=.12;drawMap();}
}
function drawMapCanvas(c,s){c.clearRect(0,0,c.canvas.width,c.canvas.height);c.fillStyle='#0b120d';c.fillRect(0,0,c.canvas.width,c.canvas.height);for(let z=0;z<layout.height;z++)for(let x=0;x<layout.width;x++)if(layout.cells[z*layout.width+x]){c.fillStyle='#263d2d';c.fillRect(x*s+.8,z*s+.8,s-1.6,s-1.6);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,inside=nx>=0&&nx<layout.width&&nz>=0&&nz<layout.height&&layout.cells[nz*layout.width+nx];if(!inside){c.strokeStyle='#a7bea0';c.lineWidth=Math.max(1,s*.16);c.beginPath();if(dx!==0){const wx=(dx===1?x+1:x)*s;c.moveTo(wx,z*s);c.lineTo(wx,(z+1)*s);}else{const wz=(dz===1?z+1:z)*s;c.moveTo(x*s,wz);c.lineTo((x+1)*s,wz);}c.stroke();}}}
 const stairs=layout.stairs||[];for(const stair of stairs){const sx=stair.x*s+s*.5,sz=stair.z*s+s*.5;c.fillStyle='#d3ad70';c.fillRect(sx-s*.32,sz-s*.32,s*.64,s*.64);c.strokeStyle='#513b24';c.lineWidth=Math.max(1,s*.08);for(let n=-1;n<=1;n++){c.beginPath();c.moveTo(sx-s*.28,sz+n*s*.12);c.lineTo(sx+s*.28,sz+n*s*.12);c.stroke();}c.fillStyle='#241b12';c.font=`bold ${Math.max(7,s*1.05)}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText(stair.direction==='UP'?'U':'D',sx,sz);c.textAlign='left';c.textBaseline='alphabetic';}
 layout.exits.forEach((e,i)=>{c.fillStyle='#c7e19b';c.fillRect(e.x*s-s*.28,e.z*s-s*.28,s*.56,s*.56);c.font=`bold ${Math.max(8,s*1.2)}px Arial`;c.fillText(i+1,e.x*s+s*.65,e.z*s+s*.35);});
 const px=player.x/layout.cellSize*s+s*.5,pz=player.z/layout.cellSize*s+s*.5;c.fillStyle='#fff8db';c.beginPath();c.arc(px,pz,Math.max(2,s*.38),0,7);c.fill();c.strokeStyle='#fff8db';c.lineWidth=Math.max(1,s*.12);c.beginPath();c.moveTo(px,pz);c.lineTo(px-Math.sin(yaw)*s*1.2,pz-Math.cos(yaw)*s*1.2);c.stroke();
 for(const e of enemies){if(e.floor!==player.floor)continue;const ex=e.x/layout.cellSize*s+s*.5,ez=e.z/layout.cellSize*s+s*.5;c.fillStyle=e.type===0?'#e59a83':e.type===2?'#8fe0c4':'#e1c278';c.beginPath();c.arc(ex,ez,Math.max(2,s*.42),0,7);c.fill();c.fillStyle='#101810';c.font=`bold ${Math.max(7,s*1.1)}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText(e.type===0?'S':e.type===2?'G':'K',ex,ez);c.textAlign='left';c.textBaseline='alphabetic';}
}
function drawMap(){drawMapCanvas(mapContext,10);drawMapCanvas(miniMapContext,5);}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(state==='cutscene'){if(!document.hidden)escapeCutscene.update(dt);return;}if(state==='play')update(dt);else if(state==='menu'){const t=performance.now()/1000;camera.position.set(50,1.7,31);camera.rotation.set(-.035,Math.PI+.12+Math.sin(t*.13)*.07,0);}
 camera.getWorldDirection(tmp);torch.position.copy(camera.position);torchTarget.position.copy(camera.position).addScaledVector(tmp,12);renderer.render(scene,camera);}
$('start').onclick=start;$('help').onclick=()=>{$('instructions').hidden=false;};$('closeHelp').onclick=()=>{$('instructions').hidden=true;};$('footageOpen').onclick=()=>{$('footage').hidden=false;};$('closeFootage').onclick=()=>{$('footage').hidden=true;};$('helpPlay').onclick=start;$('retry').onclick=start;$('resume').onclick=resume;$('pause').onclick=pause;$('audio').onchange=e=>audioOn=e.target.checked;
function toggleMap(){if(state==='play'){$('floorMap').hidden=!$('floorMap').hidden;drawMap();}}
addEventListener('keydown',e=>{if(state==='cutscene'){if(['Escape','Space','Enter'].includes(e.code)){e.preventDefault();escapeCutscene.skip();}return;}if(['Tab','Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Escape'||e.code==='KeyP'){if(state==='play')pause();else if(state==='paused')resume();return;}if(state!=='play')return;keys.add(e.code);if(e.code==='KeyF')torch.visible=!torch.visible;if(e.code==='Tab'||e.code==='KeyM')toggleMap();});
 addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='KeyE')closeArtViewer();});addEventListener('blur',()=>{keys.clear();closeArtViewer();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&state==='play'&&!touch)pause();});
function look(dx,dy){const s=Number($('sensitivity').value)*.0018;yaw-=dx*s;pitch=THREE.MathUtils.clamp(pitch-dy*s,-1.3,1.3);}
addEventListener('mousemove',e=>{if(state==='play'&&document.pointerLockElement===canvas)look(e.movementX,e.movementY);});
canvas.addEventListener('pointerdown',e=>{if(state!=='play')return;dragging=true;previousPointer=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(dragging&&state==='play'&&document.pointerLockElement!==canvas){look(e.clientX-previousPointer[0],e.clientY-previousPointer[1]);previousPointer=[e.clientX,e.clientY];}});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
 document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(b.dataset.key);b.setPointerCapture(e.pointerId);});for(const t of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(t,()=>{keys.delete(b.dataset.key);if(b.dataset.key==='KeyE')closeArtViewer();});});$('touchMap').onclick=toggleMap;$('touchTorch').onclick=()=>torch.visible=!torch.visible;if(touch)document.body.classList.add('touch');
addEventListener('resize',()=>{if(renderer){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}});
init();
