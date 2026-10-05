import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',output=new URL('./',import.meta.url);
await mkdir(output,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
const errors=[],views={plan:{position:[-49,75,21],target:[-49,0,21],up:[0,0,1],fov:40},court:{position:[-48,31,-18],target:[-54,12,10],up:[0,1,0],fov:55},garden:{position:[-47,30,43],target:[-54,12,12],up:[0,1,0],fov:55},junction:{position:[-38,30,34],target:[-29,12,14],up:[0,1,0],fov:43},end:{position:[-85,28,21],target:[-59,12,10],up:[0,1,0],fov:55}};
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1400,height:950}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={exterior,renderer,controls,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(...v.up);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 if(stage==='before')await page.route('**/west-cross-range-roof.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-roof.mjs',output),'utf8')}));
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 if(mode==='compiled'&&await page.evaluate(()=>window.review.exterior.modelBuild.mode)!=='compiled')throw Error('Expected rebuilt compiled model');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v),v);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',output))});
 }
 const probes=stage==='before'?[]:await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),e=window.review.exterior,parts=[],ray=new THREE.Raycaster(),results=[];
  e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const check=(x,z,y,start=30)=>{ray.set(new THREE.Vector3(x,start,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];if(!h||Math.abs(h.point.y-y)>.0001||h.face.normal.clone().transformDirection(h.object.matrixWorld).y<=0)throw Error('Visible roof probe failed at '+[x,z]+': '+h?.point.y);results.push({x,z,y:h.point.y});};
  for(const x of [-67.5,-64,-60,-57,-53,-49,-45,-40,-36,-32,-30.8])check(x,9.25,17.08);
  for(const [x,end] of [[-68,17],[-58.4,3.7],[-52.5,14.5],[-37.5,18.5]])for(const t of [.15,.35,.55,.75,.95])check(x,9.25+(end-9.25)*t,17.08);
  check(-65.05,5.9,8.81,9.5);
  for(const x of [-62.5,-61,-59,-57,-49,-47,-45,-42,-40.6]){
    ray.set(new THREE.Vector3(x,30,13.8999),new THREE.Vector3(0,-1,0));
    const h=ray.intersectObjects(parts,false)[0];
    if(!h||Math.abs(h.point.y-14.53)>.001)throw Error('Visible wall-top eave failed at '+x+': '+h?.point.y);
    results.push({x,z:13.8999,y:h.point.y});
  }
  for(const z of [12.05,13,14,15,16,17,18,18.3])check(-27.3,z,15.66);
  const camera=new THREE.PerspectiveCamera(55,1400/950,.1,500);
  camera.position.set(-48,31,-18);camera.lookAt(-54,12,10);camera.updateMatrixWorld();
  for(const [x,y] of [[1057,415],[1061,425],[1051,423],[1068,419],[765,485],[764,478],[760,490]]){
    ray.setFromCamera(new THREE.Vector2(x/1400*2-1,1-y/950*2),camera);
    const h=ray.intersectObjects(parts,false)[0];
    if(h?.object.material!==e.model.getObjectByName('West end continuous slate roof').material)throw Error('Visible circled corner failed at '+[x,y]+': '+h?.object.name);
    results.push({pixel:[x,y],point:h.point.toArray(),name:h.object.name});
  }
  return results;
 });
 const geometry=await page.evaluate(async()=>{const THREE=await import('/vendor/three.module.js'),e=window.review.exterior,items=[];e.model.traverse(o=>{if(o.isMesh&&o.material===e.model.getObjectByName('West end continuous slate roof').material){const b=new THREE.Box3().setFromObject(o);if(b.min.x< -29&&b.max.x> -73&&b.max.y>14)items.push({name:o.name,min:b.min.toArray(),max:b.max.toArray(),vertices:o.geometry.attributes.position.count});}});return items;});
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL(stage+'-validation.json',output),JSON.stringify({errors,views,probes,geometry,modelMode:await page.evaluate(()=>window.review.exterior.modelBuild)},null,2)+'\n');
 console.log(JSON.stringify({stage,mode,errors,geometry}));
}finally{await browser?.close();server.kill();}




