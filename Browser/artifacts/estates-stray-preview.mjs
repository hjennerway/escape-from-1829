import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const stage=process.argv[2]??'before',mode=stage==='compiled'?'compiled':'source',walking=stage==='walking';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__stray={THREE,exterior,renderer,controls};function frame(){if(!window.__strayFreeze)requestAnimationFrame(frame);')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__stray={THREE,exterior,renderer,walker};const clock=new THREE.Timer();')});});
 await page.goto(base+(walking?'/explore.html':'/aerial.html?models='+mode+'&buildingDetail=full'));
 await page.waitForFunction(()=>window.__stray?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 await page.evaluate(()=>{const {exterior,renderer}=window.__stray;window.__strayFreeze=true;renderer.setAnimationLoop(null);exterior.trees.visible=true;exterior.invalidateShadows();});
 const views=[['overview',[267,85,23],[230,0,-20],65],['west',[270,1.8,-12],[240,0,-27],67],['east',[235,1.8,-15],[260,0,-24],67],['south',[266,1.8,42],[245,0,40],67]];
 for(const [name,position,target,fov] of views){
  const png=await page.evaluate(({position,target,fov})=>{const {exterior,renderer,controls}=window.__stray;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.camera.near=.1;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls?.sync(target);exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);return renderer.domElement.toDataURL('image/png').split(',')[1];},{position,target,fov});
  await writeFile(`Browser/artifacts/estates-stray-${stage}-${name}.png`,Buffer.from(png,'base64'));
 }
 const actualMode=await page.evaluate(()=>window.__stray.exterior.modelBuild?.mode??'walking');
 await writeFile(`Browser/artifacts/estates-stray-${stage}.json`,JSON.stringify({mode:actualMode,errors},null,2));
 if(stage==='compiled'&&actualMode!=='compiled')throw new Error('Expected compiled scene');
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: '+stage+' Estates ground previews.');
}finally{await browser?.close();server.kill();}
