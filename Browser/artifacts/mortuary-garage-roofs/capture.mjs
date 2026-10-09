import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
import {mortuaryPoint as mp,garagePoint as gp} from '../../dist/garages-mortuary.mjs';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',walking=process.argv.includes('--walking');
const views={
 reference:{position:mp(-14,1.85,-13),target:mp(0,3,1.3),fov:61},
 close:{position:mp(-9.8,1.85,-8.5),target:mp(-.7,3,1.2),fov:65},
 shift:{position:mp(-13.7,1.85,-13.2),target:mp(0,3,1.3),fov:61},
 entrance:{position:mp(-3,1.85,-9),target:mp(0,4,-3.9),fov:60},
 west:{position:mp(-13,2,2.8),target:mp(-8.2,4,3.5),fov:60},
 east:{position:mp(13,2,2.8),target:mp(8.2,4,3.5),fov:60},
 vent:{position:mp(-4.2,5.4,-1.2),target:mp(0,5.5,3.5),fov:48},
 ventRear:{position:mp(4.4,5.4,8.5),target:mp(0,5.5,3.5),fov:48},
 garageWest:{position:gp(-7,1.85,-5),target:gp(1,3.6,3.6),fov:60},
 workshop:{position:gp(11,1.85,-7),target:gp(15.65,4.5,0),fov:65},
 garageEast:{position:gp(58,1.85,-3),target:gp(52.5,3.8,3.6),fov:60},
 overview:{position:mp(-16,21,-18),target:mp(4,1,2),fov:65}
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
 await page.goto(base+(walking?'/explore.html?view=mortuary&models=':'/aerial.html?models=')+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const build=await page.evaluate(()=>window.review.exterior.modelBuild);
 assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
 const renderer=await page.evaluate(()=>{const gl=window.review.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(info.UNMASKED_RENDERER_WEBGL);});
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;window.review.layouts.setVisible('modern',false);e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 const capture=async(name,v)=>{
  await page.evaluate(v=>window.review.show(v),v);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',import.meta.url))});
 };
 for(const [name,v] of Object.entries(views))if(!walking||['close','reference','shift','garageWest','entrance'].includes(name))await capture(name,v);
 await page.setViewportSize({width:430,height:860});
 await capture('portrait',{position:mp(-10,1.85,-15),target:mp(0,3.5,0),fov:67});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(stage+'-'+mode+'-validation.json',import.meta.url),JSON.stringify({build,renderer,errors,views},null,2)+'\n');
 console.log('PASS: '+stage+' '+mode+' mortuary/garage views, no browser errors.');
}finally{await browser?.close();server.kill();}
