import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'before',port=1882,destination=new URL('./east-ground-wall/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1193,height:846}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('./asylum-plan-before.json',destination),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.wallCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},
 pose(x,z,tx,tz,floor=0){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();enemies.forEach(e=>e.mesh.visible=false);yaw=Math.atan2(x-tx,z-tz);pitch=.03;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}
};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.wallCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.wallCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[['marked',37.2,17.8,34.5,21],['wide',37.7,17.3,34.5,21.2],['door-join',35.1,20.4,34.5,24.3],['room-face',38,24,35,22.6],['reverse',35.8,22,33.1,17]];
 for(const [name,...pose] of views){await page.evaluate(p=>window.wallCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.wallCheck.pose(35.1,20.4,34.5,24.3));await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views:views.length+1,errors},null,2)+'\n');
 console.log(`PASS: ${mode} wall, doorway, cleared pillar and mobile views, no page/shader errors.`);
}finally{await browser.close();server.kill();}
