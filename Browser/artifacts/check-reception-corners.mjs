import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'after',port=1859,destination=new URL('./reception-corners/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1100,height:750}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error'&&/THREE|WebGL|shader/i.test(msg.text()))errors.push(msg.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('before-plan.json',destination),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.cornerCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,targetX,targetZ){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-targetX,z-targetZ);pitch=-.28;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.cornerCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.cornerCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 let positions=0;
 for(const floor of [0,1])for(const side of [-1,1])for(const offset of [-.3,0,.3]){
  await page.evaluate(args=>window.cornerCheck.pose(...args),[side*8.6+offset,8.15,floor,side*7.55,5.95]);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${side<0?'west':'east'}-${floor}-${offset}.png`,destination))});positions++;
 }
 for(const floor of [0,1])for(const side of [-1,1]){
  await page.evaluate(args=>window.cornerCheck.pose(...args),[side*5.8,7.8,floor,side*7.55,5.95]);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${side<0?'west':'east'}-${floor}-front.png`,destination))});positions++;
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.cornerCheck.pose(8.6,8.15,0,7.55,5.95));
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({positions:positions+1,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${positions+1} rendered Reception corner views, ground/first, desktop/mobile, no page or shader errors.`);
}finally{await browser.close();server.kill();}
