import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'after',port=1865,destination=new URL('./reception-connection/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1121,height:877}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text())){errors.push(m.text());console.error(m.text());}});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>{const plan=JSON.parse(await readFile(new URL('../dist/asylum-plan.json',import.meta.url),'utf8'));plan.partitions=(plan.partitions??[]).filter(p=>p.id!=='P1');await route.fulfill({contentType:'application/json',body:JSON.stringify(plan)});});
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.receptionCheck={get ready(){return ready;},get floors(){return floors;},start(){start();arrivalCutscene.update(3);},pose(x,z,tx,tz,floor=0){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.1;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},walk(side){this.pose(5.4,5.1+side*.8,5.4,5.1);moveAsylumActor(floors,player,0,-side*1.6);return Math.abs(player.z-(5.1-side*.8))<.001;}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.receptionCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.receptionCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[['reception',5.4,8.1,5.4,4],['corridor',5.4,2.1,5.4,6],['left-join',3.1,7.2,5.4,5.1],['right-join',7.8,7.2,5.4,5.1]];
 for(const [name,...pose] of views){await page.evaluate(p=>window.receptionCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.receptionCheck.pose(5.4,8.1,5.4,4));await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 for(const side of [-1,1])assert(await page.evaluate(side=>window.receptionCheck.walk(side),side),'Actual player crosses the new doorway both ways');
 const walls=await page.evaluate(()=>window.receptionCheck.floors[0].walls.filter(w=>[w.a,w.b].some(([x,z])=>Math.abs(x)<9&&z>3&&z<12)));
 await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({walls,errors},null,2)+'\n');assert.deepEqual(errors,[]);console.log(`PASS: ${mode} Reception views, no page/shader errors.`);
}finally{await browser.close();server.kill();}
