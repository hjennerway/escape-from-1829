import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=1864,destination=new URL('./artifacts/asylum-doorways/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.doorwayCheck={get ready(){return ready;},get floors(){return floors;},get renderer(){return renderer;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.03;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},walk(floor,id){const d=floors[floor].doorways.find(d=>d.roomId===id),nx=-d.dz,nz=d.dx,run=d.depth+.9;this.pose(d.x-nx*run/2,d.z-nz*run/2,floor,d.x,d.z);moveAsylumActor(floors,player,nx*run,nz*run);return Math.hypot(player.x-(d.x+nx*run/2),player.z-(d.z+nz*run/2))<.001;}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.doorwayCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.doorwayCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[
  ['ground-front',-20.5,7.2,0,-20.5,12],['ground-room',-22,14,0,-20.5,9.4],
  ['corridor',-27,8.2,0,-15,8.2],['upper-room',20.5,7.2,1,20.5,12],
  ['west-rear',-36.7,-22,0,-32,-21.4],['east-rear',36.8,-14.5,1,32,-14.5],
  ['south-door',-43.2,38.15,0,-43.2,34],['deep-bay',65.5,17.8,0,65.5,22],
  ['basement',-30.4,-24.3,2,-34,-23.55],['basement-rear',-31.1,-27.8,2,-31.1,-32],
 ];
 const renders=[];
 for(const [name,...pose] of views){
  await page.evaluate(pose=>window.doorwayCheck.pose(...pose),pose);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
  renders.push(await page.evaluate(name=>({name,calls:window.doorwayCheck.renderer.info.render.calls,triangles:window.doorwayCheck.renderer.info.render.triangles}),name));
 }
 for(const [floor,id] of [[0,'R23'],[1,'R13'],[2,'B1']])assert(await page.evaluate(([floor,id])=>window.doorwayCheck.walk(floor,id),[floor,id]),'Actual player walks through '+id);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.doorwayCheck.pose(-20.5,7.2,0,-20.5,12));
 await page.screenshot({path:fileURLToPath(new URL('mobile.png',destination))});assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({renders,walks:3,errors},null,2)+'\n');
 console.log('PASS: room doorways rendered in all four orientations and on three floors, desktop/mobile captures, actual player traversal, no page or shader errors.');
}finally{await browser.close();server.kill();}
