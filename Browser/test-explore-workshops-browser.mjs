import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const mode=process.argv.includes('--compiled')?'compiled':'source';
const destination=new URL(`./artifacts/corridor-door-access/${mode}/`,import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[],results={};
const instrument=`window.exploreTest={THREE,walker,workshops,exterior,renderer,timeline,lighting,input,
 pose(x,z,tx=x,tz=z-1){walker.setView({position:[x,1.8,z],target:[tx,1.8,tz]});this.step(0);},
 step(dt=.04){walker.update(dt);workshops.update(dt,walker.actor);const door=walker.nearbyDoor();doorButton.hidden=!door;if(door)doorButton.textContent=(door.action??'Enter building')+' · E';},
 refresh:refreshObstacles,seams(){return probeIrbyEntrance(THREE,exterior.model,workshops.workshops.doors.find(d=>d.id==='irby-corridor-door'));},thresholdPixels(door){return probeIrbyThresholdPixels({THREE,renderer,exterior},door);},render(){renderer.render(exterior.scene,exterior.camera);}};window.__manual=true;`;
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
  const probes=(await readFile(new URL('./test-support/irby-entrance-probes.mjs',import.meta.url),'utf8')).replaceAll('export function','function');
  await route.fulfill({contentType:'text/javascript',body:probes+'\n'+source});
 });
 console.log('Loading Explore');await page.goto(base+'/explore.html?view=irby-corridor&period=1916&lighting=day&models='+mode,{waitUntil:'domcontentloaded'});console.log('Waiting for Explore');await page.waitForFunction(()=>window.exploreTest);console.log('Explore ready');
 await page.locator('#game').dispatchEvent('pointerdown',{button:0,pointerId:1,pointerType:'mouse',clientX:640,clientY:400});
 await page.locator('#game').dispatchEvent('pointerup',{button:0,pointerId:1});
 results.renderer=await page.evaluate(()=>{const gl=exploreTest.renderer.getContext();return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);});
 results.model=await page.evaluate(()=>exploreTest.exterior.modelBuild);
 assert.equal(results.model.mode,mode==='source'?'procedural':'compiled');
 assert.equal(await page.evaluate(()=>exploreTest.workshops.workshops.lockedDoors.length),0);
 const doors=await page.evaluate(()=>exploreTest.workshops.workshops.doors.map(({id,x,z,side,approach})=>({id,x,z,side,approach:approach??(id==='admin-corridor-door'?[0,1]:[-side,0])})));
 results.doors=[];
 for(const door of doors){
  const name=door.id.replace(':','-'),admin=door.id==='admin-corridor-door';
  await page.evaluate(door=>{const {x,z,approach:[dx,dz]}=door;exploreTest.pose(x+dx*1.5,z+dz*1.5,x-dx,z-dz);},door);
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
  assert(travel.outside);assert((travel.x-door.x)*door.approach[0]+(travel.z-door.z)*door.approach[1]<-.5,'Walk through '+door.id);
  await page.evaluate(({door,admin})=>{const {x,z,side}=door;exploreTest.pose(door.id==='irby-corridor-door'?x-1.5:admin?x+.65:x+side*1.35,door.id==='irby-corridor-door'?z-.65:admin?z-1.5:z+.98,x,z);},{door,admin});
  assert.equal(await page.locator('#exploreDoor').textContent(),'Close door · E','Door reachable from reverse side');
  await page.locator('#exploreDoor').click();await settle(page);assert(!await page.evaluate(({x,z})=>exploreTest.walker.outside.clear(x,z),door));
  results.doors.push({id:door.id,firstFrameAngle:angle,travel});
 }
 const irby=doors.find(d=>d.id==='irby-corridor-door');
 results.irbySeams=await page.evaluate(()=>exploreTest.seams());
 assert.deepEqual(results.irbySeams.leaks,[],'Closed Irby frame seals both faces and oblique views');
 assert(results.irbySeams.wall.every(p=>Math.abs(p.x-(irby.x+.24))<1e-4),'Irby wall stays flat above the paving');
 assert(results.irbySeams.paving.every(p=>Math.abs(p.y-.34)<1e-4),'Paving meets beneath the entire entrance face');
 assert(results.irbySeams.floor.every(p=>p.surfaces===1&&Math.abs(p.y-.04)<1e-4),'One level floor surface at the Irby threshold joint');
 // Removing outdoor paving must not change any visible door/wall pixels.
 // This catches the actual depth-bias bleed that geometric rays cannot see.
 results.irbyPavingOcclusion=await page.evaluate(({x,z})=>{
  const {THREE,renderer,exterior,walker}=exploreTest,gl=renderer.getContext(),width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
  const materials=new Set();exterior.model.traverse(o=>{if(o.name==='Irby Estates continuous service court outside accessible gallery')materials.add(o.material);});
  const capture=()=>{exploreTest.render();const pixels=new Uint8Array(width*height*4);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;};
  const results=[];
  for(const distance of [6.7,11.7,20]){
   walker.setView({position:[x-distance,1.8,z],target:[x,1.8,z]});const full=capture();
   for(const m of materials)m.visible=false;const hidden=capture();for(const m of materials)m.visible=true;
   const camera=exterior.camera,points=[[-1.35,.38],[1.35,.85]].map(([offset,y])=>new THREE.Vector3(x-.17,y,z+offset).project(camera));
   const bounds={x:points.map(p=>Math.round((p.x*.5+.5)*width)),y:points.map(p=>Math.round((p.y*.5+.5)*height))};
   let changed=0,maximum=0,samples=0;
   for(let py=Math.min(...bounds.y);py<=Math.max(...bounds.y);py++)for(let px=Math.min(...bounds.x);px<=Math.max(...bounds.x);px++){
    const i=(py*width+px)*4,difference=Math.max(...[0,1,2].map(c=>Math.abs(full[i+c]-hidden[i+c])));
    samples++;maximum=Math.max(maximum,difference);if(difference>3)changed++;
   }
   results.push({distance,samples,changed,maximum});
  }
  exploreTest.render();return results;
 },irby);
 assert(results.irbyPavingOcclusion.every(r=>r.samples>0&&r.changed===0),'Outdoor paving cannot bleed through the Irby door or walls');
 await page.evaluate(({id})=>{exploreTest.workshops.workshops.setDoorOpen(id,true);for(let i=0;i<30;i++)exploreTest.step();},irby);
 results.irbyThreshold=[];
 for(const [name,position,target] of [
  ['irby-floor-inside',[irby.x-1.3,1.8,irby.z],[irby.x+.1,.04,irby.z]],
  ['irby-floor-left',[irby.x-1.5,1.8,irby.z-.5],[irby.x,.04,irby.z]],
  ['irby-floor-right',[irby.x-1.5,1.8,irby.z+.5],[irby.x,.04,irby.z]],
  ['irby-floor-outside',[irby.x+1.5,1.8,irby.z],[irby.x-.1,.04,irby.z]]
 ]){
  await page.evaluate(({position,target})=>exploreTest.walker.setView({position,target}),{position,target});
  const pixels=await page.evaluate(door=>exploreTest.thresholdPixels(door),irby);
  results.irbyThreshold.push({name,...pixels});assert(pixels.samples>0&&pixels.changed===0,'Stable stone threshold from '+name);await shot(page,name);
 }
 await page.evaluate(({id,x,z})=>{exploreTest.pose(x-1.5,z-.65,x,z);exploreTest.workshops.workshops.setDoorOpen(id,false);for(let i=0;i<30;i++)exploreTest.step();},irby);
 for(const [name,position,target] of [
  ['irby-exterior',[irby.x+16,1.8,irby.z-5],[irby.x,3.5,irby.z]],
  ['irby-roof-front',[irby.x+10,1.8,irby.z],[irby.x,3.2,irby.z]],
  ['irby-roof-oblique',[irby.x+9,1.8,irby.z-7],[irby.x,4,irby.z]],
  ['irby-straight-extension',[irby.x-4,1.8,irby.z],[190,2,irby.z]],
  ['irby-closed-approach',[irby.x-11.7,1.8,irby.z],[irby.x,1.8,irby.z]],
  ['irby-closed-frame',[irby.x+3.3,1.8,irby.z],[irby.x,1.8,irby.z]]
 ]){await page.evaluate(({position,target})=>exploreTest.walker.setView({position,target}),{position,target});await shot(page,name);}
 // Walk from the pictured exterior door through the former Irby lock to the
 // tower and workshops, without teleporting at the old stopping line.
 results.irbyWalk=await page.evaluate(({x,z,id})=>{
  const {walker,workshops}=exploreTest;workshops.workshops.setDoorOpen(id,true);for(let i=0;i<30;i++)exploreTest.step();
  exploreTest.pose(x+1.5,z,x-1,z);const points=[[x-2,z],[210,z],[workshops.workshops.plan.corridors[0].start[0],z],[workshops.workshops.plan.corridors[0].start[0],-44.75]],reached=[];
  for(const [tx,tz] of points){
   for(let i=0;i<1500&&Math.hypot(walker.actor.x-tx,walker.actor.z-tz)>.03;i++){
    const dx=tx-walker.actor.x,dz=tz-walker.actor.z,d=Math.hypot(dx,dz),yaw=Math.atan2(-dx,-dz);
    walker.look((exploreTest.exterior.camera.rotation.y-yaw)/.002,0);walker.keys.add('KeyW');exploreTest.step(Math.min(.04,d/5));
   }
   walker.keys.clear();reached.push({target:[tx,tz],distance:Math.hypot(walker.actor.x-tx,walker.actor.z-tz)});
  }return reached;
 },irby);assert(results.irbyWalk.every(p=>p.distance<.04),'Continuous Irby-to-tower walk');await shot(page,'irby-to-tower-arrival');
 // Continue from the tower through the ward junctions and the extended elbow.
 results.wardWalk=await page.evaluate(()=>{
  const {walker,workshops}=exploreTest,route=id=>workshops.workshops.plan.corridors.find(r=>r.id===id),diagonal=route('diagonal'),upton=route('upton');
  const points=[diagonal.start,route('grafton').start,route('witby').start,diagonal.end,[upton.end[0]+2,upton.end[1]],diagonal.end],reached=[];
  for(const [tx,tz] of points){
   for(let i=0;i<1500&&Math.hypot(walker.actor.x-tx,walker.actor.z-tz)>.03;i++){
    const dx=tx-walker.actor.x,dz=tz-walker.actor.z,d=Math.hypot(dx,dz),yaw=Math.atan2(-dx,-dz);
    walker.look((exploreTest.exterior.camera.rotation.y-yaw)/.002,0);walker.keys.add('KeyW');exploreTest.step(Math.min(.04,d/5));
   }
   walker.keys.clear();reached.push({target:[tx,tz],distance:Math.hypot(walker.actor.x-tx,walker.actor.z-tz)});
  }
  exploreTest.pose(...diagonal.end,...diagonal.start);return reached;
 });assert(results.wardWalk.every(p=>p.distance<.04),'Continuous tower-to-Upton walk and reverse elbow');await shot(page,'upton-elbow-return');
 await page.evaluate(()=>{const r=exploreTest.workshops.workshops.plan.corridors.find(r=>r.id==='upton');exploreTest.pose(r.end[0]+4,r.end[1],...r.end);});await shot(page,'upton-ward-boundary');
 const admin=doors.find(d=>d.id==='admin-corridor-door');
 await page.evaluate(({x,z})=>{exploreTest.walker.setView({position:[x-3,1.8,z+12],target:[x,4,z]});},admin);await shot(page,'admin-exterior');
 await page.evaluate(({x,z})=>{exploreTest.pose(x,z-5,x,z-20);},admin);await shot(page,'admin-clear-approach');
 await page.evaluate(()=>{const cx=exploreTest.workshops.workshops.plan.corridors[0].start[0];exploreTest.pose(cx,9.8,cx,-20);});await shot(page,'corridor-junction');
 for(const mode of ['dusk','night']){await page.evaluate(mode=>exploreTest.lighting.setMode(mode),mode);await shot(page,'corridor-'+mode);}
 await page.evaluate(()=>{exploreTest.lighting.setMode('day');document.body.classList.add('explore-touch');});
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(({x,z,id})=>{exploreTest.pose(x+1.5,z,x-1,z);exploreTest.workshops.workshops.setDoorOpen(id,false);for(let i=0;i<30;i++)exploreTest.step();},irby);
 assert.equal(await page.locator('#exploreDoor').textContent(),'Open door · E');
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 const button=await page.locator('#exploreDoor').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await settle(page);await cdp.detach();
 assert.equal(await page.locator('#exploreDoor').textContent(),'Close door · E');await shot(page,'irby-open-phone');
 await page.evaluate(({x,z})=>exploreTest.walker.setView({position:[x-1.3,1.8,z],target:[x+.1,.04,z]}),irby);
 const phoneThreshold=await page.evaluate(door=>exploreTest.thresholdPixels(door),irby);
 results.irbyThreshold.push({name:'irby-floor-phone',...phoneThreshold});assert(phoneThreshold.samples>0&&phoneThreshold.changed===0,'Stable stone threshold on phone');await shot(page,'irby-floor-phone');
 // Real date controls dispose and recreate the corridor fittings and obstacles.
 results.periods=[];
 for(const index of [0,10,8]){
  await page.locator('#periodSlider').fill(String(index));await page.locator('#periodSlider').dispatchEvent('input');
  const state=await page.evaluate(()=>({year:exploreTest.timeline.period.year,present:!!exploreTest.workshops.workshops}));results.periods.push(state);assert.equal(state.present,index===8);
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
}catch(error){console.error(JSON.stringify({errors}));throw error;}finally{await browser?.close();server.kill();}
