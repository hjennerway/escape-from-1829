import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,
  env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{
  server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));
  server.once('error',reject);
});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,
    args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1240,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('function frame(){',
      'window.__outline={exterior,layouts,renderer,controls,THREE};function frame(){')});
  });
  for(const mode of ['source','compiled']){
    await page.goto(base+'/aerial.html?view=plan&period=2010&models='+mode);
    await page.waitForFunction(()=>window.__outline?.renderer.info.render.frame>3,null,{timeout:120000});
    assert.equal(await page.evaluate(()=>window.__outline.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
    await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
    await page.evaluate(()=>{
      const {exterior,controls}=window.__outline;
      exterior.scene.fog.density=0;
      exterior.camera.position.set(240,260,205);exterior.camera.lookAt(50,0,-80);
      exterior.camera.fov=42;exterior.camera.updateProjectionMatrix();controls.sync([50,0,-80]);
    });
    const visibility=await page.evaluate(()=>{
      const {exterior,layouts}=window.__outline,edge=layouts.carPark.getObjectByName('Car park border');
      const visible=object=>{for(;object;object=object.parent)if(!object.visible)return false;return true;};
      const results=[];
      for(const year of [1938,2010,2016,2021,1938,2010]){
        exterior.timeline.setPeriod(year);results.push([year,visible(layouts.carPark),visible(edge)]);
      }
      return results;
    });
    for(const [year,surface,edge] of visibility){assert.equal(surface,year>=2010);assert.equal(edge,surface);}
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:fileURLToPath(new URL('car-park-outline-'+mode+'.png',import.meta.url))});
    if(mode==='source'){
      await page.evaluate(()=>{
        const {exterior,controls}=window.__outline;
        exterior.camera.position.set(60,380,-74.99);exterior.camera.lookAt(60,0,-75);controls.sync([60,0,-75]);
      });
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.screenshot({path:fileURLToPath(new URL('car-park-outline-plan.png',import.meta.url))});
    }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: matching source/compiled car park outlines and period visibility, with no browser errors.');
}finally{await browser?.close();server.kill();}
