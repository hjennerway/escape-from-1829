import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__frontage={exterior,renderer,controls};function frame(){')});});
 for(const mode of ['source','compiled']){
  await page.goto(base+'/aerial.html?period=1829&models='+mode);
  await page.waitForFunction(()=>window.__frontage?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__frontage.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  await page.evaluate(()=>{const {exterior,controls}=window.__frontage;exterior.scene.fog.density=0;exterior.camera.position.set(8,59,102);exterior.camera.lookAt(0,6,15);exterior.camera.fov=43;exterior.camera.updateProjectionMatrix();controls.sync([0,6,15]);});
  for(const year of [1829,1849,2021]){
   await page.evaluate(year=>window.__frontage.exterior.timeline.setPeriod(year),year);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:fileURLToPath(new URL('entrance-projections-'+mode+'-'+year+'.png',import.meta.url))});
  }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: entrance projection close views in source and compiled modes at 1829, 1849 and 2021; no browser errors.');
}finally{await browser?.close();server.kill();}
