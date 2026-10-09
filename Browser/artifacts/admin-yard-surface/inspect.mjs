import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const mode=process.argv.includes('--compiled')?'compiled':'source';
const label=process.argv.includes('--after')?'after':'before';
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1271,height:769}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 if(process.argv.includes('--baseline'))await page.route('**/tower-workshops.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('./before-tower-workshops.mjs',import.meta.url),'utf8')}));
 await page.route('**/explore.mjs',async route=>{
  let source=await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8');
  source=source.replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(',`window.yardTest={THREE,walker,workshops,exterior,renderer,timeline,lighting,probe(){return probeWorkshopAdminYard(THREE,exterior.model);},render(){renderer.render(exterior.scene,exterior.camera);}};window.__manual=true;\n  loadEscapeFrontage(`);
  const probes=(await readFile(new URL('../../test-support/workshop-exterior-probes.mjs',import.meta.url),'utf8')).replace(/^import .*$/gm,'').replaceAll('export function','function');
  source=`import {TOWER_WORKSHOPS} from './tower-workshops.mjs';\nimport {WORKSHOP_GALLERY} from './workshop-gallery.mjs';\n${probes}\n`+source;
  await route.fulfill({contentType:'text/javascript',body:source});
 });
 await page.goto(base+'/explore.html?view=tower-buildings&period=1916&lighting=dusk&models='+mode,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.yardTest);
 await page.locator('#layoutControls > summary').click();await page.locator('#look').click();
 await page.addStyleTag({content:'body * {visibility:hidden !important} canvas {visibility:visible !important}'});
 const results=await page.evaluate(()=>{
  const {THREE,exterior,renderer}=yardTest,meshes=[],rows=[],ground=[];exterior.model.updateMatrixWorld(true);
  exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  exterior.model.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch){const b=new THREE.Box3().setFromObject(o);if(b.min.x<163&&b.max.x>156.7&&b.min.z<18&&b.max.z>-17&&b.min.y<5)rows.push({name:o.name,parents:[o.parent?.name,o.parent?.parent?.name],visible:o.visible,source:!!o.userData.aerialBatchSource,min:b.min.toArray(),max:b.max.toArray()});}});
  for(const x of [156.8,157.5,158.5,159,160,161,162,163,170])for(const z of [-15,-6,0,6,7,9,10,12,14,16,17]){
   const hits=new THREE.Raycaster(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0),0,2).intersectObjects(meshes,false);
   ground.push({x,z,hits:hits.slice(0,3).map(h=>({name:h.object.name,y:h.point.y,surface:!!h.object.material.userData.estateSurface}))});
  }
  const gl=renderer.getContext();return {model:exterior.modelBuild,renderer:gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL),rows,ground,probes:yardTest.probe()};
 });
 for(const [name,position,target] of [
  ['passage',[166,2.14,-5],[159.5,2.14,5.5]],
  ['junction',[161.2,2.14,3.3],[158.3,2.7,6.6]],
  ['junction-reverse',[157.2,2.14,-2],[160,2.7,6.6]],
  ['overview',[169,20,8],[156,0,7]],
  ['ground',[165,6,16],[158,0,2]]
 ]){await page.evaluate(({position,target})=>{const camera=yardTest.exterior.camera;camera.position.set(...position);camera.lookAt(...target);yardTest.render();},{position,target});await page.screenshot({path:fileURLToPath(new URL(`${label}-${mode}-${name}.png`,import.meta.url))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{yardTest.exterior.camera.aspect=390/844;yardTest.exterior.camera.updateProjectionMatrix();yardTest.exterior.camera.position.set(161.2,2.14,3.3);yardTest.exterior.camera.lookAt(158.3,2.7,6.6);yardTest.render();});
 await page.screenshot({path:fileURLToPath(new URL(`${label}-${mode}-phone.png`,import.meta.url))});
 await writeFile(new URL(`${label}-${mode}.json`,import.meta.url),JSON.stringify({...results,errors},null,2));
 if(label==='after'){assert.equal(results.model.mode,mode==='source'?'procedural':'compiled');assert.deepEqual(results.probes.ground,[]);assert.deepEqual(results.probes.wall,[]);assert.deepEqual(results.probes.roof,[]);assert.deepEqual(results.probes.debris,[]);assert.deepEqual(errors,[]);}
 console.log(JSON.stringify({model:results.model,renderer:results.renderer,probes:results.probes,errors}));
}finally{await browser?.close();server.kill();}
