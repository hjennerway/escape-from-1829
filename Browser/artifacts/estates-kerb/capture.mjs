import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const stage=process.argv[2]??'before',mode=stage.includes('compiled')?'compiled':'source',walking=stage.includes('walking');
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1440,height:800}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 if(stage.startsWith('baseline'))await page.route('**/historic-road-layout.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('...estatesKerbJoins({points:northService,width:6}),','')});});
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__kerbs={THREE,exterior,renderer,controls,layouts};function frame(){if(!window.__freezeKerbs)requestAnimationFrame(frame);')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__kerbs={THREE,exterior,renderer,walker,layouts};const clock=new THREE.Timer();')});});
 await page.goto(base+(walking?'/explore.html':'/aerial.html')+'?models='+mode+'&buildingDetail=full&view=estates-photo&period=1916');
 await page.waitForFunction(()=>window.__kerbs?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 await page.evaluate(()=>{window.__freezeKerbs=true;const {exterior,renderer}=window.__kerbs;renderer.setAnimationLoop(null);exterior.timeline.setPeriod(1916);exterior.scene.fog.density=0;});
 const {estatesPoint}=await import('../../dist/estates-department.mjs');
 const views=[
  ['entrance',estatesPoint(227,1.9,-47.4),estatesPoint(248.5,3.9,-49.5),64],
  ['short',estatesPoint(227,1.9,-47),estatesPoint(236.5,2,-40),67],
  ['long',estatesPoint(220,1.9,-56.6),estatesPoint(233.8,1.9,-56.6),67],
  ['plan',[245,64,-34.99],[245,0,-35],48],
  ['oblique',[214,25,-25],[241,0,-41],52]
 ];
 await mkdir(new URL('.',import.meta.url),{recursive:true});
 for(const [name,position,target,fov] of views){
  const png=await page.evaluate(({position,target,fov})=>{
   const {exterior,renderer,controls}=window.__kerbs;
   exterior.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
   exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls?.sync(target);exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
   return renderer.domElement.toDataURL('image/png').split(',')[1];
  },{position,target,fov});
  await writeFile(new URL(stage+'-'+name+'.png',import.meta.url),Buffer.from(png,'base64'));
 }
 const build=await page.evaluate(()=>window.__kerbs.exterior.modelBuild);
 await writeFile(new URL(stage+'.json',import.meta.url),JSON.stringify({build,errors},null,2));
 if(errors.length)throw new Error(errors.join('\n'));
 if(mode==='compiled'&&build.mode!=='compiled')throw new Error('Compiled scene fell back to source');
 console.log('PASS '+stage+' Estates kerb previews');
}finally{await browser?.close();server.kill();}
