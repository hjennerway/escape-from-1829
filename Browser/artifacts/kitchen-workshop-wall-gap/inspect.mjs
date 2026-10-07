import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const label=process.argv[2]??'before';
await mkdir(new URL('./',import.meta.url),{recursive:true});
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8');
const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1000,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/THREE|shader|WebGL/i.test(message.text()))errors.push(message.text());});
 await page.route('https://**/*',route=>route.abort());
 if(label==='before')await page.route('**/tower-workshops.mjs',async route=>{
  const source=await readFile(new URL('../../dist/tower-workshops.mjs',import.meta.url),'utf8');
  await route.fulfill({contentType:'text/javascript',body:source.replace('startPadding:x0===westX?0:.32','startPadding:.32')});
 });
 await page.route('**/game.mjs',async route=>{
  const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
  await route.fulfill({contentType:'text/javascript',body:source+instrument});
 });
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);
 await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});
 await page.keyboard.press('f');
 await page.addStyleTag({content:'#hud,#touch,#headStart,body>header{visibility:hidden}'});
 async function shot(name,pose){await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(label+'-'+name+'.png',import.meta.url))});}
 await shot('junction',[144.3,-28.8,-2.65,.03]);
 await shot('close',[144.6,-27.8,-2.75,.03]);
 await shot('west',[142,-29,-2.95,.03]);
 await page.evaluate(()=>groundsTest.exterior.lighting.setNight(true));
 await shot('night',[144.3,-28.8,-2.65,.03]);
 const validation=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=groundsTest,meshes=[];
  t.exterior.model.updateMatrixWorld(true);t.exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  const gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info'),hits=[];
  for(const x of [144.7,144.9,145.06,145.1,145.2,145.3,145.39,145.5])for(const y of [.2,.7,1.65,3.8,4.5]){
   const ray=new THREE.Raycaster(new THREE.Vector3(x,y,-27),new THREE.Vector3(0,0,1),0,.8),r=ray.intersectObjects(meshes,false);
   hits.push({x,y,count:r.length,names:r.map(h=>h.object.name),points:r.map(h=>h.point.toArray())});
  }
  const parts=[];t.exterior.model.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch&&/Main kitchen (walls|plinth)/.test(o.name)){const b=new THREE.Box3().setFromObject(o);parts.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});}});
  return {renderer:info&&gl.getParameter(info.UNMASKED_RENDERER_WEBGL),modelMode:t.exterior.modelBuild,hits,parts};
 });
 assert.deepEqual(errors,[]);
 if(label!=='before')assert(validation.hits.filter(h=>h.x<145.4).every(h=>h.count===1&&Math.abs(h.points[0][2]+26.6)<1e-5),'Kitchen facade extends continuously to the workshop');
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(100);await shot('phone',[144.3,-28.8,-2.65,.03]);
 await writeFile(new URL(label+'-validation.json',import.meta.url),JSON.stringify({validation,errors},null,2));
 console.log(JSON.stringify({renderer:validation.renderer,modelMode:validation.modelMode,missing:validation.hits.filter(h=>!h.count),parts:validation.parts,errors},null,2));
}finally{await browser?.close();server.kill();}
