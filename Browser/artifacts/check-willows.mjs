import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1280,height:850}});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__willows={renderer,exterior,layouts,controls};\nfunction frame(){')});});
 for(const mode of ['source','compiled']){
  await page.goto(`http://127.0.0.1:1829/aerial.html?view=willows&models=${mode}`);
  await page.waitForFunction(()=>window.__willows?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__willows.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  for(const [historic,modern,label] of [[true,false,'historic'],[false,true,'modern'],[true,true,'both'],[false,false,'neither']]){
   await page.locator('#historicLayout').setChecked(historic);await page.locator('#modernLayout').setChecked(modern);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const state=await page.evaluate(()=>{const {exterior:e,renderer:r}=window.__willows;let visible=true;for(let p=e.willows;p;p=p.parent)visible&&=p.visible;return {mode:e.modelBuild.mode,visible,position:e.willows.position.toArray(),triangles:r.info.render.triangles,calls:r.info.render.calls};});
   assert.equal(state.visible,historic||modern);results.push({mode,label,...state});
   if(label==='historic'||label==='modern')await page.screenshot({path:`Browser/artifacts/willows-${mode}-${label}.png`});
  }
 }
 for(const view of ['willows-photo','willows-plan']){
  await page.goto(`http://127.0.0.1:1829/aerial.html?view=${view}&models=compiled`);await page.waitForFunction(()=>window.__willows?.renderer.info.render.frame>3,null,{timeout:120000});
  await page.screenshot({path:`Browser/artifacts/${view}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:1829/aerial.html?view=willows');await page.waitForFunction(()=>window.__willows?.renderer.info.render.frame>3,null,{timeout:120000});
 await page.screenshot({path:'Browser/artifacts/willows-mobile.png'});
 await page.setViewportSize({width:1280,height:850});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function refreshObstacles(){','window.__walk={exterior,layouts,walker};\nfunction refreshObstacles(){')});});
 await page.goto('http://127.0.0.1:1829/explore.html?view=willows');await page.waitForFunction(()=>window.__walk&&!document.getElementById('look').disabled,null,{timeout:120000});
 await page.screenshot({path:'Browser/artifacts/willows-walk.png'});
 const moved=await page.evaluate(()=>{const {walker,exterior}=window.__walk,before=exterior.camera.position.clone();walker.keys.add('KeyW');walker.update(.1);walker.keys.clear();return exterior.camera.position.distanceTo(before);});assert(moved>.45);
 for(const layout of ['historic','modern']){await page.locator('#historicLayout').setChecked(layout==='historic');await page.locator('#modernLayout').setChecked(layout==='modern');assert(await page.evaluate(()=>window.__walk.exterior.willows.parent.visible));}
 assert.deepEqual(errors,[]);await writeFile('Browser/artifacts/willows-visual-check.json',JSON.stringify({results,errors,walkingDistance:moved},null,2)+'\n');
 console.log('PASS: The Willows source/compiled, Historic/Modern/both/neither, photo/plan, mobile framing and walking UI.');
}finally{await browser.close();}
