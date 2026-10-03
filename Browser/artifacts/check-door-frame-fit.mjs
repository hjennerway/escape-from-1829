import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'before',destination=new URL('./door-frame-fit/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.frameCheck={walker,exterior,interior,renderer,lighting,floors,input};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.frameCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette{display:none!important}'});
 const views=[];
 for(const [floor,id] of [[0,'D10'],[0,'D8'],[0,'F3'],[0,'F6'],[0,'D7'],[0,'D9'],[2,'D11']])for(const u of [0,.6])views.push({floor,id,u});
 async function pose({floor,id,u}){
  await page.evaluate(({floor,id,u})=>{const t=window.frameCheck,e=t.floors[floor].exits.find(e=>e.id===id),nx=e.axis==='x'?e.facing:0,nz=e.axis==='z'?e.facing:0;
   const x=e.worldX-nx*3+nz*u,z=e.worldZ-nz*3-nx*u,y=t.floors[floor].elevation;
   t.walker.setView({position:[x,y+1.65,z],target:[e.worldX,y+1.4,e.worldZ],fov:58});
   Object.assign(t.walker.actor,{floor,outside:false,y});
  },{floor,id,u});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 }
 for(const v of views){await pose(v);await page.screenshot({path:fileURLToPath(new URL(`${mode}-${v.floor}-${v.id}-${v.u}.png`,destination))});}
 await page.setViewportSize({width:390,height:844});await pose({floor:0,id:'D10',u:.4});await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(mode+'.json',destination),JSON.stringify({views,errors},null,2)+'\n');
 console.log('PASS: '+mode+' outside frames in Explore, desktop/mobile views, no page or shader errors.');
}finally{await browser.close();server.kill();}
