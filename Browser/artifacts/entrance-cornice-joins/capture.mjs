import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',out=new URL('./',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const views={marked:{position:[29,30,41],target:[29,13,17],fov:47},bay:{position:[23,20,28],target:[26.4,13.5,19],fov:43},return:{position:[34,19,23],target:[33.65,13.4,15.5],fov:40},reverse:{position:[40,24,30],target:[27,13,17],fov:43},low:{position:[26,13.6,27],target:[26,13.5,19.7],fov:40}};
let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1500,height:850}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={exterior,renderer,controls,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 if(mode==='compiled'&&await page.evaluate(()=>window.review.exterior.modelBuild.mode)!=='compiled')throw Error('Expected compiled loading');
 await page.locator('[data-lighting="day"]').click();await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',out))});}
 const diagnostics=await page.evaluate(async()=>{
  const T=await import('/vendor/three.module.js'),e=window.review.exterior,roof=e.model.getObjectByName('West end continuous slate roof').material,ray=new T.Raycaster(),parts=[];
  e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const probes=[];
  for(const x of [23,24,25,26,27,28])for(const z of [19.6249,19.85]){
   ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));
   const h=ray.intersectObjects(parts,false)[0];
   if(!h||Math.abs(h.point.y-13.69)>.001||(h.object.material===roof)!==(z<19.625))throw Error('Visible front roof/render edge mismatch: '+[x,z,h?.point.y]);
   probes.push({x,z,y:h.point.y,slate:h.object.material===roof});
  }
  const white=e.model.getObjectByName('Entrance east mitred cornice layer 3').material;
  for(const [z,y] of [[17.1,13.06],[17.2,13.01],[17.235,12.99]]){
   ray.set(new T.Vector3(33.4,y,z),new T.Vector3(1,0,0));const h=ray.intersectObjects(parts,false)[0];
   if(!h||h.object.material!==white)throw Error('Visible white return mismatch: '+JSON.stringify({z,y,name:h?.object.name,point:h?.point.toArray(),color:h?.object.material.color.getHex()}));
   probes.push({point:h.point.toArray(),color:h.object.material.color.getHex()});
  }
  return {probes,modelMode:e.modelBuild,render:{calls:window.review.renderer.info.render.calls,triangles:window.review.renderer.info.render.triangles}};
 });
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show(v),views.marked);await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',out))});
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL(stage+'-validation.json',out),JSON.stringify({errors,views,...diagnostics},null,2)+'\n');console.log(JSON.stringify({stage,mode,...diagnostics}));
}finally{await browser?.close();server.kill();}
