import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise(resolve=>server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1171,height:560}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.__garden={exterior,renderer,controls};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916');
 await page.waitForFunction(()=>window.__garden?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__garden.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.evaluate(()=>{const {exterior}=window.__garden;exterior.scene.fog.density=0;exterior.trees.visible=false;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.invalidateShadows();document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');});
 for(const [name,position,target,fov] of [
  ['reference',[73,39,69],[69,5,22],40],
  ['marked',[73,39,69],[65,5,22],28],
  ['wall',[73,9,23],[80,3,10.5],36],
  ['plan',[62,65,30.1],[62,0,30],40]
 ]){
  await page.evaluate(({position,target,fov})=>{const {exterior,controls}=window.__garden;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);},{position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:`Browser/artifacts/garden-cleanup-${stage}-${name}.jpg`,quality:85});
 }
 assert.deepEqual(errors,[]);console.log('PASS: '+stage+' garden reference, wall and plan views rendered from '+mode+' without page errors.');
}finally{await browser?.close();server.kill();}
