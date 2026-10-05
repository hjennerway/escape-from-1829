import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1100,height:760}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/const introFlight=beginIntroFlight[^\n]*;/,'const introFlight=null;').replace('const clock=new THREE.Timer();','window.check={THREE,renderer,exterior,walker,lighting};\nconst clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html?view=front-corner-2&period=1896');await page.waitForFunction(()=>window.check?.renderer.info.render.frame>3);await page.evaluate(()=>window.check.lighting.setMode('day'));
 await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
 const views=[['marked',[17,24,35],[31,8,15.5]],['ghost-close',[30.6,14.4,18.2],[31.8,13.8,15.5]],['west-ghost',[-30.6,14.4,18.2],[-31.8,13.8,15.5]]];
 for(const [name,p,t] of views){await page.evaluate(({p,t})=>{const c=window.check.exterior.camera;c.fov=46;c.position.set(...p);c.lookAt(...t);c.updateProjectionMatrix();},{p,t});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:new URL('walking-'+name+'.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});console.log('Captured walking '+name);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:new URL('walking-mobile.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
 assert.deepEqual(errors,[]);await writeFile(new URL('walking-report.json',import.meta.url),JSON.stringify({errors,views:4},null,2));console.log('PASS: actual Explore corners and mobile view without page/shader errors.');
}finally{await browser.close();server.kill();}
