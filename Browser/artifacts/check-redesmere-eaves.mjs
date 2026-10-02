import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const stage=process.argv[2]??'after',compiled=stage==='compiled';
const directory=new URL('./redesmere-eaves/',import.meta.url);await mkdir(directory,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1328,height:616}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error'&&/THREE|WebGL|shader/i.test(message.text()))errors.push(message.text());});
 await page.route('https://**/*',route=>route.abort());
 if(compiled){
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.eavesCheck={exterior,renderer,controls};function frame(){')});});
  await page.goto(base+'/aerial.html?models=compiled&view=redesmere-chimney');
 }else{
  await page.route('**/explore.mjs',async route=>{const source=await readFile(new URL('../dist/explore.mjs',import.meta.url),'utf8');await route.fulfill({contentType:'text/javascript',body:source.replace('const clock=new THREE.Timer();','window.eavesCheck={exterior,renderer,walker};const clock=new THREE.Timer();')});});
  await page.goto(base+'/explore.html?view=redesmere-chimney');
 }
 await page.waitForFunction(()=>window.eavesCheck?.renderer.info.render.frame>3);
 if(compiled)assert.equal(await page.evaluate(()=>window.eavesCheck.exterior.modelBuild.mode),'compiled');
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 const views=[
  ['approach',[73,1.8,44],[92,3.7,17],64],
  ['west-eaves',[74,1.8,27],[80,4.6,17],52],
  ['front-eaves',[90,1.8,30],[89.05,4.7,21],60],
  ['chimney',[101,1.8,30],[97,4.8,18],56],
  ['overhead',[88,22,39],[89,3.8,16],55]
 ];
 for(const [name,position,target,fov] of views){
  if(process.argv[3]&&process.argv[3]!==name)continue;
  await page.evaluate(({position,target,fov})=>{const {exterior,walker,controls}=window.eavesCheck;if(walker)walker.setView({position,target,fov});else{exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);}exterior.invalidateShadows();},{position,target,fov});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',directory))});
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{const {exterior,walker,controls}=window.eavesCheck;const view={position:[74,1.8,30],target:[85,4.2,18],fov:64};if(walker)walker.setView(view);else{exterior.camera.position.set(...view.position);exterior.camera.lookAt(...view.target);controls.sync(view.target);}exterior.invalidateShadows();});
 await page.screenshot({path:fileURLToPath(new URL(stage+'-mobile.png',directory))});
 assert.deepEqual(errors,[]);await writeFile(new URL(stage+'.json',directory),JSON.stringify({stage,views,errors},null,2)+'\n');
 console.log('PASS: '+stage+' Redesmere eaves rendered at walking height, overhead and on mobile without page/shader errors.');
}finally{await browser?.close();server.kill();}
