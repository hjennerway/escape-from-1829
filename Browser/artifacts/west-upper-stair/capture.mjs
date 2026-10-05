import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const mode=process.argv[2]??'before',out=new URL('./',import.meta.url);
await mkdir(out,{recursive:true});
const {server,base}=await startTestServer(),browser=await launchHardwareBrowser();
try{
 const page=await browser.newPage({viewport:{width:1600,height:mode==='preview'?700:900}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async r=>r.fulfill({contentType:'application/json',body:await readFile(new URL('before-plan.json',out),'utf8')}));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.stairCheck={walker,interior,renderer,floors,exterior,freeze:true};const clock=new THREE.Timer();').replace('else if(input.active)walker.update(dt);','else if(input.active&&!window.stairCheck.freeze)walker.update(dt);')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.stairCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette,.controls,.hint'+(mode==='preview'?',nav,.explore-guide,.crosshair':'')+'{display:none!important}'});
 for(const [name,position,target,floor] of [
  ['reference',[-31.15,8.1,12.95],mode==='preview'?[-31.15,7.8,9.2]:[-29.8,8.25,9.2],1],
  ['first-approach',[-31.6,5.9,8.6],[-29.1,7,12.3],1],
  ['first-west',[-34.85,5.9,8.3],[-30.1,7.4,12],1],
  ['upper-west',[-35.6,10.05,7.6],[-29.1,7.8,12.3],3],
  ['upper-landing',[-31.2,10.05,7.65],[-31.2,6.8,12.9],3],
 ]){
  await page.evaluate(({position,target,floor})=>{const t=window.stairCheck;t.walker.setView({position,target,fov:65});Object.assign(t.walker.actor,{floor,outside:false,y:position[1]-1.8,stair:null});t.interior.update(t.walker.actor);},{position,target,floor});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',out))});
 }
 await page.evaluate(()=>{const t=window.stairCheck;t.interior.scene.fog=null;t.interior.scene.children.filter(g=>g.isGroup).forEach(g=>g.traverse(o=>{if(o.name==='Asylum ceiling')o.visible=false;}));t.walker.setView({position:[-31.5,23,10.2],target:[-31.5,4.2,10.2],fov:65});Object.assign(t.walker.actor,{floor:3,outside:false});});
 await page.screenshot({path:fileURLToPath(new URL(mode+'-cutaway.png',out))});
 await writeFile(new URL(mode+'-visual.json',out),JSON.stringify({errors},null,2));
 console.log('Saved '+mode+' west upper stair views; errors: '+JSON.stringify(errors));
}finally{await browser.close();server.kill();}
