import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'source',mode=stage==='compiled'?'compiled':'source';
const requestedViews=new Set(process.argv[3]?.split(',')??[]);
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1300,height:950}}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.__court={exterior,renderer,controls};function frame(){')});
  });
  if(stage==='before')for(const name of ['west-front-photo-detail.mjs','west-refinement.mjs'])
    await page.route('**/'+name,async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('west-front-e-before/'+name,import.meta.url),'utf8')}));
  await page.goto(base+'/aerial.html?view=courtyard-photo&models='+mode);
  await page.waitForFunction(()=>window.__court?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__court.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.evaluate(()=>{
    const {exterior}=window.__court;exterior.scene.fog.density=0;
    exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
    document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');
    exterior.invalidateShadows();
  });
  for(const [name,position,target,fov] of [
    ['aerial',[-85,70,92],[-51,6,23],40],
    ['plan',[-51,110,23.01],[-51,0,23],36],
    ['photo',[-56,1.8,41],[-53,7.6,18],75],
    ['reference',[-58,2,52],[-54.5,7.6,20],62],
    ['front',[-58,28,66],[-53,8,23],48],
    ['whole',[-90,100,150],[-2,6,10],50]
  ]){
    if(requestedViews.size&&!requestedViews.has(name))continue;
    await page.evaluate(({position,target,fov})=>{
      const {exterior,controls}=window.__court;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);
      exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
    },{position,target,fov});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:fileURLToPath(new URL(`west-front-e-${stage}-${name}.png`,import.meta.url))});
  }
  assert.deepEqual(errors,[]);console.log(`PASS: ${stage} west front E reference views rendered.`);
}finally{await browser?.close();server.kill();}
