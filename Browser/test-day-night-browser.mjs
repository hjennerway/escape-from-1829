import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {PERIODS} from './dist/estate-periods.mjs';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const errors=[],report={};
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:760}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__night={exterior,renderer,lighting,controls};function frame(){')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('  const clock=new THREE.Clock();','  window.__night={exterior,renderer,lighting,walker};const clock=new THREE.Clock();')});});
 await mkdir(new URL('./artifacts/',import.meta.url),{recursive:true});
 async function shot(name){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:new URL('./artifacts/day-night-'+name+'.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});}
 for(const mode of (process.env.DAY_NIGHT_UI_ONLY?[]:process.env.DAY_NIGHT_SOURCE_ONLY?['source']:['source','compiled'])){
  await page.goto(base+'/aerial.html?models='+mode);await page.waitForFunction(()=>window.__night?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__night.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  console.log('Checking '+mode+' day/night and all periods');
  const button=page.locator('#dayNightToggle');assert.equal(await button.getAttribute('aria-pressed'),'false');
  await shot(mode+'-day');await button.click();await page.waitForFunction(()=>window.__night.lighting.pools.count>0);await shot(mode+'-night');
  const counts=[];
  for(let i=0;i<PERIODS.length;i++){
   await page.locator('#periodSlider').fill(String(i));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));
   counts.push(await page.evaluate(()=>{const {lighting}=window.__night;return {year:window.__night.exterior.timeline.period.year,lamps:lighting.pools.count,night:lighting.night};}));
   assert(counts[i].lamps>20&&counts[i].night);
  }
  report[mode]=counts;
  await shot(mode+'-2021');await page.locator('#resetAerial').click();assert.equal(await button.getAttribute('aria-pressed'),'true');
  await page.locator('#periodSlider').fill('8');
  await page.evaluate(()=>{const {exterior,controls}=window.__night;exterior.camera.position.set(320,24,-147);exterior.camera.lookAt(350,0,-96);controls.sync([350,0,-96]);});await shot(mode+'-road');
  await button.click();assert.equal(await page.evaluate(()=>window.__night.lighting.lights.every(l=>l.intensity===0)),true);
 }
 if(report.compiled)assert.deepEqual(report.compiled,report.source);
 for(const width of [320,390,1200]){
  await page.setViewportSize({width,height:760});await page.goto(base+'/explore.html?view=front');await page.waitForFunction(()=>window.__night?.renderer.info.render.frame>3);
  assert.equal(await page.locator('#dayNightToggle').getAttribute('aria-pressed'),'false');await page.locator('#dayNightToggle').click();
  await shot('explore-'+width);
  if(width<=390){const toggle=await page.locator('#dayNightToggle').boundingBox(),panel=await page.locator('#layoutControls').boundingBox();assert(toggle.y+toggle.height<=panel.y,'Phone controls clear the timeline');}
  if(width===1200){await page.evaluate(()=>{const {lighting,walker}=window.__night;const lamp=lighting.lamps.filter(l=>l.visible).sort((a,b)=>Math.hypot(a.position.x,a.position.z-65)-Math.hypot(b.position.x,b.position.z-65))[0];const p=lamp.position;walker.setView({position:[p.x+8,1.8,p.z+11],target:[p.x,4,p.z]});});await shot('explore-lamp');}await page.locator('#periodSlider').fill('0');await page.locator('#periodSlider').fill('12');
  const bounds=await page.locator('#dayNightToggle').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width&&bounds.height>=44);
  await page.locator('#dayNightToggle').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#dayNightToggle').getAttribute('aria-pressed'),'false');
 }
 await page.setViewportSize({width:320,height:760});await page.goto(base+'/aerial.html?models=source');await page.waitForFunction(()=>window.__night?.renderer.info.render.frame>3);await page.locator('#dayNightToggle').click();await shot('aerial-mobile');
 for(const id of ['backToIntro','dayNightToggle','deviceLocationButton','locationsButton','resetAerial']){const b=await page.locator('#'+id).boundingBox();assert(b.x>=0&&b.x+b.width<=320,id+' stays on the phone screen');}
 assert.deepEqual(errors,[]);if(!process.env.DAY_NIGHT_UI_ONLY)await writeFile(new URL('./artifacts/day-night-report.json',import.meta.url),JSON.stringify(report,null,2));console.log('PASS: desktop/mobile sun and moon controls, keyboard toggling and night previews without browser errors.'+(report.compiled?' Every period matches between source and compiled models.':''));
}finally{await browser?.close();server.kill();}
