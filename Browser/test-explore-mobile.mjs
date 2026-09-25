import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const artifacts=new URL('./artifacts/',import.meta.url);await mkdir(artifacts,{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  let page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const instrument=async route=>{
    const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__walk={exterior,walker,input,renderer};const clock=new THREE.Timer();')});
  };
  await page.route('**/explore.mjs',instrument);
  await page.goto(base+'/explore.html',{timeout:120000});
  await page.waitForFunction(()=>window.__walk?.renderer.info.render.frame>2,null,{timeout:120000});
  assert(await page.locator('#walkTouch').isVisible());assert(await page.locator('#look').isHidden());
  const cdp=await page.context().newCDPSession(page);
  const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([id,x,y])=>({id,x,y}))});
  const position=()=>page.evaluate(()=>window.__walk.exterior.camera.position.toArray());
  async function center(selector){const b=await page.locator(selector).boundingBox();return [b.x+b.width/2,b.y+b.height/2];}
  const forward=await center('[data-key="KeyW"]'),back=await center('[data-key="KeyS"]');
  let before=await position();await touch('touchStart',[[1,...forward]]);
  await page.waitForFunction(z=>window.__walk.exterior.camera.position.z<z-.2,before[2]);
  const lookPoint=[300,500],yaw=await page.evaluate(()=>window.__walk.exterior.camera.rotation.y);
  await touch('touchStart',[[1,...forward],[2,...lookPoint]]);
  await touch('touchMove',[[1,...forward],[2,350,520]]);
  assert(await page.evaluate(y=>window.__walk.exterior.camera.rotation.y<y-.05,yaw),'real multitouch turns the camera while moving');
  assert(await page.evaluate(()=>window.__walk.walker.keys.has('KeyW')));
  await touch('touchEnd',[]);
  assert.equal(await page.evaluate(()=>window.__walk.walker.keys.size),0,'lifting fingers stops movement');
  before=await position();await touch('touchStart',[[1,...back]]);
  await page.waitForFunction(z=>window.__walk.exterior.camera.position.z>z+.2,before[2]);
  await touch('touchCancel',[]);assert.equal(await page.evaluate(()=>window.__walk.walker.keys.size),0);
  // Keep the view predictable for visual checks after proving actual movement.
  await page.evaluate(()=>window.__walk.walker.reset());
  for(const [name,width,height] of [['portrait',390,844],['narrow',320,568],['landscape',844,390],['small-landscape',568,320]]){
    await page.setViewportSize({width,height});
    for(const selector of ['#walkTouch button','#periodSlider','#locationsButton']){
      for(const element of await page.locator(selector).all()){
        const b=await element.boundingBox();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=width&&b.y+b.height<=height,selector+' fits '+name);
        assert(await element.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),selector+' is reachable in '+name);
      }
    }
    await page.screenshot({path:fileURLToPath(new URL('explore-mobile-'+name+'.png',artifacts))});
  }
  await page.locator('#locationsButton').tap();assert(await page.locator('#locationsPanel').isVisible());
  await page.locator('#locationsButton').tap();
  const period=await page.locator('#periodYear').textContent();await page.locator('#nextPeriod').tap();
  assert.notEqual(await page.locator('#periodYear').textContent(),period,'timeline remains usable on touch');
  assert.equal(await page.evaluate(()=>window.__walk.input.active),false);
  await page.setViewportSize({width:390,height:844});
  const resume=await center('[data-key="KeyS"]');await touch('touchStart',[[1,...resume]]);
  assert(await page.evaluate(()=>window.__walk.input.active&&window.__walk.walker.keys.has('KeyS')),'touch resumes after using the timeline');
  await touch('touchEnd',[]);
  await page.close();
  page=await browser.newPage({viewport:{width:1280,height:900},hasTouch:false});
  page.on('pageerror',error=>errors.push(error.message));await page.route('**/explore.mjs',instrument);
  await page.goto(base+'/explore.html',{timeout:120000});await page.waitForFunction(()=>window.__walk?.renderer.info.render.frame>2,null,{timeout:120000});
  assert(await page.locator('#walkTouch').isHidden(),'desktop does not show the direction pad');
  await page.mouse.move(700,400);await page.mouse.down();await page.mouse.move(750,420);await page.mouse.up();
  before=await position();await page.keyboard.down('KeyW');
  await page.waitForFunction(z=>window.__walk.exterior.camera.position.z<z-.2,before[2]);await page.keyboard.up('KeyW');
  await page.screenshot({path:fileURLToPath(new URL('explore-mobile-desktop.png',artifacts))});
  assert.deepEqual(errors,[]);
  console.log('PASS: real mobile touch movement and simultaneous look, release/cancel, portrait/narrow/landscape controls, timeline/navigation and desktop keyboard/drag.');
}finally{await browser?.close();server.kill();}
