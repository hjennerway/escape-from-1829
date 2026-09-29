import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {EARTH_ANCHOR} from '../dist/earth-registration.mjs';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const x=13,z=47.8,dx=x-EARTH_ANCHOR.x,dz=z-EARTH_ANCHOR.z,length=Math.hypot(.55,.835);
const geolocation={latitude:EARTH_ANCHOR.latitude+(.835*dx+.55*dz)/length/111320,
  longitude:EARTH_ANCHOR.longitude+(-.55*dx+.835*dz)/length/(111320*Math.cos(EARTH_ANCHOR.latitude*Math.PI/180)),accuracy:5};
let browser;const errors=[],report={};
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:1200,height:760},reducedMotion:'reduce',permissions:['geolocation'],geolocation});
  const page=await context.newPage();page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__pillar={exterior,renderer,controls,deviceLocationMarker};function frame(){')});});
  async function shot(name){
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:fileURLToPath(new URL('location-pillar-'+name+'.png',import.meta.url))});
  }
  for(const mode of ['source','compiled']){
    await page.goto(base+'/aerial.html?models='+mode);
    await page.waitForFunction(()=>window.__pillar?.renderer.info.render.frame>3);
    // Software WebGL hides trees initially; enable them for the canopy check.
    if(!await page.evaluate(()=>window.__pillar.exterior.trees.visible))await page.keyboard.press('t');
    await page.locator('#deviceLocationButton').click();
    await page.waitForFunction(()=>document.getElementById('deviceLocationStatus').textContent.includes('pillar of light'));
    report[mode]=await page.evaluate(()=>{
      const {exterior}=window.__pillar,marker=exterior.scene.getObjectByName('Device location marker'),beam=marker.getObjectByName('Device location light pillar');
      return {mode:exterior.modelBuild.mode,treesVisible:exterior.trees.visible,position:marker.position.toArray(),visible:marker.visible,
        beamHeight:beam.scale.y,depthTest:beam.material.depthTest,depthWrite:beam.material.depthWrite};
    });
    assert.equal(report[mode].mode,mode==='source'?'procedural':'compiled');
    assert(report[mode].treesVisible);
    assert(report[mode].visible);assert(Math.abs(report[mode].position[0]-x)<1e-6);assert(Math.abs(report[mode].position[2]-z)<1e-6);
    assert(report[mode].beamHeight>=180);assert.equal(report[mode].depthTest,false);assert.equal(report[mode].depthWrite,false);
    await shot(mode+'-day');
    console.log(mode+' marker verified beneath the front lawn canopy.');
  }
  await page.evaluate(()=>{const {exterior,controls}=window.__pillar;exterior.camera.position.set(13,330,48);exterior.camera.lookAt(13,0,47.8);controls.sync([13,0,47.8]);});
  await shot('plan');
  await page.locator('#deviceLocationButton').click();
  await page.locator('[data-lighting="night"]').click();await shot('night');
  await page.locator('[data-lighting="day"]').click();
  await page.setViewportSize({width:390,height:844});
  await page.locator('#deviceLocationButton').click();await shot('mobile');
  await page.locator('#periodSlider').fill('12');await shot('mobile-2021');
  assert(await page.evaluate(()=>window.__pillar.exterior.scene.getObjectByName('Device location marker').visible));
  await context.setGeolocation({latitude:51.5074,longitude:-.1278});
  await page.locator('#deviceLocationButton').click();
  await page.waitForFunction(()=>document.getElementById('deviceLocationStatus').textContent.includes('only works near'));
  assert.equal(await page.evaluate(()=>window.__pillar.exterior.scene.getObjectByName('Device location marker').visible),false);
  assert.deepEqual(errors,[]);report.errors=errors;
  await writeFile(new URL('location-pillar-review.json',import.meta.url),JSON.stringify(report,null,2));
  console.log('PASS: source/compiled location pillar, mobile, plan, night, period changes and stale fix removal.');
}finally{await browser?.close();server.kill();}
