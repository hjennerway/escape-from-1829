import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const phase=process.argv.includes('--before')?'before':'after';
const model=process.argv.includes('--compiled')?'compiled':'source';
const phoneOnly=process.argv.includes('--phone-only');
const destination=new URL('./',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;
const results={model,errors:[],scenes:{}};
try{
 browser=await launchHardwareBrowser();
 for(const scene of ['explore','escape']){
  if(model==='compiled'&&scene==='escape')continue;
  const page=await browser.newPage({viewport:{width:1618,height:870}});page.setDefaultTimeout(180000);page.setDefaultNavigationTimeout(180000);
  page.on('pageerror',error=>results.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&/THREE|shader|WebGL/i.test(message.text()))results.errors.push(message.text());});
  await page.route('https://**/*',route=>route.abort());
  // Identify corridor walls separately from the workshop rooms that share
  // their window builder. This marker only exists in the capture harness.
  await page.route('**/escape-corridors.mjs',async route=>{
   const source=await readFile(new URL('../../dist/escape-corridors.mjs',import.meta.url),'utf8');
   await route.fulfill({contentType:'text/javascript',body:source.replace(' const loops=unionPolygons(', ' const roomWalls=group.children.length;\n const loops=unionPolygons(').replace(' function surface(boundaries', " for(const wall of group.children.slice(roomWalls))if(wall.name==='Workshop exterior with semicircular windows')wall.userData.spacingCorridor=true;\n function surface(boundaries")});
  });
  const harness=await readFile(new URL(scene==='explore'?'../../test-explore-workshops-browser.mjs':'../../test-escape-grounds-browser.mjs',import.meta.url),'utf8');
  const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
  await page.route(scene==='explore'?'**/explore.mjs':'**/game.mjs',async route=>{
   let source=await readFile(new URL(scene==='explore'?'../../dist/explore.mjs':'../../dist/game.mjs',import.meta.url),'utf8');
   if(scene==='explore')source=source.replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(',instrument+'\n  loadEscapeFrontage(');
   else source=source.replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt')+instrument;
   await route.fulfill({contentType:'text/javascript',body:source});
  });
  await page.goto(base+(scene==='explore'?'/explore.html?models='+model:'/?seed=1829'));
  await page.waitForFunction(scene==='explore'?()=>window.exploreTest:()=>window.groundsTest?.ready);
  if(scene==='escape')await page.evaluate(()=>groundsTest.begin());
  const receipt=await page.evaluate(scene=>{
   const t=scene==='explore'?exploreTest:groundsTest,w=scene==='explore'?t.workshops.workshops:t.grounds.workshops,gl=t.renderer.getContext();
   const walls=[];w.group.traverse(wall=>{if(wall.name==='Workshop exterior with semicircular windows')walls.push({position:wall.position.toArray(),rotation:wall.rotation.y,corridor:!!wall.userData.spacingCorridor,openings:wall.userData.openings.map(o=>({...o})).sort((a,b)=>a.side-b.side||a.x-b.x)});});
   return {renderer:gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL),mode:t.exterior.modelBuild?.mode??'procedural',cx:(w.group.userData.gallery.minX+w.group.userData.gallery.maxX)/2,walls};
  },scene);
  if(scene==='explore')assert.equal(receipt.mode,model==='compiled'?'compiled':'procedural');
  if(phase==='after'&&!phoneOnly){
   const baseline=JSON.parse(await readFile(new URL('before-source.json',destination),'utf8')).scenes[scene];
   assert.equal(receipt.walls.length,baseline.walls.length,'Same corridor and workshop walls');
   receipt.retained=0;receipt.removed=0;
   receipt.walls.forEach((wall,index)=>{
    const old=baseline.walls[index];assert.deepEqual(wall.position,old.position);assert(Math.abs(wall.rotation-old.rotation)<1e-10);
    const slots=old.openings.filter(o=>o.side===1).map(o=>o.x).sort((a,b)=>a-b);
    // Concealed bays at a building contact can make the first exposed bay
    // either parity of the original grid. Both remain alternate subsets.
    const matches=old.corridor?[0,1].some(parity=>isDeepStrictEqual(wall.openings,old.openings.filter(o=>slots.findIndex(x=>Math.abs(x-o.x)<1e-6)%2===parity))):isDeepStrictEqual(wall.openings,old.openings);
    assert(matches,'Alternate corridor windows retain exact dimensions and positions; room windows stay in place at '+wall.position);
    receipt.retained+=wall.openings.length;receipt.removed+=old.openings.length-wall.openings.length;
   });
   receipt.infill=await page.evaluate(async({scene,baseline})=>{
    const THREE=await import('/vendor/three.module.js'),t=scene==='explore'?exploreTest:groundsTest,w=scene==='explore'?t.workshops.workshops:t.grounds.workshops,walls=[],meshes=[],failures=[];let rays=0;
    w.group.traverse(wall=>{if(wall.name==='Workshop exterior with semicircular windows')walls.push(wall);});
    t.exterior.model.updateMatrixWorld(true);t.exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
    walls.forEach((wall,index)=>{
     const old=baseline.walls[index];if(!old.corridor)return;
     const removed=old.openings.filter(o=>!wall.userData.openings.some(n=>n.side===o.side&&Math.abs(n.x-o.x)<1e-6));
     for(const opening of removed)for(const y of [opening.y+.45,opening.y+opening.spring+opening.radius*.6]){
      const side=opening.side,p=wall.localToWorld(new THREE.Vector3(opening.x+.23,y,side===1?.9:-.65)),direction=new THREE.Vector3(0,0,-side).transformDirection(wall.matrixWorld);
      const hit=new THREE.Raycaster(p,direction,0,1.6).intersectObjects(meshes,false)[0],expected=wall.getObjectByName(side===1?'Workshop arched painted lining':'Workshop arched exterior masonry').material;
      rays++;if(hit?.object.material!==expected)failures.push({wall:wall.position.toArray(),opening,y,hit:hit?.object.name});
     }
    });return {rays,failures};
   },{scene,baseline});
   assert(receipt.infill.rays>100);assert.deepEqual(receipt.infill.failures,[],'Former lower panes and semicircular heads are sealed in the actual batched scene');
  }
  results.scenes[scene]=receipt;
  for(const [name,position,target] of phoneOnly?[]:[
   ['gallery',[receipt.cx,1.8,23],[receipt.cx,1.8,-80]],
   ['gallery-reverse',[receipt.cx,1.8,-104],[receipt.cx,1.8,-70]],
   ['irby',[203,1.8,-66.6],[155,1.8,-66.6]],
   ['diagonal',[129,1.8,-144.4],[110,1.8,-163.4]]
  ]){
   await page.evaluate(({scene,position,target})=>{
    const t=scene==='explore'?exploreTest:groundsTest;(scene==='explore'?t.lighting:t.exterior.lighting).setMode('day');
    if(scene==='explore')t.walker.setView({position,target});
    else t.pose(position[0],position[2],Math.atan2(position[0]-target[0],position[2]-target[2]),0);
    t.render();
   },{scene,position,target});
   await page.screenshot({path:fileURLToPath(new URL(`${phase}-${model}-${scene}-${name}.png`,destination))});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
  await page.evaluate(scene=>{const t=scene==='explore'?exploreTest:groundsTest;if(scene==='explore')t.pose(t.workshops.workshops.plan.corridors[0].start[0],-80);else t.pose(corridorX,-80);t.render();},scene);
  await page.screenshot({path:fileURLToPath(new URL(`${phase}-${model}-${scene}-phone.png`,destination))});
  await page.close();
 }
 assert.deepEqual(results.errors,[]);
 await writeFile(new URL(`${phase}-${model}${phoneOnly?'-phone':''}.json`,destination),JSON.stringify(results,null,2));
 console.log(JSON.stringify({phase,model,errors:results.errors,scenes:Object.fromEntries(Object.entries(results.scenes).map(([scene,r])=>[scene,{renderer:r.renderer,mode:r.mode,walls:r.walls.length,retained:r.retained,removed:r.removed}]))},null,2));
}finally{await browser?.close();server.kill();}
