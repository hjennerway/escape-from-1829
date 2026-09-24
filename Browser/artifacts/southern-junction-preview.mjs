import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const tag=process.argv[2]||'before',mode=process.argv[3]||'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1000,height:760}});page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__junction={exterior,renderer,layouts,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916');
 await page.waitForFunction(()=>window.__junction,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const view of ['oblique','plan']){
  await page.evaluate(view=>{
   const {exterior:e,renderer}=window.__junction,c=e.camera;
   c.up.set(0,1,0);c.fov=42;
   if(view==='plan'){c.position.set(206,160,216);c.up.set(0,0,-1);c.lookAt(206,0,216);}
   else{c.position.set(110,135,284);c.lookAt(206,0,216);}
   e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});c.updateProjectionMatrix();e.scene.fog.density=0;e.invalidateShadows();renderer.render(e.scene,c);
  },view);
  await page.screenshot({path:fileURLToPath(new URL(`southern-junction-${tag}-${mode}-${view}.jpg`,import.meta.url)),type:'jpeg',quality:85});
 }
 console.log(await page.evaluate(()=>window.__junction.exterior.modelBuild));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
