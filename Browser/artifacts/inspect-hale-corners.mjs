import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise(resolve=>server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1222,height:918}}),errors=[];
 page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__hale={exterior,renderer};function frame(){')});
 });
 const mode=process.argv.includes('--compiled')?'compiled':'source';
 for(const view of process.argv.includes('--mobile-only')?[]:['hale-corner-photo-1','hale-corner-photo-2','hale-daresbury-huxley-dunham-courts','hale-daresbury-huxley-dunham-plan']){
  await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full&view='+view);
  await page.waitForFunction(()=>window.__hale?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__hale.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.screenshot({path:`Browser/artifacts/${view}-${mode}.png`});
  console.log('Rendered '+view+' '+mode);
 }
 if(!process.argv.includes('--mobile-only')){
  await page.goto(base+'/explore.html?view=hale-corner-photo-2',{waitUntil:'networkidle'});
  await page.screenshot({path:'Browser/artifacts/hale-corner-walk.png'});
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/aerial.html?models='+mode+'&view=hale-corner-photo-1');
 await page.waitForFunction(()=>window.__hale?.renderer.info.render.frame>3,null,{timeout:120000});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert(await page.evaluate(()=>window.__hale.exterior.camera.position.y>=1.8),'Portrait photo framing stays above ground');
 assert(await page.evaluate(()=>document.querySelector('#churtonNav').getBoundingClientRect().top>document.querySelector('#previewNav').getBoundingClientRect().bottom),'Photo links stay below the mobile toolbar');
 await page.screenshot({path:'Browser/artifacts/hale-corner-mobile.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: corner photo views, courts, plan, walking and mobile without browser errors.');
}finally{await browser.close();server.kill();}
