import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1240,height:800}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    const body=(await response.text()).replace(/^function frame\(\).*$/m,
      'window.__carParkPreview={THREE,renderer,exterior,layouts,updateRoadLabels};function frame(){}');
    await route.fulfill({response,body});
  });
  await page.goto('http://127.0.0.1:1829/aerial.html?view=church');
  await page.waitForFunction(()=>window.__carParkPreview,{},{timeout:120000});
  await page.evaluate(()=>{
    const {exterior}=window.__carParkPreview;
    exterior.camera.position.set(-105,235,-305);exterior.camera.lookAt(85,0,-77);
    exterior.camera.fov=42;exterior.camera.updateProjectionMatrix();exterior.scene.fog.density=0;
  });
  for(const modern of [true,false]){
    await page.locator('#historicLayout').setChecked(!modern);
    await page.locator('#modernLayout').setChecked(modern);
    const state=await page.evaluate(()=>{
      const {renderer,exterior,layouts,updateRoadLabels}=window.__carParkPreview;
      updateRoadLabels(window.__carParkPreview.THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);
      renderer.render(exterior.scene,exterior.camera);
      return {modern:layouts.modern.visible,trees:layouts.carParkTrees.visible};
    });
    assert.deepEqual(state,{modern,trees:!modern});
    await page.screenshot({path:`Browser/artifacts/car-park-${modern?'modern':'historic'}.png`});
  }
  await page.locator('#historicLayout').setChecked(false);await page.locator('#modernLayout').setChecked(true);
  await page.evaluate(()=>{
    const {renderer,exterior}=window.__carParkPreview;
    exterior.camera.position.set(87,320,-76.99);exterior.camera.lookAt(87,0,-77);
    renderer.render(exterior.scene,exterior.camera);
  });
  await page.screenshot({path:'Browser/artifacts/car-park-plan.png'});
  assert.deepEqual(errors,[]);console.log('PASS: Modern and Historic browser toggles and rendered aerial/plan views, no browser errors.');
}finally{await browser.close();}
