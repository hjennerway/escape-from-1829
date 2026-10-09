import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {startTestServer} from './test-support/server.mjs';
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser({ignoreDefaultArgs:['--disable-back-forward-cache']});
 const page=await browser.newPage({viewport:{width:1200,height:800}});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 // Keep this check focused on the two real views and history, including early
 // intro clicks. Intro/game loading is exercised by test-intro-navigation.
 if(!process.env.REAL_INTRO)await page.route('**/game.mjs',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>{window.documentToken=crypto.randomUUID();window.addEventListener('pageshow',e=>window.fromCache=e.persisted);});
 for(const [mode,width,height] of [['aerial',1200,800],['explore',1200,800],['aerial',390,844],['explore',390,844]]){
  if(page.url()!==base+'/')await page.goto(base+'/');await page.locator('#'+mode).waitFor();
  await page.setViewportSize({width,height});
  if(process.env.REAL_INTRO)await page.waitForFunction(()=>document.getElementById('game').classList.contains('scene-ready'));
  const title=await page.evaluate(()=>window.documentToken),start=Date.now();
  await page.locator('#'+mode).click({noWaitAfter:true});await page.waitForURL('**/'+mode+'.html*',{waitUntil:'commit'});
  await page.waitForFunction(()=>!document.body.classList.contains('intro-arriving')&&document.querySelector('#switchView')?.disabled===false);
  const first=Date.now()-start,token=await page.evaluate(()=>window.documentToken);
  // URL changes must preserve our history metadata.
  await page.locator('#previousPeriod').click();
  const back=Date.now();await page.locator('#backToIntro').click({noWaitAfter:true});await page.waitForURL(base+'/',{waitUntil:'commit'});
  const restoredTitle=await page.evaluate(()=>({token:window.documentToken,cached:window.fromCache,reasons:performance.getEntriesByType('navigation')[0]?.notRestoredReasons}));
  console.log('Title restore: '+JSON.stringify(restoredTitle));
  assert.equal(restoredTitle.token,title,'Returning must retain the intro document');assert(restoredTitle.cached);
  const returned=Date.now()-back,revisit=Date.now();
  await page.locator('#'+mode).click({noWaitAfter:true});await page.waitForURL('**/'+mode+'.html*',{waitUntil:'commit'});
  assert.equal(await page.evaluate(()=>window.documentToken),token,'Reopening must retain the initialized view');
  assert(await page.evaluate(()=>window.fromCache));assert.equal(await page.locator('#introTransition').count(),0);
  assert.equal(await page.evaluate(()=>innerWidth),width);
  results.push({mode,width,firstMilliseconds:first,returnMilliseconds:returned,revisitMilliseconds:Date.now()-revisit});
  await page.screenshot({path:fileURLToPath(new URL('./artifacts/startup-speed/'+mode+'-'+width+'-restored.png',import.meta.url))});
  await page.locator('#backToIntro').click({noWaitAfter:true});await page.waitForURL(base+'/',{waitUntil:'commit'});
 }
 assert.deepEqual(errors,[]);await mkdir(new URL('./artifacts/startup-speed/',import.meta.url),{recursive:true});
 await writeFile(new URL('./artifacts/startup-speed/'+(process.env.REAL_INTRO?'cache-full-intro':'cache-validation')+'.json',import.meta.url),JSON.stringify({results,errors},null,2)+'\n');console.log(JSON.stringify(results));
}finally{await browser?.close();server.kill();}
