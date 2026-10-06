import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
import {ANNEXE_VIEWS} from '../../dist/annexe.mjs';
import {TOWER_BUILDING_VIEWS} from '../../dist/tower-buildings.mjs';
import {CHURTON_VIEWS} from '../../dist/churton-ward.mjs';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const views={
 'west-court':{position:[-46,1.8,-13],target:[-53,12,7],fov:64},
 'west-garden':{position:[-56,1.8,35],target:[-53,12,18],fov:66},
 'east-court':{position:[15,1.8,-17],target:[31,12,0],fov:65},
 'east-garden':{position:[53,1.8,35],target:[54,12,15],fov:65},
 'east-rear':{position:[64,1.8,-20],target:[79,9,-34],fov:65},
 'reception':{position:[-15,1.8,35],target:[0,13,16],fov:65},
 'churton':CHURTON_VIEWS['churton-1'],
 'annexe':ANNEXE_VIEWS['annexe-ground'],
 'annexe-west':ANNEXE_VIEWS['annexe-outer-west'],
 'annexe-east':ANNEXE_VIEWS['annexe-outer-east'],
 'annexe-rear':ANNEXE_VIEWS['annexe-kitchen'],
 'admin':{position:[204,1.8,66],target:[211,10,42],fov:65},
 'tower':TOWER_BUILDING_VIEWS['tower-buildings-3'],
 'workshops':TOWER_BUILDING_VIEWS['tower-twin-gables'],
 'overview':{position:[130,115,145],target:[0,8,5],fov:50}
};
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1450,height:800}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(stage==='before')await page.route(/\/(escape-exterior|aerial-layouts)\.mjs$/,async r=>{
  const name=new URL(r.request().url()).pathname.split('/').pop();
  await r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-'+name,import.meta.url),'utf8')});
 });
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={THREE,exterior,renderer,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const build=await page.evaluate(()=>window.review.exterior.modelBuild);assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
 await page.locator('[data-lighting="day"]').click();await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',import.meta.url))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show(v),views['west-court']);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-phone.png',import.meta.url))});
 assert.deepEqual(errors,[]);await writeFile(new URL(stage+'-'+mode+'-validation.json',import.meta.url),JSON.stringify({build,errors,views},null,2));console.log('PASS: '+stage+' '+mode+' ground views, no browser errors.');
}finally{await browser?.close();server.kill();}
