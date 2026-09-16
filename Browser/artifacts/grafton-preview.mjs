import {createRequire} from 'node:module';
const require=createRequire('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1413,height:700}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const view of ['grafton-edge-photo']){
 await page.goto('http://127.0.0.1:1829/aerial.html?view='+view,{waitUntil:'networkidle'});
 await page.locator('#game').screenshot({path:'Browser/artifacts/'+view+'.png'});
 console.log(JSON.stringify({view,errors,location:await page.locator('a[href="?view=grafton-edge"]').count()}));
}
await page.goto('http://127.0.0.1:1829/explore.html?view=grafton-edge',{waitUntil:'networkidle'});
await page.locator('#game').screenshot({path:'Browser/artifacts/grafton-edge-walking.png'});
console.log(JSON.stringify({walking:true,errors}));
await browser.close();


