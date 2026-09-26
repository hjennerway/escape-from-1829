import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const tag=process.argv[2]||'before',mode=process.argv[3]||'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1600,height:800}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__frontage={exterior,renderer,layouts,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916&view=historic-admin-grounds');
 await page.waitForFunction(()=>window.__frontage);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const view of ['front','plan']){
  await page.evaluate(view=>{
   const {exterior:e,renderer}=window.__frontage,camera=e.camera;
   camera.up.set(0,1,0);camera.fov=view==='front'?40:27;
   if(view==='front'){camera.position.set(198,34,91);camera.lookAt(198,4,35);}
   else {camera.position.set(198,115,42);camera.up.set(0,0,-1);camera.lookAt(198,0,42);}
   e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});camera.updateProjectionMatrix();e.scene.fog.density=0;e.invalidateShadows();renderer.render(e.scene,camera);
  },view);
  await page.screenshot({path:fileURLToPath(new URL(`admin-frontage-paving-${tag}-${mode}-${view}.png`,import.meta.url))});
 }
 const result=await page.evaluate(()=>{
  const {exterior:e,layouts,THREE}=window.__frontage,ray=new THREE.Raycaster(),samples=[];
  for(const [x,z] of [[161,38.7],[168,40.8],[173.5,38.7],[175,35.5],[180,35.5],[187,35.5],[191,39.8],[205,39.8],[212,35.5],[218.8,38],[220,42.5],[226,42.5],[232.4,40.5]]){
   ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));
   samples.push({point:[x,z],surface:ray.intersectObject(layouts.historicRoads,true).find(hit=>hit.object.userData.surface)?.object.userData.surface??null});
  }
  return {build:e.modelBuild,samples};
 });
 if(tag!=='before')for(const sample of result.samples)assert.equal(sample.surface,'black road',String(sample.point));
 assert.equal(result.build.mode,mode==='compiled'?'compiled':'procedural');assert.deepEqual(errors,[]);
 await writeFile(new URL(`admin-frontage-paving-${tag}-${mode}.json`,import.meta.url),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));
}finally{await browser?.close();server.kill();}
