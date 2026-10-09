import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const mode=process.argv.includes('--compiled')?'compiled':'source';
const destination=new URL(`./${process.env.FLOOR_CAPTURE_LABEL??'before'}/${mode}/`,import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[],results={};
const instrument=`window.exploreTest={THREE,walker,workshops,exterior,renderer,timeline,lighting,input,
 pose(x,z,tx=x,tz=z-1){walker.setView({position:[x,1.8,z],target:[tx,1.8,tz]});this.step(0);},
 step(dt=.04){walker.update(dt);workshops.update(dt,walker.actor);const door=walker.nearbyDoor();doorButton.hidden=!door;if(door)doorButton.textContent=(door.action??'Enter building')+' · E';},
 refresh:refreshObstacles,seams(){return probeIrbyEntrance(THREE,exterior.model,workshops.workshops.doors.find(d=>d.id==='irby-corridor-door'));},render(){renderer.render(exterior.scene,exterior.camera);}};window.__manual=true;`;
async function shot(page,name){await page.evaluate(()=>exploreTest.render());await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
async function settle(page){await page.evaluate(()=>{for(let i=0;i<30;i++)exploreTest.step();});}
async function press(page){await page.keyboard.down('e');await page.evaluate(()=>exploreTest.step());await page.keyboard.up('e');await page.evaluate(()=>exploreTest.step());}
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});page.on('console',m=>{if(m.text().startsWith('Explore stage:'))console.log(m.text());if(m.type()==='error'){console.error(m.text());if(/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());}});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async route=>{
  let source=(await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8')).replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(',instrument+'\n  loadEscapeFrontage(');
  for(const [marker,label] of [['  const exterior=createEscapeExterior','estate'],['  const response=await fetch','plan'],['  const interior=createExploreInterior','furniture'],['  const walker=createExploreWalker','walker'],['  bindTimelineControls(','corridors'],['  const input=bindExploreInput','controls'],['  await interior.loading.prepare','rooms'],['  const clock=new THREE.Timer','ready']])source=source.replace(marker,"  console.log('Explore stage: "+label+"');\n"+marker);
  const probes=(await readFile(new URL('../../test-support/irby-entrance-probes.mjs',import.meta.url),'utf8')).replaceAll('export function','function');
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
 const irby=doors.find(d=>d.id==='irby-corridor-door');
 await page.evaluate(({id})=>{exploreTest.workshops.workshops.setDoorOpen(id,true);for(let i=0;i<30;i++)exploreTest.step();},irby);
 results.threshold=[];
 for(const [name,position,target] of [
  ['inside-down',[irby.x-1.3,1.8,irby.z],[irby.x+.1,.04,irby.z]],
  ['inside-left',[irby.x-1.5,1.8,irby.z-.5],[irby.x,.04,irby.z]],
  ['inside-right',[irby.x-1.5,1.8,irby.z+.5],[irby.x,.04,irby.z]],
  ['outside-down',[irby.x+1.5,1.8,irby.z],[irby.x-.1,.04,irby.z]]
 ]){
  await page.evaluate(({position,target})=>exploreTest.walker.setView({position,target}),{position,target});
  await shot(page,name);
  results.threshold.push(await page.evaluate(({x,z,name})=>{
   const {renderer,exterior,THREE}=exploreTest,gl=renderer.getContext(),width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
   const floor=exterior.model.getObjectByName('Continuous escape corridor and workshop floor');
   const capture=()=>{exploreTest.render();const p=new Uint8Array(width*height*4);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};
   const full=capture();floor.visible=false;const hidden=capture();floor.visible=true;
   let changed=0,maximum=0,samples=0;
   for(let dx=-.19;dx<-.02;dx+=.01)for(let dz=-.7;dz<.7;dz+=.02){
    const p=new THREE.Vector3(x+dx,.04,z+dz).project(exterior.camera),px=Math.floor((p.x*.5+.5)*width),py=Math.floor((p.y*.5+.5)*height);
    if(px<0||px>=width||py<0||py>=height)continue;
    const i=(py*width+px)*4,d=Math.max(...[0,1,2].map(c=>Math.abs(full[i+c]-hidden[i+c])));samples++;maximum=Math.max(maximum,d);if(d>3)changed++;
   }
   return {name,samples,changed,maximum};
  },{...irby,name}));
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(({x,z})=>exploreTest.walker.setView({position:[x-1.3,1.8,z],target:[x+.1,.04,z]}),irby);await shot(page,'inside-phone');
 await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
}finally{await browser?.close();server.kill();}
