import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
const tag=process.argv[2]||'before',mode=process.argv[3]||'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1050,height:686}});page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__parsons={exterior,renderer,controls,layouts,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916');
 await page.waitForFunction(()=>window.__parsons,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const name of ['oblique','plan','modern']){
  await page.evaluate(name=>{
   const {exterior:e,renderer}=window.__parsons,camera=e.camera;
   e.timeline.setPeriod(name==='modern'?2010:1916);
   camera.up.set(0,1,0);
   if(name==='plan'){camera.position.set(535,145,-65);camera.up.set(1,0,0);camera.lookAt(535,0,-65);}
   else{camera.position.set(462,87,-160);camera.lookAt(538,0,-66);}
   camera.fov=48;camera.updateProjectionMatrix();e.trees.visible=false;e.scene.fog.density=0;e.invalidateShadows();renderer.render(e.scene,camera);
  },name);
  await page.screenshot({type:'jpeg',quality:65,path:fileURLToPath(new URL(`parsons-end-${tag}-${mode}-${name}.jpg`,import.meta.url))});
 }
 const build=await page.evaluate(()=>window.__parsons.exterior.modelBuild);console.log(build);
 if(build.mode!==(mode==='source'?'procedural':'compiled'))throw Error('Unexpected model loading mode');
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
