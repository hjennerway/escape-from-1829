import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const stage=process.argv[2]??'after',mode=stage==='compiled'?'compiled':'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{
 server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);
});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1455,height:750}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__kitchen={THREE,exterior,renderer,controls};function frame(){')});
 });
 await page.goto(base+'/aerial.html?view=main-kitchen-roofs&models='+mode);
 await page.waitForFunction(()=>window.__kitchen?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__kitchen.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 const views=[
  ['overview',[127,32,53],[138,3,-6],44],
  ['fascia',[130,11,19],[137,4.3,6.6],42],
  ['fascia-shift',[132,11,19],[139,4.3,6.6],42],
  ['junction',[151,14,23],[156.3,4.1,9.8],40],
  ['junction-reverse',[163,14,-3],[156.3,4.1,9.8],40]
 ];
 for(const [name,position,target,fov] of views){
  await page.evaluate(({position,target,fov})=>{
   const {exterior,controls}=window.__kitchen;
   exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
   exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;
   exterior.camera.updateProjectionMatrix();controls.sync(target);exterior.invalidateShadows();
  },{position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:`Browser/artifacts/kitchen-roof-${stage}-${name}.png`});
 }
 assert.deepEqual(errors,[]);
 await writeFile(`Browser/artifacts/kitchen-roof-${stage}.json`,JSON.stringify({mode,views,errors},null,2)+'\n');
 console.log(`PASS: ${stage} kitchen trim and T-junction views rendered in ${mode} mode without page errors.`);
}finally{await browser?.close();server.kill();}
