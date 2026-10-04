import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const destination=new URL(process.env.ROOM_DOOR_ARTIFACT_DIR??'./artifacts/room-doors/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'}),errors=[],captures=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.roomDoorTest={get ready(){return ready;},get floors(){return floors;},get groups(){return floorGroups;},get renderer(){return renderer;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.03;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},walk(floor,id,side){const d=floors[floor].doorways.find(d=>(d.roomId??d.partitionId)===id),nx=-d.dz*side,nz=d.dx*side,run=1.2;this.pose(d.x-nx*run/2,d.z-nz*run/2,floor,d.x,d.z);moveAsylumActor(floors,player,nx*run,nz*run);return Math.hypot(player.x-(d.x+nx*run/2),player.z-(d.z+nz*run/2))<.001;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.roomDoorTest?.ready);await page.evaluate(()=>window.roomDoorTest.start());
 await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const gamePoses=await page.evaluate(()=>window.roomDoorTest.floors.map((f,i)=>{
  const leaf=window.roomDoorTest.groups[i].getObjectByName('Asylum RoomDoor');
  return {floor:f.id,doors:f.roomDoors.map(d=>({id:d.roomId,angle:d.openAngle,hinge:d.hingeSide,limited:d.wallLimited})),instances:leaf.count};
 }));
 assert.equal(gamePoses.reduce((n,f)=>n+f.doors.length,0),90);assert(gamePoses.every(f=>f.instances===f.doors.length*5));
 async function shot(name,pose){
  if(pose)await page.evaluate(p=>window.roomDoorTest.pose(...p),pose);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});captures.push(name);
 }
 for(const [name,...pose] of [
  ['north-corridor',-20.5,7.2,0,-20.5,12],['north-room',-22,14,0,-20.5,9.4],
  ['west-door',-36.7,-22,0,-32,-21.4],['east-door',36.8,-14.5,1,32,-14.5],
  ['south-door',-43.2,38.15,0,-43.2,34],['bay-library',53.10,17.35,1,53.1,21],
  ['wall-contact-return',50.10,10.5,1,48.85,7.8],['wall-contact-central',2.3,3.8,0,4.1,3],
  ['basement-door',-30.4,-12.25,2,-34,-12.25],['basement-wall-contact',-1.5,12.8,2,-1.5,9.4],
  ['upper-door',0,12.2,3,0,8],['corridor-link',5.4,7,0,5.4,3.4],
 ])await shot(name,pose);
 async function hingeShot(name,floor,id){
  await page.evaluate(([floor,id])=>{
   const d=window.roomDoorTest.floors[floor].roomDoors.find(d=>d.roomId===id),nx=-d.dz*d.roomSide,nz=d.dx*d.roomSide;
   window.roomDoorTest.pose(d.hingeX-d.dx*d.hingeSide*.45+nx*.75,d.hingeZ-d.dz*d.hingeSide*.45+nz*.75,floor,d.hingeX,d.hingeZ);
  },[floor,id]);
  await shot(name);
 }
 for(const [name,floor,id] of [['hinge-west',0,'R2'],['hinge-east',0,'R9'],['hinge-north',0,'R31'],['hinge-south',3,'R41'],['hinge-return',1,'R27'],['hinge-basement',2,'B3']])await hingeShot(name,floor,id);
 const crossings=await page.evaluate(()=>window.roomDoorTest.floors.flatMap(f=>f.doorways.map(d=>[f.id,d.roomId??d.partitionId])));
 for(const [floor,id] of crossings)for(const side of [-1,1])assert(await page.evaluate(args=>window.roomDoorTest.walk(...args),[floor,id,side]),`Actual player crosses ${floor} ${id} both ways`);
 await page.setViewportSize({width:390,height:844});await shot('mobile-door',[-20.5,7.2,0,-20.5,12]);
 await shot('mobile-wall-contact',[50.10,10.5,1,48.85,7.8]);
 await hingeShot('mobile-hinge',0,'R31');

 // Exploration uses the same poses and paint batches, without the game loop.
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.roomDoorExploreTest={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1280,height:800});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.roomDoorExploreTest?.renderer.info.render.frame>2);
 const explorePoses=await page.evaluate(()=>window.roomDoorExploreTest.floors.map(f=>{
  const group=window.roomDoorExploreTest.interior.scene.children.find(g=>g.name===f.name);
  return {floor:f.id,doors:f.roomDoors.map(d=>({id:d.roomId,angle:d.openAngle,hinge:d.hingeSide,limited:d.wallLimited})),instances:group.getObjectByName('Asylum RoomDoor').count};
 }));
 assert.deepEqual(explorePoses,gamePoses,'Game and exploration render the same room doors');
 await page.addStyleTag({content:'.explore-guide{display:none}'});
 await page.evaluate(()=>{const {walker,floors}=window.roomDoorExploreTest;walker.setView({position:[-20.5,1.8,7.2],target:[-20.5,1.8,12]});Object.assign(walker.actor,{x:-20.5,z:7.2,floor:0,y:floors[0].elevation,outside:false,stair:null});walker.update(.01);document.getElementById('layoutControls').open=false;});
 await shot('exploration-door');assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({gamePoses,explorePoses,captures,walks:crossings.length*2,errors},null,2)+'\n');
 console.log(`PASS: 90 open room doors in game and exploration, ${crossings.length*2} actual player doorway crossings, ${captures.length} desktop/mobile views, all hinge orientations, wall contacts and clear corridor link, no page/shader errors.`);
}finally{await browser.close();server.kill();}
