import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'after',port=1865,destination=new URL('./reception-basement/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:2048,height:720}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.partitionCheck={get ready(){return ready;},get floors(){return floors;},start(){start();arrivalCutscene.update(3);},pose(x,z,tx,tz){Object.assign(player,{x,z,floor:2,y:floors[2].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.03;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},walk(x,z,dx,dz){this.pose(x,z,x+dx,z+dz);moveAsylumActor(floors,player,dx,dz);return {x:player.x,z:player.z};}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.partitionCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.partitionCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[['reference',-3,14,7.1,14.2],['west',-5,14.5,1,14.5],['east',5,14.5,-2,14.5],['join',-1.6,11.4,.5,9.4]];
 for(const [name,...pose] of views){
  await page.evaluate(pose=>window.partitionCheck.pose(...pose),pose);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',destination))});
 }
 if(mode==='after'){
  for(const side of [-1,1]){
   const result=await page.evaluate(side=>window.partitionCheck.walk(side,14.5,-side*2,0),side);assert(Math.abs(result.x+side)<.001,'Player traverses new doorway');
   const blocked=await page.evaluate(side=>window.partitionCheck.walk(side,12,-side*2,0),side);assert(blocked.x*side>.4,'New wall blocks player');
  }
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.partitionCheck.pose(-5,14.5,1,14.5));await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(mode+'-validation.json',destination),JSON.stringify({errors,views:views.length+1,walking:mode==='after'},null,2)+'\n');
 console.log('PASS: Reception basement views, desktop/mobile and no page or shader errors'+(mode==='after'?', doorway crossing and wall collision.':'.'));
}finally{await browser.close();server.kill();}
