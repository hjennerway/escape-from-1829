import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
const stage=process.argv[2]??'after',mode=process.argv[3]??'source';
const views={
 marked:{position:[35,25,-10],target:[43,13.8,8],fov:43},
 close:{position:[36,20,-2],target:[43.5,13.8,7],fov:42},
 opposite:{position:[48,24,-8],target:[42.5,13.7,7.5],fov:43},
 garden:{position:[32,24,37],target:[41,13.6,16.5],fov:43},
 gardenClose:{position:[32,19,29],target:[41,13.6,16.5],fov:43},
 low:{position:[40,12,-7],target:[45,14,7],fov:45},
 plan:{position:[43,39,8],target:[43,13,8.001],fov:43},
 overview:{position:[13,41,13],target:[53,11,13],fov:47}
};
const {server,base}=await startTestServer();let browser;const errors=[],inspections={};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1400,height:950}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={THREE,exterior,renderer,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const build=await page.evaluate(()=>window.review.exterior.modelBuild);assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
 await page.locator('[data-lighting="day"]').click();await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',import.meta.url))});
  if(name==='close')inspections.close=await page.evaluate(()=>{
   const {THREE,exterior}=window.review,{camera,scene}=exterior,parts=[],ray=new THREE.Raycaster();
   scene.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
   return {camera:camera.position.toArray(),quaternion:camera.quaternion.toArray(),fov:camera.fov,aspect:camera.aspect,
    probes:[[592,402],[594,410],[599,405],[599,413]].map(([x,y])=>{
     ray.setFromCamera(new THREE.Vector2(x/700-1,1-y/475),camera);
     return {pixel:[x,y],hits:ray.intersectObjects(parts,false).slice(0,3).map(h=>({name:h.object.name,p:h.point.toArray(),color:h.object.material.color?.getHexString(),triangle:h.faceIndex}))};
    })};
  });
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show({...v,fov:60}),views.marked);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-phone.png',import.meta.url))});
 assert.deepEqual(errors,[]);await writeFile(new URL(stage+'-'+mode+'-validation.json',import.meta.url),JSON.stringify({build,errors,views,inspections},null,2));console.log('PASS: '+stage+' '+mode+' roof views, no browser errors.');
}finally{await browser?.close();server.kill();}
