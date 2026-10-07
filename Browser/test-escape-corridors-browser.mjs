import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL('./artifacts/corridor-network/',import.meta.url);await mkdir(destination,{recursive:true});
const harness=await readFile(new URL('./test-escape-grounds-browser.mjs',import.meta.url),'utf8'),instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1]+`
window.__corridorManual=true;
window.corridorSurfaceAt=(x,y)=>{const meshes=[];exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o)});const ray=new THREE.Raycaster();ray.setFromCamera({x,y},camera);return ray.intersectObjects(meshes,false).slice(0,4).map(h=>({name:h.object.name,parent:h.object.parent.name,point:h.point.toArray()}))};
window.corridorCeilingAt=(x,z)=>{const meshes=[];exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o)});const ray=new THREE.Raycaster(new THREE.Vector3(x,1.65,z),new THREE.Vector3(0,1,0));return ray.intersectObjects(meshes,false).map(h=>({name:h.object.name,point:h.point.toArray()}))};`;
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text())});
 await page.route('https://**/*',r=>r.abort());
 // Keep this manually stepped geometry check active when another local browser
 // gains focus. Focus-loss pausing has separate gameplay regression coverage.
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt').replace('function pause(){','function pause(){if(window.__corridorManual)return;').replace("addEventListener('blur',()=>{keys.clear();","addEventListener('blur',()=>{if(window.__corridorManual)return;keys.clear();");await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});
 const results=await page.evaluate(async()=>{const {ESCAPE_CORRIDOR_X:cx}=await import('/escape-corridor-plan.mjs');const t=groundsTest,w=t.grounds.workshops,gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:gl.getParameter(info.UNMASKED_RENDERER_WEBGL),cx,doors:w.lockedDoors.map(d=>({id:d.id,clear:t.walker.clear(...d.point)})),signs:w.group.userData.directionSigns};});

 results.walks=await page.evaluate(async()=>{
  const {ESCAPE_CORRIDOR_RUNS:runs,ESCAPE_CORRIDOR_X:cx}=await import('/escape-corridor-plan.mjs'),t=groundsTest;
  const entrance=t.grounds.nodes.find(n=>n.id==='tower-door');t.pose(80,24);t.walk(entrance);t.grounds.use(entrance);for(let i=0;i<25;i++)t.step();t.walk({x:cx,z:-44.75});
  return runs.map(r=>{const l=Math.hypot(r.end[0]-r.start[0],r.end[1]-r.start[1]);return {id:r.id,samples:t.walk({x:r.end[0]+(r.start[0]-r.end[0])*1.4/l,z:r.end[1]+(r.start[1]-r.end[1])*1.4/l})};});
 });
 assert(results.walks.every(r=>r.samples>0));assert(results.doors.every(d=>!d.clear));assert.equal(results.signs.length,9);
 results.keyboardDoors=[];
 for(const door of await page.evaluate(()=>groundsTest.grounds.workshops.lockedDoors)){
  const dx=door.toward[0]-door.point[0],dz=door.toward[1]-door.point[1],l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;
  await page.evaluate(p=>groundsTest.pose(...p),[door.point[0]+ux*1.4,door.point[1]+uz*1.4,Math.atan2(ux,uz)]);
  await page.keyboard.down('w');await page.keyboard.press('Space');await page.evaluate(()=>{for(let i=0;i<60;i++)groundsTest.step()});await page.keyboard.up('w');
  assert.equal(await page.evaluate(()=>groundsTest.state),'play');
  const position=await page.evaluate(()=>({...groundsTest.player})),distance=(position.x-door.point[0])*ux+(position.z-door.point[1])*uz;assert(distance>.2&&distance<.9,door.id+' permits approach but blocks physical keyboard walking / jump');
  const message=await page.evaluate(id=>groundsTest.grounds.use(groundsTest.grounds.nodes.find(n=>n.id===id)),door.id);assert.match(message,/locked/);results.keyboardDoors.push({id:door.id,position,message});
 }
 results.retryWalks=await page.evaluate(async()=>{
  const {ESCAPE_CORRIDOR_RUNS:runs,ESCAPE_CORRIDOR_X:cx}=await import('/escape-corridor-plan.mjs'),t=groundsTest;t.begin();t.exterior.lighting.setNight(false);
  const entrance=t.grounds.nodes.find(n=>n.id==='tower-door');t.pose(80,24);t.walk(entrance);t.grounds.use(entrance);t.grounds.update(1,t.player);
  try{t.walk({x:cx,z:-44.75});}catch(error){throw Error(error.message+'; retry entrance '+JSON.stringify({player:t.player,open:t.progress.run.towerOpen,angle:t.grounds.workshops.pivot.rotation.y,obstacle:t.grounds.workshops.doorObstacle(),doorClear:t.walker.clear(t.grounds.workshops.pivot.position.x,-44.75)}));}
  return runs.map(r=>{const l=Math.hypot(r.end[0]-r.start[0],r.end[1]-r.start[1]);return {id:r.id,samples:t.walk({x:r.end[0]+(r.start[0]-r.end[0])*1.4/l,z:r.end[1]+(r.start[1]-r.end[1])*1.4/l})};});
 });assert(results.retryWalks.every(r=>r.samples>0));
 for(const sign of results.signs){
  const f=sign.forward;await page.evaluate(p=>groundsTest.pose(...p),[sign.point[0]-f[0]*4,sign.point[1]-f[1]*4,Math.atan2(-f[0],-f[1]),.5]);
  await page.screenshot({path:fileURLToPath(new URL('sign-'+sign.id+'.png',destination))});
  if(sign.id==='irby-west')results.irbySurfaces=await page.evaluate(()=>corridorSurfaceAt(.27,.3));
 }
 results.irbyCeiling=await page.evaluate(cx=>corridorCeilingAt(cx,-72),results.cx);
 assert.equal(results.irbyCeiling[0].name,'Connected escape corridor ceiling','Original eave closure does not hang inside the raised passage');
 assert(Math.abs(results.irbyCeiling[0].point[1]-5.05)<1e-6);
 for(const [name,x,z,yaw] of [['tower-contact',results.cx,-55.2,Math.PI/2],['workshop-junction',results.cx,-46.2,0],['irby-junction',results.cx,-70.8,-Math.PI/2],['diagonal-junction',results.cx,-113,0],['diagonal',127,-146,Math.PI/4],['farndon-doors',results.cx,-123,0],['admin-junction',results.cx,5.5,Math.PI],['witby-doors',115.6,-183,0]]){
  await page.evaluate(p=>groundsTest.pose(...p),[x,z,yaw]);await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
 }
 await page.evaluate(()=>{const t=groundsTest;t.exterior.camera.position.set(150,260,-25);t.exterior.camera.lookAt(130,0,-85);t.renderer.render(t.exterior.scene,t.exterior.camera);});await page.screenshot({path:fileURLToPath(new URL('overview.png',destination))});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));await page.evaluate(x=>{groundsTest.exterior.lighting.setNight(false);groundsTest.pose(x,-34,0,.55)},results.cx);await page.screenshot({path:fileURLToPath(new URL('tower-phone.png',destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({errors,doors:results.doors},null,2));
}finally{await browser?.close();server.kill();}
