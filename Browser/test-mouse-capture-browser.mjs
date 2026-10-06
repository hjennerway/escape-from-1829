import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const artifacts=new URL('./artifacts/mouse-capture/',import.meta.url);
await mkdir(artifacts,{recursive:true});
const {server,base}=await startTestServer();
const source=await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8');
const instrument=`
window.mouseTest={get ready(){return ready;},get state(){return state;},get pending(){return mouseCapture.pending;},get arrival(){return arrivalCutscene;},get yaw(){return yaw;},caught,protect(){enemyReleaseAt=Infinity;},
snapshot(){return {player:{...player},elapsed,enemies:enemies.map(e=>({x:e.x,z:e.z,floor:e.floor})),captures:escapeProgress?.run.captures};}};
window.captureProbe={mode:'normal',until:0,attempts:0};
window.captureEvents=[];
for(const type of ['keydown','keyup','pointerlockchange','pointerlockerror'])document.addEventListener(type,e=>{
 window.captureEvents.push({type,code:e.code,state,locked:!!document.pointerLockElement,pending:mouseCapture.pending,active:navigator.userActivation.isActive,time:performance.now()});
});
enemyReleaseAt=Infinity;
const nativeRequest=canvas.requestPointerLock.bind(canvas);
canvas.requestPointerLock=()=>{
 const probe=window.captureProbe;probe.attempts++;
 // Browser automation sends Escape to the page rather than Chrome's native
 // unlock UI. Inject its 1.25s denial window, then use real pointer capture.
 if(probe.mode==='denied'||probe.mode==='cooldown'&&performance.now()<probe.until){
  document.dispatchEvent(new Event('pointerlockerror'));
  return Promise.reject(new DOMException('Escape cooldown or missing engagement','NotAllowedError'));
 }
 if(probe.mode==='security')return Promise.reject(new DOMException('Blocked capture','SecurityError'));
 const result=nativeRequest();
 result?.catch(error=>window.captureEvents.push({type:'nativeError',name:error.name,message:error.message,time:performance.now()}));
 if(probe.mode==='legacy'){result?.catch(()=>{});return;}
 return result;
};
`;
let browser,page;
const results=[];
try{
 browser=await launchHardwareBrowser();
 page=await browser.newPage({viewport:{width:1280,height:820}});
 page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',r=>r.fulfill({contentType:'text/javascript',body:source+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.mouseTest?.ready,null,{timeout:120000});
 await page.locator('#start').click();await page.evaluate(()=>{window.mouseTest.arrival.update(3);window.mouseTest.protect();});
 const playing=()=>page.waitForFunction(()=>window.mouseTest.state==='play'&&document.pointerLockElement===document.getElementById('game'));
 const paused=()=>page.waitForFunction(()=>window.mouseTest.state==='paused'&&!document.pointerLockElement);
 const snapshot=()=>page.evaluate(()=>window.mouseTest.snapshot());
 const mode=value=>page.evaluate(value=>{Object.assign(window.captureProbe,{mode:value,until:performance.now()+1250,attempts:0});},value);
 const screenshot=name=>page.screenshot({path:fileURLToPath(new URL(name+'.png',artifacts))});
 await playing();
 // Actual mouse movements after repeated Escape/click/P/Escape resume cycles.
 for(const action of ['click','Escape','p','click','Escape','p']){
  await page.keyboard.press('Escape');await paused();const before=await snapshot();
  if(action==='click')await page.locator('#resume').click();else await page.keyboard.press(action);
  await page.waitForFunction(()=>document.pointerLockElement||!window.mouseTest.pending&&document.getElementById('resultBody').textContent.includes('capture the mouse'));
  const freshClick=!await page.evaluate(()=>!!document.pointerLockElement);
  if(freshClick){assert.deepEqual(await snapshot(),before);await page.locator('#resume').click();}
  await playing();
  assert.deepEqual((await snapshot()).player,before.player);assert.equal((await snapshot()).captures,before.captures);
  const yaw=await page.evaluate(()=>window.mouseTest.yaw);
  await page.mouse.move(610,400);await page.mouse.move(650,430);
  await page.waitForFunction(yaw=>window.mouseTest.yaw!==yaw,yaw);
  results.push({action,captured:true,mouseLook:true,freshClick});
  console.log('PASS: Escape pause and '+action+' resume recaptures mouse look.');
 }
 await page.keyboard.press('Escape');await paused();
 await mode('cooldown');const frozen=await snapshot();
 await page.locator('#resume').click();
 await page.waitForFunction(()=>window.mouseTest.pending);
 await page.keyboard.down('w');await page.waitForTimeout(300);await page.keyboard.up('w');
 assert.deepEqual(await snapshot(),frozen,'Resume must freeze the entire run during denied capture');
 await page.evaluate(()=>document.dispatchEvent(new Event('pointerlockchange')));
 await playing();assert(await page.evaluate(()=>window.captureProbe.attempts>1));
 results.push({cooldown:true,frozen:true,staleUnlock:true});
 // Persistent denial leaves a visible pause screen and a useful fresh-click path.
 await page.keyboard.press('Escape');await paused();await mode('denied');const deniedSnapshot=await snapshot();
 await page.locator('#resume').click();
 await page.waitForFunction(()=>!window.mouseTest.pending&&document.getElementById('resultBody').textContent.includes('capture the mouse'));
 assert.equal(await page.evaluate(()=>window.mouseTest.state),'paused');assert.deepEqual(await snapshot(),deniedSnapshot);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'resume');await screenshot('blocked-resume');
 await mode('normal');await page.locator('#resume').click();await playing();
 results.push({persistentDenial:true,paused:true,freshClick:true});
 // Escape cancels a pending retry; backgrounding also stops reacquisition.
 for(const cancel of ['Escape','blur','hidden']){
  await page.keyboard.press('Escape');await paused();await mode('denied');const before=await snapshot();
  await page.locator('#resume').click();await page.waitForFunction(()=>window.mouseTest.pending);
  if(cancel==='Escape')await page.keyboard.press('Escape');
  else await page.evaluate(kind=>{
   if(kind==='blur')window.dispatchEvent(new Event('blur'));
   else{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;}
  },cancel);
  await page.waitForFunction(()=>!window.mouseTest.pending);
  const attempts=await page.evaluate(()=>window.captureProbe.attempts);await mode('normal');await page.waitForTimeout(1500);
  assert.deepEqual(await snapshot(),before);assert(!await page.evaluate(()=>!!document.pointerLockElement));
  // Changing the probe resets its count: no cancelled retry should run afterward.
  assert.equal(await page.evaluate(()=>window.captureProbe.attempts),0);assert(attempts>0);
  await page.locator('#resume').click();await playing();results.push({cancel,stopped:true});
 }
 // Help, notebook and capture recovery share the same confirmed resume path.
 for(const dialog of ['help','notebook','captured']){
  if(dialog==='help')await page.keyboard.press('h');
  else if(dialog==='notebook')await page.keyboard.press('n');
  else await page.evaluate(()=>window.mouseTest.caught('Security'));
  await page.waitForFunction(()=>!document.pointerLockElement);
  const before=await snapshot();await mode('cooldown');
  if(dialog==='captured')await page.locator('#resume').click();else await page.keyboard.press('Escape');
  await page.waitForFunction(()=>window.mouseTest.pending);await page.waitForTimeout(250);
  assert.deepEqual(await snapshot(),before);await playing();
  results.push({dialog,confirmedResume:true,frozen:true});
 }
 await page.keyboard.press('Escape');await paused();await mode('legacy');await page.locator('#resume').click();await playing();
 await page.keyboard.press('Escape');await paused();await mode('security');await page.locator('#resume').click();
 await page.waitForFunction(()=>document.getElementById('resultBody').textContent.includes('capture the mouse'));
 assert.equal(await page.evaluate(()=>window.captureProbe.attempts),1);
 await mode('normal');await page.locator('#resume').click();await playing();await screenshot('resumed');
 assert.deepEqual(errors,[]);await page.close();
 // Touch resumes without pointer capture, using the existing look/move controls.
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.setDefaultTimeout(120000);mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.route('https://**/*',r=>r.abort());
 await mobile.route('**/game.mjs',r=>r.fulfill({contentType:'text/javascript',body:source+instrument}));
 await mobile.goto(base+'/?seed=1829');await mobile.waitForFunction(()=>window.mouseTest?.ready);
 await mobile.locator('#start').tap();await mobile.evaluate(()=>window.mouseTest.arrival.update(3));
 await mobile.locator('#pause').tap();await mobile.locator('#resume').tap();
 assert.equal(await mobile.evaluate(()=>window.mouseTest.state),'play');assert.equal(await mobile.evaluate(()=>window.captureProbe.attempts),0);
 assert(await mobile.locator('#touch').isVisible());assert.deepEqual(errors,[]);await mobile.close();
 await writeFile(new URL('validation.json',artifacts),JSON.stringify({results,mobile:true,errors},null,2)+'\n');
 console.log('PASS: actual GPU game Escape/click/key resume and mouse look; injected cooldown/denial freezes, cancellation, help/notebook/capture recovery, legacy API and touch resume; no page/shader errors.');
}catch(error){
 if(page&&!page.isClosed()){
  console.error(await page.evaluate(()=>({state:window.mouseTest?.state,pending:window.mouseTest?.pending,locked:!!document.pointerLockElement,probe:window.captureProbe,body:document.getElementById('resultBody').textContent,events:window.captureEvents?.slice(-24)})));
  await page.screenshot({path:fileURLToPath(new URL('failure.png',artifacts))});
 }
 throw error;
}finally{await browser?.close();server.kill();}
