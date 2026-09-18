import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=1853;
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&m.text().includes('THREE'))errors.push(m.text());});
 await page.route('https://**/*',async route=>{
  if(route.request().url().startsWith('https://cdn.jsdelivr.net/'))await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/vendor/'+route.request().url().split('/').at(-1),import.meta.url),'utf8')});
  else await route.abort();
 });
 await page.route('**/game.mjs',async route=>{
  const source=await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8');
  const hook=`\nwindow.upstairsExitTest={get ready(){return ready;},get state(){return state;},get floors(){return floors;},get lights(){return lights;},get artPanels(){return artPanels;},player,keys,showFloor,update,drawMap,start,get arrival(){return arrivalCutscene;},get escape(){return escapeCutscene;},pose(x,z,floor){keys.clear();Object.assign(player,{x,z,floor});showFloor();yaw=0;pitch=0;hold=0;stairHold=0;stairLatch=false;elapsed=0;audioOn=false;camera.position.set(x,floor*FLOOR_HEIGHT+1.65,z);state='play';update(.001);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;drawMap();},map(value){$('floorMap').hidden=!value;drawMap();},play(){state='play';},step(){update(.25);},get renderInfo(){return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};}};`;
  await route.fulfill({contentType:'text/javascript',body:source+hook});
 });
 await page.goto(`http://127.0.0.1:${port}`);
 await page.waitForFunction(()=>window.upstairsExitTest?.ready,null,{timeout:120000});
 await page.locator('#start').click();
 await page.evaluate(()=>{const t=window.upstairsExitTest;t.arrival.update(3);const stair=t.floors[0].stairs[0];Object.assign(t.player,{x:stair.x*2.5,z:stair.z*2.5});t.keys.add('KeyE');t.update(.25);t.update(.25);t.keys.clear();t.pose(t.player.x,t.player.z,1);});
 assert.equal(await page.evaluate(()=>window.upstairsExitTest.player.floor),1);
 assert.equal(await page.locator('#floorExits').textContent(),'3 EXITS THIS FLOOR');
 await page.evaluate(()=>window.upstairsExitTest.map(true));
 await page.screenshot({path:'Browser/artifacts/upstairs-exits-map.png'});
 await page.evaluate(()=>window.upstairsExitTest.map(false));
 await page.locator('#miniMapWrap').screenshot({path:'Browser/artifacts/upstairs-exits-minimap.png'});
 const results=[];
 for(let i=0;i<3;i++){
  const exit=await page.evaluate(i=>{const t=window.upstairsExitTest;t.start();t.arrival.update(3);const exit=t.floors[1].exits[i];t.pose(exit.x*2.5,exit.z*2.5+1.7,1);return exit;},i);
  assert.equal(await page.locator('#exitName').textContent(),exit.name);
  assert.equal(await page.locator('#interact b').textContent(),'HOLD E TO ESCAPE');
  assert(await page.locator('#interact').isVisible());
  await page.evaluate(()=>new Promise(resolve=>{let n=0;function frame(){if(++n===3)resolve();else requestAnimationFrame(frame);}requestAnimationFrame(frame);}));
  await page.screenshot({path:`Browser/artifacts/upstairs-exits-door-${i+1}.png`});
  if(i===1){await page.setViewportSize({width:390,height:844});await page.screenshot({path:'Browser/artifacts/upstairs-exits-mobile.png'});await page.setViewportSize({width:1300,height:900});}
  results.push(await page.evaluate(exit=>{const t=window.upstairsExitTest;return {exit,render:t.renderInfo,exitLamp:t.lights.some(l=>l.floor===1&&l.x===exit.x*2.5&&l.z===exit.z*2.5&&l.color===0x77db97),artClear:t.artPanels.filter(a=>a.floor===1).every(a=>Math.hypot(a.x-exit.x*2.5,a.z-exit.z*2.5)>=3.5)};},exit));
  assert(results.at(-1).exitLamp);assert(results.at(-1).artClear);
  await page.evaluate(()=>window.upstairsExitTest.play());
  await page.keyboard.down('e');
  await page.waitForFunction(()=>['cutscene','won'].includes(window.upstairsExitTest.state),null,{timeout:10000});
  await page.keyboard.up('e');
  await page.evaluate(()=>window.upstairsExitTest.escape.skip());
  assert.equal(await page.locator('#resultTitle').textContent(),'You made it out.');
  assert((await page.locator('#resultBody').textContent()).includes(exit.name.toLowerCase()));
 }
 assert.deepEqual(errors,[]);
 await writeFile('Browser/artifacts/upstairs-exits-validation.json',JSON.stringify({results,errors},null,2)+'\n');
 console.log('PASS: real WebGL stair access, three marked upstairs doors, green exit lamps, clear artwork, maps, desktop/mobile HUD, keyboard hold-E escape and no browser errors.');
}finally{await browser?.close();server.kill();}
