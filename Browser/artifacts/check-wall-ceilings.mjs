import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'after',port=1872,destination=new URL('./wall-ceilings/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.ceilingCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz,tilt=.10){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=tilt;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},probe(){scene.updateMatrixWorld(true);return [[-.22,.42],[0,.42],[.22,.42]].map(p=>{const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(...p),camera);return ray.intersectObjects(floorGroups,true).slice(0,4).map(h=>({name:h.object.name,point:h.point.toArray(),instance:h.instanceId}));});}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.ceilingCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.ceilingCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[
  ['basement-exit',-9,16.4,2,-12.9,16.1],
  ['basement-exit-reverse',-14.2,16.5,2,-10,16.5],
  ['basement-S1',-9,14.2,2,-13,16.9],
  ['basement-S5',-26.3,17.7,2,-30,15.2],
  ['ground-S1',-9,16.4,0,-12.9,16.1],
  ['first-S1',-9,16.4,1,-12.9,16.1],
 ];
 const probes=[];
 for(const [name,...pose] of views){
  await page.evaluate(pose=>window.ceilingCheck.pose(...pose),pose);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',destination))});
  probes.push({name,hits:await page.evaluate(()=>window.ceilingCheck.probe())});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.ceilingCheck.pose(-9,16.4,2,-12.9,16.1));
 await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(mode+'-validation.json',destination),JSON.stringify({errors,views:views.length+1,probes},null,2)+'\n');
 console.log(`PASS: ${views.length+1} actual-game wall/ceiling views, desktop/mobile and no page or shader errors.`);
}finally{await browser.close();server.kill();}
