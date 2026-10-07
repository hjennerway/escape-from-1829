import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const destination=new URL('./',import.meta.url);await mkdir(destination,{recursive:true});
const stage=process.env.LIGHT_STAGE??'before';
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8'),instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt')+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setMode('day');});await page.keyboard.press('f');
 for(const [name,pose] of Object.entries({'gallery':[154.773125,-88,0,-.12],'gallery-forward':[154.773125,-94,0,-.12],'window':[154.773125,-88,Math.PI/2,-.25],'machine':[168,-51,Math.PI,.05],'door':[154.773125,-40,Math.PI/2,-.08]})){
  await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',destination))});
 }
 const runs=await page.evaluate(async()=>{const {ESCAPE_CORRIDOR_RUNS}=await import('/escape-corridor-plan.mjs');return ESCAPE_CORRIDOR_RUNS;});
 for(const mode of ['day','dusk','night']){
  await page.evaluate(mode=>groundsTest.exterior.lighting.setMode(mode),mode);
  for(const run of runs){const dx=run.end[0]-run.start[0],dz=run.end[1]-run.start[1],length=Math.hypot(dx,dz);for(const side of [-1,1]){
   const fraction=side===1?.4:.6,pose=[run.start[0]+dx*fraction,run.start[1]+dz*fraction,Math.atan2(-dx*side,-dz*side),-.08];
   await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+run.id+'-'+side+'.png',destination))});
  }}
 }
 await page.evaluate(()=>groundsTest.exterior.lighting.setMode('dusk'));
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.evaluate(()=>groundsTest.pose(154.773125,-88,0,-.08));await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',destination))});
 await page.setViewportSize({width:1280,height:820});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.evaluate(()=>groundsTest.exterior.lighting.setMode('day'));
 const result=await page.evaluate(()=>{
  const t=groundsTest,w=t.grounds.workshops,gl=t.renderer.getContext(),report={};
  const measure=(name,frame)=>{const times=[],calls=[];for(let i=0;i<50;i++){const begin=performance.now();frame(i);t.render();gl.finish();if(i>=10){times.push(performance.now()-begin);calls.push(t.renderer.info.render.calls);}}times.sort((a,b)=>a-b);report[name]={medianMs:times[20],p95Ms:times[38],draws:Math.max(...calls)};};
  t.pose(154.773125,-88,0,-.12);measure('still',()=>t.step(1/60));
  measure('walking',i=>t.pose(154.773125,-78-i*.3,0,-.12));
  t.pose(154.773125,-40,Math.PI/2,-.08);w.setDoorOpen('workshop-door:repair',true);measure('door',()=>t.step(1/60));
  report.lights=w.lighting.lamps.length;report.atlasBakes=w.lighting.bakes;report.renderer=gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  return report;
 });
 await writeFile(new URL(stage+'.json',destination),JSON.stringify({result,errors},null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify({result,errors},null,2));
}finally{await browser?.close();server.kill();}
