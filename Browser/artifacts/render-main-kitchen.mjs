import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fit=JSON.parse(readFileSync('Browser/artifacts/main-kitchen-fit.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:613,height:515}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__kitchenPreview={THREE,renderer,exterior,layouts,updateRoadLabels};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?view=main-kitchen');
 await page.waitForFunction(()=>window.__kitchenPreview);
 await page.evaluate(p=>{
  const {THREE,exterior,renderer}=window.__kitchenPreview,camera=exterior.camera;
  const [x,y,z,a,b,f,cx,cy]=p;
  camera.position.set(x,y,z);camera.lookAt(x-Math.sin(a)*Math.cos(b),y-Math.sin(b),z-Math.cos(a)*Math.cos(b));
  camera.fov=2*Math.atan(515/(2*f))*180/Math.PI;camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[8]=1-2*cx/613;camera.projectionMatrix.elements[9]=2*cy/515-1;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  exterior.scene.fog.density=0;exterior.invalidateShadows();renderer.render(exterior.scene,camera);
 },fit.parameters);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 await page.screenshot({path:`Browser/artifacts/main-kitchen-${process.argv[2]??'after'}.png`});
 if(process.argv[2]!=='before'){
  await page.setViewportSize({width:1100,height:780});
  for(const view of ['main-kitchen','main-kitchen-plan','main-kitchen-roofs']){
   await page.goto('http://127.0.0.1:1829/aerial.html?view='+view);
   await page.waitForFunction(()=>window.__kitchenPreview);
   await page.evaluate(()=>{const {renderer,exterior}=window.__kitchenPreview;renderer.render(exterior.scene,exterior.camera);});
   await page.screenshot({path:`Browser/artifacts/${view}-view.png`});
  }
  await page.getByRole('button',{name:'Locations',exact:true}).click();
  await page.getByRole('link',{name:'Main kitchen',exact:true}).click();
  await page.waitForURL('**/aerial.html?view=main-kitchen');
  await page.waitForFunction(()=>window.__kitchenPreview);
  await page.getByRole('link',{name:'ROOFS',exact:true}).click();
  await page.waitForURL('**/aerial.html?view=main-kitchen-roofs');
  await page.getByRole('link',{name:'WALK HERE',exact:true}).click();
  await page.waitForURL('**/explore.html?view=main-kitchen');
  await page.waitForFunction(()=>document.getElementById('look')?.textContent==='START EXPLORING ↗'&&!document.getElementById('look').disabled);
  await page.screenshot({path:'Browser/artifacts/main-kitchen-walk-view.png'});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: kitchen reference render, no browser errors.');
}finally{await browser.close();}
