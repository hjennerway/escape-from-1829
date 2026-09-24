import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const phase=process.argv[2]??'before',mode=process.argv[3]??'source';
const {parameters:p}=JSON.parse(readFileSync(new URL('chimney-relocation-camera.json',import.meta.url)));
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1304,height:642}}),errors=[];
 page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__chimney={exterior,renderer,controls,layouts};function frame(){')});});
 if(phase==='before')await page.route('**/estate-chimney.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('x:167,z:-37','x:177.5,z:-35.5')});});
 await page.goto(base+'/aerial.html?period=1916&view=tower-buildings&models='+mode);
 await page.waitForFunction(()=>window.__chimney?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__chimney.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 await page.evaluate(p=>{
  const {exterior,controls}=window.__chimney,camera=exterior.camera;
  camera.position.set(...p.slice(0,3));
  const forward=[-Math.sin(p[3])*Math.cos(p[4]),-Math.sin(p[4]),-Math.cos(p[3])*Math.cos(p[4])];
  const target=forward.map((v,i)=>p[i]+v*150);
  camera.lookAt(...target);camera.fov=2*Math.atan(642/2/p[5])*180/Math.PI;camera.updateProjectionMatrix();controls.sync(target);
  exterior.scene.fog.density=0;exterior.invalidateShadows();
 },p);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:`Browser/artifacts/chimney-relocation-${phase}-${mode}.png`});
 console.log(await page.evaluate(()=>({mode:window.__chimney.exterior.modelBuild.mode,position:window.__chimney.exterior.estateChimney.position.toArray()})));
 assert.deepEqual(errors,[]);console.log('PASS: chimney relocation browser render without page errors.');
}finally{await browser?.close();server.kill();}
