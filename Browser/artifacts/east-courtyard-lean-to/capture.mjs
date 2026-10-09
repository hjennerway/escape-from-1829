import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';

const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const directory=new URL('./',import.meta.url);await mkdir(directory,{recursive:true});
const views={
  reference:{position:[48.9,1.8,-1.8],target:[43.7,3.6,5.8],fov:70},
  side:{position:[46.7,2.2,2.1],target:[41.5,4.3,5.9],fov:64},
  low:{position:[41.3,1.8,1.7],target:[41.3,4.6,5.7],fov:70},
  rear:{position:[37.9,7.8,3.6],target:[40.7,4.6,5.7],fov:62},
  overview:{position:[49,15,-4],target:[42.5,2.5,5.2],fov:58}
};
const {server,base}=await startTestServer();let browser;const errors=[];
try{
  browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1275,height:665}});
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',r=>r.abort());
  await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.review={THREE,exterior,layouts,renderer,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
  await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
  await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>window.review.exterior.modelBuild);
  assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
  const renderer=await page.evaluate(()=>{const gl=window.review.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(info.UNMASKED_RENDERER_WEBGL);});
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>{const e=window.review.exterior;window.review.layouts.setVisible('modern',false);e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  for(const [name,v] of Object.entries(views)){
    if(process.argv[4]&&name!==process.argv[4])continue;
    await page.evaluate(v=>window.review.show(v),v);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',directory))});
  }
  await page.evaluate(v=>{window.review.show(v);document.querySelector('[data-lighting="night"]').click();},views.reference);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-night.png',directory))});
  await page.setViewportSize({width:430,height:860});
  await page.evaluate(v=>{window.review.show(v);document.querySelector('[data-lighting="day"]').click();},
    {position:[45.3,1.8,-5],target:[41.7,3.2,5.7],fov:70});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-portrait.png',directory))});
  assert.deepEqual(errors,[]);
  await writeFile(new URL(stage+'-'+mode+'-validation.json',directory),JSON.stringify({build,renderer,errors,views},null,2)+'\n');
  console.log('PASS: '+stage+' '+mode+' east courtyard lean-to views, no browser errors.');
}finally{await browser?.close();server.kill();}
