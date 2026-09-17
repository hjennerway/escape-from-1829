import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const port=1832,server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch(),body=(await response.text()).replace('function frame(){','window.__buildingTest={renderer,exterior,layouts,controls,buildingDetail};\nfunction frame(){');
    await route.fulfill({response,body});
  });
  async function load(query=''){await page.goto(`http://127.0.0.1:${port}/aerial.html${query}`);await page.waitForFunction(()=>window.__buildingTest?.renderer.info.render.frame>3,{},{timeout:90000});}
  async function rendered(){const frame=await page.evaluate(()=>window.__buildingTest.renderer.info.render.frame);await page.waitForFunction(frame=>window.__buildingTest.renderer.info.render.frame>frame+1,frame,{timeout:60000});}
  await load();
  assert(await page.evaluate(()=>window.__buildingTest.buildingDetail.entries.some(e=>e.level>0)));
  const original=await page.evaluate(()=>window.__buildingTest.exterior.camera.position.toArray());
  await page.keyboard.down('d');await rendered();await page.keyboard.up('d');
  assert.notDeepEqual(await page.evaluate(()=>window.__buildingTest.exterior.camera.position.toArray()),original);
  await page.mouse.move(650,450);await page.mouse.down();await page.mouse.move(730,480,{steps:4});await page.mouse.up();await page.mouse.wheel(0,-120);await rendered();
  for(const [historic,modern] of [[true,true],[false,true],[false,false],[true,false]]){
    await page.locator('#historicLayout').setChecked(historic);await page.locator('#modernLayout').setChecked(modern);await rendered();
    assert.deepEqual(await page.evaluate(()=>window.__buildingTest.layouts.state),{historic,modern});
    assert.equal(await page.evaluate(()=>window.__buildingTest.layouts.shared.visible),historic||modern);
  }
  await page.keyboard.press('t');await rendered();assert.equal(await page.evaluate(()=>window.__buildingTest.exterior.trees.visible),false);
  await page.keyboard.press('t');await page.locator('#resetAerial').click();await rendered();
  assert.deepEqual(await page.evaluate(()=>window.__buildingTest.exterior.camera.position.toArray()),original);
  await load('?view=front');
  assert.equal(await page.evaluate(()=>window.__buildingTest.buildingDetail.entries.find(e=>e.parent===window.__buildingTest.layouts.shared).level),0);
  await page.setViewportSize({width:390,height:844});await rendered();
  await page.locator('#fitLayouts').click();await rendered();
  assert.equal(await page.evaluate(()=>window.__buildingTest.exterior.camera.aspect),390/844);
  assert(await page.evaluate(()=>window.__buildingTest.buildingDetail.entries.some(e=>e.level===2)));
  await page.screenshot({path:'Browser/artifacts/building-detail-mobile-auto.jpg',quality:90});
  await load('?view=front&buildingDetail=full');assert.equal(await page.evaluate(()=>window.__buildingTest.buildingDetail),null);
  assert.deepEqual(errors,[]);
  console.log('PASS: live automatic building detail, shaders, camera movement/orbit/zoom, layouts, trees, reset, close detail restoration, portrait resize/fit and full-detail fallback; no browser errors.');
}finally{await browser.close();server.kill();}
