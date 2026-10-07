import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/developer-doors/',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();
const source=await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8');
const instrument=`
window.doorTest={get ready(){return ready&&(interiorLoader?.complete??true)},get run(){return escapeProgress.run},get developer(){return developer},start,pause,caught,
begin(){start();arrivalCutscene.update(3);enemyReleaseAt=Infinity;pause()},
exits(){return floors.flatMap((f,floor)=>f.exits.map(e=>({id:e.id,floor})))},
tryExit({id,floor}){const exit=floors[floor].exits.find(e=>e.id===id);keys.clear();Object.assign(player,{...exit.inside,floor,y:floors[floor].elevation,stair:null,outside:false});showFloor();return {allowed:useDoor(exit),outside:player.outside}},
grilles(){const saved={...player};return escapeWorld.gates.map(g=>{indoorJump.reset();Object.assign(player,{x:g.x-g.dx*.5,z:g.z-g.dz*.5,y:g.y,floor:1,stair:null,outside:false});const from={...player};indoorJump.update(player,g.dx,g.dz,.04);const result={id:g.id,visible:g.leaf.visible,blocked:Math.hypot(player.x-from.x,player.z-from.z)<.1,lockedPrompt:!!escapeWorld.near(from)?.gate};indoorJump.reset();Object.assign(player,saved);return result})},
viewGate(){const g=escapeWorld.gates[0];keys.clear();state='play';enemyReleaseAt=Infinity;Object.assign(player,{x:g.x-g.dx*1.4,z:g.z-g.dz*1.4,y:g.y,floor:1,stair:null,outside:false});showFloor();yaw=Math.atan2(-g.dx,-g.dz);pitch=0;camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);document.getElementById('result').hidden=true;uiPlaying(true);update(0)},
snapshot(){return {unlocked:escapeProgress.run.doorsUnlocked,staff:escapeProgress.run.staffKey,service:escapeProgress.run.serviceKey,opened:[...escapeProgress.run.opened],boundary:escapeProgress.run.boundary,keys:[...escapeProgress.run.confiscated]}}
};`;
let browser;const results=[];
try{
 browser=await launchHardwareBrowser();
 for(const [width,height] of [[1200,800],[320,844]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text())});
  await page.route('https://**/*',r=>r.abort());
  await page.route('**/game.mjs',r=>r.fulfill({contentType:'text/javascript',body:source+instrument}));
  await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.doorTest?.ready);
  assert(await page.locator('#developerToggle').isHidden());assert(await page.locator('#developerDoorsToggle').isHidden());
  const exits=await page.evaluate(()=>doorTest.exits());assert(exits.length>2);
  assert((await page.evaluate(exits=>exits.map(e=>doorTest.tryExit(e)),exits)).every(r=>!r.allowed&&!r.outside),'All outside exits start locked or bolted');
  const locked=await page.evaluate(()=>doorTest.grilles());assert(locked.every(g=>g.visible&&g.blocked&&g.lockedPrompt));
  await page.keyboard.press('-');assert(await page.locator('#developerDoorsToggle').isVisible());
  assert.equal(await page.locator('#developerDoorsToggle').getAttribute('aria-pressed'),'false');
  // Selecting the option at the title applies to the first run as well.
  await page.keyboard.press('u');await page.evaluate(()=>doorTest.begin());
  assert.equal(await page.locator('#developerDoorsToggle').getAttribute('aria-pressed'),'true');
  await page.keyboard.down('u');await page.keyboard.press('u');assert.equal(await page.locator('#developerDoorsToggle').getAttribute('aria-pressed'),'false');await page.keyboard.up('u');
  await page.keyboard.press('u');assert.equal(await page.locator('#developerDoorsToggle').getAttribute('aria-pressed'),'true');
  assert((await page.evaluate(exits=>exits.map(e=>doorTest.tryExit(e)),exits)).every(r=>r.allowed&&r.outside),'Every ground and upper-floor exit bypasses its key or bolt');
  const unlocked=await page.evaluate(()=>doorTest.grilles());assert(unlocked.every(g=>!g.visible&&!g.blocked&&!g.lockedPrompt),'Both grilles physically allow passage without a key');
  await page.evaluate(()=>doorTest.viewGate());
  assert.equal(await page.locator('#objectiveTitle').innerText(),'Leave through any outside door');
  for(const id of ['developerToggle','developerMapToggle','developerDoorsToggle']){
   const b=await page.locator('#'+id).boundingBox();assert(b&&b.x>=0&&b.x+b.width<=width&&b.y>=0&&b.y+b.height<=height&&b.height>=44,id+' fits the viewport and has a usable touch target');
  }
  await page.screenshot({path:fileURLToPath(new URL('unlocked-'+width+'.png',destination))});
  const snapshot=await page.evaluate(()=>doorTest.snapshot());assert.deepEqual(snapshot,{unlocked:true,staff:false,service:false,opened:[],boundary:false,keys:[]});
  await page.evaluate(()=>doorTest.caught('Security'));assert((await page.evaluate(()=>doorTest.snapshot())).unlocked,'Capture retains the bypass');
  await page.locator('#developerDoorsToggle').click();assert.equal(await page.locator('#developerDoorsToggle').getAttribute('aria-pressed'),'false');
  assert((await page.evaluate(exits=>exits.map(e=>doorTest.tryExit(e)),exits)).every(r=>!r.allowed));
  assert((await page.evaluate(()=>doorTest.grilles())).every(g=>g.visible&&g.blocked&&g.lockedPrompt));
  await page.evaluate(()=>doorTest.viewGate());await page.screenshot({path:fileURLToPath(new URL('locked-'+width+'.png',destination))});
  await page.evaluate(()=>doorTest.pause());await page.locator('#developerDoorsToggle').click();
  await page.keyboard.press('-');assert(!(await page.evaluate(()=>doorTest.snapshot())).unlocked,'Disabling developer mode restores locks');
  await page.keyboard.press('-');await page.locator('#developerDoorsToggle').click();
  await page.evaluate(()=>doorTest.begin());assert(!(await page.evaluate(()=>doorTest.snapshot())).unlocked,'Restart resets the bypass and the button');
  assert.equal(await page.locator('#developerDoorsToggle').getAttribute('aria-pressed'),'false');
  assert.deepEqual(errors,[]);results.push({width,exits:exits.length,locked,unlocked,capture:true,restart:true,errors});
  console.log('PASS: '+width+'px Escape door toggle, all '+exits.length+' exits, physical grille passage, capture, toggle off, developer disable, restart and responsive controls.');
  await page.close();
 }
 await writeFile(new URL('validation.json',destination),JSON.stringify(results,null,2)+'\n');
}finally{await browser?.close();server.kill();}
