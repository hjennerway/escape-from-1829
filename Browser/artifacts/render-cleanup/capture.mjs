import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const label=process.argv[2]??'before',mode=process.argv[3]??'source';
const out=new URL('./',import.meta.url);await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:process.env.RENDER_ROOT??new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1336,height:845}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.check={THREE,exterior,renderer,pose(p,t){moved=true;exterior.camera.near=.1;exterior.camera.fov=46;exterior.camera.position.set(...p);exterior.camera.lookAt(...t);exterior.camera.updateProjectionMatrix();controls.sync(t);}};\nfunction frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&view=front&buildingDetail=full');await page.waitForFunction(()=>window.check?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.check.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important}canvas{visibility:visible!important}'});
 const views=process.argv.includes('--diagnose')||process.argv.includes('--corners')?[
  {name:'marked',position:[17,24,35],target:[31,8,15.5]},
  {name:'marked-close',position:[27,13,24],target:[33,7,18]},
  {name:'ghost-close',position:[30.6,14.4,18.2],target:[31.8,13.8,15.5]}
 ]:[
  {name:'east-front',position:[48,25,41],target:[25,8,13]},
  {name:'east-close',position:[43,17,29],target:[31.5,9,15.5]},
  {name:'east-rear',position:[0,27,-16],target:[29,8,4]},
  {name:'west-front',position:[-48,25,41],target:[-25,8,13]},
  {name:'overview',position:[90,82,140],target:[10,6,0]}
 ];
 for(const v of views){await page.evaluate(v=>window.check.pose(v.position,v.target),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:new URL(label+'-'+v.name+'.png',out).pathname.replace(/^\/(\w:)/,'$1')});console.log('Captured '+v.name);}
 if(process.argv.includes('--diagnose')){
  await page.evaluate(()=>{window.check.renderer.shadowMap.enabled=false;window.check.exterior.model.traverse(o=>{if(o.material)for(const m of [o.material].flat())m.needsUpdate=true;});});
  for(const v of views){await page.evaluate(v=>window.check.pose(v.position,v.target),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:new URL(label+'-unshadowed-'+v.name+'.png',out).pathname.replace(/^\/(\w:)/,'$1')});}
 }
 await writeFile(new URL(label+'-report.json',out),JSON.stringify({errors,build:await page.evaluate(()=>window.check.exterior.modelBuild)},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
