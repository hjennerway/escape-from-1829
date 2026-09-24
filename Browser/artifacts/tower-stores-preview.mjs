import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];
 page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__stores={exterior,renderer,controls,layouts};function frame(){')});});
 await page.goto(base+'/aerial.html?period=1916&view=tower-buildings&models='+mode);
 await page.waitForFunction(()=>window.__stores?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__stores.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [name,position,target] of [
  ['detail',[105,37,-17],[149,6,-40]],
  ['perimeter',[112,58,-4],[153,6,-34]],
  ['door',[128,5,-43],[146,2.8,-44]]
 ]){
  await page.evaluate(({position,target})=>{
   const {exterior,controls}=window.__stores,camera=exterior.camera;
   camera.position.set(...position);camera.lookAt(...target);camera.fov=42;camera.updateProjectionMatrix();controls.sync(target);
   exterior.scene.fog.density=0;exterior.invalidateShadows();
  },{position,target});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:`Browser/artifacts/tower-stores-${mode}-${name}.png`});
 }
 assert.deepEqual(errors,[]);console.log('PASS: '+mode+' stores detail, roof perimeter and door render without page errors.');
}finally{await browser?.close();server.kill();}
