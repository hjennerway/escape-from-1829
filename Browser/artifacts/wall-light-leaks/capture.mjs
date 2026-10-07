import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';

const mode=process.argv[2]??'source',stage=process.argv[3]??'before';
const views={
 laundry:{position:[92,1.65,23],target:[106,1.8,45],fov:74},
 'rear-court':{position:[67,1.65,-4],target:[73,1.8,-32],fov:74},
 'arched-corridor':{position:[122,1.65,47],target:[148,1.8,10],fov:74},
 'west-inner':{position:[-10,1.65,-38],target:[-30,2,-22],fov:70},
};
await mkdir(new URL('.',import.meta.url),{recursive:true});
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1450,height:800},reducedMotion:'reduce'}),errors=[],report=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={THREE,exterior,renderer,lighting,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(v.target);}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&lighting=dusk');
 await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.review.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
 await page.evaluate(()=>{window.review.lighting.setMode('dusk');window.review.exterior.timeline.setPeriod(1938);window.review.exterior.scene.traverse(o=>{if(o.isSprite)o.layers.set(31);});});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v),v);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  for(const state of ['normal','old-bias']){
   await page.evaluate(state=>{const p=window.review.lighting.pools;p.material.polygonOffset=state==='old-bias';p.material.polygonOffsetFactor=-10;p.material.polygonOffsetUnits=-20;},state);
   await page.screenshot({path:fileURLToPath(new URL(`${stage}-${mode}-${name}-${state}.png`,import.meta.url))});
  }
  await page.evaluate(()=>{const p=window.review.lighting.pools;p.visible=true;p.material.polygonOffset=false;});
  report.push({name,v});
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${stage}-${mode}-validation.json`,import.meta.url),JSON.stringify({report,errors},null,2));
 console.log('PASS: '+mode+' '+stage+' wall light diagnosis captures.');
}finally{await browser?.close();server.kill();}
