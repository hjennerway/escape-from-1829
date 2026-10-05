import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const mode=process.argv[2]??'after',destination=new URL('./artifacts/asylum-masonry-corners/',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')for(const module of ['architecture','skirting'])await page.route(`**/asylum-${module}.mjs`,async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL(`before-${module}.mjs.txt`,destination),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.masonryCheck={get ready(){return ready;},get renderer(){return renderer;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.22;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},walk(points,floor){this.pose(...points[0],floor,...points[1]);for(const [x,z] of points.slice(1)){moveAsylumActor(floors,player,x-player.x,z-player.z);if(Math.hypot(player.x-x,player.z-z)>.001)return false;}return true;}};`}));
 await page.goto(`${base}`);await page.waitForFunction(()=>window.masonryCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.masonryCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[
  ['reception-west',-7.6,8.65,0,-8.6,7],
  ['reception-west-oblique',-9.6,8.6,0,-8.6,7],
  ['reception-east',7.6,8.65,0,8.6,7],
  ['reception-partition',5.4,7,0,6.5,4.9],
  ['reception-first-floor',-7.6,8.65,1,-8.6,7],
  ['reception-second-floor',-7.6,8.65,3,-8.6,7],
  ['corridor-bend',5.6,-23.3,0,4.1,-24.5],
  ['corridor-bend-reverse',6.8,-27,1,5.5,-25.9],
  ['basement-west',-31.1,-25.9,2,-32.3,-27.1],
  ['basement-east',-31.1,-25.9,2,-29.9,-27.1],
 ];
 const renders=[];
 for(const [name,...pose] of views){
  await page.evaluate(p=>window.masonryCheck.pose(...p),pose);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});
  renders.push(await page.evaluate(name=>({name,calls:window.masonryCheck.renderer.info.render.calls,triangles:window.masonryCheck.renderer.info.render.triangles}),name));
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.masonryCheck.pose(-7.6,8.65,0,-8.6,7));
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 let walks=0;
 for(const floor of [0,1])for(const points of [
  [[-11,8.2],[-8.7,8.2],[-7.6,7.5],[-5.3,6.3]],
  [[5.3,-22],[5.3,-24.1],[6.7,-25.5],[6.7,-30]],
 ])for(const reverse of [false,true]){
  assert(await page.evaluate(([p,f])=>window.masonryCheck.walk(p,f),[reverse?[...points].reverse():points,floor]),'Actual player can walk around the joined corners in both directions');walks++;
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${mode}-browser.json`,destination),JSON.stringify({views:renders.length+1,renders,walks,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${renders.length+1} corner views across four floors and desktop/mobile, ${walks} player walking passes, no page or shader errors.`);
}finally{await browser.close();server.kill();}
