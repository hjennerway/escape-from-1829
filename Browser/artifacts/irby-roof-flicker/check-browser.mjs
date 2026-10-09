import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
import {ANNEXE_VIEWS} from '../../dist/annexe.mjs';
import {TOWER_BUILDING_VIEWS} from '../../dist/tower-buildings.mjs';
import {CHURTON_VIEWS} from '../../dist/churton-ward.mjs';
import {GRAFTON_EDGE_VIEWS} from '../../dist/grafton-edge.mjs';
import {FARNDON_VIEWS} from '../../dist/farndon-ward.mjs';
import {UPTON_VIEWS} from '../../dist/upton-frith-oscroft.mjs';
import {WITBY_VIEWS} from '../../dist/witby-ward.mjs';
const stage=process.argv[2]??'after',mode=process.argv[3]??'source',before=stage==='before';
const {server,base}=await startTestServer();let browser;const errors=[],report=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1600,height:800}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/__flicker-probes.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../test-support/roof-wall-flicker-probes.mjs',import.meta.url),'utf8')).replace("import assert from 'node:assert/strict';",'const assert=Object.assign((condition,message)=>{if(!condition)throw new Error(message);},{equal(a,b,message){if(a!==b)throw new Error(message);}});')}));
 if(before)await page.route('**/roof-wall-joins.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-roof-wall-joins.mjs.txt',import.meta.url),'utf8')}));
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={THREE,exterior,renderer,lighting,show(v){moved=true;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov??66;exterior.camera.near=.03;exterior.camera.updateProjectionMatrix();controls.sync(v.target);}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full&period=1916&lighting=dusk');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const build=await page.evaluate(()=>review.exterior.modelBuild);console.log(JSON.stringify(build));assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
 const [x,y,z]=await page.evaluate(()=>review.exterior.irbyAshley.position.toArray());
 const views={
  'irby-marked':{position:[x+15,1.8,z+30],target:[x+14,8.1,z+19.4],fov:66},
  'irby-left':{position:[x+4.6,2,z+24.5],target:[x+4.6,9,z+19.58],fov:62},
  'irby-right':{position:[x+21.5,2,z+25.5],target:[x+21.5,9,z+19.58],fov:62},
  'irby-rear':{position:[x+4,1.8,z-43],target:[x+4,8.5,z-8],fov:66},
  'west-court':{position:[-46,1.8,-13],target:[-53,12,7],fov:64},
  'east-court':{position:[15,1.8,-17],target:[31,12,0],fov:65},
  'reception':{position:[-15,1.8,35],target:[0,13,16],fov:65},
  'upton':UPTON_VIEWS['upton-outward-photo'],
  'farndon':FARNDON_VIEWS['farndon-2']??FARNDON_VIEWS[Object.keys(FARNDON_VIEWS)[1]],
  'grafton':GRAFTON_EDGE_VIEWS['grafton-edge-ground'],
  'witby':WITBY_VIEWS['witby-ground'],
  'churton':CHURTON_VIEWS['churton-1'],
  'annexe':ANNEXE_VIEWS['annexe-ground'],
  'admin':{position:[204,1.8,66],target:[211,10,42],fov:65},
  'tower':TOWER_BUILDING_VIEWS['tower-buildings-3'],
  'workshops':TOWER_BUILDING_VIEWS['tower-twin-gables']
 };
 await page.evaluate(()=>{const e=review.exterior;e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const light of ['dusk','day']){
  await page.evaluate(light=>review.lighting.setMode(light),light);
  for(const [name,v] of Object.entries(views)){
   if(light==='dusk'&&!name.startsWith('irby'))continue;
   await page.evaluate(name=>review.exterior.timeline.setPeriod(name.startsWith('irby')?1916:1938),name);
   await page.evaluate(name=>{const e=review.exterior,show=!['irby-rear','upton','farndon','witby'].includes(name);if(e.trees.visible!==show){e.trees.visible=show;e.invalidateShadows();}},name);
   await page.evaluate(v=>review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+light+'-'+name+'.png',import.meta.url))});
  }
 }
 for(const dx of [-.1,0,.1]){
  const view=views['irby-marked'];await page.evaluate(v=>review.show(v),{...view,position:view.position.map((p,i)=>i===0?p+dx:p)});
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-move-'+dx+'.png',import.meta.url))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>review.show(v),views['irby-left']);
 await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-phone.png',import.meta.url))});
 report.push({mode,build,views});
 if(!before){
  const probes=JSON.parse(await readFile(new URL('../../test-support/roof-wall-flicker-rays.json',import.meta.url),'utf8'));
  await page.evaluate(()=>review.exterior.timeline.setPeriod(1938));
  const samples=await page.evaluate(async probes=>{
   const {checkRoofWallFlicker}=await import('/__flicker-probes.mjs');
   return checkRoofWallFlicker(review.THREE,review.exterior.model,probes,{visible:true});
  },probes);report.push({mode:'visible-surfaces',samples});
 }
 if(!before){
  await page.route('**/explore.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8')).replace('renderer.setAnimationLoop(()=>{','window.walkCheck={exterior,renderer,walker};renderer.setAnimationLoop(()=>{')}));
  await page.setViewportSize({width:1600,height:800});await page.goto(base+'/explore.html?models='+mode+'&view=irby-ashley&period=1916&lighting=dusk');
  await page.waitForFunction(()=>window.walkCheck?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>walkCheck.exterior.modelBuild);assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
  await page.evaluate(v=>walkCheck.walker.setView(v),views['irby-marked']);
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-explore-dusk.png',import.meta.url))});report.push({mode:'explore',build});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL(stage+'-'+mode+'-validation.json',import.meta.url),JSON.stringify({report,errors},null,2));console.log('PASS: '+stage+' '+mode+' ground views and moving camera; no browser errors.');
}finally{await browser?.close();server.kill();}
