import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {buildAsylumLayout,flatWalkable,insidePolygon} from './dist/asylum-layout.mjs';
import {asylumWindowCenters} from './dist/asylum-windows.mjs';

const mode=process.argv.includes('--before')?'before':'after',port=1875,destination=new URL('./artifacts/window-clearance/',import.meta.url);
await mkdir(destination,{recursive:true});
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors,views=[];
for(const floor of floors.slice(0,2))for(const wall of floor.walls){
 const {a,b}=wall,length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length,ts=asylumWindowCenters(wall,floor.walls);
 for(const [i,t] of ts.entries()){
  const nominal=length*(i+.5)/ts.length;
  if(Math.abs(t-nominal)<1e-5)continue;
  const x=a[0]+dx*t,z=a[1]+dz*t,inward=floor.outline.loops.some(loop=>insidePolygon(x-dz*.5,z+dx*.5,loop))?1:-1;
  const pose=[2.2,1.6,1.1,.65].map(distance=>[x-dz*inward*distance,z+dx*inward*distance,floor.id,x,z]).find(p=>flatWalkable(floor,p[0],p[1]));
  assert(pose,`Window ${x},${z} has a walkable inspection position`);
  views.push({name:`floor-${floor.id}-window-${views.length+1}`,pose});
 }
}
views.push(
 {name:'ground-west-rear-lining',pose:[-27.4,-21.35,0,-24.7,-21.35]},
 {name:'ground-east-rear-lining',pose:[27.4,-21.35,0,24.7,-21.35]},
 {name:'first-floor-partition-oblique',pose:[-38.4,24.8,1,-41,26.6]},
 {name:'basement-scheduled',pose:[-33.2,-22,2,-37,-22]},
 {name:'second-floor-scheduled',pose:[-3,10,3,-3,7]},
);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before'){
  await page.route('**/asylum-architecture.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-architecture.mjs.txt',destination),'utf8')}));
  await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('before-plan.json',destination),'utf8')}));
 }
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.clearanceCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.12;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.clearanceCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.clearanceCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 for(const {name,pose} of views){
  await page.evaluate(p=>window.clearanceCheck.pose(...p),pose);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.clearanceCheck.pose(-38.4,24.8,1,-41,26.6));
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${mode}-browser.json`,destination),JSON.stringify({views,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${views.length+1} desktop/mobile views, every shifted sash and both adjusted wall linings, all four floors, no page or shader errors.`);
}finally{await browser.close();server.kill();}
