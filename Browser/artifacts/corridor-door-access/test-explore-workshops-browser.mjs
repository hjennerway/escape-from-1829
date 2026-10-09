import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL('./artifacts/explore-workshops/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[],results={};
const instrument=`window.exploreTest={walker,workshops,exterior,renderer,timeline,lighting,input,
 pose(x,z,tx=x,tz=z-1){walker.setView({position:[x,1.8,z],target:[tx,1.8,tz]});this.step(0);},
 step(dt=.04){walker.update(dt);workshops.update(dt,walker.actor);const door=walker.nearbyDoor();doorButton.hidden=!door;if(door)doorButton.textContent=(door.action??'Enter building')+' · E';},
 refresh:refreshObstacles,render(){renderer.render(exterior.scene,exterior.camera);}};window.__manual=true;`;
async function shot(page,name){await page.evaluate(()=>exploreTest.render());await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
async function settle(page){await page.evaluate(()=>{for(let i=0;i<30;i++)exploreTest.step();});}
async function press(page){await page.keyboard.down('e');await page.evaluate(()=>exploreTest.step());await page.keyboard.up('e');await page.evaluate(()=>exploreTest.step());}
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});page.on('console',m=>{if(m.text().startsWith('Explore stage:'))console.log(m.text());if(m.type()==='error'){console.error(m.text());if(/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());}});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async route=>{
  let source=(await readFile(new URL('./dist/explore.mjs',import.meta.url),'utf8')).replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(',instrument+'\n  loadEscapeFrontage(');
  for(const [marker,label] of [['  const exterior=createEscapeExterior','estate'],['  const response=await fetch','plan'],['  const interior=createExploreInterior','furniture'],['  const walker=createExploreWalker','walker'],['  bindTimelineControls(','corridors'],['  const input=bindExploreInput','controls'],['  await interior.loading.prepare','rooms'],['  const clock=new THREE.Timer','ready']])source=source.replace(marker,"  console.log('Explore stage: "+label+"');\n"+marker);
  await route.fulfill({contentType:'text/javascript',body:source});
 });
 console.log('Loading Explore');await page.goto(base+'/explore.html?view=main-admin-corridor&period=1916&lighting=day',{waitUntil:'domcontentloaded'});console.log('Waiting for Explore rooms');await page.waitForFunction(()=>window.exploreTest);console.log('Explore ready');
 await page.locator('#game').dispatchEvent('pointerdown',{button:0,pointerId:1,pointerType:'mouse',clientX:640,clientY:400});
 await page.locator('#game').dispatchEvent('pointerup',{button:0,pointerId:1});
 results.renderer=await page.evaluate(()=>{const gl=exploreTest.renderer.getContext();return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);});
 const doors=await page.evaluate(()=>exploreTest.workshops.workshops.doors.map(({id,x,z,side})=>({id,x,z,side})));
 results.doors=[];
 for(const door of doors){
  const name=door.id.replace(':','-'),admin=door.id==='admin-corridor-door';
  await page.evaluate(({door,admin})=>{const {x,z,side}=door;exploreTest.pose(admin?x:x-side*1.5,admin?z+1.5:z,x,admin?z-1:z);},{door,admin});
  assert.equal(await page.locator('#exploreDoor').textContent(),'Open door · E');await shot(page,name+'-closed');
  await press(page);const angle=await page.evaluate(id=>exploreTest.workshops.workshops.doors.find(d=>d.id===id).pivot.rotation.y,door.id);
  assert(Math.abs(angle)>0&&Math.abs(angle)<.1);await page.evaluate(()=>{for(let i=0;i<9;i++)exploreTest.step();});await shot(page,name+'-opening');await settle(page);
  assert.equal(await page.locator('#exploreDoor').textContent(),'Close door · E');await shot(page,name+'-open');
  assert(await page.evaluate(({x,z})=>exploreTest.walker.outside.clear(x,z),door));
  // Walk through each open threshold using the real walker and its collision cache.
  const travel=await page.evaluate(({door,admin})=>{
   const {walker}=exploreTest;walker.keys.add('KeyW');for(let i=0;i<16;i++)exploreTest.step();walker.keys.clear();
   return {x:walker.actor.x,z:walker.actor.z,outside:walker.actor.outside};
  },{door,admin});
  assert(travel.outside);assert(admin?travel.z<door.z-.5:(travel.x-door.x)*door.side>.5,'Walk through '+door.id);
  await page.evaluate(({door,admin})=>{const {x,z,side}=door;exploreTest.pose(admin?x+.65:x+side*1.35,admin?z-1.5:z+.98,x,z);},{door,admin});
  assert.equal(await page.locator('#exploreDoor').textContent(),'Close door · E','Door reachable from reverse side');
  await page.locator('#exploreDoor').click();await settle(page);assert(!await page.evaluate(({x,z})=>exploreTest.walker.outside.clear(x,z),door));
  results.doors.push({id:door.id,firstFrameAngle:angle,travel});
 }
 const admin=doors.find(d=>d.id==='admin-corridor-door');
 await page.evaluate(({x,z})=>{exploreTest.walker.setView({position:[x-3,1.8,z+12],target:[x,4,z]});},admin);await shot(page,'admin-exterior');
 await page.evaluate(({x,z})=>{exploreTest.pose(x,z-5,x,z-20);},admin);await shot(page,'admin-clear-approach');
 await page.evaluate(()=>{const cx=exploreTest.workshops.workshops.plan.corridors[0].start[0];exploreTest.pose(cx,9.8,cx,-20);});await shot(page,'corridor-junction');
 for(const mode of ['dusk','night']){await page.evaluate(mode=>exploreTest.lighting.setMode(mode),mode);await shot(page,'corridor-'+mode);}
 await page.evaluate(()=>{exploreTest.lighting.setMode('day');document.body.classList.add('explore-touch');});
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(({x,z})=>exploreTest.pose(x,z+1.5,x,z-1),admin);
 assert.equal(await page.locator('#exploreDoor').textContent(),'Open door · E');
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 const button=await page.locator('#exploreDoor').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await settle(page);await cdp.detach();
 assert.equal(await page.locator('#exploreDoor').textContent(),'Close door · E');await shot(page,'admin-open-phone');
 // Real date controls dispose and recreate the corridor fittings and obstacles.
 results.periods=[];
 for(const index of [0,10,8]){
  await page.locator('#periodSlider').fill(String(index));await page.locator('#periodSlider').dispatchEvent('input');
  const state=await page.evaluate(()=>({year:exploreTest.timeline.period.year,present:!!exploreTest.workshops.workshops}));results.periods.push(state);assert.equal(state.present,index===8);
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
}catch(error){console.error(JSON.stringify({errors}));throw error;}finally{await browser?.close();server.kill();}
