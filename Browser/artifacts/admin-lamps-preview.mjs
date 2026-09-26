import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
const tag=process.argv[2]??'before',mode=process.argv[3]??'source',fit=JSON.parse(await readFile(new URL('admin-lamps-fit.json',import.meta.url),'utf8'));
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:863,height:588}}),errors=[];page.setDefaultNavigationTimeout(120000);page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__lamps={exterior,renderer,controls,layouts,lighting,buildingDetail,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916');await page.waitForFunction(()=>window.__lamps);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 const report=await page.evaluate(async p=>{
  const {exterior:e,renderer,lighting,THREE}=window.__lamps,camera=e.camera;
  const [x,y,z,a,b,f,cx,cy]=p;camera.position.set(x,y,z);camera.up.set(0,1,0);camera.lookAt(x-Math.sin(a)*Math.cos(b),y-Math.sin(b),z-Math.cos(a)*Math.cos(b));camera.fov=2*Math.atan(588/(2*f))*180/Math.PI;camera.updateProjectionMatrix();camera.projectionMatrix.elements[8]=1-2*cx/863;camera.projectionMatrix.elements[9]=2*cy/588-1;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.trees.visible=true;window.__lamps.buildingDetail?.update(camera,588);e.scene.fog.density=0;e.invalidateShadows();renderer.render(e.scene,camera);
  let owner;e.model.traverse(o=>{if(o.userData.streetLamps?.some(p=>p.id==='Admin teardrop near lawn'))owner=o;});
  const shaft=owner.children.find(o=>o.name.startsWith('Pebbledash')),diffuser=owner.children.find(o=>o.name==='Recessed lamp underside'),matrix=new THREE.Matrix4(),ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
  const ground=[e.terrain];window.__lamps.layouts.historicRoads.traverse(o=>{if(o.isMesh&&o.userData.surface)ground.push(o);});
  const {exteriorObstacles,obstacleContains}=await import('./explore-controls.mjs');const obstacles=exteriorObstacles(THREE,owner);
  diffuser.geometry.computeBoundingBox();const fixtures=owner.userData.streetLamps.map((p,i)=>{
   shaft.getMatrixAt(i,matrix);const corners=Array.from({length:4},(_,j)=>{const foot=new THREE.Vector3().fromBufferAttribute(shaft.geometry.attributes.position,j).applyMatrix4(matrix).applyMatrix4(shaft.matrixWorld);ray.set(new THREE.Vector3(foot.x,2,foot.z),down);const hit=ray.intersectObjects(ground,false)[0];return {bottom:foot.y,surface:hit.object===e.terrain?'grass':hit.object.userData.surface,ground:hit.point.y,buried:hit.point.y-foot.y};});
   diffuser.getMatrixAt(i,matrix);const head=diffuser.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(matrix).applyMatrix4(diffuser.matrixWorld),light=lighting.lamps.filter(l=>l.owner===owner)[i];
   return {...p,corners,collision:obstacles.some(b=>obstacleContains(b,p.x,p.z,0)),lightHeadError:head.distanceTo(light.position)};
  });return {build:e.modelBuild,fixtures};
 },fit.parameters);
 for(const night of [false,true]){await page.evaluate(night=>{const {exterior:e,renderer,lighting}=window.__lamps;lighting.setNight(night);e.invalidateShadows();renderer.render(e.scene,e.camera);},night);const stem=`admin-lamps-${tag}-${mode}-${night?'night':'day'}`;await page.screenshot({path:fileURLToPath(new URL(stem+'.png',import.meta.url))});await page.screenshot({path:fileURLToPath(new URL(stem+'.jpg',import.meta.url)),quality:85});}
 await writeFile(new URL(`admin-lamps-${tag}-${mode}.json`,import.meta.url),JSON.stringify(report,null,2));assert.equal(report.build.mode,mode==='source'?'procedural':'compiled');assert.deepEqual(errors,[]);assert.equal(report.fixtures.length,3);for(const p of report.fixtures){assert(p.collision,p.id+' walking collision');assert(p.lightHeadError<.05,p.id+' aligned night light');for(const foot of p.corners){assert.equal(foot.surface,'grass',p.id+' foot clears all paving');assert(foot.buried>.029&&foot.buried<.031,p.id+' foot seated in ground');}}console.log(JSON.stringify(report));
}finally{await browser?.close();server.kill();}
