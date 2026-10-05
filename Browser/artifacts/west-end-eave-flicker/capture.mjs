import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
import {writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',out=new URL('./',import.meta.url);
const {server,base}=await startTestServer();let browser;const errors=[];
const views={marked:{position:[-86,30,-8],target:[-67,10,11],up:[0,1,0],fov:45},close:{position:[-79,21,-1],target:[-72,14,12],up:[0,1,0],fov:38},shift:{position:[-78.95,21.03,-.98],target:[-72,14,12],up:[0,1,0],fov:38},low:{position:[-80,16,2],target:[-72,14,12],up:[0,1,0],fov:48}};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1400,height:950},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={exterior,renderer,controls,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(...v.up);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 if(stage==='before')await page.route('**/west-refinement.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-west-refinement.mjs',out),'utf8')}));
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 if(mode==='compiled'&&await page.evaluate(()=>window.review.exterior.modelBuild.mode)!=='compiled')throw Error('Expected compiled loading');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',out))});}
 const probes=stage==='before'?[]:await page.evaluate(async()=>{
  const T=await import('/vendor/three.module.js'),model=window.review.exterior.model,parts=[],ray=new T.Raycaster(),results=[];
  model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const roof=model.getObjectByName('West end continuous slate roof').material;
  const top=(x,z)=>{ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));return ray.intersectObjects(parts,false)[0];};
  const check=(x,z,y)=>{const h=top(x,z);if(!h||h.object.material!==roof||Math.abs(h.point.y-y)>.002)throw Error('Visible roof boundary mismatch: '+[x,z,y,h?.point.y,h?.object.name]);results.push({point:h.point.toArray()});};
  const mainPitch=(x,z)=>{const h=top(x,14.6);return h.point.y-h.face.normal.z/h.face.normal.y*(z-14.6);};
  for(const x of [-34.5,-34.2,-33.9,-33.7])check(x,15.3849,mainPitch(x,15.3849));
  for(const x of [-33.5,-33.2,-32.8,-32.4,-32,-31.5,-31])check(x,15.3849,mainPitch(x,15.3849));
  const terminal=model.getObjectByName('Entrance west mitred cornice layer 3').userData.roofRenderBoundary.inner.at(-1),end=[-30.8273654403271,mainPitch(-30.8273654403271,15.385),15.385];
  for(const t of [.1,.25,.4,.6,.8,.95]){const p=new T.Vector3(...terminal).lerp(new T.Vector3(...end),t);check(p.x+.0001,p.z-.0001,p.y);}
  for(const z of [10,12,14,15,16,17,18])check(-37.5,z,17.08);
  for(const z of [12.1,14,16,18])check(-25.8,z,15.66);
  for(const x of [-33.5,-33.1,-32.5,-31.5]){
   const a=top(x,14.8001),b=top(x,14.7999);if(!a||!b||Math.abs(a.point.y-b.point.y)>.002)throw Error('Open inboard roof seam');
   results.push({seam:x,heights:[a.point.y,b.point.y]});
  }
  return results;
 });
 const gutter=stage==='before'?null:await page.evaluate(async()=>{
  const T=await import('/vendor/three.module.js'),model=window.review.exterior.model,parts=[],ray=new T.Raycaster();
  model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const white=model.getObjectByName('West outer corner joined cornice 0.18').material;
  const metal=model.getObjectByName('West outer end continuous gutter').material;
  const whites=parts.filter(o=>o.material===white),irons=parts.filter(o=>o.material===metal);
  let samples=0;const contacts=[];
  for(const x of [-72.82,-72.7,-72.6,-72.55,-72.52,-72.49,-72.4,-72.2])for(const z of [5.2,6.5,8,9.8,10.5,12,14,15,16,18,20.2]){
   ray.set(new T.Vector3(x,20,z),new T.Vector3(0,-1,0));const cap=ray.intersectObjects(whites,false)[0];if(!cap||Math.abs(cap.point.y-14.53)>.001)continue;
   if(ray.intersectObjects(irons,false).some(h=>h.face.normal.y>.5&&Math.abs(h.point.y-cap.point.y)<.00002))throw Error('Visible coplanar gutter/cornice overlap');samples++;
  }
  const check=(x,z)=>{ray.set(new T.Vector3(x,20,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];if(!h||h.object.material!==metal||Math.abs(h.point.y-14.53)>.00002)throw Error('Visible gutter gap: '+[x,z,h?.object.name,h?.point.y]);contacts.push(h.point.toArray());};
  for(const [x,zz] of [[-72.635,[5.2,6.5,8,9.8,15.6,17,19,20.3]],[-72.895,[10.4,11,12.75,14,15.2]]])for(const z of zz)check(x,z);
  for(const z of [10.09,15.41])for(const x of [-72.68,-72.75,-72.84])check(x,z);
  return {corniceSamples:samples,contacts};
 });
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show({...v,fov:48}),views.close);await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',out))});
 await writeFile(new URL(stage+'-validation.json',out),JSON.stringify({errors,views,probes,gutter,modelMode:await page.evaluate(()=>window.review.exterior.modelBuild)},null,2)+'\n');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: '+stage+' '+mode+' hardware-rendered views, '+probes.length+' visible roof contacts and seams, '+(gutter?.corniceSamples??0)+' clear cornice probes, '+(gutter?.contacts.length??0)+' gutter contacts');
}finally{await browser?.close();server.kill();}




