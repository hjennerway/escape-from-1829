import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
await mkdir(new URL('./artifacts/',import.meta.url),{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:704},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Production Three.js and its loader are served locally.
 await page.route(/https:\/\/(www\.whateversleft\.co\.uk|basedinchurton\.co\.uk)\//,route=>route.abort());
 const holdGame=route=>route.fulfill({contentType:'text/javascript',body:''});
 await page.route('**/game.mjs',holdGame);
 const shot=name=>page.screenshot({path:fileURLToPath(new URL('./artifacts/'+name+'.jpg',import.meta.url)),type:'jpeg',quality:85});
 for(const [width,height] of [[390,704],[360,640],[320,480],[430,780],[1440,900]]){
  await page.setViewportSize({width,height});await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('#landingPreview img').naturalWidth>0);
  assert(await page.locator('#landingPreview').isVisible());assert(await page.locator('#game').isHidden());
  assert(!/a night in the 1829 building|the corridors remember/i.test(await page.locator('#menu').innerText()));
  const bounds=await page.evaluate(()=>{
   const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};
   return {buttons:['#aerial','#explore','#start'].map(box),credits:box('.credits-link'),brand:box('.brand'),menu:box('#menu h1'),scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight};
  });
  assert(bounds.scrollWidth<=width,'No horizontal scrolling at '+width);
  assert(bounds.scrollHeight<=height,'All actions fit viewport at '+width+'x'+height);
  assert(bounds.menu.top>bounds.brand.bottom,'Title clears brand');
  for(const b of bounds.buttons){assert(b.height>=44);assert(b.left>=0&&b.right<=width);assert(b.bottom<bounds.credits.top,'Credits do not overlap buttons');}
  console.log('PASS: loading placeholder and all buttons fit '+width+'x'+height);
  if(width===390)await shot('landing-mobile-placeholder');
  if(width===320)await shot('landing-small-mobile');
  if(width===1440)await shot('landing-desktop-placeholder');
 }
 // A failed scene keeps the still and leaves the independent aerial/walking actions usable.
 await page.unroute('**/game.mjs',holdGame);
 await page.setViewportSize({width:390,height:704});
 await page.route('**/layout.json',route=>route.abort());
 await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>document.querySelector('#start').textContent.includes('RELOAD TO TRY AGAIN'));
 assert(await page.locator('#landingPreview').isVisible());assert(await page.locator('#game').isHidden());
 assert(await page.locator('#aerial').isEnabled());assert(await page.locator('#explore').isEnabled());
 await page.unroute('**/layout.json');
 // Inspect the actual menu scene, including its batched geometry, after startup.
 const gameSource=await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8');
 await page.route('**/game.mjs',route=>route.fulfill({contentType:'text/javascript',body:gameSource+'\nwindow.landingExterior=()=>exterior;'}));
 await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>document.querySelector('#game').classList.contains('scene-ready'),null,{timeout:120000});
 assert(await page.locator('#landingPreview').isHidden());assert(await page.locator('#game').isVisible());
 assert(await page.locator('#start').isEnabled());await shot('landing-mobile-loaded');
 const periodScene=await page.evaluate(()=>{
  const exterior=window.landingExterior(),visible=object=>{if(!object)return false;for(;object;object=object.parent)if(!object.visible)return false;return true;};
  const roadLabels=[];exterior.layouts.roads.traverse(object=>{if(object.isSprite&&object.userData.roadName)roadLabels.push(object);});
  let towerMeshes=0;exterior.towerBuildings.traverseVisible(object=>{if(object.isMesh)towerMeshes++;});
  return {labels:roadLabels.length,visibleLabels:roadLabels.filter(visible).length,year:exterior.timeline.period.year,tower:visible(exterior.towerBuildings),towerMeshes,annexe:visible(exterior.annexe),main:visible(exterior.mainAdmin),mast:visible(exterior.mast),carPark:visible(exterior.layouts.carPark),laterRoad:visible(exterior.layouts.roads.getObjectByName('Ross Avenue'))};
 });
 assert(periodScene.labels>0);assert.equal(periodScene.visibleLabels,0,'Map labels stay out of the title backdrop');
 assert.equal(periodScene.year,1916);assert(periodScene.tower&&periodScene.towerMeshes>0,'Tower buildings have visible geometry in the menu');
 assert(periodScene.annexe&&periodScene.main,'The 1916 historic estate is present');
 assert(!periodScene.mast&&!periodScene.carPark&&!periodScene.laterRoad,'Later additions are absent');
 await page.setViewportSize({width:1440,height:900});await shot('landing-desktop-loaded');
 assert.deepEqual(errors,[]);
 console.log('PASS: failed loading retains the still; successful first render reveals the 1916 estate with tower buildings.');
}finally{await browser?.close();server.kill();}
