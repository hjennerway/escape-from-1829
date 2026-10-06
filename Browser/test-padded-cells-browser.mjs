import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/padded-cells/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const errors=[],captures=[];
try{
 browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.cellTest={get ready(){return ready;},get groups(){return floorGroups;},get floors(){return floors;},get renderer(){return renderer;},start(){start();arrivalCutscene.update(3);},pose(id,close=false){const r=floors[2].rooms.find(r=>r.id===id);let [x,z]=r.label;const tx=['B6','B8'].includes(id)?Math.max(...r.points.map(p=>p[0])):Math.min(...r.points.map(p=>p[0])),tz=Math.min(...r.points.map(p=>p[1]));if(close){x=tx+.9;z=tz+1.1;}Object.assign(player,{x,z,floor:2,y:floors[2].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.18;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.cellTest?.ready);await page.evaluate(()=>window.cellTest.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const cells=await page.evaluate(()=>{const t=window.cellTest,pad=t.groups[2].getObjectByName('Asylum Cell Padding');return {rooms:pad.geometry.userData.rooms.sort(),vertices:pad.geometry.attributes.position.count,names:t.floors[2].rooms.filter(r=>pad.geometry.userData.rooms.includes(r.id)).map(r=>[r.id,r.name]),mattresses:t.floors[2].furniture.filter(i=>i.kind==='cellMattress')};});
 assert.deepEqual(cells.rooms,['B5','B6','B7','B8']);assert(cells.vertices>0);assert.equal(cells.mattresses.length,4);assert(cells.names.every(([,name])=>name==='Padded cell · patient confinement'));
 async function shot(name){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});captures.push(name);}
 for(const id of cells.rooms){await page.evaluate(id=>window.cellTest.pose(id),id);await shot('escape-'+id);}
 await page.evaluate(()=>window.cellTest.pose('B5',true));await shot('padding-close');await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.cellTest.pose('B8'));await shot('escape-mobile-B8');
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.cellExplore={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1280,height:800});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.cellExplore?.renderer.info.render.frame>2);await page.addStyleTag({content:'.explore-guide,#controls,#nav,header{display:none!important}'});
 const explore=await page.evaluate(()=>{const {interior,floors}=window.cellExplore,g=interior.scene.children.find(g=>g.name===floors[2].name),pad=g.getObjectByName('Asylum Cell Padding');return {vertices:pad.geometry.attributes.position.count,mattresses:floors[2].furniture.filter(i=>i.kind==='cellMattress')};});
 assert.equal(explore.vertices,cells.vertices);assert.deepEqual(explore.mattresses,cells.mattresses,'Both modes share actual cell furnishings and padding');
 for(const id of ['B5','B8']){await page.evaluate(id=>{const {walker,floors}=window.cellExplore,r=floors[2].rooms.find(r=>r.id===id),[x,z]=r.label;Object.assign(walker.actor,{x,z,floor:2,y:floors[2].elevation,outside:false,stair:null});walker.look(-Math.atan2(x-(['B6','B8'].includes(id)?Math.max(...r.points.map(p=>p[0])):Math.min(...r.points.map(p=>p[0]))),z-Math.min(...r.points.map(p=>p[1])))/.002,0);walker.update(.01);document.getElementById('layoutControls').open=false;},id);await shot('explore-'+id);}
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({cells,explore,captures,errors},null,2)+'\n');
 console.log('PASS: four padded cells and matching mattresses in Escape/Explore, desktop/mobile and close-up captures, no page/shader errors.');
}finally{await browser?.close();server.kill();}
