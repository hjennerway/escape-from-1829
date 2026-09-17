import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const mode=process.argv[2]??'after';
const fit=JSON.parse(readFileSync('Browser/artifacts/garage-relocation-camera.json','utf8'));
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore'});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:931,height:568}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__garagePreview={THREE,renderer,exterior,layouts,updateRoadLabels};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?view=garages-site');
 await page.waitForFunction(()=>window.__garagePreview);
 await page.evaluate(p=>{
  const {THREE,exterior,renderer,layouts,updateRoadLabels}=window.__garagePreview,camera=exterior.camera;
  const [x,y,z,a,b,f,cx,cy]=p;
  camera.position.set(x,y,z);
  camera.lookAt(x-Math.sin(a)*Math.cos(b),y-Math.sin(b),z-Math.cos(a)*Math.cos(b));
  camera.fov=2*Math.atan(568/(2*f))*180/Math.PI;
  camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[8]=1-2*cx/931;
  camera.projectionMatrix.elements[9]=2*cy/568-1;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  exterior.scene.fog.density=0;updateRoadLabels(THREE,layouts.roads,camera,931,568);exterior.invalidateShadows();renderer.render(exterior.scene,camera);
 },fit.parameters);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 await page.screenshot({path:`Browser/artifacts/garage-relocation-${mode}.png`});
 await page.evaluate(()=>{
  const {THREE,exterior,renderer,layouts,updateRoadLabels}=window.__garagePreview,camera=exterior.camera;
  camera.position.set(197,190,81.01);camera.fov=45;camera.updateProjectionMatrix();camera.lookAt(197,0,81);
  updateRoadLabels(THREE,layouts.roads,camera,931,568);exterior.invalidateShadows();renderer.render(exterior.scene,camera);
 });
 await page.screenshot({path:`Browser/artifacts/garage-relocation-${mode}-plan.png`});
 if(errors.length)throw new Error(errors.join('\n'));
 console.log(`Saved ${mode} garage relocation views; no browser errors.`);
}finally{await browser.close();server.kill();}
