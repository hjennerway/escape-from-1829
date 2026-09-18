import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1174,height:717}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__passage={exterior,renderer,controls};function frame(){')});});
 for(const mode of ['source','compiled']){
  await page.goto(base+'/aerial.html?period=1849&models='+mode);
  await page.waitForFunction(()=>window.__passage?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__passage.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  await page.evaluate(()=>{const {exterior,controls}=window.__passage;exterior.scene.fog.density=0;exterior.camera.position.set(111,53,82);exterior.camera.lookAt(63,5,9);exterior.camera.fov=42;exterior.camera.updateProjectionMatrix();controls.sync([63,5,9]);});
  for(const year of [1849,1870]){
   await page.evaluate(year=>window.__passage.exterior.timeline.setPeriod(year),year);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   assert.equal(await page.evaluate(()=>window.__passage.exterior.model.getObjectByName('1829 Redesmere passage head').visible),year>=1870);
   await page.screenshot({path:fileURLToPath(new URL('passage-'+mode+'-'+year+'.png',import.meta.url))});
  }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: passage appears in 1870 in source and compiled close views; no browser errors.');
}finally{await browser?.close();server.kill();}
