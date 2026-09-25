import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:760}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__path={exterior,renderer,controls};function frame(){')});});
 await page.goto(base+'/aerial.html?period=1896&trees=on&models='+mode);
 await page.waitForFunction(()=>window.__path?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__path.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [view,position,target,fov] of [
  ['side',[-118,82,-8],[-55,1,7],36],
  ['plan',[-57,130,5],[-57,0,5.01],44]
 ]){
  await page.evaluate(({position,target,fov})=>{
   const {exterior,controls}=window.__path,camera=exterior.camera;
   camera.position.set(...position);camera.lookAt(...target);camera.fov=fov;camera.updateProjectionMatrix();controls.sync(target);
   exterior.scene.fog.density=0;exterior.invalidateShadows();
  },{position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:`Browser/artifacts/west-path-${mode}-${view}.jpg`,quality:88});
 }
 assert.deepEqual(errors,[]);console.log('PASS: west path renders in '+mode+' mode without page errors.');
}finally{await browser?.close();server.kill();}
