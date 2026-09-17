import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore'});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch(),body=(await response.text()).replace('function frame(){','window.__aerialTest={renderer,exterior,layouts,controls};\nfunction frame(){');
    await route.fulfill({response,body});
  });
  await page.goto('http://127.0.0.1:1829/aerial.html');
  await page.waitForFunction(()=>window.__aerialTest?.renderer.info.render.frame>3,{},{timeout:90000});
  async function rendered(){
    const frame=await page.evaluate(()=>window.__aerialTest.renderer.info.render.frame);
    await page.waitForFunction(frame=>window.__aerialTest.renderer.info.render.frame>frame+1,frame,{timeout:60000});
  }
  const original=await page.evaluate(()=>window.__aerialTest.exterior.camera.position.toArray());
  await page.keyboard.down('d');await rendered();await page.keyboard.up('d');
  assert.notDeepEqual(await page.evaluate(()=>window.__aerialTest.exterior.camera.position.toArray()),original);
  await page.mouse.move(650,450);await page.mouse.down();await page.mouse.move(740,470,{steps:4});await page.mouse.up();await page.mouse.wheel(0,-100);await rendered();
  for(const [historic,modern] of [[true,true],[false,true],[false,false],[true,false]]){
    await page.locator('#historicLayout').setChecked(historic);await page.locator('#modernLayout').setChecked(modern);await rendered();
    assert.deepEqual(await page.evaluate(()=>window.__aerialTest.layouts.state),{historic,modern});
    assert.equal(await page.evaluate(()=>window.__aerialTest.layouts.shared.visible),historic||modern);
    for(const id of ['historicLayout','modernLayout']){
      await page.locator('#'+id).focus();
      await page.keyboard.press('t');await rendered();
      assert.equal(await page.evaluate(()=>window.__aerialTest.exterior.trees.visible),false,`T must hide trees while ${id} has focus`);
      await page.keyboard.press('t');await rendered();
      assert.equal(await page.evaluate(()=>window.__aerialTest.exterior.trees.visible),true,`T must restore trees while ${id} has focus`);
      assert.equal(await page.evaluate(()=>document.activeElement.id),id,'Tree toggles must preserve keyboard focus');
      assert.deepEqual(await page.evaluate(()=>window.__aerialTest.layouts.state),{historic,modern});
    }
  }
  await page.keyboard.press('t');await rendered();
  assert.equal(await page.evaluate(()=>window.__aerialTest.exterior.trees.visible),false);
  await page.keyboard.press('t');await page.locator('#resetAerial').click();await rendered();
  assert.deepEqual(await page.evaluate(()=>window.__aerialTest.exterior.camera.position.toArray()),original);
  await page.setViewportSize({width:390,height:844});await rendered();
  assert.equal(await page.evaluate(()=>window.__aerialTest.exterior.camera.aspect),390/844);
  const labelSizes=await page.evaluate(()=>{
    const {layouts,exterior}=window.__aerialTest,result=[];
    layouts.roads.traverseVisible(o=>{if(o.isSprite)result.push(o.scale.y/(2*Math.tan(exterior.camera.fov*Math.PI/360))*innerHeight);});
    return result;
  });
  assert(labelSizes.length>0&&labelSizes.every(h=>Math.abs(h-20)<1e-6));
  await page.screenshot({path:'Browser/artifacts/aerial-perf-mobile-after.jpg',quality:85});
  assert.deepEqual(errors,[]);
  console.log('PASS: compiled shaders and live frame loop; keyboard movement, orbit and zoom; all layout combinations; tree toggle; reset; portrait resize and readable road labels; no browser errors.');
}finally{await browser.close();server.kill();}
