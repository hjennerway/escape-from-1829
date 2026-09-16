import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:process.argv.includes('--portrait')?{width:390,height:844}:{width:1100,height:825}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/aerial.html*',async route=>{
 const response=await route.fetch();
 await route.fulfill({response,body:(await response.text()).replace('const controls=createAerialControls','window.pharmacyPreview={THREE,exterior,layouts};const controls=createAerialControls')});
});
const pageName=process.argv.includes('--walk')?'explore':'aerial';
await page.goto('http://127.0.0.1:1829/'+pageName+'.html?view='+ (process.argv[2]??'pharmacy'),{waitUntil:'networkidle'});
if(process.argv[3]?.startsWith('{'))await page.evaluate(shot=>{const {exterior}=window.pharmacyPreview;exterior.camera.position.set(...shot.position);exterior.camera.lookAt(...shot.target);exterior.camera.fov=shot.fov;exterior.camera.updateProjectionMatrix();},JSON.parse(process.argv[3]));
await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
await page.locator('#game').screenshot({path:fileURLToPath(new URL('./'+(process.argv[2]??'pharmacy')+(process.argv.includes('--portrait')?'-portrait':'')+(process.argv.includes('--walk')?'-walk':'')+'.png',import.meta.url))});
console.log(JSON.stringify({errors,view:process.argv[2]??'tower-buildings'}));
await browser.close();
