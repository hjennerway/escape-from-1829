import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const destination=new URL('./artifacts/room-finishes/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],captures=[];
try{
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.finishTest={get ready(){return ready;},get groups(){return floorGroups;},get floors(){return floors;},get renderer(){return renderer;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz,tilt=-.08){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=tilt;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.finishTest?.ready);await page.evaluate(()=>window.finishTest.start());
 await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const resources=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=window.finishTest,maps=new Set(),colours=new Set(),floors=[];
  for(const [i,g] of t.groups.entries()){
   const wall=g.getObjectByName('Asylum Plaster'),shader={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};wall.material.onBeforeCompile(shader);
   maps.add(shader.uniforms.roomWallpaperMap.value);maps.add(shader.uniforms.roomPaintMap.value);
   const attr=wall.geometry.attributes.roomFinish;for(let k=0;k<attr.count;k++)if(attr.getX(k)>0)colours.add(attr.getX(k));
   floors.push({floor:i,rail:g.getObjectByName('Asylum Dado').geometry.userData,walls:wall.geometry.attributes.position.count/3,brick:g.getObjectByName('Asylum Brick').geometry.attributes.position.count/3});
  }
  return {maps:maps.size,colours:[...colours].sort(),floors,textureSizes:[...maps].map(m=>[m.image.width,m.image.height])};
 });
 assert.equal(resources.maps,2,'Every colour and floor shares the same two finish maps');assert.deepEqual(resources.colours,[1,2,3]);assert(resources.textureSizes.every(s=>s[0]===512&&s[1]===512));
 async function shot(name,pose){
  if(pose)await page.evaluate(p=>window.finishTest.pose(...p),pose);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
  captures.push(await page.evaluate(name=>({name,calls:window.finishTest.renderer.info.render.calls,triangles:window.finishTest.renderer.info.render.triangles}),name));
 }
 for(const [name,...pose] of [
  ['rose-nursing',-29.5,-7,0,-29.5,-10.8],['sage-dayroom',-28,2,0,-30,-3.1],
  ['blue-dormitory',-28,-14,0,-28,-18.2],['upstairs-bedroom',-29,-21,1,-30,-24.6],
  ['corridor-retained',-20.5,7.2,0,-20.5,12],['treatment-retained',-29,-21,0,-30,-24.6],
  ['bay-library',53.1,17.35,1,53.1,21],['basement-workshop',-34.7,-2,2,-34.7,1.3],
  ['basement-mural',-34.65,3,2,-34.65,1.39],
  ['upper-office',5.3,8.1,3,5.3,4.4],['rail-close',-29,-9.6,0,-29,-10.8,-.2]
 ])await shot(name,pose);
 await page.setViewportSize({width:390,height:844});await shot('bedroom-mobile',[-29,-21,1,-30,-24.6]);
 // The standalone tile makes the ornament and seamless wrap inspectable.
 const tile=await page.evaluate(async()=>{const {paintRoomWallpaper}=await import('/room-finish-textures.mjs'),c=document.createElement('canvas');c.width=c.height=512;paintRoomWallpaper(c.getContext('2d'),512);return c.toDataURL('image/png').split(',')[1];});
 await writeFile(new URL('wallpaper-tile.png',destination),Buffer.from(tile,'base64'));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.finishExplore={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1280,height:800});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.finishExplore?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'.explore-guide{display:none}'});
 await page.evaluate(()=>{const {walker,floors}=window.finishExplore;Object.assign(walker.actor,{x:-29,z:-21,floor:1,y:floors[1].elevation,outside:false,stair:null});walker.look(Math.atan2(1,3.6),-.08);walker.update(.01);document.getElementById('layoutControls').open=false;});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:fileURLToPath(new URL('exploration-bedroom.png',destination))});
 const explore=await page.evaluate(()=>window.finishExplore.floors.map(f=>{const g=window.finishExplore.interior.scene.children.find(g=>g.name===f.name);return {floor:f.id,rail:g.getObjectByName('Asylum Dado').geometry.userData,walls:g.getObjectByName('Asylum Plaster').geometry.attributes.position.count/3,brick:g.getObjectByName('Asylum Brick').geometry.attributes.position.count/3};}));
 assert.deepEqual(explore,resources.floors,'Escape and Explore use matching room finishes');assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({resources,captures,explore,errors},null,2)+'\n');
 console.log('PASS: three wallpaper tints, two shared 512px maps, one rail batch per floor, matching Escape/Explore, desktop/mobile captures, no page/shader errors.');
}finally{await browser.close();server.kill();}
