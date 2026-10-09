import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const label=process.argv[2]??'after';
await mkdir(new URL('./',import.meta.url),{recursive:true});
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8');
const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1124,height:700}});page.setDefaultTimeout(180000);
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/THREE|shader|WebGL/i.test(message.text()))errors.push(message.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>{
  const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
  await route.fulfill({contentType:'text/javascript',body:source+instrument});
 });
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);
 await page.evaluate(()=>{const t=groundsTest;t.begin();t.exterior.lighting.setNight(false);t.grounds.use(t.grounds.nodes.find(n=>n.id==='tower-door'));for(const n of t.grounds.nodes.filter(n=>n.id.startsWith('workshop-door:')))t.grounds.use(n);t.step(1);});
 async function shot(name,pose){await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(label+'-'+name+'.png',import.meta.url))});}
 await shot('repair',[151.2,-39.9,Math.PI/2,.16]);
 await shot('oil-store',[151.8,-28.5,.85,.16]);
 await shot('vestibule',[151.2,-46,Math.PI/2,.16]);
 await shot('exterior',[139,-39.9,-Math.PI/2,.16]);
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
 await shot('repair-phone',[151.2,-42.5,Math.PI/2,.16]);
 await page.addStyleTag({content:'#hud,#interact,.vignette{display:none!important}'});
 await shot('repair-phone-detail',[151.2,-42.5,Math.PI/2,.16]);
 const validation=await page.evaluate(()=>{const t=groundsTest,gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:gl.getParameter(info.UNMASKED_RENDERER_WEBGL),modelMode:t.exterior.modelBuild};});
 await writeFile(new URL(label+'-validation.json',import.meta.url),JSON.stringify({validation,errors},null,2));
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({validation,errors},null,2));
}finally{await browser?.close();server.kill();}
