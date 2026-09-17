import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const stage=process.argv[2]??'after';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1633,height:900}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 if(stage==='before'){
  const original=execFileSync('git',['show','HEAD:Browser/dist/annexe.mjs'],{encoding:'utf8',windowsHide:true});
  await page.route('**/annexe.mjs',route=>route.fulfill({contentType:'text/javascript',body:original}));
 }
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__courtPreview={THREE,renderer,exterior,layouts};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?view=annexe');
 await page.waitForFunction(()=>window.__courtPreview,{},{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [name,position,target,fov] of [
  ['overview',[126,122,215],[18,3,-25],44],
  ['west',[-84,36,118],[-76,5,42],49],
  ['east',[100,36,126],[69,5,48],49]
 ]){
  await page.evaluate(async ({position,target,fov})=>{
   const {annexePoint}=await import('./annexe.mjs');
   const {THREE,renderer,exterior,layouts}=window.__courtPreview;
   const {updateRoadLabels}=await import('./road-labels.mjs');
   exterior.camera.position.fromArray(annexePoint(...position));
   exterior.camera.lookAt(...annexePoint(...target));
   exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();
   exterior.scene.fog.density=0;exterior.trees.visible=false;
   updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);
   exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
  },{position,target,fov});
  await page.screenshot({path:`Browser/artifacts/annexe-court-fronts-${stage}-${name}.png`});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log(`PASS: ${stage} annexe overview and both courtyard fronts render without page errors.`);
}finally{await browser.close();}
