import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const port=1834,server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
async function setup(context,query='?models=source'){
 const page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 await page.route('**/favicon.ico',route=>route.fulfill({status:204}));
 page.on('console',msg=>{if(msg.type()==='error'){errors.push(msg.text());console.error(msg.text());}});
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();const body=(await response.text()).replace('function frame(){','window.__photosTest={renderer,exterior,layouts,controls,buildingSelection,buildingPhotos,buildingGlow};\nfunction frame(){');await route.fulfill({response,body});});
 await page.goto(`http://127.0.0.1:${port}/aerial.html${query}`);await page.waitForFunction(()=>window.__photosTest?.renderer.info.render.frame>3,{},{timeout:90000});return page;
}
async function frameBuilding(page,id){
 return page.evaluate(id=>{
  const t=window.__photosTest,e=t.buildingSelection.entries.find(e=>e.id===id),b=e.mesh.geometry.boundingBox,p=b.min.clone().add(b.max).multiplyScalar(.5);
  t.buildingPhotos.close();t.exterior.camera.position.copy(p).add({x:24,y:100,z:125});t.exterior.camera.lookAt(p);t.exterior.camera.updateMatrixWorld();t.controls.sync([p.x,p.y,p.z]);
  // Search only the central canvas, avoiding fixed UI overlays.
  const rect=document.getElementById('game').getBoundingClientRect();
  for(let y=rect.height*.3;y<rect.height*.55;y+=5)for(let x=rect.width*.35;x<rect.width*.78;x+=5)if(t.buildingSelection.pick(x,y,rect,t.exterior.camera)?.id===id)return {x,y};
  throw new Error('No projected point for '+id);
 },id);
}
try{
 const desktop=await browser.newContext({viewport:{width:1300,height:900}}),page=await setup(desktop);
 const point=await frameBuilding(page,'tower');
 await page.screenshot({path:'Browser/artifacts/building-photos-before.png'});
 await page.mouse.move(point.x,point.y);await page.waitForFunction(()=>window.__photosTest.buildingPhotos.active?.id==='tower');
 await page.locator('#buildingPhotoList img').first().waitFor();await page.waitForFunction(()=>document.querySelector('#buildingPhotoList img')?.naturalWidth>0);
 assert.equal(await page.locator('#buildingPhotoTitle').textContent(),'Water Tower');assert.equal(await page.locator('#buildingPhotoList img').count(),4);
 await page.screenshot({path:'Browser/artifacts/building-photos-desktop.png'});
 // The panel remains usable after moving off the building; scrolling belongs
 // to the photo list, not the camera's wheel handler.
 const cameraBefore=await page.evaluate(()=>window.__photosTest.exterior.camera.position.toArray());
 await page.locator('#buildingPhotoList').hover();await page.mouse.wheel(0,600);await page.waitForFunction(()=>document.getElementById('buildingPhotoList').scrollTop>0);
 assert.deepEqual(await page.evaluate(()=>window.__photosTest.exterior.camera.position.toArray()),cameraBefore);
 await page.keyboard.press('Escape');assert(await page.locator('#buildingPhotos').isHidden());
 const dragPoint=await frameBuilding(page,'tower');await page.mouse.move(800,720);await page.mouse.down();await page.mouse.move(dragPoint.x,dragPoint.y,{steps:5});await page.mouse.up();assert(await page.locator('#buildingPhotos').isHidden());
 // Keyboard selection works without needing a pointer on the map.
 await page.locator('#buildingPhotoPicker summary').focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'Main kitchen',exact:true}).focus();await page.keyboard.press('Enter');
 assert.match(await page.locator('#buildingPhotoList').textContent(),/No photographs/);
 await page.locator('#historicLayout').uncheck();await page.waitForFunction(()=>!window.__photosTest.buildingPhotos.active);assert(await page.locator('#buildingPhotos').isHidden());
 await page.locator('#modernLayout').check();await page.locator('#buildingPhotoPicker summary').click();await page.waitForFunction(()=>[...document.querySelectorAll('.building-photo-choices button')].find(b=>b.textContent==='Main kitchen').disabled);await page.keyboard.press('Escape');
 console.log('Desktop checks passed.');await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}),phone=await setup(mobile);
 let mobilePoint=await frameBuilding(phone,'tower');await phone.touchscreen.tap(mobilePoint.x,mobilePoint.y);await phone.waitForFunction(()=>window.__photosTest.buildingPhotos.active?.id==='tower');
 assert(await phone.evaluate(()=>window.__photosTest.buildingPhotos.pinned));
 await phone.waitForFunction(()=>document.querySelector('#buildingPhotoList img')?.naturalWidth>0);
 const panelBox=await phone.locator('#buildingPhotos').boundingBox();assert(panelBox.x>=0&&panelBox.x+panelBox.width<=390&&panelBox.y+panelBox.height<=844);
 await phone.screenshot({path:'Browser/artifacts/building-photos-mobile.png'});
 const mobileCamera=await phone.evaluate(()=>window.__photosTest.exterior.camera.position.toArray());
 // Native touch scroll and pinch via CDP exercise the real pointer handlers.
 const cdp=await mobile.newCDPSession(phone),scrollX=180,scrollY=panelBox.y+panelBox.height-65;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:scrollX,y:scrollY,id:1}]});
 for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:scrollX,y:scrollY-i*25,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await phone.waitForFunction(()=>document.getElementById('buildingPhotoList').scrollTop>0);
 assert.deepEqual(await phone.evaluate(()=>window.__photosTest.exterior.camera.position.toArray()),mobileCamera);
 await phone.locator('#closeBuildingPhotos').tap();assert(await phone.locator('#buildingPhotos').isHidden());
 mobilePoint=await frameBuilding(phone,'tower');
 const x=mobilePoint.x,y=mobilePoint.y;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-25,y,id:1},{x:x+25,y,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-50,y:y-10,id:1},{x:x+50,y:y+10,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(await phone.locator('#buildingPhotos').isHidden(),'Pinching never selects a building');
 assert.notDeepEqual(await phone.evaluate(()=>window.__photosTest.exterior.camera.position.toArray()),mobileCamera,'Pinch still navigates');
 assert.deepEqual(errors,[]);
 console.log('PASS: desktop hover/glow/photos/scroll, keyboard access, drag suppression, layout changes, mobile tap/native scroll/pinch and responsive panel; no browser errors.');
}finally{await browser.close();server.kill();}
