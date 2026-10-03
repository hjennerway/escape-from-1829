import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const mode=process.argv[2]??'after',port=1885,destination=new URL('./east-first-wall/r27/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1588,height:891}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>{
  const plan=JSON.parse(await readFile(new URL('../dist/asylum-plan.json',import.meta.url)));
  delete plan.rooms.find(r=>r.id==='R27').variants[1];
  await route.fulfill({contentType:'application/json',body:JSON.stringify(plan)});
 });
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.firstWallCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},
 pose(x,z,tx,tz,lookPitch=.03){Object.assign(player,{x,z,floor:1,y:floors[1].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();enemies.forEach(e=>e.mesh.visible=false);yaw=Math.atan2(x-tx,z-tz);pitch=lookPitch;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}
};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.firstWallCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.firstWallCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[['marked',43.06,8.95,52.05,4.56,-.43],['wide',43,9.2,49.75,7,-.3],['door-join',48.3,5.7,49.75,7.5,-.25],['room-face',49.7,11,46.7,8.535,-.2],['reverse',46,10.5,47,7,-.25]];
 for(const [name,...pose] of views){await page.evaluate(p=>window.firstWallCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.firstWallCheck.pose(43.06,8.95,52.05,4.56,-.43));await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({floor:1,views:views.length+1,errors},null,2)+'\n');
 console.log(`PASS: ${mode} first-floor enclosure, doorway, reverse face and mobile views; no page/shader errors.`);
}finally{await browser.close();server.kill();}
