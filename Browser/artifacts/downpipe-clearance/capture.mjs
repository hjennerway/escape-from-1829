import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const output=new URL('./',import.meta.url),mode=process.argv[2]??'source';
const views={
 'east-wing':{position:[51,4.7,45],target:[41.05,4.7,41],fov:55},
 'basement':{position:[30,3.1,-43],target:[29.15,3.1,-35.57],fov:53},
 'west-wing':{position:[-49,4.8,32],target:[-41.06,4.8,29],fov:54},
 'corridor':{position:[112,2.5,22],target:[110.225,2.5,13],fov:55},
 'estates':{position:[251,5,-37],target:[261,4,-43],fov:50},
 'pharmacy':{position:[191.7,4.5,-44],target:[191.1,4.1,-38.94],fov:75}
};
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const errors=[],metrics={};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1200,height:850},reducedMotion:'reduce'});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__models={renderer,exterior,layouts,controls,buildingDetail,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};\nfunction frame(){')});});
 if(mode==='before')await page.route('**/downpipe-clearance.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('export function avoidWindowDownpipes(THREE,root){','export function avoidWindowDownpipes(THREE,root){ return {};')});});
 await page.goto(base+'/aerial.html?models='+(mode==='compiled'?'compiled':'source')+'&buildingDetail=full&view=west-court-photo');
 await page.waitForFunction(()=>window.__models?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__models.exterior.modelBuild.mode),mode==='compiled'?'compiled':'procedural');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const {exterior}=window.__models;exterior.trees.visible=false;exterior.scene.fog.density=0;exterior.scene.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,view] of Object.entries(views)){
  if(process.argv[3]&&name!==process.argv[3])continue;
  await page.evaluate(view=>window.__models.show(view),view);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',output))});
  metrics[name]=await page.evaluate(()=>({mode:window.__models.exterior.modelBuild.mode,calls:window.__models.renderer.info.render.calls,triangles:window.__models.renderer.info.render.triangles}));
 }
 assert.deepEqual(errors,[]);await writeFile(new URL(mode+'-render.json',output),JSON.stringify({metrics,errors},null,2));
 console.log('PASS: '+mode+' hardware views captured without page errors.');
}finally{await browser?.close();server.kill();}
