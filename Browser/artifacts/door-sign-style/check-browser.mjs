import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const out=new URL('./',import.meta.url),{server,base}=await startTestServer();let browser;
const errors=[],results=[],baseline=JSON.parse(await readFile(new URL('../stair-floor-signs/validation.json',import.meta.url)));
const instrument=`
window.signStyleTest={get ready(){return ready},get loader(){return interiorLoader},get floors(){return floors},get groups(){return floorGroups},get scene(){return scene},get renderer(){return renderer},get grounds(){return escapeGrounds},get exterior(){return exterior},
begin(){window.__manual=true;start();arrivalCutscene.update(3);state='paused';enemies.forEach(e=>e.mesh.visible=false)},
pose(view){const f=floors[view.floor];Object.assign(player,{x:view.x,z:view.z,y:f.elevation,floor:f.id,outside:false,stair:null});state='paused';uiPlaying(true);showFloor();scene.add(torch,torchTarget);camera.position.set(view.x,f.elevation+1.65,view.z);camera.lookAt(view.tx,f.elevation+view.y,view.tz);this.render(scene)},
outside(view){Object.assign(player,{x:view.x,z:view.z,y:0,floor:0,outside:true,stair:null});showFloor();exterior.scene.add(torch,torchTarget);exterior.lighting.setNight(false);camera.position.set(view.x,1.65,view.z);camera.lookAt(view.tx,view.y,view.tz);this.render(exterior.scene)},
render(world){for(const id of ['arrivalFade','result','instructions','interact','hud','pause','touch'])$(id).hidden=true;torch.position.copy(camera.position);camera.getWorldDirection(tmp);torchTarget.position.copy(camera.position).addScaledVector(tmp,12);renderer.toneMappingExposure=1.25;renderer.render(world,camera)}};`;

try{
 browser=await launchHardwareBrowser();
 for(const mode of ['assets','worker']){
  const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});page.setDefaultTimeout(180000);page.setDefaultNavigationTimeout(180000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text())});
  await page.route('https://**/*',r=>r.abort());
  if(mode==='worker')await page.route('**/compiled/interior/**',r=>r.fulfill({status:404,body:''}));
  await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt')+instrument}));
  await page.goto(base+'/');await page.waitForFunction(()=>window.signStyleTest?.ready);await page.evaluate(()=>signStyleTest.loader.startBackground());await page.waitForFunction(()=>signStyleTest.loader.complete);
  assert.equal(await page.evaluate(()=>signStyleTest.loader.stats.mode),mode);
  const record=await page.evaluate(async()=>{
   const t=signStyleTest,THREE=await import('/vendor/three.module.js'),records=[];
   async function hash(image){const pixels=image.data??image.getContext('2d').getImageData(0,0,image.width,image.height).data;return [...new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))].map(b=>b.toString(16).padStart(2,'0')).join('')}
   for(const f of t.floors){
    const meshes=[],stairs=[];t.groups[f.id].traverse(o=>{if(o.name==='Asylum RoomDoorLabels')meshes.push(o);if(o.name==='Asylum StairFloorSigns')stairs.push(o)});
    const labels=meshes.flatMap(m=>m.userData.labels).sort((a,b)=>a.roomId.localeCompare(b.roomId)||a.face-b.face);
    if(new Set(meshes.map(m=>m.material)).size!==1)throw Error('Duplicated room atlas');
    if(meshes.some(m=>!m.material.isMeshStandardMaterial||m.material.roughness!==.94))throw Error('Door paint must use floor-sign lighting');
    records.push({floor:f.id,labels,doorPaint:await hash(meshes[0].material.map.image),stairPaint:await hash(stairs[0].material.map.image)});
   }
   const gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return {records,renderer:gl.getParameter(info.UNMASKED_RENDERER_WEBGL)};
  });
  assert.deepEqual(record.records.map(r=>r.labels.length),[76,66,22,20]);
  assert.deepEqual(record.records.map(r=>r.stairPaint),baseline.results[0].records.map(r=>r.paintHash),'Floor-sign pixels remain identical to the reference style');
  if(mode==='worker')assert.deepEqual(record.records,results[0].records,'Prepared and worker signs have identical text, paint and placement');
  results.push({mode,...record});
  if(mode==='assets'){
   await page.evaluate(()=>signStyleTest.begin());
   for(const [name,floor,id] of [['treatment',0,'R1'],['number',1,'R14'],['basement',2,'B3'],['upstairs',3,'R41']]){
    const view=await page.evaluate(({floor,id})=>{const t=signStyleTest,f=t.floors[floor],door=f.roomDoors.find(d=>d.roomId===id),label=t.groups[floor].getObjectByName('Asylum RoomDoorLabels')?.userData.labels.find(l=>l.roomId===id&&l.face===1);const n=[Math.sin(door.rotation),Math.cos(door.rotation)];return {floor,x:door.x+n[0]*1.2,z:door.z+n[1]*1.2,tx:door.x,tz:door.z,y:label?.y??1.75}},{floor,id});
    await page.evaluate(view=>signStyleTest.pose(view),view);await page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});
    if(name==='treatment'){await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.evaluate(view=>signStyleTest.pose(view),view);await page.screenshot({path:fileURLToPath(new URL('mobile-treatment.png',out))});await page.setViewportSize({width:1200,height:800});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))}
   }
   const workshop=await page.evaluate(()=>{
    const w=signStyleTest.grounds.workshops,boards=[w.pivot.getObjectByName('Workshop door sign'),...w.roomDoors.map(d=>d.pivot.getObjectByName(d.title.replace(' door','')+' door sign'))];
    return boards.map(o=>({name:o.name,material:o.material.type,roughness:o.material.roughness,paint:[o.material.map.image.width,o.material.map.image.height]}));
   });assert.equal(workshop.length,4);assert(workshop.every(o=>o.material==='MeshStandardMaterial'&&o.roughness===.94&&o.paint[0]===1024&&o.paint[1]===320));results[0].workshop=workshop;
   for(const [name,view] of [['workshop',{x:144.8,z:-44.75,tx:146.16,tz:-44.75,y:2.65}],['repair',{x:155.8,z:-40,tx:153.6,tz:-40,y:1.98}],['oil',{x:155.8,z:-31.5,tx:153.6,tz:-31.5,y:1.98}],['machine',{x:156.8,z:-48.5,tx:159,tz:-48.5,y:1.98}]]){await page.evaluate(view=>signStyleTest.outside(view),view);await page.screenshot({path:fileURLToPath(new URL(name+'.png',out))})}
   await page.evaluate(()=>signStyleTest.grounds.workshops.sync(true,{'workshop-door:repair':true}));await page.evaluate(()=>signStyleTest.outside({x:155.8,z:-40,tx:153.6,tz:-40,y:1.98}));await page.screenshot({path:fileURLToPath(new URL('repair-open.png',out))});
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',out),JSON.stringify({results,errors},null,2)+'\n');
 console.log('PASS: all 184 room-sign faces, four workshop signs, matching prepared/worker paint and exact preservation of reference floor-sign pixels; desktop/mobile and moving-door views; no page/shader errors.');
}finally{await browser?.close();server.kill()}
