import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const tag=process.argv[2]||'before',mode=process.argv[3]||'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1278,height:783}});page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__sweep={exterior,renderer,layouts,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916&view=historic-admin-grounds');
 await page.waitForFunction(()=>window.__sweep,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const name of ['oblique','plan']){
  const projections=await page.evaluate(name=>{
   const {exterior:e,renderer,THREE}=window.__sweep,camera=e.camera;
   camera.up.set(0,1,0);camera.fov=42;
   if(name==='plan'){camera.position.set(250,130,27);camera.up.set(-1,0,0);camera.lookAt(250,0,27);}
   else {camera.position.set(314,100,10);camera.lookAt(244,0,25);}
   e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});camera.updateProjectionMatrix();e.scene.fog.density=0;e.invalidateShadows();renderer.render(e.scene,camera);
   return [[254,13],[245,36],[258,36],[180,43.5],[216,43.5],[198,61.5]].map(([x,z])=>{const p=new THREE.Vector3(x,.37,z).project(camera);return [x,z,(p.x+1)*639,(1-p.y)*391.5];});
  },name);
  console.log(name,projections);
  await page.screenshot({path:fileURLToPath(new URL(`admin-sweep-${tag}-${mode}-${name}.png`,import.meta.url))});
 }
 console.log(await page.evaluate(()=>window.__sweep.exterior.modelBuild));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
