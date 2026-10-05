import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const destination=new URL('./artifacts/developer-options/',import.meta.url);await mkdir(destination,{recursive:true});
let browser;const results=[];
try{
 browser=await launchHardwareBrowser();
 for(const [width,height] of [[1200,800],[320,844]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'}),errors=[],requests=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requests.push(request.url()));
  page.on('console',message=>{if(message.type()==='error'&&/Error|THREE|WebGL|shader/.test(message.text()))errors.push(message.text());});
  // Old saved settings must never reveal shortcuts on a new page.
  await page.addInitScript(()=>sessionStorage.setItem('1829-developer-options',JSON.stringify({revealed:true,enabled:true,staircases:true,mapRevealed:true})));
  await page.route(/https:\/\/(www\.whateversleft\.co\.uk|basedinchurton\.co\.uk)\//,route=>route.abort());
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.devTest={exterior,renderer,controls,developer};function frame(){')});});
  await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.devTest={exterior,renderer,walker,input,developer};const clock=new THREE.Timer();')});});
  async function ready(){
   try{
    await page.waitForFunction(()=>window.devTest?.renderer.info.render.frame>2||document.getElementById('lookHint')?.textContent.includes('could not load'));
    assert(await page.evaluate(()=>window.devTest?.renderer.info.render.frame>2),'The view must initialize successfully');
   }catch(error){console.error({url:page.url(),errors,status:await page.locator('#lookHint').textContent().catch(()=>null)});throw error;}
  }
  async function overlayReady(){await page.waitForFunction(()=>window.devTest?.developer.overlay&&window.devTest.developer.staircases);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
  async function shot(name){await page.screenshot({path:fileURLToPath(new URL(`${name}-${width}.png`,destination))});}
  async function controlsFit(){for(const id of ['developerToggle','developerMapToggle','stairOverlayToggle']){const b=await page.locator('#'+id).boundingBox();assert(b&&b.x>=0&&b.x+b.width<=width&&b.y>=0&&b.y+b.height<=height&&b.height>=44,id+' fits and remains usable');}}
  async function mapReady(){await page.waitForFunction(()=>window.devTest.developer.map&&!document.getElementById('developerMap').hidden);}
  async function mapLevels(mode){
   assert.deepEqual(await page.locator('#developerMapLevels button').allTextContents(),['Ground floor','First floor','Basement','Second floor','Grounds']);
   assert(await page.evaluate(()=>[...window.devTest.developer.map.notebook.fog.values()].every(f=>f.cells.every(cell=>cell===0))),'Full map leaves exploration memory untouched');
   for(const [index,button] of (await page.locator('#developerMapLevels button').all()).entries()){await button.click();await shot(`${mode}-map-${index}`);}
   const bounds=await page.locator('#developerMap .developer-map-card').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width&&bounds.y>=0&&bounds.y+bounds.height<=height,'Full map fits the viewport');
   const canvas=await page.locator('#developerMapCanvas').boundingBox(),scroll=await page.locator('.developer-map-scroll').boundingBox();assert(canvas.y+canvas.height<=scroll.y+scroll.height,'The whole floor map fits without clipping');
  }
  await page.goto(base+'/aerial.html?models=source&period=1916&lighting=day&view=plan');assert(await page.locator('#developerToggle').isHidden());await ready();
  assert(await page.locator('#developerToggle').isHidden());assert(await page.locator('#developerShortcuts').isHidden());await shot('aerial-hidden');await page.keyboard.press('KeyM');assert(!await page.evaluate(()=>window.devTest.developer.staircases));
  assert(!requests.some(url=>url.endsWith('/asylum-plan.json')),'Normal aerial viewing does not download the interior plan');
  await page.keyboard.press('Control+-');assert(await page.locator('#developerToggle').isHidden());assert(await page.locator('#developerShortcuts').isHidden());
  await page.keyboard.press('-');assert(await page.locator('#developerToggle').isVisible());assert(await page.locator('#developerShortcuts').isVisible());
  await page.keyboard.press('KeyM');await mapReady();assert(!await page.evaluate(()=>window.devTest.developer.staircases));await mapLevels('aerial');
  await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.getElementById('developerMap').contains(document.activeElement)));
  await page.keyboard.press('KeyM');assert(await page.locator('#developerMap').isHidden());
  await page.locator('#developerMapToggle').click();await mapReady();await page.keyboard.press('Enter');assert(await page.locator('#developerMap').isHidden(),'Keyboard activation of the close button works');
  await page.keyboard.press('Shift+KeyM');await overlayReady();await controlsFit();
  if(width<500){const help=await page.locator('#aerialHelp').boundingBox(),timeline=await page.locator('#layoutControls').boundingBox();assert(timeline.y+timeline.height+10<=help.y,'Phone timeline clears the complete shortcut guide');}
  const aerial=await page.evaluate(()=>{const {developer,renderer}=window.devTest;return {surfaces:developer.overlay.parts.filter(part=>part.mesh.visible).length,connections:developer.overlay.interior.length,autoClear:renderer.autoClear};});
  assert(aerial.surfaces>200);assert.equal(aerial.connections,8);assert(aerial.autoClear);
  await shot('aerial-overlay');
  await page.locator('#periodSlider').fill('12');await page.waitForFunction(()=>window.devTest.developer.overlay.parts.filter(part=>part.source.name==='Blue external stair tread').every(part=>!part.mesh.visible));
  await page.locator('#periodSlider').fill('8');
  // Switching views starts hidden, even after enabling the aerial developer tools.
  await page.locator('#switchView').click();await page.waitForURL('**/explore.html*');await ready();
  assert(await page.locator('#developerToggle').isHidden());assert(await page.locator('#developerShortcuts').isHidden());
  assert(await page.evaluate(()=>!window.devTest.developer.enabled&&!window.devTest.developer.mapRevealed));
  await page.keyboard.press('-');await page.keyboard.press('Shift+KeyM');await overlayReady();await controlsFit();
  await page.evaluate(()=>document.getElementById('look').click());await page.keyboard.down('KeyW');
  await page.keyboard.press('KeyM');await mapReady();assert(!await page.evaluate(()=>window.devTest.input.active));
  const pose=await page.evaluate(()=>({...window.devTest.walker.actor}));await page.keyboard.press('KeyE');await page.keyboard.up('KeyW');
  assert.deepEqual(await page.evaluate(()=>({...window.devTest.walker.actor})),pose,'Reading the walking map cannot move the player or use a door');await mapLevels('walking');
  await page.keyboard.press('Escape');assert(await page.locator('#developerMap').isHidden());
  await page.evaluate(()=>window.devTest.walker.setView({position:[0,1.8,40],target:[0,3,19]}));await shot('walking-overlay');
  await page.evaluate(()=>{const {walker}=window.devTest;Object.assign(walker.actor,{x:-10.5,z:17,floor:0,y:0,outside:false,stair:null});walker.look(0,0);walker.update(.01);});
  await shot('interior-overlay');
  await page.keyboard.press('Shift+KeyM');assert.equal(await page.locator('#stairOverlayToggle').getAttribute('aria-pressed'),'false');
  await page.keyboard.press('Shift+KeyM');await overlayReady();
  // Typing a hyphen or M must leave the developer state alone.
  await page.evaluate(()=>{const input=document.createElement('input');input.id='typingProbe';document.body.append(input);input.focus();});
  await page.keyboard.press('-');await page.keyboard.press('KeyM');assert(await page.evaluate(()=>window.devTest.developer.enabled&&window.devTest.developer.staircases));
  await page.evaluate(()=>document.getElementById('typingProbe').remove());
  // Click/tap support works even while the walking guide has pointer-events:none.
  await page.locator('#developerToggle').click();assert(await page.locator('#developerToggle').isVisible());assert(await page.locator('#developerShortcuts').isHidden());assert(!await page.evaluate(()=>window.devTest.developer.staircases));
  await page.locator('#developerToggle').click();await page.locator('#stairOverlayToggle').click();await overlayReady();
  // Reloading and starting the walk both keep the hint hidden until minus is pressed.
  await page.reload();assert(await page.locator('#developerToggle').isHidden());await ready();
  assert(await page.locator('#developerToggle').isHidden());assert(await page.locator('#developerShortcuts').isHidden());await shot('walking-hidden');
  await page.evaluate(()=>document.getElementById('look').click());
  if(width>=500)await page.waitForFunction(()=>document.body.classList.contains('mouse-locked'));
  assert(await page.locator('#developerToggle').isHidden());assert(await page.locator('#developerShortcuts').isHidden());await shot('walking-started-hidden');
  await page.keyboard.press('-');assert(await page.locator('#developerToggle').isVisible());assert(await page.locator('#developerShortcuts').isVisible());
  await shot('walking-started-revealed');
  assert.deepEqual(errors,[]);results.push({width,...aerial,fullMap:true,mapLevels:5,walkingPaused:true,modeSwitch:true,indoor:true,touch:true,typing:true,errors});
  console.log(`PASS: ${width}px full map/all five levels, modal keyboard/touch controls, walking pause, lazy aerial plan, staircase overlay, timeline, page-local shortcut discovery despite saved settings, indoor rendering and typing guards.`);
  await page.close();
 }
 await writeFile(new URL('validation.json',destination),JSON.stringify(results,null,2)+'\n');
}finally{await browser?.close();server.kill();}
