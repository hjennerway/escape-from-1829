import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const tag=process.argv[2]||'before',mode=process.argv[3]||'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:960}});page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__roads={exterior,renderer,layouts,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1912&view=historic-admin-grounds');
 await page.waitForFunction(()=>window.__roads,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const year of tag==='before'?[1912]:[1912,1915])for(const view of ['oblique','plan']){
  await page.evaluate(({year,view})=>{
   const {exterior:e,renderer,THREE}=window.__roads,camera=e.camera;
   e.timeline.setPeriod(year);camera.up.set(0,1,0);camera.fov=42;
   if(view==='plan'){camera.position.set(295,490,10);camera.lookAt(295,0,10);camera.up.set(0,0,-1);camera.lookAt(295,0,10);}
   else {camera.position.set(295,420,160);camera.lookAt(295,0,10);}
   e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});camera.updateProjectionMatrix();e.scene.fog.density=0;e.invalidateShadows();renderer.render(e.scene,camera);
  },{year,view});
  await page.screenshot({path:fileURLToPath(new URL(`roads-${year}-${tag}-${mode}-${view}.png`,import.meta.url))});
 }
 console.log(await page.evaluate(()=>window.__roads.exterior.modelBuild));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
