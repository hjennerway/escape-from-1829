import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const mode=process.argv[2]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1000,height:650}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch(),body=(await response.text()).replace(/^function frame\(\).*$/m,
      'function frame(){window.__approach={THREE,renderer,exterior,layouts,buildingDetail};}');
    await route.fulfill({response,body});
  });
  await page.goto(base+'/aerial.html?models='+mode);
  await page.waitForFunction(()=>window.__approach,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__approach.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  for(const layout of ['modern','historic']){
    await page.locator('#historicLayout').setChecked(layout==='historic');
    await page.locator('#modernLayout').setChecked(layout==='modern');
    const state=await page.evaluate(()=>{
      const {THREE,renderer,exterior,layouts,buildingDetail}=window.__approach,{camera}=exterior;
      const p=layouts.countessRoundabout.getObjectByName('Countess roundabout painted centre').getWorldPosition(new THREE.Vector3());
      camera.position.set(p.x-77,67,p.z+23);camera.lookAt(p.x,0,p.z);camera.fov=46;
      camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
      buildingDetail?.update(camera,650);exterior.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
      exterior.invalidateShadows();renderer.render(exterior.scene,camera);
      return layouts.state;
    });
    assert.deepEqual(state,{historic:layout==='historic',modern:layout==='modern'});
    await page.screenshot({path:fileURLToPath(new URL(`roundabout-approach-${mode}-${layout}.png`,import.meta.url))});
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${mode} roundabout approach renders in Modern and Historic toggles with no browser errors.`);
}finally{await browser?.close();server.kill();}
