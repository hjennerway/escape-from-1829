import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const destination=new URL('./',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:750}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/cold-water-bath-preview',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><link rel="icon" href="data:,"></head><body style="margin:0"></body></html>'}));
 await page.goto(base+'/cold-water-bath-preview');
 const checks=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{createMedicalFurnitureModels}=await import('/medical-furniture-models.mjs');
  const parts=createMedicalFurnitureModels(THREE).hydroShower;
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0xc9c4b8);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.append(renderer.domElement);
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff8eb,0x817769,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0xb7ad98,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.005;scene.add(floor);
  const group=new THREE.Group();scene.add(group);for(const part of parts)group.add(new THREE.Mesh(part.geometry,part.material));group.updateMatrixWorld(true);
  const label=group.children.find(m=>m.material.name==='COLD BATH'),box=label.geometry.boundingBox,center=box.getCenter(new THREE.Vector3());
  const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
  if(size.distanceTo(new THREE.Vector3(1.22*1.3,2.28*1.3,1.10*1.3))>1e-5||Math.abs(bounds.min.y)>1e-6)throw Error('Cold-water table size or grounding differs from catalog');
  const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.01,50),views={front:[1.4,2.25,6.1],elevated:[2.8,4.2,5.8],pole:[-1.75,1.65,1.5]};
  window.coldBathTablePreview={show(view){camera.position.set(...views[view]);camera.lookAt(0,1.45,0);renderer.render(scene,camera);}};
  const samples=[];
  for(const view of ['front'])for(const u of [-.9,0,.9])for(const v of [-.9,0,.9]){
   const target=new THREE.Vector3(center.x+u*(box.max.x-box.min.x)/2,center.y+v*(box.max.y-box.min.y)/2,center.z),origin=new THREE.Vector3(...views[view]);
   const hit=new THREE.Raycaster(origin,target.clone().sub(origin).normalize()).intersectObject(group,true)[0];
   if(hit?.object!==label)throw Error('Label is occluded at '+view+' '+u+' '+v);
   samples.push({view,u,v,visible:true});
  }
  window.coldBathTablePreview.show('front');
  return {dimensions:{width:size.x,depth:size.z,height:size.y},base:bounds.min.y,labelBounds:{min:box.min.toArray(),max:box.max.toArray()},visibleSamples:samples};
 });
 for(const view of ['front','elevated','pole']){await page.evaluate(v=>window.coldBathTablePreview.show(v),view);await page.screenshot({path:fileURLToPath(new URL(view+'.png',destination))});}
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
  window.coldBathRoomPreview={get ready(){return ready;},get floors(){return floors;},pose(){start();arrivalCutscene.update(3);const room=floors[0].rooms.find(r=>r.id==='R12'),table=floors[0].furniture.find(i=>i.kind==='hydroShower');Object.assign(player,{x:room.label[0],z:room.label[1],floor:0,y:floors[0].elevation,stair:null,outside:false});yaw=Math.atan2(-(table.x-player.x),-(table.z-player.z));pitch=-.12;camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();$('arrivalFade').hidden=true;$('hud').hidden=false;}};
 `}));
 await page.goto(base);await page.waitForFunction(()=>window.coldBathRoomPreview?.ready);await page.evaluate(()=>window.coldBathRoomPreview.pose());
 const roomChecks=await page.evaluate(async()=>{
  const {flatWalkable}=await import('/asylum-layout.mjs'),floor=window.coldBathRoomPreview.floors[0],table=floor.furniture.find(i=>i.kind==='hydroShower'),room=floor.rooms.find(r=>r.id==='R12');
  if(table.roomId!=='R12'||table.width!==1.22*1.3||table.depth!==1.10*1.3||table.height!==2.28*1.3)throw Error('Game table placement/size differs from shared model');
  if(!flatWalkable(floor,...room.label,.5))throw Error('Room centre blocked');
  return {table,roomCentreClear:true};
 });
 await page.screenshot({path:fileURLToPath(new URL('room-desktop.png',destination))});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:fileURLToPath(new URL('room-mobile.png',destination))});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.coldBathExplorePreview={floors,interior,walker,renderer};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1100,height:750});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.coldBathExplorePreview?.renderer.info.render.frame>2);
 const exploreChecks=await page.evaluate(async expected=>{
  const THREE=await import('/vendor/three.module.js'),{flatWalkable,moveAsylumActor}=await import('/asylum-layout.mjs'),{floors,interior}=window.coldBathExplorePreview,floor=floors[0],table=floor.furniture.find(i=>i.kind==='hydroShower');
  if(JSON.stringify(table)!==JSON.stringify(expected))throw Error('Escape/Explore coldBath tables differ');
  const group=interior.scene.children.find(g=>g.position.y===floor.elevation&&g.getObjectByName('Asylum furniture')).getObjectByName('Asylum furniture'),bounds=new THREE.Box3();let renderedParts=0;
  for(const mesh of group.children){
   const index=mesh.userData.furnitureIds.indexOf(table.id);if(index<0)continue;
   const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3();mesh.getMatrixAt(index,matrix);position.setFromMatrixPosition(matrix);scale.setFromMatrixScale(matrix);
   if(position.distanceTo(new THREE.Vector3(table.x,table.y,table.z))>1e-4||scale.distanceTo(new THREE.Vector3(1,1,1))>1e-4)throw Error('Rendered coldBath transform differs from collision transform');
   mesh.geometry.computeBoundingBox();bounds.union(mesh.geometry.boundingBox);renderedParts++;
  }
  if(renderedParts<5||bounds.getSize(new THREE.Vector3()).distanceTo(new THREE.Vector3(table.width,table.height,table.depth))>1e-5)throw Error('Explore rendered coldBath dimensions differ from walking dimensions');
  const actor={x:table.x+Math.sin(table.rotation)*(table.depth/2+.8),z:table.z+Math.cos(table.rotation)*(table.depth/2+.8),floor:0,y:floor.elevation,outside:false,stair:null};
  if(!flatWalkable(floor,actor.x,actor.z))throw Error('Cold-water table front approach is blocked');
  moveAsylumActor(floors,actor,table.x-actor.x,table.z-actor.z);
  const distance=Math.hypot(actor.x-table.x,actor.z-table.z);if(distance<table.depth/2+.3)throw Error('Walking enters enlarged coldBath footprint');
  return {sameFixedTable:true,renderedParts,renderedDimensions:bounds.getSize(new THREE.Vector3()).toArray(),walkingStop:distance,minimumStop:table.depth/2+.3};
 },roomChecks.table);
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL('validation.json',destination),JSON.stringify({...checks,roomChecks,exploreChecks,errors},null,2)+'\n');
 console.log('PASS: 130% cold-water apparatus bounds, floor contact, nine front label visibility rays, front/elevated/pole previews, desktop/mobile room placement, matching Escape/Explore instances and walking collision, no page or WebGL errors.');
}finally{await browser.close();server.kill();}
