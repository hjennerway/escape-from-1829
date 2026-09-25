import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

// Same application, viewport and driver at each revision. Timings are diagnostic,
// not hardware FPS claims. Run separately from other browser/GPU checks.
const label=process.argv[2]??'current',samples=Number(process.env.THREE_SAMPLES??30);
const hardware=process.env.THREE_HARDWARE==='1';
const baseline=process.env.THREE_BASELINE?resolve(process.env.THREE_BASELINE):null;
const modes=new Set((process.env.THREE_MODES??'aerial,walking,game').split(','));
assert.match(label,/^[a-z0-9-]+$/);
assert(Number.isInteger(samples)&&samples>=5,'Use at least five frame samples');
const artifacts=new URL('./artifacts/three-upgrade/',import.meta.url);
await mkdir(artifacts,{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
const errors=[],warnings=[],results=[];
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:hardware?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:700}});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('net::ERR_FAILED'))errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});
 // The old game uses CDN imports. Serve its exact vendored counterparts so the
 // baseline has no CDN/network variance; other remote photos are excluded alike.
 await page.route('https://**/*',async route=>{
  if(route.request().url().startsWith('https://cdn.jsdelivr.net/'))await route.fulfill({contentType:'text/javascript',body:await readFile(baseline?resolve(baseline,'vendor',route.request().url().split('/').at(-1)):new URL('./dist/vendor/'+route.request().url().split('/').at(-1),import.meta.url),'utf8')});
  else await route.fulfill({status:204,body:''});
 });
 if(baseline){
  await page.route('**/vendor/**',route=>route.fulfill({contentType:'text/javascript',path:resolve(baseline,'vendor',new URL(route.request().url()).pathname.split('/').at(-1))}));
  await page.route(base+'/',route=>route.fulfill({contentType:'text/html',path:resolve(baseline,'index.html')}));
 }
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(baseline?await readFile(resolve(baseline,'aerial.html'),'utf8'):await response.text()).replace('function frame(){','window.__threeBench={renderer,exterior,lighting,revision:THREE.REVISION};function frame(){')});
 });
 await page.route('**/explore.mjs',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(baseline?await readFile(resolve(baseline,'explore.mjs'),'utf8'):await response.text()).replace(/const clock=new THREE\.(?:Clock|Timer)\(\);/,match=>'window.__threeBench={renderer,exterior,lighting,revision:THREE.REVISION};'+match)});
 });
 await page.route('**/game.mjs',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(baseline?await readFile(resolve(baseline,'game.mjs'),'utf8'):await response.text()).replace('selectEscapeRoutes(makeFloors(layout))','selectEscapeRoutes(makeFloors(layout),()=>.5)').replaceAll('Math.random()','.5')+`\nwindow.__threeBench={get ready(){return ready;},get renderer(){return renderer;},get scene(){return scene;},get camera(){return camera;},revision:THREE.REVISION,get arrival(){return arrivalCutscene;},pose(x,z,floor,angle){Object.assign(player,{x,z,floor});showFloor();yaw=angle;pitch=0;camera.position.set(x,floor*FLOOR_HEIGHT+1.65,z);state='play';elapsed=0;keys.clear();keys.add('KeyE');update(.001);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;}};`});
 });
 async function capture(name){
  await page.evaluate(()=>new Promise(resolve=>{let frames=0;function next(){if(++frames===8)resolve();else requestAnimationFrame(next);}requestAnimationFrame(next);}));
  const data=await page.evaluate(async samples=>{
   const {renderer,revision}=window.__threeBench,intervals=[],calls=[],triangles=[];
   let last;for(let i=0;i<=samples;i++)await new Promise(resolve=>requestAnimationFrame(now=>{if(last!==undefined){intervals.push(now-last);calls.push(renderer.info.render.calls);triangles.push(renderer.info.render.triangles);}last=now;resolve();}));
   intervals.sort((a,b)=>a-b);const gl=renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
   return {revision,medianFrameMs:intervals[Math.floor(intervals.length/2)],p90FrameMs:intervals[Math.floor(intervals.length*.9)],drawCalls:Math.round(calls.reduce((a,b)=>a+b)/calls.length),triangles:Math.round(triangles.reduce((a,b)=>a+b)/triangles.length),gpu:info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
  },samples);
  if(hardware){
   assert(!/swiftshader|llvmpipe|software/i.test(data.gpu),'Hardware mode must use a real GPU');
   data.medianRenderMs=await page.evaluate(async samples=>{
    const state=window.__threeBench,renderer=state.renderer,scene=state.exterior?.scene??state.scene,camera=state.exterior?.camera??state.camera,times=[];
    for(let i=0;i<samples+5;i++){
     await new Promise(requestAnimationFrame);const start=performance.now();renderer.render(scene,camera);renderer.getContext().finish();if(i>=5)times.push(performance.now()-start);
    }
    times.sort((a,b)=>a-b);return times[Math.floor(times.length/2)];
   },samples);
  }
  await page.screenshot({path:fileURLToPath(new URL(`${label}-${name}.png`,artifacts))});
  results.push({name,...data});console.log(name,JSON.stringify(data));
 }
 for(const [name,path] of [['aerial','aerial.html?models=source'],['walking','explore.html?view=front']]){
  if(!modes.has(name))continue;
  await page.goto(base+'/'+path);await page.waitForFunction(()=>window.__threeBench?.renderer.info.render.frame>3);
  if(!await page.evaluate(()=>window.__threeBench.exterior.trees.visible))await page.keyboard.press('t');
  await capture(name+'-day');await page.locator('#dayNightToggle').click();await capture(name+'-night');
 }
 if(modes.has('game')){
 await page.goto(base+'/');await page.waitForFunction(()=>window.__threeBench?.ready);
 await page.locator('#start').click();await page.evaluate(()=>window.__threeBench.arrival.update(3));
 for(const [name,x,z,floor,yaw] of [['reception',50,47.5,0,0],['upper',40,47.5,1,0]]){
  await page.evaluate(args=>window.__threeBench.pose(...args),[x,z,floor,yaw]);await capture('game-'+name);
 }
 }
 await writeFile(new URL(label+'.json',artifacts),JSON.stringify({samples,hardware,results,errors,warnings:[...new Set(warnings)]},null,2)+'\n');
 assert.deepEqual(errors,[],'Browser/shader errors');
}finally{await browser?.close();server.kill();}
