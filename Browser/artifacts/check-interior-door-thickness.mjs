import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const mode=process.argv[2]??'after',mobileOnly=process.argv.includes('--mobile'),destination=new URL('./interior-door-thickness/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('before-plan.json',destination),'utf8')}));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.depthCheck={walker,exterior,interior,renderer,lighting,floors,input};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.depthCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette{display:none!important}'});
 const views=[];
 async function pose(floor,id,side,oblique=0,distance=2.7){
  await page.evaluate(({floor,id,side,oblique,distance})=>{
   const t=window.depthCheck,d=t.floors[floor].doorways.find(d=>d.roomId===id),nx=-d.dz,nz=d.dx;
   // Fixed original positions make before/after views directly comparable.
   const z=({R21:19.3,R30:19.825,R31:19.3})[id],x=d.x,y=t.floors[floor].elevation;
   t.walker.setView({position:[x+nx*side*distance+d.dx*oblique,y+1.65,z+nz*side*distance+d.dz*oblique],target:[x,y+1.4,z],fov:58});
   Object.assign(t.walker.actor,{floor,outside:false,y,stair:null});t.walker.update(.001);
  },{floor,id,side,oblique,distance});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 }
 if(!mobileOnly)for(const floor of [0,1])for(const id of ['R21','R30','R31'])for(const side of [-1,1]){
  await pose(floor,id,side,.65);const name=`${mode}-${floor}-${id}-${side}`;
  await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});views.push(name);
 }
 await page.setViewportSize({width:390,height:844});await pose(0,'R30',-1,.45,5.6);
 await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',destination))});
 const depths=await page.evaluate(()=>window.depthCheck.floors.flatMap(f=>f.doorways.map(d=>({floor:f.id,id:d.roomId??d.partitionId,depth:d.depth}))));
 assert.deepEqual(errors,[]);if(mode==='after')assert(depths.every(d=>Math.abs(d.depth-.18)<1e-7));
 await writeFile(new URL(mode+(mobileOnly?'-mobile':'')+'.json',destination),JSON.stringify({views,depths,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, six bay doorways from both sides, mobile view, ${depths.length} measured interior frames, no page or shader errors.`);
}finally{await browser.close();server.kill();}
