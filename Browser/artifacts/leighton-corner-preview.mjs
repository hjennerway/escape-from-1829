import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const phase=process.argv.includes('--before')?'before':'after';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.on('error',reject);});
let browser;try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:750}}),errors=[];page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 if(phase==='before')await page.route('**/annexe-leighton-newton.mjs',route=>route.fulfill({contentType:'text/javascript',body:readFileSync(new URL('leighton-corner-before.mjs',import.meta.url),'utf8')}));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__preview={exterior,renderer,controls};function frame(){')});});
 for(const mode of process.argv.includes('--both')?['source','compiled']:process.argv.includes('--compiled')?['compiled']:['source']){
 await page.goto(base+'/aerial.html?view=leighton-newton&models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.__preview?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__preview.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [name,p,t] of [['outer',[54,2.2,-14],[29,5,-41]],['inner',[21,2.2,-75],[28,5,-49]],['marked',[3,56,-93],[28,2,-49]],['plan',[28,110,-49.01],[28,0,-49]]]){
 await page.evaluate(async({p,t})=>{const {exterior:e,controls}=window.__preview,{ANNEXE_MAP_SCALE:S,ANNEXE}=await import('/annexe.mjs');const g=e.annexe.getObjectByName('Leighton Newton photographed elevations');const v=(a)=>g.localToWorld(new THREE.Vector3(a[0]*S,a[1]/ANNEXE.verticalScale,a[2]*S));const THREE=await import('/vendor/three.module.js');e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.material.visible=false;});e.camera.position.copy(v(p));const target=v(t);e.camera.lookAt(target);e.camera.fov=48;e.camera.updateProjectionMatrix();controls.sync(target.toArray());},{p,t});
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:new URL('leighton-corner-'+phase+'-'+mode+'-'+name+'.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
 }
 }
 assert.deepEqual(errors,[]);console.log('PASS: Leighton source/compiled preview views.');
}finally{await browser?.close();server.kill();}
