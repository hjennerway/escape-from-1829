import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const folder=new URL('./',import.meta.url),views=JSON.parse(await readFile(new URL('after-validation.json',folder),'utf8')).views;
const project=process.env.MASONRY_PROJECT_ROOT??fileURLToPath(new URL('../../../',import.meta.url));
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:project,windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const checks=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:1593,height:698}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.masonry={exterior,renderer,controls,buildingPhotos,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.masonry={exterior,renderer,walker};const clock=new THREE.Timer();')});});
 for(const mode of ['compiled','explore']){
  await page.goto(base+(mode==='compiled'?'/aerial.html?models=compiled&buildingDetail=full':'/explore.html'));
  await page.waitForFunction(()=>window.masonry?.renderer.info.render.frame>3);
  await page.locator('[data-lighting="day"]').click();await page.evaluate(()=>window.masonry.buildingPhotos?.close());
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  checks.push(await page.evaluate(async mode=>{
   const THREE=await import('/vendor/three.module.js'),{exterior,walker}=window.masonry;
   if(mode==='compiled'&&exterior.modelBuild.mode!=='compiled')throw Error('Aerial did not load compiled model');
   exterior.trees.visible=false;walker?.setObstacles();exterior.model.updateMatrixWorld(true);exterior.invalidateShadows();
   exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
   if(exterior.model.getObjectByName('West courtyard upper link slate closure'))throw Error('Tiled face remains');
   const brick=exterior.model.getObjectByName('West courtyard upper link brick return'),meshes=[],ray=new THREE.Raycaster();
   exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});let faceProbes=0,trimProbes=0,roofProbes=0;
   const hit=(origin,direction)=>{ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));return ray.intersectObjects(meshes,false)[0];};
   for(const z of [5.15,5.6,6.5,7.1]){
    for(const y of [13.5,13.75,14]){
     const h=hit([-37,y,z],[-1,0,0]);if(h?.object.material!==brick.material||Math.abs(h.point.x+37.4)>1e-5||h.face.normal.y!==0)throw Error('Incorrect visible brick face '+JSON.stringify({mode,z,y,name:h?.object.name,point:h?.point.toArray()}));faceProbes++;
    }
    for(const y of [14.1,14.34,14.52]){
     const h=hit([-37,y,z],[-1,0,0]);if(h?.object.material.color.getHex()!==0xe1e3dc)throw Error('White trim gap');trimProbes++;
    }
    for(const x of [-39,-35]){
     const h=hit([x,30,z],[0,-1,0]);if(!h?.object.material.map||h.face.normal.y<=0||h.point.y<=13)throw Error('Adjoining roof gap');roofProbes++;
    }
   }
   return {mode,faceProbes,trimProbes,roofProbes};
  },mode));
  for(const name of ['courtClose','court','garden']){
   await page.evaluate(v=>{const {exterior,walker,show}=window.masonry;if(walker)walker.setView(v);else show(v);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views[name]);
   await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',folder))});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(v=>{const {exterior,walker,show}=window.masonry;if(walker)walker.setView(v);else show(v);exterior.camera.fov=50;exterior.camera.updateProjectionMatrix();},views.courtClose);
  await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',folder))});await page.setViewportSize({width:1593,height:698});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('pages-validation.json',folder),JSON.stringify({checks,errors},null,2)+'\n');
 console.log('PASS: compiled aerial and Explore: 12 vertical brick, 12 white trim and 8 retained roof probes each; desktop/phone captures and no page/shader errors.');
}finally{await browser.close();server.kill();}
