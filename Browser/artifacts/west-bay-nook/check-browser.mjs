import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';

const out=new URL('./',import.meta.url);await mkdir(out,{recursive:true});
const {server,base}=await startTestServer();
let browser;
const errors=[],captures=[];
try{
 browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(process.argv.includes('--before'))await page.route('**/hall-furnishings.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-hall-furnishings.mjs',out),'utf8')}));
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
 window.nookTest={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get renderer(){return renderer;},player,keys,update,start,get arrival(){return arrivalCutscene;},pose(x,z,tx,tz,ty=1.25){Object.assign(player,{x,z,floor:1,y:floors[1].elevation,outside:false,stair:null});yaw=Math.atan2(-(tx-x),-(tz-z));pitch=Math.atan2(ty-1.65,Math.hypot(tx-x,tz-z));camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();for(const e of enemies)e.mesh.visible=false;$('arrivalFade').hidden=true;$('hud').hidden=false;},walk(){state='play';},pause(){state='paused';}};` }));
 await page.goto(base);await page.waitForFunction(()=>window.nookTest?.ready);
 await page.evaluate(()=>{const t=window.nookTest;t.start();t.arrival.update(3);t.pause();});
 const prefix=process.argv.includes('--before')?'before':'after';
 for(const [name,pose] of [['entrance',[-61.0,2.0,-55.0,-1.0,1.25]],['corridor',[-60.3,2.8,-50.5,1.0,1.35]],['seating',[-59.4,-.5,-58.5,-3.7,1.0]]]){
  await page.evaluate(p=>window.nookTest.pose(...p),pose);await page.waitForTimeout(300);
  await page.screenshot({path:fileURLToPath(new URL(prefix+'-'+name+'.png',out))});captures.push(prefix+'-'+name);
 }
 await writeFile(new URL(prefix+'-records.json',out),JSON.stringify(await page.evaluate(()=>window.nookTest.floors.flatMap(f=>f.furniture)),null,2)+'\n');
 assert.deepEqual(errors,[]);
 console.log('PASS: verified hardware alcove captures, no runtime/shader errors.');
}finally{await browser?.close();server.kill();}
