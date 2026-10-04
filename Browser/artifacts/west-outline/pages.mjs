import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const destination=new URL('./',import.meta.url),views=JSON.parse(await readFile(new URL('after-validation.json',destination),'utf8')).views;
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:1224,height:918}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.westActual={exterior,renderer};function frame(){')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.westActual={exterior,renderer,walker};const clock=new THREE.Timer();')});});
 for(const mode of ['compiled','explore']){
  await page.goto(base+(mode==='compiled'?'/aerial.html?models=compiled&view=west-3&buildingDetail=full':'/explore.html?view=west-3'));
  await page.waitForFunction(()=>window.westActual?.renderer.info.render.frame>3);
  checks.push(await page.evaluate(async mode=>{
   const THREE=await import('/vendor/three.module.js'),{exterior,walker}=window.westActual;
   if(mode==='compiled'&&exterior.modelBuild.mode!=='compiled')throw Error('Aerial did not load the rebuilt compiled model');
   const pier=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West end shallow centre')); const range=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West courtyard aligned range')); const inner=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West garden inner projecting pavilion')); if(Math.abs(range.getSize(new THREE.Vector3()).z-12.5)>1e-5||Math.abs(inner.max.z-21.2)>1e-5)throw Error('Actual page has stale west outline');
   if(Math.abs(pier.getCenter(new THREE.Vector3()).z-14.3)>1e-5||Math.abs(pier.getSize(new THREE.Vector3()).z-5.8)>1e-5)throw Error('Actual page has stale west-end proportions');
   exterior.trees.visible=false;walker?.setObstacles();exterior.invalidateShadows();
   return {mode,pierCentre:pier.getCenter(new THREE.Vector3()).toArray(),pierWidth:pier.getSize(new THREE.Vector3()).z};
  },mode));
  for(const name of ['pair1','pair3','pair4','plan']){
   await page.evaluate(v=>{const {exterior,walker}=window.westActual;exterior.camera.up.set(...(v===undefined?[0,1,0]:Math.abs(v.position[1]-210)<1?[1,0,0]:[0,1,0]));if(walker)walker.setView(v);else{exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);}exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views[name]);
   await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',destination))});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(v=>{const {exterior,walker}=window.westActual;exterior.camera.up.set(0,1,0);if(walker)walker.setView(v);else{exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);}exterior.camera.fov=65;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views.pair3);
  await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',destination))});
  await page.setViewportSize({width:1224,height:918});
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL('pages-validation.json',destination),JSON.stringify({checks,errors},null,2)+'\n');
 console.log('PASS: actual compiled aerial and Explore west proportions, desktop/mobile views, refreshed tree obstacles and no page/shader errors.');
}finally{await browser.close();server.kill();}
