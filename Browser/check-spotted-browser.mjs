// WebGL warning review: node Browser/check-spotted-browser.mjs
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const artifacts=new URL('./artifacts/',import.meta.url);await mkdir(artifacts,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','inherit']});
let browser;
try{
 const address=await new Promise((resolve,reject)=>{server.stdout.on('data',chunk=>{const match=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);if(match)resolve(match[0]);});server.once('error',reject);server.once('exit',code=>reject(Error('Server exited: '+code)));});
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&m.text().includes('THREE'))errors.push(m.text());});
 await page.route('https://**/*',async route=>{
  if(route.request().url().startsWith('https://cdn.jsdelivr.net/'))await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('./dist/vendor/'+route.request().url().split('/').at(-1),import.meta.url),'utf8')});
  else await route.abort();
 });
 await page.route('**/game.mjs',async route=>{
  const source=await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8');
  await route.fulfill({contentType:'text/javascript',body:source+`\nwindow.guardReview={get enemies(){return enemies;},get ready(){return ready;},get state(){return state;},get guard(){return enemies.find(e=>e.type===1);},get rig(){return this.guard.mesh.userData.guardRig;},get renderer(){return renderer;},get scene(){return scene;},get camera(){return camera;},get arrival(){return arrivalCutscene;},start,player,keys,update,resetPositions,
   pose(floor=0,turn=0){state='paused';keys.clear();audioOn=false;Object.assign(player,{x:70,z:33.0,floor});showFloor();Object.assign(this.guard,{x:70,z:30,floor});this.guard.mesh.position.set(70,floor*FLOOR_HEIGHT,30);this.guard.mesh.rotation.y=turn;this.guard.mesh.visible=true;enemies.find(e=>e.type===2).mesh.visible=false;camera.position.set(70.3,floor*FLOOR_HEIGHT+1.35,33.0);camera.lookAt(70,floor*FLOOR_HEIGHT+1.02,30);torch.visible=true;$('hud').hidden=true;$('result').hidden=true;$('arrivalFade').hidden=true;},
   step(distance,dt){updateSecurityGuard(this.guard.mesh,distance,dt);},reset(){resetSecurityGuard(this.guard.mesh);},
   play(){state='play';elapsed=6;},pause(){state='paused';},render(){renderer.render(scene,camera);return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};}};`});
 });
 await page.goto(address);
 await page.waitForFunction(()=>window.guardReview?.ready,null,{timeout:120000});
 await page.locator('#start').click();
 await page.evaluate(()=>{const t=window.guardReview;t.arrival.update(3);t.pose();});
 await page.waitForTimeout(200);
 await page.evaluate(()=>{const t=window.guardReview;t.pose();Object.assign(t.player,{x:70,z:38,floor:0});for(const e of t.enemies)Object.assign(e,{x:140,z:100,floor:0,path:[],rethink:10});Object.assign(t.guard,{x:70,z:33});t.play();t.update(0);t.pause();document.getElementById('hud').hidden=false;});
 assert.equal(await page.locator('#warning').textContent(),"You've been spotted");
 await page.screenshot({path:fileURLToPath(new URL('spotted-desktop.png',artifacts))});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:fileURLToPath(new URL('spotted-mobile.png',artifacts))});
 await page.evaluate(()=>{const t=window.guardReview;t.keys.add('KeyE');for(const e of t.enemies)Object.assign(e,{x:140,z:100});t.play();t.update(0);t.pause();});
 assert.equal(await page.locator('#warning').textContent(),'');
 assert.deepEqual(errors,[]);
 console.log('PASS: spotted warning visible on desktop/mobile and clears after separation; no browser errors.');
}finally{await browser?.close();server.kill();}
