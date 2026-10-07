import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const destination=new URL('./',import.meta.url);
await mkdir(destination,{recursive:true});
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8'),instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});
 await page.keyboard.press('f');
 const result=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{ESCAPE_CORRIDOR_X:cx,ESCAPE_CORRIDOR_RUNS:runs}=await import('/escape-corridor-plan.mjs'),t=groundsTest,w=t.grounds.workshops,meshes=[];
  t.exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o)});
  const hits=(p,d)=>new THREE.Raycaster(new THREE.Vector3(...p),new THREE.Vector3(...d),0,8).intersectObjects(meshes,false).slice(0,12).map(h=>({name:h.object.name,p:h.point.toArray(),distance:h.distance}));
  const probes={};
  for(const [name,p,d] of [['machine-floor',[168,1,-48],[0,-1,0]],['machine-roof',[168,3.3,-40.7],[0,1,0]],['hale-header',[137.2,4.1,-95.405],[-1,0,0]],['admin-edge',[cx-.95,3.4,22],[0,0,1]]])probes[name]=hits(p,d);
  const intrusions=[];t.exterior.model.traverse(o=>{if(!o.isMesh||o.userData.aerialBatch)return;const b=new THREE.Box3().setFromObject(o);if(b.max.x>158&&b.min.x<178&&b.max.z>-60&&b.min.z<-40.5&&b.min.y<5.05&&b.max.y>0&&/roof|floor|court/i.test(o.name))intrusions.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});});
  return {cx,probes,intrusions,runs};
 });
 for(const [name,pose] of Object.entries({'machine':[168,-51,Math.PI,.25],'machine-floor':[168,-51,Math.PI,-.5],'hale':[139,-95.405,Math.PI/2,.45],'admin':[result.cx,22,Math.PI,.15],'gallery':[result.cx,-85,0,.08],'irby':[185,-66.6,-Math.PI/2,.12]})){
  await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL((process.env.REPAIR_STAGE??'before')+'-'+name+'.png',destination))});
 }
 for(const run of result.runs){const dx=run.end[0]-run.start[0],dz=run.end[1]-run.start[1],l=Math.hypot(dx,dz);await page.evaluate(p=>groundsTest.pose(...p),[run.end[0]-dx/l*3,run.end[1]-dz/l*3,Math.atan2(-dx,-dz),.3]);await page.screenshot({path:fileURLToPath(new URL((process.env.REPAIR_STAGE??'before')+'-end-'+run.id+'.png',destination))});}
 await page.evaluate(()=>{const t=groundsTest;for(const d of t.grounds.workshops.roomDoors)t.grounds.workshops.setDoorOpen(d.id,true);t.step(1);});
 for(const [name,pose] of Object.entries({'machine-west':[170,-50,Math.PI/2,.05],'tower-corner':[result.cx,-51.6,.9,.18],'brick-repeat':[result.cx,-81,Math.PI/2,-.02]})){await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL((process.env.REPAIR_STAGE??'before')+'-'+name+'.png',destination))});}
 for(const mode of ['day','dusk','night']){await page.evaluate(mode=>groundsTest.exterior.lighting.setMode(mode),mode);await page.evaluate(p=>groundsTest.pose(...p),[result.cx,-88,0,.08]);await page.screenshot({path:fileURLToPath(new URL((process.env.REPAIR_STAGE??'before')+'-windows-'+mode+'.png',destination))});}
 await page.evaluate(()=>groundsTest.exterior.lighting.setMode('day'));await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.evaluate(p=>groundsTest.pose(...p),[result.cx,-83,0,.16]);await page.screenshot({path:fileURLToPath(new URL((process.env.REPAIR_STAGE??'before')+'-phone.png',destination))});
 await writeFile(new URL((process.env.REPAIR_STAGE??'before')+'.json',destination),JSON.stringify({result,errors},null,2));assert.deepEqual(errors,[]);if(process.env.REPAIR_STAGE==='final'){assert(result.probes['machine-floor'][0].name==='Continuous escape corridor and workshop floor');assert(result.intrusions.every(o=>o.name==='Continuous escape corridor and workshop floor'));}console.log(JSON.stringify({result,errors},null,2));
}finally{await browser?.close();server.kill();}
