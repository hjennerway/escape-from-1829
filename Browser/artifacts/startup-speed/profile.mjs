import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser({ignoreDefaultArgs:['--disable-back-forward-cache']});
 const page=await browser.newPage({viewport:{width:1200,height:800}});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>{window.stage={};window.addEventListener('pageshow',e=>window.restored=e.persisted);});
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();let s=await response.text();
  s=s.replace('const renderer=new THREE.WebGLRenderer','window.stage.modules=performance.now();const renderer=new THREE.WebGLRenderer')
   .replace('const developer=bindDeveloperOptions','window.stage.models=performance.now();const developer=bindDeveloperOptions')
   .replace('const introFlight=beginIntroFlight','window.stage.setup=performance.now();const introFlight=beginIntroFlight')
   .replace('function frame(){','window.profile={renderer,exterior};function frame(){window.stage.first??=performance.now();')
   .replace('frontageReady.then(()=>renderer.compileAsync(exterior.scene,exterior.camera))','frontageReady.then(()=>{window.stage.frontage=performance.now();return renderer.compileAsync(exterior.scene,exterior.camera);})')
   .replace('frontageReady.then(()=>compileVisibleScene(THREE,renderer,exterior.scene,exterior.camera))','frontageReady.then(()=>{window.stage.frontage=performance.now();return compileVisibleScene(THREE,renderer,exterior.scene,exterior.camera);})');
  await r.fulfill({response,body:s});});
 await page.route('**/explore.mjs',async r=>{let s=await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8');
  s=s.replace('const canvas=document','window.stage.modules=performance.now();const canvas=document')
   .replace('canvas.addEventListener(\'webglcontextrestored\'','window.stage.models=performance.now();canvas.addEventListener(\'webglcontextrestored\'')
   .replace('const interior=deferExploreInterior','window.stage.floors=performance.now();const interior=deferExploreInterior')
   .replace('applyTreeRenderingDefault(renderer','window.stage.walker=performance.now();applyTreeRenderingDefault(renderer')
   .replace('bindTreeToggle(exterior','window.stage.workshops=performance.now();bindTreeToggle(exterior')
   .replace('const input=bindExploreInput','window.stage.paths=performance.now();const input=bindExploreInput')
   .replace(/await (renderer.compileAsync\(exterior.scene,exterior.camera\)|compileVisibleScene\(THREE,renderer,exterior.scene,exterior.camera\));/,'window.stage.setup=performance.now();await $1;window.stage.shaders=performance.now();')
   .replace('const clock=new THREE.Timer();','window.profile={renderer,exterior};const clock=new THREE.Timer();')
   .replace('renderer.setAnimationLoop(()=>{','renderer.setAnimationLoop(()=>{window.stage.first??=performance.now();');
  await r.fulfill({contentType:'text/javascript',body:s});});
 const results=[];
 for(const mode of process.env.DIRECT?[process.env.VIEW??'explore']:['aerial','explore']){
  if(!process.env.DIRECT){
  await page.goto(base+'/');await page.waitForFunction(()=>document.getElementById('game').classList.contains('scene-ready'));
  }
  const started=Date.now();if(process.env.DIRECT)await page.goto(base+'/'+mode+'.html?intro=1');else{await page.locator('#'+mode).click({noWaitAfter:true});await page.waitForURL('**/'+mode+'.html*',{waitUntil:'commit'});}
  await page.waitForFunction(()=>window.stage.first&&!document.body.classList.contains('intro-arriving'));
  const record=await page.evaluate(()=>({mode:location.pathname,stage,models:profile.exterior.modelBuild,draws:profile.renderer.info.render.calls,ready:performance.now()}));
  record.clickToReady=Date.now()-started;console.log(JSON.stringify(record));results.push(record);
  if(process.env.DIRECT)continue;
  await page.locator('#backToIntro').click({noWaitAfter:true});await page.waitForURL(base+'/',{waitUntil:'commit'});
  await page.waitForFunction(()=>document.getElementById('game').classList.contains('scene-ready'));
  console.log('Back restored: '+await page.evaluate(()=>window.restored));
 }
 await mkdir(new URL('./',import.meta.url),{recursive:true});await writeFile(new URL('./'+(process.env.PROFILE_NAME??'baseline')+'.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
}finally{await browser?.close();server.kill();}
