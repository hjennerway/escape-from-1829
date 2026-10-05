import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const artifacts=new URL('./artifacts/atmosphere/',import.meta.url);await mkdir(artifacts,{recursive:true});
let browser;const errors=[],report={};
try{
 browser=await launchHardwareBrowser({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1280,height:800}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_FAILED'))errors.push(m.text());});
 await page.route(/https:\/\/(www\.whateversleft\.co\.uk|basedinchurton\.co\.uk)\//,route=>route.abort());
 await page.route('**/game.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('requestAnimationFrame(animate);','if(!window.freezeAtmosphere)requestAnimationFrame(animate);')+'\nwindow.__atmosphere={get exterior(){return exterior;},get renderer(){return renderer;},get scene(){return scene;},get camera(){return camera;},get ready(){return ready;},get state(){return state;},start,arrival:()=>arrivalCutscene,finish};'});});
 await page.goto(base+'/');await page.waitForFunction(()=>window.__atmosphere?.ready&&document.querySelector('#game').classList.contains('scene-ready'));
 await page.screenshot({path:fileURLToPath(new URL('menu-desktop.png',artifacts))});
 await page.evaluate(()=>{window.freezeAtmosphere=true;});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 report.dusk=await page.evaluate(()=>{const {exterior}=window.__atmosphere;return {mode:exterior.lighting.atmosphere.mode,lit:exterior.lighting.windows.selected.length,visible:exterior.lighting.windows.visibleCount,lights:exterior.lighting.lights.length};});
 assert.equal(report.dusk.mode,'dusk');assert.equal(report.dusk.lit,Math.round(report.dusk.visible/2.4));assert.equal(report.dusk.lights,8);
 async function front(width,height){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  return page.evaluate(()=>{
   const {exterior,renderer}=window.__atmosphere;document.querySelector('#menu').hidden=true;
   for(const selector of ['.brand','.credits-link','#location'])document.querySelector(selector).style.visibility='hidden';
   exterior.camera.position.set(0,5,innerWidth<600?130:76);exterior.camera.lookAt(0,9.5,19.8);
   if(!window.fixedAtmosphereFrame){const draw=()=>{renderer.render(exterior.scene,exterior.camera);window.fixedAtmosphereFrame=requestAnimationFrame(draw);};draw();}
   exterior.lighting.update();renderer.render(exterior.scene,exterior.camera);
   const c=document.createElement('canvas');c.width=96;c.height=64;const g=c.getContext('2d');g.drawImage(renderer.domElement,0,0,96,64);
   const data=g.getImageData(0,0,96,64).data;let visible=0;const colors=new Set();for(let i=0;i<data.length;i+=4){if(data[i]+data[i+1]+data[i+2]>35)visible++;colors.add((data[i]>>4)+','+(data[i+1]>>4)+','+(data[i+2]>>4));}
   return {visible,colors:colors.size,calls:renderer.info.render.calls};
  });
 }
 for(const [width,height] of [[1280,800],[390,844]]){
  report['front'+width]=await front(width,height);console.log('Front canvas '+width,report['front'+width],errors);
  const png=await page.screenshot({path:fileURLToPath(new URL('dusk-front-'+width+'.png',artifacts))});
  const screenColors=await page.evaluate(async encoded=>{
   const image=await createImageBitmap(new Blob([Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))],{type:'image/png'}));
   const c=new OffscreenCanvas(96,64),g=c.getContext('2d');g.drawImage(image,0,0,96,64);image.close();const p=g.getImageData(0,0,96,64).data,colors=new Set();
   for(let i=0;i<p.length;i+=4)colors.add((p[i]>>4)+','+(p[i+1]>>4)+','+(p[i+2]>>4));return colors.size;
  },png.toString('base64'));
  assert(screenColors>45,'The composited screenshot must also contain the rendered scene');
  assert(report['front'+width].visible>4000);assert(report['front'+width].colors>45);
 }
 await front(1280,800);
 report.cloudMotion=await page.evaluate(()=>{
  const {exterior,renderer}=window.__atmosphere;exterior.camera.lookAt(-150,90,-150);
  const c=document.createElement('canvas');c.width=96;c.height=64;const g=c.getContext('2d');
  function pixels(){renderer.render(exterior.scene,exterior.camera);g.drawImage(renderer.domElement,0,0,96,64);return g.getImageData(0,0,96,64).data;}
  const before=pixels();for(let i=0;i<180;i++)exterior.lighting.atmosphere.update(.1);const after=pixels();let changed=0;
  for(let i=0;i<before.length;i+=4)if(Math.abs(before[i]-after[i])+Math.abs(before[i+1]-after[i+1])+Math.abs(before[i+2]-after[i+2])>5)changed++;
  return changed;
 });assert(report.cloudMotion>100,'Clouds must visibly move in the rendered canvas');
 await page.screenshot({path:fileURLToPath(new URL('sky.png',artifacts))});
 await page.evaluate(()=>{const a=window.__atmosphere;a.start();a.arrival().update(3);window.freezeAtmosphere=false;});
 // Resume the normal render loop after the fixed visual captures.
 await page.evaluate(()=>location.reload());await page.waitForFunction(()=>window.__atmosphere?.ready);
 await page.locator('#start').click();await page.waitForFunction(()=>window.__atmosphere.state==='play');
 await page.screenshot({path:fileURLToPath(new URL('interior.png',artifacts))});
 assert.equal(await page.evaluate(()=>window.__atmosphere.renderer.toneMappingExposure),1.25);
 assert.deepEqual(errors,[]);await writeFile(new URL('report.json',artifacts),JSON.stringify(report,null,2));
 console.log('PASS: desktop/mobile dusk, nonblank detailed canvas, visible cloud movement, warm windows and interior handoff. '+JSON.stringify(report));
}finally{await browser?.close();server.kill();}
