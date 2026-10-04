import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const out=new URL('./artifacts/hall-furnishings/',import.meta.url);await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],captures=[],ids=['Visitors','WardService','Recreation'];
try{
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.hallTest={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get renderer(){return renderer;},get camera(){return camera;},player,keys,update,start,showFloor,get arrival(){return arrivalCutscene;},pose(f,x,z,tx,tz,ty=1.25){Object.assign(player,{x,z,floor:f,y:floors[f].elevation,outside:false,stair:null});yaw=Math.atan2(-(tx-x),-(tz-z));pitch=Math.atan2(ty-1.65,Math.hypot(tx-x,tz-z));camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();for(const e of enemies)e.mesh.visible=false;$('arrivalFade').hidden=true;$('hud').hidden=false;},walk(){state='play';},pause(){state='paused';}};` }));
 const views=[['visitors',1,0,17.5,0,13.1,1.15],['service',0,30.3,11.5,25.5,13.3,1.30],['service-open-area',0,43.4,9.9,33.3,14.3,1.10],['recreation',1,31.3,14.0,27.8,12.9,1.10],['recreation-open-area',1,43.4,9.9,33.3,14.3,1.10]];
 async function capture(name,pose){await page.evaluate(p=>window.hallTest.pose(...p),pose);await page.waitForTimeout(300);await page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});captures.push(name);}
 // Matching before/after views use the saved original placement source.
 const beforeURL=new URL('before-asylum-furniture.mjs',out);let before;
 try{before=await readFile(beforeURL,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
 if(before&&!process.argv.includes('--skip-before')){await page.route('**/asylum-furniture.mjs',r=>r.fulfill({contentType:'text/javascript',body:before}));await page.goto(base);await page.waitForFunction(()=>window.hallTest?.ready);await page.evaluate(()=>{const t=window.hallTest;t.start();t.arrival.update(3);t.pause();});for(const [name,...p] of views)await capture('before-'+name,p);await page.unroute('**/asylum-furniture.mjs');}
 await page.goto(base);await page.waitForFunction(()=>window.hallTest?.ready);await page.evaluate(()=>{const t=window.hallTest;t.start();t.arrival.update(3);t.pause();});
 const records=await page.evaluate(ids=>window.hallTest.floors.flatMap(f=>f.furniture.filter(i=>ids.includes(i.roomId))),ids);assert.equal(records.length,45);
 for(const [name,...p] of [...views,['visiting-notice',1,-4.5,16.0,-7.0,16.0,1.85],['linen-close',0,27.7,13.5,25.4,13.4,1.65],['duties-close',0,27.8,16.0,25.15,16.0,1.82],['linen-worktable-close',0,41.0,10.7,41.0,12.8,1.12],['service-bench',0,41.0,15.8,41.0,17.8,.64],['draughts-close',1,29.2,12.8,28.0,12.8,.99],['newspaper-close',1,32.7,13.0,32.7,11.2,.97],['sewing-close',1,27.4,15.6,25.36,16.4,1.24]])await capture('after-'+name,p);
 const geometry=await page.evaluate(async(ids)=>{
  const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),models=await loadFurnitureModels(THREE),t=window.hallTest;const instances=[],wallContacts=[],labels=[];
  for(const f of t.floors){
   const parent=t.scene.children.find(g=>g.position.y===f.elevation&&g.getObjectByName('Asylum furniture'));parent.updateMatrixWorld(true);const group=parent.getObjectByName('Asylum furniture'),walls=parent.children.filter(m=>['Asylum Plaster','Asylum Brick'].includes(m.name));
   for(const item of f.furniture.filter(i=>ids.includes(i.roomId))){
    const meshes=group.children.filter(m=>m.userData.furnitureIds?.includes(item.id));if(!meshes.length)throw Error('Missing rendered prop '+item.id);
    const bounds=new THREE.Box3();for(const part of models[item.kind])bounds.union(part.geometry.boundingBox);
    for(const m of meshes){const matrix=new THREE.Matrix4();m.getMatrixAt(m.userData.furnitureIds.indexOf(item.id),matrix);const position=new THREE.Vector3().setFromMatrixPosition(matrix),scale=new THREE.Vector3().setFromMatrixScale(matrix);if(position.distanceTo(new THREE.Vector3(item.x,item.y,item.z))>1e-4||bounds.getSize(new THREE.Vector3()).multiply(scale).distanceTo(new THREE.Vector3(item.width,item.height,item.depth))>1e-4)throw Error('Rendered/collision mismatch '+item.id);}
    if(['linenCupboard','sideboard','landscape','visitingNotice','dutyBoard'].includes(item.kind)){
     const matrix=new THREE.Matrix4();meshes[0].getMatrixAt(meshes[0].userData.furnitureIds.indexOf(item.id),matrix);matrix.premultiply(meshes[0].matrixWorld);const direction=new THREE.Vector3(0,0,-1).transformDirection(matrix),gaps=[];
     for(const u of [-.40,0,.40]){const rear=new THREE.Vector3(u*(bounds.max.x-bounds.min.x),bounds.max.y*.55,bounds.min.z).applyMatrix4(matrix),hit=new THREE.Raycaster(rear.clone().addScaledVector(direction,-.03),direction,0,.2).intersectObjects(walls,false)[0];if(!hit||Math.abs(hit.distance-.03)>1e-4)throw Error('Wall mount gap '+item.id+' '+hit?.distance);gaps.push(hit.distance-.03);}wallContacts.push({id:item.id,gaps});
    }
    instances.push({id:item.id,kind:item.kind,parts:meshes.length});
   }
  }
  for(const parts of Object.values(models))for(const p of parts)if(p.material.name.startsWith('Hall ')&&p.material.map)labels.push({name:p.material.name,width:p.material.map.image.width,height:p.material.map.image.height});
  if(labels.length!==4)throw Error('Missing hall print textures');return {instances,wallContacts,labels};
 },ids);
 const walks=[];
 for(const [f,kind,area,index=0] of [[0,'linenTrolley','WardService'],[0,'linenCupboard','WardService'],[0,'table','WardService'],[0,'waitingBench','WardService',1],[1,'table','Visitors'],[1,'table','Recreation'],[1,'newspaperStand','Recreation'],[1,'table','Recreation',1],[1,'waitingBench','Recreation',1]]){
  const result=await page.evaluate(async([f,kind,area,index])=>{const {flatWalkable}=await import('/asylum-layout.mjs'),t=window.hallTest,item=t.floors[f].furniture.filter(i=>i.kind===kind&&i.roomId===area)[index],end=kind==='table'&&area!=='Visitors',angle=item.rotation+(end?Math.PI/2:0),half=(end?item.width:item.depth)/2,d=half+.9,s=Math.sin(angle),c=Math.cos(angle),offset=kind==='table'&&area==='Visitors'?.73:0,x=item.x+c*offset,z=item.z-s*offset;if(!flatWalkable(t.floors[f],x+s*d,z+c*d))throw Error('Collision approach starts obstructed '+item.id);t.pose(f,x+s*d,z+c*d,x,z);t.walk();t.keys.add('KeyW');for(let i=0;i<65;i++)t.update(.02);t.keys.clear();t.pause();const dx=t.player.x-item.x,dz=t.player.z-item.z;return {id:item.id,along:s*dx+c*dz,minimum:half+.30};},[f,kind,area,index]);assert(result.along>=result.minimum&&result.along<result.minimum+.14,'Actual keyboard movement stops outside its visible footprint: '+JSON.stringify(result));walks.push(result);
 }
 // A real keyboard walk across the east corridor must still reach the wing junction.
 const corridor=await page.evaluate(()=>{const t=window.hallTest;t.pose(0,24,8.2,33,8.2);t.walk();t.keys.add('KeyW');for(let i=0;i<100;i++)t.update(.02);t.keys.clear();t.pause();return {x:t.player.x,z:t.player.z};});assert(corridor.x>30&&Math.abs(corridor.z-8.2)<.01);
 await page.setViewportSize({width:390,height:844});for(const [name,...p] of views)await capture('mobile-'+name,name==='visitors'?[1,0,17.5,-3.6,13.1,1.15]:p);
 await page.route('**/explore.mjs',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.hallExplore={floors,interior,walker,renderer,exterior};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1200,height:800});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.hallExplore?.renderer.info.render.frame>2);
 assert.deepEqual(await page.evaluate(ids=>window.hallExplore.floors.flatMap(f=>f.furniture.filter(i=>ids.includes(i.roomId))),ids),records,'Explore and Escape have identical fixed hall props');
 for(const [name,f,x,z,tx,tz] of views){await page.evaluate(([f,x,z,tx,tz])=>{const t=window.hallExplore;Object.assign(t.walker.actor,{x,z,floor:f,y:t.floors[f].elevation,outside:false,stair:null});const yaw=Math.atan2(-(tx-x),-(tz-z));t.walker.look((t.exterior.camera.rotation.y-yaw)/.002,(t.exterior.camera.rotation.x+.10)/.002);t.walker.update(.01);},[f,x,z,tx,tz]);await page.waitForTimeout(300);await page.screenshot({path:fileURLToPath(new URL('explore-'+name+'.png',out))});captures.push('explore-'+name);}
 // Neutral-lit close views permit inspection of the complete procedural meshes.
 await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),models=await loadFurnitureModels(THREE),renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1200,800);renderer.setClearColor(0xc9c4b8);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff8eb,0x817769,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);const group=new THREE.Group();scene.add(group);const camera=new THREE.PerspectiveCamera(38,1.5,.01,50),overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:10000';overlay.append(renderer.domElement);document.body.append(overlay);
  window.hallPreview={show(kind){group.clear();for(const p of models[kind])group.add(new THREE.Mesh(p.geometry,p.material));const box=new THREE.Box3().setFromObject(group),size=box.getSize(new THREE.Vector3()),target=new THREE.Vector3(0,size.y*.47,0),d=Math.max(size.x,size.y,size.z)*2.0;camera.position.set(d*.65,target.y+d*.5,d);camera.lookAt(target);renderer.render(scene,camera);}};
 });
 for(const kind of ['sideboard','landscape','visitingNotice','linenCupboard','linenTrolley','dutyBoard','draughtsSet','newspaperStand','sewingBasket','foldedLinen']){await page.evaluate(k=>window.hallPreview.show(k),kind);await page.screenshot({path:fileURLToPath(new URL('model-'+kind+'.png',out))});captures.push('model-'+kind);}
 // Render only the two furnished plans changed by this request.
 for(const name of ['ground-floor','first-floor']){const svg=await readFile(new URL('../Research/room-furnishings/'+name+'.svg',import.meta.url),'utf8'),width=Number(svg.match(/width="(\d+)"/)[1]),height=Number(svg.match(/height="(\d+)"/)[1]);await page.setViewportSize({width,height});await page.setContent('<style>html,body{margin:0}</style>'+svg);await page.screenshot({path:fileURLToPath(new URL('../Research/room-furnishings/'+name+'.png',import.meta.url))});}
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',out),JSON.stringify({items:records.length,geometry,walks,corridor,captures,escapeExploreParity:true,errors},null,2)+'\n');console.log('PASS: 45 hall props in actual Escape/Explore, matching rendered sizes/transforms, flush wall mounts, nine keyboard collisions, corridor walk, ten model closeups, desktop/mobile views and no runtime/shader errors.');
}finally{await browser.close();server.kill();}
