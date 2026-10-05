import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/central-dormitory-wall-beds/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();
let browser;
try{
 browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'}),errors=[],renders=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.centralTest={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get renderer(){return renderer;},get camera(){return camera;},get arrival(){return arrivalCutscene;},player,keys,start,update,showFloor,
 pose(id,reverse=false){const f=floors[1],r=f.rooms.find(r=>r.id===id),row=r.bedRows[0],end=Array.isArray(row.endClearance)?row.endClearance[reverse?0:1]:row.endClearance;const z=reverse?row.wall[0][1]+end/2+1.2:row.wall[1][1]-end/2-1.2;this.at(r.label[0],z,reverse?Math.PI:0);},
 at(x,z,angle=0){Object.assign(player,{x,z,floor:1,y:floors[1].elevation,stair:null,outside:false});yaw=angle;pitch=-.10;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;},play(){state='play';elapsed=0;keys.clear();},pause(){state='paused';}};` }));
 await page.goto(base);await page.waitForFunction(()=>window.centralTest?.ready);
 await page.evaluate(()=>{const t=window.centralTest;t.start();t.arrival.update(3);t.pause();});
 const counts=await page.evaluate(()=>window.centralTest.floors[1].rooms.filter(r=>r.bedRows).map(r=>({id:r.id,beds:window.centralTest.floors[1].furniture.filter(i=>i.roomId===r.id&&i.kind==='bed').length})));
 assert.deepEqual(counts,[{id:'R6',beds:14},{id:'R8',beds:14},{id:'R10',beds:14}]);
 const geometry=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=window.centralTest,f=t.floors[1],floorGroup=t.scene.children.find(g=>g.position.y===f.elevation&&g.getObjectByName('Asylum furniture')),group=floorGroup.getObjectByName('Asylum furniture'),ids=new Set();
  const walls=['Asylum Brick','Asylum Plaster'].map(name=>floorGroup.getObjectByName(name));
  t.scene.updateMatrixWorld(true);let headboardContacts=0;
  if(f.furniture.some(i=>['R6','R8','R10'].includes(i.roomId)&&i.kind==='chair'))throw Error('Dormitory chair remains');
  for(const mesh of group.children)for(let i=0;i<mesh.count;i++){
   const item=f.furniture.find(p=>p.id===mesh.userData.furnitureIds[i]);if(item.kind!=='bed'||!['R6','R8','R10'].includes(item.roomId))continue;
   const matrix=new THREE.Matrix4(),point=new THREE.Vector3();mesh.getMatrixAt(i,matrix);point.setFromMatrixPosition(matrix);
   if(Math.hypot(point.x-item.x,point.z-item.z)>1e-4)throw Error('Bed mesh does not match its collision record');ids.add(item.id);
   mesh.geometry.computeBoundingBox();const transform=new THREE.Matrix4().multiplyMatrices(mesh.matrixWorld,matrix);
   const direction=new THREE.Vector3(0,0,-1).transformDirection(transform);
   for(const u of [-.4,0,.4]){
    const back=new THREE.Vector3(u*item.width,.45,mesh.geometry.boundingBox.min.z+.04).applyMatrix4(transform);
    const ray=new THREE.Raycaster(back,direction,0,.10),hit=ray.intersectObjects(walls,false)[0];
    if(!hit||Math.abs(hit.distance-.04)>1e-4)throw Error('Rendered headboard does not meet the wall');headboardContacts++;
   }
  }
  return {renderedBeds:ids.size,headboardContacts,chairs:0};
 });assert.equal(geometry.renderedBeds,42);assert.equal(geometry.headboardContacts,126);
 for(const id of ['R6','R8','R10'])for(const reverse of [false,true]){
  await page.evaluate(args=>window.centralTest.pose(...args),[id,reverse]);
  assert(await page.evaluate(async()=>{const {flatWalkable}=await import('/asylum-layout.mjs'),t=window.centralTest;return flatWalkable(t.floors[1],t.player.x,t.player.z,.34);}),`${id}: review camera stands in clear walking space`);
  await page.waitForTimeout(250);
  const name=id+(reverse?'-south':'-north');await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
  renders.push(await page.evaluate(name=>({name,calls:window.centralTest.renderer.info.render.calls,triangles:window.centralTest.renderer.info.render.triangles}),name));
 }
 const walking=await page.evaluate(()=>{
  const t=window.centralTest;t.at(-1.8,-32.5);t.play();t.keys.add('KeyS');for(let i=0;i<30;i++)t.update(.02);t.keys.clear();t.pause();return {x:t.player.x,z:t.player.z,floor:t.player.floor};
 });assert(walking.z>-31&&walking.floor===1,'Actual keyboard movement crosses the removed divider');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.centralTest.pose('R10'));await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL('R10-mobile.png',destination))});
 // Explore consumes the same merged plan and fixed furniture records.
 const fixed=await page.evaluate(()=>window.centralTest.floors[1].furniture.filter(i=>!i.variable&&['R6','R8','R10'].includes(i.roomId)));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.centralExplore={floors,interior,walker,renderer,introFlight,lighting};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1200,height:800});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.centralExplore?.renderer.info.render.frame>2);
 assert.deepEqual(await page.evaluate(()=>window.centralExplore.floors[1].furniture.filter(i=>!i.variable&&['R6','R8','R10'].includes(i.roomId))),fixed);
 await page.waitForFunction(()=>!window.centralExplore.introFlight?.active);await page.locator('#look').click();
 for(const id of ['R6','R8','R10']){
  await page.evaluate(id=>{const t=window.centralExplore,r=t.floors[1].rooms.find(r=>r.id===id);t.walker.reset();Object.assign(t.walker.actor,{x:r.label[0],z:r.bedRows[0].wall[0][1]+.55,floor:1,y:t.floors[1].elevation,outside:false,stair:null});t.walker.look(-Math.PI/.002,.10/.002);t.walker.update(.01);t.lighting.setMode('day');},id);
  await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL('explore-'+id+'.png',destination))});
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({counts,geometry,walking,renders,explore:true,mobile:true,errors},null,2)+'\n');
 console.log('PASS: hardware-rendered Escape/Explore, 42 bed instances match collisions, 126 rendered headboard/wall contacts, no dormitory chairs, keyboard crossing of removed divider, all three rooms from both ends and in Explore, portrait view, shared fixed furnishings, no runtime/shader errors.');
}finally{await browser?.close();server.kill();}
