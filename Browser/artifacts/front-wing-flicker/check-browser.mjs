import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const out=new URL('./',import.meta.url),before=process.argv.includes('--before');
const modes=process.argv.includes('--compiled')?['source','compiled']:['source'];
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'}),errors=[],report=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(before)for(const name of ['front-inside-corners','escape-exterior'])await page.route('**/'+name+'.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-'+name+'.mjs.txt',out),'utf8')}));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.wingCheck={THREE,exterior,renderer,lighting,pose(position,target,fov=66){moved=true;exterior.camera.near=.03;exterior.camera.fov=fov;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.updateProjectionMatrix();controls.sync(target);}};\nfunction frame(){')});
 });
 for(const mode of modes){
  await page.goto(base+'/aerial.html?models='+mode+'&view=front-corner-2&buildingDetail=full');
  await page.waitForFunction(()=>window.wingCheck?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>window.wingCheck.exterior.modelBuild);assert.equal(build.mode,mode==='source'?'procedural':'compiled');
  const surfaces=await page.evaluate(()=>{
   const {THREE,exterior}=wingCheck,visible=[];
   exterior.model.traverseVisible(o=>{if(o.isMesh)visible.push(o);});
   const ray=new THREE.Raycaster(),bad=[];ray.far=.038;
   const length=Math.hypot(.075,3.825),nx=-3.825/length,nz=.075/length;
   let probes=0;
   for(const z of [16.58,16.64,16.7,16.76])for(const y of [8.95,9.05,9.15]){
    const x=33.65+(z-15.5)*.075/3.825;
    ray.set(new THREE.Vector3(x+nx*.02,y,z+nz*.02),new THREE.Vector3(-nx,0,-nz));
    const hits=ray.intersectObjects(visible,false);
    if(hits.length!==1||hits[0].object.material.color.getHex()!==0xb3a5a0)bad.push({x,y,z,hits:hits.map(h=>({name:h.object.name,distance:h.distance}))});
    probes++;
   }
   return {probes,bad};
  });
  if(before)assert(surfaces.bad.length>0,'Original scene reproduces the competing white fascia');
  else assert.deepEqual(surfaces.bad,[],'Actual visible/batched brick faces have no competing fascia');
  await page.evaluate(()=>window.wingCheck.exterior.scene.traverse(o=>{if(o.isSprite)o.visible=false;}));
  await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
  const views=[
   {name:'marked',position:[22,1.8,28],target:[31.5,7.5,20],fov:66},
   {name:'east',position:[26.7,1.8,29.5],target:[31.4,6.5,17.4]},
   {name:'east-close',position:[30.15,1.8,25.9],target:[31.7,9,16.2],fov:60},
   {name:'west',position:[-26.7,1.8,29.5],target:[-31.4,6.5,17.4]},
   {name:'west-close',position:[-30.15,1.8,25.9],target:[-31.7,9,16.2],fov:60}
  ];
  for(const light of ['day','dusk'])for(const view of views){
   await page.evaluate(({v,light})=>{wingCheck.lighting.setMode(light);wingCheck.pose(v.position,v.target,v.fov);},{v:view,light});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:fileURLToPath(new URL(`${before?'before':'after'}-${mode}-${light}-${view.name}.png`,out))});
  }
  for(const dx of [-.15,0,.15]){
   await page.evaluate(dx=>wingCheck.pose([22+dx,1.8,28],[31.5,7.5,20],66),dx);
   await page.screenshot({path:fileURLToPath(new URL(`${before?'before':'after'}-${mode}-movement-${dx}.png`,out))});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>wingCheck.pose([22,1.8,28],[31.5,7.5,20],66));
  await page.screenshot({path:fileURLToPath(new URL(`${before?'before':'after'}-${mode}-phone.png`,out))});
  await page.setViewportSize({width:1600,height:900});
  report.push({mode,build,surfaces});
 }
 if(!before){
  await page.route('**/explore.mjs',async route=>{
   const source=await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8');
   await route.fulfill({contentType:'text/javascript',body:source.replace('renderer.setAnimationLoop(()=>{',
    'window.walkCheck={exterior,renderer,walker};renderer.setAnimationLoop(()=>{')});
  });
  await page.goto(base+'/explore.html?models=compiled&view=front-corner-2&period=1916&lighting=dusk');
  await page.waitForFunction(()=>window.walkCheck?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>walkCheck.exterior.modelBuild);assert.equal(build.mode,'compiled');
  await page.evaluate(()=>walkCheck.walker.setView({position:[22,1.8,28],target:[31.5,7.5,20],fov:66}));
  await page.screenshot({path:fileURLToPath(new URL('after-explore-dusk.png',out))});
  report.push({mode:'explore',build});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL(`${before?'before':'after'}-validation.json`,out),JSON.stringify({report,errors},null,2)+'\n');
 console.log('PASS: front-wing source/compiled views without page or shader errors.');
}finally{await browser?.close();server.kill();}
