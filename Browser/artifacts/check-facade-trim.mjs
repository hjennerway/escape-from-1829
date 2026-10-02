import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),out=new URL('./facade-trim/',import.meta.url);
await mkdir(out,{recursive:true});
const label=process.argv[2]??'before';
const server=spawn(process.execPath,['serve.mjs'],{cwd:root,windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>console.error(e));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.trimCheck={THREE,walker,exterior,renderer,lighting};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html?view=front');await page.waitForFunction(()=>window.trimCheck?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
 const views=[
  {name:'reception-east-low',position:[5.6,1.8,21.5],target:[7.1,4,19.6]},
  {name:'reception-west-low',position:[-5.6,1.8,21.5],target:[-7.1,4,19.6]},
  {name:'reception-west',position:[-10,4,23],target:[-7.1,4.1,19.6]},
  {name:'west-step',position:[-20,2.1,22],target:[-22.6,3.15,19.7]},
  {name:'court-east',position:[68,5.8,0],target:[66.2,4.06,7.2]},
  {name:'west-court',position:[-63,5.8,0],target:[-65.9,4.05,4.9]},
  {name:'west-lawn-bay',position:[-23,5.8,31],target:[-27.43,4.05,33.07]},
  {name:'front',position:[-14,4.5,34],target:[0,7,19.6]}
 ];
 for(const mode of ['day','dusk']){
  await page.evaluate(mode=>window.trimCheck.lighting.setMode(mode),mode);
  for(const v of views){
   await page.evaluate(v=>{const {walker,exterior}=window.trimCheck;walker.setView(v);exterior.camera.fov=58;exterior.camera.updateProjectionMatrix();},v);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:new URL(label+'-'+mode+'-'+v.name+'.png',out).pathname.replace(/^\/(\w:)/,'$1')});
  }
 }
 console.log('Captured '+label+' facade trim views');
}finally{await browser?.close();server.kill();}
