import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const destination=new URL('./',import.meta.url);await mkdir(destination,{recursive:true});
const mode=process.argv.includes('--compiled')?'compiled':'source';
const label=process.argv.includes('--after')?'after':'before';
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1705,height:878}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async route=>{
  let source=await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8');
  source=source.replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(',`window.shellTest={THREE,walker,workshops,exterior,renderer,timeline,lighting,probe(){return probeWorkshopExterior(THREE,exterior.model);},render(){renderer.render(exterior.scene,exterior.camera);}};window.__manual=true;\n  loadEscapeFrontage(`);
  const probes=(await readFile(new URL('../../test-support/workshop-exterior-probes.mjs',import.meta.url),'utf8')).replace(/^import .*$/gm,'').replace('export function','function');
  source=`import {TOWER_WORKSHOPS} from './tower-workshops.mjs';\nimport {WORKSHOP_GALLERY} from './workshop-gallery.mjs';\n${probes}\n`+source;
  await route.fulfill({contentType:'text/javascript',body:source});
 });
 await page.goto(base+'/explore.html?view=tower-buildings&period=1916&lighting=day&models='+mode,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.shellTest);
 await page.locator('#layoutControls > summary').click();await page.locator('#look').click();
 const results=await page.evaluate(()=>{
  const {THREE,exterior}=shellTest,rows=[],windows=[];exterior.model.updateMatrixWorld(true);
  const scope=exterior.model.getObjectByName('Tower service buildings');
  scope.traverse(o=>{if(o.isMesh&&/walls|roof/.test(o.name)&&!o.userData.aerialBatch){const b=new THREE.Box3().setFromObject(o);rows.push({name:o.name,visible:o.visible,source:!!o.userData.aerialBatchSource,min:b.min.toArray(),max:b.max.toArray()});}});
  exterior.model.traverse(o=>{if(o.userData.aerialWindowAssembly){const b=new THREE.Box3().setFromObject(o);if(b.min.x>140&&b.max.x<185&&b.min.z>-63&&b.max.z<0)windows.push({name:o.name,position:o.getWorldPosition(new THREE.Vector3()).toArray(),min:b.min.toArray(),max:b.max.toArray()});}});
  const gl=shellTest.renderer.getContext();
  return {model:exterior.modelBuild,renderer:gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL),probes:shellTest.probe(),rows,windows};
 });
 for(const [name,position,target] of [
  ['west-cylinder-north',[167,1.8,-32],[159.3,7,-30]],
  ['west-cylinder-south',[166,1.8,-22],[159.3,7,-26]],
  ['gallery-east',[163,1.8,-19],[159.3,7,-23]],
  ['machine-east',[184,1.8,-44],[180,8,-49]],
  ['chimney-south',[169,1.8,-35],[165,8,-41]],
  ['gallery-south',[165,1.8,-13],[158,7,-18]],
  ['west-cylinder-near',[165.3,1.8,-26.5],[159.3,7,-21]],
  ['gallery-windows',[163,1.8,-8],[156.63,2,-5]]
 ]){await page.evaluate(({position,target})=>{shellTest.walker.setView({position,target});shellTest.render();},{position,target});await page.screenshot({path:fileURLToPath(new URL(`${label}-${mode}-${name}.png`,destination))});}
 await page.evaluate(()=>{shellTest.lighting.setMode('night');shellTest.walker.setView({position:[167,1.8,-32],target:[159.3,7,-30]});shellTest.render();});
 await page.screenshot({path:fileURLToPath(new URL(`${label}-${mode}-night.png`,destination))});
 await page.setViewportSize({width:390,height:844});await page.evaluate(async()=>{
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  document.body.classList.add('explore-touch');shellTest.lighting.setMode('day');
  shellTest.walker.setView({position:[167,1.8,-32],target:[159.3,7,-30]});shellTest.render();
 });
 await page.screenshot({path:fileURLToPath(new URL(`${label}-${mode}-phone.png`,destination))});
 await writeFile(new URL(`${label}-${mode}.json`,destination),JSON.stringify({...results,errors},null,2));
 if(label==='after'){assert.equal(results.model.mode,mode==='source'?'procedural':'compiled');assert.deepEqual(results.probes.leaks,[]);assert.deepEqual(results.probes.floating,[]);assert.deepEqual(results.probes.trim,[]);assert.deepEqual(results.probes.roofLeaks,[]);assert.deepEqual(results.probes.roofStrips,[]);assert.deepEqual(errors,[]);}
 console.log(JSON.stringify({model:results.model,renderer:results.renderer,probes:results.probes,errors}));
}finally{await browser?.close();server.kill();}
