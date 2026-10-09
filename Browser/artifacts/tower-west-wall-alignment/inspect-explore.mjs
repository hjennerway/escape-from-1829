import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const mode=process.argv.includes('--compiled')?'compiled':'source';
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:2032,height:720}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/alignment-probes.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../test-support/tower-wall-alignment-probes.mjs',import.meta.url),'utf8')).replace('../dist/tower-workshops.mjs','/tower-workshops.mjs')}));
 await page.route('**/explore.mjs',async r=>{
  const instrument=`window.alignmentTest={THREE,walker,workshops,exterior,renderer,timeline,lighting,refresh:refreshObstacles,
   pose(x,z,tx,tz,ty=2.4){walker.setView({position:[x,1.8,z],target:[tx,ty,tz],fov:75});renderer.render(exterior.scene,exterior.camera);}};window.__manual=true;`;
  const source=(await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8')).replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(',instrument+'\n  loadEscapeFrontage(');
  await r.fulfill({contentType:'text/javascript',body:source});
 });
 await page.goto(base+'/explore.html?view=irby-corridor&period=1916&lighting=day&models='+mode,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.alignmentTest);
 await page.addStyleTag({content:'.explore-guide,#layoutControls{display:none!important}'});
 await page.locator('#game').dispatchEvent('pointerdown',{button:0,pointerId:1,pointerType:'mouse',clientX:640,clientY:400});await page.locator('#game').dispatchEvent('pointerup',{button:0,pointerId:1});
 const receipt=await page.evaluate(async()=>{
  const {probeTowerWallAlignment}=await import('/alignment-probes.mjs'),t=alignmentTest;
  const checks=probeTowerWallAlignment(t.THREE,t.exterior.model),gl=t.renderer.getContext();
  return {model:t.exterior.modelBuild,renderer:gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL),checks};
 });
 assert.equal(receipt.model.mode,mode==='source'?'procedural':'compiled');
 for(const [key,value] of Object.entries(receipt.checks))assert.deepEqual(value,[],key);
 async function shot(name,pose){await page.evaluate(p=>alignmentTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL('explore-'+mode+'-'+name+'.png',import.meta.url))});}
 await shot('west',[134,-55.2,148,-55.2]);await shot('north-oblique',[140,-62,146,-66,4]);await shot('roof-contact',[137,-58,148,-64,9]);
 receipt.movement=await page.evaluate(()=>{
  const t=alignmentTest,results=[];
  for(const z of [-72,-67,-62]){
   t.walker.setView({position:[143,1.8,z],target:[149,1.8,z]});t.walker.keys.add('KeyW');for(let i=0;i<25;i++)t.walker.update(.04);t.walker.keys.clear();
   results.push({z,x:t.walker.actor.x,blocked:!t.walker.outside.clear(145.5,z)});
  }
  t.refresh();return results;
 });
 console.log('Movement '+JSON.stringify(receipt.movement));
 assert(receipt.movement.every(p=>p.x<145.2&&p.blocked),'Collision follows the moved facade: '+JSON.stringify(receipt.movement));
 await page.evaluate(()=>alignmentTest.lighting.setMode('dusk'));await shot('dusk',[134,-55.2,148,-55.2]);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>alignmentTest.lighting.setMode('day'));await shot('phone',[137,-60,146,-62.5,3]);
 assert.deepEqual(errors,[]);await writeFile(new URL('explore-'+mode+'-validation.json',import.meta.url),JSON.stringify({...receipt,errors},null,2));console.log(JSON.stringify({mode,model:receipt.model,checks:receipt.checks,movement:receipt.movement,errors}));
}finally{await browser?.close();server.kill();}
