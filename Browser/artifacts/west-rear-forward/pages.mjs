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
 const page=await browser.newPage({viewport:{width:1239,height:841}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.westActual={exterior,renderer,controls,buildingPhotos,show(v,name){moved=true;navigationTarget=v.target;exterior.camera.up.set(...(name==="plan"?[1,0,0]:[0,1,0]));exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.westActual={exterior,renderer,walker};const clock=new THREE.Timer();')});});
 for(const mode of ['compiled','explore']){
  await page.goto(base+(mode==='compiled'?'/aerial.html?models=compiled&view=west-3&buildingDetail=full':'/explore.html?view=west-3'));
  await page.waitForFunction(()=>window.westActual?.renderer.info.render.frame>3);
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>window.westActual.buildingPhotos?.close());
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  checks.push(await page.evaluate(async mode=>{
   const THREE=await import('/vendor/three.module.js'),{exterior,walker}=window.westActual;
   if(mode==='compiled'&&exterior.modelBuild.mode!=='compiled')throw Error('Aerial did not load the rebuilt compiled model');
   const range=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West courtyard aligned range')),end=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West end continuous wall'));
   const recess=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West courtyard recessed end'));
   if(Math.abs(range.min.z-5)>1e-5||Math.abs(range.max.z-13.5)>1e-5||Math.abs(end.min.z-5)>1e-5||Math.abs(end.max.z-20.5)>1e-5||Math.abs(recess.min.z-7)>1e-5)throw Error('Actual page has stale rear-corner planes');
   exterior.trees.visible=false;walker?.setObstacles();exterior.invalidateShadows();
   const ray=new THREE.Raycaster(),meshes=[];let panes=0;
   exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);if(o.isSprite)o.visible=false;});
   for(const [face,bx,side] of [['west-front-bay',-52.5,1],['west-court-bay',-58.4,-1]]){
    const windows=exterior.model.userData.eastPhotoOpenings.filter(o=>o.face===face);if(windows.length!==9)throw Error('Missing octagonal windows');
    for(const o of windows){
     const normal=new THREE.Vector3(o.x<bx-1.6?-.84:o.x>bx+1.6?.84:0,0,side*(Math.abs(o.x-bx)>1.6?.54:1)).normalize();
     // Offset into a pane rather than ray-testing the central sash divider.
     const tangent=new THREE.Vector3(normal.z,0,-normal.x);
     for(const u of [-.26,.26])for(const v of [-.27,.27]){
      ray.set(new THREE.Vector3(o.x,o.y+o.h*v,o.z).addScaledVector(normal,.6).addScaledVector(tangent,o.w*u),normal.clone().negate());
      const hit=ray.intersectObjects(meshes,false)[0];if(hit?.object.material.color.getHex()!==0x78989f||hit.distance>=.65)throw Error('Actual page buries an octagonal pane '+JSON.stringify({mode,face,o,u,v,hit:hit&&{name:hit.object.name,color:hit.object.material.color.getHex(),distance:hit.distance,point:hit.point.toArray()}}));panes++;
     }
    }
   }
   for(const o of exterior.model.userData.westCourtPhotoOpenings.filter(o=>['west-court-recess','west-court-low-bay','west-court-outer'].includes(o.face)||(o.face==='west-corner-return'&&o.y>10))){
    const isReturn=o.face==='west-corner-return',normal=new THREE.Vector3(isReturn?1:0,0,isReturn?0:-1),tangent=new THREE.Vector3(normal.z,0,-normal.x);
    for(const u of [-.26,.26])for(const v of [-.27,.27]){
     ray.set(new THREE.Vector3(o.x,o.y+o.h*v,o.z).addScaledVector(normal,.6).addScaledVector(tangent,o.w*u),normal.clone().negate());
     const hit=ray.intersectObjects(meshes,false)[0];if(hit?.object.material.color.getHex()!==0x78989f||hit.distance>=.65)throw Error('Moved rear sash is buried '+JSON.stringify({mode,o,u,v}));panes++;
    }
   }
   if(walker){
    for(const [x,z] of [[-69,5],[-62.5,7]]){
     walker.setView({position:[x,1.8,z-1.5],target:[x,1.8,z+1]});walker.keys.add('KeyW');for(let i=0;i<30;i++)walker.update(.05);walker.keys.clear();if(exterior.camera.position.z>z-.2)throw Error('Walker does not collide with a moved rear face');
    }
   }
   return {mode,panes,courtZ:range.min.z,gardenZ:range.max.z,endDepth:end.getSize(new THREE.Vector3()).z};
  },mode));
  for(const name of ['marked','plan','garden','court','end']){
   await page.evaluate(({v,name})=>{const {exterior,walker,show}=window.westActual;exterior.camera.up.set(...(name==='plan'?[1,0,0]:[0,1,0]));if(walker)walker.setView(v);else show(v,name);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},{v:views[name],name});
   await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',destination))});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(v=>{const {exterior,walker,show}=window.westActual;exterior.camera.up.set(0,1,0);if(walker)walker.setView(v);else show(v,'end');exterior.camera.fov=65;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views.end);
  await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',destination))});
  await page.setViewportSize({width:1239,height:841});
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL('pages-validation.json',destination),JSON.stringify({checks,errors},null,2)+'\n');
 console.log('PASS: compiled aerial and Explore have the advanced rear faces, exposed moved windows, both bay profiles, wall collisions and desktop/phone views without page/shader errors.');
}finally{await browser.close();server.kill();}
