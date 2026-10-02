import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv.includes('--before')?'before':'after',port=1872,destination=new URL('./artifacts/basement-windows/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')for(const file of ['asylum-architecture.mjs','asylum-layout.mjs','asylum-plan.json','escape-exterior.mjs'])await page.route('**/'+file,async route=>route.fulfill({contentType:file.endsWith('.json')?'application/json':'text/javascript',body:await readFile(new URL('before-'+file,destination),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.windowCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},pose(x,z,tx,tz,outside=false){Object.assign(player,{x,z,floor:2,y:outside?0:floors[2].elevation,stair:null,outside});(outside?exterior.scene:scene).add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.08;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},rooms(){return floors[2].rooms.filter(r=>/^B[1-8]$/.test(r.id)).map(r=>({id:r.id,label:r.label,points:r.points}));}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.windowCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.windowCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 await page.setViewportSize({width:1860,height:558});
 for(const [name,pose] of [['marked-view',[-41,-28,-37,-15,true]],['marked-close',[-40.5,-27,-37,-15,true]],['marked-low',[-40.5,-25,-37,-13,true]]]){
  await page.evaluate(p=>window.windowCheck.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});
 }
 if(process.argv.includes('--exterior-only')){assert.deepEqual(errors,[]);console.log('Captured exterior angles without page/shader errors.');}else{
 await page.setViewportSize({width:1600,height:900});
 const views=[['exterior-rear',-42,-30,-37,-8,true],['exterior-front',-42,-2,-37,-22,true]];
 for(const room of await page.evaluate(()=>window.windowCheck.rooms())){
  const west=Number(room.id.slice(1))%2===1;
  views.push([room.id,west?-33.2:-29,room.label[1],west?-37:-24.7,room.label[1],false]);
 }
 for(const [name,...pose] of views){
  await page.evaluate(pose=>window.windowCheck.pose(...pose),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.windowCheck.pose(-33.2,-22,-37,-22));
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views,errors},null,2)+'\n');
 console.log(`PASS: ${mode} basement room windows and oblique exterior views, desktop/mobile, no page/shader errors.`);
 }
}finally{await browser.close();server.kill();}
