import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
import {mortuaryPoint as mp} from '../../dist/garages-mortuary.mjs';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',walking=process.argv.includes('--walking');
const views={
 pair:{position:[153,16,-36],target:[169,13.7,-48.34],fov:42},
 close:{position:[158.5,15,-41.5],target:[164.5,14.5,-48.34],fov:46},
 reverse:{position:[175,17,-58],target:[173.3,14.5,-48.34],fov:46},
 central:{position:[212,16,-22],target:[199.75,13.5,-30.3],fov:46},
 workshops:{position:[237,18,-40],target:[222,11.5,-54.5],fov:49},
 enlarged:{position:[201,15,-43],target:[191.5,11.8,-54.5],fov:46},
 mortuary:{position:mp(-4.2,5.4,-1.2),target:mp(0,5.5,3.5),fov:48},
 mortuaryRear:{position:mp(4.4,5.4,8.5),target:mp(0,5.5,3.5),fov:48}
};
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1440,height:800}});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(stage==='before')for(const file of ['tower-buildings.mjs','garages-mortuary.mjs'])await page.route('**/'+file,async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before/'+file,import.meta.url),'utf8')}));
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
 for(const [name,v] of Object.entries(views))if(!walking||['pair','workshops','mortuary'].includes(name))await capture(name,v);
 await page.setViewportSize({width:430,height:860});
 await capture('portrait',{position:[156,16,-38],target:[169,13.7,-48.34],fov:65});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(stage+'-'+mode+'-validation.json',import.meta.url),JSON.stringify({build,renderer,errors,views},null,2)+'\n');
 console.log('PASS: '+stage+' '+mode+' blue roof lantern views, no browser errors.');
}finally{await browser?.close();server.kill();}
