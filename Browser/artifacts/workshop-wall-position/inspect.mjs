import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const label=process.argv[2]??'after';
await mkdir(new URL('./',import.meta.url),{recursive:true});
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8');
const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1191,height:862}});page.setDefaultTimeout(180000);
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
 await shot('tower-junction',[136,-43,-1.12,.22]);
 await shot('west',[131,-42,-Math.PI/2,.08]);
 await shot('door',[140,-44.75,-Math.PI/2,.08]);
 const validation=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=groundsTest,w=t.grounds.workshops;
  const gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
  const meshes=[];t.exterior.model.updateMatrixWorld(true);t.exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  const westX=w.plan.westX,hits=[];
  for(const z of [-49.4,-43.55,-43.45,-40.7,-36.35,-33.1,-26.85])for(const y of [.02,1,5.07,5.11,8]){
   const ray=new THREE.Raycaster(new THREE.Vector3(westX-.01,y,z),new THREE.Vector3(1,0,0),0,.04),r=ray.intersectObjects(meshes,false);
   hits.push({z,y,count:r.length,x:r[0]?.point.x});
  }
  return {renderer:info&&gl.getParameter(info.UNMASKED_RENDERER_WEBGL),modelMode:t.exterior.modelBuild,westX,entrance:w.plan.entrance,tools:w.plan.tools,hits};
 });
 assert(validation.hits.every(h=>h.count===1&&Math.abs(h.x-validation.westX)<1e-5),'One visible facade surface at its planned position: '+JSON.stringify(validation.hits.filter(h=>h.count!==1||Math.abs(h.x-validation.westX)>=1e-5)));
 await page.evaluate(()=>{const t=groundsTest;t.grounds.use(t.grounds.nodes.find(n=>n.id==='tower-door'));for(const n of t.grounds.nodes.filter(n=>n.id.startsWith('workshop-door:')))t.grounds.use(n);});
 await shot('vestibule',[150.1,-46.6,.25,.08]);
 await shot('repair',[151.2,-39.9,Math.PI/2,-.12]);
 await shot('oil-store',[151.8,-28.5,.85,-.12]);
 validation.walkSamples=await page.evaluate(()=>{const t=groundsTest;t.pose(144,-44.75,-Math.PI/2);return [{x:156,z:-44.75},...t.grounds.nodes.filter(n=>['crowbar','oil'].includes(n.id))].map(p=>({point:p,samples:t.walk(p)}));});
 const cleanStyle=await page.addStyleTag({content:'#hud,#interact,#pause,.vignette{display:none!important}'});
 await shot('tower-junction-clean',[136,-43,-1.12,.22]);
 await cleanStyle.evaluate(style=>style.remove());
 await page.setViewportSize({width:390,height:844});await shot('phone',[136,-43,-1.12,.22]);
 assert.deepEqual(errors,[]);
 await writeFile(new URL(label+'-validation.json',import.meta.url),JSON.stringify({validation,errors},null,2));
 console.log(JSON.stringify({renderer:validation.renderer,modelMode:validation.modelMode,westX:validation.westX,walkSamples:validation.walkSamples,errors},null,2));
}finally{await browser?.close();server.kill();}
