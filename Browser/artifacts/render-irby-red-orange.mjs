import {chromium} from 'playwright';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const fit=JSON.parse(readFileSync('Browser/artifacts/irby-red-orange-camera.json','utf8'));
const mode=process.argv[2]??'before';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:908,height:639}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 if(mode==='road-before')await page.route('**/historic-road-layout.mjs',route=>route.fulfill({contentType:'text/javascript',body:execFileSync('git',['show','HEAD:Browser/dist/historic-road-layout.mjs'],{encoding:'utf8'})}));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__irbyPreview={THREE,renderer,exterior,layouts,updateRoadLabels};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?models=source&view=irby-ashley');
 await page.waitForFunction(()=>window.__irbyPreview,null,{timeout:120000});
 await page.evaluate(p=>{
  const {THREE,exterior,renderer,layouts,updateRoadLabels}=window.__irbyPreview,camera=exterior.camera;
  const [x,y,z,a,b,f,cx,cy]=p;
  camera.position.set(x,y,z);
  camera.lookAt(x-Math.sin(a)*Math.cos(b),y-Math.sin(b),z-Math.cos(a)*Math.cos(b));
  camera.fov=2*Math.atan(639/(2*f))*180/Math.PI;camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[8]=1-2*cx/908;
  camera.projectionMatrix.elements[9]=2*cy/639-1;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  exterior.scene.fog.density=0;updateRoadLabels(THREE,layouts.roads,camera,908,639);
  exterior.invalidateShadows();renderer.render(exterior.scene,camera);
 },fit.parameters);
 if(mode.startsWith('road-'))await page.evaluate(()=>{
  const {exterior,renderer}=window.__irbyPreview,camera=exterior.camera;
  camera.position.set(315,130,18);camera.lookAt(233,0,-34);camera.fov=48;camera.updateProjectionMatrix();
  exterior.invalidateShadows();renderer.render(exterior.scene,camera);
 });
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 await page.screenshot({path:`Browser/artifacts/irby-red-orange-${mode}.png`});
 await page.evaluate(()=>{const {exterior,renderer}=window.__irbyPreview;exterior.trees.visible=false;exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);});
 await page.screenshot({path:`Browser/artifacts/irby-red-orange-${mode}-clear.png`});
 if(errors.length)throw new Error(errors.join('\n'));
 console.log(`PASS: Irby ${mode} screenshot, no browser errors.`);
}finally{await browser.close();}
