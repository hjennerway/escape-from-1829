import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
let browser;
try {
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1449,height:650}});
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__check={exterior,controls,renderer};function frame(){')});});
 await page.goto(base+'/aerial.html?models=source',{timeout:120000});
 await page.waitForFunction(()=>window.__check?.renderer.info.render.frame>3,null,{timeout:120000});
 await page.evaluate(()=>{const {exterior:e,controls}=window.__check;e.scene.fog.density=0;e.camera.position.set(42,65,109);e.camera.lookAt(24,0,36);controls.sync([24,0,36]);document.querySelectorAll('body > :not(canvas):not(script)').forEach(el=>el.style.display='none');});
 await page.waitForTimeout(600);
 await page.screenshot({path:'artifacts/red-circled-removed.png'});
} finally {await browser?.close();server.kill();}
