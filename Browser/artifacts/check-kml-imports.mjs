import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch(),body=(await response.text()).replace(/^function frame\(\).*$/m,
      'function frame(){window.__imports={THREE,renderer,exterior,layouts,buildingDetail};}');
    await route.fulfill({response,body});
  });
  await page.goto(base+'/aerial.html?models=compiled');
  await page.waitForFunction(()=>window.__imports,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__imports.exterior.modelBuild.mode),'compiled');
  for(const layout of ['historic','modern']){
    await page.locator('#historicLayout').setChecked(layout==='historic');
    await page.locator('#modernLayout').setChecked(layout==='modern');
    assert.deepEqual(await page.evaluate(()=>window.__imports.layouts.state),{historic:layout==='historic',modern:layout==='modern'});
    for(const view of ['trees','roundabout']){
      const state=await page.evaluate(view=>{
        const {THREE,renderer,exterior,layouts,buildingDetail}=window.__imports,{camera}=exterior;
        const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
        const mapped=[];exterior.trees.traverse(o=>{if((o.userData.adminPineTree||o.userData.oakTree||o.userData.beechTree)?.species)mapped.push(o);});
        if(view==='trees'){camera.position.set(75,230,-345);camera.lookAt(240,4,-150);}
        else{
          const paint=layouts.countessRoundabout.getObjectByName('Countess roundabout painted centre');
          const p=paint.getWorldPosition(new THREE.Vector3());camera.position.set(p.x-43,62,p.z+57);camera.lookAt(p.x,0,p.z);
        }
        camera.fov=46;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
        buildingDetail?.update(camera,800);exterior.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
        exterior.invalidateShadows();renderer.render(exterior.scene,camera);
        return {mapped:mapped.length,visible:mapped.filter(visible).length,roundabout:visible(layouts.countessRoundabout),triangles:renderer.info.render.triangles};
      },view);
      assert.equal(state.mapped,39);assert.equal(state.visible,39);assert(state.roundabout);
      await page.screenshot({path:new URL(`kml-imports-${view}-${layout}.png`,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
      console.log(layout,view,state);
    }
  }
  await page.keyboard.press('t');
  assert.equal(await page.evaluate(()=>window.__imports.exterior.trees.visible),false);
  await page.keyboard.press('t');
  assert.equal(await page.evaluate(()=>window.__imports.exterior.trees.visible),true);
  assert.deepEqual(errors,[]);
  console.log('PASS: compiled tree imports and Countess roundabout render in both layouts, with working tree toggle and no browser errors.');
}finally{await browser?.close();server.kill();}
