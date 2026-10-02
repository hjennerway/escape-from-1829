import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const out=new URL('./artifacts/facade-trim/',import.meta.url);await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:process.argv.includes('--hardware')?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:760},reducedMotion:'reduce'}),errors=[],report=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.trimCheck={THREE,exterior,renderer,pose(position,target){moved=true;exterior.camera.near=.03;exterior.camera.fov=58;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.updateProjectionMatrix();controls.sync(target);}};\nfunction frame(){')});
 });
 for(const mode of ['source','compiled']){
  await page.goto(base+'/aerial.html?models='+mode+'&view=front&buildingDetail=full');
  await page.waitForFunction(()=>window.trimCheck?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>window.trimCheck.exterior.modelBuild);assert.equal(build.mode,mode==='source'?'procedural':'compiled');
  await page.evaluate(()=>window.trimCheck.exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;}));
  await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
  const views=[
   {name:'reception-east',position:[5.6,1.8,21.5],target:[7.1,4,19.6]},
   {name:'reception-west',position:[-5.6,1.8,21.5],target:[-7.1,4,19.6]},
   {name:'west-step',position:[-20,2.1,22],target:[-22.6,3.15,19.7]},
   {name:'west-lawn-bay',position:[-23,5.8,31],target:[-27.43,4.05,33.07]},
   {name:'west-court',position:[-61,3.4,0],target:[-63.57,4.05,4.86]},
   {name:'east-court',position:[64.2,3,5.3],target:[66.17,4.06,7.22]},
   {name:'west-middle-bay',position:[-57,3.1,23],target:[-55.6,4.05,19.62]},
   {name:'west-roof-corner',position:[-76,16.5,-1],target:[-72.3,15.42,2.85]}
  ];
  const wards=await page.evaluate(()=>{
   const {THREE,exterior}=window.trimCheck,views=[];
   for(const family of ['Upton','Irby/Ashley','Hale','Farndon','Laundry']){
    let course;exterior.model.traverse(o=>{if(!course&&o.name.startsWith(family)&&o.userData.facadeBoxJoins?.length)course=o;});
    if(!course)throw Error('Missing course for '+family);
    const join=course.userData.facadeBoxJoins[0],p=new THREE.Vector3(...join.point).applyMatrix4(course.matrixWorld);
    const out=new THREE.Vector3(...join.a).add(new THREE.Vector3(...join.b)).normalize().transformDirection(course.matrixWorld).multiplyScalar(-2.3);
    const position=p.clone().add(out);position.y+=.8;
    views.push({name:family.replace(/\W/g,'-').toLowerCase(),position:position.toArray(),target:p.toArray()});
   }
   return views;
  });views.push(...wards);
  for(const view of views){
   await page.evaluate(v=>window.trimCheck.pose(v.position,v.target),view);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:fileURLToPath(new URL(mode+'-'+view.name+'.png',out))});
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.trimCheck.pose([5.6,1.8,21.5],[7.1,4,19.6]));
  await page.screenshot({path:fileURLToPath(new URL(mode+'-reception-mobile.png',out))});await page.setViewportSize({width:1100,height:760});
  report.push({mode,build,views:views.length+1});console.log('Captured '+mode+' facade and ward joins');
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('browser-validation.json',out),JSON.stringify({report,errors},null,2)+'\n');
 console.log('PASS: source and compiled facade courses, ward joins and mobile Reception without page or shader errors.');
}finally{await browser?.close();server.kill();}
