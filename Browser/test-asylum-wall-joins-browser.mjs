import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const mode=process.argv[2]??'after',port=1866,destination=new URL('./artifacts/asylum-wall-joins/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')await page.route('**/asylum-layout.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/asylum-layout.mjs',import.meta.url),'utf8')).replace('floor.walls=joinAsylumWalls([...pieces.values()]);','floor.walls=[...pieces.values()];')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.wallJoinCheck={get ready(){return ready;},get renderer(){return renderer;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.12;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.wallJoinCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.wallJoinCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[
  ['reception-left',-5.4,17.2,0,-7.1,17.2],
  ['reception-left-oblique',-5.4,16.5,0,-7.1,17.2],
  ['reception-left-upper',-5.4,17.2,1,-7.1,17.2],
  ['reception-right',5.4,17.2,0,7.1,17.2],
  ['stair-room-rear',-17.5,16,0,-16,17.2],
  ['east-bay',49.2,18.1,0,50.55,19.4],
  ['upper-west-rear',-26.5,-23.1,1,-25.1,-24.6],
  ['basement-front',5.6,10.6,2,7,9.4],
 ];
 const renders=[];
 for(const [name,...pose] of views){
  await page.evaluate(p=>window.wallJoinCheck.pose(...p),pose);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});
  renders.push(await page.evaluate(name=>({name,calls:window.wallJoinCheck.renderer.info.render.calls,triangles:window.wallJoinCheck.renderer.info.render.triangles}),name));
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.wallJoinCheck.pose(-5.4,17.2,0,-7.1,17.2));
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${mode}-browser.json`,destination),JSON.stringify({views:renders.length+1,renders,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${renders.length+1} wall-join views across three floors and desktop/mobile, no page or shader errors.`);
}finally{await browser.close();server.kill();}
