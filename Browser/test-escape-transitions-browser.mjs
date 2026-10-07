import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const out=new URL('./artifacts/escape-transitions/verified/',import.meta.url);await mkdir(out,{recursive:true});
const {server,base}=await startTestServer();const results=[];let browser;
const source=await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8');
const instrument=`
window.transitionFrames=[];
window.transitionTest={get ready(){return ready;},get complete(){return interiorLoader.complete;},get state(){return state;},get renderer(){return renderer;},get outside(){return player.outside;},get time(){return elapsed;},get seed(){return floors[0].furnitureSeed;},get journal(){return notebook;},get torchOn(){return torch.intensity>0;},get indoorTorch(){return torch;},get outdoorTorch(){return exteriorTorch;},get indoorScene(){return scene;},get outdoorScene(){return exterior.scene;},
 poseDoor(){const exit=floors[0].exits.find(e=>e.id===escapeProgress.run.exitId);escapeProgress.run.serviceKey=true;Object.assign(player,{...exit.inside,y:0,floor:0,outside:false,stair:null});yaw=0;pitch=0;showFloor();enemyReleaseAt=Infinity;keys.clear();stairLatch=false;},
 install(){const original=renderer.render;renderer.render=(s,c)=>{const began=performance.now();original.call(renderer,s,c);if(renderer.getRenderTarget()===null)window.transitionFrames.push({ms:performance.now()-began,state,outside:!!player.outside,programs:renderer.info.programs.length});};}
};
const originalStart=start;start=()=>{const begin=performance.now();originalStart();window.startMilliseconds=performance.now()-begin;};$('start').onclick=start;$('retry').onclick=start;
`;
try{
 browser=await launchHardwareBrowser();
 for(const [width,height] of [[1100,750],[390,844]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true,isMobile:true});page.setDefaultTimeout(120000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',r=>r.abort());await page.route('**/game.mjs',r=>r.fulfill({contentType:'text/javascript',body:source+instrument}));
  await page.goto(base+'/?seed=1829',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.transitionTest?.ready);
  await page.evaluate(()=>transitionTest.install());
  await page.locator('#start').tap();const startMs=await page.evaluate(()=>window.startMilliseconds);
  assert(startMs<500,`First click blocks ${startMs} ms`);await page.waitForFunction(()=>transitionTest.state==='play');
  assert(await page.evaluate(()=>transitionFrames.some(f=>f.state==='arrival'&&!f.outside)),'Arrival renders before gameplay');
  await page.waitForFunction(()=>transitionTest.complete);
  const initialSeed=await page.evaluate(()=>transitionTest.seed),transitions=[];
  for(const torchOn of [true,false]){
   await page.evaluate(()=>transitionTest.poseDoor());if(!torchOn){if(width<500)await page.locator('#touchTorch').tap();else await page.keyboard.press('KeyF');assert.equal(await page.evaluate(()=>transitionTest.torchOn),false);}
   await page.waitForTimeout(150);
   for(const outside of [true,false,true,false]){
    const before=await page.evaluate(()=>{window.transitionFrames=[];return {programs:transitionTest.renderer.info.programs.length,at:performance.now()};});
    await page.keyboard.down('KeyE');await page.waitForFunction(outside=>transitionTest.outside===outside,outside,{timeout:10000});await page.keyboard.up('KeyE');
    await page.waitForFunction(()=>transitionFrames.length>=3);
    const frames=await page.evaluate(()=>transitionFrames.slice(0,3));
    assert(frames.every(f=>f.programs===before.programs),'Door and torch switches must reuse prepared shaders');
    // A driver can still defer a first draw in an unvisited wing. Protect
    // against the old multi-second stall as well as checking shader reuse.
    assert(Math.max(...frames.map(f=>f.ms))<750,'A doorway must not trigger a long synchronous graphics stall: '+JSON.stringify(frames));
    const lights=await page.evaluate(()=>({indoorParent:transitionTest.indoorTorch.parent===transitionTest.indoorScene,outdoorParent:transitionTest.outdoorTorch.parent===transitionTest.outdoorScene,outdoorIntensity:transitionTest.outdoorTorch.intensity}));
    assert(lights.indoorParent&&lights.outdoorParent,'Lights stay in their scenes');assert.equal(lights.outdoorIntensity,outside&&torchOn?20:0);
    transitions.push({outside,torchOn,frames});
    if(outside&&torchOn)await page.screenshot({path:fileURLToPath(new URL('outside-'+width+'.png',out))});
   }
  }
  await page.screenshot({path:fileURLToPath(new URL('inside-'+width+'.png',out))});
  await page.keyboard.press('KeyP');await page.locator('#retry').tap();const retryMs=await page.evaluate(()=>window.startMilliseconds);
  assert(retryMs<1800,`Replay blocks ${retryMs} ms`);await page.waitForFunction(()=>transitionTest.state==='play');
  assert.notEqual(await page.evaluate(()=>transitionTest.seed),initialSeed,'Replay rerolls furniture');
  assert(!await page.evaluate(()=>transitionTest.journal.entries.some(e=>e.id.startsWith('escape:'))),'Replay clears discovered escape clues');
  assert.deepEqual(errors,[]);results.push({width,height,startMs,retryMs,transitions,errors});console.log(JSON.stringify({width,startMs,retryMs,maxDoorDrawMs:Math.max(...transitions.flatMap(t=>t.frames.map(f=>f.ms)))}));await page.close();
 }
 await writeFile(new URL('validation.json',out),JSON.stringify(results,null,2)+'\n');
 console.log('PASS: responsive launch/replay, real doorway key input, repeated indoor/outdoor transitions with torch on/off, stable shader programs and lighting, fresh replay and desktop/portrait views.');
}finally{await browser?.close();server.kill();}
