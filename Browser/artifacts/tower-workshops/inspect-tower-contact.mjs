import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

// Reuse the real-game inspection controls from the grounds walkthrough.
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8');
const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/THREE|shader|WebGL/i.test(message.text()))errors.push(message.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>{
  const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
  await route.fulfill({contentType:'text/javascript',body:source+instrument});
 });
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);
 await page.evaluate(()=>{const t=groundsTest;t.begin();t.grounds.use(t.grounds.nodes.find(n=>n.id==='tower-door'));});
 const validation=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js');
  const t=groundsTest,tower=t.exterior.model.getObjectByName('Water tower · rear-right clearing');
  const ray=(root,origin,direction)=>{const meshes=[];root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});return new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,10).intersectObjects(meshes,false)[0];};
  const faces=[];
  for(const y of [.15,1.65,3,4.9]){
   for(const x of [146.7,148,150,151.5,152.8])faces.push({origin:[x,y,-46.6],direction:[0,0,-1]});
   for(const z of [-58.5,-56,-52])faces.push({origin:[156.3,y,z],direction:[-1,0,0]});
  }
  const faceFailures=faces.filter(view=>{const expected=ray(tower,view.origin,view.direction),actual=ray(t.exterior.model,view.origin,view.direction);return !expected||actual?.object!==expected.object||actual.point.distanceTo(expected.point)>1e-6;});
  const gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
  return {renderer:info&&gl.getParameter(info.UNMASKED_RENDERER_WEBGL),faceSamples:faces.length,faceFailures,vestibuleClear:t.walker.clear(152.45,-48.5),partitionBlocked:!t.walker.clear(153.1,-48.5),towerBlocked:!t.walker.clear(151.5,-50)};
 });
 assert.deepEqual(validation.faceFailures,[]);assert(validation.vestibuleClear&&validation.partitionBlocked&&validation.towerBlocked);
 const views=[['tower-face-from-vestibule',150.1,-46.6,.25,.08],['tower-right-wall-contact',152.2,-48.4,-.35,.08],['tower-east-face-from-corridor',156.3,-55.2,Math.PI/2,.07]];
 for(const [name,x,z,yaw,pitch]of views){await page.evaluate(p=>groundsTest.pose(...p),[x,z,yaw,pitch]);await page.screenshot({path:fileURLToPath(new URL(name+'.png',import.meta.url))});}
 await page.evaluate(()=>{groundsTest.exterior.lighting.setNight(false);groundsTest.pose(150.1,-46.6,.25,.08);});
 await page.screenshot({path:fileURLToPath(new URL('tower-face-daylight.png',import.meta.url))});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>groundsTest.pose(152.2,-48.4,-.35,.08));
 await page.screenshot({path:fileURLToPath(new URL('tower-right-wall-phone.png',import.meta.url))});
 assert.deepEqual(errors,[]);await writeFile(new URL('tower-contact-validation.json',import.meta.url),JSON.stringify({validation,errors},null,2));
 console.log(JSON.stringify({validation,errors},null,2));
}finally{await browser?.close();server.kill();}
