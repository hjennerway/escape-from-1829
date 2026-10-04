import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const output=new URL('./',import.meta.url),modes=process.argv.slice(2);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],checks=[];
const views={marked:{position:[-69,34,-21],target:[-38,6,-12],fov:48},close:{position:[-49,11,-1],target:[-37,8.8,1.4],fov:50}};
try{
 for(const mode of modes){
  console.log('Checking '+mode);
  const page=await browser.newPage({viewport:{width:1374,height:830}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',route=>route.abort());
  if(mode==='before')await page.route('**/west-wing-photo-detail.mjs',route=>readFile(new URL('before-west-wing-photo-detail.mjs',output),'utf8').then(body=>route.fulfill({contentType:'text/javascript',body})));
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.columnActual={exterior,renderer,controls,buildingPhotos,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
  await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.columnActual={exterior,renderer,walker};const clock=new THREE.Timer();')});});
  await page.goto(base+(mode==='explore'?'/explore.html?view=west-5':'/aerial.html?models='+(mode==='compiled'?'compiled':'source')+'&view=west-5&buildingDetail=full'));
  await page.waitForFunction(()=>window.columnActual?.renderer.info.render.frame>3);
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>{const {exterior:e,buildingPhotos,walker}=window.columnActual;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});walker?.setObstacles();e.invalidateShadows();buildingPhotos?.close();});
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  checks.push(await page.evaluate(async mode=>{
   const THREE=await import('/vendor/three.module.js'),e=window.columnActual.exterior,openings=e.model.userData.westWingPhotoOpenings;
   if(mode==='compiled'&&e.modelBuild.mode!=='compiled')throw Error('Expected rebuilt compiled scene');
   const column=openings.filter(o=>o.face==='west-wing-outer'&&Math.abs(o.z-1.4)<1e-6);
   if(mode==='before'){if(column.length)throw Error('Baseline already contains the column');return {mode,newWindows:0};}
   if(column.length!==3)throw Error('Expected a complete three-window column');
   e.model.updateMatrixWorld(true);const meshes=[];e.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
   const ray=new THREE.Raycaster();let probes=0;
   for(const o of column){
    const neighbour=openings.find(n=>n.face===o.face&&n.z===-2.5&&n.y===o.y);
    if(!neighbour||o.x!==neighbour.x||o.w!==neighbour.w||o.h!==neighbour.h||Math.abs(o.z-neighbour.z-3.9)>1e-6)throw Error('New sash does not match its neighbour');
    for(const u of [-.26,.26])for(const v of [-.27,.27]){
     ray.set(new THREE.Vector3(o.x-.6,o.y+o.h*v,o.z+o.w*u),new THREE.Vector3(1,0,0));
     const hit=ray.intersectObjects(meshes,false)[0];
     if(hit?.object.material.color.getHex()!==0x78989f||hit.distance>=.6)throw Error('New pane obscured by geometry');probes++;
    }
   }
   return {mode,modelMode:e.modelBuild?.mode,newWindows:column.length,probes,column};
  },mode));
  async function show(v){await page.evaluate(v=>{const {exterior:e,walker,show}=window.columnActual;if(walker)walker.setView(v);else show(v);e.camera.fov=v.fov;e.camera.updateProjectionMatrix();e.invalidateShadows();},v);}
  for(const [name,v] of Object.entries(views)){await show(v);await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',output))});}
  if(mode==='compiled'||mode==='explore'){await page.setViewportSize({width:390,height:844});await show({...views.close,fov:80});await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',output))});}
  await page.close();
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation-'+modes.join('-')+'.json',output),JSON.stringify({checks,errors,views},null,2)+'\n');
 console.log('PASS: matching sash sizes and spacing, exposed panes, rendered views and no page/shader errors.');
}finally{await browser.close();server.kill();}
