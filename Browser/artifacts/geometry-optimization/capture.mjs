import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const variant=process.argv[2]??'after',out=new URL(variant+'/',import.meta.url);await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const results={variant,views:[],errors:[]};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1300,height:900},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>results.errors.push(e.message));
 if(variant==='before')for(const name of ['model-binary','aerial-performance','building-detail','admin-corridor-detail','annexe-oakmere-court','furniture-models','padded-cell-models','roof-wall-joins','historic-roads','pharmacy-court','game','explore','aerial-layouts'])await page.route('**/'+name+'.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('before/'+name+'.mjs',import.meta.url),'utf8')}));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.geometryReview={renderer,exterior,layouts,buildingDetail,controls};function frame(){')});});
 async function capture(name){
  await page.evaluate(()=>new Promise(resolve=>{let n=0;function next(){if(++n===35)resolve();else requestAnimationFrame(next);}next();}));
  const metrics=await page.evaluate(()=>{const t=window.geometryReview,r=t.renderer,scene=t.walker&&!t.walker.actor.outside?t.interior.scene:t.exterior.scene,drawn=[];const saved=[];
   scene.traverse(o=>{if(!o.isMesh)return;saved.push([o,o.onBeforeRender]);o.onBeforeRender=function(...args){const g=args[3];drawn.push({name:o.name,triangles:(g.index?.count??g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1)});};});r.render(scene,t.exterior.camera);for(const [o,callback] of saved)o.onBeforeRender=callback;
   return {render:{...r.info.render},drawn,model:t.exterior.modelBuild,detail:t.buildingDetail?.stats};});
  results.views.push({name,...metrics});await page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});console.log(name+': '+metrics.render.calls+' calls, '+metrics.render.triangles+' triangles');
 }
 await page.goto(base+'/aerial.html?models=source&period=1916&lighting=day');await page.waitForFunction(()=>window.geometryReview?.renderer.info.render.frame>4);await capture('aerial');
 for(const [name,module,key,view] of [['west-court','west-court-photo-detail','WEST_COURT_PHOTO_VIEW',null],['main-admin','main-admin-building','MAIN_ADMIN_VIEWS','main-admin'],['annexe','annexe','ANNEXE_VIEWS','annexe'],['corridor-close','main-admin-building','MAIN_ADMIN_VIEWS','main-admin-corridor'],['pharmacy-close','pharmacy-court','PHARMACY_VIEWS','pharmacy-photo'],['pharmacy-far','pharmacy-court','PHARMACY_VIEWS','pharmacy']]){
  await page.evaluate(async({module,key,view})=>{const source=await import('/'+module+'.mjs'),shot=view?source[key][view]:source[key],{exterior,controls}=window.geometryReview;exterior.camera.position.set(...shot.position);exterior.camera.fov=shot.fov??46;exterior.camera.lookAt(...shot.target);exterior.camera.updateProjectionMatrix();controls.sync(shot.target);exterior.invalidateShadows();},{module,key,view});await capture(name);
 }
 if(variant==='compiled'){await page.goto(base+'/aerial.html?models=compiled&period=1916&lighting=day');await page.waitForFunction(()=>window.geometryReview?.renderer.info.render.frame>4);await capture('compiled-aerial');}
 await page.route('**/explore.mjs',async route=>{const body=variant==='before'?await readFile(new URL('before/explore.mjs',import.meta.url),'utf8'):await (await route.fetch()).text();await route.fulfill({contentType:'text/javascript',body:body.replace('const clock=new THREE.Timer();','window.geometryReview={renderer,exterior,interior,floors,walker};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html?view=west-court-photo&lighting=day');await page.waitForFunction(()=>window.geometryReview?.renderer.info.render.frame>4);await capture('explore-court');
 for(const [name,roomId,floorId] of [['ward','R32',0],['padded-cell','B5',2]]){
  await page.evaluate(({roomId,floorId})=>{const {walker,floors,exterior}=window.geometryReview,room=floors[floorId].rooms.find(r=>r.id===roomId);Object.assign(walker.actor,{x:room.label[0],z:room.label[1],floor:floorId,y:floors[floorId].elevation,outside:false,stair:null});walker.update(.01);exterior.camera.position.set(room.label[0],floors[floorId].elevation+1.65,room.label[1]);exterior.camera.lookAt(room.label[0]+2,floors[floorId].elevation+1.2,room.label[1]-5);},{roomId,floorId});await capture(name);
 }
 await page.evaluate(()=>{const {walker,floors,exterior}=window.geometryReview,room=floors[2].rooms.find(r=>r.id==='B5'),x=Math.min(...room.points.map(p=>p[0])),z=Math.min(...room.points.map(p=>p[1]));Object.assign(walker.actor,{x:x+.9,z:z+1.1,floor:2,y:floors[2].elevation,outside:false,stair:null});walker.update(.01);exterior.camera.position.set(x+.9,floors[2].elevation+1.65,z+1.1);exterior.camera.lookAt(x,floors[2].elevation+1.4,z);});await capture('padding-close');
 await writeFile(new URL('metrics.json',out),JSON.stringify(results,null,2)+'\n');if(results.errors.length)throw Error(results.errors.join('\n'));
}finally{await browser?.close();server.kill();}
