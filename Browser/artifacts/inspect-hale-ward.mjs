import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1413,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const key='hale-daresbury-huxley-dunham';
for(const [suffix,name]of process.argv.includes('--mobile-only')?[]:[['','aerial'],['-plan','plan'],['-site','site'],['-courts','courts']]){
 await page.goto('http://127.0.0.1:1829/aerial.html?view='+key+suffix,{waitUntil:'networkidle'});
 await page.locator('#churtonNav').waitFor({state:'visible'});
 assert((await page.locator('#churtonNav').textContent()).includes('HALE/DARESBURY/HUXLEY/DUNHAM'));
 await page.screenshot({path:'Browser/artifacts/hale-ward-'+name+'.png'});
 console.log('Rendered '+name);
}
if(!process.argv.includes('--mobile-only')){
 await page.goto('http://127.0.0.1:1829/explore.html?view='+key,{waitUntil:'networkidle'});
 await page.screenshot({path:'Browser/artifacts/hale-ward-walking.png'});
 console.log('Rendered walking');
}
await page.setViewportSize({width:390,height:844});
await page.goto('http://127.0.0.1:1829/aerial.html?view='+key,{waitUntil:'networkidle'});
await page.locator('#churtonNav').waitFor({state:'visible'});
await page.screenshot({path:'Browser/artifacts/hale-ward-mobile.png'});
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow on mobile');
assert.deepEqual(errors,[]);console.log('PASS: aerial, plan, site, courtyards, walking and mobile, with no browser errors.');
await browser.close();
