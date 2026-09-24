import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1366,height:850}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const html=await readFile(new URL('./dist/aerial.html',import.meta.url),'utf8');
 await page.route('**/aerial.html*',route=>route.fulfill({contentType:'text/html',body:html.replace('function frame(){','window.gallery=buildingPhotos;function frame(){')}));
 await page.goto(base+'/aerial.html');await page.waitForFunction(()=>window.gallery);
 assert.equal(await page.locator('#buildingPhotoPicker').count(),0);
 assert.equal(await page.locator('#buildingPhotos').isVisible(),false);
 for(const [location,id] of [['acton','1829-centre'],['hampton','1829-west'],['barton','1829-east'],['annexe-jarman-photo','tarvin-jarman'],['redesmere','redesmere']]){
  await page.locator('#locationsButton').click();
  await page.locator(`#locationsPanel a[href*="view=${location}&"]`).click();
  await page.waitForFunction(id=>window.gallery?.active?.id===id,id);
  assert(await page.evaluate(()=>window.gallery.pinned));
  assert(await page.locator('#buildingPhotos').isVisible());
  assert.equal(await page.locator('#buildingPhotoPicker').count(),0);
 }
 await page.locator('#closeBuildingPhotos').click();assert.equal(await page.locator('#buildingPhotos').isVisible(),false);
 await page.locator('#locationsButton').click();await page.locator('#locationsPanel a[href*="view=acton&"]').click();
 await page.waitForFunction(()=>window.gallery?.active?.id==='1829-centre');
 await page.locator('#buildingPhotoList img').first().evaluate(img=>img.decode());
 await page.waitForTimeout(1500);await page.screenshot({path:'artifacts/location-selection-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);await page.screenshot({path:'artifacts/location-selection-mobile.png'});
 await page.goto(base+'/aerial.html?view=lamp-post-1');await page.waitForFunction(()=>window.gallery);
 assert.equal(await page.locator('#buildingPhotos').isVisible(),false);
 assert.deepEqual(errors,[]);console.log('PASS: Location selection, aliases, pinned galleries, closing, landscape locations and desktop/mobile layout.');
}finally{await browser?.close();server.kill();}
