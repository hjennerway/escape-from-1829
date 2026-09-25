import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1223,height:780}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.__frontage={exterior,renderer,controls};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916');
 await page.waitForFunction(()=>window.__frontage?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__frontage.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.evaluate(()=>{const {exterior}=window.__frontage;exterior.scene.fog.density=0;exterior.trees.visible=false;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.invalidateShadows();document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');});
 for(const [name,position,target,fov] of [
  ['reference',[56,31,83],[46,7,20],42],
  ['photo',[66,2.7,100],[50,8,20],36],
  ['detail',[64,16,45],[57.5,8,21],48],
  ['plan',[51,60,23.1],[51,0,23],38]
 ]){
  await page.evaluate(({position,target,fov})=>{const {exterior,controls}=window.__frontage;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);},{position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:`Browser/artifacts/redesmere-frontage-${stage}-${mode}-${name}.png`});
 }
 assert.deepEqual(errors,[]);console.log('PASS: '+stage+' '+mode+' frontage views rendered without page errors.');
}finally{await browser?.close();server.kill();}
