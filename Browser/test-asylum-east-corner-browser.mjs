import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const mode=process.argv[2]??'after',port=1881,destination=new URL('./artifacts/east-corner/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1354,height:741}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(mode==='before')for(const [name,extension] of [['asylum-layout','mjs'],['asylum-architecture','mjs'],['asylum-plan','json']])await page.route('**/'+name+'.'+extension,async route=>route.fulfill({contentType:extension==='json'?'application/json':'text/javascript',body:await readFile(new URL(`${name}-before.${extension}`,destination),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.cornerCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},
 sign(){scene.updateMatrixWorld(true);const ray=new THREE.Raycaster(new THREE.Vector3(31.54,2.96,14),new THREE.Vector3(0,0,1));ray.far=2;return ray.intersectObjects(floorGroups[0].children,true)[0]?.object.name;},
 pose(x,z,tx,tz,floor=0){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=.03;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},
 trip(){const door=floors[0].exits.find(e=>e.id==='D10');this.pose(door.inside.x,door.inside.z,door.worldX,door.worldZ);state='play';keys.clear();update(.01);keys.add('KeyE');update(.04);const outside=player.outside,position=[player.x,player.y,player.z];update(.04);const latched=player.outside;keys.delete('KeyE');update(.04);keys.add('KeyE');update(.04);const returned=!player.outside&&player.floor===0;keys.clear();state='paused';return {outside,latched,returned,position,expected:door.destination};}
};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.cornerCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.cornerCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[['door',31.54,12,31.54,15.575],['door-oblique',34.8,13.7,31.5,16.5],['pillar',35.9,17.5,34.5,19.4],['junction',35.8,22,33.1,17],['upper',34.8,13.7,31.5,16.5,1]];
 for(const [name,...pose] of views){await page.evaluate(p=>window.cornerCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.cornerCheck.pose(31.54,12,31.54,15.575));await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 const trip=await page.evaluate(()=>window.cornerCheck.trip());assert(trip.outside&&trip.latched&&trip.returned);assert.deepEqual(trip.position,trip.expected);assert.deepEqual(errors,[]);
 if(mode!=='before')assert.equal(await page.evaluate(()=>window.cornerCheck.sign()),'Illuminated exit route sign','The sign stays visible in front of the restored header');
 await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views:views.length+1,trip,errors},null,2)+'\n');console.log(`PASS: ${mode} east corner, desktop/mobile and upper-floor views, D10 E round trip and release latch, no page/shader errors.`);
}finally{await browser.close();server.kill();}
