import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {PERIODS} from '../dist/estate-periods.mjs';

const before=Boolean(process.env.LAWN_BEFORE);
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:760}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__lawn={exterior,renderer,controls};function frame(){')});});
 for(const mode of (before?['source']:['source','compiled'])){
  await page.goto(base+'/aerial.html?period=1829&models='+mode);
  await page.waitForFunction(()=>window.__lawn?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__lawn.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  await page.evaluate(()=>{const {exterior,controls}=window.__lawn;exterior.scene.fog.density=0;exterior.camera.position.set(8,35,66);exterior.camera.lookAt(19,2,33);exterior.camera.fov=46;exterior.camera.updateProjectionMatrix();controls.sync([19,2,33]);});
  for(const {year} of (before?[PERIODS[0]]:PERIODS)){
   const samples=await page.evaluate(async year=>{
    const THREE=await import('./vendor/three.module.js'),{exterior}=window.__lawn;
    exterior.timeline.setPeriod(year);exterior.model.updateMatrixWorld(true);
    const ray=new THREE.Raycaster(),meshes=[];exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
    const plates=[32.5,39].map(z=>{ray.set(new THREE.Vector3(10,1,z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(meshes,false)[0];return {y:hit?.point.y,color:hit?.object.material.color.getHex()};});
    ray.set(new THREE.Vector3(21.97,3,44),new THREE.Vector3(0,0,-1));ray.far=2;
    return {plates,poleHits:ray.intersectObjects(meshes,false).length};
   },year);
   if(before)console.log('Before:',JSON.stringify(samples));
   else {assert(samples.plates.every(p=>p.y<.5&&p.color!==0x454b49),'No east ground plates in '+year+' '+mode);assert.equal(samples.poleHits,0,'No lawn column in '+year+' '+mode);}
   if(before||[1829,1916,2021].includes(year)){
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:fileURLToPath(new URL('front-lawn-items-'+(before?'before':mode+'-'+year)+'.png',import.meta.url))});
   }
  }
 }
 assert.deepEqual(errors,[]);
 console.log(before?'Captured original lawn items.':'PASS: removed column and both east ground fittings at all 13 stops in source/compiled scenes; close views captured without browser errors.');
}finally{await browser?.close();server.kill();}
