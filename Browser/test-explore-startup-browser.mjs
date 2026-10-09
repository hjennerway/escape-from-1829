import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const out=new URL('./artifacts/explore-startup/',import.meta.url);await mkdir(out,{recursive:true});
const {server,base}=await startTestServer();let browser;const results=[];
try{
 browser=await launchHardwareBrowser();
 for(const [name,width,height,storage,fallback] of [['desktop',1200,800,true,false],['phone-fallback',390,844,false,true]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'});
  page.setDefaultTimeout(180000);page.setDefaultNavigationTimeout(180000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',r=>r.abort());
  if(!storage)await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('Storage unavailable');};});
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.aerialTest={renderer,exterior};function frame(){')});});
  let releaseModule,releaseFurniture,furnitureRequests=0,failFurniture=name==='desktop';
  const moduleGate=new Promise(resolve=>releaseModule=resolve),furnitureGate=new Promise(resolve=>releaseFurniture=resolve);
  await page.route('**/explore.mjs',async route=>{
   await moduleGate;const response=await route.fetch();
   await route.fulfill({response,body:(await response.text())
    .replace('const clock=new THREE.Timer();','window.startupTest={renderer,exterior,walker,interior,input,floors};const clock=new THREE.Timer();')
    .replace('if(window.viewHandoff){','window.firstOutdoorDraw??=performance.now();if(window.viewHandoff){')});
  });
  await page.route('**/models/furniture/**',async route=>{furnitureRequests++;await furnitureGate;if(failFurniture){failFurniture=false;await route.fulfill({status:503,body:'Simulated download failure'});}else await route.continue();});
  await page.goto(base+'/aerial.html?at=0,40,0&period=1916&lighting=day');
  await page.waitForFunction(()=>window.aerialTest?.renderer.info.render.frame>2);
  if(fallback)await page.route('**/compiled/manifest.json',r=>r.fulfill({status:404,body:'Not built'}));
  await page.locator('#switchView').click({noWaitAfter:true});
  await page.waitForURL('**/explore.html*',{waitUntil:'commit'});
  await page.waitForFunction(()=>document.getElementById('introStill')?.complete&&document.getElementById('introStill').naturalWidth>0);
  const preview=await page.evaluate(()=>({src:document.getElementById('introStill').getAttribute('src'),at:new URL(location.href).searchParams.get('at'),handoff:new URL(location.href).searchParams.has('handoff'),ms:performance.now()}));
  assert.equal(preview.handoff,false,'Navigation marker is consumed before scene loading');
  assert.equal(preview.at,'0,40,0');assert.equal(preview.src.startsWith('data:image/jpeg'),storage);
  assert.equal(await page.locator('#introTransition [role="status"]').textContent(),'Preparing the grounds…');
  assert(await page.locator('#introTransition a').isVisible(),'Loading and failures retain an exit');
  const bounds=await page.locator('#introStill').boundingBox();assert.equal(bounds.width,width);assert.equal(bounds.height,height);
  await page.screenshot({path:fileURLToPath(new URL(name+'-loading.png',out))});
  releaseModule();
  await page.waitForFunction(()=>window.firstOutdoorDraw&&document.getElementById('introTransition')===null);
  const first=await page.evaluate(()=>({ms:window.firstOutdoorDraw,mode:startupTest.exterior.modelBuild.mode,position:startupTest.exterior.camera.position.toArray(),inside:!!startupTest.interior.scene}));
  assert.equal(first.mode,fallback?'procedural':'compiled');assert(!first.inside,'First ground frame does not depend on furniture downloads');
  assert(Math.abs(first.position[0])<1e-8&&Math.abs(first.position[2]-40)<1e-8);
  // Movement must work even with furniture downloads held indefinitely.
  let touch;
  if(width<500){const button=await page.locator('[data-key="KeyS"]').boundingBox();touch=await page.context().newCDPSession(page);await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2,id:7}]});}
  else{await page.mouse.click(width/2,height*.45);await page.keyboard.down('KeyS');}
  await page.waitForFunction(()=>startupTest.walker.actor.z>40.5);
  if(touch){await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.detach();}else await page.keyboard.up('KeyS');
  assert(furnitureRequests>0);assert(!await page.evaluate(()=>!!startupTest.interior.scene));
  await page.screenshot({path:fileURLToPath(new URL(name+'-walking.png',out))});
  await page.evaluate(()=>{const {walker,floors}=startupTest,e=floors[0].exits.find(e=>e.id==='D1'),[x,y,z]=e.destination;walker.setView({position:[x,y+1.8,z],target:[x,y+1.8,z-1]});walker.useDoor();});
  await page.waitForFunction(()=>!document.getElementById('roomPreparing').hidden);
  assert(await page.evaluate(()=>startupTest.walker.actor.outside),'Door waits on visible ground');
  releaseFurniture();
  if(name==='desktop'){
   await page.waitForFunction(()=>startupTest.interior.loading.failed);
   assert(await page.evaluate(()=>startupTest.walker.actor.outside),'Failed download leaves the grounds visible');
   await page.screenshot({path:fileURLToPath(new URL(name+'-retry.png',out))});
   await page.locator('#roomPreparing button').click();
  }
  await page.waitForFunction(()=>!startupTest.walker.actor.outside);
  await page.screenshot({path:fileURLToPath(new URL(name+'-inside.png',out))});
  assert(await page.evaluate(()=>startupTest.interior.scene.userData.interiorSectionsReady>0));
  assert.deepEqual(errors,[]);results.push({name,previewVisibleMilliseconds:preview.ms,firstOutdoorDrawMilliseconds:first.ms,model:first.mode,walkingDuringDelayedFurniture:true,doorWaitsAndRetries:true,failedDownloadRetry:name==='desktop',errors});
  console.log('PASS: '+name+' loading preview, exact location, outdoor movement during delayed furniture, gated door and automatic entry.');
  await page.close();
 }
 // A scene-module failure leaves the preview and a useful recovery action.
 const page=await browser.newPage();
 await page.route('**/explore.mjs',r=>r.fulfill({contentType:'text/javascript',body:'throw Error("Simulated scene failure");'}));
 await page.goto(base+'/explore.html?handoff=1');
 await page.waitForFunction(()=>document.querySelector('#introTransition [role="status"]')?.textContent.includes('could not load'));
 assert(await page.locator('#introTransition a').isVisible());await page.close();
 await writeFile(new URL('validation.json',out),JSON.stringify({results,loadFailureRecovery:true},null,2)+'\n');
}finally{await browser?.close();server.kill();}
