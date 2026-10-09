import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const artifacts=new URL('./artifacts/view-navigation/',import.meta.url);await mkdir(artifacts,{recursive:true});
let browser;
const results=[];
try{
  browser=await launchHardwareBrowser();
  for(const [width,height] of [[1200,800],[320,844]]){
    const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'});
    page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.route(/https:\/\/(www\.whateversleft\.co\.uk|basedinchurton\.co\.uk)\//,route=>route.abort());
    await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.viewTest={exterior,renderer,controls,lighting};function frame(){')});});
    await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.viewTest={exterior,renderer,walker,input,lighting,interior};const clock=new THREE.Timer();')});});
    async function ready(){await page.waitForFunction(()=>window.viewTest?.renderer.info.render.frame>2);assert.equal(await page.locator('#introTransition').count(),0);}
    async function pose(){return page.evaluate(()=>{const {exterior,lighting,walker}=window.viewTest,camera=exterior.camera;return {x:camera.position.x,y:camera.position.y,z:camera.position.z,heading:camera.rotation.clone().reorder('YXZ').y,lighting:lighting.mode,outside:walker?.actor.outside,clear:walker?.outside.clear(walker.actor.x,walker.actor.z,walker.actor.y)};});}
    async function navLayout(mode){
      const back=await page.locator('#backToIntro').boundingBox(),button=await page.locator('#switchView').boundingBox();
      assert(button.x>=back.x+back.width&&Math.abs(button.y-back.y)<1,'Switch sits beside Back to intro');
      assert(button.x+button.width<=width&&button.height>=44,'Switch fits the viewport and touch target');
      assert(await page.locator('#switchView').isEnabled());
      await page.screenshot({path:fileURLToPath(new URL(mode+'-'+width+'.png',artifacts))});
    }
    // A location preset must yield to the live handoff location.
    await page.goto(base+'/aerial.html?view=church&at=0,40,0&period=1916&lighting=night');await ready();
    await navLayout('aerial');const first=await pose();assert.equal(first.x,0);assert.equal(first.z,40);
    // Pan after entry so the switch has to read the current camera, not the URL.
    await page.evaluate(()=>window.viewTest.controls.panPixels(-40,0));const panned=await pose();assert.notEqual(panned.x,first.x);
    await page.locator('#switchView').click();await page.waitForURL('**/explore.html*');await ready();
    const walk=await pose();assert(Math.abs(walk.x-panned.x)<1e-8&&Math.abs(walk.z-panned.z)<1e-8,'Drop preserves the live horizontal position');
    assert(Math.abs(walk.y-1.8)<.5&&walk.outside&&walk.clear,'Drop starts on clear ground');
    assert.equal(walk.lighting,'night');assert.equal(await page.locator('#periodYear').textContent(),'1916');
    assert(Math.abs(Math.sin(walk.heading-panned.heading))<1e-8);await navLayout('explore');
    if(width<500){const forward=await page.locator('[data-key="KeyW"]').boundingBox();await page.mouse.move(forward.x+forward.width/2,forward.y+forward.height/2);await page.mouse.down();}
    else{await page.mouse.click(width/2,height*.45);await page.keyboard.down('KeyW');}
    await page.waitForFunction(({x,z})=>Math.hypot(window.viewTest.exterior.camera.position.x-x,window.viewTest.exterior.camera.position.z-z)>.5,walk);
    if(width<500)await page.mouse.up();else await page.keyboard.up('KeyW');const walked=await pose();
    await page.locator('[data-lighting="dusk"]').click();await page.locator('#nextPeriod').click();
    const year=await page.locator('#periodYear').textContent();
    await page.locator('#switchView').click();await page.waitForURL('**/aerial.html*');await ready();
    const aerial=await pose();assert(Math.abs(aerial.x-walked.x)<1e-8&&Math.abs(aerial.z-walked.z)<1e-8,'Rise preserves the walked location');
    assert(aerial.y>50);assert.equal(aerial.lighting,'dusk');assert.equal(await page.locator('#periodYear').textContent(),year);
    assert(Math.abs(Math.sin(aerial.heading-walked.heading))<1e-8);
    await page.setViewportSize({width:width+30,height});const resized=await pose();assert.equal(resized.x,aerial.x);assert.equal(resized.z,aerial.z);
    await page.setViewportSize({width,height});await page.reload();await ready();const reloaded=await pose();assert.equal(reloaded.x,aerial.x);assert.equal(reloaded.z,aerial.z);
    await page.locator('#switchView').click();await page.waitForURL('**/explore.html*');await ready();const roundTrip=await pose();assert.equal(roundTrip.x,aerial.x);assert.equal(roundTrip.z,aerial.z);
    // Drop over a solid building wall: use the same destination collision cache.
    const blocked=await page.evaluate(()=>{const {walker}=window.viewTest;for(let x=-10;x<10;x+=.5)for(let z=17;z<21;z+=.5)if(!walker.outside.clear(x,z,walker.outside.heightAt(x,z,0)))return {x,z};});
    assert(blocked);await page.goto(base+`/explore.html?at=${blocked.x},${blocked.z},0&period=${year}`);await ready();
    const landed=await pose();assert(landed.clear);assert(Math.hypot(landed.x-blocked.x,landed.z-blocked.z)<=10,'Blocked ground is resolved locally');
    // An indoor viewpoint can still rise above its actual current X/Z.
    await page.evaluate(async()=>{const {walker,interior}=window.viewTest;await interior.loading.prepare({x:0,z:10,floor:1});Object.assign(walker.actor,{x:0,y:5,z:10,floor:1,outside:false,stair:null});walker.look(0,0);walker.update(.01);});
    const indoor=await pose();await page.locator('#switchView').click();await page.waitForURL('**/aerial.html*');await ready();const above=await pose();
    assert.equal(above.x,indoor.x);assert.equal(above.z,indoor.z);
    assert.deepEqual(errors,[]);results.push({width,errors,livePan:true,walking:true,roundTrip:true,blockedDrop:true,indoorRise:true});
    console.log(`PASS: ${width}px adjacent controls, live pan/walk round trip, heading, period/lighting, resize/reload, blocked drop and indoor rise.`);
    await page.close();
  }
  await writeFile(new URL('validation.json',artifacts),JSON.stringify(results,null,2));
}finally{await browser?.close();server.kill();}
