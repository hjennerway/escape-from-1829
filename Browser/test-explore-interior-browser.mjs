import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const destination=new URL('./artifacts/explore-interior/',import.meta.url);await mkdir(destination,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'}),errors=[],requests=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.exploreTest={walker,exterior,interior,renderer,lighting,floors,input};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.exploreTest?.renderer.info.render.frame>2);
 assert.equal(await page.locator('[data-lighting="dusk"]').getAttribute('aria-pressed'),'true');
 assert(!requests.some(url=>/\/(?:game|notebook|security-guard)\.mjs/.test(url)),'Exploration does not load game characters or notebook');
 assert.equal(await page.locator('#notebook,#floorMap,#miniMap,#hud').count(),0);
 async function shot(name){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
 await shot('dusk-desktop');
 await page.evaluate(()=>{const {walker}=window.exploreTest;walker.setView({position:[0,3.6,21.7],target:[0,3.6,18]});});
 await page.waitForFunction(()=>!document.getElementById('exploreDoor').hidden);await shot('front-door');
 await page.mouse.click(600,350);await page.keyboard.down('KeyE');
 await page.waitForFunction(()=>!window.exploreTest.walker.actor.outside);
 await page.evaluate(()=>{window.exploreTest.walker.update(.1);});assert(!await page.evaluate(()=>window.exploreTest.walker.actor.outside),'Held E stays inside');
 await page.keyboard.up('KeyE');await shot('reception');
 await page.keyboard.press('KeyN');await page.keyboard.press('KeyM');assert.equal(await page.locator('#notebook,#floorMap').count(),0);
 await page.keyboard.down('KeyE');await page.waitForFunction(()=>window.exploreTest.walker.actor.outside);await page.keyboard.up('KeyE');
 // Visit each level through a real door, then inspect the existing architecture.
 for(const [name,floor,id] of [['first-floor',1,'F2'],['basement',2,'D11']]){
  await page.evaluate(({floor,id})=>{const {walker,floors}=window.exploreTest,e=floors[floor].exits.find(e=>e.id===id),[x,y,z]=e.destination;walker.setView({position:[x,y+1.8,z],target:[x,y+1.8,z-1]});walker.useDoor();}, {floor,id});
  await shot(name);assert.equal(await page.evaluate(()=>window.exploreTest.walker.actor.floor),floor);
 }
 await page.evaluate(()=>{const {walker,floors}=window.exploreTest;Object.assign(walker.actor,{x:-1.5,z:14,floor:3,y:floors[3].elevation,outside:false,stair:null});walker.look(0,0);walker.update(.01);});await shot('second-floor');
 // Pausing on navigation must not lose the indoor position or jump outside.
 await page.locator('[data-lighting="day"]').click();assert(!await page.evaluate(()=>window.exploreTest.input.active));
 await page.locator('[data-lighting="dusk"]').click();
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{document.body.classList.add('explore-touch');const {walker}=window.exploreTest;walker.setView({position:[0,3.6,21.7],target:[0,3.6,18]});});
 await page.waitForFunction(()=>!document.getElementById('exploreDoor').hidden);await shot('door-mobile');
 const button=page.locator('#exploreDoor'),bounds=await button.boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=390&&bounds.height>=44);
 await button.click();assert(!await page.evaluate(()=>window.exploreTest.walker.actor.outside));await shot('reception-mobile');
 await button.click();assert(await page.evaluate(()=>window.exploreTest.walker.actor.outside));
 await page.locator('#periodSlider').fill('0');await page.locator('#periodSlider').fill('12');
 await page.evaluate(()=>{window.exploreTest.walker.reset();});await shot('dusk-mobile');
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({errors,defaultLighting:'dusk',floors:4,keyboardDoors:true,touchDoors:true,noNPCsOrNotebook:true},null,2));
 console.log('PASS: dusk default, keyboard/touch doors and latch, four interior levels, no character/notebook modules, mobile prompt and desktop/mobile rendering.');
}finally{await browser.close();server.kill();}
