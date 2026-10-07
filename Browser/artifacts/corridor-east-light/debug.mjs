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
 const sun=t.exterior.scene.children.find(o=>o.isDirectionalLight),direction=sun.position.clone().sub(sun.target.position).normalize();
 const point=new THREE.Vector3(155.10464285714286,.041,-110.84200892857142),ray=new THREE.Raycaster(point,direction,.01,200),hits=[];
 t.exterior.model.traverseVisible(o=>{if(!o.isMesh)return;const sides=[o.material].flat().map(m=>m.side);[o.material].flat().forEach(m=>m.side=THREE.DoubleSide);const out=[];(o.isInstancedMesh?THREE.InstancedMesh:THREE.Mesh).prototype.raycast.call(o,ray,out);[o.material].flat().forEach((m,i)=>m.side=sides[i]);for(const h of out)hits.push({name:o.name,cast:o.castShadow,parent:o.parent.name,point:h.point.toArray(),distance:h.distance});});
 return {sun:sun.getWorldPosition(new THREE.Vector3()).toArray(),target:sun.target.getWorldPosition(new THREE.Vector3()).toArray(),hits:hits.sort((a,b)=>a.distance-b.distance).slice(0,50)};
 });
 console.log(JSON.stringify(report,null,2));
 await page.screenshot({path:fileURLToPath(new URL('debug-ray.png',destination))});
}finally{await browser?.close();server.kill();}


