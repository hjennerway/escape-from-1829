import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';

const phase=process.argv[2]??'after',modes=phase==='before'?['source']:['source','compiled'];
const output=new URL('./',import.meta.url);
await mkdir(output,{recursive:true});
const {server,base}=await startTestServer();
let browser;const errors=[],results=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1322,height:754}});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__garden={exterior,renderer,controls};function frame(){')});
 });
 for(const mode of modes){
  await page.goto(base+'/aerial.html?period=1916&models='+mode);
  await page.waitForFunction(()=>window.__garden?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__garden.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  for(const [name,position,target] of [
   ['marked',[-76,29,53],[-51,2,32]],
   ['close',[-67,4,28],[-60,-.15,33]],
   ['overhead',[-57,62,34],[-57,0,34]]
  ]){
   await page.evaluate(({position,target})=>{
    const {exterior,controls}=window.__garden;
    exterior.scene.fog.density=0;exterior.camera.position.set(...position);
    exterior.camera.lookAt(...target);controls.sync(target);
   },{position,target});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:fileURLToPath(new URL(phase+'-'+mode+'-'+name+'.png',output))});
  }
  const samples=await page.evaluate(async()=>{
   const THREE=await import('./vendor/three.module.js');
   const {exterior}=window.__garden,ray=new THREE.Raycaster(),meshes=[];
   exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
   return [-68.8,-65,-60,-50,-47].flatMap(x=>[25.4,25.6,28,34,42.4].map(z=>{
    ray.set(new THREE.Vector3(x,.49,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObjects(meshes,false)[0];
    return {x,z,y:hit?.point.y,name:hit?.object.name,terrain:hit?.object===exterior.terrain,grass:!!hit?.object.material.userData.estateGrass};
   }));
  });
  if(phase!=='before')for(const sample of samples.filter(s=>s.z>25.5)){
   assert(sample.terrain&&sample.grass&&Math.abs(sample.y+.15)<1e-6,'Garden uses continuous terrain: '+JSON.stringify(sample));
  }
  results.push({mode,samples});
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL(phase+'-validation.json',output),JSON.stringify({results,errors},null,2)+'\n');
 console.log('PASS: '+phase+' west garden views and ground samples ('+modes.join(', ')+').');
}finally{await browser?.close();server.kill();}
