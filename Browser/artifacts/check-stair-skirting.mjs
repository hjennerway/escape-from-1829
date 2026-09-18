import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]||'after',port=1850;
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&m.text().includes('THREE'))errors.push(m.text());});
 await page.route('https://**/*',async route=>{
  if(route.request().url().startsWith('https://cdn.jsdelivr.net/'))await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/vendor/'+route.request().url().split('/').at(-1),import.meta.url),'utf8')});
  else await route.abort();
 });
 if(mode==='before')await page.route('**/architecture.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('./stair-skirting-before.mjs.txt',import.meta.url),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8')+`\nwindow.windowCheck={get ready(){return ready;},get arrival(){return arrivalCutscene;},pose(x,z,floor,targetX,targetZ){Object.assign(player,{x,z,floor});showFloor();yaw=Math.atan2(x-targetX,z-targetZ);pitch=floor===0?-.26:-.52;camera.position.set(x,floor*FLOOR_HEIGHT+1.65,z);state='play';keys.clear();keys.add('KeyE');elapsed=0;update(.001);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('interact').hidden=true;}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.windowCheck?.ready,null,{timeout:120000});
 await page.locator('#start').click();await page.evaluate(()=>window.windowCheck.arrival.update(3));
 await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 for(const floor of [0,1])for(const [stair,x] of [['left',40],['right',60]])for(let i=0;i<=12;i++){
  await page.evaluate(args=>window.windowCheck.pose(...args),[x-.65+i*.108333,45.5,floor,x,41.25]);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  if(i%6===0)await page.screenshot({path:`Browser/artifacts/stair-skirting-${mode}-${stair}-floor${floor}-${i}.png`});
 }
 assert.deepEqual(errors,[]);
 await writeFile(`Browser/artifacts/stair-skirting-${mode}.json`,JSON.stringify({cameraPositions:52,floors:2,stairs:2,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, 52 moving-camera positions across both staircases and floors; no page or shader errors.`);
}finally{await browser.close();server.kill();}
