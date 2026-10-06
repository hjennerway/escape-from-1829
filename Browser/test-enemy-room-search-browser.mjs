import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/enemy-room-search/',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;
const errors=[],results=[];
const instrument=`
window.pursuitTest={get ready(){return ready},get state(){return state},get enemies(){return enemies},get time(){return elapsed},player,keys,start,update,openNotebook,closeNotebook,
stage(type,{close=false,headStart=false}={}){
 start();arrivalCutscene.update(3);state='paused';
 furnishAsylum(floors,{seed:1829});furnitureFloors.forEach(f=>f.update());
 Object.assign(player,{x:35.8,z:close?-9:-21.4,y:0,floor:0,outside:false,stair:null});showFloor();
 for(const e of enemies){resetEnemyRoomSearch(e);Object.assign(e,{floor:1,x:-35.8,z:-6,y:4.2,stair:null,path:[],memory:0,target:null,rethink:Infinity});}
 const enemy=enemies.find(e=>e.type===type);Object.assign(enemy,{floor:0,x:35.8,z:-6,y:0,rethink:0});enemy.mesh.position.set(enemy.x,enemy.y,enemy.z);enemy.mesh.visible=true;
 elapsed=headStart?0:6;enemyReleaseAt=5;stamina=1;torch.visible=false;yaw=Math.PI;pitch=0;keys.clear();camera.position.set(player.x,1.65,player.z);camera.rotation.set(pitch,yaw,0);drawMap();return enemy;
},
step(count=1){state='play';for(let i=0;i<count&&state==='play';i++)update(.04);if(state==='play')state='paused'},
enterRoom(type){const enemy=enemies.find(e=>e.type===type);for(let i=0;i<500&&enemy.roomSearch?.phase!=='wait';i++)this.step();return {phase:enemy.roomSearch?.phase,room:enemy.roomSearch?.roomId,position:[enemy.x,enemy.y,enemy.z],state}},
pass(type){const enemy=enemies.find(e=>e.type===type),before=[enemy.x,enemy.z];keys.add('ShiftLeft');keys.add('KeyW');for(let i=0;i<200&&player.z<3&&state==='paused';i++)this.step();keys.clear();return {before,after:[enemy.x,enemy.z],player:[player.x,player.z],phase:enemy.roomSearch?.phase,remaining:enemy.roomSearch?.remaining,state}},
expire(type){const enemy=enemies.find(e=>e.type===type);for(let i=0;i<160&&enemy.roomSearch;i++)this.step();return {search:enemy.roomSearch,cooldown:enemy.roomSearchCooldown,memory:enemy.memory}},
pose(){state='paused';camera.position.set(35.8,1.65,-12);camera.rotation.set(0,Math.PI,0);},
intrude(type){const e=enemies.find(e=>e.type===type);Object.assign(player,{x:e.x,z:e.z,y:e.y,floor:e.floor});this.step();return state}
};`;
try{
 browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.pursuitTest?.ready);
 for(const [type,name] of [[1,'guard'],[2,'ghost']]){
  const headStart=await page.evaluate(type=>{const t=pursuitTest,e=t.stage(type,{headStart:true}),before=[e.x,e.z];t.step();return {before,after:[e.x,e.z],search:e.roomSearch};},type);
  assert.deepEqual(headStart.after,headStart.before);assert.equal(headStart.search,null);
  const close=await page.evaluate(type=>{const t=pursuitTest,e=t.stage(type,{close:true}),before=[e.x,e.z];t.step();return {before,after:[e.x,e.z],search:e.roomSearch,memory:e.memory};},type);
  assert.equal(close.search,null,'Close NPC keeps pursuing');assert.notDeepEqual(close.after,close.before);assert.equal(close.memory,5);
  await page.evaluate(type=>pursuitTest.stage(type),type);
  const entered=await page.evaluate(type=>pursuitTest.enterRoom(type),type);
  assert.equal(entered.state,'paused');assert.equal(entered.phase,'wait','Actual game NPC must enter a room');assert.equal(entered.room,'R14');
  const freeze=await page.evaluate(()=>{
   const t=pursuitTest,snapshot=()=>JSON.stringify({time:t.time,player:t.player,enemies:t.enemies.map(e=>({x:e.x,z:e.z,search:e.roomSearch}))});
   t.closeNotebook(false);t.step(1);t.openNotebook();const before=snapshot();t.update(10);const after=snapshot();t.closeNotebook(false);t.pose();return {before,after};
  });
  assert.equal(freeze.after,freeze.before,'Notebook freezes room timers and movement');
  await page.screenshot({path:fileURLToPath(new URL(name+'-in-room.png',destination))});
  const passing=await page.evaluate(type=>pursuitTest.pass(type),type);
  assert.equal(passing.state,'paused','Player passes without capture');assert(passing.player[1]>=3,'Actual sprint input passes the doorway');
  assert.deepEqual(passing.after,passing.before,'NPC stays in room throughout the pass');assert.equal(passing.phase,'wait');assert(passing.remaining>0);
  await page.screenshot({path:fileURLToPath(new URL(name+'-passed.png',destination))});
  const expired=await page.evaluate(type=>pursuitTest.expire(type),type);
  assert.equal(expired.search,null,'NPC resumes after the search');assert(expired.cooldown>0);
  await page.evaluate(type=>pursuitTest.stage(type),type);await page.evaluate(type=>pursuitTest.enterRoom(type),type);
  assert.equal(await page.evaluate(type=>pursuitTest.intrude(type),type),'captured','Entering an occupied room can still cause capture');
  const reset=await page.evaluate(()=>{pursuitTest.start();return pursuitTest.enemies.map(e=>({search:e.roomSearch,cooldown:e.roomSearchCooldown}));});
  assert(reset.every(e=>e.search===null&&e.cooldown===0),'Retry clears room searches');
  results.push({name,headStart,close,entered,passing,expired});
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2)+'\n');
 console.log('PASS: real GPU game loop, guard and ghost enter R14, close pursuit/head start, frozen Notebook search timers, actual sprint past both without capture, six-second expiry, occupied-room capture and retry reset.');
}finally{await browser?.close();server.kill();}
