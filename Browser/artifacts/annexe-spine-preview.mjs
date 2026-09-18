import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const phase=process.argv[2]??'after',modes=phase==='source'?['source']:['source','compiled'];
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:820}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__spine={exterior,renderer,controls};function frame(){')});});
 for(const mode of modes){
  await page.goto(base+'/aerial.html?period=1916&models='+mode);
  await page.waitForFunction(()=>window.__spine?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__spine.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  await page.evaluate(async()=>{
   const {exterior,controls}=window.__spine,{annexePoint}=await import('/annexe.mjs');
   exterior.scene.fog.density=0;
   exterior.camera.position.set(...annexePoint(0,140,-110));
   const target=annexePoint(0,3,-5);exterior.camera.lookAt(...target);exterior.camera.fov=43;exterior.camera.updateProjectionMatrix();controls.sync(target);
  });
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL('annexe-spine-'+phase+'-'+mode+'.png',import.meta.url))});
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: Annexe spine browser views; no page errors.');
}finally{await browser?.close();server.kill();}
