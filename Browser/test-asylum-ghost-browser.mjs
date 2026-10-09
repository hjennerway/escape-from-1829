import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/asylum-ghost/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[];
const instrument=`
window.ghostTest={get ready(){return ready},start,update,
async stage({torchOn=true,distance=3.6}={}){
 start();arrivalCutscene.update(3);state='paused';
 Object.assign(player,{x:35.8,z:-12,y:0,floor:0,outside:false,stair:null});showFloor();
 await interiorLoader.prepare(player);
 const ghost=enemies.find(e=>e.type===2);
 enemies.forEach(e=>{e.mesh.visible=e===ghost;});
 Object.assign(ghost,{x:35.8,z:player.z+distance,y:0,floor:0});
 ghost.mesh.position.set(ghost.x,0,ghost.z);ghost.mesh.rotation.y=Math.PI;resetAsylumGhost(ghost.mesh);updateAsylumGhost(ghost.mesh,1.3);
 camera.position.set(player.x,1.65,player.z);yaw=Math.PI;pitch=0;camera.rotation.set(0,yaw,0);
 torch.visible=torchOn;torch.position.copy(camera.position);torchTarget.position.set(player.x,1.55,ghost.z);interiorLights.update(player);
 renderer.render(scene,camera);
 return {name:ghost.mesh.name,meshes:(()=>{let n=0;ghost.mesh.traverse(o=>{if(o.isMesh)n++;});return n})()};
},
pauseCheck(){const g=enemies.find(e=>e.type===2),before=g.mesh.userData.ghostRig.time;update(1);return {before,after:g.mesh.userData.ghostRig.time};},
restartCheck(){start();return enemies.find(e=>e.type===2).mesh.userData.ghostRig.time;}
};`;
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.ghostTest?.ready);
 const captures=[];
 for(const spec of [{name:'corridor-torch',torchOn:true,distance:3.6},{name:'corridor-dark',torchOn:false,distance:5},{name:'close-face',torchOn:true,distance:1.6}]){
  captures.push(await page.evaluate(spec=>ghostTest.stage(spec),spec));
  await page.screenshot({path:fileURLToPath(new URL(spec.name+'.png',destination))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>ghostTest.stage({distance:3.6}));
 await page.screenshot({path:fileURLToPath(new URL('phone.png',destination))});
 const paused=await page.evaluate(()=>ghostTest.pauseCheck());assert.equal(paused.before,paused.after,'Pause freezes the rig');
 assert.equal(await page.evaluate(()=>ghostTest.restartCheck()),0,'Retry resets the rig');
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({captures,paused,errors},null,2)+'\n');
 console.log('PASS: hardware-rendered ghost in actual corridor, torch/dark/close/phone captures, paused animation and retry reset; no page or shader errors.');
}finally{await browser?.close();server.kill();}
