import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:720}}),errors=[];page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text()).replace('function frame(){','window.__roof={exterior,renderer,controls,layouts};function frame(){')});});
 await page.goto(base+'/aerial.html?period=1916&models='+mode+'&view=annexe');
 await page.waitForFunction(()=>window.__roof?.renderer.info.render.frame>3,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.__roof.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [label,name,index,offset] of [
 ['annexe-belfry','Bell tower base',0,[9,3,9]],['annexe-belfry-reverse','Bell tower base',0,[-9,3,-9]],
 ['annexe-stack','West front pavilion chimney stack',0,[-10,8,8]],
 ['churton','Churton chimney shaft',1,[8,3,8]],
 ['redesmere','Redesmere chimney stack',2,[8,4,8]],
 ['admin','Tall admin chimney stack',7,[9,5,10]],
 ['tower-finial','Water tower roof finial',0,[4,1.5,4]]]){
  await page.evaluate(async({name,index,offset})=>{
   const THREE=await import('./vendor/three.module.js'),{exterior:e,controls}=window.__roof,parts=[];
   e.model.traverse(o=>{if(o.name===name)parts.push(o);});const o=parts[index];if(!o)throw Error('Missing '+name);
   o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,t=new THREE.Vector3((b.min.x+b.max.x)/2,b.min.y+.7,(b.min.z+b.max.z)/2).applyMatrix4(o.matrixWorld);
   e.camera.position.copy(t).add(new THREE.Vector3(...offset));e.camera.fov=42;e.camera.lookAt(t);e.camera.updateProjectionMatrix();controls.sync(t.toArray());e.scene.fog.density=0;e.trees.visible=false;e.invalidateShadows();
  },{name,index,offset});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:`Browser/artifacts/roof-contact-${mode}-${label}.png`});
 }
 assert.deepEqual(errors,[]);console.log('PASS: seven roof-contact views rendered in '+mode+' mode without page errors.');
}finally{await browser?.close();server.kill();}
