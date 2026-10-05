import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const out=new URL('./artifacts/door-trim/',import.meta.url);await mkdir(out,{recursive:true});
const baseline=process.argv.includes('--baseline');
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1200,height:780}}),errors=[],report=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(baseline)for(const name of ['west-front-photo-detail.mjs','annexe-larkton-recess.mjs'])await page.route('**/'+name,async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-'+name,out),'utf8')}));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('import {updateRoadLabels}', 'const updateRoadLabels=()=>{}; import {updateRoadLabels as unusedRoadLabels}').replace('function frame(){',`window.trimCheck={THREE,exterior,renderer,layouts,pose(position,target){moved=true;exterior.camera.near=.03;exterior.camera.fov=58;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.updateProjectionMatrix();controls.sync(target);}};\nfunction frame(){`)});
 });
 for(const mode of baseline?['source']:['source','compiled']){
  await page.goto(base+'/aerial.html?models='+mode+'&view=front&buildingDetail=full');
  await page.waitForFunction(()=>window.trimCheck?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>window.trimCheck.exterior.modelBuild);
  assert.equal(build.mode,mode==='source'?'procedural':'compiled');
  await page.evaluate(()=>{const {exterior}=window.trimCheck;exterior.timeline.setPeriod(1916);exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.invalidateShadows();});
  const checks=await page.evaluate(()=>{
   const {THREE,exterior}=window.trimCheck,ray=new THREE.Raycaster(),hits=[],views=[],visibility=[];
   // Batching preserves named sources. Inspect them for stable leaf identity,
   // then restore the actual batched rendering before capturing each view.
   exterior.model.traverse(o=>{if(o.userData.aerialBatch||o.userData.aerialBatchSource){visibility.push([o,o.visible]);o.visible=!!o.userData.aerialBatchSource;}});
   const active=[];exterior.model.traverseVisible(o=>{if(o.isMesh)active.push(o);});
   for(const dx of [-.6,-.3,.3,.6])for(const y of [.46,.53,.61]){
    // Match the relocated D3 garden leaf on the centred window bank.
    ray.set(new THREE.Vector3(-44.7+dx,y,14.2),new THREE.Vector3(0,0,-1));ray.far=1;
    hits.push({door:'west-garden',dx,y,colour:ray.intersectObjects(active,false)[0]?.object.material.color.getHex()});
   }
   views.push({name:'west-garden',position:[-43.2,1.65,17.2],target:[-44.7,1.5,13.59]});
   const group=exterior.annexe.userData.larktonRecess.group;
   for(const name of ['Recess shadowed entrance door','Recess pale room door']){
    const door=group.getObjectByName(name),normal=new THREE.Vector3(0,0,1).transformDirection(group.matrixWorld);
    for(const dx of [-.55,0,.55])for(const y of [.12,.25,.38,1.515]){
     const p=group.localToWorld(new THREE.Vector3(door.position.x+dx,y,door.position.z+.6));ray.set(p,normal.clone().negate());ray.far=1;
     hits.push({door:name,dx,y,hit:ray.intersectObjects(active,false)[0]?.object.name});
    }
    const target=door.getWorldPosition(new THREE.Vector3());target.y=1.45;
    const position=target.clone().addScaledVector(normal,4).addScaledVector(new THREE.Vector3(1,0,0).transformDirection(group.matrixWorld),1.1);position.y=1.7;
    views.push({name:name==='Recess pale room door'?'annexe-pale':'annexe-arch',position:position.toArray(),target:target.toArray()});
   }
   for(const [o,visible] of visibility)o.visible=visible;
   return {hits,views};
  });
  if(!baseline)for(const h of checks.hits){
   if(h.door==='west-garden')assert.equal(h.colour,0x172e50,mode+' garden door is clear at '+JSON.stringify(h));
   else assert(h.hit===h.door||(h.door==='Recess pale room door'&&h.hit==='Recess door lower panel'),mode+' annexe leaf is clear at '+JSON.stringify(h));
  }
  await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
  for(const v of checks.views){
   await page.evaluate(v=>window.trimCheck.pose(v.position,v.target),v);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:fileURLToPath(new URL((baseline?'before':mode)+'-'+v.name+'.png',out))});
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.trimCheck.pose([-43.2,1.65,17.2],[-44.7,1.5,13.59]));
  await page.screenshot({path:fileURLToPath(new URL((baseline?'before':mode)+'-mobile.png',out))});await page.setViewportSize({width:1200,height:780});
  report.push({mode,build,hits:checks.hits});console.log('Checked '+mode+' door trim and captured three doors plus mobile');
 }
 assert.deepEqual(errors,[]);await writeFile(new URL((baseline?'before-':'')+'browser-validation.json',out),JSON.stringify({report,errors},null,2)+'\n');
 console.log('PASS: door-trim rendering checks without page or shader errors.');
}finally{await browser?.close();server.kill();}
