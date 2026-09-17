import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=1844,server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 await page.route('https://cdn.jsdelivr.net/**',async route=>{
  const file=route.request().url().split('/').at(-1);
  await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/vendor/'+file,import.meta.url),'utf8')});
 });
 await page.route('https://www.whateversleft.co.uk/**',route=>route.abort());
 await page.route('**/game.mjs',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:await response.text()+`\nwindow.escapeTest={get ready(){return ready;},get state(){return state;},player,keys,get floors(){return floors;},showFloor,drawMap,finish,update,resetPositions,get arrival(){return arrivalCutscene;},get camera(){return camera;},get renderer(){return renderer;},get scene(){return scene;}};`});
 });
 await page.goto(`http://127.0.0.1:${port}`);
 await page.waitForFunction(()=>window.escapeTest?.ready,{},{timeout:90000});
 await page.locator('#start').click();
 await page.evaluate(()=>{const t=window.escapeTest;t.arrival.update(3);t.keys.add('KeyE');});
 await page.keyboard.press('m');
 await page.screenshot({path:'Browser/artifacts/escape-layout-ground-map.png'});
 await page.keyboard.press('m');
 await page.screenshot({path:'Browser/artifacts/escape-layout-reception.png'});
 // Exercise an actual stair interaction in WebGL, retaining the held-key latch.
 await page.evaluate(()=>{const t=window.escapeTest,s=t.floors[0].stairs[0];Object.assign(t.player,{x:s.x*2.5,z:s.z*2.5});t.keys.delete('KeyE');t.update(.01);t.keys.add('KeyE');for(let i=0;i<22;i++)t.update(.04);});
 assert.equal(await page.evaluate(()=>window.escapeTest.player.floor),1);
 await page.keyboard.press('m');
 await page.screenshot({path:'Browser/artifacts/escape-layout-upper-map.png'});
 await page.keyboard.press('m');
 await page.evaluate(()=>window.escapeTest.finish(false,'Security'));
 assert.equal(await page.locator('#resultTitle').textContent(),'Locked in the basement');
 await page.screenshot({path:'Browser/artifacts/escape-layout-captured.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: real WebGL reception, both floor maps, stair transfer and basement defeat message; no page errors.');
}finally{await browser.close();server.kill();}
