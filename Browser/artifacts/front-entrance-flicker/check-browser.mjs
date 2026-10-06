import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const out=new URL('./',import.meta.url);await mkdir(out,{recursive:true});
const before=process.argv.includes('--before');
const modes=!before&&process.argv.includes('--compiled')?['source','compiled']:['source'];
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1239,height:787},reducedMotion:'reduce'}),errors=[],report=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(before)await page.route('**/escape-exterior.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-escape-exterior.mjs.txt',out),'utf8')}));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.entranceCheck={THREE,exterior,renderer,pose(position,target){moved=true;exterior.camera.near=.03;exterior.camera.fov=50;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.updateProjectionMatrix();controls.sync(target);}};\nfunction frame(){')});
 });
 for(const mode of modes){
  await page.goto(base+'/aerial.html?models='+mode+'&view=front&buildingDetail=full');
  await page.waitForFunction(()=>window.entranceCheck?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>window.entranceCheck.exterior.modelBuild);assert.equal(build.mode,mode==='source'?'procedural':'compiled');
  const surfaces=await page.evaluate(()=>{
   const {THREE,exterior}=window.entranceCheck,ray=new THREE.Raycaster(),bad=[],meshes=[];ray.far=.04;
   exterior.model.traverse(o=>{
    if(!o.isMesh)return;
    for(let parent=o;parent;parent=parent.parent)if(!parent.visible)return;
    meshes.push(o);
   });
   let probes=0;
   for(const side of [-1,1])for(const x of [7.19,7.31,7.46,7.61])
    for(const row of [3.8,7.2,10.6])for(const y of [row-1.315-.035,row-1.315,row-1.315+.035]){
     ray.set(new THREE.Vector3(side*x,y,17.32),new THREE.Vector3(0,0,-1));
     const hits=ray.intersectObjects(meshes,false);
     if(hits.length!==1||Math.abs(hits[0].point.z-17.3)>1e-5)bad.push({side,x,y,hits:hits.map(h=>({name:h.object.name,point:h.point.toArray()}))});
     probes++;
    }
   return {probes,bad};
  });
  if(before)assert(surfaces.bad.length>0,'Saved original exterior must reproduce the competing sill');
  else assert.deepEqual(surfaces.bad,[],'Actual visible/batched entrance surfaces have no competing sill');
  await page.evaluate(()=>window.entranceCheck.exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;}));
  await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
  const views=[
   {name:'entrance',position:[14,3,37],target:[6,7,18]},
   {name:'east-join',position:[10,4,23],target:[7.8,7.5,17.3]},
   {name:'east-oblique',position:[18,5,23],target:[8.1,7.5,17.3]},
   {name:'east-return',position:[8.5,4,20],target:[7.1,7.5,18.2]},
   {name:'west-join',position:[-10,4,23],target:[-7.8,7.5,17.3]},
   {name:'west-oblique',position:[-18,5,23],target:[-8.1,7.5,17.3]}
  ];
  for(const view of views){
   await page.evaluate(v=>window.entranceCheck.pose(v.position,v.target),view);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:fileURLToPath(new URL((before?'before-':'after-')+mode+'-'+view.name+'.png',out))});
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.entranceCheck.pose([12,3,30],[7.5,7,17.3]));
  await page.screenshot({path:fileURLToPath(new URL((before?'before-':'after-')+mode+'-phone.png',out))});await page.setViewportSize({width:1239,height:787});
  report.push({mode,build,surfaces,views:views.length+1});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL((before?'before-':'after-')+'browser-validation.json',out),JSON.stringify({report,errors},null,2)+'\n');
 console.log('PASS: entrance views without page or shader errors.');
}finally{await browser?.close();server.kill();}
