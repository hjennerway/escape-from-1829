import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const phase=process.argv[2]??'after';
const fixture=await readFile(new URL('../../test-escape-progress-browser.mjs',import.meta.url),'utf8');
const instrument=fixture.match(/const instrument=`([\s\S]*?)`;/)[1]+`
escapeTest.showFloor=showFloor;
escapeTest.clearMessage=()=>{messageUntil=0;interactionMessage='';};
escapeTest.poseLibrary=function(){
 Object.assign(this.player,{...this.world.anchor(3,'R46'),y:this.floors[3].elevation,floor:3,outside:false,stair:null});showFloor();
 yaw=0;pitch=0;camera.position.set(this.player.x,this.player.y+1.65,this.player.z);camera.rotation.set(pitch,yaw,0);this.update(.001);
};
escapeTest.poseRecordDoor=function(){
 const n=this.world.nodes.find(n=>n.id==='plan'),d=this.floors[3].roomDoors.find(d=>d.roomId===n.roomId);
 const origin={x:d.openingX-d.dz*d.roomSide*.9,z:d.openingZ+d.dx*d.roomSide*.9,floor:3,y:this.floors[3].elevation,stair:null,outside:false};
 Object.assign(this.player,origin);showFloor();
 yaw=Math.atan2(-(n.mount.x-origin.x),-(n.mount.z-origin.z));pitch=Math.atan2(n.mount.y-1.65,Math.hypot(n.mount.x-origin.x,n.mount.z-origin.z));
 camera.position.set(origin.x,origin.y+1.65,origin.z);camera.rotation.set(pitch,yaw,0);this.update(.001);
};`;
const {server,base}=await startTestServer();let browser;const errors=[],captures=[],checks=[];
try{
 browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.escapeTest?.ready);
 async function shot(name){await page.screenshot({path:fileURLToPath(new URL(phase+'-'+name+'.png',import.meta.url))});captures.push(name);}
 for(const seed of [1829,10000019]){
  await page.evaluate(seed=>{history.replaceState(null,'','?seed='+seed);const random=Math.random;Math.random=()=>.1829;try{escapeTest.start();}finally{Math.random=random;}escapeTest.arrival.update(3);escapeTest.hold();escapeTest.setTorch(false);},seed);
  await page.evaluate(()=>escapeTest.lookAtNode('staff-key'));await shot(seed+'-staff-key');
  await page.evaluate(async()=>{const t=escapeTest;await t.clue('staff-key');const n=t.world.nodes.find(n=>n.id==='plan');await t.walk({...t.world.anchor(n.floor,n.roomId),floor:n.floor});await t.walk({...n,floor:n.floor});t.clearMessage();t.lookAtNode('plan');});
  await shot(seed+'-record-near');await page.evaluate(()=>escapeTest.poseRecordDoor());await shot(seed+'-record-door');
  if(phase==='after'){
   const before=await page.evaluate(()=>({title:document.getElementById('objectiveTitle').textContent,detail:document.getElementById('objectiveDetail').textContent,office:escapeTest.run.office,glow:escapeTest.world.nodes.find(n=>n.id==='plan').beacon.visible}));
   assert(before.title.includes('brass'));assert(before.detail.includes(before.office==='R49'?'209':'201'));assert(before.glow);checks.push(before);
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>escapeTest.lookAtNode('plan'));await shot(seed+'-phone-record');
  if(phase==='after'){
   const bounds=await page.evaluate(()=>{const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom}};return {objective:document.querySelector('.objective').getBoundingClientRect().toJSON(),notebook:rect('notebookButton'),map:rect('miniMapWrap')}});
   assert(bounds.objective.right<=390&&bounds.objective.x>=0);assert(bounds.objective.bottom<=bounds.map.y,'Objective and minimap do not overlap on phones');checks.push(bounds);
  }
  await page.setViewportSize({width:1280,height:820});
 }
 if(phase==='after'){
  // The Library and Reception top-floor offices are disconnected; the HUD must
  // explain the descent instead of suggesting the player can cross upstairs.
  assert.equal(new Set(checks.filter(c=>c.office).map(c=>c.office)).size,2,'Both real upstairs record locations are reviewed');
  await page.evaluate(()=>{const t=escapeTest;history.replaceState(null,'','?seed=1829');t.start();t.arrival.update(3);t.hold();t.run.opened.add('S5');t.poseLibrary();});
  assert((await page.locator('#objectiveDetail').innerText()).includes('first floor'));await shot('library-other-office');
  await page.setViewportSize({width:390,height:844});await shot('phone-library-other-office');
  const layout=await page.evaluate(()=>({objective:document.querySelector('.objective').getBoundingClientRect().toJSON(),map:document.getElementById('miniMapWrap').getBoundingClientRect().toJSON()}));assert(layout.objective.bottom<=layout.map.y);checks.push(layout);
  await page.setViewportSize({width:740,height:390});await shot('landscape-library-other-office');
  assert(await page.evaluate(()=>document.querySelector('.objective').getBoundingClientRect().right<innerWidth/2),'Landscape objective leaves the centre crosshair clear');
  await page.setViewportSize({width:1280,height:820});
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>window.escapeTest?.ready);
  await page.evaluate(()=>{escapeTest.start();escapeTest.arrival.update(3);escapeTest.lookAtNode('staff-key');});
  const reduced=await page.evaluate(()=>{const t=escapeTest,n=t.world.nodes.find(n=>n.id==='staff-key');t.world.update(0);const before=n.beacon.scale.toArray();t.world.update(1);return {before,after:n.beacon.scale.toArray()}});
  assert.deepEqual(reduced.before,reduced.after);checks.push({reduced});
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL(phase+'-validation.json',import.meta.url),JSON.stringify({captures,checks,errors},null,2)+'\n');
 console.log(phase==='after'?'PASS: hardware views of both record offices, doorway/near/phone glow, objective routing, phone layout and reduced motion.':'Captured baseline objective and glow views.');
}finally{await browser?.close();server.kill();}
