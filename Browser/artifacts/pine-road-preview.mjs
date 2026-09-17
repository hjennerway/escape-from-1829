import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const mode=process.argv[2]??'after';
const fit=JSON.parse(readFileSync('Browser/artifacts/pine-road-fit.json','utf8'));
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore'});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1392,height:621}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__roadPreview={THREE,renderer,exterior,layouts};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?view=historic-admin-grounds');
 await page.waitForFunction(()=>window.__roadPreview);
 await page.evaluate(p=>{
  const {THREE,exterior,renderer}=window.__roadPreview,camera=exterior.camera;
  const [x,y,z,a,b,f,cx,cy]=p;
  camera.position.set(x,y,z);
  camera.lookAt(x-Math.sin(a)*Math.cos(b),y-Math.sin(b),z-Math.cos(a)*Math.cos(b));
  camera.fov=2*Math.atan(621/(2*f))*180/Math.PI;
  camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[8]=1-2*cx/1392;
  camera.projectionMatrix.elements[9]=2*cy/621-1;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  exterior.scene.fog.density=0;
  exterior.invalidateShadows();renderer.render(exterior.scene,camera);
 },fit.parameters);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 await page.screenshot({path:`Browser/artifacts/pine-road-${mode}.png`});
 await page.evaluate(()=>{const {exterior,renderer}=window.__roadPreview;exterior.trees.visible=false;exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);});
 await page.screenshot({path:`Browser/artifacts/pine-road-${mode}-clear.png`});
 if(errors.length)throw new Error(errors.join('\n'));
 console.log(`Saved ${mode} road previews`);
}finally{await browser.close();server.kill();}
