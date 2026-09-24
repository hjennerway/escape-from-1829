import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['../serve.mjs'],{cwd:import.meta.dirname,windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
const page=await browser.newPage({viewport:{width:1217,height:672}});
await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__models={renderer,exterior,layouts,controls}; function frame(){')});});
await page.goto(base+'/aerial.html?models=source',{timeout:120000});
await page.waitForFunction(()=>window.__models?.renderer.info.render.frame>3,null,{timeout:120000});
await page.evaluate(()=>{
const {exterior:e,controls}=window.__models;
e.camera.position.set(-112,65,18);e.camera.lookAt(-55,0,49);controls.sync([-55,0,49]);e.camera.updateMatrixWorld();
});
await page.addStyleTag({content:'body > :not(canvas):not(script):not(style) { visibility: hidden !important; } canvas { visibility: visible !important; }'});
await page.evaluate(async()=>{const THREE=await import('./vendor/three.module.js');const {exterior:e}=window.__models;for(const [label,x,z] of [['A',-58.5,49],['B',-75.5,49],['C',-75.5,75.5],['D',-57,43],['E',-29,43]]){const p=new THREE.Vector3(x,.2,z).project(e.camera);const el=document.createElement('canvas');el.width=80;el.height=35;el.style.cssText=`position:fixed;left:${(p.x+1)*innerWidth/2}px;top:${(1-p.y)*innerHeight/2}px;z-index:999;`;const g=el.getContext('2d');g.fillStyle='red';g.font='22px Arial';g.fillText(label,0,23);document.body.append(el);}});
await page.waitForTimeout(1000);await page.screenshot({path:'Browser/artifacts/marked-paving-labeled.png'});
} finally {await browser.close();server.kill();}




