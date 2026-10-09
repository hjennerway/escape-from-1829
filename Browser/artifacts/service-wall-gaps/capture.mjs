import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',walking=process.argv.includes('--walking');
const views={
 reference:{position:[258,1.8,6],target:[228.36,8.6,-3.65],fov:52},
 close:{position:[240,7,-3.65],target:[228.56,10.9,-3.65],fov:48},
 shift:{position:[240,7,-3.25],target:[228.56,10.9,-3.65],fov:48},
 oblique:{position:[244,6,8],target:[228.4,9,-4],fov:57},
 rear:{position:[195,10,3],target:[210,10,-3.65],fov:59},
 overview:{position:[250,50,42],target:[194,5,-28],fov:65},
 auditLeighton:{position:[398,6,45],target:[381,7.5,40],fov:58}
};
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1440,height:800}});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.review={THREE,exterior,layouts,renderer,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 if(walking)await page.route('**/explore.mjs',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.review={THREE,exterior,layouts,renderer,show(v){walker.setView(v);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();}};const clock=new THREE.Timer();')});});
 await page.goto(base+(walking?'/explore.html?view=tower-buildings-3&models=':'/aerial.html?models=')+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const build=await page.evaluate(()=>window.review.exterior.modelBuild);
 assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
 const renderer=await page.evaluate(()=>{const gl=window.review.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(info.UNMASKED_RENDERER_WEBGL);});
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;window.review.layouts.setVisible('modern',false);e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v),v);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',import.meta.url))});
 }
 await page.setViewportSize({width:430,height:860});await page.evaluate(v=>window.review.show(v),views.reference);
 await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-portrait.png',import.meta.url))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(stage+'-'+mode+'-validation.json',import.meta.url),JSON.stringify({build,renderer,errors,views},null,2)+'\n');
 console.log('PASS: '+stage+' '+mode+' service-wall views, no browser errors.');
}finally{await browser?.close();server.kill();}
