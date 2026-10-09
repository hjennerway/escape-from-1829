import {captureOutcome} from './capture-outcome.mjs';
import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {path,walkable,visible,nearExit} from './core.mjs';
import {buildArchitecture,interiorWallSurfaces} from './architecture.mjs';
import {createInteriorLights} from './interior-lights.mjs';
import {createEscapeCutscene} from './escape-cutscene.mjs';
import {loadEscapeFrontage} from './escape-exterior.mjs';
import {createLandingExterior,ESCAPE_SUN_OFFSETS} from './landing-scene.mjs';
import {bindTreeToggle} from './tree-layer.mjs';
import {sampleLanding} from './aerial-controls.mjs';
import {createArrivalCutscene} from './arrival-cutscene.mjs';
import {createSecurityGuard,updateSecurityGuard,resetSecurityGuard} from './security-guard.mjs';
import {createAsylumGhost,updateAsylumGhost,resetAsylumGhost} from './asylum-ghost.mjs';
import {resetEnemyRoomSearch,updateEnemyRoomSearch} from './enemy-room-search.mjs';
import {FLOOR_HEIGHT,makeFloors,nearStair,changeFloor,routeBetweenFloors} from './floors.mjs';
import {selectEscapeRoutes,exitDirection} from './escape-routes.mjs';
import {buildAsylumLayout,moveAsylumActor,stairRoute} from './asylum-layout.mjs';
import {furnishAsylum} from './asylum-furniture.mjs';
import {loadFurnitureModels,createFurnitureFloor,updateFurnitureDetail} from './furniture-models.mjs';
import {furnitureContains} from './furniture-collision.mjs';
import {createReceptionClockAudio} from './reception-clock-audio.mjs';
import {createDoorCreakAudio} from './door-creak-audio.mjs';
import {createTowerAudio} from './tower-audio.mjs';
import {createAsylumOutside} from './asylum-outside.mjs';
import {createAsylumJump} from './asylum-jump.mjs';
import {createNotebook,notebookView} from './notebook.mjs';
import {drawNotebookMap} from './notebook-map.mjs';
import {bindDeveloperOptions} from './developer-options.mjs';
import {createLoadingProgress} from './loading-progress.mjs';
import {createMouseCapture} from './mouse-capture.mjs';
import {createEscapeProgress,MAST,CAPTURE_LIMIT} from './escape-progress.mjs';
import {createEscapeWorld,createEscapeLandmark,outdoorPath} from './escape-world.mjs';
import {createEscapeGrounds} from './escape-grounds.mjs';
import {TOWER_WORKSHOPS} from './tower-workshops.mjs';
import {createGroundsGuard,GUARD_PATROL,GROUNDS_OUTLINE} from './escape-grounds-state.mjs';
import {asylumDisplayName} from './asylum-room-numbers.mjs';
import {createInteriorSectionLoader} from './interior-streaming.mjs';
import {createInteriorLoadingStatus} from './interior-loading-status.mjs';
import {createCorridorSightings} from './corridor-sightings.mjs';
const $=id=>document.getElementById(id),canvas=$('game');
const furnitureFloors=[];
const loading=createLoadingProgress(document);
const keys=new Set(),touch=matchMedia('(pointer:coarse)').matches;
const mouseCapture=createMouseCapture(canvas,{enabled:!touch,onLost:()=>pause()});
const INTERACTION_HOLD_SECONDS=.5;
let previousDiagnosis;
const SPOTTED_CLEAR_DISTANCE=26;
let spotted=false;
let layout,renderer,scene,camera,torch,torchTarget,clock,ready=false,state='menu',elapsed=0,stamina=1,yaw=0,pitch=0,hold=0,sprint=false,crouch=false,exhausted=false;
let enemies=[],lights=[],audioCtx,audioOn=true,lastStep=0,lastPulse=0,footPhase=0,dragging=false,previousPointer=null,modelLoaded=false;
const receptionClock=createReceptionClockAudio({getFloors:()=>floors,getContext:()=>audioCtx,enabled:()=>audioOn});
const doorCreak=createDoorCreakAudio({getContext:()=>audioCtx,enabled:()=>audioOn});
const towerAudio=createTowerAudio({getContext:()=>audioCtx,enabled:()=>audioOn});
let lastTowerGuardStep=0;
const player={x:50,z:27.5,floor:0},mapCanvas=$('map'),mapContext=mapCanvas.getContext('2d'),miniMapCanvas=$('miniMap'),miniMapContext=miniMapCanvas.getContext('2d');
let mapRefresh=0,floors=[],floorGroups=[],stairHold=0,stairLatch=false,artPanels=[],artViewing=null,placedWallPanels=[];
let exterior,arrivalCutscene,escapeExterior,interiorLights,landingTime=0;
let outsideWalker,indoorJump,lastDoor=null,exteriorTorch,exteriorTorchTarget,firstRunPrepared=false;
let torchEnabled=true;
let interiorLoader=null,corridorSightings=null,updateLoadingStatus=()=>{};
const modern=()=>floors[0]?.geometrySource==='asylum-plan';
const floorHeight=actor=>floors[actor.floor]?.elevation??actor.floor*FLOOR_HEIGHT;
let notebook,notebookFloor,notebookReadRevision=0;
let developer,mapPreviousState;
let escapeProgress,escapeWorld,recoveryRemaining=0,enemyReleaseAt=5,messageUntil=0,interactionMessage='';
let outdoorGuardActive=false,escapeGrounds=null,groundsGuard=null;
const landingReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.addEventListener('capture-intro',({detail})=>{
 if(!ready||state!=='menu')return;
 // Read immediately after rendering; WebGL normally clears its drawing buffer.
 renderAerialBackdrop(exterior);
 const preview=document.createElement('canvas'),scale=Math.min(1,1280/canvas.width);
 preview.width=Math.round(canvas.width*scale);preview.height=Math.round(canvas.height*scale);
 preview.getContext('2d').drawImage(canvas,0,0,preview.width,preview.height);
 Object.assign(detail,{position:exterior.camera.position.toArray(),quaternion:exterior.camera.quaternion.toArray(),fov:exterior.camera.fov,target:[0,10,19.8]});
 try{detail.preview=preview.toDataURL('image/jpeg',.85);}catch{}
});
const escapeCutscene=createEscapeCutscene($('escapeCutscene'),()=>{
 if(state!=='cutscene')return;
 state='won';$('result').hidden=false;$('retry').focus();
},{reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,getCamera:()=>escapeExterior?.camera});
function groupSince(snapshot,height){const group=new THREE.Group();for(const o of [...scene.children])if(!snapshot.has(o))group.add(o);group.position.y=height;scene.add(group);return group;}
function outsideAreaName(){return (escapeGrounds?.tower?.areaAt(player)??escapeGrounds?.workshops.areaAt(player))?.toUpperCase()??'GROUNDS';}
function showFloor(){layout=floors[player.floor];floorGroups.forEach((g,i)=>g.visible=!player.outside&&(modern()||i===player.floor));interiorLights?.update(player);if(camera){camera.near=player.outside?.18:.05;camera.far=player.outside?600:150;camera.updateProjectionMatrix();}const name=player.outside?outsideAreaName():modern()?layout.name.toUpperCase():player.floor?'UPPER FLOOR':'GROUND FLOOR';$('floorName').textContent=name;$('floorExits').textContent=modern()?'NOTEBOOK · N':layout.exits.length+' EXITS THIS FLOOR';$('miniFloorName').textContent=name;updateObjective();}
function updateObjective(dt=0){
 const next=escapeProgress?.objective(player,dt)??{title:'Find a way outside.',detail:''};
 if($('objectiveTitle').textContent!==next.title)$('objectiveTitle').textContent=next.title;
 if($('objectiveDetail').textContent!==next.detail)$('objectiveDetail').textContent=next.detail;
 $('objectiveDetail').hidden=!next.detail;
}
const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.88,...extra});
const tmp=new THREE.Vector3();
function mesh(geometry,mat,p,parent=scene){const m=new THREE.Mesh(geometry,mat);m.position.set(...p);parent.add(m);return m;}
function box(size,p,mat,parent){return mesh(new THREE.BoxGeometry(...size),mat,p,parent);}
function lamp(x,z,color=0xffdbac){const floor=floorGroups.length;lights.push({x,z,y:(layout.elevation??floor*FLOOR_HEIGHT)+(floor===2?2.35:2.9),floor,color});}
function lightFloor(){
 if(modern()){for(const c of layout.corridors)for(let i=1;i<c.points.length;i++){const a=c.points[i-1],b=c.points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6));for(let k=0;k<n;k++)lamp(a[0]+(b[0]-a[0])*(k+.5)/n,a[1]+(b[1]-a[1])*(k+.5)/n);}for(const r of layout.rooms)lamp(r.label[0],r.label[1]);return;}
 for(let z=0;z<layout.height;z++)for(let x=0;x<layout.width;x++){
  if(layout.cells[z*layout.width+x]&&((z===layout.galleryZ&&x%4===0)||(z%4===0&&x%4===0)))lamp(x*layout.cellSize,z*layout.cellSize);
 }
 for(const stair of layout.stairs)lamp(stair.x*layout.cellSize,stair.z*layout.cellSize);
}
function twoSidedTextPlane(geometry,texture,frontPosition,parent){
 const mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.FrontSide});
 const front=mesh(geometry,mat,frontPosition,parent);
 const back=mesh(geometry.clone(),mat,[frontPosition[0],frontPosition[1],-frontPosition[2]],parent);
 back.rotation.y=Math.PI;
 return {front,back};
}
function label(text,x,y,z,rotate=0,backed=false){const c=document.createElement('canvas');c.width=640;c.height=192;const g=c.getContext('2d');g.clearRect(0,0,640,192);if(backed){g.fillStyle='#163422';g.fillRect(0,0,640,192);g.strokeStyle='#8ab49a';g.lineWidth=8;g.strokeRect(4,4,632,184);}g.textAlign='center';g.fillStyle='#d9f1c7';const title=text.split('|')[0],size=title.length>17?42:title.length>12?50:62;g.font=`bold ${size}px Arial`;g.fillText(title,320,85);g.font='22px Arial';g.fillText(text.split('|')[1]||'',320,141);const signGroup=new THREE.Group();signGroup.position.set(x,y,z);signGroup.rotation.y=rotate;scene.add(signGroup);const texture=new THREE.CanvasTexture(c);twoSidedTextPlane(new THREE.PlaneGeometry(2.35,.72),texture,[0,0,.012],signGroup);}
const heritageSources=[
 {url:'https://www.whateversleft.co.uk/wp-content/uploads/2008/11/031.jpg',title:'DEVA ASYLUM · CORRIDOR',credit:'Public Deva archive · Whatevers Left'},
 {url:'https://www.whateversleft.co.uk/wp-content/uploads/2008/11/007-1.jpg',title:'DEVA ASYLUM · WARD',credit:'Public Deva archive · Whatevers Left'},
 {url:'https://basedinchurton.co.uk/wp-content/uploads/2025/05/cheshire-lunatic-asylum-report-1855-diagnosis.jpg?w=450',title:'1855 REPORT · DIAGNOSIS',credit:'Based in Churton · Cheshire reports'},
 {url:'https://basedinchurton.co.uk/wp-content/uploads/2025/05/total-forms-mental-disorder-asylum-1854-1867.jpg',title:'1854–1867 · FORMS OF DISORDER',credit:'Based in Churton · Cheshire reports'},
 {url:'https://basedinchurton.co.uk/wp-content/uploads/2025/05/1855-occupations-of-patients-admitted.jpg',title:'1855 REPORT · ADMISSIONS',credit:'Based in Churton · Cheshire reports'}
];
const localArtSources=[
 {url:'./art/front.png',title:'CHESHIRE LUNATIC ASYLUM · FRONT'},
 {url:'./art/front2.png',title:'THE ASYLUM · FRONT VIEW'},
 {url:'./art/front3.png',title:'THE ASYLUM · ARCHIVE VIEW'},
 {url:'./art/annexe.png',title:'THE ASYLUM · ANNEXE'},
 {url:'./art/annexe2.png',title:'THE ASYLUM · ANNEXE DETAIL'},
 {url:'./art/chimney.png',title:'THE ASYLUM · CHIMNEY'},
 {url:'./art/watertower.png',title:'THE ASYLUM · WATER TOWER'},
 {url:'./art/cheshire-asylum-1860-discharge-etc.png',title:'CHESHIRE COUNTY ASYLUM · 1860'},
 {url:'./art/asylum-winter-moonlight.png',title:'THE ASYLUM · WINTER MOONLIGHT',imageOnly:true,aspect:1376/918},
 {url:'./art/asylum-service-tunnels.png',title:'THE ASYLUM · SERVICE TUNNELS'},
 {url:'./art/daily-account-patients-1854.png',title:'DAILY ACCOUNT OF PATIENTS · 1854'}
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
 const open=(x,z)=>x>=0&&z>=0&&x<layout.width&&z<layout.height&&layout.cells[z*layout.width+x]===1;
 return interiorWallSurfaces(layout).filter(({cellX:x,cellZ:z,window})=>{
  // Narrow passage walls carry projecting arch piers that would cover the image.
  const arch=z<layout.galleryZ-2&&!open(x-1,z)&&!open(x+1,z)&&open(x,z-1)&&open(x,z+1);
  return !window&&!arch;
 }).map(({x,z,dx,dz,rotation})=>({x:x-dx*.115,z:z-dz*.115,rotation})).filter(s=>!(layout.furnitureObstacles??[]).some(item=>item.height>1.2&&furnitureContains(item,s.x,s.z,.9)));
}
function addHeritagePanel(surface,texture,name,width=1.48,height=1.02,item){
 const group=new THREE.Group();group.position.set(surface.x,1.88,surface.z);group.rotation.y=surface.rotation;scene.add(group);const panel=mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}),[0,0,.02],group);panel.name=name;placedWallPanels.push({x:surface.x,z:surface.z,floor:0});
 artPanels.push({panel,x:surface.x,z:surface.z,floor:0,rotation:surface.rotation,normalX:Math.sin(surface.rotation),normalZ:Math.cos(surface.rotation),title:name,url:item?.url??texture.image?.toDataURL?.('image/png')??'',credit:item?.credit,clueId:item?undefined:'1854-plaque'});return panel;
}
function placeHeritagePanels(){
 const surfaces=heritageWallSurfaces();for(let i=0;i<surfaces.length;i+=30){if(i===0)addHeritagePanel(surfaces[i],heritagePlaqueTexture(),'1854 history plaque',1.58,1.04);else{const item=heritageSources[(i/30-1)%heritageSources.length];addHeritagePanel(surfaces[i],heritagePhotoTexture(item),item.title,1.48,1.02,item);}}
}
function localArtTexture(item){
 const c=document.createElement('canvas');c.width=640;c.height=item.imageOnly?Math.round(640/item.aspect):420;const g=c.getContext('2d');
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
 const image=new Image();image.onload=()=>{
  if(item.imageOnly){g.drawImage(image,0,0,c.width,c.height);texture.needsUpdate=true;return;}
  const imageAreaHeight=item.credit?350:375,w=610,h=imageAreaHeight-20;
  const scale=Math.min(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;
  g.fillStyle='#152219';g.fillRect(0,0,640,420);g.drawImage(image,(640-dw)/2,(imageAreaHeight-dh)/2,dw,dh);
  g.fillStyle='rgba(12,24,17,.9)';g.fillRect(0,imageAreaHeight,640,420-imageAreaHeight);
  g.fillStyle='#d9f1c7';g.font='bold 18px Arial';g.textAlign='center';g.fillText(item.title,320,item.credit?378:403);
  if(item.credit){g.font='14px Arial';g.fillStyle='#b7d5ba';g.fillText(item.credit,320,401);}
  texture.needsUpdate=true;
 };image.onerror=()=>{};image.src=item.url;return texture;
}
function addLocalArtPanel(surface,item,floorIndex,index){
 const group=new THREE.Group();group.position.set(surface.x,1.88,surface.z);group.rotation.y=surface.rotation;scene.add(group);
 const panel=mesh(new THREE.PlaneGeometry(1.48,item.imageOnly?1.48/item.aspect:1.02),new THREE.MeshBasicMaterial({map:localArtTexture(item),side:THREE.DoubleSide,transparent:true}),[0,0,.02],group);
 panel.name=item.title+' wall art';placedWallPanels.push({x:surface.x,z:surface.z,floor:floorIndex});
 artPanels.push({panel,x:surface.x,z:surface.z,floor:floorIndex,rotation:surface.rotation,normalX:Math.sin(surface.rotation),normalZ:Math.cos(surface.rotation),title:item.title,credit:item.credit,url:item.url,imageOnly:!!item.imageOnly,index});
}
function placeLocalArtPanels(floorIndex){
 // Shuffle once at load; keep every image on each floor and interaction points clear.
 const markers=[...(layout.stairs||[]),...(layout.exits||[])];
 const surfaces=heritageWallSurfaces().filter(s=>!markers.some(m=>Math.hypot(m.x*layout.cellSize-s.x,m.z*layout.cellSize-s.z)<3.5));
 for(let i=surfaces.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[surfaces[i],surfaces[j]]=[surfaces[j],surfaces[i]];}
 const count=Math.min(12,surfaces.length);
 let placed=0;
 for(const surface of surfaces){
  if(placed===count)break;
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
 if(artViewing===art)return;artViewing=art;$('artViewer').classList.toggle('image-only',art.imageOnly);$('artViewerImage').src=art.url;$('artViewerImage').alt=art.title;$('artViewerTitle').textContent=art.title;$('artViewerCredit').textContent=art.credit||'';$('artViewerCredit').hidden=!art.credit;$('artViewer').hidden=false;$('interact').hidden=true;
 notebook.recordArt(art);updateNotebookBadge();
}
function closeArtViewer(){if(!artViewing)return;artViewing=null;$('artViewer').hidden=true;}
function enemyModel(type){
 const group=type===1?createSecurityGuard(THREE):createAsylumGhost(THREE);
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
  await loading.step(2,'Reading the floor plans…');
  layout=await fetch('./asylum-plan.json').then(r=>{if(!r.ok)throw Error('Level data could not load');return r.json();});
  await loading.step(8,'Connecting rooms and staircases…');
  if(layout.floors?.[0]?.outline)layout=buildAsylumLayout(layout);
  const outsideStairs=layout.plan?.outsideStairs??[];
  floors=layout.geometrySource==='asylum-plan'?makeFloors(layout):selectEscapeRoutes(makeFloors(layout));layout=floors[0];
  let furnitureModels;
  if(modern()){furnishAsylum(floors,{seed:Math.floor(Math.random()*4294967296)});furnitureModels=await loadFurnitureModels(THREE);}
  notebook=createNotebook(floors,{outsideStairs,groundsOutline:modern()?GROUNDS_OUTLINE:null,groundsPlan:modern()?TOWER_WORKSHOPS:null});
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x343731);scene.fog=new THREE.FogExp2(0x343731,.018);
  camera=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.05,150);camera.rotation.order='YXZ';
  scene.add(new THREE.HemisphereLight(0xc5d6d4,0x686253,1.1));
  for(let floorIndex=0;floorIndex<floors.length;floorIndex++){
  await loading.step(20+Math.round(40*floorIndex/floors.length),'Preparing '+(floors[floorIndex].name?.toLowerCase()??(floorIndex?'the first floor':'the ground floor'))+'…');
  layout=floors[floorIndex];const groundSnapshot=new Set(scene.children);
  if(layout.geometrySource==='layout')buildArchitecture(THREE,scene,layout);
  else if(!modern())try{
   const gltf=await new GLTFLoader().loadAsync('./level.glb');scene.add(gltf.scene);modelLoaded=true;
   gltf.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;if(o.material){o.material.roughness=.88;if(o.material.name==='Glass'){o.material.emissive=new THREE.Color(0x3a5743);o.material.emissiveIntensity=.2;}}}});
  }catch(error){console.warn('Blender level unavailable; using the browser-safe layout fallback.',error);buildProcedural();}
  if(floorIndex===0)placeHeritagePanels();placeLocalArtPanels(floorIndex);
  for(const stair of layout.stairs||[]){const name=asylumDisplayName(stair.name);lamp(stair.x*layout.cellSize,(stair.z+1)*layout.cellSize);label(stair.id?stair.id+' · '+name+'|WALK THE STAIRS':name+'|HOLD E TO GO '+(floorIndex?'DOWN':'UP'),stair.x*layout.cellSize,2.6,stair.z*layout.cellSize);}
  lightFloor();
  floorGroups.push(groupSince(groundSnapshot,layout.elevation??floorIndex*FLOOR_HEIGHT));
  }layout=floors[0];floorGroups.forEach((g,i)=>g.visible=modern()||i===0);
  await loading.step(60,'Preparing lights and characters…');
  interiorLights=createInteriorLights(THREE,scene,lights);
  torch=new THREE.SpotLight(0xfff3da,20,30,.50,.55,1.2);torchTarget=new THREE.Object3D();scene.add(torch,torchTarget);torch.target=torchTarget;
  if(modern()){
   interiorLoader=createInteriorSectionLoader(THREE,{scene,floors,models:furnitureModels,renderer,camera,floorGroups});
   furnitureFloors.push(...interiorLoader.furniture);updateLoadingStatus=createInteriorLoadingStatus(document,interiorLoader);
   await interiorLoader.prepare({x:layout.spawn.x*layout.cellSize,z:layout.spawn.z*layout.cellSize,floor:0});
   corridorSightings=createCorridorSightings(THREE,scene,floors,{isReady:actor=>interiorLoader.isReady(actor)});
  }
  enemies=layout.enemies.map(({name,x,z,type})=>({name,type,floor:0,spawn:{x:x*layout.cellSize,z:z*layout.cellSize,floor:0},x:x*layout.cellSize,z:z*layout.cellSize,mesh:enemyModel(type),path:[],memory:0,rethink:0,route:0,target:null}));
  await loading.step(65,'Preparing the surrounding grounds…');
  escapeExterior=await createLandingExterior(THREE,innerWidth/innerHeight,renderer,{sunOffsets:ESCAPE_SUN_OFFSETS});
  canvas.addEventListener('webglcontextrestored',escapeExterior.invalidateShadows);
  bindTreeToggle(escapeExterior,document,()=>outsideWalker?.refresh());
  await loading.step(85,'Loading the exterior details…');
  await loadEscapeFrontage(THREE,escapeExterior);
  await loading.step(90,'Connecting the outside doors and stairs…');
  if(modern()){createEscapeLandmark(THREE,escapeExterior);outsideWalker=createAsylumOutside(THREE,escapeExterior);indoorJump=createAsylumJump(floors,{allowMove:(a,b)=>(escapeWorld?.allowMove(a,b)??true)&&(interiorLoader?.allowMove(a,b)??true)});}
  exterior=escapeExterior;
  if(modern()){
   // Keep the spotlight count fixed in both scenes. Moving one light between
   // them forces the estate's materials to compile again at the first door.
   exteriorTorch=torch.clone();exteriorTorch.intensity=0;exteriorTorchTarget=new THREE.Object3D();exteriorTorch.target=exteriorTorchTarget;exterior.scene.add(exteriorTorch,exteriorTorchTarget);
   prepareEscapeScenario();firstRunPrepared=true;
  }
  if(renderer.shadowMap){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;}
  arrivalCutscene=createArrivalCutscene({camera:exterior.camera,overlay:$('arrivalFade'),
    reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
    onEnter(){resetPositions();camera.position.set(player.x,1.65,player.z);camera.rotation.set(pitch,yaw,0);},
    onComplete(){if(state!=='arrival')return;keys.clear();state='play';uiPlaying(true);drawMap();if(!touch&&canvas.requestPointerLock&&!mouseCapture.pending&&document.pointerLockElement!==canvas)pause();}
  });
  resetPositions();clock=new THREE.Timer();clock.connect(document);
  developer=bindDeveloperOptions({THREE,exterior,plan:async()=>({floors,outsideStairs}),getMapState:()=>({player,enemies,yaw}),onDoorsChange:modern()?unlocked=>{escapeProgress.setDoorsUnlocked(unlocked);syncEscapeWorld();}:null,onChange:()=>{if(state==='notebook')renderNotebook();drawMap();},onMapChange:show=>{
   if(show){
    mapPreviousState=state==='notebook'?'play':state;closeArtViewer();closeNotebook(false);keys.clear();hold=0;stairHold=0;dragging=false;previousPointer=null;state='developer-map';mouseCapture.release();
   }else if(state==='developer-map'){
    keys.clear();if(mapPreviousState==='play')resumeWithMouse(()=>{state='play';});else state=mapPreviousState;
   }
  }});
  await loading.step(97,'Drawing the first view…');
  // Prepare the canvas shader variants, including scenario fittings, before
  // the title becomes interactive. Streamed rooms keep their own warmup.
  if(renderer.compileAsync){await renderer.compileAsync(scene,camera);await renderer.compileAsync(exterior.scene,exterior.camera);}
  if(modern()){
   // Issue the actual canvas draws too: the driver can defer work until a
   // compiled program first draws to this framebuffer. The loading still
   // covers these frames, and animate draws the title before revealing it.
   camera.position.set(player.x,1.65,player.z);camera.rotation.set(pitch,yaw,0);interiorLights.update(player);
   camera.getWorldDirection(tmp);torch.position.copy(camera.position);torchTarget.position.copy(camera.position).addScaledVector(tmp,12);
   updateFurnitureDetail(THREE,scene,camera,innerHeight);renderer.render(scene,camera);
   arrivalCutscene.start();renderer.toneMappingExposure=1.15;renderer.render(exterior.scene,exterior.camera);arrivalCutscene.reset();
  }
  animate();
  interiorLoader?.startBackground();
 }catch(e){loading.fail();console.error(e);$('start').textContent='RELOAD TO TRY AGAIN';$('start').disabled=false;$('start').onclick=()=>location.reload();$('intro').textContent='The building could not load. Check your connection and reload. '+e.message;}
}
// Choose once per run; the arrival handoff reuses these spawns in resetPositions.
function randomizeEnemySpawns(){
 if(modern()){const placed=[];for(const e of enemies){const candidates=floors[0].safeSpawns.filter(p=>(p.x!==e.spawn.x||p.z!==e.spawn.z)&&placed.every(q=>Math.hypot(q.x-p.x,q.z-p.z)>5));e.spawn=candidates[Math.floor(Math.random()*candidates.length)]??e.spawn;placed.push(e.spawn);}return;}
 const ground=floors[0],reception={x:ground.spawn.x*ground.cellSize,z:ground.spawn.z*ground.cellSize},candidates=[];
 for(let z=0;z<ground.height;z++)for(let x=0;x<ground.width;x++){
  const p={x:x*ground.cellSize,z:z*ground.cellSize,floor:0};
  if(!walkable(ground,p.x,p.z,.5)||Math.hypot(p.x-reception.x,p.z-reception.z)<12)continue;
  if(nearExit(ground,p)||nearStair(floors,p)||!path(ground,reception,p).length)continue;
  candidates.push(p);
 }
 const placed=[];
 for(const e of enemies){
  const choices=candidates.filter(p=>(p.x!==e.spawn.x||p.z!==e.spawn.z)&&placed.every(other=>Math.hypot(p.x-other.x,p.z-other.z)>=5));
  e.spawn=choices[Math.floor(Math.random()*choices.length)]||e.spawn;placed.push(e.spawn);
 }
}
function resetPositions(){outsideWalker?.resetJump();indoorJump?.reset();spotted=false;Object.assign(player,{floor:0,y:0,stair:null,outside:false});lastDoor=null;if(torch&&!exteriorTorch)scene.add(torch,torchTarget);if(exteriorTorch)exteriorTorch.intensity=0;showFloor();stairHold=0;stairLatch=false;mapRefresh=0;lastStep=0;lastPulse=0;camera.position.y=1.65;player.x=layout.spawn.x*layout.cellSize;player.z=layout.spawn.z*layout.cellSize;yaw=layout.spawn.yaw??0;pitch=0;enemies.forEach(e=>{Object.assign(e,{...e.spawn,y:0,stair:null,outside:false,path:[],memory:0,rethink:0,route:0,target:null});resetEnemyRoomSearch(e);e.mesh.position.set(e.x,0,e.z);e.mesh.visible=true;if(e.type===1)resetSecurityGuard(e.mesh);if(e.type===2)resetAsylumGhost(e.mesh);});}
function uiPlaying(value){document.body.classList.toggle('playing',value);$('menu').hidden=value;$('location').hidden=value;$('hud').hidden=!value;$('pause').hidden=!value;$('touch').hidden=!value||!touch;}
function lock(){mouseCapture.request(()=>{},()=>pause());}
function resumeWithMouse(continuePlay){
 const suspended=state;
 mouseCapture.request(()=>{
  if(state!==suspended)return;
  keys.clear();dragging=false;previousPointer=null;continuePlay();canvas.focus();clock.reset();
 },()=>{
  if(state!==suspended)return;
  if(state!=='captured'){closeNotebook(false);$('instructions').hidden=true;state='play';uiPlaying(true);pause();}
  const message='Click the resume button to capture the mouse and continue.';
  if(!$('resultBody').textContent.includes(message))$('resultBody').textContent+='\n\n'+message;
  $('resume').focus();
 });
}
function prepareEscapeScenario(){
 developer?.setDoorsUnlocked(false);
 escapeWorld?.dispose();escapeWorld=null;
 escapeGrounds?.dispose();escapeGrounds=null;groundsGuard=null;
 if(modern()){
  const configured=new URLSearchParams(location.search).get('seed');
  escapeProgress=createEscapeProgress({seed:configured!==null&&/^\d+$/.test(configured)?Number(configured)>>>0:Math.floor(Math.random()*4294967296),journal:notebook,floors});
  escapeWorld=createEscapeWorld(THREE,floors,floorGroups,escapeProgress,{reducedMotion:landingReducedMotion});
  escapeGrounds=createEscapeGrounds(THREE,escapeExterior,outsideWalker,escapeProgress,{noise:groundsNoise,creak:event=>doorCreak.play(event),ambience:kind=>towerAudio.play(kind)});
 }
}
function start(){
 if(!ready||state==='arrival')return;
 corridorSightings?.reset();
 mouseCapture.release();
 doorCreak.stop();towerAudio.stop();escapeCutscene.reset();closeArtViewer();closeNotebook(false);
 if(furnitureFloors.length&&!firstRunPrepared){furnishAsylum(floors,{seed:Math.floor(Math.random()*4294967296)});furnitureFloors.forEach(f=>f.update());}
 notebook.reset();
 const configured=modern()?new URLSearchParams(location.search).get('seed'):null;
 if(!firstRunPrepared||(configured!==null&&/^\d+$/.test(configured)&&(Number(configured)>>>0)!==escapeProgress?.run.seed))prepareEscapeScenario();firstRunPrepared=false;
 recoveryRemaining=0;enemyReleaseAt=5;messageUntil=0;interactionMessage='';outdoorGuardActive=false;
 $('resume').disabled=false;$('resume').textContent='RESUME ↗';
 for(const e of enemies)scene.add(e.mesh);
 randomizeEnemySpawns();resetPositions();notebookReadRevision=0;observeNotebook();
 elapsed=0;lastTowerGuardStep=0;stamina=1;hold=0;exhausted=false;crouch=false;sprint=false;footPhase=0;dragging=false;previousPointer=null;keys.clear();
 state='arrival';torchEnabled=true;torch.visible=true;torch.intensity=20;uiPlaying(true);
 $('hud').hidden=true;$('pause').hidden=true;$('touch').hidden=true;$('instructions').hidden=true;$('result').hidden=true;$('floorMap').hidden=true;
 $('timer').textContent='00:00';$('warning').textContent='';$('interact').hidden=true;
 arrivalCutscene.start();audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume().catch(()=>{});lock();
 // Preparing a run can block for longer than the entire arrival. Its next
 // frame must count only time since the camera sequence actually started.
 clock.reset();
}
function pause(){if(state!=='play')return;closeArtViewer();state='paused';keys.clear();dragging=false;previousPointer=null;mouseCapture.release();$('resultTag').textContent='TAKE A MOMENT';$('resultTitle').textContent='Hold your breath.';$('resultBody').textContent='The building will wait. Resume when you’re ready.';$('resume').hidden=false;$('resultExplore').hidden=true;$('resultIntro').hidden=false;$('result').classList.toggle('pause-menu',true);$('retry').textContent='RESTART';$('result').hidden=false;}
function finish(won,who){const outcome=won?null:captureOutcome(previousDiagnosis);if(outcome)previousDiagnosis=outcome.diagnosis;closeArtViewer();closeNotebook(false);state=won?'cutscene':'lost';keys.clear();mouseCapture.release();$('resultTag').textContent=won?'OUTSIDE. AT LAST.':'THE BUILDING KEPT YOU';$('resultTitle').textContent=won?'You made it out.':"You've been captured";$('resultBody').textContent=won?(modern()?`You reached the radio mast beyond the asylum grounds in ${elapsed.toFixed(1)} seconds, after ${escapeProgress.run.captures} captures.`:`You escaped through ${who.toLowerCase()} in ${elapsed.toFixed(1)} seconds. ${floors.reduce((count,floor)=>count+floor.exits.length,0)-1} other routes are waiting.`):(modern()?`After ${CAPTURE_LIMIT} captures, your escape attempt ends.\n\n`:'')+outcome.text;$('resume').hidden=true;$('resultExplore').hidden=!won;$('resultIntro').hidden=true;$('result').classList.toggle('pause-menu',false);$('retry').textContent='TRY ANOTHER ROUTE ↗';$('result').hidden=won;$('interact').hidden=true;
 if(won){$('hud').hidden=true;$('touch').hidden=true;$('pause').hidden=true;escapeCutscene.start();}
}
function resume(){if(state==='captured'){resumeCapture();return;}resumeWithMouse(()=>{state='play';$('result').hidden=true;$('instructions').hidden=true;});}
function caught(who){
 if(!escapeProgress){finish(false,who);return;}
 const consequence=escapeProgress.capture();
 if(consequence.terminal){finish(false,who);return;}
 closeArtViewer();closeNotebook(false);keys.clear();hold=0;stairHold=0;stairLatch=false;dragging=false;previousPointer=null;
 messageUntil=0;interactionMessage='';
 outdoorGuardActive=false;groundsGuard=null;escapeGrounds?.sync();for(const e of enemies)scene.add(e.mesh);
 randomizeEnemySpawns();resetPositions();
 const position=escapeWorld.anchor(consequence.floor,consequence.room);
 Object.assign(player,{x:position.x,z:position.z,floor:consequence.floor,y:floors[consequence.floor].elevation,stair:null,outside:false});
 // Relocation may put the player near a patrol's old pose. Keep recovery safe.
 const safe=floors[0].safeSpawns.filter(p=>player.floor!==0||Math.hypot(p.x-player.x,p.z-player.z)>18);
 enemies.forEach((e,i)=>{const spawn=safe[(i*17+consequence.count*7)%safe.length]??e.spawn;Object.assign(e,{...spawn,y:0,floor:0,path:[],target:null,memory:0,route:consequence.count*3,rethink:0});e.mesh.position.set(e.x,0,e.z);});
 recoveryRemaining=consequence.delay;enemyReleaseAt=elapsed+10;escapeWorld.sync();showFloor();observeNotebook();drawMap();camera.position.set(player.x,player.y+1.65,player.z);yaw=0;pitch=0;
 state='captured';mouseCapture.release();$('interact').hidden=true;
 $('hud').hidden=true;$('touch').hidden=true;$('pause').hidden=true;
 $('resultTag').textContent=`CAPTURE ${consequence.count} OF ${CAPTURE_LIMIT}`;$('resultTitle').textContent=consequence.count===1?'Returned to Reception.':'Under observation.';
 $('resultBody').textContent=`${consequence.count===1?'You are brought back to the admissions room beside Reception. Security changes its patrol.':'You are moved to a padded cell in the basement for a brief observation period.'}\n\n${escapeProgress.run.confiscated.size?'Your keys are in the property tray beside Reception.':'The attendant checks your belongings.'} Your notebook and discoveries remain. Opened gates stay open.${consequence.returnedTools?" Your tools have been returned to the store beside the water tower.":""}\n\nA third capture ends this attempt.`;
 $('result').classList.toggle('pause-menu',true);$('result').hidden=false;$('resultExplore').hidden=true;$('resultIntro').hidden=true;$('retry').textContent='RESTART';$('resume').hidden=false;$('resume').disabled=recoveryRemaining>0;$('resume').textContent=recoveryRemaining>0?`OBSERVATION · ${Math.ceil(recoveryRemaining)}s`:'CONTINUE ESCAPE ↗';$('result').tabIndex=-1;(recoveryRemaining>0?$('result'):$('resume')).focus();
}
function resumeCapture(){if(recoveryRemaining>0)return;resumeWithMouse(()=>{state='play';$('result').hidden=true;uiPlaying(true);});}
function announce(text){interactionMessage=text;messageUntil=elapsed+5;updateNotebookBadge();}
function syncEscapeWorld(){
 escapeWorld.sync();
 for(const gate of escapeWorld.gates){const id='escape:gate-map:'+gate.id,prior=notebook.entries.find(e=>e.id===id);if(prior&&escapeProgress.run.opened.has(gate.id))notebook.recordEvidence({...prior,text:'This upper stair grille has been released.',mapLabel:'Released'});}
}
function updateOutdoorGuard(dt){
 const guard=enemies.find(e=>e.type===1);if(!guard)return;
 if(!outdoorGuardActive){
  // A patrol emerges onto a clear stretch of the grounds, away from the door.
  const candidates=GUARD_PATROL.filter(p=>outsideWalker.clear(p.x,p.z,0)&&Math.hypot(p.x-player.x,p.z-player.z)>12);
  const spawn=candidates.sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0];
  if(!spawn)return;
  Object.assign(guard,{...spawn,y:0,outside:true,path:[],memory:0});resetEnemyRoomSearch(guard);exterior.scene.add(guard.mesh);outdoorGuardActive=true;
  guard.heading=Math.PI;groundsGuard=createGroundsGuard({actor:guard,walker:outsideWalker,route:outdoorPath,sight:outdoorSight});
 }
 guard.mesh.visible=true;if(elapsed<enemyReleaseAt)return;
 const distance=Math.hypot(guard.x-player.x,guard.z-player.z),line=outdoorSight(guard,player);
 const result=groundsGuard.update(player,dt,{crouch});if(result.seen)spotted=true;else if(groundsGuard.mode==='patrol'||groundsGuard.mode==='return')spotted=false;
 if(escapeGrounds?.tower?.areaAt(player)&&distance<32&&result.moved>.001&&elapsed-lastTowerGuardStep>.6){
  lastTowerGuardStep=elapsed;towerAudio.play('yard',Math.max(.2,1-distance/40));
  if(!escapeProgress.run.towerFootstepsNoted){escapeProgress.run.towerFootstepsNoted=true;announce('Footsteps in the yard below. Listen before leaving the tower.');}
 }
 guard.mesh.rotation.y=guard.heading;updateSecurityGuard(guard.mesh,result.moved,dt);
 guard.mesh.position.set(guard.x,guard.y,guard.z);
 if(distance<.85&&Math.abs(guard.y-player.y)<1&&line)caught(guard.name);
}
function outdoorSight(a,b){const distance=Math.hypot(b.x-a.x,b.z-a.z),count=Math.ceil(distance/.5);for(let i=1;i<count;i++)if(!outsideWalker.clearSight(a.x+(b.x-a.x)*i/count,a.z+(b.z-a.z)*i/count,(a.y??0)+((b.y??0)-(a.y??0))*i/count))return false;return true;}
function groundsNoise(point,radius,kind){
 if(kind!=='tower-hatch')beep(kind==='pry'?180:420,.25,.08);
 const heard=groundsGuard?.hear(point,radius)??false;if(heard)announce('The guard heard that and is coming to investigate.');return heard;
}
function showHelp(){if(state!=='play'&&state!=='paused')return;pause();dragging=false;previousPointer=null;$('result').hidden=true;$('instructions').hidden=false;$('closeHelp').focus();}
function outsideDoor(){
 const candidates=floors.flatMap((f,floor)=>f.exits.map(exit=>({exit,floor,d:Math.hypot(player.x-exit.destination[0],player.z-exit.destination[2],player.y-exit.destination[1])})));
 candidates.sort((a,b)=>a.d-b.d);return candidates[0]?.d<1.6?{...candidates[0].exit,floor:candidates[0].floor}:null;
}
function useDoor(exit){
 if(player.outside&&interiorLoader&&!interiorLoader.allowMove(player,{...exit.inside,floor:exit.floor,outside:false}))return false;
 if(escapeProgress){const attempt=escapeProgress.door(exit,{returning:player.outside});if(!attempt.allowed){notebook.recordEvidence({id:`door:${player.floor}:${exit.id}`,title:exit.name,view:`floor:${player.floor}`,text:attempt.text,source:'Tested outside door',locked:true});announce(attempt.text);return false;}}
 outsideWalker?.resetJump();indoorJump?.reset();
 const doorFloor=exit.floor??player.floor;notebook.recordDoor(exit,doorFloor,{used:true});
 if(player.outside){Object.assign(player,{...exit.inside,floor:exit.floor,y:floors[exit.floor].elevation,stair:null,outside:false});const {dx,dz}=exitDirection(exit);yaw=Math.atan2(dx,dz);if(!exteriorTorch)scene.add(torch,torchTarget);}
 else {lastDoor=exit;const [x,y,z]=exit.destination;Object.assign(player,{x,y,z,stair:null,outside:true});const {dx,dz}=exitDirection(exit,{outside:true});yaw=Math.atan2(-dx,-dz);if(!exteriorTorch)exterior.scene.add(torch,torchTarget);}
 if(escapeProgress&&player.outside){enemyReleaseAt=Math.max(enemyReleaseAt,elapsed+5);}else if(outdoorGuardActive){const guard=enemies.find(e=>e.type===1);scene.add(guard.mesh);Object.assign(guard,{...guard.spawn,outside:false,y:0,path:[],memory:0,target:null});guard.mesh.position.set(guard.x,0,guard.z);resetSecurityGuard(guard.mesh);outdoorGuardActive=false;}
 pitch=0;hold=0;spotted=false;camera.position.set(player.x,player.y+(crouch?1.1:1.65),player.z);camera.rotation.set(pitch,yaw,0);showFloor();observeNotebook();drawMap();enemies.forEach(e=>e.mesh.visible=!player.outside&&e.floor===player.floor);$('interact').hidden=true;return true;
}
function beep(hz,length,volume){if(!audioCtx||!audioOn)return;const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(hz*.5,t+length);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+length);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+length);}
function update(dt,interactionDt=dt){
 if(state!=='play')return;
 if(artViewing){if(!keys.has('KeyE'))closeArtViewer();return;}
 elapsed+=dt;receptionClock.update(player,dt);escapeGrounds?.update(dt,player);const sx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),sz=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),moving=!!(sx||sz);
 crouch=keys.has('ControlLeft')||keys.has('KeyC');if(stamina<.02)exhausted=true;if(stamina>.25)exhausted=false;
 sprint=keys.has('ShiftLeft')&&moving&&!crouch&&!exhausted;stamina=THREE.MathUtils.clamp(stamina+dt*(sprint?-.19:.115),0,1);
 const speed=crouch?1.6:sprint?5.8:3.1,n=Math.hypot(sx,sz)||1;
 const dx=(Math.cos(yaw)*sx-Math.sin(yaw)*sz)/n*speed*dt,dz=(-Math.sin(yaw)*sx-Math.cos(yaw)*sz)/n*speed*dt;
 const oldPlayerFloor=player.floor,previousPlayer={...player};
 if(modern()){if(player.outside)outsideWalker.update(player,dx,dz,dt);else indoorJump.update(player,dx,dz,dt);if(player.floor!==oldPlayerFloor){showFloor();drawMap();}}
 if(player.outside){const area=outsideAreaName();if($('floorName').textContent!==area){$('floorName').textContent=area;$('miniFloorName').textContent=area;}}
 else {if(walkable(layout,player.x+dx,player.z,.34))player.x+=dx;if(walkable(layout,player.x,player.z+dz,.34))player.z+=dz;}
 footPhase+=dt*(moving?(sprint?14:9):0);camera.position.set(player.x,THREE.MathUtils.lerp(camera.position.y,(modern()?player.y:floorHeight(player))+(crouch?1.1:1.65),Math.min(1,dt*12))+(moving?Math.sin(footPhase)*.018:0),player.z);camera.rotation.set(pitch,yaw,0);
 if(moving&&!crouch&&elapsed-lastStep>(sprint?.30:.48)){beep(95,.11,sprint?.08:.035);lastStep=elapsed;}
 let nearest=99;
 if(player.outside){enemies.forEach(e=>e.mesh.visible=false);updateOutdoorGuard(dt);}
 else if(keys.has('KeyE')&&!modern()){enemies.forEach(e=>e.mesh.visible=e.floor===player.floor);}
 else for(const e of enemies){
  const sameFloor=e.floor===player.floor,enemyLayout=floors[e.floor];let distance=Math.hypot(e.x-player.x,e.z-player.z);e.mesh.visible=sameFloor;if(sameFloor)nearest=Math.min(nearest,distance);if(elapsed<enemyReleaseAt)continue;
  const seen=sameFloor&&distance<(crouch?8:e.type===1?22:16)&&visible(enemyLayout,e,player);
  if(seen)spotted=true;
  e.rethink-=dt;const searching=updateEnemyRoomSearch(floors,e,player,dt);
  if(!searching){
   if(seen||e.type===2){e.target={...player};e.memory=5;}else e.memory=Math.max(0,e.memory-dt);
   if(e.rethink<=0&&!e.stair){e.rethink=.45;if(e.memory<=0&&(!e.path.length||Math.hypot(e.x-e.target?.x,e.z-e.target?.z)<1)){const routes=enemyLayout.patrol,r=routes[e.route++%routes.length];e.target={x:r.x*enemyLayout.cellSize,z:r.z*enemyLayout.cellSize,floor:e.floor};}if(e.target)e.path=routeBetweenFloors(floors,e,e.target);}
  }else e.rethink=.45;
  let speed=searching&&e.roomSearch.phase==='wait'?0:e.type===1?(e.memory?3.85:2.4):2.2;
  if(sameFloor&&e.type===2&&torch.visible&&distance<23&&visible(layout,player,e)){camera.getWorldDirection(tmp);const dot=(tmp.x*(e.x-player.x)+tmp.z*(e.z-player.z))/(distance||1);if(dot>.88)speed=.55;}
  const oldX=e.x,oldZ=e.z,oldFloor=e.floor;
  const target=e.path[0];if(modern()&&target){const vx=target.x-e.x,vz=target.z-e.z,d=Math.hypot(vx,vz),step=Math.min(speed*dt,d);if(d>.001){moveAsylumActor(floors,e,vx/d*step,vz/d*step);e.mesh.rotation.y=Math.atan2(vx,vz);}if(d<.1&&Math.abs(e.y-target.y)<.4)e.path.shift();}
  else if(target&&target.floor!==e.floor){const stair=nearStair(floors,e);if(changeFloor(floors,e,stair))e.path.shift();else e.path=[];}else if(target){const vx=target.x-e.x,vz=target.z-e.z,d=Math.hypot(vx,vz),step=Math.min(speed*dt,d);if(d>.001){e.x+=vx/d*step;e.z+=vz/d*step;e.mesh.rotation.y=Math.atan2(vx,vz);}if(d<.08&&e.path.length)e.path.shift();}
  if(e.type===1)updateSecurityGuard(e.mesh,e.floor===oldFloor?Math.hypot(e.x-oldX,e.z-oldZ):0,dt);
  if(e.type===2)updateAsylumGhost(e.mesh,dt);
  e.mesh.position.set(e.x,modern()?e.y:floorHeight(e),e.z);e.mesh.visible=e.floor===player.floor;
  if(e.floor===player.floor&&(!modern()||Math.abs(e.y-player.y)<1)&&Math.hypot(e.x-player.x,e.z-player.z)<.8&&visible(floors[e.floor],e,player)){caught(e.name);break;}
 }
 if(state!=='play')return;
 if(nearest<15&&elapsed-lastPulse>THREE.MathUtils.mapLinear(Math.min(nearest,15),0,15,.35,1.2)){beep(52,.18,.1*(1-nearest/18));lastPulse=elapsed;}
 if(spotted&&enemies.every(e=>Math.hypot(e.x-player.x,e.z-player.z,(e.floor-player.floor)*FLOOR_HEIGHT)>=SPOTTED_CLEAR_DISTANCE))spotted=false;
 $('warning').textContent=elapsed<messageUntil?interactionMessage:elapsed<enemyReleaseAt?(escapeProgress?.run.captures?'A BRIEF CHANCE TO RECOVER':'YOU HAVE A FIVE-SECOND HEAD START'):spotted?"You've been spotted":nearest<4?'SOMEONE IS VERY CLOSE':nearest<10?'YOU ARE NOT ALONE':'';

  const stair=modern()?null:nearStair(floors,player),exit=player.outside?outsideDoor():nearExit(layout,player),art=player.outside?null:nearbyArt(),clue=escapeWorld?.near(player),groundClue=escapeGrounds?.near(player),mast=escapeProgress?.canFinish(player);
 if(!keys.has('KeyE'))stairLatch=false;
  $('interact').hidden=!stair&&!exit&&!art&&!clue&&!groundClue&&!mast;
 const worked=escapeGrounds?.workOn(groundClue,keys.has('KeyE')&&!stairLatch,dt);if(worked){announce(worked);stairLatch=true;}
 if(mast){
  $('interact').querySelector('b').textContent='PRESS E · REACH THE MAST';$('exitName').textContent='Beyond the asylum grounds';$('exitFill').style.width='0%';if(keys.has('KeyE')&&!stairLatch)finish(true,'the radio mast');
 }else if(groundClue){
  escapeGrounds.inspect(groundClue);
  const prying=['wicket','tower-hatch'].includes(groundClue.id)&&escapeProgress.run.crowbar;
  $('interact').querySelector('b').textContent=prying?groundClue.id==='tower-hatch'?'HOLD E TO FREE THE HATCH':'HOLD E TO PRISE BOARDS':groundClue.id==='crowbar'||groundClue.id==='oil'?'PRESS E TO TAKE':'PRESS E TO '+escapeGrounds.action(groundClue);$('exitName').textContent=groundClue.title;$('exitFill').style.width=(escapeGrounds.work/3*100)+'%';
  if(keys.has('KeyE')&&!stairLatch&&!prying){announce(escapeGrounds.use(groundClue));stairLatch=true;}
 }else if(clue){
  $('interact').querySelector('b').textContent=clue.id==='staff-key'?'PRESS E TO TAKE':clue.id==='reclaim'?'PRESS E TO RECLAIM':clue.gate||clue.id==='release'?'PRESS E TO USE':clue.id==='plan'&&clue.key.visible?'PRESS E TO TAKE BRASS KEY':'PRESS E TO INSPECT';$('exitName').textContent=clue.title;$('exitFill').style.width='0%';
  if(keys.has('KeyE')&&!stairLatch){announce(clue.gate?(escapeProgress.openStair(clue.gate.id)?'Gate open.':'Locked. Its plate reads “Staff stair key”.'):escapeProgress.interact(clue.id,{view:`floor:${player.floor}`}));syncEscapeWorld();stairLatch=true;}
 }else if(modern()&&exit){
  $('interact').querySelector('b').textContent=player.outside?'PRESS E TO GO INSIDE':'PRESS E TO USE DOOR';$('exitName').textContent=exit.id+' · '+exit.name;$('exitFill').style.width='0%';
  if(keys.has('KeyE')&&!stairLatch)stairLatch=useDoor(exit);
 }else if(stair){
  hold=0;$('interact').querySelector('b').textContent=player.floor?'HOLD E TO GO DOWN':'HOLD E TO GO UP';
  $('exitName').textContent=asylumDisplayName(stair.name);stairHold=keys.has('KeyE')&&!stairLatch?stairHold+interactionDt:0;
  $('exitFill').style.width=Math.min(100,stairHold/INTERACTION_HOLD_SECONDS*100)+'%';
  if(stairHold>=INTERACTION_HOLD_SECONDS&&changeFloor(floors,player,stair)){
   stairHold=0;stairLatch=true;showFloor();camera.position.y=player.floor*FLOOR_HEIGHT+(crouch?1.1:1.65);
   camera.position.x=player.x;camera.position.z=player.z;
   enemies.forEach(e=>{if(e.memory>0||e.type===2){e.target={...player};e.rethink=0;}e.mesh.visible=e.floor===player.floor;});
   drawMap();
  }
  }else if(art){
   stairHold=0;hold=0;$('interact').querySelector('b').textContent='HOLD E TO VIEW';$('exitName').textContent=art.imageOnly?'':art.title;$('exitFill').style.width='0%';if(keys.has('KeyE'))openArtViewer(art);
  }else{
  stairHold=0;
  if(exit){$('interact').querySelector('b').textContent='HOLD E TO ESCAPE';$('exitName').textContent=exit.name;hold=keys.has('KeyE')&&!stairLatch?hold+interactionDt:0;$('exitFill').style.width=Math.min(100,hold/INTERACTION_HOLD_SECONDS*100)+'%';if(hold>=INTERACTION_HOLD_SECONDS)finish(true,exit.name);}else hold=0;
 }
 $('timer').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;$('staminaFill').style.width=stamina*100+'%';$('stance').textContent=sprint?'SPRINTING · LOUD':crouch?'CROUCHING · QUIET':'STAMINA';
 if(escapeProgress&&player.outside){escapeProgress.observeBoundary(player,previousPlayer);if(Math.hypot(player.x-MAST.x,player.z-MAST.z)<18)escapeProgress.discover('mast',{view:'outside'});}
 mapRefresh-=dt;if(mapRefresh<=0){mapRefresh=.12;observeNotebook();drawMap();}
 escapeWorld?.update(elapsed,dt);updateObjective(interactionDt);
}
function observeNotebook(){
 notebook.explore(player);
 if(!player.outside){const exit=nearExit(layout,player);if(exit&&!escapeProgress)notebook.recordDoor(exit,player.floor);
  if(escapeProgress){const clue=escapeWorld.near(player);if(clue?.gate){escapeProgress.discover('gate',{view:`floor:${player.floor}`});notebook.recordEvidence({id:'escape:gate-map:'+clue.gate.id,title:clue.gate.id+' · Staff stair grille',text:'I observed a locked grille on this upper stair.',view:`floor:${player.floor}`,mapPoint:{x:clue.gate.x,z:clue.gate.z},mapLabel:escapeProgress.run.opened.has(clue.gate.id)?'Released':'Staff only · locked',source:'Personal observation'});}if(exit){const key=`door:${player.floor}:${exit.id}`;if(!notebook.entries.some(n=>n.id===key))notebook.recordEvidence({id:key,title:exit.name,view:`floor:${player.floor}`,text:'I found this outside door. I have not tested its lock.',source:'Personal observation'});}for(const id of ['S3','S4']){const s=layout.stairs.find(s=>s.id===id);if(s&&Math.hypot(player.x-s.label[0],player.z-s.label[1])<3)escapeProgress.discover(id==='S3'?'west-stair':'east-stair');}}
 }
 updateNotebookBadge();
}
function updateNotebookBadge(){
 const unread=notebook.revision>notebookReadRevision;
 $('notebookBadge').hidden=!unread;
 $('notebookButton').setAttribute('aria-label',unread?'Open notebook, new notes':'Open notebook');
}
function renderNotebook(){
 const view=notebook.views.find(v=>v.key===notebookFloor);
 const full=!!developer?.mapRevealed;
 $('mapFloorName').textContent=(view?.name??'Sketch').toUpperCase()+(full?' · FULL MAP':' · EXPLORED AREAS');
 mapCanvas.setAttribute('aria-label',full?'Fully revealed floor map':'Sketch map; blank areas have not been explored');
 $('notebookFloors').setAttribute('aria-label',full?'All floors':'Discovered floors');
 document.querySelector('.notebook-map-note').textContent=full?'All levels are revealed while developer mapping is enabled.':'Only nearby areas are revealed as you walk. Each level keeps its own sketch.';
 const buttons=(full?notebook.views:notebook.availableViews()).map(view=>{
  const button=document.createElement('button');button.type='button';button.textContent=view.name;
  button.setAttribute('aria-pressed',String(view.key===notebookFloor));
  button.onclick=()=>{notebookFloor=view.key;renderNotebook();drawMap();$('notebookFloors').querySelector('[aria-pressed="true"]').focus();};return button;
 });
 $('notebookFloors').replaceChildren(...buttons);
 for(const [kind,id] of [['fact','notebookFacts'],['deduction','notebookDeductions']]){
  const entries=notebook.entries.filter(entry=>entry.kind===kind);
  const cards=entries.map(entry=>{
   const article=document.createElement('article');article.className='notebook-entry';article.dataset.kind=kind;
   const title=document.createElement('h4'),text=document.createElement('p'),source=document.createElement('small');
   title.textContent=entry.title;text.textContent=entry.text;source.textContent=entry.source;
   article.append(title,text,source);return article;
  });
  if(!cards.length){const empty=document.createElement('p');empty.className='notebook-empty';empty.textContent=kind==='fact'?'Explore a room or inspect wall art to add a note.':'No deductions yet. These will be labelled separately from observed facts.';cards.push(empty);}
  $(id).replaceChildren(...cards);
 }
}
function openNotebook(){
 if(state!=='play')return;
 doorCreak.stop();towerAudio.stop();observeNotebook();closeArtViewer();keys.clear();hold=0;stairHold=0;dragging=false;previousPointer=null;
 notebookFloor=notebookView(player);state='notebook';mouseCapture.release();
 $('floorMap').hidden=false;$('touch').hidden=true;$('pause').hidden=true;$('hud').hidden=true;
 notebookReadRevision=notebook.revision;updateNotebookBadge();renderNotebook();drawMap();$('closeNotebook').focus();
}
function closeNotebook(resumePlay=true){
 if(state==='notebook'&&resumePlay){resumeWithMouse(()=>{closeNotebook(false);state='play';uiPlaying(true);});return;}
 $('floorMap').hidden=true;
 if(state!=='notebook')return;
 keys.clear();dragging=false;previousPointer=null;
}
function notebookKeydown(event){
 if(!event.repeat&&['Escape','KeyP','KeyN','KeyJ','KeyM'].includes(event.code)){event.preventDefault();closeNotebook();return;}
 if(event.code==='Tab'){
  event.preventDefault();
  const buttons=[...$('floorMap').querySelectorAll('button, [tabindex="0"]')];
  const index=buttons.indexOf(document.activeElement),step=event.shiftKey?-1:1;
  buttons[(index+step+buttons.length)%buttons.length]?.focus();
 }
}
function drawMapCanvas(context){
 drawNotebookMap(context,notebook,notebookView(player),player,enemies,yaw,{revealAll:!!developer?.mapRevealed,outsideVisible:outdoorSight});
}
function drawMap(){
 if(!$('floorMap').hidden)drawNotebookMap(mapContext,notebook,notebookFloor??notebookView(player),player,enemies,yaw,{revealAll:!!developer?.mapRevealed,outsideVisible:outdoorSight});
 drawMapCanvas(miniMapContext);
}
function renderAerialBackdrop(exterior){
 renderer.toneMappingExposure=1.15;
 // Distant portrait cameras need light haze to keep the estate visible.
 // Restore the shared fog after drawing so arrival retains its atmosphere.
 const fog=exterior.scene.fog,fogDensity=fog?.density;
 if(fog)fog.density=fogDensity*.25;
 renderer.render(exterior.scene,exterior.camera);
 if(fog)fog.density=fogDensity;
}
function animate(){requestAnimationFrame(animate);if(state!=='play'||!audioOn||document.hidden){doorCreak.stop();towerAudio.stop();}clock.update();const frameDt=clock.getDelta(),dt=Math.min(frameDt,.04);
 if(state!=='play'||document.hidden)corridorSightings?.update(player,camera,0);
 if(exteriorTorch)exteriorTorch.intensity=player.outside&&!['menu','arrival','cutscene','won'].includes(state)&&torch.visible&&torch.parent!==exterior.scene?torch.intensity:0;
 if(state==='captured'&&!document.hidden&&recoveryRemaining>0){recoveryRemaining=Math.max(0,recoveryRemaining-Math.min(frameDt,.25));$('resume').disabled=recoveryRemaining>0;$('resume').textContent=recoveryRemaining>0?`OBSERVATION · ${Math.ceil(recoveryRemaining)}s`:'CONTINUE ESCAPE ↗';}
 if(document.hidden)return;
 interiorLoader?.update(player);updateLoadingStatus();
 if(['menu','arrival','cutscene','won'].includes(state)||player.outside)exterior.lighting?.update(frameDt);
 renderer.toneMappingExposure=['menu','cutscene','won'].includes(state)||(state==='arrival'&&!arrivalCutscene.inside)?1.15:1.25;
 if(state==='cutscene'||state==='won'){
  if(state==='cutscene'&&!document.hidden)escapeCutscene.update(frameDt);
  renderAerialBackdrop(escapeExterior);return;
 }
 if(state==='arrival'){
  // Keep the approach visible even when a render or shader compile stalls.
  if(!document.hidden)arrivalCutscene.update(Math.min(frameDt,.25));
  if(!arrivalCutscene.inside){renderer.render(exterior.scene,exterior.camera);return;}
 }else if(state==='play')update(dt,frameDt);else if(state==='menu'){
  if(!document.hidden)landingTime+=Math.min(frameDt,.1);
  const shot=sampleLanding(landingTime,{aspect:exterior.camera.aspect,reducedMotion:landingReducedMotion,cinematic:true});
  exterior.camera.position.set(...shot.position);exterior.camera.lookAt(...shot.target);
  renderAerialBackdrop(exterior);
  // Reveal the canvas only after its first complete exterior frame is drawn.
  if(!$('landingPreview').hidden){$('landingPreview').hidden=true;canvas.classList.add('scene-ready');}
  if(!ready){loading.finish();ready=true;$('start').disabled=false;$('start').innerHTML='ASYLUM ESCAPE <span>↗</span>';}
  return;
 }
 if(state==='cutscene'){renderAerialBackdrop(escapeExterior);return;}
 renderer.toneMappingExposure=1.25;
 corridorSightings?.update(player,camera,state==='play'&&!artViewing?frameDt:0);
 interiorLights.update(player);camera.getWorldDirection(tmp);const activeTorch=player.outside&&exteriorTorch&&torch.parent!==exterior.scene?exteriorTorch:torch,activeTorchTarget=activeTorch===exteriorTorch?exteriorTorchTarget:torchTarget;if(exteriorTorch)exteriorTorch.intensity=activeTorch===exteriorTorch&&torch.visible?torch.intensity:0;activeTorch.position.copy(camera.position);activeTorchTarget.position.copy(camera.position).addScaledVector(tmp,12);if(!player.outside)updateFurnitureDetail(THREE,scene,camera,innerHeight);renderer.render(player.outside?exterior.scene:scene,camera);}
$('start').onclick=start;$('closeHelp').onclick=resume;$('helpPlay').onclick=resume;$('retry').onclick=start;$('resume').onclick=resume;$('pause').onclick=pause;$('audio').onchange=e=>audioOn=e.target.checked;
function toggleMap(){if(state==='notebook')closeNotebook();else openNotebook();}
 $('audio').addEventListener('change',()=>{if(!audioOn)doorCreak.stop();});
$('notebookButton').onclick=toggleMap;$('closeNotebook').onclick=()=>closeNotebook();
addEventListener('keydown',e=>{
 if(e.defaultPrevented)return;
 if(!e.repeat&&e.code==='Escape'&&mouseCapture.pending){e.preventDefault();mouseCapture.release();return;}
 if(state==='notebook'){notebookKeydown(e);return;}
 if(state==='cutscene'){if(['Escape','Space','Enter'].includes(e.code)){e.preventDefault();escapeCutscene.skip();}return;}
 if(state==='captured'){
  if(e.code==='Tab'){e.preventDefault();const buttons=[$('retry'),$('resume')].filter(b=>!b.disabled),index=buttons.indexOf(document.activeElement);buttons[(index+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}
  if(!e.repeat&&['Escape','KeyP'].includes(e.code)){e.preventDefault();resumeCapture();}
  return;
 }
 if(!$('instructions').hidden){
  if(!e.repeat&&['KeyH','Escape','KeyP'].includes(e.code)){e.preventDefault();resume();}
  return;
 }
 if(state==='play'&&['Tab','Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();
 if(e.repeat)return;
 if(e.code==='KeyH'&&(state==='play'||state==='paused')){e.preventDefault();showHelp();return;}
 if(e.code==='Escape'||e.code==='KeyP'){if(state==='play')pause();else if(state==='paused')resume();return;}
 if(state!=='play')return;
 if(e.code==='Space'){if(!artViewing){if(player.outside)outsideWalker?.jump(player);else indoorJump?.start();}return;}
 if(['Tab','KeyM','KeyN','KeyJ'].includes(e.code)){e.preventDefault();openNotebook();return;}
 keys.add(e.code);if(e.code==='KeyF'){torchEnabled=!torchEnabled;torch.intensity=torchEnabled?20:0;}
});
 addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='KeyE'){stairLatch=false;closeArtViewer();}});addEventListener('blur',()=>{keys.clear();closeArtViewer();mouseCapture.release();pause();});document.addEventListener('visibilitychange',()=>{clock?.getDelta();if(document.hidden){mouseCapture.release();pause();}});
function look(dx,dy){const s=Number($('sensitivity').value)*.0018;yaw-=dx*s;pitch=THREE.MathUtils.clamp(pitch-dy*s,-1.3,1.3);}
addEventListener('mousemove',e=>{if(state==='play'&&document.pointerLockElement===canvas)look(e.movementX,e.movementY);});
canvas.addEventListener('pointerdown',e=>{if(state!=='play')return;dragging=true;previousPointer=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(dragging&&state==='play'&&document.pointerLockElement!==canvas){look(e.clientX-previousPointer[0],e.clientY-previousPointer[1]);previousPointer=[e.clientX,e.clientY];}});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
 document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='play')return;keys.add(b.dataset.key);b.setPointerCapture(e.pointerId);});for(const t of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(t,()=>{keys.delete(b.dataset.key);if(b.dataset.key==='KeyE')closeArtViewer();});});$('touchMap').onclick=toggleMap;$('touchTorch').onclick=()=>{if(state==='play'){torchEnabled=!torchEnabled;torch.intensity=torchEnabled?20:0;}};if(touch)document.body.classList.add('touch');
addEventListener('resize',()=>{if(renderer){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();if(exterior){exterior.camera.aspect=camera.aspect;exterior.camera.updateProjectionMatrix();}if(escapeExterior){escapeExterior.camera.aspect=camera.aspect;escapeExterior.camera.updateProjectionMatrix();escapeCutscene.resize();}}});
init();
