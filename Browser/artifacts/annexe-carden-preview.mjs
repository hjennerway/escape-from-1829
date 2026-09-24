import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const phase=process.argv[2]??'after',modes=process.argv.includes('--both')?['source','compiled']:['source'];
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[];
 page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__carden={exterior,renderer,controls,layouts};function frame(){')});});
 for(const mode of modes){
  await page.goto(base+'/aerial.html?period=1916&models='+mode+'&buildingDetail=full&view=annexe-carden-photo');
  await page.waitForFunction(()=>window.__carden?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__carden.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  const walk=new URL(await page.locator('#churtonNav a').filter({hasText:'WALK HERE'}).getAttribute('href'),base);
  assert.equal(walk.searchParams.get('view'),'annexe-carden-photo');
  assert.equal(walk.searchParams.get('period'),'1916');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  for(const [name,p,t,fov] of [
   ['photo',[67,1.8,-55],[0,9,-6],60],
   ['detail',[67,1.8,-55],[5,9,-12],45],
   ['annotation',[65,42,-65],[3,8,-14],46],
   ['rear',[0,36,-64],[0,8,-8],48],
   ['plan',[18,90,-20],[18,0,-19.99],45],
   ['overview',[94,70,-97],[0,4,-9],49],
   ['front',[0,1.8,120],[0,9,14],48]
  ]){
   await page.evaluate(async({p,t,fov})=>{
    const {exterior,controls}=window.__carden,{annexePoint}=await import('/annexe.mjs');
    exterior.scene.fog.density=0;exterior.scene.traverse(o=>{if(o.isSprite)o.material.visible=false;});
    exterior.camera.position.set(...annexePoint(...p));const target=annexePoint(...t);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
   },{p,t,fov});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:fileURLToPath(new URL('annexe-carden-'+phase+'-'+mode+'-'+name+'.png',import.meta.url))});
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS: annexe Carden photo/front/overview views; no page errors.');
}finally{await browser?.close();server.kill();}
