import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {PERIODS,BUILDING_SECTIONS,existsInYear,roadSection} from './dist/estate-periods.mjs';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const artifacts=new URL('./artifacts/',import.meta.url);await mkdir(artifacts,{recursive:true});
let browser;const errors=[],metrics={};
// Runs in the page against actual visible meshes, both compiled aerial batches
// and the unbatched walking scene. Texture identity/projection must match grass.
async function groundState(){
 const THREE=await import('./vendor/three.module.js');
 const {exterior}=window.__walk??window.__timeline,ray=new THREE.Raycaster(),meshes=[];
 exterior.model.updateMatrixWorld(true);
 exterior.model.traverseVisible(object=>{if(object.isMesh)meshes.push(object);});
 return [[-64,-10,1849],[60,-10,1849],[17,29,1849],[35,46,1849],[60,-30.5,1870],[100,15,1870],[76,20,1870],[0,32,1829],[-23,-25,1829],
  [90,32,1870,true],[68,36,1849,true],[-64,37,1849,true],[80,46,1870,true,true],[55,-34,1870,true,true],[-55,49,1849,true,true],[-55,7.5,1849,true,true]].map(([x,z,built,lawn=false,terrainOnly=false])=>{
  ray.set(new THREE.Vector3(x,.49,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObjects(meshes,false)[0],material=hit?.object.material,grass=exterior.terrain.material;
  return {x,z,built,lawn,terrainOnly,onTerrain:hit?.object===exterior.terrain,present:Boolean(material),grass:Boolean(material?.userData.estateGrass),matchesGrass:material?.map===grass.map&&material.color.equals(grass.color)&&material.customProgramCacheKey()===grass.customProgramCacheKey()};
 });
}
function checkGround(samples,year){
 for(const sample of samples){
  assert(sample.present,'Ground remains beneath every section');
  assert.equal(sample.grass,sample.lawn||year<sample.built,`Ground at ${sample.x}, ${sample.z} in ${year}`);
  if(sample.lawn)assert.equal(sample.onTerrain,sample.terrainOnly||year<sample.built,'Raised lawn outlines disappear with their section');
  if(year<sample.built)assert(sample.matchesGrass,'Unbuilt sections reveal the same terrain texture and projection');
 }
}
async function periodRoadState(){
 const THREE=await import('./vendor/three.module.js');
 const {exterior}=window.__walk??window.__timeline,ray=new THREE.Raycaster(),meshes=[];
 exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 return [[320.5,-73.2,'Annexe'],[270,-8,'Annexe'],[257,111.3,'The Main'],[280,112.3,'The Main'],[340,117.4,'The Main'],[380,121.5,'The Main'],[385,121.8,'The Main']].map(([x,z,section])=>{
  ray.set(new THREE.Vector3(x,.49,z),new THREE.Vector3(0,-1,0));
  const material=ray.intersectObjects(meshes,false)[0]?.object.material;
  return {x,z,section,asphalt:material?.color.getHex()===0x555b5c,grass:Boolean(material?.userData.estateGrass)};
 });
}
function checkPeriodRoads(samples,year){
 for(const sample of samples){
  if(existsInYear(sample.section,year))assert(sample.asphalt,`Road at ${sample.x},${sample.z} is continuous in ${year}`);
  else if(sample.section==='Annexe')assert(sample.grass,`Later annexe access is grass in ${year}`);
 }
}
async function frontageState(){
 const THREE=await import('./vendor/three.module.js');
 const {exterior}=window.__walk??window.__timeline,ray=new THREE.Raycaster(),meshes=[];
 exterior.model.updateMatrixWorld(true);
 exterior.model.traverseVisible(object=>{if(object.isMesh)meshes.push(object);});
 return [-1,1].flatMap(side=>[1.45,5.6,10,13.3].flatMap(y=>[24.25,26.15,28.1].map(x=>{
  ray.set(new THREE.Vector3(side*x,y,23),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObjects(meshes,false)[0];
  // Atlas planes and full glazing sit at slightly different depths as window
  // detail settles. Both must remain in front of the z=19.7 masonry face.
  return Boolean(hit&&hit.point.z>19.8);
 })));
}
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 // Apply the scene startup allowance to all navigations, including reload and
 // the walking page, before the separate rendered-frame/readiness checks.
 page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.stack));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__timeline={exterior,layouts,buildingSelection,renderer,controls};\nfunction frame(){')});});
 async function load(query){await page.goto(base+'/aerial.html'+query);await page.waitForFunction(()=>window.__timeline?.renderer.info.render.frame>3,null,{timeout:120000});}
 for(const mode of ['source','compiled']){
  await load('?models='+mode+'&view=plan');
  assert.equal(await page.locator('#periodYear').textContent(),'1916','The default year is 1916 without a period URL');
  assert.equal(await page.evaluate(()=>window.__timeline.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  const camera=await page.evaluate(()=>window.__timeline.exterior.camera.position.toArray());metrics[mode]=[];
  for(const [index,period] of PERIODS.entries()){
   await page.locator('#periodSlider').fill(String(index));
   await page.waitForFunction(year=>window.__timeline.exterior.timeline.period.year===year,period.year);
   const state=await page.evaluate(()=>{
    const {exterior,layouts,buildingSelection}=window.__timeline;
    buildingSelection.refresh();
    const visible=object=>{for(;object;object=object.parent)if(!object.visible)return false;return true;};
    return {year:exterior.timeline.period.year,camera:exterior.camera.position.toArray(),buildings:buildingSelection.entries.map(e=>[e.id,e.mesh.visible]),roads:layouts.roads.children.map(o=>[o.name,visible(o)]),trees:exterior.trees.visible,passage:visible(exterior.model.getObjectByName('1829 Redesmere passage head')),openingWall:visible(exterior.model.getObjectByName('1829 east end wall'))};
   });
   assert.equal(state.year,period.year);assert.deepEqual(state.camera,camera);
   state.ground=await page.evaluate(groundState);checkGround(state.ground,period.year);
   state.periodRoads=await page.evaluate(periodRoadState);checkPeriodRoads(state.periodRoads,period.year);
   state.frontage=await page.evaluate(frontageState);
   assert(state.frontage.every(Boolean),'Both projections are complete in '+period.year+' '+mode);
   assert.equal(state.passage,period.year>=1870,'The complete passage head follows 1870 in '+mode);
   assert.equal(state.openingWall,period.year===1829,'The closing wall appears only at opening in '+mode);
   for(const [id,visible] of state.buildings)assert.equal(visible,existsInYear(BUILDING_SECTIONS[id],period.year),id+' in '+period.year);
   for(const [name,visible] of state.roads)assert.equal(visible,existsInYear(roadSection(name),period.year),name+' in '+period.year);
   assert.equal(await page.locator('#periodYear').textContent(),String(period.year));
   assert.equal(await page.locator('#periodTitle').textContent(),period.title);
   assert.equal(await page.locator('#periodDescription').textContent(),period.description);
   assert.equal(new URL(page.url()).searchParams.get('period'),String(period.year));
   metrics[mode].push(state);
   if(mode==='compiled'&&[1829,1849,1870,1938,2021].includes(period.year))await page.screenshot({path:fileURLToPath(new URL('timeline-'+period.year+'.png',artifacts))});
  }
 }
 assert.deepEqual(metrics.source,metrics.compiled,'Source and compiled date visibility agree at every stop');
 await page.locator('#periodSlider').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#periodSlider').inputValue(),'0');
 assert(await page.locator('#previousPeriod').isDisabled());
 await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#periodYear').textContent(),'1849');
 await page.keyboard.press('End');assert(await page.locator('#nextPeriod').isDisabled());
 await page.keyboard.press('t');assert.equal(await page.evaluate(()=>window.__timeline.exterior.trees.visible),false);
 await page.locator('#previousPeriod').click();assert.equal(await page.evaluate(()=>window.__timeline.exterior.trees.visible),false);
 await page.keyboard.press('t');
 await page.locator('#periodSlider').fill(String(PERIODS.findIndex(period=>period.year===1896)));
 await page.reload();await page.waitForFunction(()=>window.__timeline?.renderer.info.render.frame>3,null,{timeout:120000});assert.equal(await page.locator('#periodYear').textContent(),'1896');
 assert.equal(await page.locator('#locationsPanel a[href*="view=annexe"]').first().evaluate(a=>a.closest('li').hidden),true);
 assert.equal(new URL(await page.locator('#locationsPanel a[href*="view=acton"]').getAttribute('href'),base).searchParams.get('period'),'1896');
 await page.setViewportSize({width:390,height:844});
 await page.locator('#resetAerial').click();
 const panel=await page.locator('#layoutControls').boundingBox();assert(panel.x>=0&&panel.x+panel.width<=390&&panel.y>=0&&panel.y+panel.height<=844);
 assert(await page.locator('#periodSlider').isVisible());
 await page.screenshot({path:fileURLToPath(new URL('timeline-mobile.png',artifacts))});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function refreshObstacles(){','let refreshCount=0;function refreshObstacles(){refreshCount++;').replace('const clock=new THREE.Clock();','window.__walk={exterior,layouts,timeline,walker,get refreshCount(){return refreshCount;}};const clock=new THREE.Clock();')});});
 await page.goto(base+'/explore.html?period=1896');await page.waitForFunction(()=>window.__walk,null,{timeout:120000});
 assert.equal(await page.locator('#periodYear').textContent(),'1896');
 const beforeRefresh=await page.evaluate(()=>window.__walk.refreshCount),beforeCamera=await page.evaluate(()=>window.__walk.exterior.camera.position.toArray());
 for(const [index,period] of PERIODS.entries()){
  await page.locator('#periodSlider').fill(String(index));
  assert.equal(await page.evaluate(()=>window.__walk.timeline.period.year),period.year);
  checkGround(await page.evaluate(groundState),period.year);
  checkPeriodRoads(await page.evaluate(periodRoadState),period.year);
  const frontage=await page.evaluate(frontageState);
  assert(frontage.every(Boolean),'Both projection facades remain in the walking view');
  assert.deepEqual(await page.evaluate(()=>window.__walk.exterior.camera.position.toArray()),beforeCamera);
 }
 assert.equal(await page.evaluate(()=>window.__walk.refreshCount),beforeRefresh+PERIODS.length);
 await page.screenshot({path:fileURLToPath(new URL('timeline-walking-mobile.png',artifacts))});
 await page.setViewportSize({width:1000,height:800});await load('?models=compiled&period=1829&view=willows-plan');
 // The binary loader can choose an equivalent Euler representation; compare
 // the orientation quaternion so the quarter-turn is checked in either form.
 const rotation=await page.evaluate(()=>window.__timeline.exterior.willows.quaternion.toArray()),angle=Math.atan2(.835,.55)+Math.PI/2;
 assert(Math.abs(Math.abs(rotation[1]*Math.sin(angle/2)+rotation[3]*Math.cos(angle/2))-1)<1e-12,'Compiled Willows preserves the quarter-turn');
 await page.evaluate(()=>{const {exterior,controls}=window.__timeline,p=exterior.willows.position;exterior.camera.position.set(p.x,60,p.z+.01);exterior.camera.lookAt(p);controls.sync(p.toArray());});
 await page.screenshot({path:fileURLToPath(new URL('timeline-willows-rotated.png',artifacts))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL('timeline-browser.json',artifacts),JSON.stringify(metrics,null,2));
 console.log('PASS: every timeline stop in source/compiled pages, descriptions, URL reload/navigation, keyboard/endpoints, tree focus, selection, mobile reset and live walking collision refresh.');
}finally{await browser?.close();server.kill();}
