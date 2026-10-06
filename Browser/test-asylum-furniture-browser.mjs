import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL(process.env.FURNITURE_ARTIFACT_DIR??'./artifacts/room-furniture/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],renders=[],retiredModelRequests=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:750},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 page.on('request',r=>{if(/shaker_nightstand\.(gltf|bin)/.test(r.url()))retiredModelRequests.push(r.url());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.furnitureTest={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get renderer(){return renderer;},get camera(){return camera;},player,keys,start,update,showFloor,get arrival(){return arrivalCutscene;},pose(roomId,floor,kind){const room=[...floors[floor].rooms,...floors[floor].furnishingAreas].find(r=>r.id===roomId),items=floors[floor].furniture.filter(i=>i.roomId===roomId),target=items.find(i=>i.kind===kind)??items[0];Object.assign(player,{x:room.label[0],z:room.label[1],floor,y:floors[floor].elevation,stair:null,outside:false});yaw=Math.atan2(-(target.x-player.x),-(target.z-player.z));pitch=-.12;camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();$('arrivalFade').hidden=true;$('hud').hidden=false;},pause(){state='paused';},play(){state='play';},aim(v){yaw=v;},move(dx,dz){moveAsylumActor(floors,player,dx,dz);}};` }));
 await page.goto(base);await page.waitForFunction(()=>window.furnitureTest?.ready&&window.furnitureTest.scene.userData.interiorSectionsComplete);
 await page.evaluate(()=>{const t=window.furnitureTest;t.start();t.arrival.update(3);t.pause();});
 const initial=await page.evaluate(()=>window.furnitureTest.floors.map(f=>f.furniture));
 assert.equal(new Set(initial.flat().map(i=>i.kind)).size,34);
 for(const [name,id,floor,kind] of [['visitors','Visitors',1,'table'],['ward-service','WardService',0,'linenCupboard'],['recreation','Recreation',1,'table'],['ward','R32',0,'bed'],['wardrobe','R7',0,'cupboard'],['medicine','R7',0,'apothecary'],['reading','R19',0,'bookcase'],['staff','R30',0,'table'],['upstairs-ward','R2',1,'bed'],['workshop','B3',2,'table'],['upper-records','R41',3,'bookcase'],['hydrotherapy','R1',0,'hydroBath'],['cold-shower','R12',0,'hydroShower'],['surgery','R6',0,'operatingTable'],['early-electricity','R29',0,'electrotherapy'],['bloodletting','R7',0,'bloodletting'],['ect','R8',0,'ectMachine']]){
  await page.evaluate(args=>window.furnitureTest.pose(...args),[id,floor,kind]);await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
  renders.push(await page.evaluate(name=>({name,calls:window.furnitureTest.renderer.info.render.calls,triangles:window.furnitureTest.renderer.info.render.triangles}),name));
 }
 const geometryChecks=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),{FURNITURE_CATALOG}=await import('/asylum-furniture.mjs'),models=await loadFurnitureModels(THREE);
  const bounds={};for(const kind of Object.keys(FURNITURE_CATALOG)){const b=new THREE.Box3();for(const part of models[kind])if(!part.paintOnly){part.geometry.computeBoundingBox();b.union(part.geometry.boundingBox);}bounds[kind]=b.getSize(new THREE.Vector3()).toArray();const c=FURNITURE_CATALOG[kind];if(bounds[kind].some((v,i)=>Math.abs(v-[c.width,c.height,c.depth][i])>1e-5))throw Error('Rendered size differs from collision size: '+kind);}
  const shelves=new THREE.Mesh(models.bookcase[0].geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})),books=models.bookcase[1].geometry,p=books.attributes.position,groups=[[],[],[],[]];
  // Inspect actual vertices and shelf intersections, independently of metadata.
  for(let i=0;i<p.count;i++)groups[Math.floor(i/(p.count/4))].push(i);
  const contacts=[],bookcase=FURNITURE_CATALOG.bookcase,sx=bookcase.width/1.25,sy=bookcase.height/1.90,sz=bookcase.depth/.38;
  for(let level=0;level<4;level++){
   const bottom=Math.min(...groups[level].map(i=>p.getY(i))),x=(level%2?.20:-.20)*sx,ray=new THREE.Raycaster(new THREE.Vector3(x,bottom+.02*sy,.02*sz),new THREE.Vector3(0,-1,0)),surface=ray.intersectObject(shelves,false)[0]?.point.y;
   if(surface===undefined||Math.abs(bottom-surface-.002*sy)>1e-5)throw Error('Books do not rest on shelf '+level);contacts.push({bottom,surface,gap:bottom-surface});
  }
  shelves.material.dispose();return {bounds,contacts};
 });
 const rendering=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{FURNITURE_CATALOG}=await import('/asylum-furniture.mjs'),{loadFurnitureModels}=await import('/furniture-models.mjs'),models=await loadFurnitureModels(THREE),t=window.furnitureTest;let instances=0;const wallContacts=[];
  for(const floor of t.floors){
   const floorGroup=t.scene.children.find(g=>g.position.y===floor.elevation&&g.children.some(c=>c.name==='Asylum furniture')),group=floorGroup.getObjectByName('Asylum furniture');
   for(const mesh of group.children)for(let i=0;i<mesh.count;i++){
    const item=floor.furniture.find(p=>p.id===mesh.userData.furnitureIds[i]),matrix=new THREE.Matrix4(),p=new THREE.Vector3();mesh.getMatrixAt(i,matrix);p.setFromMatrixPosition(matrix);
    if(Math.hypot(p.x-item.x,p.z-item.z)>1e-4||Math.abs(p.y-item.y)>1e-4)throw Error('Rendered and collision transforms differ');
    const catalog=FURNITURE_CATALOG[item.kind],scale=new THREE.Vector3().setFromMatrixScale(matrix),dimensions=scale.multiply(new THREE.Vector3(catalog.width,catalog.height,catalog.depth));
    if(dimensions.distanceTo(new THREE.Vector3(item.width,item.height,item.depth))>1e-4)throw Error('Rendered instance size differs from collision size: '+item.id);instances++;
   }
   floorGroup.updateMatrixWorld(true);
   const walls=floorGroup.children.filter(mesh=>mesh.name==='Asylum Plaster');
   for(const item of floor.furniture.filter(i=>['cupboard','bookcase'].includes(i.kind))){
    const mesh=group.children.find(m=>m.userData.furnitureIds.includes(item.id)),matrix=new THREE.Matrix4(),bounds=new THREE.Box3();
    mesh.getMatrixAt(mesh.userData.furnitureIds.indexOf(item.id),matrix);matrix.premultiply(mesh.matrixWorld);
    for(const part of models[item.kind])bounds.union(part.geometry.boundingBox);
    const direction=new THREE.Vector3(0,0,-1).transformDirection(matrix),gaps=[];
    // Measure from the actual instanced geometry back to the rendered wall,
    // independently of placement offsets and collision records.
    for(const u of [-.45,0,.45]){
     const rear=new THREE.Vector3(u*(bounds.max.x-bounds.min.x),bounds.max.y*.55,bounds.min.z).applyMatrix4(matrix),origin=rear.clone().addScaledVector(direction,-.03),hit=new THREE.Raycaster(origin,direction,0,.5).intersectObjects(walls,false)[0];
     if(!hit||Math.abs(hit.distance-.03)>1e-4)throw Error('Rendered storage back leaves a wall gap: '+item.id+' at '+rear.toArray()+'; wall distance '+hit?.distance);gaps.push(hit.distance-.03);
    }
    wallContacts.push({id:item.id,kind:item.kind,gaps});
   }
  }
  return {instances,wallContacts};
 });assert(rendering.instances>400);
 const walking=await page.evaluate(async()=>{
  const {flatWalkable}=await import('/asylum-layout.mjs'),t=window.furnitureTest,f=t.floors[0];
  const item=f.furniture.find(i=>i.kind==='bookcase'&&flatWalkable(f,i.x+Math.sin(i.rotation)*(i.depth/2+.8),i.z+Math.cos(i.rotation)*(i.depth/2+.8)));
  const distance=item.depth/2+.8;Object.assign(t.player,{x:item.x+Math.sin(item.rotation)*distance,z:item.z+Math.cos(item.rotation)*distance,floor:0,y:0,stair:null,outside:false});t.showFloor();t.aim(item.rotation);t.play();t.keys.add('KeyW');for(let i=0;i<35;i++)t.update(.02);t.keys.clear();t.pause();return {distance:Math.hypot(t.player.x-item.x,t.player.z-item.z),minimum:item.depth/2+.3};
 });assert(walking.distance>=walking.minimum,'Actual game input stops outside furniture');
 await page.evaluate(()=>{const t=window.furnitureTest;t.start();t.arrival.update(3);t.pause();});
 const next=await page.evaluate(()=>window.furnitureTest.floors.map(f=>f.furniture));
 assert.deepEqual(next.flat().filter(i=>!i.variable),initial.flat().filter(i=>!i.variable));assert.notDeepEqual(next.flat().filter(i=>i.variable),initial.flat().filter(i=>i.variable));
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.furnitureTest.pose('R32',0,'bed'));await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL('ward-mobile.png',destination))});
 await page.evaluate(()=>window.furnitureTest.pose('R1',0,'hydroBath'));await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL('hydrotherapy-mobile.png',destination))});
 await page.evaluate(()=>window.furnitureTest.pose('R7',0,'apothecary'));await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL('dispensary-mobile.png',destination))});
 await page.evaluate(()=>window.furnitureTest.pose('R7',0,'cupboard'));await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL('wardrobe-mobile.png',destination))});
 await page.evaluate(()=>window.furnitureTest.pose('Visitors',1,'table'));await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL('visitors-mobile.png',destination))});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.furnitureExplore={floors,interior,walker,renderer};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1100,height:750});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.furnitureExplore?.renderer.info.render.frame>2&&window.furnitureExplore.interior.scene.userData.interiorSectionsComplete);
 assert.deepEqual(await page.evaluate(()=>window.furnitureExplore.floors.flatMap(f=>f.furniture.filter(i=>!i.variable))),initial.flat().filter(i=>!i.variable),'Explore uses the same fixed furnishings');
 await page.evaluate(()=>{const {walker,floors}=window.furnitureExplore,r=floors[0].rooms.find(r=>r.id==='R19'),i=floors[0].furniture.find(i=>i.roomId==='R19'&&i.kind==='bookcase');Object.assign(walker.actor,{x:r.label[0],z:r.label[1],floor:0,y:0,outside:false,stair:null});walker.look(-Math.atan2(-(i.x-r.label[0]),-(i.z-r.label[1]))/.002,0);walker.update(.01);});
 await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL('explore-reading.png',destination))});
 // Close views of the actual shared furniture geometry expose spindles,
 // open shelves and the corrected book contact in a consistent neutral light.
 const preview=await browser.newPage({viewport:{width:1100,height:750}});preview.setDefaultTimeout(120000);preview.setDefaultNavigationTimeout(120000);preview.on('pageerror',e=>errors.push(e.message));await preview.goto(base+'/explore.html');await preview.waitForFunction(()=>document.querySelector('canvas'));
 await preview.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),models=await loadFurnitureModels(THREE);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1100,750);renderer.setClearColor(0xc9c4b8);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff8eb,0x817769,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0xb7ad98,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.005;scene.add(floor);
  const group=new THREE.Group();scene.add(group);const camera=new THREE.PerspectiveCamera(38,1100/750,.01,50);
  const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:10000';overlay.append(renderer.domElement);document.body.append(overlay);
  window.furniturePreview={show(kind){group.clear();for(const part of models[kind])if(!part.paintOnly)group.add(new THREE.Mesh(part.geometry,part.material));const box=new THREE.Box3().setFromObject(group),size=box.getSize(new THREE.Vector3()),target=new THREE.Vector3(0,size.y*.47,0),distance=Math.max(size.x,size.y,size.z)*2.3;camera.position.set(distance*.7,target.y+distance*.36,distance);camera.lookAt(target);renderer.render(scene,camera);}};
 });
 for(const kind of ['chair','table','cupboard','bench','bookcase','bed','hydroBath','hydroShower','operatingTable','electrotherapy','apothecary','bloodletting','ectMachine']){await preview.evaluate(k=>window.furniturePreview.show(k),kind);await preview.screenshot({path:fileURLToPath(new URL('model-'+kind+'.png',destination))});}
 await preview.close();
 assert.deepEqual(retiredModelRequests,[],'The retired Shaker cupboard is never loaded');assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({models:34,items:initial.flat().length,geometryChecks,rendering,walking,renders,newGameVariation:true,desktopMobile:true,explore:true,retiredModelRequests,errors},null,2)+'\n');
 console.log('PASS: actual Escape/Explore furnishings, thirty-four models, desktop/mobile views, matching rendered/collision transforms, keyboard collision, fixed landmarks and new-game variation, no runtime/shader errors.');
}finally{await browser.close();server.kill();}
