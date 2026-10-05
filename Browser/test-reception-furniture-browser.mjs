import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL('./artifacts/reception-furniture/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],captures=[];
try{
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.receptionTest={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get renderer(){return renderer;},get camera(){return camera;},player,keys,update,start,showFloor,get arrival(){return arrivalCutscene;},pose(x,z,tx,tz,ty=1.25){Object.assign(player,{x,z,floor:0,y:floors[0].elevation,outside:false,stair:null});yaw=Math.atan2(-(tx-x),-(tz-z));pitch=Math.atan2(ty-1.65,Math.hypot(tx-x,tz-z));camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();for(const e of enemies)e.mesh.visible=false;$('arrivalFade').hidden=true;$('hud').hidden=false;},walk(){state='play';},pause(){state='paused';}};` }));
 await page.goto(base);await page.waitForFunction(()=>window.receptionTest?.ready);await page.evaluate(()=>{const t=window.receptionTest;t.start();t.arrival.update(3);t.pause();});
 const initial=await page.evaluate(()=>window.receptionTest.floors[0].furniture.filter(i=>i.roomId==='Reception'));assert.equal(initial.length,8);
 const desk=initial.find(i=>i.kind==='receptionDesk');
 for(const [name,...pose] of [['hall',0,18.6,0,desk.z,1.25],['desk',0,desk.z+2.4,0,desk.z,1.1],['west',-3.8,14.8,-6.8,14.5,1.3],['clock',-4.8,17.1,-6.8,17.25,1.55],['keys',4.7,11.15,6.9,11.15,1.7],['keys-close',6.15,11.15,6.9,11.15,1.7],['keys-side',6.25,11.75,6.9,11.15,1.7],['rules',-4.6,14.15,-6.98,14.15,1.82]]){
  await page.evaluate(p=>window.receptionTest.pose(...p),pose);await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});captures.push(name);
 }
 const geometry=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),models=await loadFurnitureModels(THREE),t=window.receptionTest,floor=t.floors[0],group=t.scene.children.find(g=>g.position.y===floor.elevation&&g.getObjectByName('Asylum furniture')).getObjectByName('Asylum furniture'),records=[];
  for(const item of floor.furniture.filter(i=>i.roomId==='Reception')){
   const parts=group.children.filter(m=>m.userData.furnitureIds?.includes(item.id));if(!parts.length)throw Error('Missing prop '+item.kind);
   let scale;for(const m of parts){const matrix=new THREE.Matrix4();m.getMatrixAt(m.userData.furnitureIds.indexOf(item.id),matrix);const actual=new THREE.Vector3().setFromMatrixPosition(matrix);if(actual.distanceTo(new THREE.Vector3(item.x,item.y,item.z))>1e-4)throw Error('Placement mismatch '+item.id);scale=new THREE.Vector3().setFromMatrixScale(matrix);}
   const bounds=new THREE.Box3();for(const part of models[item.kind])bounds.union(part.geometry.boundingBox);const size=bounds.getSize(new THREE.Vector3()).multiply(scale);if(size.distanceTo(new THREE.Vector3(item.width,item.height,item.depth))>1e-4)throw Error('Size mismatch '+item.kind);
   records.push({kind:item.kind,parts:parts.length,size:size.toArray()});
  }
  const labels=Object.values(models).flat().filter(p=>p.material.name.startsWith('Reception ')).map(p=>({name:p.material.name,width:p.material.map?.image.width,height:p.material.map?.image.height}));if(!labels.some(l=>l.name==='Reception hall rules')||!labels.some(l=>l.name==='Reception admissions ledger'))throw Error('Missing readable paperwork');return {records,labels};
 });
 // Walk both sides of the central desk, then approach it from the entrance.
 const walks=[];
 for(const [x,z,tx,tz,seconds] of [[-2,18.6,-2,10,1.8],[2,18.6,2,10,1.8],[0,18.6,0,desk.z,2]]){
  await page.evaluate(p=>{const t=window.receptionTest;t.pose(...p);t.walk();t.keys.add('KeyW');for(let i=0;i<p[4]/.02;i++)t.update(.02);t.keys.clear();t.pause();},[x,z,tx,tz,seconds]);
  walks.push(await page.evaluate(()=>({x:window.receptionTest.player.x,z:window.receptionTest.player.z})));
 }
 assert(Math.abs(walks[0].x+2)<.01&&walks[0].z<13.2&&Math.abs(walks[1].x-2)<.01&&walks[1].z<13.2,'Both sides remain walkable');assert(walks[2].z>=desk.z+desk.depth/2+.31&&walks[2].z<desk.z+desk.depth/2+.5,'Desk stops actual player outside its moved footprint');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.receptionTest.pose(0,18.6,0,12.5));await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL('hall-mobile.png',destination))});captures.push('hall-mobile');
 await page.route('**/explore.mjs',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.receptionExplore={floors,interior,walker,renderer,exterior};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1200,height:800});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.receptionExplore?.renderer.info.render.frame>2);
 assert.deepEqual(await page.evaluate(()=>window.receptionExplore.floors[0].furniture.filter(i=>i.roomId==='Reception')),initial,'Explore has the same fixed reception layout');
 await page.evaluate(()=>{const t=window.receptionExplore;Object.assign(t.walker.actor,{x:0,z:18.6,floor:0,y:t.floors[0].elevation,outside:false,stair:null});t.walker.look(t.exterior.camera.rotation.y/.002,(t.exterior.camera.rotation.x+.10)/.002);t.walker.update(.01);});
 await page.waitForTimeout(300);await page.screenshot({path:fileURLToPath(new URL('explore-hall.png',destination))});captures.push('explore-hall');
 // Refresh the accompanying furnished-plan previews from their saved SVGs.
 for(const name of ['ground-floor','first-floor','basement','second-floor']){
  const svg=await readFile(new URL('../Research/room-furnishings/'+name+'.svg',import.meta.url),'utf8'),width=Number(svg.match(/width="(\d+)"/)[1]),height=Number(svg.match(/height="(\d+)"/)[1]);
  await page.setViewportSize({width,height});await page.setContent('<style>html,body{margin:0}</style>'+svg);await page.screenshot({path:fileURLToPath(new URL('../Research/room-furnishings/'+name+'.png',import.meta.url))});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({geometry,walks,captures,escapeExploreParity:true,errors},null,2)+'\n');console.log('PASS: reception in actual Escape/Explore, all eight props and label textures, matching geometry/transforms, keyboard passage/collision, desktop/mobile views, no runtime/shader errors.');
}finally{await browser.close();server.kill();}
