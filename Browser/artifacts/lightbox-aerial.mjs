import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1366,height:850}}),errors=[];page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__photos={exterior,renderer,controls,buildingPhotos};function frame(){')});});
 const mode=process.argv.includes('--compiled')?'compiled':'source';
 await page.goto(base+'/aerial.html?models='+mode+'&view=leighton-newton');await page.waitForFunction(()=>window.__photos?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__photos.exterior.modelBuild.mode),mode==='compiled'?'compiled':'procedural');
 await page.locator('#buildingPhotoPicker summary').click();await page.getByRole('button',{name:'Annexe · Leighton / Newton Ward',exact:true}).click();
 await page.locator('#buildingPhotoList .building-photo-open').first().click();await page.locator('#photoLightbox img').evaluate(img=>img.decode());
 const pose=await page.evaluate(()=>window.__photos.exterior.camera.position.toArray());
 await page.keyboard.down('w');await page.keyboard.press('t');await page.evaluate(()=>new Promise(resolve=>{let n=0;function frame(){if(++n===4)resolve();else requestAnimationFrame(frame);}requestAnimationFrame(frame);}));await page.keyboard.up('w');
 assert.deepEqual(await page.evaluate(()=>window.__photos.exterior.camera.position.toArray()),pose,'The map stays still while the lightbox is open');
 await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'photo-lightbox-next');
 await page.screenshot({path:fileURLToPath(new URL('lightbox-aerial-desktop.png',import.meta.url))});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:fileURLToPath(new URL('lightbox-aerial-mobile.png',import.meta.url))});
 await page.keyboard.press('Escape');assert(await page.locator('#buildingPhotos').isVisible());assert.equal(await page.locator('#photoLightbox').evaluate(d=>d.open),false);
 assert.deepEqual(errors,[]);assert.equal(page.context().pages().length,1);console.log('PASS: actual aerial gallery, keyboard isolation, focus, mobile layout, dismissal and no popups.');
}finally{await browser?.close();server.kill();}
