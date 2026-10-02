import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {stairShape} from '../dist/asylum-stairs.mjs';
const mode=process.argv[2]??'after',port=1873,destination=new URL('./asylum-slabs/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:850}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.slabCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},pose(x,y,z,floor,tx,ty,tz){Object.assign(player,{x,y:y-1.65,z,floor,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();camera.position.set(x,y,z);camera.lookAt(tx,ty,tz);yaw=camera.rotation.y;pitch=camera.rotation.x;state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},render(){renderer.render(scene,camera);return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.slabCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.slabCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const plan=JSON.parse(await readFile(new URL('../dist/asylum-plan.json',import.meta.url))),renders=[];
 for(const stair of plan.stairs)for(const [lower,upper] of stair.connections){
  const s=stairShape(stair),lo=plan.floors[lower].elevation,hi=plan.floors[upper].elevation;
  const views=[
   ['ascending',[s.right,(lo+hi)/2+1.65,s.back,lower,s.right-.7,hi+.9,s.front-.7]],
   ['across-edge',[s.left,(lo+hi)/2+1.65,s.back,lower,s.maxX+.5,hi-.2,s.back-.8]],
   ['descending',[s.right,hi+1.65,s.portal,upper,s.left,(lo+hi)/2+.5,s.back]],
   ['under-landing',[s.right,lo+1.65,s.front+.5,lower,s.right,hi-.1,s.front-.5]],
  ];
  for(const [name,pose] of views){
   await page.evaluate(p=>window.slabCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   renders.push({stair:stair.id,lower,upper,name,...await page.evaluate(()=>window.slabCheck.render())});
   await page.screenshot({path:fileURLToPath(new URL(`${mode}-${stair.id}-${lower}-${upper}-${name}.png`,destination))});
  }
 }
 const s=stairShape(plan.stairs.find(s=>s.id==='S1'));
 await page.setViewportSize({width:390,height:844});await page.evaluate(p=>window.slabCheck.pose(...p),[s.right,3.75,s.back,0,s.right-.7,5.1,s.front-.7]);
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}-validation.json`,destination),JSON.stringify({renders,errors},null,2)+'\n');
 console.log(`PASS: ${renders.length+1} actual-game slab views across all four stairs and three floors, desktop/mobile, no page/shader errors.`);
}finally{await browser.close();server.kill();}
