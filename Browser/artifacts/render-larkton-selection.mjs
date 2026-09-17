import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const port=1843,server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__wardPreview={renderer,exterior,buildingSelection,buildingGlow};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto(`http://127.0.0.1:${port}/aerial.html?view=annexe&models=compiled`);
 await page.waitForFunction(()=>window.__wardPreview,{},{timeout:90000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const id of ['annexe','larkton-jodrell']){
  await page.evaluate(async id=>{
   const {renderer,exterior,buildingSelection,buildingGlow}=window.__wardPreview;
   const {annexePoint}=await import('./annexe.mjs');
   exterior.scene.traverse(object=>{if(object.isSprite)object.visible=false;});
   exterior.trees.visible=false;
   exterior.camera.position.fromArray(annexePoint(180,230,310));
   exterior.camera.lookAt(...annexePoint(-50,2,-15));
   exterior.camera.fov=42;exterior.camera.updateProjectionMatrix();
   buildingGlow.set(buildingSelection.entries.find(entry=>entry.id===id));
   renderer.render(exterior.scene,exterior.camera);buildingGlow.render(exterior.camera);
  },id);
  await page.screenshot({path:`Browser/artifacts/larkton-selection-${id}.png`});
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: compiled Annexe and Larkton/Jodrell highlights render without browser errors.');
}finally{await browser.close();server.kill();}
