import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const phase=process.argv[2]??'before',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1463,height:900}}),errors=[];
 page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__centre={exterior,renderer,controls,layouts};function frame(){')});});
 await page.goto(base+'/aerial.html?period=1916&models='+mode+'&view=annexe-plan&buildingDetail=full');
 await page.waitForFunction(()=>window.__centre?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__centre.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
 for(const [name,p,t,fov] of [
  ['plan',[20,250,0.01],[20,0,0],48],
  ['front',[5,40,135],[5,3,12],48],
  ['overview',[7,118,140],[7,0,9],48]
 ]){
  await page.evaluate(async({p,t,fov})=>{
   const {exterior,controls}=window.__centre,{annexePoint}=await import('/annexe.mjs');
   exterior.scene.fog.density=0;exterior.scene.traverse(o=>{if(o.isSprite)o.material.visible=false;});
   exterior.camera.position.set(...annexePoint(...p));
   const target=annexePoint(...t);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
  },{p,t,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL('annexe-entrance-alignment-'+phase+'-'+mode+'-'+name+'.png',import.meta.url))});
 }
 console.log(await page.evaluate(async()=>{
  const {exterior}=window.__centre,{annexeSiteLocal,ANNEXE}=await import('/annexe.mjs'),THREE=await import('/vendor/three.module.js');
  const centres={};for(const name of ['Entrance range brick walls','Entrance recessed double door','West front pavilion brick walls','East front pavilion brick walls']){
   const o=exterior.annexe.getObjectByName(name),p=o.getWorldPosition(new THREE.Vector3());centres[name]=annexeSiteLocal([p.x,p.z]);
  }return {placement:ANNEXE,centres};
 }));
 assert.deepEqual(errors,[]);console.log('PASS: annexe corridor browser views; no page errors.');
}finally{await browser?.close();server.kill();}

