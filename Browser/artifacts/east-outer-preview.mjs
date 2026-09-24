import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const phase=process.argv[2]??'after',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];
 page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__east={exterior,renderer,controls,layouts};function frame(){')});});
 await page.goto(base+'/aerial.html?period=1916&models='+mode+'&view=annexe-plan&buildingDetail=full');
 await page.waitForFunction(()=>window.__east?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__east.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
 for(const [name,p,t] of [['plan',[165,100,-25.01],[165,0,-25]],['overview',[228,58,36],[169,2,-15]],['veranda',[218,5,-7],[187,3,-7]]]){
  await page.evaluate(async({p,t})=>{const {exterior,controls}=window.__east,{annexePoint}=await import('/annexe.mjs');exterior.scene.fog.density=0;exterior.scene.traverse(o=>{if(o.isSprite)o.material.visible=false;});exterior.camera.position.set(...annexePoint(...p));const target=annexePoint(...t);exterior.camera.lookAt(...target);exterior.camera.fov=48;exterior.camera.updateProjectionMatrix();controls.sync(target);},{p,t});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:new URL('east-outer-'+phase+'-'+mode+'-'+name+'.png',import.meta.url).pathname.replace(/^\/(.:)/,'$1')});
 }
 assert.deepEqual(errors,[]);console.log('PASS: east outer plan, overview and veranda views; '+mode+' loading, no page errors.');
}finally{await browser?.close();server.kill();}
