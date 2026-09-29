import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const mode=process.argv[2]??'source',label=process.argv[3]??mode;
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1270,height:859}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__sill={exterior,renderer,controls,layouts};function frame(){')});
 });
 await page.goto(base+'/aerial.html?view=front&models='+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.__sill?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__sill.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.evaluate(()=>{
    const {exterior}=window.__sill;exterior.scene.fog.density=0;
  exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
  document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');
  exterior.invalidateShadows();
 });
 for(const [name,position,target,fov] of [
  ['east',[31,1.8,23.7],[29.1,1.65,19.6],64],
  ['east-close',[29.2,.75,21.7],[28.55,.28,19.7],42],
  ['east-oblique',[27,.75,21.4],[28.65,.27,19.7],42],
  ['west',[-31,1.8,23.7],[-29.1,1.65,19.6],64],
 ]){
  await page.evaluate(({position,target,fov})=>{
   const {exterior,controls}=window.__sill;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
  },{position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:'Browser/artifacts/front-sill-'+label+'-'+name+'.png'});
 }
 assert.deepEqual(errors,[]);console.log('PASS: '+label+' entrance sill views, both sides, no browser errors.');
}finally{await browser?.close();server.kill();}
