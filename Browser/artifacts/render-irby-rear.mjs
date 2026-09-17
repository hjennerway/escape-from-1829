import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fit=JSON.parse(readFileSync('Browser/artifacts/irby-rear-camera.json','utf8'));
const original=execFileSync('git',['show','HEAD:Browser/dist/irby-ashley.mjs'],{encoding:'utf8'});
const originalCourt=execFileSync('git',['show','HEAD:Browser/dist/estates-service-court.mjs'],{encoding:'utf8'});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const mode of ['before','after']){
  const page=await browser.newPage({viewport:{width:808,height:624}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(mode==='before'){
   await page.route('**/irby-ashley.mjs',route=>route.fulfill({contentType:'text/javascript',body:original}));
   await page.route('**/estates-service-court.mjs',route=>route.fulfill({contentType:'text/javascript',body:originalCourt}));
  }
  await page.route('**/aerial.html*',async route=>{
   const response=await route.fetch();
   const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__irbyPreview={THREE,renderer,exterior,layouts,updateRoadLabels};function frame(){}');
   await route.fulfill({response,body});
  });
  await page.goto('http://127.0.0.1:1829/aerial.html?view=irby-ashley');
  await page.waitForFunction(()=>window.__irbyPreview);
  await page.evaluate(p=>{
   const {THREE,exterior,renderer,layouts,updateRoadLabels}=window.__irbyPreview,camera=exterior.camera;
   const [x,y,z,a,b,f,cx,cy]=p;
   camera.position.set(x,y,z);
   camera.lookAt(x-Math.sin(a)*Math.cos(b),y-Math.sin(b),z-Math.cos(a)*Math.cos(b));
   camera.fov=2*Math.atan(624/(2*f))*180/Math.PI;camera.updateProjectionMatrix();
   camera.projectionMatrix.elements[8]=1-2*cx/808;
   camera.projectionMatrix.elements[9]=2*cy/624-1;
   camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
   exterior.scene.fog.density=0;updateRoadLabels(THREE,layouts.roads,camera,808,624);
   exterior.invalidateShadows();renderer.render(exterior.scene,camera);
  },fit.parameters);
  await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
  await page.screenshot({path:`Browser/artifacts/irby-rear-shift-${mode}.png`});
  await page.evaluate(()=>{const {exterior,renderer}=window.__irbyPreview;exterior.trees.visible=false;exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);});
  await page.screenshot({path:`Browser/artifacts/irby-rear-shift-${mode}-clear.png`});
  if(errors.length)throw new Error(errors.join('\n'));
  await page.close();
 }
 console.log('PASS: before/after Irby renders with fixed trees and camera; no browser errors.');
}finally{await browser.close();}
