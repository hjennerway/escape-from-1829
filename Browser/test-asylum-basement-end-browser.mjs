import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const baseline=process.argv.includes('--before'),port=1865,destination=new URL('./artifacts/basement-end/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(baseline)await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('before-plan.json',destination),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.basementCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},pose(x,z,tx,tz){Object.assign(player,{x,z,floor:2,y:floors[2].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.03;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},walk(points){const first=points[0];this.pose(first[0],first[1],first[0],first[1]-1);for(const [x,z] of points.slice(1)){moveAsylumActor(floors,player,x-player.x,z-player.z);if(Math.hypot(player.x-x,player.z-z)>.001)return false;}return true;}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.basementCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.basementCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[
  ['approach',-31.1,-22.7,-31.1,-34],['entrance',-31.1,-26.2,-31.1,-34],
  ['open-room',-31.1,-29.7,-31.1,-35.5],['reverse',-31.1,-34.4,-31.1,-23],
  ['left-flare',-31.1,-29.7,-35.3,-30.1],['right-flare',-31.1,-29.7,-26.9,-30.1],
  ['outside-door',-33,-33.8,-37.94,-34.7],
 ];
 const captures=[];
 for(const [name,...pose] of views){
  await page.evaluate(pose=>window.basementCheck.pose(...pose),pose);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const file=(baseline?'before-':'after-')+name+'.png';await page.screenshot({path:fileURLToPath(new URL(file,destination))});captures.push(file);
 }
 if(!baseline)for(const points of [
  [[-31.1,-23],[-31.1,-34],[-36.8,-34],[-25.8,-34],[-31.1,-34],[-31.1,-23]],
  [[-31.7,-25.5],[-31.7,-34.5],[-30.5,-34.5],[-30.5,-25.5]],
 ])assert(await page.evaluate(points=>window.basementCheck.walk(points),points),'Actual game player freely traverses the entrance and whole end area');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.basementCheck.pose(-31.1,-26.2,-31.1,-34));
 const mobile=(baseline?'before-':'after-')+'mobile.png';await page.screenshot({path:fileURLToPath(new URL(mobile,destination))});captures.push(mobile);
 assert.deepEqual(errors,[]);
 await writeFile(new URL((baseline?'before-':'after-')+'validation.json',destination),JSON.stringify({captures,walks:baseline?0:2,errors},null,2)+'\n');
 console.log(baseline?'Captured previous basement end for comparison.':'PASS: desktop/mobile basement end views, actual player traversal through the open entrance and across the room, no page or shader errors.');
}finally{await browser.close();server.kill();}
