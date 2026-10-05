import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/door-surrounds/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1383,height:816}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
import {flatWalkable as surroundWalkable} from './asylum-layout.mjs';
window.surroundCheck={get ready(){return ready;},get doors(){return floors.flatMap(f=>f.exits.map(e=>({id:e.id,floor:f.id})));},
 start(){start();arrivalCutscene.update(3);},
 pose(floor,id,u=0){const e=floors[floor].exits.find(e=>e.id===id),offset=e.wallOpening.offset??0,inset=e.wallOpening.inset??0;
 const nx=e.axis==='x'?e.facing:0,nz=e.axis==='z'?e.facing:0,cx=e.worldX-nx*inset+(e.axis==='z'?offset:0),cz=e.worldZ-nz*inset+(e.axis==='x'?offset:0);
 Object.assign(player,{floor,y:floors[floor].elevation});showFloor();scene.updateMatrixWorld(true);
 let x,z,clear=false;
 for(const distance of [3.5,2.5,1.75,1.1,.8]){x=cx-nx*distance+nz*u;z=cz-nz*distance-nx*u;if(!surroundWalkable(floors[floor],x,z))continue;
 const sight=new THREE.Vector3(cx-x,0,cz-z),ray=new THREE.Raycaster(new THREE.Vector3(x,player.y+1.65,z),sight.clone().normalize());ray.far=sight.length()+.1;
 if(['Asylum Panel','Asylum EntrancePaint','Asylum EntranceInset'].includes(ray.intersectObjects(floorGroups[floor].children,true)[0]?.object.name)){clear=true;break;}}
 if(!clear)throw new Error(id+' floor '+floor+': no clear walking position for the door review');
 Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-cx,z-cz);pitch=.01;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;
 scene.updateMatrixWorld(true);const ray=new THREE.Raycaster(new THREE.Vector3(cx-nx*.4,player.y+2.96,cz-nz*.4),new THREE.Vector3(nx,0,nz));ray.far=.6;return ray.intersectObjects(floorGroups[floor].children,true)[0]?.object.name;},
 trip(floor,id){const e=floors[floor].exits.find(e=>e.id===id);this.pose(floor,id);Object.assign(player,{x:e.inside.x,z:e.inside.z});state='play';keys.clear();update(.01);keys.add('KeyE');update(.04);const outside=player.outside,position=[player.x,player.y,player.z];update(.04);const latched=player.outside;keys.delete('KeyE');update(.04);keys.add('KeyE');update(.04);const returned=!player.outside&&player.floor===floor;keys.clear();state='paused';return {outside,latched,returned,position,expected:e.destination};}
};`}));
 await page.goto(base);await page.waitForFunction(()=>window.surroundCheck?.ready);
 await page.evaluate(()=>window.surroundCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const doors=await page.evaluate(()=>window.surroundCheck.doors),results=[];
 for(const {floor,id} of doors){
  const sign=await page.evaluate(([floor,id])=>window.surroundCheck.pose(floor,id),[floor,id]);
  if(id!=='D1')assert.equal(sign,'Illuminated exit route sign',`${id} floor ${floor}: sign is in front of the restored masonry`);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(`${floor}-${id}.png`,destination))});
  const trip=await page.evaluate(([floor,id])=>window.surroundCheck.trip(floor,id),[floor,id]);
  assert(trip.outside&&trip.latched&&trip.returned,`${id} floor ${floor}: E round trip and release latch`);assert.deepEqual(trip.position,trip.expected);
  results.push({floor,id,sign,trip});
 }
 for(const [floor,id] of [[0,'F3'],[0,'D8'],[2,'D11']]){
  await page.evaluate(([floor,id])=>window.surroundCheck.pose(floor,id,.6),[floor,id]);
  await page.screenshot({path:fileURLToPath(new URL(`${floor}-${id}-oblique.png`,destination))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.surroundCheck.pose(0,'F3'));
 await page.screenshot({path:fileURLToPath(new URL('mobile.png',destination))});
 assert.deepEqual(errors,[]);assert.equal(results.length,24);
 await writeFile(new URL('validation.json',destination),JSON.stringify({results,views:27,errors},null,2)+'\n');
 console.log('PASS: all 24 exit surrounds rendered, 23 visible signs, 24 E round trips with release latch, desktop/oblique/mobile captures, no page or shader errors.');
}finally{await browser.close();server.kill();}
