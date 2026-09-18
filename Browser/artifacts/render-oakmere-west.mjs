import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const phase=process.argv[2]??'after',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1459,height:820}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 if(phase==='before')await page.route('**/annexe.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('oakmere-west-before.mjs.txt',import.meta.url),'utf8')}));
 if(phase==='before')await page.route('**/annexe-os-refinement.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('oakmere-os-before.mjs.txt',import.meta.url),'utf8')}));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__west={exterior,renderer,controls};function frame(){')});});
 await page.goto(base+'/aerial.html?period=1916&models='+mode+'&view=oakmere-lawn');
 await page.waitForFunction(()=>window.__west?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__west.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [name,position,target,fov] of [
  ['context',[-138,66,-103],[-24,5,-46],51],
  ['photo',[-101,2.2,-65],[-31,6,-51],49],
  ['front',[0,1.8,120],[0,9,14],48]
 ]){
  await page.evaluate(async({position,target,fov})=>{
   const {annexePoint}=await import('/annexe.mjs'),{exterior:e,controls}=window.__west;
   e.scene.fog.density=0;e.camera.position.set(...annexePoint(...position));
   const t=annexePoint(...target);e.camera.lookAt(...t);e.camera.fov=fov;e.camera.updateProjectionMatrix();controls.sync(t);
  },{position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(`oakmere-west-${phase}-${mode}-${name}.png`,import.meta.url))});
 }
 assert.deepEqual(errors,[]);console.log('PASS: Oakmere west '+phase+' '+mode+' visual views; no browser errors.');
}finally{await browser?.close();server.kill();}
