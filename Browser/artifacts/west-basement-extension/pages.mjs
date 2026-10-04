import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const destination=new URL('./',import.meta.url),views=JSON.parse(await readFile(new URL('after-validation.json',destination),'utf8')).views;
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:1097,height:813}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.courtActual={exterior,renderer,controls,buildingPhotos,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.courtActual={exterior,renderer,walker};const clock=new THREE.Timer();')});});
 for(const mode of ['compiled','explore']){
  await page.goto(base+(mode==='compiled'?'/aerial.html?models=compiled&view=west-court-photo&buildingDetail=full':'/explore.html?view=west-court-photo'));
  await page.waitForFunction(()=>window.courtActual?.renderer.info.render.frame>3);
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>window.courtActual.buildingPhotos?.close());
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  checks.push(await page.evaluate(async mode=>{
   const THREE=await import('/vendor/three.module.js'),{WEST_SIDE_BASEMENT:b}=await import('/west-side-basement.mjs');
   const {exterior,walker}=window.courtActual;
   if(mode==='compiled'&&exterior.modelBuild.mode!=='compiled')throw Error('Aerial did not load the rebuilt model');
   exterior.trees.visible=false;
   walker?.setObstacles();
   exterior.invalidateShadows();exterior.model.updateMatrixWorld(true);
   const meshes=[],ray=new THREE.Raycaster();exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);if(o.isSprite)o.visible=false;});
   function surface(x,z){ray.set(new THREE.Vector3(x,.9,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(meshes,false)[0];}
   let lowered=0,wall=0,gravel=0;
   for(const z of [-4.3,-2.5,-.5,1.2,2.5,4.4])for(const x of [-38.65,-38.3,-37.95]){
    const hit=surface(x,z);if(!hit||Math.abs(hit.point.y-b.level)>1e-5)throw Error('Raised floor remains in the marked gap '+JSON.stringify({mode,x,z,hit:hit&&{name:hit.object.name,point:hit.point.toArray()}}));lowered++;
   }
   for(const z of [-4.3,-2.5,-.5,1.2]){
    const hit=surface(-39.9,z);if(!hit||Math.abs(hit.point.y-(b.grade+.32))>1e-5)throw Error('Missing retaining extension');wall++;
   }
   const existing=surface(-50,-5).object.material;
   for(const x of [-45,-50,-55])for(const z of [.2,2.5,4.8]){
    const hit=surface(x,z);if(!hit||Math.abs(hit.point.y-b.grade)>1e-5||hit.object.material!==existing)throw Error('New surface does not match the courtyard gravel');
    if(ray.intersectObject(exterior.terrain,false).length)throw Error('Grass remains beneath gravel');gravel++;
   }
   let walking=null;
   if(walker){
    walker.setView({position:[-38.1,1.8,-5.5],target:[-38.1,1.8,b.end+2]});
    walker.keys.add('KeyW');for(let i=0;i<65;i++)walker.update(.05);walker.keys.clear();
    walking=exterior.camera.position.toArray();
    if(walking[2]<b.end-.9||walking[2]>b.end-.25||Math.abs(walking[1]-(1.8+b.level))>1e-5)throw Error('Walking does not follow the extended lower passage '+walking);
   }
   return {mode,lowered,wall,gravel,walking};
  },mode));
  if(mode==='explore'){
   await page.locator('canvas').click({position:{x:550,y:500}});
   await page.evaluate(()=>window.courtActual.walker.setView({position:[-38.1,1.8,.5],target:[-38.1,1.8,7]}));
   await page.keyboard.down('w');
   try{await page.waitForFunction(()=>window.courtActual.exterior.camera.position.z>4.2,null,{timeout:10000});}finally{await page.keyboard.up('w');}
   const position=await page.evaluate(()=>window.courtActual.exterior.camera.position.toArray());
   if(Math.abs(position[1]-.78)>1e-5)throw Error('Keyboard walking does not follow the lower floor');
   checks.at(-1).keyboard=position;
   await page.keyboard.press('Escape');
  }
  for(const name of ['marked','close','plan']){
   await page.evaluate(({v,name})=>{const {exterior,walker,show}=window.courtActual;exterior.camera.up.set(...(name==='plan'?[0,0,1]:[0,1,0]));if(walker)walker.setView(v);else show(v);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},{v:views[name],name});
   await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',destination))});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(v=>{const {exterior,walker,show}=window.courtActual;exterior.camera.up.set(0,1,0);if(walker)walker.setView(v);else show(v);exterior.camera.fov=65;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views.close);
  await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',destination))});
  await page.setViewportSize({width:1097,height:813});
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL('pages-validation.json',destination),JSON.stringify({checks,errors},null,2)+'\n');
 console.log('PASS: rebuilt aerial and Explore: 18 lower-floor, 4 coping and 9 matching-gravel probes each, walking height/collision and desktop/phone views; no runtime/shader errors.');
}finally{await browser.close();server.kill();}
