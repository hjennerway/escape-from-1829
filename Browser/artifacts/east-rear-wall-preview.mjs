import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const mode=process.argv[2]??'before',port=1884,destination=new URL('./east-rear-wall/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1591,height:886}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('plan-before.json',destination),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.wallCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},
 get floors(){return floors;},get player(){return player;},move(dx,dz){moveAsylumActor(floors,player,dx,dz);},
 pose(x,z,tx,tz,floor=0){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();enemies.forEach(e=>e.mesh.visible=false);yaw=Math.atan2(x-tx,z-tz);pitch=.03;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}
};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.wallCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.wallCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const movement=mode==='after'?await page.evaluate(async()=>{
  const {stairRoute}=await import('/asylum-layout.mjs'),t=window.wallCheck,s=t.floors[0].stairs.find(s=>s.id==='S4'),route=stairRoute(s,0,4.2),walks=[];
  for(const reverse of [false,true]){
   const points=reverse?[...route].reverse():route,first=points[0];t.pose(first[0],first[2]-.1,first[0],first[2]+1,reverse?1:0);
   for(const [x,,z] of [...points,reverse?[30.45,0,-31.75]:[33.85,4.2,-32.55]]){
    for(let n=0;n<1000&&Math.hypot(t.player.x-x,t.player.z-z)>.025;n++){const dx=x-t.player.x,dz=z-t.player.z,d=Math.hypot(dx,dz),step=Math.min(.055,d);t.move(dx/d*step,dz/d*step);}
    if(Math.hypot(t.player.x-x,t.player.z-z)>.04)throw new Error('Rear stair walk blocked');
   }
   if(t.player.floor!==(reverse?0:1)||t.player.stair)throw new Error('Rear stair landing did not release');walks.push({reverse,floor:t.player.floor});
  }
  return {walks,flatWalkable:true};
 }):null;
 const views=[['marked',35.8,-32.2,28,-32.7],['door-side',35.7,-33.8,29.5,-32.4],['stair-side',35.8,-30.8,31,-32.4],['reverse',30.5,-34.4,32,-32.4]];
 for(const [name,x,z,,,floor=0] of views)assert(await page.evaluate(async p=>{const {flatWalkable}=await import('/asylum-layout.mjs');return flatWalkable(window.wallCheck.floors[p.floor],p.x,p.z);},{x,z,floor}),`${name}: camera is on a walkable surface`);
 for(const [name,...pose] of views){await page.evaluate(p=>window.wallCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.wallCheck.pose(35.8,-32.2,28,-32.7));await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views:views.length+1,movement,errors},null,2)+'\n');
 console.log(`PASS: ${mode} rear stair/exit wall desktop and mobile views, no page/shader errors.`);
}finally{await browser.close();server.kill();}
