import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const stage=process.env.JOIN_STAGE??'before',destination=new URL('./',import.meta.url);await mkdir(destination,{recursive:true});
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8'),instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1322,height:918}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 // Test-only module: the game server intentionally serves only dist.
 await page.route('**/corridor-join-probes.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../test-support/escape-corridor-join-probes.mjs',import.meta.url),'utf8')).replaceAll('../dist/','/')}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});await page.keyboard.press('f');
 const result=await page.evaluate(async()=>{const THREE=await import('/vendor/three.module.js'),{auditCorridorJoins}=await import('/corridor-join-probes.mjs'),t=groundsTest,gl=t.renderer.getContext();return {renderer:gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL),audit:auditCorridorJoins(THREE,t.exterior.model,t.grounds.workshops.group)};});
 for(const [name,pose] of Object.entries({
  'farndon':[154.1,-116,0,-.18],
  'farndon-close':[154.5,-117.1,-.2,-.32],
  'farndon-reverse':[154.2,-123.5,Math.PI,-.18],
  'diagonal-join':[149.5,-123.6,-2.35,-.18],
  'grafton-join':[132.5,-140.3,.9,-.18],
  'witby-join':[117.9,-155.5,.9,-.18],
  'irby-join':[154.5,-70.2,-.35,-.18],
  'admin-join':[154.5,5.7,-2.7,-.18],
  'hale-join':[154.5,-98.9,.35,-.18],
  'workshop-join':[154.5,-39,.75,-.18]
 })){
  await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',destination))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.evaluate(()=>groundsTest.pose(154.1,-116,0,-.18));await page.screenshot({path:fileURLToPath(new URL(stage+'-farndon-phone.png',destination))});
 await writeFile(new URL(stage+'.json',destination),JSON.stringify({result,errors},null,2));assert.deepEqual(errors,[]);if(stage==='after')assert.equal(result.audit.failures.length,0,JSON.stringify(result.audit.failures.slice(0,8)));console.log(JSON.stringify({renderer:result.renderer,corners:result.audit.corners,probes:result.audit.probes,failures:result.audit.failures.length,examples:result.audit.failures.slice(0,12),errors},null,2));
}finally{await browser?.close();server.kill();}
