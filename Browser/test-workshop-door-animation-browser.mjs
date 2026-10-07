import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL('./artifacts/workshop-door-animation/',import.meta.url);await mkdir(destination,{recursive:true});
const harness=await readFile(new URL('./test-escape-grounds-browser.mjs',import.meta.url),'utf8');
const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1]+`
window.doorTest={get context(){return audioCtx},get creak(){return doorCreak},mute(value){audioOn=!value;document.getElementById('audio').checked=!value;document.getElementById('audio').dispatchEvent(new Event('change'))},pause,openNotebook,closeNotebook};`;
const {server,base}=await startTestServer();let browser;const errors=[],results={};
async function shot(page,name){await page.evaluate(()=>groundsTest.render());await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
async function press(page){await page.keyboard.down('e');await page.evaluate(()=>groundsTest.step());await page.keyboard.up('e');await page.evaluate(()=>groundsTest.step());}
async function settle(page){await page.evaluate(()=>{for(let i=0;i<25;i++)groundsTest.step();});}
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{
  const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
  await r.fulfill({contentType:'text/javascript',body:source+instrument});
 });
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>groundsTest?.ready);
 await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});
 // Starting with a real gesture makes the game audio context audible.
 await page.keyboard.press('e');await page.evaluate(()=>doorTest.context.resume());await page.waitForFunction(()=>doorTest.context.state==='running');
 await page.evaluate(()=>{
  const ctx=doorTest.context,create=ctx.createBufferSource.bind(ctx);window.creakSources=[];
  ctx.createBufferSource=()=>{const source=create(),start=source.start.bind(source);source.start=(...args)=>{const samples=source.buffer.getChannelData(0);window.creakSources.push({duration:source.buffer.duration,rms:Math.sqrt(samples.reduce((s,v)=>s+v*v,0)/samples.length),peak:samples.reduce((m,v)=>Math.max(m,Math.abs(v)),0)});start(...args);};return source;};
 });
 results.renderer=await page.evaluate(()=>{const gl=groundsTest.renderer.getContext();return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);});
 const doors=await page.evaluate(()=>[{id:'tower-door',x:groundsTest.grounds.workshops.pivot.position.x,z:-44.75,side:1},...groundsTest.grounds.workshops.roomDoors.map(({id,x,z,side})=>({id,x,z,side}))]);
 results.doors=[];
 for(const d of doors){
  const name=d.id.replace(':','-');await page.evaluate(d=>groundsTest.pose(d.x-d.side,d.z,-d.side*Math.PI/2),d);
  assert.equal(await page.locator('#interact b').textContent(),'PRESS E TO OPEN');await shot(page,name+'-closed');
  const before=await page.evaluate(()=>creakSources.length);await press(page);
  const partial=await page.evaluate(id=>{const w=groundsTest.grounds.workshops;return (id==='tower-door'?w.pivot:w.roomDoors.find(d=>d.id===id).pivot).rotation.y;},d.id);
  assert(Math.abs(partial)>0&&Math.abs(partial)<.1,'First frame has not snapped open');
  await page.evaluate(()=>{for(let i=0;i<8;i++)groundsTest.step();});await shot(page,name+'-opening');
  await settle(page);assert.equal(await page.locator('#interact b').textContent(),'PRESS E TO CLOSE');await shot(page,name+'-open');
  await page.evaluate(d=>groundsTest.pose(d.x+d.side*1.35,d.z+.98,Math.atan2(d.side*1.35,.98)),d);
  assert.equal(await page.locator('#interact b').textContent(),'PRESS E TO CLOSE','Interaction remains reachable from inside');
  await press(page);await page.evaluate(()=>{for(let i=0;i<8;i++)groundsTest.step();});await shot(page,name+'-closing');await settle(page);
  assert.equal(await page.locator('#interact b').textContent(),'PRESS E TO OPEN');
  assert(!await page.evaluate(d=>groundsTest.walker.clear(d.x,d.z),d),'Closed doorway stops walking again');
  assert.equal(await page.evaluate(()=>creakSources.length),before+2,'Opening and closing each play a creak');
  // Hold E across the animation: it must perform only one action.
  await page.keyboard.down('e');await page.evaluate(()=>{for(let i=0;i<30;i++)groundsTest.step();});await page.keyboard.up('e');await page.evaluate(()=>groundsTest.step());
  assert.equal(await page.locator('#interact b').textContent(),'PRESS E TO CLOSE');
  results.doors.push({id:d.id,firstFrameAngle:partial});
 }
 // Reverse an unfinished swing, then freeze/resume it with the Notebook.
 const repair=doors.find(d=>d.id==='workshop-door:repair');await page.evaluate(d=>groundsTest.pose(d.x+1,d.z,Math.PI/2),repair);
 await press(page);await page.evaluate(()=>{for(let i=0;i<6;i++)groundsTest.step();});
 const angle=await page.evaluate(()=>groundsTest.grounds.workshops.roomDoors[0].pivot.rotation.y);
 await press(page);const reversed=await page.evaluate(()=>groundsTest.grounds.workshops.roomDoors[0].pivot.rotation.y);assert(Math.abs(reversed-angle)<.1);
 await page.evaluate(()=>doorTest.openNotebook());const frozen=await page.evaluate(()=>groundsTest.grounds.workshops.roomDoors[0].pivot.rotation.y);
 await page.evaluate(()=>groundsTest.step(5));assert.equal(await page.evaluate(()=>groundsTest.grounds.workshops.roomDoors[0].pivot.rotation.y),frozen);
 await page.evaluate(()=>{groundsTest.closeNotebook(false);groundsTest.resumeTouch();});await settle(page);
 // Muting affects audio while the door still operates.
 const heard=await page.evaluate(()=>creakSources.length);await page.evaluate(()=>doorTest.mute(true));await press(page);await settle(page);assert.equal(await page.evaluate(()=>creakSources.length),heard);await page.evaluate(()=>doorTest.mute(false));
 // Touch controls use the same close/open action.
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.exitPointerLock();document.body.classList.add('touch');groundsTest.resumeTouch();});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 const button=await page.locator('[data-key="KeyE"]').boundingBox();
 async function tap(){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2,id:1}]});await page.evaluate(()=>groundsTest.step());await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.evaluate(()=>groundsTest.step());await settle(page);}
 assert.equal(await page.locator('#interact b').textContent(),'PRESS E TO OPEN');await tap();assert.equal(await page.locator('#interact b').textContent(),'PRESS E TO CLOSE');await shot(page,'repair-open-phone');await tap();assert.equal(await page.locator('#interact b').textContent(),'PRESS E TO OPEN');await shot(page,'repair-closed-phone');
 await cdp.detach();
 // Capture keeps the current chosen state, including a deliberately closed room.
 await page.evaluate(()=>groundsTest.caught('Security'));
 assert.equal(await page.evaluate(()=>groundsTest.progress.run.workshopDoors['workshop-door:repair']),false);
 assert.equal(await page.evaluate(()=>groundsTest.grounds.workshops.roomDoors[0].pivot.rotation.y),0);
 assert.equal(await page.evaluate(()=>groundsTest.grounds.workshops.pivot.rotation.y),Math.PI/2);
 await page.evaluate(()=>groundsTest.begin());assert.equal(await page.evaluate(()=>groundsTest.grounds.workshops.pivot.rotation.y),0);
 assert(await page.evaluate(()=>groundsTest.grounds.workshops.roomDoors.every(d=>d.pivot.rotation.y===0)),'Restart closes all room doors');
 results.audio=await page.evaluate(()=>creakSources);assert(results.audio.length>=14);assert(results.audio.every(s=>s.duration>.94&&s.duration<.96&&s.rms>.05&&s.peak<1),'Real audio sources contain finite, audible, unclipped creaks');
 // Render both sound variants through Web Audio and verify silence when muted.
 results.renderedAudio=await page.evaluate(async()=>{
  const {createDoorCreakAudio}=await import('/door-creak-audio.mjs'),out=[];
  for(const [opening,enabled] of [[true,true],[false,true],[true,false]]){
   const ctx=new OfflineAudioContext(1,48000,48000),audio=createDoorCreakAudio({getContext:()=>new Proxy(ctx,{get:(o,k)=>k==='state'?'running':typeof o[k]==='function'?o[k].bind(o):o[k]}),enabled:()=>enabled});
   audio.play({id:'test',opening});const data=(await ctx.startRendering()).getChannelData(0);
   out.push({opening,enabled,rms:Math.sqrt(data.reduce((s,v)=>s+v*v,0)/data.length),tail:data.slice(46000).some(v=>v!==0)});
  }return out;
 });
 assert(results.renderedAudio[0].rms>.005&&results.renderedAudio[1].rms>.005);assert.equal(results.renderedAudio[2].rms,0);assert(results.renderedAudio.every(s=>!s.tail));
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({doors:results.doors,audioSources:results.audio.length,renderedAudio:results.renderedAudio,errors},null,2));
}finally{await browser?.close();server.kill();}
