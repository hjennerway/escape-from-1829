import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1366,height:850}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 // Exercise the real gallery and complete catalogue without constructing WebGL.
 await page.route('**/lightbox-test.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/building-photos.css"></head><body><canvas id="game"></canvas><nav id="previewNav"></nav><script type="module">import {bindBuildingPhotos} from "/building-photos.mjs";import {BUILDING_CATALOG} from "/building-catalog.mjs";window.entries=BUILDING_CATALOG.map(e=>({...e}));window.gallery=bindBuildingPhotos({canvas:document.querySelector("canvas"),camera:{},selection:{entries:window.entries,isVisible:()=>true},glow:{set(){}}});</script></body></html>'}));
 await page.goto(base+'/lightbox-test.html');await page.waitForFunction(()=>window.gallery);
 const entries=await page.evaluate(()=>window.entries.map(e=>({id:e.id,photos:[...e.photos,...e.contextPhotos??[]]})));
 let total=0;
 for(const entry of entries){
  await page.evaluate(id=>window.gallery.select(window.entries.find(e=>e.id===id),true),entry.id);
  const buttons=page.locator('#buildingPhotoList .building-photo-open');assert.equal(await buttons.count(),entry.photos.length);
  for(let i=0;i<entry.photos.length;i++){
   await buttons.nth(i).click();assert(await page.locator('#photoLightbox').evaluate(d=>d.open));
   assert.equal(await page.locator('#photoLightbox img').getAttribute('src'),entry.photos[i].src);
   await page.locator('#photoLightbox img').evaluate(img=>img.decode());
   await page.keyboard.press('Escape');assert.equal(await page.locator('#photoLightbox').evaluate(d=>d.open),false);
   assert(await buttons.nth(i).evaluate(b=>b===document.activeElement));assert(await page.locator('#buildingPhotos').isVisible());total++;
  }
 }
 await page.evaluate(()=>window.gallery.select(window.entries.find(e=>e.id==='leighton-newton'),true));
 const first=page.locator('#buildingPhotoList .building-photo-open').first();await first.click();
 const photos=entries.find(e=>e.id==='leighton-newton').photos;
 await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#photoLightbox img').getAttribute('src'),photos.at(-1).src);
 await page.getByRole('button',{name:'Next photograph',exact:true}).click();assert.equal(await page.locator('#photoLightbox img').getAttribute('src'),photos[0].src);
 await page.getByRole('button',{name:'Next photograph',exact:true}).click();assert.equal(await page.locator('#photoLightbox img').getAttribute('src'),photos[1].src);
 await page.getByRole('button',{name:'Previous photograph',exact:true}).click();
 for(let i=0;i<8;i++){await page.keyboard.press('Tab');assert(await page.locator('#photoLightbox').evaluate(d=>d.contains(document.activeElement)));}
 await page.locator('#photoLightbox img').evaluate(img=>img.decode());
 await page.screenshot({path:fileURLToPath(new URL('artifacts/lightbox-desktop.png',import.meta.url))});
 await page.mouse.click(2,2);assert.equal(await page.locator('#photoLightbox').evaluate(d=>d.open),false);
 await page.setViewportSize({width:390,height:844});await first.click();
 await page.locator('#photoLightbox img').evaluate(img=>img.decode());
 assert(await page.locator('.photo-lightbox-content').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}));
 await page.screenshot({path:fileURLToPath(new URL('artifacts/lightbox-mobile.png',import.meta.url))});
 await page.getByRole('button',{name:'Close photograph',exact:true}).click();
 await page.evaluate(()=>window.gallery.select({name:'Single photo',photos:[window.entries[0].photos[0]]},true));
 await page.locator('#buildingPhotoList .building-photo-open').click();assert.equal(await page.getByRole('button',{name:'Next photograph',exact:true}).isVisible(),false);
 await page.keyboard.press('Escape');
 await page.evaluate(()=>{window.gallery.select({name:'Missing photo',photos:[{src:'/missing-photo.webp',caption:'Missing photo'}]},true);document.querySelector('#buildingPhotoList .building-photo-open').click();});
 await page.locator('.photo-lightbox-error').waitFor({state:'visible'});await page.keyboard.press('Escape');
 assert.equal(context.pages().length,1,'Photos never open a new tab');assert.deepEqual(errors,[]);
 console.log('PASS: '+total+' gallery images, context photos, navigation, keyboard focus, closing, mobile layout, single images and missing-image recovery.');
}finally{await browser?.close();server.kill();}
