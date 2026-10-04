// Repeatable visual review of the owner-supplied artwork in both browser modes.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const out=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:root,windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],captures=[],checks=[];
const exploreOnly=process.argv.includes('--explore-only');
if(exploreOnly){const previous=JSON.parse(await readFile(new URL('validation.json',out),'utf8'));checks.push(...previous.checks.filter(c=>c.mode==='escape'));captures.push(...previous.captures.filter(c=>c.startsWith('escape-')));}
try{
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('Browser/dist/game.mjs',root),'utf8'))+`
 window.artworkTest={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},start,get arrival(){return arrivalCutscene;},pose(x,z,tx,tz,ty){Object.assign(player,{x,z,floor:1,y:floors[1].elevation,outside:false,stair:null});yaw=Math.atan2(-(tx-x),-(tz-z));pitch=Math.atan2(ty-1.65,Math.hypot(tx-x,tz-z));camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();for(const e of enemies)e.mesh.visible=false;$('arrivalFade').hidden=true;}};` }));
 await page.route('**/explore.mjs',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();',`window.artworkExplore={floors,interior,walker,exterior,renderer};const clock=new THREE.Timer();`)});});
 async function textureCheck(mode){
  await page.waitForFunction(()=>{const t=window.artworkTest??window.artworkExplore,scene=t.scene??t.interior.scene;let ready=false;scene.traverse(m=>{if(m.material?.name==='Hall landscape'&&m.material.map?.userData.artwork)ready=true;});return ready;});
  checks.push(await page.evaluate(async mode=>{
   const t=window.artworkTest??window.artworkExplore,scene=t.scene??t.interior.scene,maps=new Set(),ids=new Set();scene.traverse(m=>{if(m.material?.name==='Hall landscape'){maps.add(m.material.map);for(const id of m.userData.furnitureIds??[])ids.add(id);}});
   if(maps.size!==1||ids.size!==2)throw Error('Both existing frames must share one artwork texture');
   const map=[...maps][0],canvas=map.image,image=new Image();image.src=map.userData.artwork.url;await image.decode();
   const expected=document.createElement('canvas');expected.width=canvas.width;expected.height=canvas.height;const ctx=expected.getContext('2d');ctx.fillStyle='#eeece7';ctx.fillRect(0,0,expected.width,expected.height);
   const scale=Math.min(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
   const actual=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,reference=ctx.getImageData(0,0,canvas.width,canvas.height).data;for(let i=0;i<actual.length;i++)if(actual[i]!==reference[i])throw Error('Artwork pixel mismatch '+i);
   return {mode,frames:[...ids],sharedTextures:maps.size,source:[image.naturalWidth,image.naturalHeight],canvas:[canvas.width,canvas.height],completeImage:true,pixelMatch:true};
  },mode));
 }
 async function capture(mode,name,pose){
  await page.evaluate(([mode,p])=>{
   if(mode==='escape')window.artworkTest.pose(...p);
   else{const t=window.artworkExplore,[x,z,tx,tz,ty]=p;Object.assign(t.walker.actor,{x,z,floor:1,y:t.floors[1].elevation,outside:false,stair:null});const yaw=Math.atan2(-(tx-x),-(tz-z)),pitch=Math.atan2(ty-1.8,Math.hypot(tx-x,tz-z));t.walker.look((t.exterior.camera.rotation.y-yaw)/.002,(t.exterior.camera.rotation.x-pitch)/.002);t.walker.update(.01);}
  },[mode,pose]);await page.waitForTimeout(500);const file=mode+'-'+name+'.png';await page.screenshot({path:fileURLToPath(new URL(file,out))});captures.push(file);
 }
 const west=[-5.5,13.1,-6.9775,13.1,2.17],east=[5.5,16,6.9775,16,2.05];
 for(const mode of exploreOnly?['explore']:['escape','explore']){
  await page.setViewportSize({width:1200,height:800});await page.goto(base+(mode==='escape'?'/':'/explore.html'));
  if(mode==='escape'){await page.waitForFunction(()=>window.artworkTest?.ready);await page.evaluate(()=>{window.artworkTest.start();window.artworkTest.arrival.update(3);});}
  else await page.waitForFunction(()=>window.artworkExplore?.renderer.info.render.frame>2);
  if(mode==='explore')await page.addStyleTag({content:'.explore-guide,#layoutControls,#exploreDoor{display:none!important}'});
  await textureCheck(mode);await capture(mode,'west-frame',west);await capture(mode,'east-frame',east);await capture(mode,'hall',[-3,15,-6.9775,13.1,1.85]);
  await page.setViewportSize({width:390,height:844});await capture(mode,'mobile-west-frame',[mode==='explore'?-3:-4.6,13.1,-6.9775,13.1,2.17]);
 }
 assert.deepEqual(errors,[]);const sourceHash=await modelSourceHash(),manifest=JSON.parse(await readFile(new URL('Browser/dist/compiled/manifest.json',root),'utf8'));
 await writeFile(new URL('validation.json',out),JSON.stringify({checks,captures,errors,aerial:{sourceHash,manifestHash:manifest.sourceHash,matches:sourceHash===manifest.sourceHash}},null,2)+'\n');
 console.log('PASS: both frames share the supplied complete engraving in Escape and Explore; exact texture pixels, preserved proportions, desktop/mobile captures and no runtime/shader errors.');
}finally{await browser.close();server.kill();}
