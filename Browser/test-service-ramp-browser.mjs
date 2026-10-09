import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL('./artifacts/service-ramp/',import.meta.url);
await mkdir(destination,{recursive:true});
const before=process.argv.includes('--before'),mode=process.argv.includes('--compiled')?'compiled':'source';
const label=before?'before':'after';
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1294,height:641}});
 page.setDefaultTimeout(180000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/service-ramp-probes.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./test-support/service-ramp-probes.mjs',import.meta.url),'utf8')).replaceAll('../dist/','./')}));
 if(before)for(const name of ['tower-buildings','explore-controls','asylum-outside'])await page.route('**/'+name+'.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-'+name+'.mjs',destination),'utf8')}));
 await page.route('**/explore.mjs',async route=>{
  let source=await readFile(new URL('./dist/explore.mjs',import.meta.url),'utf8');
  source="import {probeServiceRamp} from './service-ramp-probes.mjs';\n"+source.replace('clock.update();const dt','if(window.__manualRamp)return;clock.update();const dt').replace('  loadEscapeFrontage(',`window.rampTest={THREE,walker,workshops,exterior,renderer,timeline,lighting,probe(){return probeServiceRamp(THREE,exterior);},render(){renderer.render(exterior.scene,exterior.camera);}};window.__manualRamp=true;\n  loadEscapeFrontage(`);
  await route.fulfill({contentType:'text/javascript',body:source});
 });
 await page.goto(base+'/explore.html?view=tower-buildings&period=1916&lighting=day&models='+mode,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.rampTest||document.getElementById('lookHint')?.textContent.includes('could not load'));
 const loadFailure=await page.evaluate(()=>window.rampTest?null:document.getElementById('lookHint')?.textContent);
 if(loadFailure){await writeFile(new URL(`${label}-${mode}-failure.json`,destination),JSON.stringify({loadFailure,errors},null,2));throw new Error(loadFailure+' '+errors.join('; '));}
 await page.locator('#layoutControls > summary').click();await page.locator('#look').click();
 const report=await page.evaluate(()=>{
  const gl=rampTest.renderer.getContext();
  return {model:rampTest.exterior.modelBuild,renderer:gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL),...rampTest.probe()};
 });
 for(const [name,position,target] of [
  ['lower-end',[231,1.8,4.35],[207,1.4,4.35]],
  ['side',[208,1.8,10],[208,.7,4.35]],
  ['upper-end',[191,1.8,6.4],[212,.8,4.4]],
  ['reference',[199,1.8,5.45],[225,.9,3.85]]
 ]){
  await page.evaluate(({position,target})=>{rampTest.walker.setView({position,target});rampTest.render();},{position,target});
  await page.screenshot({path:fileURLToPath(new URL(`${label}-${mode}-${name}.png`,destination))});
 }
 await page.evaluate(()=>{rampTest.lighting.setMode('dusk');rampTest.walker.setView({position:[199,1.8,5.45],target:[225,.9,3.85]});rampTest.render();});
 await page.screenshot({path:fileURLToPath(new URL(`${label}-${mode}-dusk.png`,destination))});
 await writeFile(new URL(`${label}-${mode}.json`,destination),JSON.stringify({...report,errors},null,2)+'\n');
 if(!before){
  assert.equal(report.model.mode,mode==='source'?'procedural':'compiled');
  assert.deepEqual(report.leaks,[]);for(const w of report.walks){assert.deepEqual(w.errors,[]);assert(w.upper.x<report.bounds.min[0]+.5);assert(w.end.x>report.bounds.max[0]+.9);}
  assert(report.jump.started&&!report.jump.airborne&&Math.abs(report.jump.y-report.jump.expected)<1e-5);
 }else{assert(report.leaks.length>0);assert(report.walks.every(w=>w.errors.some(e=>e.reason==='blocked')),'Baseline reproduces lower-end invisible wall');}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({label,mode,renderer:report.renderer,leaks:report.leaks.length,walkErrors:report.walks.map(w=>w.errors),jump:report.jump,errors}));
}finally{await browser?.close();server.kill();}
