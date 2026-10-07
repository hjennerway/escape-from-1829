import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const stage=process.argv[2]??'before',destination=new URL('./',import.meta.url);await mkdir(destination,{recursive:true});
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8'),instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1009,height:619}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await page.route('**/corridor-join-probes.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../test-support/escape-corridor-join-probes.mjs',import.meta.url),'utf8')).replaceAll('../dist/','/')}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});
 await page.addStyleTag({content:'#hud,body>header,.game-developer-options{display:none!important}'});
 const result=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{auditDoorHeaderJoins,auditCorridorJoins}=await import('/corridor-join-probes.mjs'),t=groundsTest,gl=t.renderer.getContext();
  return {renderer:gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL),headers:auditDoorHeaderJoins(THREE,t.exterior.model,t.grounds.workshops.group),corners:auditCorridorJoins(THREE,t.exterior.model,t.grounds.workshops.group),doors:t.grounds.workshops.lockedDoors};
 });
 async function shot(door,name,distance=1.7,offset=0,pitch=.75){
  const dx=door.toward[0]-door.point[0],dz=door.toward[1]-door.point[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length;
  await page.evaluate(p=>groundsTest.pose(...p),[door.point[0]+ux*distance+uz*offset,door.point[1]+uz*distance-ux*offset,Math.atan2(ux,uz),pitch]);
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',destination))});
 }
 if(!process.argv.includes('--phone-only'))for(const door of result.doors){
  const name=door.id.replaceAll(':','-');await shot(door,name);
  if(/hale-1|diagonal/.test(door.id))for(const side of [-1,1])await shot(door,name+(side<0?'-left':'-right'),1.9,side*.55);
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await shot(result.doors.find(d=>d.id==='corridor-lock:hale-1:1'),'hale-phone',4.2,0,.55);
 await writeFile(new URL(stage+'.json',destination),JSON.stringify({result,errors},null,2));
 assert.deepEqual(errors,[]);
 if(stage==='after'){assert.equal(result.headers.failures.length,0,JSON.stringify(result.headers.failures.slice(0,8)));assert.equal(result.corners.failures.length,0,JSON.stringify(result.corners.failures.slice(0,8)));}
 console.log(JSON.stringify({renderer:result.renderer,doors:result.headers.doors,headerProbes:result.headers.probes,headerFailures:result.headers.failures.length,cornerProbes:result.corners.probes,cornerFailures:result.corners.failures.length,errors},null,2));
}finally{await browser?.close();server.kill();}
