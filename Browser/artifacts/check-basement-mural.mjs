import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'before',port=1878,destination=new URL('./basement-mural/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:700}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.muralCheck={get ready(){return ready;},get scene(){return scene;},get floors(){return floors;},start(){start();arrivalCutscene.update(3);enemies.forEach(e=>e.mesh.visible=false);},pose(x,z,tx,tz){Object.assign(player,{x,z,floor:2,y:floors[2].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.04;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.muralCheck?.ready,null,{timeout:120000});
 const dimensions=await page.evaluate(()=>{const layers=[];window.muralCheck.scene.traverse(o=>{if(o.material?.userData.mural)layers.push({name:o.name,...o.material.userData.mural});});return layers;});
 if(mode!=='before'){
  assert.equal(dimensions.length,2,'Only basement brick and plaster carry the mural');
  for(const m of dimensions){assert(Math.abs(m.height/2.9-.8)<1e-10);assert(Math.abs(m.bottom-(2.9-m.top))<1e-10);}
 }
 await page.evaluate(()=>window.muralCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[['landing',-31,6.7,-34.65,1.3],['front',-34.65,5.8,-34.65,1.3],['corridor',-31.1,2.8,-34.65,1.3]];
 for(const [name,...pose] of views){await page.evaluate(p=>window.muralCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.muralCheck.pose(-34.65,4.4,-34.65,1.3));await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({errors,views:views.length+1,dimensions},null,2)+'\n');console.log(`PASS: ${mode} mural wall desktop/mobile views; no page/shader errors.`);
}finally{await browser.close();server.kill();}
