import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const destination=new URL('./artifacts/reception-second-floor/',import.meta.url),port=1877;
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.upperCheck={get ready(){return ready;},get floors(){return floors;},get notebook(){return notebook;},player,start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz,tilt=0){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=tilt;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;notebook.explore(player);drawMap();interiorLights.update(player);},walk(to){const route=routeBetweenFloors(floors,player,to);if(!route.length)return false;for(const p of route){for(let n=0;n<500&&Math.hypot(p.x-player.x,p.z-player.z)>.025;n++){const dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz),step=Math.min(.04,d);moveAsylumActor(floors,player,dx/d*step,dz/d*step);notebook.explore(player);}if(Math.hypot(p.x-player.x,p.z-player.z)>.04)return false;}showFloor();return player.floor===to.floor;},openNotebook(){state='play';openNotebook();}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.upperCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.upperCheck.start());
 const walked=await page.evaluate(()=>{
  const t=window.upperCheck;t.pose(0,14,0,0,0);const results=[];
  for(const room of t.floors[3].rooms){results.push(t.walk({x:room.label[0],z:room.label[1],floor:3}));results.push(t.walk({x:0,z:14,floor:0}));}
  return {results,floors:t.floors.map(f=>f.name),views:t.notebook.availableViews().map(v=>v.name)};
 });
 assert(walked.results.every(Boolean),'Actual player reaches and returns from both rooms');assert(walked.views.includes('Second floor'));
 const views=[['landing',-7,14.5,3,1,11.3],['three-window-room',-2.5,10.4,3,-3,4.4],['two-window-room',5.1,10.4,3,6.2,4.9],['stairwell',-9.7,9.9,3,-12.8,13,-.25]];
 for(const [name,...pose] of views){await page.evaluate(p=>window.upperCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.upperCheck.pose(-2.5,10.4,3,-3,4.4));
 await page.screenshot({path:fileURLToPath(new URL('room-mobile.png',destination))});
 await page.evaluate(()=>window.upperCheck.openNotebook());await page.waitForFunction(()=>!document.getElementById('floorMap').hidden);assert.match(await page.locator('#mapFloorName').textContent(),/SECOND FLOOR/i);await page.screenshot({path:fileURLToPath(new URL('notebook-mobile.png',destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({walked,errors},null,2)+'\n');
 console.log('PASS: actual reception-to-second-floor room round trips, HUD/notebook, desktop/mobile captures, no page/shader errors.');
}finally{await browser.close();server.kill();}
