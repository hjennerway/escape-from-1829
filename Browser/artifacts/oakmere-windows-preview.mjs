import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const phase=process.argv[2]??'after',modes=phase==='before'?['source']:['source','compiled'];
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 if(phase==='before')for(const [file,saved] of [['annexe-oakmere-detail.mjs','spine'],['annexe-oakmere-west.mjs','west']])
  await page.route('**/'+file,async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('oakmere-windows-'+saved+'-before.mjs.txt',import.meta.url),'utf8')}));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__windows={exterior,renderer,controls};function frame(){')});});
 for(const mode of modes){
  await page.goto(base+'/aerial.html?period=1916&models='+mode+'&buildingDetail=full');
  await page.waitForFunction(()=>window.__windows?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__windows.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
  for(const [name,position,target,fov] of [
   ['context',[-135,100,-60],[-22,4,-31],47],
   ['green',[-82,22,-20],[0,6,-20],39],
   ['yellow',[82,20,-20],[0,5,-20],39],
   ['red-blue',[-92,19,-44],[-32,5,-43],46]
  ]){
   await page.evaluate(async({position,target,fov})=>{
    const {annexePoint}=await import('/annexe.mjs'),{exterior:e,controls}=window.__windows;
    e.scene.fog.density=0;e.camera.position.set(...annexePoint(...position));
    const t=annexePoint(...target);e.camera.lookAt(...t);e.camera.fov=fov;e.camera.updateProjectionMatrix();controls.sync(t);
   },{position,target,fov});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:fileURLToPath(new URL(`oakmere-windows-${phase}-${mode}-${name}.png`,import.meta.url))});
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS: marked window views in '+modes.join(' and ')+'; no browser errors.');
}finally{await browser?.close();server.kill();}
