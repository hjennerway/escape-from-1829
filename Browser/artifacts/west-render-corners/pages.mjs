import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const out=new URL('./',import.meta.url),views=JSON.parse(await readFile(new URL('after-capture.json',out),'utf8')).views;
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:1224,height:918}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.renderCorners={exterior,renderer,controls,buildingPhotos,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.renderCorners={exterior,renderer,walker};const clock=new THREE.Timer();')});});
 for(const mode of ['source','compiled','explore']){
  await page.goto(base+(mode==='explore'?'/explore.html?view=west-3':'/aerial.html?models='+mode+'&view=west-3&buildingDetail=full'));
  await page.waitForFunction(()=>window.renderCorners?.renderer.info.render.frame>3);
  await page.locator('[data-lighting="day"]').click();await page.evaluate(()=>window.renderCorners.buildingPhotos?.close());
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  checks.push(await page.evaluate(async mode=>{
   const THREE=await import('/vendor/three.module.js'),{WEST_RANGE_PLAN:p}=await import('/west-range-plan.mjs'),{WEST_END_PROPORTIONS:e}=await import('/west-refinement.mjs');
   const {exterior,walker}=window.renderCorners;
   if(mode!=='explore'&&exterior.modelBuild.mode!==(mode==='source'?'procedural':'compiled'))throw Error('Wrong actual page model: '+exterior.modelBuild.mode);
   exterior.trees.visible=false;walker?.setObstacles();exterior.invalidateShadows();exterior.scene.fog.density=0;
   const meshes=[];exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isSprite)o.visible=false;if(o.isMesh)meshes.push(o);});
   const ray=new THREE.Raycaster();let trimProbes=0,panes=0;
   function surface(x,z,y,side,reach=.04){
    ray.set(new THREE.Vector3(x,y+side*reach/2,z),new THREE.Vector3(0,-side,0));ray.far=reach/2+.02;
    const hits=ray.intersectObjects(meshes,false);
    if(hits.length!==1||Math.abs(hits[0].point.y-y)>1e-5||hits[0].object.material.color.getHex()!==0xe1e3dc)throw Error('Actual page has a broken/doubled trim join '+JSON.stringify({mode,x,z,y,side,hits:hits.map(h=>({name:h.object.name,y:h.point.y}))}));trimProbes++;
   }
   for(const y of [4.05,8.6])for(const [x,z] of [[-72.27,p.outerRearZ-.20],[-72.27,p.outerFrontZ+.10],[-72.51,e.doorZ-e.pierWidth/2+.13],[-72.51,e.doorZ+e.pierWidth/2-.13],[-72.25,e.doorZ-e.pierWidth/2-.13],[-72.25,e.doorZ+e.pierWidth/2+.13]])for(const side of [-1,1])surface(x,z,y+side*.09,side);
   for(const z of [p.gardenZ+.4,15.8,17.6,19.6,p.innerFrontZ-.8])for(const side of [-1,1])surface(p.innerLeft-.16,z,8.6+side*.09,side,.8);
   for(const side of [-1,1])surface(p.innerLeft-.16,p.innerFrontZ-.3,8.6+side*.09,side);
   ray.far=2;
   for(const o of exterior.model.userData.westFrontPhotoOpenings.filter(o=>o.face==='west-front-inner-return'))for(const u of [-.26,.26])for(const v of [-.27,.27]){
    ray.set(new THREE.Vector3(o.x-.6,o.y+o.h*v,o.z+o.w*u),new THREE.Vector3(1,0,0));
    const hit=ray.intersectObjects(meshes,false)[0];if(hit?.object.material.color.getHex()!==0x78989f||hit.distance>=.6)throw Error('Garden pane buried');panes++;
   }
   return {mode,build:exterior.modelBuild??null,trimProbes,panes};
  },mode));
  for(const name of ['garden','yellow','frontCorner','endSteps','frontCornice','courtCorner','middleCornice']){
   await page.evaluate(v=>{const {exterior,walker,show}=window.renderCorners;if(walker)walker.setView(v);else show(v);exterior.camera.fov=v.fov;exterior.camera.near=.03;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views[name]);
   await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',out))});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(v=>{const {exterior,walker,show}=window.renderCorners;if(walker)walker.setView(v);else show(v);exterior.camera.fov=61;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views.garden);
  await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',out))});await page.setViewportSize({width:1224,height:918});
  console.log('PASS: '+mode+' actual page trim and pane probes, seven desktop views and phone view.');
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('pages-validation.json',out),JSON.stringify({checks,errors},null,2)+'\n');
}finally{await browser.close();server.kill();}
