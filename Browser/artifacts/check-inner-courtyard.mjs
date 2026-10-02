import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=process.env.COURTYARD_VALIDATION_ROOT?pathToFileURL(process.env.COURTYARD_VALIDATION_ROOT+'/'):new URL('../',import.meta.url),out=new URL('./inner-courtyard/',import.meta.url);
await mkdir(out,{recursive:true});
const label=process.argv[2]??'before',compiled=label.includes('compiled');
const server=spawn(process.execPath,['serve.mjs'],{cwd:root,windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1400,height:900},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 const module=compiled?'aerial.html*':'explore.mjs';
 await page.route('**/'+module,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(compiled?'function frame(){':'const clock=new THREE.Timer();','window.courtReview={THREE,exterior,renderer,lighting,'+(compiled?'controls':'walker')+'};'+(compiled?'function frame(){':'const clock=new THREE.Timer();'))});});
 await page.goto(base+(compiled?'/aerial.html?models=compiled&buildingDetail=full':'/explore.html?view=inner-east-photo'));await page.waitForFunction(()=>window.courtReview?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
 if(compiled)assert.equal(await page.evaluate(()=>window.courtReview.exterior.modelBuild.mode),'compiled');
 const views=[];
 for(const side of [-1,1]){
  const name=side<0?'west':'east';
  views.push({name:name+'-corner',position:[side*14,1.8,-5],target:[side*24,6,1]},
   {name:name+'-reverse',position:[side*18,1.8,-22],target:[side*25,10,-4]},
   {name:name+'-roof-low',position:[side*20,1.8,-21],target:[side*25,13.1,-22]},
   {name:name+'-overhead',position:[side*9,27,-26],target:[side*25,8,-4]});
 }
 for(const v of views){
  await page.evaluate(v=>{const {walker,exterior,controls,lighting}=window.courtReview;lighting.setMode('day');if(walker)walker.setView(v);else {exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}exterior.camera.fov=62;exterior.camera.updateProjectionMatrix();},v);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(label+'-'+v.name+'.png',out))});
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{const {walker,controls,exterior}=window.courtReview,v={position:[14,1.8,-5],target:[24,6,1]};if(walker)walker.setView(v);else {exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}});
 await page.screenshot({path:fileURLToPath(new URL(label+'-mobile.png',out))});
 await writeFile(new URL(label+'-report.json',out),JSON.stringify({errors,mode:await page.evaluate(()=>window.courtReview.exterior.modelBuild??'walking')},null,2));
 assert.deepEqual(errors,[]);console.log('Captured '+label+' inner courtyard views without page/shader errors');
}finally{await browser?.close();server.kill();}
