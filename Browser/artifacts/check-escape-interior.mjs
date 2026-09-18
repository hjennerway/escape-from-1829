import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=1848,mode=process.argv[2]||'after';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error'&&msg.text().includes('THREE'))errors.push(msg.text());});
 await page.route('https://**/*',async route=>{
  if(route.request().url().startsWith('https://cdn.jsdelivr.net/'))await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/vendor/'+route.request().url().split('/').at(-1),import.meta.url),'utf8')});
  else await route.abort();
 });
 if(mode==='before')await page.route('**/architecture.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('./escape-interior-before-architecture.mjs.txt',import.meta.url),'utf8')}));
 await page.route('**/game.mjs',async route=>{
  const source=await readFile(new URL(mode==='before'?'./escape-interior-before-game.mjs.txt':'../dist/game.mjs',import.meta.url),'utf8');
  await route.fulfill({contentType:'text/javascript',body:source+`\nwindow.escapeTest={get ready(){return ready;},player,keys,get floors(){return floors;},showFloor,update,start,get arrival(){return arrivalCutscene;},get renderer(){return renderer;},get scene(){return scene;},get camera(){return camera;},get artPanels(){return artPanels;},pose(x,z,floor,angle,tilt=0){Object.assign(player,{x,z,floor});showFloor();yaw=angle;pitch=tilt;camera.position.set(x,floor*FLOOR_HEIGHT+1.65,z);state='play';elapsed=0;keys.clear();keys.add('KeyE');update(.001);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('interact').hidden=true;},torch(on){torch.visible=on;}};`});
 });
 await page.goto(`http://127.0.0.1:${port}`);
 await page.waitForFunction(()=>window.escapeTest?.ready,null,{timeout:120000});
 await page.locator('#start').click();
 await page.evaluate(()=>window.escapeTest.arrival.update(3));
 const results=[];
 for(const [name,pose] of [
  ['reception',[50,47.5,0,0]],
  ['gallery',[48,47.5,0,Math.PI/2]],
  ['corridor',[51,42,0,-.14]],
  ['window',[51,40,0,-Math.PI/2]],
  ['upper',[51,32,1,-.10]],
 ]){
  await page.evaluate(args=>window.escapeTest.pose(...args),pose);
  await page.evaluate(()=>new Promise(resolve=>{let n=0;function frame(){if(++n===4)resolve();else requestAnimationFrame(frame);}requestAnimationFrame(frame);}));
  await page.screenshot({path:`Browser/artifacts/escape-interior-${mode}-${name}.png`});
  results.push(await page.evaluate(name=>({name,calls:window.escapeTest.renderer.info.render.calls,triangles:window.escapeTest.renderer.info.render.triangles}),name));
 }
 await page.evaluate(()=>{window.escapeTest.pose(51,42,0,-.14);window.escapeTest.torch(false);});
 await page.screenshot({path:`Browser/artifacts/escape-interior-${mode}-torch-off.png`});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:`Browser/artifacts/escape-interior-${mode}-mobile.png`});
 // Hold-E stair transfer still operates in the real renderer.
 await page.evaluate(()=>{const t=window.escapeTest,s=t.floors[0].stairs[0];t.pose(s.x*2.5,s.z*2.5,0,0);t.start();t.arrival.update(3);Object.assign(t.player,{x:s.x*2.5,z:s.z*2.5});t.keys.add('KeyE');for(let i=0;i<22;i++)t.update(.04);});
 assert.equal(await page.evaluate(()=>window.escapeTest.player.floor),1);
 assert.deepEqual(errors,[]);
 await writeFile(`Browser/artifacts/escape-interior-${mode}.json`,JSON.stringify({results,errors},null,2)+'\n');
 console.log(JSON.stringify({results,errors},null,2));
}finally{await browser.close();server.kill();}
