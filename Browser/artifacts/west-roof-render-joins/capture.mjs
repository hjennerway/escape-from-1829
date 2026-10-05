import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',output=new URL('./',import.meta.url);
const sourceHashStart=await modelSourceHash(),compiledManifest=mode==='compiled'?JSON.parse(await readFile(new URL('../../dist/compiled/manifest.json',import.meta.url),'utf8')):null;
await mkdir(output,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const views={court:{position:[-57,25,-6],target:[-65,15,8],up:[0,1,0],fov:42},garden:{position:[-56,25,27],target:[-65,15,13],up:[0,1,0],fov:42},courtLow:{position:[-59,16,0],target:[-66,15,7],up:[0,1,0],fov:45},gardenLow:{position:[-57,16,22],target:[-64,15,14],up:[0,1,0],fov:45},whole:{position:[-47,30,43],target:[-54,12,12],up:[0,1,0],fov:55}};
let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1400,height:950}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={exterior,renderer,controls,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(...v.up);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3).catch(async error=>{
  const state=await page.evaluate(()=>({ready:document.readyState,hidden:document.hidden,review:!!window.review,frame:window.review?.renderer.info.render.frame}));
  throw Error(error.message+' '+JSON.stringify({errors,state}));
 });
 if(mode==='compiled'&&await page.evaluate(()=>window.review.exterior.modelBuild.mode)!=='compiled')throw Error('Expected rebuilt compiled model: '+JSON.stringify(await page.evaluate(()=>window.review.exterior.modelBuild)));
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',output))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show({...v,fov:57}),views.court);
 await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',output))});
 const probes=stage==='before'?[]:await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),e=window.review.exterior,parts=[],ray=new THREE.Raycaster(),results=[];
  e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const roof=e.model.getObjectByName('West end continuous slate roof').material;
  const top=(x,z)=>{ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];if(!h)throw Error('Missing visible surface');return h;};
  for(const [x,z,y] of [[-65.6,6.6,15.47],[-63.6,13.425,15.47]]){
   const dx=x+68,dz=z-9.25,length=Math.hypot(dx,dz);
   for(const t of [.05,.15,.3,.5,.7,.85,.95]){
    const px=-68+dx*t,pz=9.25+dz*t,expected=17.08+(y-17.08)*t,h=top(px,pz);
    if(h.object.material!==roof||Math.abs(h.point.y-expected)>.00001)throw Error('Visible descending arris failed: '+[px,pz,h.point.y,h.object.name]);
    if(Math.abs(top(px+dz/length*.0001,pz-dx/length*.0001).point.y-top(px-dz/length*.0001,pz+dx/length*.0001).point.y)>.001)throw Error('Visible crease discontinuity');
    results.push({type:'arris',point:h.point.toArray()});
   }
  }
  for(const side of ['court','garden'])for(const t of [.15,.35,.55,.75,.9]){
   const y=(14.31+15.47+(14.53-15.47)*t)/2;
   const start=side==='court'?[-65.6+.3*t,y,6.1]:[-63.25,y,13.425+.475*t];
   ray.set(new THREE.Vector3(...start),new THREE.Vector3(...(side==='court'?[0,0,1]:[-1,0,0])));ray.far=.6;
   const h=ray.intersectObjects(parts,false)[0];ray.far=Infinity;
   if(h?.object.material.color.getHex()!==0xe1e3dc)throw Error('Visible render return failed: '+side+' '+t+' '+h?.object.name);
   results.push({type:'render',side,point:h.point.toArray()});
  }
  ray.set(new THREE.Vector3(-65.58,14.62,6.1),new THREE.Vector3(0,0,1));ray.far=.7;
  const gutter=ray.intersectObjects(parts,false)[0];ray.far=Infinity;
  if(gutter?.object.material.color.getHex()!==0xe1e3dc)throw Error('Gutter crosses the render riser');
  results.push({type:'clear-gutter',point:gutter.point.toArray()});
  return results;
 });
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL(stage+'-validation.json',output),JSON.stringify({errors,views,probes,sourceHashStart,sourceHashEnd:await modelSourceHash(),compiledManifest,modelMode:await page.evaluate(()=>window.review.exterior.modelBuild)},null,2)+'\n');
 console.log('PASS: '+stage+' '+mode+', '+probes.length+' visible-scene probes, hardware-rendered corner views and phone, no page or shader errors.');
}finally{await browser?.close();server.kill();}
