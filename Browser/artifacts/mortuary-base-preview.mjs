import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {mortuaryPoint,MORTUARY} from '../dist/garages-mortuary.mjs';
const stage=process.argv[2]??'source',mode=stage==='compiled'?'compiled':'source',walking=stage==='walking';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__mortuary={THREE,exterior,renderer,controls};function frame(){if(!window.__mortuaryFreeze)requestAnimationFrame(frame);')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__mortuary={THREE,exterior,renderer,walker};const clock=new THREE.Timer();')});});
 if(stage==='before')await page.route('**/garages-mortuary.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile('Browser/artifacts/mortuary-base-before-source.mjs','utf8')}));
 await page.goto(base+(walking?'/explore.html?view=mortuary':'/aerial.html?models='+mode+'&buildingDetail=full&view=mortuary'));
 await page.waitForFunction(()=>window.__mortuary?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 await page.evaluate(()=>{const {exterior,renderer}=window.__mortuary;window.__mortuaryFreeze=true;renderer.setAnimationLoop(null);exterior.trees.visible=true;exterior.invalidateShadows();});
 const h=MORTUARY.halfWidth;
 const views=[['rear',mortuaryPoint(h+7,1.85,11),mortuaryPoint(h-1,1.05,5.5),65],['rear-shift',mortuaryPoint(h+6.6,1.85,11.3),mortuaryPoint(h-1,1.05,5.5),65],['base',mortuaryPoint(h+3,.8,8.6),mortuaryPoint(h-.9,.24,5.5),58],['front',mortuaryPoint(-h-7,1.85,-5),mortuaryPoint(-h+1,1.05,1.5),65],['overview',mortuaryPoint(12,9,-18),mortuaryPoint(0,2,1),48]];
 for(const [name,position,target,fov] of views){
  const png=await page.evaluate(({position,target,fov})=>{const {exterior,renderer,controls}=window.__mortuary;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.camera.near=.1;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls?.sync(target);exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);return renderer.domElement.toDataURL('image/png').split(',')[1];},{position,target,fov});
  await writeFile(`Browser/artifacts/mortuary-base-${stage}-${name}.png`,Buffer.from(png,'base64'));
 }
 const result={mode:await page.evaluate(()=>window.__mortuary.exterior.modelBuild?.mode??'walking'),errors};
 await writeFile(`Browser/artifacts/mortuary-base-${stage}.json`,JSON.stringify(result,null,2));
 assert.deepEqual(errors,[]);if(mode==='compiled')assert.equal(result.mode,'compiled');
 console.log('PASS: '+stage+' mortuary previews from five camera positions.');
}finally{await browser?.close();server.kill();}
