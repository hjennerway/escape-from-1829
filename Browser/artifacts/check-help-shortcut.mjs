import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('https://cdn.jsdelivr.net/**',async route=>{
  const file=route.request().url().split('/').at(-1);
  await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/vendor/'+file,import.meta.url),'utf8')});
 });
 await page.route('https://www.whateversleft.co.uk/**',route=>route.abort());
 await page.route('**/game.mjs',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:await response.text()+`\nwindow.helpTest={get ready(){return ready;},get state(){return state;},get elapsed(){return elapsed;},get enemies(){return enemies.map(e=>({x:e.x,z:e.z,floor:e.floor}));},player,keys,update,get arrival(){return arrivalCutscene;}};`});
 });
 await page.goto(base);
 await page.waitForFunction(()=>window.helpTest?.ready,null,{timeout:120000});
 assert.equal(await page.locator('#help').count(),0);
 await page.keyboard.press('h');assert.equal(await page.locator('#instructions').isVisible(),false);
 await page.screenshot({path:fileURLToPath(new URL('help-intro-desktop.png',import.meta.url))});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:fileURLToPath(new URL('help-intro-mobile.png',import.meta.url))});
 await page.setViewportSize({width:1300,height:900});
 await page.locator('#start').click();
 await page.evaluate(()=>window.helpTest.arrival.update(3));
 await page.keyboard.press('h');
 await page.waitForFunction(()=>window.helpTest.state==='paused');
 assert(await page.locator('#instructions').isVisible());
 assert.equal(await page.locator('#result').isVisible(),false);
 assert.equal(await page.evaluate(()=>document.pointerLockElement),null);
 const frozen=await page.evaluate(()=>{const t=window.helpTest;return {player:{...t.player},elapsed:t.elapsed,enemies:t.enemies};});
 await page.keyboard.press('w');
 await page.evaluate(()=>window.helpTest.update(2));
 assert.deepEqual(await page.evaluate(()=>{const t=window.helpTest;return {player:{...t.player},elapsed:t.elapsed,enemies:t.enemies};}),frozen);
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'sensitivity');
 await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#sensitivity').inputValue(),'1.3');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'audio');
 await page.keyboard.press('Space');assert.equal(await page.locator('#audio').isChecked(),false);
 await page.screenshot({path:fileURLToPath(new URL('help-dialog-desktop.png',import.meta.url))});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:fileURLToPath(new URL('help-dialog-mobile.png',import.meta.url))});
 await page.setViewportSize({width:1300,height:900});
 for(const close of [()=>page.locator('#helpPlay').click(),()=>page.keyboard.press('h'),()=>page.keyboard.press('Escape'),()=>page.locator('#closeHelp').click()]){
  assert(await page.locator('#instructions').isVisible());
  await close();
  assert.equal(await page.locator('#instructions').isVisible(),false);
  assert.equal(await page.evaluate(()=>window.helpTest.state),'play');
  assert.deepEqual(await page.evaluate(()=>({...window.helpTest.player})),frozen.player);
  await page.keyboard.press('h');
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: intro has no help link; H pauses the real game; player, enemies and timer freeze; settings work by keyboard; Resume/H/Escape/close preserve the run; desktop/mobile screenshots; no page errors.');
}finally{await browser?.close();server.kill();}
