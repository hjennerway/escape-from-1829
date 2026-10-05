import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {stairShape,stairConnection,stairFlights} from './dist/asylum-stairs.mjs';

const mode=process.argv[2]??'after',destination=new URL('./artifacts/stair-soffits/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:850}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(mode==='before')for(const source of ['asylum-architecture','asylum-stairs']){
  await page.route(`**/${source}.mjs`,async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL(`${source}-before.mjs`,destination),'utf8')}));
 }
 await page.route('**/explore.mjs',async route=>{
  const response=await route.fetch();
  const body=(await response.text())
   .replace('const clock=new THREE.Timer();','window.soffitCheck={walker,interior,renderer,floors,freeze:true};const clock=new THREE.Timer();')
   .replace('else if(input.active)walker.update(dt);','else if(input.active&&!window.soffitCheck.freeze)walker.update(dt);');
  await route.fulfill({response,body});
 });
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.soffitCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette,.controls,.hint{display:none!important}'});
 async function pose(position,target,floor){
  await page.evaluate(({position,target,floor})=>{
   const t=window.soffitCheck;
   t.walker.setView({position,target,fov:65});
   Object.assign(t.walker.actor,{floor,outside:false,y:position[1]-1.8,stair:null});t.interior.update(t.walker.actor);
  },{position,target,floor});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 }
 const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),views=[];
 for(const stair of plan.stairs)for(const [lower,upper] of stair.connections){
  if(mode==='before'&&(stair.id!=='S1'||lower!==0))continue;
  const s=stairShape(stair),lo=plan.floors[lower].elevation,hi=plan.floors[upper].elevation,mid=(lo+hi)/2;
  for(const [name,position,target] of [
   ['upper-flight',[(s.innerLeft+s.innerRight)/2,lo+1.65,s.back-.3],[s.right,mid+.8,s.front+.5]],
   ['lower-flight',[(s.innerLeft+s.innerRight)/2,lo+.65,s.front+.2],[s.left,lo+.9,s.back-.3]],
  ]){
   const connection=stairConnection(stair,lower,upper);
   if(name==='upper-flight'&&connection.upperReturn){
    const [, [a,b]]=stairFlights(connection,lo,hi),dx=b[0]-a[0],dz=b[2]-a[2],run=Math.hypot(dx,dz),x=(a[0]+b[0])/2,z=(a[2]+b[2])/2;
    await pose([x-dz/run*.9,lo+1.65,z+dx/run*.9],[x,(a[1]+b[1])/2-.18,z],lower);
   }else await pose(position,target,lower);
   await page.screenshot({path:fileURLToPath(new URL(`${mode}-${stair.id}-${lower}-${upper}-${name}.png`,destination))});
   views.push({stair:stair.id,lower,upper,name});
  }
 }
 const s=stairShape(plan.stairs.find(s=>s.id==='S1'));
 await page.setViewportSize({width:390,height:844});
 await pose([(s.innerLeft+s.innerRight)/2,1.65,s.back-.3],[s.right,2.9,s.front+.5],0);
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views,mobile:true,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${views.length+1} actual exploration soffit views, desktop/mobile, no page or shader errors.`);
}finally{await browser.close();server.kill();}
