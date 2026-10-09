import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const before=process.argv.includes('--before'),compiled=process.argv.includes('--compiled');
const label=before?'before':compiled?'compiled':'source';
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1200,height:746},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(before)await page.route('**/entrance-walks.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-entrance-walks.mjs',import.meta.url),'utf8')}));
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('function frame(){',`window.stairCheck={THREE,exterior,renderer,pose(p,t){moved=true;exterior.camera.near=.03;exterior.camera.fov=70;exterior.camera.position.set(...p);exterior.camera.lookAt(...t);exterior.camera.updateProjectionMatrix();controls.sync(t);}};\nfunction frame(){`)});});
 await page.goto(base+'/aerial.html?models='+(compiled?'compiled':'source')+'&view=front-steps&buildingDetail=full');
 await page.waitForFunction(()=>window.stairCheck?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
 const report=await page.evaluate(()=>{
  const {THREE,exterior}=window.stairCheck,ray=new THREE.Raycaster(),meshes=[],samples=[];
  exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  for(const side of [-1,1])for(const x of [30.12,30.3,30.5,30.7])for(const y of [-.12,-.04,.04,.1,.16]){
   ray.set(new THREE.Vector3(side*x,y,21.68),new THREE.Vector3(0,0,1));ray.far=.04;
   samples.push({x:side*x,y,hits:ray.intersectObjects(meshes,false).map(h=>({name:h.object.name,z:h.point.z}))});
  }
  return {build:exterior.modelBuild,samples};
 });
 const views=[
  {name:'east-basement-inner',p:[5.24,1.8,25.1],t:[5.24,-.5,21.2]},
  {name:'west-basement-inner',p:[-5.24,1.8,25.1],t:[-5.24,-.5,21.2]},
  {name:'west-basement-outer',p:[-31.4,1.8,20.7],t:[-28.3,-.25,21.4]},
  {name:'east-basement-outer',p:[31.4,1.8,20.7],t:[28.3,-.25,21.4]},
  {name:'east-reference',p:[32,1.8,19.85],t:[29.4,-.05,21.5]}
 ];
 for(const v of views){await page.evaluate(v=>window.stairCheck.pose(v.p,v.t),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(label+'-'+v.name+'.png',import.meta.url))});}
 // Sweep the camera across the originally unstable wall contact.
 for(let i=0;i<12;i++){await page.evaluate(i=>window.stairCheck.pose([31.4-i*.07,1.8,19.85],[30.3,.08,21.7]),i);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.stairCheck.pose([31.4,1.8,19.85],[30.3,.08,21.7]));await page.screenshot({path:fileURLToPath(new URL(label+'-portrait.png',import.meta.url))});
 await writeFile(new URL(label+'.json',import.meta.url),JSON.stringify({report,errors},null,2)+'\n');
 assert.deepEqual(errors,[]);
 assert.equal(report.build.mode,compiled?'compiled':'procedural');
 for(const sample of report.samples)assert.equal(sample.hits.length,before?2:1,JSON.stringify(sample));
 console.log('PASS: '+label+' GPU stair views, camera sweep and portrait; '+report.samples.length+' retaining-face probes.');
}finally{await browser?.close();server.kill();}
