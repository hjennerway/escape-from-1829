import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=1859,destination=new URL('./asylum-stairs/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.stairCheck={get ready(){return ready;},get floors(){return floors;},start(){start();arrivalCutscene.update(3);},pose(x,y,z,floor,tx,ty,tz){Object.assign(player,{x,y:y-1.65,z,floor,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();camera.position.set(x,y,z);camera.lookAt(tx,ty,tz);yaw=camera.rotation.y;pitch=camera.rotation.x;state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},render(){renderer.render(scene,camera);return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.stairCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.stairCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const plan=JSON.parse(await readFile(new URL('../dist/asylum-plan.json',import.meta.url))),renders=[];
 for(const s of plan.stairs){
  const [[x0,z0],[x1],,[,z1]]=s.points,cx=(x0+x1)/2;
  const views=[['upper-well',[cx,5.85,z0+.45,1,cx,2.2,z1-1.3]],
   ['return-join',[x0+.65,3.75,z1-.65,0,x1-1.3,2.8,z1-1.65]],
   ['ground-entry',[x1-.65,1.65,z0+.2,0,x0+1.3,1.25,z1-1.3]]];
  if(s.id==='S1')views.push(['basement',[x0+.65,-1.55,z0+.25,2,cx,-1.2,z1-.65]],['down-to-basement',[x1-.65,1.65,z0+.65,0,x1-.65,-1.5,z1-1.3]]);
  for(const [name,pose] of views){
   await page.evaluate(p=>window.stairCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   renders.push({stair:s.id,name,...await page.evaluate(()=>window.stairCheck.render())});
   await page.screenshot({path:fileURLToPath(new URL(`${s.id}-${name}.png`,destination))});
  }
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.stairCheck.pose(-12.9,5.85,10.05,1,-12.9,2.2,13.5));
 await page.screenshot({path:fileURLToPath(new URL('S1-mobile.png',destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({renders,errors},null,2)+'\n');
 console.log(`PASS: ${renders.length+1} actual-game stair renders across all four stairs, including Reception basement and mobile, no page/shader errors.`);
}finally{await browser.close();server.kill();}
