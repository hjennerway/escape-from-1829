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
 const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/THREE|shader|WebGL/i.test(message.text()))errors.push(message.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>{
  const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
  await route.fulfill({contentType:'text/javascript',body:source+instrument});
 });
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);
 await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});
 async function shot(name,pose){await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(label+'-'+name+'.png',import.meta.url))});}
 await shot('tower-junction',[136,-43,-1.12,.14]);
 await shot('door',[140,-44.75,-Math.PI/2,.16]);
 await shot('base',[142.2,-40.5,-Math.PI/2,-.40]);
 await shot('south-corner',[140,-30,-Math.PI/2,-.22]);
 const validation=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=groundsTest,w=t.grounds.workshops;
  const gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info'),meshes=[];
  t.exterior.model.updateMatrixWorld(true);t.exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  const westX=w.plan.westX,groundY=t.exterior.terrain.position.y,hits=[];
  for(const z of [-49.4,-43.55,-43.45,-40.7,-36.35,-33.1,-26.85])for(const y of [groundY+.02,-.02,.02,.58,.62,1,5.07,8]){
   const ray=new THREE.Raycaster(new THREE.Vector3(westX-.25,y,z),new THREE.Vector3(1,0,0),0,.27),r=ray.intersectObjects(meshes,false);
   hits.push({z,y,count:r.length,x:r[0]?.point.x,names:r.map(h=>h.object.name)});
  }
  const parts=[];w.group.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch&&/Stores west|Sash base|Opening header/.test(o.name)){const b=new THREE.Box3().setFromObject(o);parts.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});}});
  return {renderer:info&&gl.getParameter(info.UNMASKED_RENDERER_WEBGL),modelMode:t.exterior.modelBuild,groundY,westX,hits,parts};
 });
 await page.setViewportSize({width:390,height:844});await shot('phone',[136,-43,-1.12,.14]);
 assert.deepEqual(errors,[]);
 if(label!=='before')assert(validation.hits.every(h=>h.count===1&&Math.abs(h.x-validation.westX)<1e-5),'One grounded facade at the planned position: '+JSON.stringify(validation.hits.filter(h=>h.count!==1||Math.abs(h.x-validation.westX)>=1e-5)));
 await writeFile(new URL(label+'-validation.json',import.meta.url),JSON.stringify({validation,errors},null,2));
 console.log(JSON.stringify({renderer:validation.renderer,modelMode:validation.modelMode,groundY:validation.groundY,westX:validation.westX,facadeSamples:validation.hits.length,missing:validation.hits.filter(h=>h.count!==1),errors},null,2));
}finally{await browser?.close();server.kill();}
