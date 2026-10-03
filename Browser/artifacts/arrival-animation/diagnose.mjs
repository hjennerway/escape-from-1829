import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=new URL('../../../',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:root,windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:750},reducedMotion:'no-preference'});
 page.setDefaultTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',route=>route.abort());
 const source=await readFile(new URL('Browser/dist/game.mjs',root),'utf8');
 await page.route('**/game.mjs',route=>route.fulfill({contentType:'text/javascript',body:source
  .replace("if(state==='arrival'){\n", "if(state==='arrival'){\n")
  .replace('arrivalCutscene.update(Math.min(frameDt,.25));', "arrivalCutscene.update(Math.min(frameDt,.25));window.arrivalFrames.push({frameDt,state,inside:arrivalCutscene.inside,position:exterior.camera.position.toArray(),opacity:$('arrivalFade').style.opacity,time:performance.now()});")
  +"\nwindow.arrivalFrames=[];window.arrivalTest={start,get ready(){return ready;},get state(){return state;},get elapsed(){return elapsed;}};"}));
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.arrivalTest?.ready);
 const launch=await page.evaluate(()=>{const at=performance.now();window.arrivalTest.start();return {duration:performance.now()-at,state:window.arrivalTest.state,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};});
 console.log(JSON.stringify({launch}));
 await page.waitForFunction(()=>window.arrivalTest.state==='play');
 const result=await page.evaluate(()=>({frames:window.arrivalFrames,elapsed:window.arrivalTest.elapsed}));
 await mkdir(new URL('.',import.meta.url),{recursive:true});
 await writeFile(new URL('diagnosis.json',import.meta.url),JSON.stringify({launch,...result,errors},null,2)+'\n');
 console.log(JSON.stringify({frames:result.frames.length,first:result.frames.slice(0,3),last:result.frames.at(-1),errors}));
}finally{await browser?.close();server.kill();}
