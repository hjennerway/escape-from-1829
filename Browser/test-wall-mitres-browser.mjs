import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/wall-mitres/',import.meta.url);await mkdir(destination,{recursive:true});
const before=process.argv.includes('--before'),sourceOnly=process.argv.includes('--source');
const selectedView=process.argv.find(arg=>arg.startsWith('--view='))?.slice(7);
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1100,height:760},reducedMotion:'reduce'}),errors=[],report=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch(),body=(await response.text()).replace('function frame(){','window.wallCheck={THREE,exterior,renderer,pose(position,target){moved=true;exterior.camera.near=.03;exterior.camera.fov=52;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.updateProjectionMatrix();controls.sync(target);}};\nfunction frame(){');
  await route.fulfill({response,body});
 });
 if(before)for(const name of ['front-basement','west-side-basement','front-steps','irby-ashley','main-admin-building','tower-buildings','laundry'])await page.route('**/'+name+'.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('before/'+name+'.mjs',destination),'utf8')}));
 for(const mode of before||sourceOnly?['source']:['source','compiled']){
  const label=before?'before':mode;
  await page.goto(base+'/aerial.html?models='+mode+'&view=front&buildingDetail=full');
  await page.waitForFunction(()=>window.wallCheck?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>window.wallCheck.exterior.modelBuild);assert.equal(build.mode,mode==='source'?'procedural':'compiled');
  await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
  const views=[
   ...[-1,1].flatMap(s=>[
    {name:(s<0?'west':'east')+'-front-outer',position:[s*23,2.2,24.5],target:[s*20.52,0,21.78]},
    {name:(s<0?'west':'east')+'-front-inner',position:[s*18,2,21.9],target:[s*20.52,0,19.38]},
    {name:(s<0?'west':'east')+'-front-overview',position:[s*16,5.5,29],target:[s*16,-.1,19.8]},
    {name:(s<0?'west':'east')+'-entrance-steps',position:[s*7,4,29],target:[s*4.07,2.3,26]}
   ]),
   {name:'west-basement-stair',position:[-42,1.5,-31.5],target:[-39.9,0,-33.6]},
   {name:'west-basement-end',position:[-41,1.5,-6],target:[-39.9,0,-4.48]},
   {name:'tower-parapet',position:[143,13,-23.5],target:[146.3,9.34,-26.6]},
   {name:'laundry-coping',position:[99,6,29],target:[101.96,3.44,28.04]}
  ];
  const extra=await page.evaluate(()=>{
   const {exterior,THREE}=window.wallCheck,c=exterior.irbyAshley.userData.conservatory;
   const b=new THREE.Box3().setFromObject(exterior.mainAdmin.getObjectByName('Rear flat court block walls'));
   return [
    {name:'irby-conservatory',position:[c.x0-3,2.5,c.z0-3],target:[c.x0,.7,c.z0]},
    {name:'admin-parapet',position:[b.max.x+3,b.max.y+3,b.min.z-4],target:[b.max.x,b.max.y+.5,b.min.z]}
   ];
  });views.push(...extra);
  for(const view of views.filter(v=>!selectedView||v.name===selectedView)){
   await page.evaluate(v=>window.wallCheck.pose(v.position,v.target),view);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:fileURLToPath(new URL(label+'-'+view.name+'.png',destination))});
  }
  if(!selectedView){await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.wallCheck.pose([23,2.2,24.5],[20.52,0,21.78]));
  await page.screenshot({path:fileURLToPath(new URL(label+'-mobile.png',destination))});await page.setViewportSize({width:1100,height:760});
  }
  const count=selectedView?views.filter(v=>v.name===selectedView).length:views.length+1;
  report.push({mode:label,build,views:count});console.log('Captured '+label+': '+count+' corner views');
 }
 await writeFile(new URL((before?'before':'validation')+(selectedView?'-'+selectedView:'')+'.json',destination),JSON.stringify({report,errors},null,2)+'\n');
 assert.deepEqual(errors,[]);console.log('PASS: exterior wall corner views rendered without page or shader errors.');
}finally{await browser?.close();server.kill();}
