import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const phase=process.argv[2]||'before',mode=process.argv[3]||'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:965,height:827}});page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__loop={exterior,renderer,controls,layouts,THREE};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916&view=annexe-roads');await page.waitForFunction(()=>window.__loop?.renderer.info.render.frame>3,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [name,pos,target] of [['close',[255,85,-60],[333,0,-43]],['plan',[333,100,-43.01],[333,0,-43]]]){
  await page.evaluate(({pos,target})=>{const {exterior:e,controls}=window.__loop;e.scene.fog.density=0;e.camera.position.set(...pos);e.camera.lookAt(...target);e.camera.fov=48;e.camera.updateProjectionMatrix();controls.sync(target);e.invalidateShadows();},{pos,target});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:new URL(`annexe-loop-${phase}-${mode}-${name}.jpg`,import.meta.url).pathname.slice(1)});

 }
 const build=await page.evaluate(()=>window.__loop.exterior.modelBuild);console.log(build);if(build.mode!==(mode==='source'?'procedural':'compiled'))throw Error('Unexpected model loading mode');if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
