import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const destination=new URL('./',import.meta.url),audit=await readFile(new URL('audit.mjs',destination),'utf8');
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],checks=[];
try{
 for(const mode of ['before','source','compiled','explore']){
  console.log('Checking '+mode);
  const page=await browser.newPage({viewport:{width:1000,height:700}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',route=>route.abort());
  await page.route('**/pane-audit.mjs',route=>route.fulfill({contentType:'text/javascript',body:audit}));
  if(mode==='before')for(const name of ['photo-detail-primitives','west-front-photo-detail','west-refinement','west-wing-photo-detail','entrance-west-photo-detail']){
   const source=await readFile(new URL('baseline/'+name+'.mjs',destination),'utf8');
   await page.route('**/'+name+'.mjs',route=>route.fulfill({contentType:'text/javascript',body:source}));
  }
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.paneActual={exterior,renderer,controls,buildingPhotos,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
  await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.paneActual={exterior,renderer,walker};const clock=new THREE.Timer();')});});
  await page.goto(base+(mode==='explore'?'/explore.html?view=west-2':'/aerial.html?models='+(mode==='compiled'?'compiled':'source')+'&view=west-2&buildingDetail=full'));
  await page.waitForFunction(()=>window.paneActual?.renderer.info.render.frame>3);
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>{const e=window.paneActual.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite){o.visible=false;if(o.name.startsWith('Road label'))o.material.opacity=0;}});e.invalidateShadows();window.paneActual.buildingPhotos?.close();});
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  checks.push(await page.evaluate(async mode=>{
   const THREE=await import('/vendor/three.module.js'),{auditTripartitePanes}=await import('/pane-audit.mjs'),e=window.paneActual.exterior;
   if(mode==='compiled'&&e.modelBuild.mode!=='compiled')throw Error('Expected rebuilt compiled model');
   if(mode==='before'){
    try{auditTripartitePanes(THREE,e.model);}catch(error){if(!error.message.startsWith('Incorrect pane/bar'))throw error;return {mode,originalRejected:true};}
    throw Error('Original 3-3-3 model incorrectly passed');
   }
   return {mode,modelMode:e.modelBuild?.mode,...auditTripartitePanes(THREE,e.model)};
  },mode));
  const views=await page.evaluate(()=>{
   const e=window.paneActual.exterior,openings=e.model.userData.eastPhotoOpenings;
   const targets={garden:openings.find(o=>o.face==='west-front-bay-flank'&&o.y===6.45),end:openings.find(o=>o.face==='west-end-middle'&&o.w>1),entrance:openings.find(o=>o.face==='entrance-west-central-glazing'&&o.y===10),mirrored:openings.find(o=>o.face==='entrance-east-central-glazing'&&o.y===10),rear:e.model.userData.westWingPhotoOpenings.find(o=>o.face==='west-wing-upper-end'&&o.x===-31)};
   return Object.fromEntries(Object.entries(targets).map(([name,o])=>{const n=name==='end'?[-1,0,0]:name==='rear'?[0,0,-1]:[0,0,1];return [name,{target:[o.x,o.y,o.z],position:[o.x+n[0]*7+.35,o.y+.35,o.z+n[2]*7],fov:name==='entrance'||name==='mirrored'?25:40}];}));
  });
  async function show(v){await page.evaluate(v=>{const {exterior,walker,show}=window.paneActual;if(walker)walker.setView(v);else show(v);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},v);}
  for(const [name,v] of Object.entries(views)){await show(v);await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',destination))});}
  if(mode==='compiled'||mode==='explore'){
   await page.setViewportSize({width:390,height:844});await show({...views.garden,fov:65});await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',destination))});
  }
  await page.close();
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL('pages-validation.json',destination),JSON.stringify({checks,errors},null,2)+'\n');
 console.log('PASS: original rejected; source, compiled aerial and Explore pass pane/rail probes and desktop/phone captures without page or shader errors.');
}finally{await browser.close();server.kill();}
