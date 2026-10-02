import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const destination=new URL('./artifacts/outside-traps/',import.meta.url),port=1871;
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1400,height:850}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.outsideTest={get ready(){return ready;},get walker(){return outsideWalker;},get player(){return player;},boot(){start();arrivalCutscene.update(3);state='paused';},pose(x,y,z){Object.assign(player,{x,y,z,floor:2,outside:true,stair:null,verticalTrend:0});yaw=-Math.PI/2;pitch=-.2;state='paused';keys.clear();exterior.scene.add(torch,torchTarget);showFloor();camera.position.set(x,y+1.65,z);camera.rotation.set(pitch,yaw,0);$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;drawMap();},step(dx,dz,dt=.025){keys.clear();if(dx||dz){yaw=Math.atan2(-dx,-dz);keys.add('KeyW');}state='play';update(dt);state='paused';keys.clear();},look(angle,tilt=0){yaw=angle;pitch=tilt;camera.rotation.set(pitch,yaw,0);}};` }));
 await page.goto(`http://127.0.0.1:${port}`);
 await page.waitForFunction(()=>window.outsideTest?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.outsideTest.boot());
 const result=await page.evaluate(()=>{
  const t=window.outsideTest,trace=[];
  function clear(){if(!t.walker.clear(t.player.x,t.player.z,t.player.y))throw Error('Player embedded '+JSON.stringify(t.player));}
  function go(x,z){for(let i=0;i<2500&&Math.hypot(t.player.x-x,t.player.z-z)>.025;i++){const dx=x-t.player.x,dz=z-t.player.z;t.step(dx,dz,Math.min(.025,Math.hypot(dx,dz)/3.1));clear();}if(Math.hypot(t.player.x-x,t.player.z-z)>.03)throw Error('Unreachable route point '+x+','+z);trace.push({x:t.player.x,y:t.player.y,z:t.player.z});}
  t.pose(-42.6,0,-35.6);
  for(let i=0;i<120;i++){t.step(1,0);clear();}
  const edge={x:t.player.x,y:t.player.y,z:t.player.z};
  go(t.player.x,-34.7);go(-38.7,-34.7);go(-38.7,-25);go(-38.1,-25);go(-38.1,-1.8);go(-38.1,-25);go(-38.7,-25);go(-38.7,-34.7);go(-42.6,-34.7);
  t.pose(-41.53,-.43566666666666665,-35.6);t.step(0,0);clear();const recovered={x:t.player.x,y:t.player.y,z:t.player.z};go(t.player.x,-34.7);go(-38.7,-34.7);
  return {edge,recovered,trace};
 });
 await page.evaluate(()=>{const t=window.outsideTest;t.pose(-40.6,t.walker.heightAt(-40.6,-35.25,0),-35.25);t.look(-Math.PI/2,-.22);});
 await page.screenshot({path:fileURLToPath(new URL('west-rear-door.png',destination))});
 await page.evaluate(()=>{const t=window.outsideTest;t.pose(-40.8,t.walker.heightAt(-40.8,-34.7,0),-34.7);t.look(Math.PI/2,-.2);});
 await page.screenshot({path:fileURLToPath(new URL('west-stair-return.png',destination))});
 await page.setViewportSize({width:844,height:390});
 await page.screenshot({path:fileURLToPath(new URL('west-stair-mobile.png',destination))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({...result,errors},null,2)+'\n');
 console.log('PASS: actual game loop walks the west stair edge, complete basement passage and return, recovers an old trapped pose, and renders desktop/mobile views without runtime errors.');
}finally{await browser.close();server.kill();}
