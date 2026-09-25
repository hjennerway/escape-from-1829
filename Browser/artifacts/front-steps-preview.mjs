import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const stage=process.argv[2]??'after',mode=stage==='compiled'?'compiled':'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{
  server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));
  server.once('error',reject);
});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__steps={exterior,renderer,controls};function frame(){')});
  });
  await page.goto(base+'/aerial.html?view=front-steps&period=1829&models='+mode);
  await page.waitForFunction(()=>window.__steps?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__steps.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.evaluate(()=>{
    const {exterior}=window.__steps;
    exterior.scene.fog.density=0;
    exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
    document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');
    exterior.invalidateShadows();
  });
  for(const [name,position,target] of [
    ['oblique',[17,23,42],[0,1.3,23.7]],
    ['front',[0,6,38],[0,1.3,23.7]]
  ]){
    await page.evaluate(({position,target})=>{
      const {exterior,controls}=window.__steps;
      exterior.camera.position.set(...position);exterior.camera.lookAt(...target);
      exterior.camera.fov=40;exterior.camera.updateProjectionMatrix();controls.sync(target);
    },{position,target});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:new URL('front-steps-'+stage+'-'+name+'.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: '+stage+' entrance staircase rendered from '+mode+' without browser errors.');
}finally{await browser?.close();server.kill();}
