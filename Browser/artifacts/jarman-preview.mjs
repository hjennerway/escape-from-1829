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
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__jarman={exterior,renderer,controls,layouts};function frame(){')});});
 for(const mode of modes){
  await page.goto(base+'/aerial.html?period=1916&models='+mode+'&buildingDetail=full&view=annexe-jarman-photo');
  await page.waitForFunction(()=>window.__jarman?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__jarman.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  const walk=new URL(await page.locator('#churtonNav a').filter({hasText:'WALK HERE'}).getAttribute('href'),base);
  assert.equal(walk.searchParams.get('view'),'annexe-jarman-photo');
  assert.equal(walk.searchParams.get('period'),'1916');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  for(const [name,p,t,fov] of [
   ['photo',[-78,1.8,111],[-76,4.9,49],60],
   ['oblique',[-116,2.5,91],[-73,4.7,47],60],
   ['overview',[-115,62,112],[-74,1,27],53],
   ['plan',[-76,85,51],[-76,0,50.99],50]
  ]){
   await page.evaluate(async({p,t,fov})=>{
    const {exterior,controls}=window.__jarman,{annexePoint}=await import('/annexe.mjs');
    exterior.scene.fog.density=0;exterior.scene.traverse(o=>{if(o.isSprite)o.material.visible=false;});
    exterior.camera.position.set(...annexePoint(...p));const target=annexePoint(...t);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
   },{p,t,fov});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:fileURLToPath(new URL('annexe-jarman-'+phase+'-'+mode+'-'+name+'.jpg',import.meta.url)),type:'jpeg',quality:82});
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS: Jarman lawn/oblique/overview/plan source and compiled views; no page errors.');
}finally{await browser?.close();server.kill();}
