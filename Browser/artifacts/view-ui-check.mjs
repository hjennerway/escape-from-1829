import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {chromium} from '../node_modules/playwright/index.mjs';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const report=[],errors=[];
try{
 browser=await chromium.launch({headless:true,channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const mode of ['aerial','explore']){
  const page=await browser.newPage({viewport:{width:1200,height:800},hasTouch:mode==='explore',isMobile:mode==='explore',deviceScaleFactor:1});
  page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__ui={renderer,buildingPhotos,buildingSelection};function frame(){')});});
  await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__ui={renderer};const clock=new THREE.Timer();')});});
  await page.goto(`${base}/${mode}.html`,{timeout:120000});await page.waitForFunction(()=>window.__ui?.renderer.info.render.frame>3);
  for(const [width,height] of [[1200,800],[650,800],[431,800],[430,800],[390,844],[320,568],[568,320],[844,390]]){
   await page.setViewportSize({width,height});
   const state=await page.evaluate(()=>{
    const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const selectors=['#backToIntro','#deviceLocationButton','#dayNightToggle','#locationsButton','#resetAerial','#periodSlider','#walkTouch button'];
    const controls=selectors.flatMap(selector=>[...document.querySelectorAll(selector)].filter(el=>el.getClientRects().length).map(el=>({id:el.id||el.getAttribute('aria-label'),...rect(el),reachable:el.contains(document.elementFromPoint(rect(el).x+rect(el).width/2,rect(el).y+rect(el).height/2))})));
    return {controls,nav:rect(document.querySelector('nav')),order:[...document.querySelectorAll('.view-actions button')].map(el=>el.id||el.dataset.lighting),panelRadius:getComputedStyle(document.querySelector('#layoutControls')).borderRadius};
   });
   for(const c of state.controls){assert(c.x>=0&&c.y>=0&&c.right<=width+.5&&c.bottom<=height+.5,`${mode} ${width}x${height}: ${c.id} within viewport ${JSON.stringify(c)}`);assert(c.reachable,`${mode} ${width}x${height}: ${c.id} reachable`);}
   assert.equal(state.panelRadius,'4px');
   if(mode==='explore'&&width<500){
    const timeline=await page.locator('#layoutControls').boundingBox(),guide=await page.locator('.explore-guide').boundingBox();
    assert(timeline.y+timeline.height+4<=guide.y,'Timeline clears the walking instructions');
   }
   if(mode==='aerial'){
    assert.deepEqual(state.order.slice(0,6),['deviceLocationButton','day','dusk','night','locationsButton','resetAerial']);
    const gps=state.controls.find(c=>c.id==='deviceLocationButton'),light=state.controls.find(c=>c.id==='dayNightToggle');
    assert.equal(gps.y,light.y);assert.equal(light.x-gps.right,8);
   }
   await page.locator('#locationsButton').click();
   const menu=await page.locator('#locationsPanel').boundingBox();assert(menu.y>=state.nav.bottom,`${mode} ${width}: menu clears navigation`);assert(menu.y+menu.height<=height,`${mode} ${width}: menu fits`);
   await page.keyboard.press('Escape');assert(await page.locator('#locationsPanel').isHidden());
   await page.locator('#locationsButton').evaluate(el=>el.blur());
   if([1200,390,320,568].includes(width))await page.screenshot({path:fileURLToPath(new URL(`view-ui-${mode}-${width}.png`,import.meta.url))});
   report.push({mode,width,height,...state});console.log(`PASS ${mode} ${width}x${height}`);
  }
  await page.setViewportSize({width:1200,height:800});
  await page.locator('[data-lighting="dusk"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-lighting="dusk"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-lighting="day"]').click();
  if(mode==='aerial'){
   await page.locator('#resetAerial').click();
   await page.evaluate(()=>{const u=window.__ui;u.buildingPhotos.select(u.buildingSelection.entries.find(e=>e.id==='1829-centre'),true);});
   await page.locator('#buildingPhotoList img').first().evaluate(img=>img.decode());
   await page.screenshot({path:fileURLToPath(new URL('view-ui-photos.png',import.meta.url))});
   assert.equal(await page.locator('#buildingPhotos').evaluate(el=>getComputedStyle(el).borderRadius),'4px');
   await page.locator('#buildingPhotoList .building-photo-open').first().click();
   await page.locator('#photoLightbox img').evaluate(img=>img.decode());
   await page.screenshot({path:fileURLToPath(new URL('view-ui-lightbox.png',import.meta.url))});
   assert.equal(await page.locator('.photo-lightbox-content').evaluate(el=>getComputedStyle(el).borderRadius),'4px');
   await page.keyboard.press('Escape');await page.locator('#closeBuildingPhotos').click();
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('view-ui-report.json',import.meta.url),JSON.stringify(report,null,2));
 console.log('PASS: shared styling, responsive order, reachable controls, menus, lighting, reset and photo panels.');
}finally{await browser?.close();server.kill();}
