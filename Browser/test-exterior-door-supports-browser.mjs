import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL('./artifacts/door-supports/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const errors=[],report=[];
 for(const phase of (process.argv.includes('--after-only')?['after']:['before','after'])){
  const page=await browser.newPage({viewport:{width:1200,height:760},reducedMotion:'reduce'});page.setDefaultTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',route=>route.abort());
  if(phase==='before')for(const name of ['entrance-west-photo-detail.mjs','escape-exterior.mjs','annexe.mjs','churton-ward.mjs','main-kitchen.mjs','garages-mortuary.mjs'])await page.route('**/'+name,async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-'+name,destination),'utf8')}));
  await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.doorCheck={THREE,get ready(){return ready;},get exterior(){return exterior;},get walker(){return outsideWalker;},boot(){start();arrivalCutscene.update(3);state='paused';torch.visible=false;exterior.lighting.setMode('day');},pose(position,target){Object.assign(player,{x:position[0],y:position[1]-1.65,z:position[2],floor:0,outside:true,stair:null,verticalTrend:0});state='paused';keys.clear();showFloor();camera.position.set(...position);camera.lookAt(...target);yaw=camera.rotation.y;pitch=camera.rotation.x;$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
  await page.goto(base);await page.waitForFunction(()=>window.doorCheck?.ready);await page.evaluate(()=>window.doorCheck.boot());
  await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
  const shots=[
   ['front-west-recess',[-9.8,.85,20.3],[-11.55,.45,17.38]],
   ['front-west-projection',[-24.4,.85,22.6],[-26.15,.45,19.78]],
   ['front-east-recess',[9.8,.85,20.3],[11.55,.45,17.38]],
   ['front-east-projection',[24.4,.85,22.6],[26.15,.45,19.78]],
   ['front-path-contact',[-13.5,.65,18.8],[-11.55,.2,17.38]],
   ['reception',[1.5,3.6,24.2],[0,2.7,19.9]],
   ['kitchen',[116.8,1.6,-2.3],[120,.7,-.3]],
   ['garages',[195,1.4,105.5],[192.6,1,110.2]],
  ];
  const annexe=await page.evaluate(()=>{const {THREE,exterior}=window.doorCheck;const group=exterior.annexe.getObjectByName('West mirrored side details'),landing=group.getObjectByName('Fire stair landing');const p=new THREE.Vector3(-29.15,6.1,-.2).applyMatrix4(group.matrixWorld),n=new THREE.Vector3(-1,0,0).transformDirection(group.matrixWorld),right=new THREE.Vector3(n.z,0,-n.x);return {position:p.clone().addScaledVector(n,6).addScaledVector(right,2).toArray(),target:p.toArray()};});
  shots.push(['annexe-fire-door',annexe.position,annexe.target]);
  for(const [name,position,target] of shots){await page.evaluate(({position,target})=>window.doorCheck.pose(position,target),{position,target});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(phase+'-'+name+'.png',destination))});}
  if(phase==='after'){
   const walks=await page.evaluate(()=>{const {walker}=window.doorCheck,result=[];for(const side of [-1,1]){
    const route=[[31.6,20.7],[26.15,20.7],[21.6,20.7],[21.6,18.3],[8.1,18.3],[8.1,20.6],[5.24,20.6],[5.24,24.5]].map(([x,z])=>[x*side,z]),actor={x:route[0][0],y:0,z:route[0][1]};
    for(const points of [route.slice(1),[...route].reverse().slice(1)])for(const [x,z] of points){for(let i=0;i<5000&&Math.hypot(actor.x-x,actor.z-z)>.025;i++){const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.04,d);walker.update(actor,dx/d*step,dz/d*step,.02);if(!walker.clear(actor.x,actor.z,actor.y))throw Error('Embedded player');}if(Math.hypot(actor.x-x,actor.z-z)>.04)throw Error('Blocked front walk');}result.push({...actor});}return result;});
   report.push({walks});
   await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.doorCheck.pose([-13.5,.65,18.8],[-11.55,.2,17.38]));await page.screenshot({path:fileURLToPath(new URL('after-front-mobile.png',destination))});
   await page.setViewportSize({width:1200,height:760});await page.evaluate(()=>{window.doorCheck.exterior.lighting.setMode('night');window.doorCheck.pose([-9.8,.85,20.3],[-11.55,.45,17.38]);});await page.screenshot({path:fileURLToPath(new URL('after-front-night.png',destination))});
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('browser-validation.json',destination),JSON.stringify({report,errors},null,2)+'\n');
 console.log('PASS: doorway views, front walks in both directions, desktop/mobile/night and no page/shader errors.');
}finally{await browser?.close();server.kill();}
