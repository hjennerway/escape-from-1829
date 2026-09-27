import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const mode=process.argv[2]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1440,height:880}}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__basement={exterior,renderer,controls,layouts};function frame(){')});
  });
  await page.goto(base+'/aerial.html?view=front-steps&models='+mode);
  await page.waitForFunction(()=>window.__basement?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__basement.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.evaluate(()=>{
    const {exterior}=window.__basement;exterior.scene.fog.density=0;
    exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
    document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');
    exterior.invalidateShadows();
  });
  for(const [name,position,target,fov] of [
    ['front',[0,29,68],[0,5,21],52],
    ['west',[-18,10,34],[-17,0,19],62],
    ['east',[18,10,34],[17,0,19],62],
    ['ground',[-26.15,1.6,25.5],[-21.8,.3,18.8],76]
  ]){
    await page.evaluate(({position,target,fov})=>{
      const {exterior,controls}=window.__basement;
      exterior.camera.position.set(...position);exterior.camera.lookAt(...target);
      exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
    },{position,target,fov});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:fileURLToPath(new URL('front-basement-'+mode+'-'+name+'.png',import.meta.url))});
  }
  assert.deepEqual(errors,[]);console.log('PASS: '+mode+' front, both side walks and ground view render without errors.');
}finally{await browser?.close();server.kill();}
