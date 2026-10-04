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
 const page=await browser.newPage({viewport:{width:1588,height:774}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.cornerActual={exterior,renderer,controls,buildingPhotos,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.cornerActual={exterior,renderer,walker};const clock=new THREE.Timer();')});});
 for(const mode of ['source','compiled','explore']){
  await page.goto(base+(mode==='explore'?'/explore.html?view=front-corner-west':`/aerial.html?models=${mode}&view=front-corner-west&buildingDetail=full`));
  await page.waitForFunction(()=>window.cornerActual?.renderer.info.render.frame>3);
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>window.cornerActual.buildingPhotos?.close());
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  checks.push(await page.evaluate(async mode=>{
   const THREE=await import('/vendor/three.module.js'),{exterior,walker}=window.cornerActual;
   if(mode==='compiled'&&exterior.modelBuild.mode!=='compiled')throw Error('Aerial did not load the rebuilt model');
   exterior.trees.visible=false;walker?.setObstacles();exterior.invalidateShadows();exterior.model.updateMatrixWorld(true);
   const meshes=[],ray=new THREE.Raycaster();exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);if(o.isSprite)o.visible=false;});
   let roof=0,walls=0,panes=0;
   for(const [x,z] of [[-34.4,16.5],[-34,17.5],[-34.4,20.5],[-33,19.1],[-32.3,20.5]]){
    ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObjects(meshes,false)[0];
    if(!h||Math.abs(h.point.y-8.83)>1e-5||h.face.normal.y<.99)throw Error('The new roof is not flat '+JSON.stringify({mode,x,z,point:h?.point.toArray()}));roof++;
   }
   for(const [origin,direction,axis,value] of [[[ -32.5,4.6,16],[-1,0,0],'x',-33.65],[[-32.5,4.6,17.5],[0,0,1],'z',18.5],[[-31,4.6,20],[-1,0,0],'x',-32]]){
    ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));const h=ray.intersectObjects(meshes,false)[0];
    if(!h||Math.abs(h.point[axis]-value)>1e-5)throw Error('Wall does not follow the yellow guide');walls++;
   }
   for(const o of exterior.model.userData.frontInsideCornerOpenings.filter(o=>o.face.startsWith('west-')))for(const u of [-.26,.26])for(const v of [-.27,.27]){
    ray.set(new THREE.Vector3(o.x+Math.cos(o.rotation)*o.w*u+o.nx*.35,o.y+o.h*v,o.z-Math.sin(o.rotation)*o.w*u+o.nz*.35),new THREE.Vector3(-o.nx,0,-o.nz));
    const h=ray.intersectObjects(meshes,false)[0];if(h?.object.material.color.getHex()!==0x78989f||h.distance>=.35)throw Error('A retained corner pane is covered');panes++;
   }
   let stoppedZ=null;
   if(walker){walker.setView({position:[-31.45,1.8,23],target:[-31.45,1.8,14]});walker.keys.add('KeyW');for(let i=0;i<35;i++)walker.update(.05);walker.keys.clear();stoppedZ=exterior.camera.position.z;if(stoppedZ<15.7||stoppedZ>16.2)throw Error('Doorway approach is blocked '+stoppedZ);}
   return {mode,roof,walls,panes,stoppedZ};
  },mode));
  for(const name of ['close','plan','ground']){
   await page.evaluate(v=>{const {exterior,walker,show}=window.cornerActual;exterior.camera.up.set(...(v.up??[0,1,0]));if(walker)walker.setView(v);else show(v);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views[name]);
   await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',destination))});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(v=>{const {exterior,walker,show}=window.cornerActual;exterior.camera.up.set(0,1,0);if(walker)walker.setView(v);else show(v);exterior.camera.fov=65;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views.close);
  await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',destination))});
  await page.setViewportSize({width:1588,height:774});
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL('pages-validation.json',destination),JSON.stringify({checks,errors},null,2)+'\n');
 console.log(JSON.stringify({checks,errors}));
}finally{await browser.close();server.kill();}
