import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]||'after',port=1847;
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1000,height:700}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 page.on('console',msg=>{if(msg.type()==='error')console.error(msg.text());});
 page.on('requestfailed',req=>console.error(req.url(),req.failure()));
 await page.route('https://**/*',async route=>{
  if(route.request().url().startsWith('https://cdn.jsdelivr.net/')){
   await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/vendor/'+route.request().url().split('/').at(-1),import.meta.url),'utf8')});
  }else await route.abort();
 });
 await page.route('**/game.mjs',async route=>{
  const source=await readFile(new URL(mode==='before'?'./escape-performance-before.mjs':'../dist/game.mjs',import.meta.url),'utf8');
  await route.fulfill({contentType:'text/javascript',body:source+`\nwindow.escapeTest={get ready(){return ready;},player,keys,get floors(){return floors;},showFloor,drawMap,update,start,get arrival(){return arrivalCutscene;},get renderer(){return renderer;},get scene(){return scene;},get lights(){return lights;},get camera(){return camera;},pose(x,z,floor,angle){Object.assign(player,{x,z,floor});showFloor();yaw=angle;pitch=0;camera.position.set(x,floor*FLOOR_HEIGHT+1.65,z);state='play';elapsed=0;keys.clear();keys.add('KeyE');update(.001);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;}};`});
 });
 await page.goto(`http://127.0.0.1:${port}`);
 console.log('Page loaded');
 await page.waitForFunction(()=>window.escapeTest?.ready,null,{timeout:120000});
 console.log('Game ready');
 await page.locator('#start').click();
 await page.evaluate(()=>window.escapeTest.arrival.update(3));
 const results=[];
 for(const [name,x,z,floor,yaw] of [['reception',50,47.5,0,0],['gallery',50,47.5,0,Math.PI/2],['upper',40,47.5,1,0]]){
  await page.evaluate(args=>window.escapeTest.pose(...args),[x,z,floor,yaw]);
  // Warm the shader and let the GPU finish before collecting frame intervals.
  await page.evaluate(()=>new Promise(resolve=>{let n=0;function frame(){if(++n===12)resolve();else requestAnimationFrame(frame);}requestAnimationFrame(frame);}));
  const sample=await page.evaluate(async()=>{
   const t=window.escapeTest,intervals=[];let last=performance.now();
   for(let i=0;i<30;i++)await new Promise(resolve=>requestAnimationFrame(now=>{intervals.push(now-last);last=now;resolve();}));
   const active=[];t.scene.traverseVisible(o=>{if(o.isPointLight)active.push({x:o.position.x,z:o.position.z,intensity:o.intensity});});
   const mapStart=performance.now();for(let i=0;i<100;i++)t.drawMap();const mapMs=(performance.now()-mapStart)/100;
   intervals.sort((a,b)=>a-b);
   return {pointLights:active.length,litPointLights:active.filter(l=>l.intensity>0).length,drawCalls:t.renderer.info.render.calls,triangles:t.renderer.info.render.triangles,medianFrameMs:intervals[15],p95FrameMs:intervals[28],mapMs};
  });
  results.push({name,...sample});
  await page.screenshot({path:`Browser/artifacts/escape-performance-${mode}-${name}.png`});
 }
 assert.deepEqual(errors,[]);
 await writeFile(`Browser/artifacts/escape-performance-${mode}.json`,JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close();server.kill();}
