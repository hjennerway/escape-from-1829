import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const mode=process.argv[2]??'after',out=new URL('./',import.meta.url);await mkdir(out,{recursive:true});
const {server,base}=await startTestServer(),browser=await launchHardwareBrowser();
try{
 const page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async r=>r.fulfill({contentType:'application/json',body:await readFile(new URL('before-plan.json',out),'utf8')}));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.stairCheck={walker,interior,renderer,floors,exterior,freeze:true};const clock=new THREE.Timer();').replace('else if(input.active)walker.update(dt);','else if(input.active&&!window.stairCheck.freeze)walker.update(dt);')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.stairCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette,.controls,.hint,nav,.explore-guide,.crosshair{display:none!important}'});
 for(const [name,position,target,floor] of [
  ['reference',[-34.85,6,15.5],[-33.7,6,8.5],1],
  ['approach',[-34.85,5.95,15.6],[-34.85,7.9,9.5],1],
  ['well',[-31.15,5.95,7.9],[-31.15,6.5,12.5],1],
  ['upper',[-34.85,10.15,7.6],[-34.85,7.6,12.5],3],
  ['corridor',[-38,10.15,8],[-31.2,8.4,11],3],
 ]){
  await page.evaluate(({position,target,floor})=>{const t=window.stairCheck;t.walker.setView({position,target,fov:65});Object.assign(t.walker.actor,{floor,outside:false,y:position[1]-1.8,stair:null});t.interior.update(t.walker.actor);},{position,target,floor});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',out))});
 }
 await page.evaluate(()=>{const t=window.stairCheck;t.interior.scene.fog=null;t.interior.scene.children.filter(g=>g.isGroup).forEach(g=>g.traverse(o=>{if(o.name==='Asylum ceiling')o.visible=false;}));t.walker.setView({position:[-33.5,24,10.2],target:[-33.5,4.2,10.2],fov:65});Object.assign(t.walker.actor,{floor:3,outside:false});});
 await page.screenshot({path:fileURLToPath(new URL(mode+'-cutaway.png',out))});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const t=window.stairCheck;t.walker.setView({position:[-34.85,5.95,15.6],target:[-34.85,7.9,9.5],fov:65});Object.assign(t.walker.actor,{floor:1,outside:false,y:4.2});t.interior.scene.children.filter(g=>g.isGroup).forEach(g=>g.traverse(o=>{if(o.name==='Asylum ceiling')o.visible=true;}));t.interior.update(t.walker.actor);});
 await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile.png',out))});
 assert.deepEqual(errors,[]);await writeFile(new URL(mode+'-validation.json',out),JSON.stringify({errors},null,2)+'\n');
 console.log('Saved '+mode+' single-stair hardware views without page/shader errors.');
}finally{await browser.close();server.kill();}
