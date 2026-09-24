import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
const tag=process.argv[2]??'before',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:987,height:841}}),errors=[];
 page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__lamps={exterior,renderer,controls,layouts,lighting,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916');
 await page.waitForFunction(()=>window.__lamps,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 const report=await page.evaluate(async()=>{
  const {exterior:e,renderer,lighting,THREE}=window.__lamps;
  const {annexeSitePoint,annexeSiteLocal}=await import('./annexe.mjs');
  const {ANNEXE_ACCESS:a,ANNEXE_ACCESS_PAVING}=await import('./annexe-access.mjs');
  const camera=e.camera,target=annexeSitePoint(a.centreX,0,82);
  camera.position.set(...annexeSitePoint(a.centreX+28,85,155));camera.up.set(0,1,0);camera.lookAt(...target);camera.fov=48;camera.updateProjectionMatrix();
  e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});lighting.setNight(true);e.invalidateShadows();renderer.render(e.scene,camera);
  const groups=[];e.model.traverse(o=>{if(o.userData.streetLamps&&/Annexe front/.test(o.name))groups.push({name:o.name,fixtures:o.userData.streetLamps.map(p=>({...p,local:annexeSiteLocal([p.x,p.z])}))});});
  const project=([x,z])=>{const p=new THREE.Vector3(x,0,z).project(camera);return [(p.x+1)*987/2,(1-p.y)*841/2]};
  return {build:e.modelBuild,access:a,groups,paving:ANNEXE_ACCESS_PAVING.filter(p=>/forecourt/.test(p.name)).map(p=>({...p,pixels:p.points.map(project)}))};
 });
 await page.screenshot({path:fileURLToPath(new URL(`annexe-lamps-${tag}-${mode}.png`,import.meta.url))});
 await writeFile(new URL(`annexe-lamps-${tag}-${mode}.json`,import.meta.url),JSON.stringify(report,null,2));
 assert.equal(report.build.mode,mode==='source'?'procedural':'compiled');assert.deepEqual(errors,[]);
 console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();server.kill();}
