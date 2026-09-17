import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:900,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__corridorPreview={THREE,renderer,exterior,layouts};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?view=main-admin');
 await page.waitForFunction(()=>window.__corridorPreview);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [name,position,target,fov] of [
  ['aerial',[158,81,72],[158,3,15],34],
  ['door',[157,5,44],[156.3,2.4,28],55],
  ['side',[125,29,46],[157,4,17],42],
  ['plan',[157,88,16.01],[157,0,16],38]
 ]){
  await page.evaluate(({position,target,fov})=>{
   const {exterior,renderer}=window.__corridorPreview,camera=exterior.camera;
   camera.position.set(...position);camera.lookAt(...target);camera.fov=fov;camera.updateProjectionMatrix();
   exterior.scene.fog.density=0;exterior.invalidateShadows();renderer.render(exterior.scene,camera);
  },{position,target,fov});
  await page.screenshot({path:`Browser/artifacts/admin-front-corridor-${process.argv[2]??'after'}-${name}.png`});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: admin front corridor aerial, doorway and plan renders without browser errors.');
}finally{await browser.close();}
