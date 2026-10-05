import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const out=new URL('./artifacts/ward-privies/',import.meta.url);await mkdir(out,{recursive:true});
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'}),errors=[],captures=[],startup=[];
 page.on('requestfailed',r=>startup.push({url:r.url(),failure:r.failure()?.errorText}));page.on('console',m=>{if(m.type()==='error')startup.push({console:m.text()});});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.sanitaryTest={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get renderer(){return renderer;},get camera(){return camera;},get arrival(){return arrivalCutscene;},player,keys,start,update,
 pose(f,x,z,tx,tz,ty=1){Object.assign(player,{x,z,floor:f,y:floors[f].elevation,stair:null,outside:false});yaw=Math.atan2(-(tx-x),-(tz-z));pitch=Math.atan2(ty-1.65,Math.hypot(tx-x,tz-z));camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();for(const e of enemies)e.mesh.visible=false;$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;},play(){state='play';},pause(){state='paused';}};` }));
 await page.goto(base);
 try{await page.waitForFunction(()=>window.sanitaryTest?.ready);}catch(error){await writeFile(new URL('startup-diagnostic.json',out),JSON.stringify({errors,startup,state:await page.evaluate(()=>({test:!!window.sanitaryTest,ready:window.sanitaryTest?.ready,text:document.body.innerText.slice(-1500)}))},null,2));await page.screenshot({path:fileURLToPath(new URL('startup-diagnostic.png',out))});throw error;}
 await page.evaluate(()=>{const t=window.sanitaryTest;t.start();t.arrival.update(3);t.pause();});
 const records=await page.evaluate(()=>window.sanitaryTest.floors.flatMap(f=>f.furniture.filter(i=>['privySeat','privyScreen','washstand'].includes(i.kind))));assert.equal(records.length,56);
 const geometry=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),{SANITARY_CATALOG}=await import('/sanitary-furnishings.mjs'),models=await loadFurnitureModels(THREE),t=window.sanitaryTest;let fixtures=0;
  for(const f of t.floors.filter(f=>f.id<2)){
   const group=t.scene.children.find(g=>g.position.y===f.elevation&&g.getObjectByName('Asylum furniture')).getObjectByName('Asylum furniture');
   for(const item of f.furniture.filter(i=>i.kind in SANITARY_CATALOG)){
    const meshes=group.children.filter(m=>m.userData.furnitureIds?.includes(item.id));if(meshes.length!==models[item.kind].length)throw Error('Missing fixture parts '+item.id);
    const bounds=new THREE.Box3();for(const p of models[item.kind])bounds.union(p.geometry.boundingBox);
    for(const mesh of meshes){const matrix=new THREE.Matrix4();mesh.getMatrixAt(mesh.userData.furnitureIds.indexOf(item.id),matrix);const position=new THREE.Vector3().setFromMatrixPosition(matrix),scale=new THREE.Vector3().setFromMatrixScale(matrix);if(position.distanceTo(new THREE.Vector3(item.x,item.y,item.z))>1e-5||bounds.getSize(new THREE.Vector3()).multiply(scale).distanceTo(new THREE.Vector3(item.width,item.height,item.depth))>1e-5)throw Error('Fixture transform/footprint differs '+item.id);}
    fixtures++;
   }
  }
  return {fixtures};
 });assert.equal(geometry.fixtures,56);
 const views=[];
 for(const f of [0,1])for(const [id,side,rear] of [['R5',-1,true],['R16',1,true],['R33',-1,false],['R35',1,false]])views.push([`${f}-${id}`,f,side*(rear?33.1:35.5),rear?-34.50:23.5,side*(rear?29.8:38.65),rear?-32.9:26.5,.95]);
 async function capture(name,pose){await page.evaluate(p=>window.sanitaryTest.pose(...p),pose);await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});captures.push(name);}
 for(const [name,...pose] of views)await capture('escape-'+name,pose);
 await capture('seat-close',[0,-29.8,-34.15,-29.8,-32.85,.53]);
 await capture('washstand-close',[0,-26.65,-34.4,-26.65,-32.85,1.03]);
 await capture('rear-privies',[0,-30.4,-34.8,-29.8,-32.85,.90]);
 await capture('forward-privies',[0,-38.7,23.1,-38,26.5,.90]);
 const walks=[];
 for(const item of records.filter(i=>i.kind!=='privyScreen')){
  const result=await page.evaluate(item=>{const t=window.sanitaryTest,f=Number(item.id.split(':')[0]),s=Math.sin(item.rotation),c=Math.cos(item.rotation),d=item.depth/2+1.0;t.pose(f,item.x+s*d,item.z+c*d,item.x,item.z);t.play();t.keys.add('KeyW');for(let i=0;i<30;i++)t.update(.02);t.keys.clear();t.pause();const along=s*(t.player.x-item.x)+c*(t.player.z-item.z);return {id:item.id,along,minimum:item.depth/2+.30};},item);
  assert(result.along>=result.minimum-.01&&result.along<result.minimum+.16,'Actual keyboard movement stops at the visible fixture '+JSON.stringify(result));walks.push(result);
 }
 await page.addStyleTag({content:'#interact{display:none!important}'});
 await page.setViewportSize({width:390,height:844});await capture('mobile-rear',views[1].slice(1));await capture('mobile-forward',views[2].slice(1));
 await page.route('**/explore.mjs',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.sanitaryExplore={floors,interior,walker,renderer,exterior};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1200,height:800});await page.goto(base+'/explore.html?period=1829');await page.waitForFunction(()=>window.sanitaryExplore?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'.explore-guide{display:none!important} #layoutControls{display:none!important}'});
 assert.deepEqual(await page.evaluate(()=>window.sanitaryExplore.floors.flatMap(f=>f.furniture.filter(i=>['privySeat','privyScreen','washstand'].includes(i.kind)))),records,'Escape/Explore use identical sanitation records');
 for(const [name,f,x,z,tx,tz,ty] of views){await page.evaluate(([f,x,z,tx,tz,ty])=>{const t=window.sanitaryExplore;Object.assign(t.walker.actor,{x,z,floor:f,y:t.floors[f].elevation,outside:false,stair:null});const yaw=Math.atan2(-(tx-x),-(tz-z)),pitch=Math.atan2(ty-1.65,Math.hypot(tx-x,tz-z));t.walker.look((t.exterior.camera.rotation.y-yaw)/.002,(t.exterior.camera.rotation.x-pitch)/.002);t.walker.update(.01);},[f,x,z,tx,tz,ty]);await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL('explore-'+name+'.png',out))});captures.push('explore-'+name);}
 // Well-lit model views expose openings, boards and supported washstand vessels.
 await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),models=await loadFurnitureModels(THREE),renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1200,800);renderer.setClearColor(0xc9c4b8);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff8eb,0x817769,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);const group=new THREE.Group();scene.add(group);const camera=new THREE.PerspectiveCamera(38,1.5,.01,50),overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:10000';overlay.append(renderer.domElement);document.body.append(overlay);
  window.sanitaryPreview={show(kind){group.clear();for(const p of models[kind])group.add(new THREE.Mesh(p.geometry,p.material));const size=new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3()),target=new THREE.Vector3(0,size.y*.47,0),d=Math.max(size.x,size.y,size.z)*2;camera.position.set(d*.65,target.y+d*.7,d);camera.lookAt(target);renderer.render(scene,camera);}};
 });
 for(const kind of ['privySeat','privyScreen','washstand']){await page.evaluate(k=>window.sanitaryPreview.show(k),kind);await page.screenshot({path:fileURLToPath(new URL('model-'+kind+'.png',out))});captures.push('model-'+kind);}
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',out),JSON.stringify({geometry,walks,captures,escapeExploreParity:true,errors},null,2)+'\n');
 console.log('PASS: 56 actual fixtures, 28 keyboard collision approaches, eight rooms in Escape/Explore, desktop/mobile and model views, matching footprints and no runtime/shader errors.');
}finally{if(browser)await browser.close();server.kill();}
