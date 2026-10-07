import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const destination=new URL('./',import.meta.url),stage=process.env.PROTRUSION_STAGE??'after';
await mkdir(destination,{recursive:true});
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8'),instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1000,height:768}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);console.log('Game ready');await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});console.log('Escape interior built');
 const result=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{ESCAPE_CORRIDOR_X:cx}=await import('/escape-corridor-plan.mjs'),t=groundsTest,items=[],runtime=new Set();
  t.grounds.workshops.group.traverse(o=>runtime.add(o));
  t.exterior.model.updateMatrixWorld(true);
  const area=new THREE.Box3(new THREE.Vector3(153.205,3.8,-44),new THREE.Vector3(cx+.5,5.05,-26));
  const m=new THREE.Matrix4(),world=new THREE.Matrix4();
  t.exterior.model.traverse(o=>{
   if(!o.isMesh||o.userData.aerialBatch||runtime.has(o))return;
   if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
   const add=(matrix,index)=>{const b=o.geometry.boundingBox.clone().applyMatrix4(matrix);if(b.intersectsBox(area))items.push({name:o.name,index,parent:o.parent.name,min:b.min.toArray(),max:b.max.toArray(),material:[o.material].flat().map(m=>({name:m.name,color:m.color?.getHexString()})),visible:o.visible,source:o.userData.aerialBatchSource});};
   if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);world.multiplyMatrices(o.matrixWorld,m);add(world,i);}}else add(o.matrixWorld);
  });
  const meshes=[];t.exterior.model.traverseVisible(o=>{if(o.isMesh&&new THREE.Box3().setFromObject(o).intersectsBox(area))meshes.push(o);});
  const probes=[];
  for(let z=-43;z<-26;z+=.1)for(let y=3.8;y<5.05;y+=.1){const h=new THREE.Raycaster(new THREE.Vector3(cx,y,z),new THREE.Vector3(-1,0,0),0,cx-153.205).intersectObjects(meshes,false)[0];if(h&&h.point.x>153.3)probes.push({name:h.object.name,index:h.instanceId,point:h.point.toArray()});}
  const gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
  const wallProbes=[];
  for(const z of [-26.61,-26.59,-26.57,-26.53,-26.45,-26.35])for(const y of [4.65,4.72,4.78,4.84,4.9,5]){const h=new THREE.Raycaster(new THREE.Vector3(cx,y,z),new THREE.Vector3(-1,0,0),0,2).intersectObjects(meshes,false)[0];wallProbes.push({z,y,name:h?.object.name,x:h?.point.x});}
  return {cx,renderer:gl.getParameter(info.UNMASKED_RENDERER_WEBGL),items,probes,wallProbes};
 });
 console.log('Geometry surveyed');
 await page.keyboard.press('f');
 for(const [name,pose] of Object.entries({reported:[result.cx,-24.5,.65,.7],oil:[result.cx,-28.5,.65,.6],west:[result.cx,-26.5,Math.PI/2,.8]})){
  await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',destination))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.evaluate(p=>groundsTest.pose(...p),[result.cx,-24.5,.65,.7]);await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',destination))});
 await writeFile(new URL(stage+'.json',destination),JSON.stringify({result,errors},null,2));
 assert.deepEqual(errors,[]);
 if(stage.startsWith('after'))assert(result.wallProbes.every(p=>Math.abs(p.x-153.205)<1e-5),'The rendered finished wall owns every former protrusion sample');
 console.log(JSON.stringify({items:result.items,probes:result.probes.slice(0,20),probeCount:result.probes.length,errors},null,2));
}finally{await browser?.close();server.kill();}
