import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {PERIODS} from '../dist/estate-periods.mjs';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:760}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 async function checkGround(year){
  const samples=await page.evaluate(async()=>{
   const THREE=await import('./vendor/three.module.js'),{exterior}=window.__ground,meshes=[],ray=new THREE.Raycaster();
   exterior.model.updateMatrixWorld(true);
   exterior.model.traverseVisible(object=>{if(object.isMesh)meshes.push(object);});
   return [[-64,-10,1849],[60,-10,1849],[17,29,1849],[35,46,1849],[60,-30.5,1870],[100,15,1870],[76,20,1870],[0,32,1829],[-23,-25,1829],
    [90,32,1870,true],[68,36,1849,true],[-64,37,1849,true],[80,46,1870,true],[55,-34,1870,true]].map(([x,z,built,lawn=false])=>{
    ray.set(new THREE.Vector3(x,.49,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObjects(meshes,false)[0],material=hit?.object.material,grass=exterior.terrain.material;
    return {x,z,built,lawn,present:Boolean(hit),onTerrain:hit?.object===exterior.terrain,grass:Boolean(material?.userData.estateGrass),matchesGrass:material?.map===grass.map&&material.color.equals(grass.color)&&material.customProgramCacheKey()===grass.customProgramCacheKey()};
   });
  });
  for(const sample of samples){
   assert(sample.present);assert.equal(sample.grass,sample.lawn||year<sample.built,JSON.stringify({year,...sample}));
   if(sample.lawn)assert.equal(sample.onTerrain,year<sample.built,'No raised lawn patches before construction');
   if(year<sample.built)assert(sample.matchesGrass,'Grass colour, texture and world scale match the terrain');
  }
 }
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__ground={exterior,renderer,controls};function frame(){')});});
 for(const mode of (process.env.GROUND_SOURCE_ONLY?['source']:['source','compiled'])){
  await page.goto(base+'/aerial.html?period=1829&models='+mode);
  await page.waitForFunction(()=>window.__ground?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__ground.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  await page.evaluate(()=>{const {exterior,controls}=window.__ground;exterior.scene.fog.density=0;exterior.camera.position.set(15,160,150);exterior.camera.lookAt(15,0,0);exterior.camera.fov=46;exterior.camera.updateProjectionMatrix();controls.sync([15,0,0]);});
  for(const year of [...PERIODS.map(period=>period.year),1849,1870,1829]){
   await page.evaluate(year=>window.__ground.exterior.timeline.setPeriod(year),year);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await checkGround(year);
   if([1829,1849,1870].includes(year))await page.screenshot({path:fileURLToPath(new URL('timeline-ground-'+mode+'-'+year+'.png',import.meta.url))});
  }
  await page.evaluate(()=>{const {exterior,controls}=window.__ground;exterior.timeline.setPeriod(1829);exterior.camera.position.set(115,55,90);exterior.camera.lookAt(65,0,25);controls.sync([65,0,25]);});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL('timeline-ground-details-'+mode+'.png',import.meta.url))});
 }
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Clock();','window.__ground={exterior,renderer};const clock=new THREE.Clock();')});});
 await page.goto(base+'/explore.html?period=1829');await page.waitForFunction(()=>window.__ground?.renderer.info.render.frame>3,null,{timeout:120000});
 for(const [index,period] of [...PERIODS.entries(),...PERIODS.entries()].reverse()){
  await page.locator('#periodSlider').fill(String(index));await checkGround(period.year);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: every period and repeat transitions, matching grass and no raised lawn outlines in '+(process.env.GROUND_SOURCE_ONLY?'source':'source and compiled')+' aerial and walking scenes; overview and close screenshots; no browser errors.');
}finally{await browser?.close();server.kill();}
