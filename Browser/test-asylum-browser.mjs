import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const root=new URL('../',import.meta.url),destination=new URL('./artifacts/asylum-remodel/',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1100,height:750}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error'&&/THREE|WebGL|shader/i.test(msg.text()))errors.push(msg.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.asylumTest={get ready(){return ready;},get state(){return state;},get floors(){return floors;},get scene(){return scene;},get renderer(){return renderer;},get camera(){return camera;},get outsideWalker(){return outsideWalker;},get enemies(){return enemies;},player,keys,start,showFloor,update,drawMap,outsideDoor,useDoor,get arrival(){return arrivalCutscene;},pose(x,z,floor,angle=0,tilt=0){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=angle;pitch=tilt;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;drawMap();},play(){state='play';elapsed=0;keys.clear();},pause(){state='paused';},move(dx,dz){moveAsylumActor(floors,player,dx,dz);showFloor();camera.position.set(player.x,player.y+1.65,player.z);drawMap();},get routes(){return routeBetweenFloors;},setTime(v){elapsed=v;}};` }));
 await page.goto(`${base}`);
 await page.waitForFunction(()=>window.asylumTest?.ready,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.asylumTest.floors.length),4);
 await page.evaluate(()=>{const t=window.asylumTest;t.start();t.arrival.update(3);t.pause();});
 const views=[['reception',0,14,0,0,0],['rear-corridor',-20.5,8.2,0,Math.PI/2,0],['ground-room',-20.5,13.3,0,0,0],['first-floor',-20.5,8.2,1,-Math.PI/2,0],['basement-corridor',-31.1,-7,2,0,0],['basement-room',-34.65,-23.5,2,0,0],['new-stair',-33.05,7.4,0,Math.PI,-.2]];
 const renders=[];
 for(const [name,x,z,floor,yaw,pitch] of views){await page.evaluate(args=>window.asylumTest.pose(...args),[x,z,floor,yaw,pitch]);await page.waitForTimeout(200);await page.screenshot({path:new URL(name+'.png',destination).pathname.replace(/^\/(\w:)/,'$1')});renders.push(await page.evaluate(name=>({name,calls:window.asylumTest.renderer.info.render.calls,triangles:window.asylumTest.renderer.info.render.triangles}),name));}
 const doors=await page.evaluate(()=>window.asylumTest.floors.flatMap((f,floor)=>f.exits.map(e=>({id:e.id,floor,inside:e.inside,destination:e.destination}))));
 for(const door of doors){
  const result=await page.evaluate(door=>{const t=window.asylumTest;t.pose(door.inside.x,door.inside.z,door.floor);t.play();t.update(.01);t.keys.add('KeyE');t.update(.04);const outside=t.player.outside,pos=[t.player.x,t.player.y,t.player.z];t.update(.04);const latched=t.player.outside;t.keys.delete('KeyE');t.update(.04);const matches=t.outsideDoor()?.id===door.id;t.keys.add('KeyE');t.update(.04);const returned=!t.player.outside&&t.player.floor===door.floor;t.keys.clear();t.update(.01);t.pause();return {outside,pos,latched,matches,returned};},door);
  assert(result.outside&&result.latched&&result.matches&&result.returned,door.id+' floor '+door.floor+' round trip '+JSON.stringify(result));assert.deepEqual(result.pos,door.destination);
 }
 // Walk S5 down and up without E, using the actual game input loop.
 const staircase=await page.evaluate(async()=>{
  const {stairRoute}=await import('/asylum-stairs.mjs');
  const t=window.asylumTest,s=t.floors[0].stairs.find(s=>s.id==='S5'),route=stairRoute(s,-3.2,0),left=route[0][0],right=route.at(-1)[0],front=route[0][2];
  t.pose(right,front-.7,0);t.play();t.keys.add('KeyE'); // Freeze NPCs only; E never transfers a stair.
  let continuous=true,prior=t.player.y;
  function go(x,z){for(let i=0;i<4000&&Math.hypot(t.player.x-x,t.player.z-z)>.035;i++){const dx=x-t.player.x,dz=z-t.player.z,d=Math.hypot(dx,dz),step=Math.min(.04,d);t.move(dx/d*step,dz/d*step);continuous&&=Math.abs(t.player.y-prior)<.08;prior=t.player.y;}return Math.hypot(t.player.x-x,t.player.z-z)<.04;}
  const down=[...[...route].reverse().map(p=>go(p[0],p[2])),go(left,front-.8)],bottom=t.player.floor;
  const up=[...route.map(p=>go(p[0],p[2])),go(right,front-.8)],middle=t.player.floor;
  const toFirst=[go(left,front-.8),...stairRoute(s,0,4.2).map(p=>go(p[0],p[2])),go(right,front-.8)],top=t.player.floor;
  t.keys.clear();t.pause();return {down,up,toFirst,bottom,middle,top,continuous};
 });
 assert(staircase.down.every(Boolean)&&staircase.up.every(Boolean)&&staircase.toFirst.every(Boolean)&&staircase.continuous);assert.deepEqual([staircase.bottom,staircase.middle,staircase.top],[2,0,1]);
 await page.evaluate(()=>{const t=window.asylumTest,e=t.floors[1].exits.find(e=>e.id==='F2');t.pose(e.inside.x,e.inside.z,1);t.useDoor(e);t.pause();});await page.waitForTimeout(250);await page.screenshot({path:new URL('outside-fire-escape.png',destination).pathname.replace(/^\/(\w:)/,'$1')});
 const landing=await page.evaluate(()=>{const t=window.asylumTest,start=t.player.y;t.outsideWalker.update(t.player,0,-.15,.04);return {start,y:t.player.y,x:t.player.x,z:t.player.z};});assert(landing.y>4.8&&landing.z<-36.4,'Upper fire escape is walkable and retains its height '+JSON.stringify(landing));
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const t=window.asylumTest;t.pose(-31.1,-7,2);document.getElementById('floorMap').hidden=false;t.drawMap();});await page.waitForTimeout(250);await page.screenshot({path:new URL('basement-mobile.png',destination).pathname.replace(/^\/(\w:)/,'$1')});
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({doors:doors.length,staircase,landing,renders,errors},null,2)+'\n');
 console.log(`PASS: actual four-floor game, ${doors.length} E door round trips with release latch, walked basement/ground/first stair, raised outside landing, desktop/mobile renders, no runtime errors.`);
}finally{await browser.close();server.kill();}
