import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const destination=new URL('./artifacts/jump/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],results={};page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/explore.mjs',async route=>{
  let source=await readFile(new URL('./dist/explore.mjs',import.meta.url),'utf8');
  source=source.replace('const clock=new THREE.Timer();',`window.jumpTest={walker,exterior,input};window.__manualJump=true;const clock=new THREE.Timer();`).replace('else if(input.active)walker.update(dt);','else if(input.active&&!window.__manualJump)walker.update(dt);');
  await route.fulfill({contentType:'text/javascript',body:source});
 });
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.jumpTest);
 await page.mouse.click(900,400);
 const walkSteps=n=>page.evaluate(n=>{for(let i=0;i<n;i++)window.jumpTest.walker.update(1/120);},n);
 for(const [name,x] of [['wall',-10],['hedge',45]]){
  await page.evaluate(x=>window.jumpTest.walker.setView({position:[x,1.8,75.2],target:[x,1.3,70]}),x);
  await page.keyboard.down('KeyW');await walkSteps(30);
  const before=await page.evaluate(()=>window.jumpTest.exterior.camera.position.toArray());assert(before[2]>74.6);
  await page.screenshot({path:fileURLToPath(new URL('walking-'+name+'-ground.png',destination))});
  await page.keyboard.down('Space');await walkSteps(48);
  const peak=await page.evaluate(()=>window.jumpTest.exterior.camera.position.toArray());assert(peak[1]>3.3);
  await page.screenshot({path:fileURLToPath(new URL('walking-'+name+'-jump.png',destination))});
  await walkSteps(100);await page.keyboard.up('KeyW');await page.keyboard.down('Space');await walkSteps(120);
  const after=await page.evaluate(()=>window.jumpTest.exterior.camera.position.toArray());assert(after[2]<73);assert.equal(after[1],1.8,'Held Space must not relaunch');
  await page.keyboard.up('Space');results[name]={before,peak,after};
 }
 assert((await page.locator('.desktop-walk-help').textContent()).includes('Space jump'));
 await page.route('**/game.mjs',async route=>{
  const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace("if(state!=='play')return;\n if(artViewing)","if(window.__manualJump&&!window.__jumpStep)return;\n if(state!=='play')return;\n if(artViewing)");
  await route.fulfill({contentType:'text/javascript',body:source+`
window.__manualJump=true;
window.jumpGame={get ready(){return ready;},player,keys,get camera(){return camera;},get state(){return state;},get floors(){return floors;},boot(){start();arrivalCutscene.update(3);},pose(x,y,z,floor=0,outside=false){outsideWalker.resetJump();indoorJump.reset();Object.assign(player,{x,y,z,floor,stair:null,outside,verticalTrend:0});yaw=0;pitch=0;keys.clear();state='play';elapsed=0;camera.position.set(x,y+1.65,z);camera.rotation.set(0,0,0);(outside?exterior.scene:scene).add(torch,torchTarget);showFloor();$('arrivalFade').hidden=true;$('result').hidden=true;},step(n){window.__jumpStep=true;for(let i=0;i<n;i++)update(1/120);window.__jumpStep=false;},transfer(){useDoor(floors[0].exits[0]);},resetPositions};`});
 });
 await page.goto(base);await page.waitForFunction(()=>window.jumpGame?.ready);await page.evaluate(()=>{window.jumpGame.boot();window.jumpGame.pose(0,0,14);});
 assert((await page.locator('#hud .controls').textContent()).includes('SPACE JUMP'));
 for(const [name,x,y,z,floor,outside] of [['reception',0,0,14,0,false],['basement',-31.1,-3.2,-7,2,false],['outside',-10,0,60,0,true]]){
  await page.evaluate(args=>window.jumpGame.pose(...args),[x,y,z,floor,outside]);
  await page.keyboard.down('Space');await page.evaluate(()=>window.jumpGame.step(48));
  const peak=await page.evaluate(()=>({...window.jumpGame.player}));assert(peak.y>y+.5);
  await page.screenshot({path:fileURLToPath(new URL('escape-'+name+'-jump.png',destination))});
  await page.evaluate(()=>window.jumpGame.step(120));await page.keyboard.down('Space');await page.evaluate(()=>window.jumpGame.step(60));
  const after=await page.evaluate(()=>({...window.jumpGame.player}));assert(Math.abs(after.y-y)<1e-9);await page.keyboard.up('Space');results[name]={peak,after};
 }
 await page.keyboard.press('KeyP');await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>window.jumpGame.state),'paused');
 await page.keyboard.press('KeyP');await page.keyboard.press('KeyN');assert.equal(await page.evaluate(()=>window.jumpGame.state),'notebook');await page.keyboard.press('Space');
 assert.equal(await page.evaluate(()=>window.jumpGame.player.y),0,'Space in the notebook cannot launch a jump');
 if(await page.evaluate(()=>window.jumpGame.state)!=='play')await page.keyboard.press('Escape');
 await page.evaluate(()=>window.jumpGame.pose(0,0,14));await page.keyboard.press('Space');await page.evaluate(()=>{window.jumpGame.step(24);window.jumpGame.resetPositions();window.jumpGame.step(1);});assert.equal(await page.evaluate(()=>window.jumpGame.player.y),0,'Restart clears airborne state');
 await page.keyboard.press('Space');await page.evaluate(()=>{window.jumpGame.step(24);window.jumpGame.transfer();window.jumpGame.step(1);});
 assert(await page.evaluate(()=>window.jumpGame.player.outside));
 await page.setViewportSize({width:844,height:390});await page.keyboard.press('KeyH');
 assert((await page.locator('#instructions').textContent()).includes('Jump over small walls and hedges'));
 await page.screenshot({path:fileURLToPath(new URL('escape-help.png',destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({...results,errors},null,2)+'\n');
 console.log('PASS: real Space input in walking and escape, actual wall/hedge clearance, no held-key bouncing, indoor/basement/outside views, pause/notebook, restart/door transfer and help.');
}finally{await browser.close();server.kill();}
