import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const stage=process.argv[2]??'before',mode=stage==='compiled'?'compiled':'source';
await mkdir(new URL('.',import.meta.url),{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1500,height:900},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__check={exterior,renderer,controls,layouts};function frame(){')});});
 await page.goto(base+'/aerial.html?period=1938&models='+mode);
 await page.waitForFunction(()=>window.__check?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__check.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.evaluate(()=>{
  const {exterior:e}=window.__check;e.scene.fog.density=0;e.trees.visible=false;
  document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');
  e.invalidateShadows();
 });
 const views=[
  ['overview',[60,105,-42],[-28,0,-105],42],
  ['plan',[-30,130,-105.01],[-30,0,-105],45],
  ['church',[-43,76,-152],[-5,0,-123],43]
 ];
 for(const [name,position,target,fov] of views){
  await page.evaluate(({position,target,fov})=>{
   const {exterior:e,controls}=window.__check;e.camera.position.set(...position);e.camera.lookAt(...target);e.camera.fov=fov;e.camera.updateProjectionMatrix();controls.sync(target);
  },{position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:new URL(stage+'-'+name+'.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
 }
 const receipt=await page.evaluate(()=>{
  const {exterior:e,layouts:l}=window.__check;
  return {build:e.modelBuild,road:l.roads.getObjectByName('Parsons Lane').userData.centerline,perimeter:e.churchGrounds.getObjectByName('Church curved perimeter walk').userData.centerline};
 });
 assert.deepEqual(errors,[]);await writeFile(new URL(stage+'.json',import.meta.url),JSON.stringify({...receipt,errors},null,2)+'\n');
 console.log('PASS: '+stage+' church/road overview, plan and close views; no page or shader errors.');
}finally{await browser?.close();server.kill();}
