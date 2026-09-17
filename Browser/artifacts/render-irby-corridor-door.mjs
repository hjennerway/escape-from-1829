import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:850,height:760}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__doorPreview={THREE,renderer,exterior};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?view=irby-corridor');
 await page.waitForFunction(()=>window.__doorPreview);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [name,position,target,fov] of [
  ['aerial',[256,27,-61],[218,3,-67],38],
  ['close',[234,3,-66.6],[221.7,1.8,-66.6],35]
 ]){
  await page.evaluate(({position,target,fov})=>{
   const {exterior,renderer}=window.__doorPreview,camera=exterior.camera;
   exterior.scene.traverse(object=>{if(object.isSprite)object.visible=false;});
   camera.position.set(...position);camera.lookAt(...target);camera.fov=fov;camera.updateProjectionMatrix();
   exterior.scene.fog.density=0;exterior.invalidateShadows();renderer.render(exterior.scene,camera);
  },{position,target,fov});
  await page.screenshot({path:`Browser/artifacts/irby-corridor-door-${name}.png`});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: Irby corridor doorway renders in aerial and close views without browser errors.');
}finally{await browser.close();}
