import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(resolve=>server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:760}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__check={exterior,renderer,controls};function frame(){')});});
 for(const mode of (process.env.GHOST_BEFORE?['source']:['source','compiled'])){
 await page.goto(base+'/aerial.html?period=1896&models='+mode,{timeout:120000});
 await page.waitForFunction(()=>window.__check?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__check.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 for(const [name,position,target] of [
 ['front',[-70,30,83],[-35,0,44]],
 ['parsons',[-98,45,-28],[-56,0,-7]],
 ['redesmere',[18,36,-72],[51,0,-37]]
 ]){
 await page.evaluate(({position,target})=>{const {exterior,controls}=window.__check;exterior.scene.fog.density=0;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);controls.sync(target);},{position,target});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:new URL('ghost-lawn-'+name+'-'+mode+'.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
 }
 }
 assert.deepEqual(errors,[]);console.log('PASS: lawn views captured without browser errors.');
}finally{await browser?.close();server.kill();}
