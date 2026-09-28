import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const stage=process.argv[2]??'after',mode=stage==='compiled'?'compiled':'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/i.test(m.text()))errors.push(m.text());});
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__ground={THREE,exterior,renderer,controls};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode);
 await page.waitForFunction(()=>window.__ground?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__ground.exterior.modelBuild.mode),mode==='compiled'?'compiled':'procedural');
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 const views=[['reference',[-145,95,-35],[-43,0,-47],45],['close',[-89,8,-46],[-73,0,-54],50],['frontage',[9,18,66],[0,0,38],48],['walking',[6,1.7,48],[1,0,32],58],['stairs',[10,14,42],[0,2,24],45],['render',[6,3,32],[1,2,21],48],['church',[9,8,-91],[0,5,-105],45]];
 const report={mode,views,errors};
 for(const [name,position,target,fov] of views){
  await page.evaluate(({position,target,fov})=>{const {exterior,controls}=window.__ground;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);}, {position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:`Browser/artifacts/ground-textures-${stage}-${name}.png`});
 }
 report.materials=await page.evaluate(()=>{const mats=new Set();window.__ground.exterior.model.traverse(o=>{for(const m of [o.material].flat())if(m?.userData.estateSurface||m?.userData.mineralFinish)mats.add(m);});return [...mats].map(m=>({surface:m.userData.estateSurface??m.userData.mineralFinish,map:m.map?.name,bump:m.bumpScale,anisotropy:m.map?.anisotropy,key:m.customProgramCacheKey()}));});
 if(stage!=='before')for(const kind of ['grass','asphalt','gravel','stone','render'])assert(report.materials.some(m=>m.surface===kind),'Restored '+kind+' finish');
 report.stairCorners=await page.evaluate(()=>{
  const {THREE,exterior}=window.__ground,meshes=[];exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  return [-1,1].map(side=>{const ray=new THREE.Raycaster(new THREE.Vector3(side*4.05,3,26.12),new THREE.Vector3(0,-1,0)),hit=ray.intersectObjects(meshes,false)[0];return {surface:hit?.object.material.userData.estateSurface,height:hit?.point.y};});
 });
 if(stage!=='before')for(const corner of report.stairCorners){assert.equal(corner.surface,'gravel');assert(Math.abs(corner.height-.195)<.001);}
 assert.deepEqual(errors,[]);
 await writeFile(`Browser/artifacts/ground-textures-${stage}.json`,JSON.stringify(report,null,2));
 console.log('PASS: '+stage+' ground previews, no rendering errors.');
}finally{await browser?.close();server.kill();}
