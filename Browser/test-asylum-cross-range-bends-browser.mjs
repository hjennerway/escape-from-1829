import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL('./artifacts/east-ground-bend/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await launchHardwareBrowser({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1600,height:700}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.bendCheck={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.bendCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette{display:none!important}'});
 const movement=await page.evaluate(async()=>{
  const {flatWalkable}=await import('/asylum-layout.mjs'),{walker,floors}=window.bendCheck,results=[];
  const routes=[[[40,8.2],[43.8,8.2],[46.3,5.7],[49.75,5.7],[54,5.7]],[[49.75,5.7],[49.75,11],[46,10]],[[43.8,8.2],[44.6,6.8],[44.95,6.9],[46.3,5.7]],[[-48,1],[-38.4,1],[-35.8,8.2],[-30,8.2]],[[-42.5,1],[-42.5,8],[-40.5,8]],[[-35.8,2],[-31,2]],[[-35.8,8.2],[-34.6,6.9],[-34.5,6.5],[-35.8,4]]];
  function face(x,z,tx,tz){walker.setView({position:[x,1.8,z],target:[tx,1.8,tz]});Object.assign(walker.actor,{floor:0,outside:false,y:0});}
  for(const route of routes)for(const reverse of [false,true]){
   const points=reverse?[...route].reverse():route,first=points[0];
   if(!flatWalkable(floors[0],...first))throw new Error('Route start is blocked');
   face(...first,...points[1]);
   for(const [x,z] of points.slice(1)){
    face(walker.actor.x,walker.actor.z,x,z);walker.keys.add('KeyW');
    for(let n=0;n<1000&&Math.hypot(walker.actor.x-x,walker.actor.z-z)>.02;n++)walker.update(Math.min(.01,Math.hypot(walker.actor.x-x,walker.actor.z-z)/5));
    walker.keys.clear();
    if(Math.hypot(walker.actor.x-x,walker.actor.z-z)>.025)throw new Error(`Explore bend route blocked at ${walker.actor.x},${walker.actor.z}, target ${x},${z}`);
   }
   results.push({reverse,x:walker.actor.x,z:walker.actor.z,floor:walker.actor.floor});
  }
  return results;
 });
 async function shot(name,points,floor=0){
  await page.evaluate(async({points,floor})=>{
   const {flatWalkable}=await import('/asylum-layout.mjs'),t=window.bendCheck,[x,z,tx,tz]=points,y=t.floors[floor].elevation;
   if(!flatWalkable(t.floors[floor],x,z))throw new Error('Capture origin is blocked');
   t.walker.setView({position:[x,y+1.8,z],target:[tx,y+1.55,tz],fov:58});Object.assign(t.walker.actor,{floor,outside:false,y});
  },{points,floor});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(`final-${name}.png`,destination))});
 }
 await shot('east-room',[48,10,45.1,7]);await shot('east-corridor',[43,8.2,47,6.5]);
 await shot('west-room',[-40.5,6.5,-37,3.5]);await shot('west-corridor',[-35.8,8.2,-38.5,3]);await shot('west-corner',[-36.2,8.2,-33.8,6.2]);await shot('west-door',[-35.8,2,-31,2]);
 await shot('east-first-comparison',[48,10,45.1,7],1);await shot('west-first-comparison',[-40.5,6.5,-37,3.5],1);
 await page.setViewportSize({width:390,height:844});await shot('east-mobile',[43,8.2,47,6.5]);await shot('west-mobile',[-36.2,8.2,-33.8,6.2]);
 assert.deepEqual(errors,[]);assert.equal(movement.length,14);
 await writeFile(new URL('browser-validation.json',destination),JSON.stringify({views:10,movement,errors},null,2)+'\n');
 console.log('PASS: 14 Explore walks through both bends and retained room entrances, 10 desktop/mobile/first-floor comparison views, no page or shader errors.');
}finally{await browser.close();server.kill();}
