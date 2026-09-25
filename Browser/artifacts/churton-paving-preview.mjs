import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const stage=process.argv[2]??'before';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(resolve=>server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:760}}),errors=[];
 page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__check={exterior,renderer,controls};function frame(){')});});
 const mode=stage==='compiled'?'compiled':'source';
 await page.goto(base+'/aerial.html?view=churton&period=1912&models='+mode,{timeout:120000});
 await page.waitForFunction(()=>window.__check?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__check.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.evaluate(()=>{
  const {exterior,controls}=window.__check;
  exterior.scene.fog.density=0;exterior.trees.visible=false;
  exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.invalidateShadows();
  exterior.camera.position.set(-100,40,-87);exterior.camera.lookAt(-60,0,-68);
  controls.sync([-60,0,-68]);
  document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');
 });
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:new URL('churton-paving-'+stage+'.jpg',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),quality:90});
 assert.deepEqual(errors,[]);console.log('PASS: '+stage+' Churton paving preview has no browser errors.');
}finally{await browser?.close();server.kill();}
