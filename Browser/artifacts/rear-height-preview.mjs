import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';

const stage=process.argv[2]??'after',mode=stage==='compiled'?'compiled':'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{
  server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));
  server.once('error',reject);
});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.__rearHeight={exterior,renderer,controls};function frame(){')});
  });
  await page.goto(base+'/aerial.html?view=front&models='+mode);
  await page.waitForFunction(()=>window.__rearHeight?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__rearHeight.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.evaluate(()=>{
    const {exterior}=window.__rearHeight;exterior.scene.fog.density=0;
    exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
    document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');
    exterior.invalidateShadows();
  });
  for(const [name,position,target,fov] of [
    ['east',[76,28,-14],[31,8,-11],43],
    ['west',[-76,28,-14],[-31,8,-11],43],
    ['rear',[-65,48,-91],[0,9,-12],44],
    ['end',[31,17,-58],[31,10,-29],42]
  ]){
    await page.evaluate(({position,target,fov})=>{
      const {exterior,controls}=window.__rearHeight;
      exterior.camera.position.set(...position);exterior.camera.lookAt(...target);
      exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
    },{position,target,fov});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:fileURLToPath(new URL(`rear-height-${stage}-${name}.jpg`,import.meta.url)),quality:90});
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${stage} east, west, rear and end views rendered from ${mode} without browser errors.`);
}finally{await browser?.close();server.kill();}
