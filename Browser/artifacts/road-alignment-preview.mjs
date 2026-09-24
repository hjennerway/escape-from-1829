import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const tag=process.argv[2]||'before',mode=process.argv[3]||'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1181,height:708}});page.setDefaultNavigationTimeout(120000);
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__paths={exterior,renderer,controls,layouts,THREE};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916&view=historic-admin-grounds');await page.waitForFunction(()=>window.__paths?.renderer.info.render.frame>3,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [name,pos,target] of [['oblique',[385,52,-87],[295,0,-80]],['plan',[290,190,-39.99],[290,0,-40]]]){
 await page.evaluate(({pos,target})=>{const {exterior:e,controls}=window.__paths;e.scene.fog.density=0;e.camera.position.set(...pos);e.camera.lookAt(...target);e.camera.fov=48;e.camera.updateProjectionMatrix();controls.sync(target);e.invalidateShadows();},{pos,target});
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({type:"jpeg",quality:55,path:`Browser/artifacts/road-alignment-${tag}-${name}.jpg`});
 }
 console.log(await page.evaluate(()=>window.__paths.exterior.modelBuild));
}finally{await browser.close();server.kill();}
