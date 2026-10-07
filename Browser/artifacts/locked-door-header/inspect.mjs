import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const destination=new URL('./',import.meta.url),stage=process.argv[2]??'before';
await mkdir(destination,{recursive:true});
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8');
const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1039,height:690}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{
  const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
  await r.fulfill({contentType:'text/javascript',body:source+instrument});
 });
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);
 await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});
 await page.addStyleTag({content:'#hud,body>header,.game-developer-options{display:none!important}'});
 const result=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=groundsTest,meshes=[];
  t.exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  const gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
  const doors=t.grounds.workshops.lockedDoors.map(d=>{
   const p=t.grounds.workshops.group.children.find(o=>o.name===d.title&&Math.hypot(o.position.x-d.point[0],o.position.z-d.point[1])<.001),probes=[];
   for(const side of [1])for(const x of [-1.3,-.61,.03,.59,1.28])for(const y of [3.82,3.9,3.98,4.15,4.7]){
    const ray=new THREE.Raycaster(p.localToWorld(new THREE.Vector3(x,y,side*.6)),new THREE.Vector3(0,0,-side).transformDirection(p.matrixWorld),0,.9);
    const hits=ray.intersectObjects(meshes,false).map(h=>({name:h.object.name,distance:h.distance,point:h.point.toArray(),material:[h.object.material].flat().map(m=>m.name||m.color?.getHexString())}));
    probes.push({side,x,y,hits});
   }
   return {id:d.id,title:d.title,point:d.point,toward:d.toward,probes};
  });
  return {renderer:gl.getParameter(info.UNMASKED_RENDERER_WEBGL),doors};
 });
 await writeFile(new URL(stage+'.json',destination),JSON.stringify({result,errors},null,2));
 if(stage==='after')for(const d of result.doors)for(const p of d.probes){
  assert(p.hits.length&&Math.abs(p.hits[0].distance-.48)<1e-4,'Continuous header at '+d.id);
  assert.equal(p.hits.filter(h=>Math.abs(h.distance-p.hits[0].distance)<.002).length,1,'No overlapping header face at '+JSON.stringify({id:d.id,...p}));
 }
 for(const d of result.doors){
  const dx=d.toward[0]-d.point[0],dz=d.toward[1]-d.point[1],l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;
  for(const [name,distance,offset,pitch] of [['front',2.4,0,.32],['left',2.0,-.7,.52],['right',2.0,.7,.52]]){
   await page.evaluate(p=>groundsTest.pose(...p),[d.point[0]+ux*distance+uz*offset,d.point[1]+uz*distance-ux*offset,Math.atan2(ux,uz),pitch]);
   await page.screenshot({path:fileURLToPath(new URL(stage+'-'+d.id.replaceAll(':','-')+'-'+name+'.png',destination))});
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const hale=result.doors.find(d=>d.id==='corridor-lock:hale-1:1');
 await page.evaluate(d=>groundsTest.pose(d.point[0]+2.4,d.point[1],Math.PI/2,.35),hale);
 await page.screenshot({path:fileURLToPath(new URL(stage+'-hale-phone.png',destination))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(stage+'.json',destination),JSON.stringify({result,errors},null,2));
 console.log(JSON.stringify({renderer:result.renderer,errors,doors:result.doors.map(d=>({id:d.id,probes:d.probes.length,conflicts:d.probes.filter(p=>p.hits.some((h,i)=>i&&Math.abs(h.distance-p.hits[i-1].distance)<.002))}))},null,2));
}finally{await browser?.close();server.kill();}
