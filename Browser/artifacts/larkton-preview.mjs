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
 const page=await browser.newPage({viewport:{width:1384,height:900}}),errors=[];
 page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__centre={exterior,renderer,controls,layouts};function frame(){')});});
 await page.goto(base+'/aerial.html?period=1916&models='+mode+'&view=annexe-plan&buildingDetail=full');
 await page.waitForFunction(()=>window.__centre?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__centre.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
 for(const [name,p,t,fov] of [
  ['oblique',[-109,155,69],[-121,0,-28],48],
  ['plan',[-121,170,-28.01],[-121,0,-28],48],
  ['detail',[-78,109,48],[-95,0,-29],48]
 ]){
  await page.evaluate(async({p,t,fov})=>{
   const {exterior,controls}=window.__centre,{annexePoint}=await import('/annexe.mjs');
   exterior.scene.fog.density=0;exterior.scene.traverse(o=>{if(o.isSprite)o.material.visible=false;});
   exterior.camera.position.set(...annexePoint(p[0]*1.6205909445727062,p[1],p[2]*1.6205909445727062));
   const target=annexePoint(t[0]*1.6205909445727062,t[1],t[2]*1.6205909445727062);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
  },{p,t,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL('larkton-'+phase+'-'+mode+'-'+name+'.png',import.meta.url))});
 }
 assert.deepEqual(errors,[]);console.log('PASS: annexe centring browser views; no page errors.');
}finally{await browser?.close();server.kill();}
