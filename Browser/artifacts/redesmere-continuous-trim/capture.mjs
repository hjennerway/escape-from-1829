import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';

const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const directory=new URL('./',import.meta.url);await mkdir(directory,{recursive:true});
const views={
  reference:{position:[115,1.8,-48],target:[90,5.6,-20],fov:66},
  outer:{position:[115,2,-12],target:[94,5,-14],fov:64},
  rear:{position:[98,2,-66],target:[78,5,-39],fov:62},
  west:{position:[42,2,-52],target:[71,5,-36],fov:62},
  courtyard:{position:[69,2,-15],target:[84,6,-20],fov:64},
  south:{position:[89,2,35],target:[89,3.3,16],fov:64},
  overview:{position:[118,49,-61],target:[79,5,-14],fov:58}
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
    if(name==='corner'){
      const hits=await page.evaluate(()=>{const {THREE,exterior}=window.review,r=new THREE.Raycaster();
        return [[662,286],[655,294],[674,281]].map(([x,y])=>{r.setFromCamera(new THREE.Vector2(x/1275*2-1,1-y/665*2),exterior.camera);return {x,y,hits:r.intersectObject(exterior.model,true).slice(0,6).map(h=>({name:h.object.name,instance:h.instanceId,point:h.point.toArray(),closure:h.object.userData.roofWallClosure,material:h.object.material.color?.getHexString()}))};});});
      await writeFile(new URL(stage+'-'+mode+'-corner-hits.json',directory),JSON.stringify(hits,null,2)+'\n');
    }
  }
  assert.deepEqual(errors,[]);
  await writeFile(new URL(stage+'-'+mode+'-validation.json',directory),JSON.stringify({build,renderer,errors,views},null,2)+'\n');
  console.log('PASS: '+stage+' '+mode+' Redesmere ground and overhead views, no browser errors.');
}finally{await browser?.close();server.kill();}
