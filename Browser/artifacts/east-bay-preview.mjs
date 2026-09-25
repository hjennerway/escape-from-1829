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
  const page=await browser.newPage({viewport:{width:920,height:920}}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.__bay={exterior,renderer,controls};function frame(){')});
  });
  await page.goto(base+'/aerial.html?view=east-photo&models='+mode);
  await page.waitForFunction(()=>window.__bay?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__bay.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.evaluate(()=>{
    const {exterior}=window.__bay;exterior.scene.fog.density=0;
    exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
    document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');
    exterior.invalidateShadows();
  });
  for(const [name,position,target,fov] of [
    ['close',[59,22,42],[53.1,8.5,20],42],
    ['plan',[53.1,33,27],[53.1,8,20],30],
    ['front',[53.1,8,44],[53.1,8,20],42]
  ]){
    await page.evaluate(({position,target,fov})=>{
      const {exterior,controls}=window.__bay;
      exterior.camera.position.set(...position);exterior.camera.lookAt(...target);
      exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
    },{position,target,fov});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:fileURLToPath(new URL(`east-bay-${stage}-${name}.png`,import.meta.url))});
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${stage} east bay close, plan and front views rendered from ${mode}.`);
}finally{await browser?.close();server.kill();}
