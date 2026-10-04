import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {buildAsylumLayout,flatWalkable} from '../../dist/asylum-layout.mjs';

const mode=process.argv[2]??'after',destination=new URL(mode+'/',import.meta.url);
await mkdir(destination,{recursive:true});
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url),'utf8'))).floors;
const views=[['west',0,'R2'],['east',0,'R9'],['north',0,'R31'],['south',3,'R41'],['return',1,'R27'],['basement',2,'B3']].map(([name,floor,id])=>{
 const d=floors[floor].roomDoors.find(d=>d.roomId===id),nx=-d.dz*d.roomSide,nz=d.dx*d.roomSide;
 let x=d.hingeX+d.dx*d.hingeSide*.45+nx*.20,z=d.hingeZ+d.dz*d.hingeSide*.45+nz*.20;
 if(!flatWalkable(floors[floor],x,z,.02)){x=d.hingeX-d.dx*d.hingeSide*.25-nx*.65;z=d.hingeZ-d.dz*d.hingeSide*.25-nz*.65;}
 // This constrained hinge sits behind a perpendicular return. Inspect its
 // unobstructed corridor face rather than placing the camera behind that wall.
 if(id==='R27'){x=d.openingX-nx*.65;z=d.openingZ-nz*.65;}
 return {name,floor,id,x,z,tx:d.hingeX,tz:d.hingeZ};
});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')for(const [name,file] of [['asylum-doors.mjs','doors-before.mjs'],['asylum-architecture.mjs','architecture-before.mjs']])await page.route('**/'+name,async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL(file,import.meta.url),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')+`
window.hingeCapture={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},pose(p){Object.assign(player,{x:p.x,z:p.z,floor:p.floor,y:floors[p.floor].elevation,stair:null,outside:false});scene.remove(torch,torchTarget);showFloor();yaw=Math.atan2(p.x-p.tx,p.z-p.tz);pitch=-.03;camera.position.set(p.x,player.y+1.20,p.z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.hingeCapture?.ready);await page.evaluate(()=>window.hingeCapture.start());
 await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const selected=process.argv[3]?views.filter(p=>p.name===process.argv[3]):views;
 for(const view of selected){
  await page.evaluate(p=>window.hingeCapture.pose(p),view);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(view.name+'.png',destination))});
 }
 if(!process.argv[3]){
  await page.setViewportSize({width:390,height:844});await page.evaluate(p=>window.hingeCapture.pose(p),views.find(p=>p.name==='north'));
  await page.screenshot({path:fileURLToPath(new URL('mobile.png',destination))});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('views.json',destination),JSON.stringify({mode,views,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${selected.length} matched hinge views${process.argv[3]?'':' and a phone view'}, no runtime/shader errors.`);
}finally{await browser.close();server.kill();}
