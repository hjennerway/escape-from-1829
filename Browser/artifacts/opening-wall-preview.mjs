import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:760}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__wall={exterior,renderer,controls};function frame(){')});});
 for(const mode of ['source','compiled']){
  await page.goto(base+'/aerial.html?period=1829&models='+mode);
  await page.waitForFunction(()=>window.__wall?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__wall.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  await page.evaluate(()=>{const {exterior,controls}=window.__wall;exterior.scene.fog.density=0;exterior.camera.position.set(79,40,63);exterior.camera.lookAt(31,7,10);exterior.camera.fov=35;exterior.camera.updateProjectionMatrix();controls.sync([31,7,10]);});
  for(const year of [1829,1849]){
   await page.evaluate(year=>window.__wall.exterior.timeline.setPeriod(year),year);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   assert.equal(await page.evaluate(()=>window.__wall.exterior.model.getObjectByName('1829 east end wall').visible),year===1829);
   await page.screenshot({path:fileURLToPath(new URL('opening-wall-'+mode+'-'+year+'.png',import.meta.url))});
  }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: opening wall close views; no browser errors.');
}finally{await browser?.close();server.kill();}
