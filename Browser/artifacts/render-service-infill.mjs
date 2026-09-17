import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {parameters:p}=JSON.parse(readFileSync('Browser/artifacts/service-infill-camera.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1226,height:716}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__infillPreview={THREE,renderer,exterior,layouts};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?view=tower-buildings');
 await page.waitForFunction(()=>window.__infillPreview);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 await page.evaluate(p=>{
  const {exterior,renderer}=window.__infillPreview,camera=exterior.camera;
  camera.position.set(...p.slice(0,3));
  const forward=[-Math.sin(p[3])*Math.cos(p[4]),-Math.sin(p[4]),-Math.cos(p[3])*Math.cos(p[4])];
  camera.lookAt(...forward.map((v,i)=>p[i]+v));camera.fov=2*Math.atan(716/2/p[5])*180/Math.PI;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  exterior.scene.fog.density=0;exterior.invalidateShadows();renderer.render(exterior.scene,camera);
 },p);
 await page.screenshot({path:`Browser/artifacts/service-infill-${process.argv[2]??'after'}.png`});
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: service infill and cylinder view renders without browser errors.');
}finally{await browser.close();}
