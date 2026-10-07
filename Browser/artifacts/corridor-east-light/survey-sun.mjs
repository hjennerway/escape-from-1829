import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const destination=new URL('./',import.meta.url);await mkdir(destination,{recursive:true});
const stage=process.env.LIGHT_STAGE??'before';
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8'),instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt')+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setMode('day');});await page.keyboard.press('f');


 const report=await page.evaluate(async()=>{
 const THREE=await import('/vendor/three.module.js'),t=groundsTest,w=t.grounds.workshops;
 t.pose(154.773125,-109,0,-.4);
 const casters=[];t.exterior.model.traverseVisible(o=>{if(o.isMesh&&o.castShadow){casters.push(o);o.raycast=o.isInstancedMesh?THREE.InstancedMesh.prototype.raycast:THREE.Mesh.prototype.raycast;[o.material].flat().forEach(m=>m.side=THREE.DoubleSide);}});
 const windows=w.lighting.windows.filter(o=>o.radius&&o.position.x>156&&o.position.x<157),results=[];
 for(const slope of [.45,.65,.85,1.05,1.25,1.55]){
  const direction=new THREE.Vector3(1,slope,.2).normalize(),clear=[];
  for(const a of windows)for(const y of [1.7,1.9,2.0,2.2,2.35])for(const dx of [-.25,.25]){
   const p=a.fixture.localToWorld(new THREE.Vector3(a.x+dx,y,a.z-.17));
   const floor=p.clone().addScaledVector(direction,(.04-p.y)/direction.y);if(floor.x<153.3)continue;
   const hits=new THREE.Raycaster(floor.clone().add(new THREE.Vector3(0,.01,0)),direction,.01,40).intersectObjects(casters,false);
   if(!hits.length)clear.push({p:p.toArray(),floor:floor.toArray()});
  }
  results.push({slope,count:clear.length,clear:clear.slice(0,4)});
 }
 return results;
 });
 console.log(JSON.stringify(report,null,2));
 await page.screenshot({path:fileURLToPath(new URL('debug-ray.png',destination))});
}finally{await browser?.close();server.kill();}


