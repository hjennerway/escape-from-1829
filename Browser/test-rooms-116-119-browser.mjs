import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/rooms-116-119/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'}),errors=[],renders=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.roomReview={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get renderer(){return renderer;},get camera(){return camera;},get arrival(){return arrivalCutscene;},player,keys,start,update,showFloor,
 at(x,z,angle=0){Object.assign(player,{x,z,floor:1,y:floors[1].elevation,stair:null,outside:false});yaw=angle;pitch=-.12;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;},
 play(){state='play';elapsed=0;keys.clear();},pause(){state='paused';keys.clear();}};` }));
 await page.goto(base);await page.waitForFunction(()=>window.roomReview?.ready);
 await page.evaluate(()=>{const t=window.roomReview;t.start();t.arrival.update(3);t.pause();});
 const counts=await page.evaluate(()=>{
  const f=window.roomReview.floors[1];return ['R19','R20','R22'].map(id=>({id,name:f.rooms.find(r=>r.id===id).name,beds:f.furniture.filter(i=>i.roomId===id&&i.kind==='bed').length}));
 });assert.deepEqual(counts.map(r=>r.beds),[0,14,14]);assert.equal(counts[0].name,'Sewing room');
 const geometry=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=window.roomReview,f=t.floors[1],group=t.scene.children.find(g=>g.position.y===f.elevation&&g.getObjectByName('Asylum furniture')).getObjectByName('Asylum furniture'),ids=new Set(),beds=new Set();
  for(const mesh of group.children)for(let i=0;i<mesh.count;i++){
   const item=f.furniture.find(p=>p.id===mesh.userData.furnitureIds[i]);if(!['R19','R20','R22'].includes(item.roomId))continue;
   const matrix=new THREE.Matrix4(),point=new THREE.Vector3(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3();mesh.getMatrixAt(i,matrix);matrix.decompose(point,rotation,scale);
   if(Math.hypot(point.x-item.x,point.z-item.z)>1e-4||Math.abs(point.y-item.y)>1e-4)throw Error('Rendered furniture differs from its collision record');
   const expected=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),item.rotation);if(1-Math.abs(rotation.dot(expected))>1e-5)throw Error('Rendered bed orientation differs from the plan');
   ids.add(item.id);if(item.kind==='bed')beds.add(item.id);
  }
  return {renderedItems:ids.size,renderedBeds:beds.size};
 });assert.equal(geometry.renderedBeds,28);
 const poses=[['117-north',-51.3,3.8,Math.PI],['117-south',-51.3,18.1,0],['119-north',-42.5,4.8,Math.PI],['119-south',-41.9,18.3,0],['116-sewing',-57.0,13.4,Math.PI/2]];
 for(const [name,x,z,angle]of poses){
  await page.evaluate(args=>window.roomReview.at(...args),[x,z,angle]);
  assert(await page.evaluate(async()=>{const {flatWalkable}=await import('/asylum-layout.mjs'),t=window.roomReview;return flatWalkable(t.floors[1],t.player.x,t.player.z,.34);}),name+': camera stands in clear walking space');
  await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
  renders.push(await page.evaluate(name=>({name,calls:window.roomReview.renderer.info.render.calls,triangles:window.roomReview.renderer.info.render.triangles}),name));
 }
 await page.setViewportSize({width:390,height:844});
 for(const pose of [poses[0],poses[2],['116-sewing',-59.2,13.4,Math.atan2(2.5,2.9)]]){await page.evaluate(args=>window.roomReview.at(...args),pose.slice(1));await page.waitForTimeout(200);await page.screenshot({path:fileURLToPath(new URL(pose[0]+'-mobile.png',destination))});}
 const walking=await page.evaluate(()=>{
  const result=[];for(const x of [-51.3,-42.5]){const t=window.roomReview;t.at(x,5,Math.PI);t.play();t.keys.add('KeyW');for(let i=0;i<70;i++)t.update(.02);t.pause();result.push({x:t.player.x,z:t.player.z,floor:t.player.floor});}return result;
 });assert(walking.every(p=>p.z>9&&p.floor===1),'Actual game movement traverses both centre aisles');
 const fixed=await page.evaluate(()=>window.roomReview.floors[1].furniture.filter(i=>!i.variable&&['R19','R20','R22'].includes(i.roomId)));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.roomExplore={floors,interior,walker,renderer,introFlight,lighting};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1200,height:800});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.roomExplore?.renderer.info.render.frame>2);
 assert.deepEqual(await page.evaluate(()=>window.roomExplore.floors[1].furniture.filter(i=>!i.variable&&['R19','R20','R22'].includes(i.roomId))),fixed,'Escape and Explore share beds and sewing furniture');
 await page.waitForFunction(()=>!window.roomExplore.introFlight?.active);await page.locator('#look').click();
 for(const [name,x,z,angle]of [poses[0],poses[2],poses[4]]){
  await page.evaluate(({x,z,angle})=>{const t=window.roomExplore;t.walker.reset();Object.assign(t.walker.actor,{x,z,floor:1,y:t.floors[1].elevation,outside:false,stair:null});t.walker.look(-angle/.002,.12/.002);t.walker.update(.01);t.lighting.setMode('day');},{x,z,angle});
  await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL('explore-'+name+'.png',destination))});
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({counts,geometry,walking,renders,explore:true,mobile:true,errors},null,2)+'\n');
 console.log('PASS: hardware-rendered Escape/Explore, 28 bed instances and sewing furniture match collisions/orientations, centre-aisle keyboard movement, desktop/portrait room views, shared fixed furnishings, no runtime/shader errors.');
}finally{await browser?.close();server.kill();}
