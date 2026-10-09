import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const out=new URL('./',import.meta.url),before=process.argv.includes('--before');
const modes=!before&&process.argv.includes('--compiled')?['source','compiled']:['source'];
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1297,height:720},reducedMotion:'reduce'}),errors=[],report=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(before)for(const name of ['escape-exterior','east-photo-detail'])await page.route('**/'+name+'.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-'+name+'.mjs.txt',out),'utf8')}));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.bandCheck={THREE,exterior,renderer,pose(position,target,fov=70){moved=true;exterior.camera.near=.03;exterior.camera.fov=fov;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.updateProjectionMatrix();controls.sync(target);}};\nfunction frame(){')});
 });
 for(const mode of modes){
  await page.goto(base+'/aerial.html?models='+mode+'&view=front-corner-1&buildingDetail=full');
  await page.waitForFunction(()=>window.bandCheck?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>window.bandCheck.exterior.modelBuild);assert.equal(build.mode,mode==='source'?'procedural':'compiled');
  const probeSource=await readFile(new URL('../../test-support/redesmere-floor-band-probes.mjs',out),'utf8');
  const survey=await page.evaluate(async source=>{
   const {checkRedesmereFloorBand}=await import(URL.createObjectURL(new Blob([source],{type:'text/javascript'})));
   try{return {probes:checkRedesmereFloorBand(window.bandCheck.THREE,window.bandCheck.exterior.model)};}
   catch(error){return {error:error.message};}
  },probeSource);
  if(before)assert(survey.error,'Saved original geometry must reproduce missing or unsupported band');
  else assert.equal(survey.error,undefined,survey.error);
  await page.evaluate(()=>window.bandCheck.exterior.scene.traverse(o=>{if(o.isSprite)o.visible=false;}));
  await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
  const views=[
   {name:'marked',position:[57,1.8,29],target:[58,4.1,21],fov:82},
   {name:'overview',position:[62,2,35],target:[58,4.3,21],fov:66},
   {name:'underside',position:[57.5,.6,23],target:[57.5,4.05,19.5],fov:105},
   {name:'opposite',position:[64.5,1.3,29],target:[59,4.05,22],fov:82},
   {name:'garden',position:[76,1.8,48],target:[53,5.4,21],fov:76}
  ];
  for(const view of views){
   await page.evaluate(v=>window.bandCheck.pose(v.position,v.target,v.fov),view);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:fileURLToPath(new URL((before?'before-':'after-')+mode+'-'+view.name+'.png',out))});
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.bandCheck.pose([57,1.8,29],[58,4.1,21],82));
  await page.screenshot({path:fileURLToPath(new URL((before?'before-':'after-')+mode+'-phone.png',out))});await page.setViewportSize({width:1297,height:720});
  report.push({mode,build,survey,views:views.length+1});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL((before?'before-':'after-')+'validation.json',out),JSON.stringify({report,errors},null,2)+'\n');
 console.log('PASS: entrance band captures, GPU verification and no page/shader errors.');
}finally{await browser?.close();server.kill();}
