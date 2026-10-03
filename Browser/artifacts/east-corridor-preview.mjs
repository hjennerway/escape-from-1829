import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'before',port=1883,destination=new URL('./east-corridor/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1400,height:740}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('asylum-plan-before.json',destination),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.corridorCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},
 pose(x,z,tx,tz,floor=0){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();enemies.forEach(e=>e.mesh.visible=false);yaw=Math.atan2(x-tx,z-tz);pitch=-.18;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},
 snapshot(){return {player:[player.x,player.y,player.z],camera:camera.position.toArray(),rotation:camera.rotation.toArray(),walls:floors[0].walls.filter(w=>[w.a,w.b].some(([x,z])=>x>=30&&x<=36&&z>=25&&z<=30))};},
 walk(){const route=[[33.3,24.5],[33.3,26],[32.1,26.8],[30.25,29],[30.25,35]],results=[];for(const reverse of [false,true]){const points=reverse?[...route].reverse():route,actor={x:points[0][0],z:points[0][1],floor:0,y:0};for(const [x,z] of points.slice(1)){moveAsylumActor(floors,actor,x-actor.x,z-actor.z);results.push({expected:[x,z],actual:[actor.x,actor.z],error:Math.hypot(actor.x-x,actor.z-z)});}}return results;}
};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.corridorCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.corridorCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[['marked',33.3,24.5,30.25,29],['joined-wall',31.7,27.4,33,27.8],['corner',32.4,27.1,31.1,26.1],['reverse',30.25,29,33.3,25.5],['room-face',36,29,33,27.3],['upper',33.3,24.5,30.25,29,1]];
 const poses=[];
 for(const [name,...pose] of views){await page.evaluate(p=>window.corridorCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));poses.push({name,...await page.evaluate(()=>window.corridorCheck.snapshot())});await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.corridorCheck.pose(33.3,24.5,30.25,29));await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 const walks=mode==='before'?[]:await page.evaluate(()=>window.corridorCheck.walk());assert(walks.every(p=>p.error<1e-6),'Both real-game corridor walks reach every target');
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views:views.length+1,walks,poses,errors},null,2)+'\n');
 console.log(`PASS: ${mode} east-corridor desktop/mobile and upper-floor views, no page/shader errors.`);
}finally{await browser.close();server.kill();}
