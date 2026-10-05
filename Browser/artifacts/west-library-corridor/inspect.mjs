import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const dir=new URL('./',import.meta.url);await mkdir(dir,{recursive:true});
const tag=process.argv[2]??'before';
const {server,base}=await startTestServer(),browser=await launchHardwareBrowser();
try{
 const page=await browser.newPage({viewport:{width:1491,height:891}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
window.corridorCheck={get ready(){return ready;},get floors(){return floors;},get player(){return player;},get scene(){return scene;},get groups(){return floorGroups;},get camera(){return camera;},get renderer(){return renderer;},
start(){start();arrivalCutscene.update(3);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;},
move(dx,dz){moveAsylumActor(floors,player,dx,dz);},
pose(x,z,tx,tz){Object.assign(player,{x,z,floor:3,y:floors[3].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=0;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;interiorLights.update(player);},
walk(to){const route=routeBetweenFloors(floors,player,to);if(!route.length)return {noRoute:true};for(const p of route){for(let n=0;n<800&&Math.hypot(p.x-player.x,p.z-player.z)>.025;n++){const dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz),step=Math.min(.04,d);moveAsylumActor(floors,player,dx/d*step,dz/d*step);}if(Math.hypot(p.x-player.x,p.z-player.z)>.04)return {stuck:p,player:{...player}};}showFloor();return {reached:true,player:{...player}};}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.corridorCheck?.ready);await page.evaluate(()=>window.corridorCheck.start());
 await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const walked=tag==='before'?null:await page.evaluate(()=>{
  const t=window.corridorCheck;t.pose(-54,8.2,-35.2,8.2);
  const start={...t.player};
  for(let n=0;n<470;n++)t.move(.04,0);
  const forward={...t.player};
  for(let n=0;n<470;n++)t.move(-.04,0);
  return {start,forward,returned:{...t.player},passed:Math.abs(forward.x+35.2)<.05&&Math.abs(t.player.x+54)<.05};
 });
 if(walked&&!walked.passed)throw new Error('Widened lane is obstructed: '+JSON.stringify(walked));
 const poses=[['corridor',-46.3,6.6,-30,6.6],['bend',-41,6.6,-32,7.8],['reverse',-34.7,8.2,-48,7.1]];
 for(const [name,...pose] of poses){await page.evaluate(p=>window.corridorCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(tag+'-'+name+'.png',dir))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.corridorCheck.pose(-41,8.3,-32,8.3));
 await page.screenshot({path:fileURLToPath(new URL(tag+'-mobile.png',dir))});
 await writeFile(new URL(tag+'-validation.json',dir),JSON.stringify({walked,errors},null,2)+'\n');
 console.log(JSON.stringify({tag,walked,errors}));
}finally{await browser.close();server.kill();}
