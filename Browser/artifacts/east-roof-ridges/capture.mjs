import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
const stage=process.argv[2]??'after',mode=process.argv[3]??'source';
const views={
 marked:{position:[13,41,13],target:[53,11,13],fov:47},
 court:{position:[34,27,-12],target:[55,14,7],fov:49},
 garden:{position:[31,26,37],target:[52,14,17],fov:49},
 end:{position:[86,32,12],target:[58,14,12],fov:55},
 lowCourt:{position:[40,12,-7],target:[47,14.5,7],fov:55},
 lowGarden:{position:[36,12,30],target:[43,14.5,18],fov:55},
 plan:{position:[54,62,12],target:[54,13,12.001],fov:48}
};
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1400,height:950}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={THREE,exterior,renderer,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const build=await page.evaluate(()=>window.review.exterior.modelBuild);assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
 await page.locator('[data-lighting="day"]').click();await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',import.meta.url))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show({...v,fov:60}),views.marked);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-phone.png',import.meta.url))});
 assert.deepEqual(errors,[]);await writeFile(new URL(stage+'-'+mode+'-validation.json',import.meta.url),JSON.stringify({build,errors,views},null,2));console.log('PASS: '+stage+' '+mode+' roof views, no browser errors.');
}finally{await browser?.close();server.kill();}
