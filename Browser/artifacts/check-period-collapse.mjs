import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(resolve=>server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
let browser;
try {
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const view of ['aerial','explore'])for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},hasTouch:mobile,isMobile:mobile});
  await page.goto(`${base}/${view}.html`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#periodSlider').hasAttribute('aria-valuetext'),null,{timeout:120000});
  const panel=page.locator('#layoutControls'),summary=panel.locator('summary'),slider=page.locator('#periodSlider');
  const year=await page.locator('#periodYear').textContent(),expanded=await panel.boundingBox();
  await page.screenshot({path:`Browser/artifacts/period-${view}-${mobile?'mobile':'desktop'}-expanded.png`});
  if(mobile)await summary.tap();else await summary.click();
  assert.equal(await slider.isVisible(),false);
  const collapsed=await panel.boundingBox();assert(collapsed.height<expanded.height/2);assert(collapsed.width<=220);assert(collapsed.x>=0);
  await page.screenshot({path:`Browser/artifacts/period-${view}-${mobile?'mobile':'desktop'}-collapsed.png`});
  await summary.focus();await page.keyboard.press('Enter');assert(await slider.isVisible());
  assert.equal(await page.locator('#periodYear').textContent(),year);
  await page.locator('#nextPeriod').click();assert.notEqual(await page.locator('#periodYear').textContent(),year);
  console.log(view,mobile?'mobile':'desktop',JSON.stringify({expanded,collapsed}));
  await page.close();
 }
}finally{await browser?.close();server.kill();}
