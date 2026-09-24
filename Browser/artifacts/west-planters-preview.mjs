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
 for(const mode of (process.env.PLANTERS_BEFORE?['source']:['source','compiled'])){
 await page.goto(base+'/aerial.html?period=1896&models='+mode,{timeout:120000});
 await page.waitForFunction(()=>window.__check?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__check.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.evaluate(()=>{const {exterior,controls}=window.__check;exterior.scene.fog.density=0;exterior.camera.position.set(-145,68,12);exterior.camera.lookAt(-52,0,12);controls.sync([-52,0,12]);});
 await page.screenshot({path:new URL('west-planters-'+(process.env.PLANTERS_BEFORE?'before':mode)+'.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
 }
 assert.deepEqual(errors,[]);console.log('PASS: west garden views captured without browser errors.');
}finally{await browser?.close();server.kill();}
