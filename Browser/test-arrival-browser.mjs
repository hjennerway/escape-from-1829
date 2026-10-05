import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const root=new URL('../',import.meta.url),artifacts=new URL('./artifacts/arrival-animation/',import.meta.url);
await mkdir(artifacts,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:root,windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const source=await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8');
const results=[];
let browser;
try{
 browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 for(const [width,height,reducedMotion] of [[1100,750,'no-preference'],[390,844,'reduce']]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion,isMobile:width<500,hasTouch:width<500});
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',route=>route.abort());
  // Observe the real frame loop. Holding a checkpoint only allows a stable
  // screenshot; the normal camera samples and production frame limit remain.
  await page.route('**/game.mjs',route=>route.fulfill({contentType:'text/javascript',body:source
   .replace('arrivalCutscene.update(Math.min(frameDt,.25));', 'if(!window.arrivalProbe?.hold)arrivalCutscene.update(Math.min(frameDt,.25));observeArrivalFrame(frameDt);')+`
window.arrivalProbe=null;
function observeArrivalFrame(frameDt){
 const p=window.arrivalProbe;if(!p||p.hold)return;
 const opacity=Number($('arrivalFade').style.opacity);
 p.frames.push({frameDt,state,inside:arrivalCutscene.inside,opacity,position:exterior.camera.position.toArray(),elapsed});
 if(p.stage==='start'||p.stage==='approach'&&!arrivalCutscene.inside&&opacity>=.5||p.stage==='blackout'&&arrivalCutscene.inside&&opacity===1||p.stage==='reveal'&&arrivalCutscene.inside&&opacity>0&&opacity<1)p.hold=true;
 if(state==='play'){p.completed=true;state='paused';}
}
window.arrivalTest={get ready(){return ready;},get camera(){return camera;},get enemies(){return enemies;},player,start,get state(){return state;},get elapsed(){return elapsed;},get floors(){return floors;}};
` }));
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.arrivalTest?.ready);
  const launches=width<500?['start']:['start','retry'];
  for(const launch of launches){
   const prepared=await page.evaluate(id=>{
    window.arrivalProbe={stage:'start',hold:false,frames:[],completed:false};
    const began=performance.now();document.getElementById(id).click();
    return {duration:performance.now()-began,player:{...window.arrivalTest.player},enemies:window.arrivalTest.enemies.map(e=>({x:e.x,z:e.z,floor:e.floor}))};
   },launch);
   const snapshots={};
   for(const stage of ['start','approach','blackout','reveal']){
    if(stage!=='start')await page.evaluate(stage=>Object.assign(window.arrivalProbe,{stage,hold:false}),stage);
    await page.waitForFunction(()=>window.arrivalProbe.hold);
    snapshots[stage]=await page.evaluate(()=>window.arrivalProbe.frames.at(-1));
    assert.equal(snapshots[stage].state,'arrival',stage+' must precede play');
    assert.equal(await page.locator('#hud').isHidden(),true);
    await page.screenshot({path:fileURLToPath(new URL(`${launch}-${width}-${stage}.png`,artifacts))});
   }
   assert.equal(snapshots.start.inside,false,'Preparation must not skip the establishing view');
   assert.equal(snapshots.start.opacity,0);assert(snapshots.start.position[1]>100);
   assert.equal(snapshots.approach.inside,false);assert(snapshots.approach.opacity>=.5&&snapshots.approach.opacity<1);
   if(reducedMotion==='reduce')assert.deepEqual(snapshots.approach.position,snapshots.start.position);
   else assert(snapshots.approach.position[1]<snapshots.start.position[1]&&snapshots.approach.position[2]<snapshots.start.position[2],'Camera visibly travels toward the entrance');
   assert.equal(snapshots.blackout.opacity,1);assert.equal(snapshots.blackout.inside,true);
   assert.equal(snapshots.reveal.inside,true);assert(snapshots.reveal.opacity>0&&snapshots.reveal.opacity<1);
   await page.evaluate(()=>Object.assign(window.arrivalProbe,{stage:'complete',hold:false}));
   await page.waitForFunction(()=>window.arrivalProbe.completed);
   const complete=await page.evaluate(()=>({frames:window.arrivalProbe.frames,elapsed:window.arrivalTest.elapsed,player:{...window.arrivalTest.player},camera:window.arrivalTest.camera.position.toArray(),enemies:window.arrivalTest.enemies.map(e=>({x:e.x,z:e.z,floor:e.floor}))}));
   assert(complete.frames.every(f=>f.elapsed===0),'Arrival preserves the full head start');
   assert.equal(complete.elapsed,0);assert.deepEqual(complete.player,prepared.player);assert.deepEqual(complete.enemies,prepared.enemies);
   assert.deepEqual(complete.camera,[prepared.player.x,1.65,prepared.player.z]);
   assert(await page.locator('#arrivalFade').isHidden());assert(await page.locator('#hud').isVisible());
   await page.screenshot({path:fileURLToPath(new URL(`${launch}-${width}-inside.png`,artifacts))});
   results.push({width,height,reducedMotion,launch,preparationMs:prepared.duration,snapshots,frames:complete.frames,errors});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 await writeFile(new URL('validation.json',artifacts),JSON.stringify(results,null,2)+'\n');
 console.log('PASS: actual furnished-game launch/retry, exterior hold and visible approach, full-black Reception handoff and reveal, frozen player/NPCs/timer, mobile reduced motion, no page/shader errors.');
}finally{await browser?.close();server.kill();}
