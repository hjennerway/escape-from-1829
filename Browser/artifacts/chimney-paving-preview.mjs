import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const phase=process.argv[2]??'before',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1132,height:810}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__paving={exterior,renderer,controls,layouts};function frame(){')});});
 if(phase==='before')await page.route('**/historic-road-layout.mjs',route=>route.fulfill({contentType:'text/javascript',body:readFileSync('Browser/artifacts/chimney-paving-before-road-layout.txt','utf8')}));
 await page.goto(base+'/aerial.html?period=1916&view=tower-buildings&models='+mode);
 await page.waitForFunction(()=>window.__paving?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__paving.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [view,position,target,fov] of [
  ['yard',[270,108,62],[191,0,-24],43],
  ['plan',[187,160,-30],[187,0,-30.01],45]
 ]){
  await page.evaluate(({position,target,fov})=>{
   const {exterior,controls}=window.__paving,camera=exterior.camera;
   camera.position.set(...position);camera.lookAt(...target);camera.fov=fov;camera.updateProjectionMatrix();controls.sync(target);
   exterior.scene.fog.density=0;exterior.invalidateShadows();
  },{position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:`Browser/artifacts/chimney-paving-${phase}-${mode}-${view}.jpg`,quality:85});
 }
 assert.deepEqual(errors,[]);console.log('PASS: chimney yard renders in '+mode+' mode without page errors.');
}finally{await browser?.close();server.kill();}
