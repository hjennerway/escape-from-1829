import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const phase=process.argv[2]??'after',modes=process.argv.includes('--both')?['source','compiled']:process.argv.includes('--compiled')?['compiled']:['source'];
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];
 page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__kitchen={exterior,renderer,controls,layouts};function frame(){')});});
 for(const mode of modes){
  await page.goto(base+'/aerial.html?period=1916&models='+mode+'&buildingDetail=full&view=annexe-kitchen');
  await page.waitForFunction(()=>window.__kitchen?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__kitchen.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  const walkURL=new URL(await page.locator('#churtonNav a').filter({hasText:'WALK HERE'}).getAttribute('href'),base);
  assert.equal(walkURL.pathname,'/explore.html');assert.equal(walkURL.searchParams.get('view'),'annexe-kitchen');assert.equal(walkURL.searchParams.get('period'),'1916');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  for(const [name,p,t,fov] of [["marked",[25,90,-96],[-12,4,-145],48],["rear",[0,60,-215],[-10,3,-163],48],["plan",[-30,205,-126],[-30,0,-126.01],46],["court",[28,15,-107],[-23,6,-145],67],["detail",[14,12,-116],[-13,6,-156],65]]){
   await page.evaluate(async({p,t,fov,name})=>{
    const {exterior,controls}=window.__kitchen,{annexePoint,ANNEXE_VIEWS,ANNEXE}=await import('/annexe.mjs');
    exterior.scene.fog.density=0;exterior.scene.traverse(o=>{if(o.isSprite)o.material.visible=false;});exterior.camera.position.set(...(name==='photo'?ANNEXE_VIEWS['annexe-kitchen'].position:annexePoint(p[0],p[1]*ANNEXE.scale,p[2])));
    const target=name==='photo'?ANNEXE_VIEWS['annexe-kitchen'].target:annexePoint(t[0],t[1]*ANNEXE.scale,t[2]);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
   },{p,t,fov,name});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:fileURLToPath(new URL('oakmere-court-'+phase+'-'+mode+'-'+name+'.png',import.meta.url))});
  }
  await page.locator('#buildingPhotoPicker summary').evaluate(el=>el.click());
  await page.getByRole('button',{name:'Annexe · Oakmere Ward',exact:true,includeHidden:true}).evaluate(el=>el.click());
  const photo=page.locator('#buildingPhotoList img').first();
  await photo.waitFor();await page.waitForFunction(()=>document.querySelector('#buildingPhotoList img')?.naturalWidth>0);
  assert.equal(await photo.getAttribute('src'),'./building-photos/oakmere-rear-court.webp');
  assert.equal(await page.locator('#buildingPhotoList img').count(),2);
  await page.screenshot({path:fileURLToPath(new URL('oakmere-court-'+phase+'-'+mode+'-gallery.png',import.meta.url))});
 }
 assert.deepEqual(errors,[]);console.log('PASS: Oakmere plan, photo-side detail and gallery in requested model modes; no page errors.');
}finally{await browser?.close();server.kill();}


