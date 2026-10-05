import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const stage=process.argv[2]??'after',mode=process.argv[3]??'source',out=new URL('./',import.meta.url);
await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const views={
 east:{position:[75,37,56],target:[48,11,17],fov:50},
 west:{position:[-75,38,57],target:[-48,11,17],fov:50},
 frontage:{position:[0,27,60],target:[0,11,13],fov:48},
 rear:{position:[5,42,-60],target:[0,11,3],fov:54}
};
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1400,height:950}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={THREE,exterior,renderer,show(v){moved=true;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);}};function frame(){')});
 });
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const build=await page.evaluate(()=>window.review.exterior.modelBuild);
 assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,view] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v),view);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',out))});
 }
 const survey=await page.evaluate(()=>{
  const {THREE,exterior:e}=window.review,parts=[],ray=new THREE.Raycaster();
  e.model.updateMatrixWorld(true);e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const authored=[];e.model.traverse(o=>{if(o.isMesh)authored.push(o);});
  const named=authored.filter(o=>/^(?:Entrance (?:east|west) mitred cornice|Central back (?:lower cornice|parapet|projecting coping)|(?:East|West) inside corner (?:continuous coping|flat roof coping)|West outer corner joined cornice|West (?:court|garden) descending roof render return)/.test(o.name))
   .map(o=>({name:o.name,color:o.material.color.getHex(),finish:o.material.userData.mineralFinish}));
  const probes=[
   {name:'east main cornice',origin:[48,14.18,21],direction:[0,0,-1]},
   {name:'east main roof support',origin:[48,14.42,21],direction:[0,0,-1]},
   {name:'west forward cornice',origin:[-35,8.82,45],direction:[0,0,-1]},
   {name:'east forward cornice',origin:[35,8.8,45],direction:[0,0,-1]},
   {name:'east pavilion side cornice',origin:[71,14.52,15.15],direction:[-1,0,0]},
   {name:'west lawn bay cornice',origin:[-26,8.83,35.5],direction:[-1,0,0]},
   {name:'east lawn bay cornice',origin:[26,8.83,35.5],direction:[1,0,0]},
   {name:'west wing inner roof band',origin:[-28,8.48,40],direction:[-1,0,0]},
   {name:'east wing inner roof band',origin:[28,8.48,40],direction:[1,0,0]},
   {name:'dragon pediment border',origin:[0,14.65,21],direction:[0,0,-1]}
  ].map(p=>{ray.set(new THREE.Vector3(...p.origin),new THREE.Vector3(...p.direction));ray.far=5;
   const h=ray.intersectObjects(parts,false)[0];return {name:p.name,hit:h?.object.name,color:h?.object.material.color.getHex(),point:h?.point.toArray(),finish:h?.object.material.userData.mineralFinish};});
  return {named,probes};
 });
 if(stage!=='before'){
  assert(survey.named.length>=20,'Survey named roof render across 1829');
  for(const part of survey.named){assert.equal(part.color,0xe1e3dc,part.name);assert.equal(part.finish,'render',part.name+' mineral finish');}
  for(const probe of survey.probes){assert(probe.point,probe.name+' visible contact');assert.equal(probe.color,probe.name==='dragon pediment border'?0xd6d0ba:0xe1e3dc,probe.name);}
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL(stage+'-'+mode+'-validation.json',out),JSON.stringify({build,errors,views,survey},null,2)+'\n');
 console.log('PASS: '+stage+' '+mode+', '+survey.named.length+' named trim surfaces, '+survey.probes.length+' visible material probes; hardware views of 1829 and its immediate surroundings.');
}finally{await browser?.close();server.kill();}
