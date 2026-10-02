import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const stage=process.argv[2]??'before',mode=stage==='compiled'?'compiled':'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject)});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1008,height:820}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__gallery={THREE,exterior,renderer,controls};function frame(){if(!window.__galleryFreeze)requestAnimationFrame(frame);')})});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full&view=west-wing-side');
 await page.waitForFunction(()=>window.__gallery?.renderer.info.render.frame>3);
 await page.evaluate(()=>{window.__galleryFreeze=true;window.__gallery.renderer.setAnimationLoop(null)});
 for(const [name,position,target,fov] of [
  ['context',[-43.4,1.8,-28.2],[-37.6,4,-31.1],64],
  ['join',[-40.8,.85,-29.2],[-37.6,.55,-30.7],55],
  ['join-left',[-41.5,1.1,-30],[-37.6,.5,-30.7],55],
  ['join-right',[-40,1,-28.5],[-37.6,.5,-30.7],55]
 ]){
  const png=await page.evaluate(({position,target,fov})=>{const {exterior,renderer,controls}=window.__gallery;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false});exterior.camera.near=.1;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);return renderer.domElement.toDataURL('image/png').split(',')[1]},{position,target,fov});
  await writeFile(new URL(`./${stage}-${name}.png`,import.meta.url),Buffer.from(png,'base64'));
 }
 const result={mode:await page.evaluate(()=>window.__gallery.exterior.modelBuild?.mode),errors};
 await writeFile(new URL(`./${stage}.json`,import.meta.url),JSON.stringify(result,null,2));
 if(errors.length)throw Error(errors.join('\n'));
 if(mode==='compiled'&&result.mode!=='compiled')throw Error('Compiled model did not load');
 console.log(JSON.stringify(result));
}finally{await browser?.close();server.kill()}
