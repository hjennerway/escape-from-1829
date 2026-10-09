import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const stage=process.argv[2]??'after-source',mode=stage.includes('compiled')?'compiled':'source';
const out=new URL('./',import.meta.url);await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1217,height:600}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.adminBandQA={THREE,exterior,renderer,walker,lighting};const clock=new THREE.Timer();')});
 });
 await page.goto(base+'/explore.html?models='+mode+'&buildingDetail=full&view=main-admin-annexe-end&period=1916&lighting=day');
 await page.waitForFunction(()=>window.adminBandQA?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 await page.evaluate(()=>{
  const {renderer,exterior}=window.adminBandQA;renderer.setAnimationLoop(null);exterior.scene.fog.density=0;
  exterior.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
 });
 const views=[
  ['marked',[251,1.8,8],[235,3.1,12.8],68],
  ['side',[255,3.6,10],[234,3.3,13],64],
  ['recess',[247,2.4,12],[236,2.8,12],64],
  ['court',[237,2.4,-8],[229,3.8,7],62]
 ];
 for(const [name,position,target,fov] of views){
  const png=await page.evaluate(({position,target,fov})=>{
   const {exterior,renderer,walker}=window.adminBandQA;
   walker.setView({position,target});exterior.camera.fov=fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();
   exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
   return renderer.domElement.toDataURL('image/png').split(',')[1];
  },{position,target,fov});
  await writeFile(new URL(stage+'-'+name+'.png',out),Buffer.from(png,'base64'));
 }
 await page.setViewportSize({width:1217,height:383});
 const close=await page.evaluate(()=>{
  const {exterior,renderer,walker}=window.adminBandQA;walker.setView({position:[247,1.8,2],target:[235,2.65,12]});
  renderer.setSize(innerWidth,innerHeight);exterior.camera.aspect=innerWidth/innerHeight;
  exterior.camera.fov=64;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
  return renderer.domElement.toDataURL('image/png').split(',')[1];
 });
 await writeFile(new URL(stage+'-close.png',out),Buffer.from(close,'base64'));
 await page.setViewportSize({width:390,height:844});
 const png=await page.evaluate(()=>{
  const {exterior,renderer,walker}=window.adminBandQA;walker.setView({position:[251,1.8,8],target:[236,3.3,12.8]});
  renderer.setSize(innerWidth,innerHeight);exterior.camera.aspect=innerWidth/innerHeight;
  exterior.camera.fov=68;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
  return renderer.domElement.toDataURL('image/png').split(',')[1];
 });
 await writeFile(new URL(stage+'-phone.png',out),Buffer.from(png,'base64'));
 const build=await page.evaluate(()=>window.adminBandQA.exterior.modelBuild);
 assert.equal(build.mode,mode==='source'?'procedural':'compiled');assert.deepEqual(errors,[]);
 await writeFile(new URL(stage+'.json',out),JSON.stringify({build,errors,views},null,2)+'\n');
 console.log('PASS: '+stage+' admin band walking views, including recess, court and phone; no page/shader errors.');
}finally{await browser?.close();server.kill();}
