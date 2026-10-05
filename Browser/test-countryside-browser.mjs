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
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__countryside={exterior,renderer,lighting,controls};function frame(){if(!window.__freezeScene)requestAnimationFrame(frame);')});});
 await page.goto(base+'/aerial.html?models=source');await page.waitForFunction(()=>window.__countryside?.renderer.info.render.frame>3);
 await page.evaluate(()=>{window.__freezeScene=true;});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await page.evaluate(()=>{
  const {exterior,controls}=window.__countryside;exterior.trees.visible=true;exterior.invalidateShadows();
  exterior.camera.position.set(260,210,620);exterior.camera.lookAt(190,0,-20);controls.sync([190,0,-20]);
 });
 for(const [width,height] of [[1440,900],[390,844],[320,760]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));
  for(const mode of ['day','dusk','night']){
   await page.locator('[data-lighting="'+mode+'"]').click();
   report[mode+width]=await page.evaluate(()=>{
    const {exterior,renderer,lighting}=window.__countryside;lighting.update();renderer.render(exterior.scene,exterior.camera);
    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=100;const context=canvas.getContext('2d');context.drawImage(renderer.domElement,0,0,160,100);
    const pixels=context.getImageData(0,0,160,100).data,colors=new Set(),sky=new Set();let visible=0;
    for(let i=0;i<pixels.length;i+=4){const color=[pixels[i]>>3,pixels[i+1]>>3,pixels[i+2]>>3].join(',');colors.add(color);if(i<160*12*4)sky.add(color);if(pixels[i]+pixels[i+1]+pixels[i+2]>15)visible++;}
    return {mode:lighting.mode,visible,colors:colors.size,sky:sky.size,lit:lighting.windows.selected.length,windows:lighting.windows.visibleCount,far:exterior.camera.far};
   });
   const result=report[mode+width];console.log(mode,width,result);assert.equal(result.mode,mode);assert(result.visible>15000&&result.colors>50,'Detailed, nonblank landscape');if(width>1000)assert(result.sky>8,'Horizon contains cloud detail');
   assert.equal(result.lit,mode==='day'?0:Math.round(result.windows/(mode==='dusk'?2.4:10)));
   await page.screenshot({path:fileURLToPath(new URL('aerial-'+mode+'-'+width+'.png',artifacts))});
  }
  const controls=await page.locator('#previewNav a,#dayNightToggle button,#deviceLocationButton,#locationsButton,#resetAerial').evaluateAll(elements=>elements.filter(e=>!e.closest('#locationsPanel')).map(e=>{const b=e.getBoundingClientRect();return {name:e.id||e.getAttribute('aria-label'),x:b.x,y:b.y,w:b.width,h:b.height};}));
  for(const a of controls){assert(a.x>=0&&a.x+a.w<=width+.1,a.name+' fits screen');for(const b of controls)if(a!==b)assert(a.x+a.w<=b.x+.1||b.x+b.w<=a.x+.1||a.y+a.h<=b.y+.1||b.y+b.h<=a.y+.1,a.name+' does not overlap '+b.name);}
 }
 await page.setViewportSize({width:1000,height:700});
 report.shadowMotion=await page.evaluate(()=>{
  const {exterior,renderer,lighting}=window.__countryside;lighting.setMode('day');
  exterior.camera.position.set(-120,140,-180);exterior.camera.lookAt(-120,0,-200);
  const canvas=document.createElement('canvas');canvas.width=100;canvas.height=70;const context=canvas.getContext('2d');
  function pixels(){renderer.render(exterior.scene,exterior.camera);context.drawImage(renderer.domElement,0,0,100,70);return context.getImageData(0,0,100,70).data;}
  const before=pixels();for(let i=0;i<600;i++)lighting.atmosphere.update(.1);const after=pixels();let changed=0;
  for(let i=0;i<before.length;i+=4)if(Math.abs(before[i]-after[i])+Math.abs(before[i+1]-after[i+1])+Math.abs(before[i+2]-after[i+2])>2)changed++;
  return changed;
 });assert(report.shadowMotion>100,'Cloud shadows visibly move over the ground');
 assert.deepEqual(errors,[]);await writeFile(new URL('countryside-report.json',artifacts),JSON.stringify(report,null,2));
 console.log('PASS: detailed aerial horizon, day/dusk/night, one-in-ten night windows, moving cloud shadows and nonoverlapping desktop/mobile controls. '+JSON.stringify(report));
}finally{await browser?.close();server.kill();}
