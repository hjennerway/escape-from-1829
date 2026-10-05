import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const {server,base}=await startTestServer();let browser;const errors=[];
const views={marked:{position:[-22,24,34],target:[-37.5,13.5,17],fov:32},close:{position:[-28,21,27],target:[-34.8,14.4,15.6],fov:27},opposite:{position:[-42,23,27],target:[-34.8,14.4,15.6],fov:34}};
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
  const T=await import('/vendor/three.module.js'),e=window.review.exterior,parts=[],ray=new T.Raycaster(),out=[];
  e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const roof=e.model.getObjectByName('West end continuous slate roof').material;
  const top=(x,z)=>{ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));return ray.intersectObjects(parts,false)[0];};
  for(const x of [-34.599,-34.5,-34.2,-33.9,-33.7,-33.65,-33.6,-33.55,-33.5,-33.2,-32.8,-32.4,-32,-31.5,-31]){
   const h=top(x,15.3849),a=top(x,14.6).point.y,b=top(x,14.7).point.y,y=a+(b-a)*.7849/.1;
   if(!h||h.object.material!==roof||Math.abs(h.point.y-y)>.002)throw Error('Visible repaired edge mismatch: '+[x,y,h?.point.y]);
   out.push({point:h.point.toArray(),expected:y});
  }
  for(const x of [-34.5,-34.2,-33.9,-33.7,-33.5,-33.1,-32.5,-31.5]){
   const a=top(x,14.8001),b=top(x,14.7999);if(!a||!b||Math.abs(a.point.y-b.point.y)>.002)throw Error('Open inboard roof seam');out.push({seam:x,heights:[a.point.y,b.point.y]});
  }
  return out;
 });
 const picks={};
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',import.meta.url))});
  picks[name]=await page.evaluate(async()=>{
   const T=await import('/vendor/three.module.js'),e=window.review.exterior,ray=new T.Raycaster(),parts=[],out=[];
   e.model.updateMatrixWorld(true);e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
   for(const x of [-34.9,-34.7,-34.6,-34.5,-34.3,-34])for(const z of [15.35,15.45,15.55,15.65]){
    ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];
    out.push({x,z,name:h?.object.name,point:h?.point.toArray(),color:h?.object.material.color?.getHexString()});
   }
   return out;
  });
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show({...v,fov:48}),views.close);await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',import.meta.url))});
 await writeFile(new URL(stage+'-validation.json',import.meta.url),JSON.stringify({views,picks,probes,errors,mode,modelBuild:await page.evaluate(()=>window.review.exterior.modelBuild)},null,2)+'\n');
 console.log(JSON.stringify({stage,mode,probes:probes.length,errors}));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser?.close();server.kill();}
