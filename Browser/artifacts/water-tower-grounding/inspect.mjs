import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const label=process.argv.includes('--before')?'before':'after';
const mode=process.argv.includes('--compiled')?'compiled':'source';
const explore=process.argv.includes('--explore'),scenario=explore?'explore':'escape';
const destination=new URL(`./${label}-${scenario}-${mode}/`,import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1134,height:650}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(explore){
  await page.route('**/explore.mjs',async r=>{
   const instrument=`window.audit={THREE,exterior,renderer,lighting,walker,
    pose(x,z,tx,tz,ty=.35){walker.setView({position:[x,1.8,z],target:[tx,ty,tz],fov:70});},
    render(){renderer.render(exterior.scene,exterior.camera);}};window.__manual=true;`;
   const source=(await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8')).replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(',instrument+'\n  loadEscapeFrontage(');
   await r.fulfill({contentType:'text/javascript',body:source});
  });
  await page.goto(base+'/explore.html?view=irby-corridor&period=1916&lighting=day&models='+mode,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.audit);
  await page.addStyleTag({content:'.explore-guide,#layoutControls{display:none!important}'});
 }else{
  const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8'),instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
  await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
  await page.goto(base+'/?seed=1829',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.groundsTest?.ready);
  await page.evaluate(async()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);const THREE=await import('/vendor/three.module.js');window.audit={THREE,exterior:groundsTest.exterior,renderer:groundsTest.renderer,
   pose(x,z,tx,tz,ty=.35){const dx=tx-x,dz=tz-z;groundsTest.pose(x,z,Math.atan2(-dx,-dz),Math.atan2(ty-1.65,Math.hypot(dx,dz)));},render(){groundsTest.render();}};});
  await page.addStyleTag({content:'#hud,#interact,#pause,.vignette{display:none!important}'});
 }
 const survey=await page.evaluate(()=>{
  const {THREE,exterior,renderer}=audit;exterior.scene.updateMatrixWorld(true);
  const objects=[];exterior.scene.traverseVisible(o=>{if(o.isMesh)objects.push(o);});
  const samples=[],ray=new THREE.Raycaster();
  for(const face of exterior.waterTower.children.filter(o=>o.userData.photoSide)){
   const inward=new THREE.Vector3(0,0,-1).transformDirection(face.matrixWorld);
   for(const x of [-4.1,-3.8,3.8,4.1])for(const y of [-.149,-.12,-.01,.05]){
    const origin=face.localToWorld(new THREE.Vector3(x,y,5.5));ray.set(origin,inward);ray.far=.4;
    const hit=ray.intersectObjects(objects,false).find(h=>Math.abs(h.distance-.325)<1e-4);
    samples.push({side:face.userData.photoSide,x,y,solid:!!hit,mesh:hit?.object.name,distance:hit?.distance});
   }
  }
  const plinth=exterior.waterTower.getObjectByName('Water tower brick plinth');
  const gl=renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
  return {model:exterior.modelBuild,renderer:gl.getParameter(info.UNMASKED_RENDERER_WEBGL),towerPosition:exterior.waterTower.position.toArray(),groundY:exterior.terrain.position.y,
   plinth:plinth?{min:new THREE.Box3().setFromObject(plinth).min.toArray(),max:new THREE.Box3().setFromObject(plinth).max.toArray()}:null,samples};
 });
 for(const [name,x,z,tx,tz,ty] of [['reported-corner',139.5,-46,143.5,-51,.45],['close-contact',141,-48,143.4,-50.5,.05],['surrounding-buildings',134,-43,146,-57,4]]){
  await page.evaluate(p=>{audit.pose(...p);audit.render();},[x,z,tx,tz,ty]);
  await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
 }
 await page.evaluate(explore=>{if(explore)audit.lighting.setMode('night');else groundsTest.night();audit.pose(139.5,-46,143.5,-51,.45);audit.render();},explore);
 await page.screenshot({path:fileURLToPath(new URL('corner-night.png',destination))});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{audit.pose(139.5,-46,143.5,-51,.45);audit.render();});
 await page.screenshot({path:fileURLToPath(new URL('corner-phone.png',destination))});
 await writeFile(new URL('validation.json',destination),JSON.stringify({label,scenario,mode,survey,errors},null,2));
 assert.deepEqual(errors,[]);
 if(label==='after'){
  assert(survey.samples.every(s=>s.solid),'Every submitted tower footing face reaches below lawn level');
  assert(survey.plinth.min[1]<survey.groundY);
  if(explore)assert.equal(survey.model.mode,mode==='source'?'procedural':'compiled');
 }else assert(survey.samples.some(s=>!s.solid),'Reproduce the missing foundation faces before repair');
 console.log(JSON.stringify({label,scenario,mode,model:survey.model,solidSamples:survey.samples.filter(s=>s.solid).length,totalSamples:survey.samples.length,plinth:survey.plinth,errors}));
}finally{await browser?.close();server.kill();}
