import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const stage=process.argv[2]??'after',mode=process.argv[3]??'source';
const destination=new URL('./',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
const errors=[];
try{
  browser=await launchHardwareBrowser();
  const page=await browser.newPage({viewport:{width:1100,height:760}});
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',route=>route.abort());
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.windowHeadCheck={exterior,renderer,controls,buildingPhotos,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});
  });
  await page.goto(`${base}/aerial.html?models=${mode}&view=west-lawn-photo&buildingDetail=full`);
  await page.waitForFunction(()=>window.windowHeadCheck?.renderer.info.render.frame>3);
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>window.windowHeadCheck.buildingPhotos.close());
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  const checks=await page.evaluate(async({stage,mode})=>{
    const THREE=await import('/vendor/three.module.js');
    const {exterior}=window.windowHeadCheck;
    assertMode();
    function assertMode(){if(exterior.modelBuild.mode!==(mode==='source'?'procedural':mode))throw Error('Incorrect model mode '+exterior.modelBuild.mode);}
    const meshes=[],ray=new THREE.Raycaster();exterior.model.updateMatrixWorld(true);
    exterior.model.traverseVisible(o=>{if(o.isMesh&&!o.userData.buildingWindowProxy)meshes.push(o);});
    const brick=exterior.model.getObjectByName('West lawn three-window bay').material;
    const windows=[...exterior.model.userData.westLawnPhotoOpenings,...exterior.model.userData.eastLawnPhotoOpenings];
    const heads=[];
    for(const o of windows){
      const side=o.x<0?1:-1;
      // These points lie on the two exposed ends of the straight backing,
      // just below the segmental arch and outside the painted sash frame.
      for(const sign of [-1,1]){
        ray.set(new THREE.Vector3(o.x+side,o.y+o.h/2+.08,o.z+sign*(o.w/2+.105)),new THREE.Vector3(-side,0,0));
        const hit=ray.intersectObjects(meshes,false)[0];
        if(!hit)throw Error('Missing lintel end');
        const color=hit.object.material.color.getHex();
        if(stage==='before'?color!==0xb2b6af:hit.object.material!==brick)throw Error('Incorrect lintel material '+JSON.stringify({o,sign,color}));
        heads.push({face:o.face,x:o.x,y:o.y,z:o.z,sign,color});
      }
    }
    return {mode:exterior.modelBuild.mode,windows:windows.length,heads};
  },{stage,mode});
  for(const [name,view] of Object.entries({
    close:{position:[-24,2.4,38],target:[-28.94,2.9,31.5],fov:49},
    context:{position:[-9,3,44],target:[-29,4.7,34],fov:53},
    east:{position:[24,2.4,38],target:[28.94,2.9,31.5],fov:49}
  })){
    await page.evaluate(v=>{window.windowHeadCheck.show(v);const {exterior}=window.windowHeadCheck;exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},view);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:fileURLToPath(new URL(`${stage}-${mode}-${name}.png`,destination))});
  }
  assert.deepEqual(errors,[]);
  await writeFile(new URL(`${stage}-${mode}.json`,destination),JSON.stringify({checks,errors},null,2)+'\n');
  console.log(`PASS: ${stage} ${mode}; ${checks.windows} windows, ${checks.heads.length} exposed lintel ends, close/context/mirrored captures, no page or shader errors.`);
}finally{await browser?.close();server.kill();}
