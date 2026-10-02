import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'after',port=1858,destination=new URL('./asylum-skirting/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1100,height:750}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error'&&/THREE|WebGL|shader/i.test(msg.text()))errors.push(msg.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')await page.route('**/asylum-architecture.mjs',async route=>{
  let source=await readFile(new URL('../dist/asylum-architecture.mjs',import.meta.url),'utf8');
  source=source.replace("import {asylumSkirtingGeometry} from './asylum-skirting.mjs';",'')
   .replace(/ const skirting=new THREE.Mesh\(asylumSkirtingGeometry[^\n]*\n skirting.name='Asylum Skirting';scene.add\(skirting\);/,'')
   .replace("box('Brick',x,.55,z,length,1.1,.18,angle);","box('Brick',x,.55,z,length,1.1,.18,angle);box('Skirting',x,.13,z,length,.24,.215,angle);");
  await route.fulfill({contentType:'text/javascript',body:source});
 });
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8'))+`
window.skirtingCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,targetX,targetZ){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-targetX,z-targetZ);pitch=-.28;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},get meshes(){return floorGroups.map(g=>{const m=g.getObjectByName('Asylum Skirting');return {name:m.name,instanced:!!m.isInstancedMesh,triangles:m.geometry.attributes.position.count/3};});}};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.skirtingCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.skirtingCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[['windows',49.75,14.4,0,49.75,19.5],['corner',52.5,17.5,0,54.4,19.5],['upper-windows',49.75,14.4,1,49.75,19.5],['angled-return',-8.4,7.4,0,-7.5,5.8],['basement',-34.5,-22.3,2,-37,-24.5]];
 let positions=0;
 for(const [name,x,z,floor,tx,tz] of views)for(const offset of [-.25,0,.25]){
  await page.evaluate(args=>window.skirtingCheck.pose(...args),[x+offset,z,floor,tx,tz]);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}-${offset}.png`,destination))});positions++;
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.skirtingCheck.pose(49.75,14.4,0,49.75,19.5));
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);
 const meshes=await page.evaluate(()=>window.skirtingCheck.meshes);
 assert(meshes.every(m=>m.instanced===(mode==='before')));
 await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({positions:positions+1,meshes,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${positions+1} rendered camera positions across three floors, desktop/mobile, no page or shader errors.`);
}finally{await browser.close();server.kill();}
