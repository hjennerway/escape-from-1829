import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const label=process.argv[2]??'before';
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8');
const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1307,height:700}});page.setDefaultTimeout(180000);
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/THREE|shader|WebGL/i.test(message.text()))errors.push(message.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>{
  const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
  await route.fulfill({contentType:'text/javascript',body:source+instrument});
 });
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);
 await page.evaluate(()=>groundsTest.begin());
 const validation=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=groundsTest,meshes=[];
  t.exterior.model.updateMatrixWorld(true);t.exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  const probes=[];
  for(const z of [-49,-48,-46,-43.8,-43.55,-43.45,-42,-40.5,-38.5,-36.45,-36.35,-35,-33,-30,-28,-26.95,-26.85,-26.7])for(const y of [.3,1,2,3,4.5,5.09,5.2,6,7,8.5]){
   const ray=new THREE.Raycaster(new THREE.Vector3(140,y,z),new THREE.Vector3(1,0,0),0,10);
   const hits=ray.intersectObjects(meshes,false).filter(h=>Math.abs(h.point.x-146.3)<.6);
   const rows=hits.map(h=>({name:h.object.name,parent:h.object.parent.name,x:h.point.x,material:[h.object.material].flat().map(m=>m.name||m.color?.getHexString()),source:h.object.userData.aerialBatchSource??false}));
   if(rows.filter(h=>Math.abs(h.x-146.3)<.005).length>1)probes.push({z,y,hits:rows});
  }
  const gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
  return {renderer:info&&gl.getParameter(info.UNMASKED_RENDERER_WEBGL),probes,exposedOverlaps:probes.filter(p=>Math.abs(p.hits[0].x-146.3)<.005)};
 });
 if(label!=='before')assert.deepEqual(validation.exposedOverlaps,[],'No competing visible faces on the marked wall');
 for(const [name,x,z,yaw,pitch]of [['west',123,-43,-Math.PI/2,0],['oblique',131,-30,-1.1,.04],['door',141,-44.75,-Math.PI/2,.02],['west-shifted',124,-42.6,-Math.PI/2,.01]]){
  await page.evaluate(p=>groundsTest.pose(...p),[x,z,yaw,pitch]);
  await page.screenshot({path:fileURLToPath(new URL(label+'-'+name+'.png',import.meta.url))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>groundsTest.pose(134,-39,-Math.PI/2,.04));
 await page.screenshot({path:fileURLToPath(new URL(label+'-phone.png',import.meta.url))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(label+'-validation.json',import.meta.url),JSON.stringify({validation,errors},null,2));
 console.log(JSON.stringify({renderer:validation.renderer,exposedOverlapSamples:validation.exposedOverlaps.length,occludedOverlapSamples:validation.probes.length-validation.exposedOverlaps.length,errors},null,2));
}finally{await browser?.close();server.kill();}
