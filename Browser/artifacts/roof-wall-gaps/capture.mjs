import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const views={
 'west-court':{position:[-46,1.8,-13],target:[-53,12,7],fov:64},
 'west-garden':{position:[-56,1.8,35],target:[-53,12,18],fov:66},
 'east-court':{position:[15,1.8,-17],target:[31,12,0],fov:65},
 'east-garden':{position:[53,1.8,35],target:[54,12,15],fov:65},
 'east-rear':{position:[64,1.8,-20],target:[79,9,-34],fov:65},
 'reception':{position:[-15,1.8,35],target:[0,13,16],fov:65},
 'churton':{position:[-39,1.8,-50],target:[-32,10,-71],fov:65},
 'annexe':{position:[-171,1.8,-84],target:[-171,10,-104],fov:65},
 'admin':{position:[204,1.8,66],target:[211,10,42],fov:65},
 'tower':{position:[172,1.8,-12],target:[174,10,-32],fov:65}
};
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1450,height:800}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={THREE,exterior,renderer,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const build=await page.evaluate(()=>window.review.exterior.modelBuild);assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
 await page.locator('[data-lighting="day"]').click();await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',import.meta.url))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show(v),views['west-court']);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-phone.png',import.meta.url))});
 assert.deepEqual(errors,[]);await writeFile(new URL(stage+'-'+mode+'-validation.json',import.meta.url),JSON.stringify({build,errors,views},null,2));console.log('PASS: '+stage+' '+mode+' ground views, no browser errors.');
}finally{await browser?.close();server.kill();}
