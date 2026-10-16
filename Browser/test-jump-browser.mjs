import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {stairConnection,stairFlights} from './dist/asylum-stairs.mjs';

const destination=new URL(process.env.JUMP_ARTIFACT_DIR??'./artifacts/jump/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],results={};page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/explore.mjs',async route=>{
  let source=await readFile(new URL('./dist/explore.mjs',import.meta.url),'utf8');
  source=source.replace('const clock=new THREE.Timer();',`window.jumpTest={walker,exterior,input,interior,floors};window.__manualJump=true;const clock=new THREE.Timer();`).replace('else if(input.active)walker.update(dt);','else if(input.active&&!window.__manualJump)walker.update(dt);');
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
 await page.addStyleTag({content:'.desktop-walk-help,#layoutControls{display:none!important}'});
 const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
 const crossings=plan.stairs.flatMap(stair=>stair.connections.map(([lower,upper])=>{
  const [a,b]=stairFlights(stairConnection(stair,lower,upper),plan.floors[lower].elevation,plan.floors[upper].elevation).at(-1);
  return {id:stair.id,lower,upper,x:a[0]+1.35,z:(a[2]+b[2])/2,y:plan.floors[upper].elevation,targetX:a[0],targetY:(a[1]+b[1])/2};
 }));
 // Prepare both storeys through the real streaming gate before exercising
 // the camera/input adapter on the furnished stairwell.
 const exploreCrossing=crossings.find(c=>c.id==='S4');
 await page.evaluate(async c=>{
  const t=window.jumpTest;
  for(const floor of [c.lower,c.upper])await t.interior.loading.prepare({x:c.x,z:c.z,y:t.floors[floor].elevation,floor,outside:false});
  t.walker.setView({position:[c.x,c.y+1.8,c.z],target:[c.targetX,c.y+.8,c.z]});
  Object.assign(t.walker.actor,{floor:c.upper,outside:false});t.interior.update(t.walker.actor);
 },exploreCrossing);
 await page.keyboard.down('KeyW');await walkSteps(60);
 assert((await page.evaluate(()=>window.jumpTest.walker.actor.x))>34.5,'Explore walking stops at the rail');
 await page.keyboard.down('Space');await walkSteps(25);
 await page.screenshot({path:fileURLToPath(new URL('explore-stair-rail-jump.png',destination))});
 await page.evaluate(target=>{const w=window.jumpTest.walker;for(let i=0;i<240&&w.actor.x>target+.03;i++)w.update(1/120)},exploreCrossing.targetX);
 await page.keyboard.up('KeyW');await walkSteps(240);await page.keyboard.up('Space');
 const exploreLanding=await page.evaluate(()=>({...window.jumpTest.walker.actor}));
 assert(Math.abs(exploreLanding.x-exploreCrossing.targetX)<.06&&Math.abs(exploreLanding.y-exploreCrossing.targetY)<.001,'Explore lands on the flight below');
 await page.evaluate(()=>{const {walker,exterior}=window.jumpTest;walker.look(exterior.camera.rotation.y/.002,(exterior.camera.rotation.x+.3)/.002)});
 await page.screenshot({path:fileURLToPath(new URL('explore-stair-rail-landed.png',destination))});results.exploreRail=exploreLanding;
 await page.route('**/game.mjs',async route=>{
  const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace(/if\(state!=='play'\)return;\r?\n if\(artViewing\)/,"if(window.__manualJump&&!window.__jumpStep)return;\n if(state!=='play')return;\n if(artViewing)");
  assert(source.includes('if(window.__manualJump&&!window.__jumpStep)return;'),'The game must advance only through explicit test steps');
  await route.fulfill({contentType:'text/javascript',body:source+`
window.__manualJump=true;
window.jumpGame={get ready(){return ready&&(interiorLoader?.complete??true);},player,keys,get camera(){return camera;},get state(){return state;},get floors(){return floors;},boot(){start();arrivalCutscene.update(3);enemyReleaseAt=Infinity;},pose(x,y,z,floor=0,outside=false){outsideWalker.resetJump();indoorJump.reset();Object.assign(player,{x,y,z,floor,stair:null,outside,verticalTrend:0});yaw=0;pitch=0;keys.clear();state='play';elapsed=0;camera.position.set(x,y+1.65,z);camera.rotation.set(0,0,0);(outside?exterior.scene:scene).add(torch,torchTarget);showFloor();$('arrivalFade').hidden=true;$('result').hidden=true;},step(n){window.__jumpStep=true;for(let i=0;i<n;i++)update(1/120);window.__jumpStep=false;},transfer(){const exit=floors[0].exits[0];escapeProgress.run.exitId=exit.id;escapeProgress.run.serviceKey=true;useDoor(exit);},resetPositions};`});
 });
 await page.goto(base);await page.waitForFunction(()=>window.jumpGame?.ready);await page.evaluate(()=>{window.jumpGame.boot();window.jumpGame.pose(0,0,14);});
 assert((await page.locator('#hud .controls').textContent()).includes('SPACE JUMP'));
 results.escapeRails=[];
 for(const c of crossings){
  await page.evaluate(c=>window.jumpGame.pose(c.x,c.y,c.z,c.upper),c);
  await page.keyboard.down('KeyA');await page.evaluate(()=>window.jumpGame.step(60));
  assert((await page.evaluate(()=>window.jumpGame.player.x))>c.targetX+.65,'Escape walking stops at the rail');
  await page.keyboard.down('Space');await page.evaluate(()=>window.jumpGame.step(25));
  if(c.id==='S4')await page.screenshot({path:fileURLToPath(new URL('escape-stair-rail-jump.png',destination))});
  await page.evaluate(target=>{const t=window.jumpGame;for(let i=0;i<240&&t.player.x>target+.03;i++)t.step(1)},c.targetX);
  await page.keyboard.up('KeyA');await page.evaluate(()=>window.jumpGame.step(240));await page.keyboard.up('Space');
  const landed=await page.evaluate(()=>({...window.jumpGame.player}));
  assert(Math.abs(landed.x-c.targetX)<.06&&Math.abs(landed.y-c.targetY)<.001,`${c.id}/${c.lower}-${c.upper}: real Space input lands on the flight below: ${JSON.stringify(landed)}`);
  if(c.id==='S4')await page.screenshot({path:fileURLToPath(new URL('escape-stair-rail-landed.png',destination))});
  results.escapeRails.push({id:c.id,lower:c.lower,upper:c.upper,landed});
 }
 for(const [name,x,y,z,floor,outside] of [['reception',0,0,14,0,false],['basement',-31.1,-3.2,-7,2,false],['outside',-10,0,60,0,true]]){
  await page.evaluate(args=>window.jumpGame.pose(...args),[x,y,z,floor,outside]);
  await page.keyboard.down('Space');await page.evaluate(()=>window.jumpGame.step(48));
  const peak=await page.evaluate(()=>({...window.jumpGame.player}));assert(peak.y>y+.5);
  await page.screenshot({path:fileURLToPath(new URL('escape-'+name+'-jump.png',destination))});
  await page.evaluate(()=>window.jumpGame.step(120));await page.keyboard.down('Space');await page.evaluate(()=>window.jumpGame.step(60));
  const after=await page.evaluate(()=>({...window.jumpGame.player}));assert(Math.abs(after.y-y)<1e-9);await page.keyboard.up('Space');results[name]={peak,after};
 }
 await page.keyboard.press('KeyP');await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>window.jumpGame.state),'paused');
 await page.keyboard.press('KeyP');await page.waitForFunction(()=>window.jumpGame.state==='play');
 await page.keyboard.press('KeyN');await page.waitForFunction(()=>window.jumpGame.state==='notebook');await page.keyboard.press('Space');
 assert.equal(await page.evaluate(()=>window.jumpGame.player.y),0,'Space in the notebook cannot launch a jump');
 if(await page.evaluate(()=>window.jumpGame.state)!=='play'){await page.keyboard.press('Escape');await page.waitForFunction(()=>window.jumpGame.state==='play');}
 await page.evaluate(()=>window.jumpGame.pose(0,0,14));await page.keyboard.press('Space');await page.evaluate(()=>{window.jumpGame.step(24);window.jumpGame.resetPositions();window.jumpGame.step(1);});assert.equal(await page.evaluate(()=>window.jumpGame.player.y),0,'Restart clears airborne state');
 await page.keyboard.press('Space');await page.evaluate(()=>{window.jumpGame.step(24);window.jumpGame.transfer();window.jumpGame.step(1);});
 assert(await page.evaluate(()=>window.jumpGame.player.outside));
 await page.setViewportSize({width:844,height:390});await page.keyboard.press('KeyH');
 assert((await page.locator('#instructions').textContent()).includes('Jump over small walls and hedges'));
 await page.screenshot({path:fileURLToPath(new URL('escape-help.png',destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({...results,errors},null,2)+'\n');
 console.log('PASS: real Space input in walking and escape, wall/hedge and all eight stair railing crossings, landing on flights, no held-key bouncing, indoor/basement/outside views, pause/notebook, restart/door transfer and help.');
}finally{await browser.close();server.kill();}
