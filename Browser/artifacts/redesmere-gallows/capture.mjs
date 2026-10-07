import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';

const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const directory=new URL('./',import.meta.url);await mkdir(directory,{recursive:true});
const views={
  return:{position:[77,1.8,-24],target:[76.9,3.4,-32.72],fov:70},
  'return-detail':{position:[78.3,2.8,-29],target:[73.9,3.3,-32.1],fov:54},
  'return-front':{position:[73.9,1.8,-26],target:[73.9,2.9,-32.72],fov:55},
  wing:{position:[77,1.8,.4],target:[84.08,3,-4.8],fov:62},
  'wing-detail':{position:[80.5,2.8,-8.5],target:[83.6,3.3,-4.8],fov:54}
};
const {server,base}=await startTestServer();let browser;const errors=[];
try{
  browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1300,height:785}});
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',r=>r.abort());
  await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.review={THREE,exterior,renderer,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
  await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
  await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>window.review.exterior.modelBuild);
  assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
  const renderer=await page.evaluate(()=>{const gl=window.review.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(info.UNMASKED_RENDERER_WEBGL);});
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  for(const [name,v] of Object.entries(views)){
    await page.evaluate(v=>window.review.show(v),v);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',directory))});
  }
  assert.deepEqual(errors,[]);
  await writeFile(new URL(stage+'-'+mode+'-validation.json',directory),JSON.stringify({build,renderer,errors,views},null,2)+'\n');
  console.log('PASS: '+stage+' '+mode+' views of both gallows canopies, no browser errors.');
}finally{await browser?.close();server.kill();}
