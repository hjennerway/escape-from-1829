import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const {server,base}=await startTestServer();let browser;const errors=[];
const views={overview:{position:[-10,65,-96],target:[-47,7,-2],fov:45},marked:{position:[-48,29,-18],target:[-59,12,5],fov:36},close:{position:[-51,23,-6],target:[-61.5,14,5.2],fov:29},opposite:{position:[-68,23,-5],target:[-61.5,14,5.2],fov:37}};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1065,height:640},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={exterior,renderer,controls,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 if(mode==='compiled'&&await page.evaluate(()=>window.review.exterior.modelBuild.mode)!=='compiled')throw Error('Expected compiled loading');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 const probes=await page.evaluate(async()=>{
  const T=await import('/vendor/three.module.js'),e=window.review.exterior,ray=new T.Raycaster(),parts=[],results=[];
  e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const roof=e.model.getObjectByName('West end continuous slate roof').material;
  for(const x of [-62.02,-61.98,-61.9])for(const z of [4.51,4.55,4.59]){
   ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));
   const hits=ray.intersectObjects(parts,false);
   if(hits.some(h=>h.object.material===roof&&h.point.y>14.5))throw Error('Visible slate protrusion remains: '+[x,z]);
   results.push({x,z,clear:true});
  }
  ray.far=.075;
  for(const z of [5,5.4,5.8,6.2]){
   ray.set(new T.Vector3(-61.86,14.35,z),new T.Vector3(1,0,0));
   if(ray.intersectObjects(parts,false).length)throw Error('Visible return trim remains: '+z);
   results.push({x:-61.86,z,clear:true});
  }
  return results;
 });
 const picks={};
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',import.meta.url))});
  picks[name]=await page.evaluate(async()=>{
   const T=await import('/vendor/three.module.js'),e=window.review.exterior,ray=new T.Raycaster(),parts=[],out=[];
   e.model.updateMatrixWorld(true);e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
   for(const x of [-62.2,-61.9,-61.75,-61.6,-61.4,-61.2,-61])for(const z of [4.5,4.75,5,5.5,6,6.5]){
    ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];
    const screen=h?.point.clone().project(e.camera);
    out.push({x,z,name:h?.object.name,point:h?.point.toArray(),color:h?.object.material.color?.getHexString(),screen:screen&&[(screen.x+1)*532.5,(1-screen.y)*320]});
   }
   return out;
  });
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show({...v,fov:48}),views.close);await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',import.meta.url))});
 await writeFile(new URL(stage+'-validation.json',import.meta.url),JSON.stringify({views,picks,probes,errors,mode,modelBuild:await page.evaluate(()=>window.review.exterior.modelBuild)},null,2)+'\n');
 console.log(JSON.stringify({stage,mode,probes:probes.length,errors}));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser?.close();server.kill();}
