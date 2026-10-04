import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const stage=process.argv[2]??'after',destination=new URL('./',import.meta.url),sourceHash=await modelSourceHash();
const views={
  marked:{position:[-53,26,-28],target:[-61.5,7.8,5],fov:36},
  straight:{position:[-61,12,-28],target:[-61,8,5],fov:35},
  close:{position:[-54,17,-15],target:[-61.1,6.9,5],fov:38}
};
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],checks=[];
try{
  const page=await browser.newPage({viewport:{width:1200,height:900}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',route=>route.abort());
  if(stage==='before'){
    const body=await readFile(new URL('before-west-court-photo-detail.mjs',destination),'utf8');
    await page.route('**/west-court-photo-detail.mjs',route=>route.fulfill({contentType:'text/javascript',body}));
  }
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.courtCheck={exterior,renderer,controls,buildingPhotos,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
  await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.courtCheck={exterior,renderer,walker};const clock=new THREE.Timer();')});});
  const modes=stage==='pages'?['compiled','explore']:['source'];
  for(const mode of modes){
    await page.goto(base+(mode==='explore'?'/explore.html?view=west-4':`/aerial.html?models=${mode}&view=west-4&buildingDetail=full`));
    await page.waitForFunction(()=>window.courtCheck?.renderer.info.render.frame>3);
    await page.locator('[data-lighting="day"]').click();
    await page.evaluate(()=>window.courtCheck.buildingPhotos?.close());
    await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
    checks.push(await page.evaluate(async({mode,stage})=>{
      const THREE=await import('/vendor/three.module.js'),{exterior,walker}=window.courtCheck;
      const {exteriorObstacles}=await import('/explore-controls.mjs');
      if(mode!=='explore'&&exterior.modelBuild.mode!==(mode==='source'?'procedural':mode))throw Error('Incorrect model mode '+exterior.modelBuild.mode);
      exterior.trees.visible=false;walker?.setObstacles(exteriorObstacles(THREE,exterior.model));exterior.invalidateShadows();exterior.model.updateMatrixWorld(true);
      const meshes=[],ray=new THREE.Raycaster();exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);if(o.isSprite)o.visible=false;});
      const openings=exterior.model.userData.westCourtPhotoOpenings;
      const affected=openings.filter(o=>['west-court-bay','west-court-low-bay'].includes(o.face)||o.face==='west-court-recess'&&o.y<8);
      let panes=0;const covered=[];
      for(const o of affected){
        const canted=o.face==='west-court-bay'&&Math.abs(o.x+58.4)>1.6;
        const angle=Math.atan2(3.35*(1-.28),6.5/4),rotation=canted?(o.x<-58.4?Math.PI+angle:Math.PI-angle):Math.PI;
        const nx=Math.sin(rotation),nz=Math.cos(rotation);
        for(const u of [-.32,.32])for(const v of [-.27,.27]){
          ray.set(new THREE.Vector3(o.x+nz*o.w*u+nx*.6,o.y+o.h*v,o.z-nx*o.w*u+nz*.6),new THREE.Vector3(-nx,0,-nz));
          const pane=ray.intersectObjects(meshes,false)[0];
          if(pane?.object.material.color.getHex()!==0x78989f||pane.distance>=.6){const issue={mode,opening:o,u,v,hit:pane&&{name:pane.object.name,color:pane.object.material.color.getHex(),distance:pane.distance}};if(stage!=='before')throw Error('Covered pane '+JSON.stringify(issue));covered.push(issue);}panes++;
        }
        if(stage!=='before'){
          if(o.face==='west-court-bay'&&o.w!==1.3)throw Error('Bay width mismatch');
          if(o.face==='west-court-recess'&&Math.abs(o.x+62.65)>1e-6)throw Error('Recessed sash off centre');
        }
      }
      const low=affected.filter(o=>o.face==='west-court-recess');
      if(low.length!==(stage==='before'?4:2))throw Error('Incorrect low-bay sash count');
      if(stage!=='before'){
        for(const [x,z] of [[-65.05,5.9],[-64.4,5.9],[-65.7,5.4],[-65.7,6.5]]){
          ray.set(new THREE.Vector3(x,9.5,z),new THREE.Vector3(0,-1,0));const cap=ray.intersectObjects(meshes,false)[0];
          if(Math.abs(cap.point.y-8.81)>.001)throw Error('Roof deck is not flat');
        }
        for(const [x,z] of [[-65.05,4.86],[-65.05,6.94],[-66.49,5.9],[-63.61,5.9]]){
          ray.set(new THREE.Vector3(x,9.5,z),new THREE.Vector3(0,-1,0));const rim=ray.intersectObjects(meshes,false)[0];
          if(Math.abs(rim.point.y-9.01)>.001||rim.object.material.color.getHex()!==0xe1e3dc)throw Error('Roof rim missing or too high');
        }
        for(const x of [-65.9,-66.55])for(const y of [1.7,6.1]){
          ray.set(new THREE.Vector3(x,y,3.9),new THREE.Vector3(0,0,1));const hit=ray.intersectObjects(meshes,false)[0];
          if(hit.object.material.color.getHex()===0x454b49)throw Error('Removed downpipe remains');
        }
      }
      return {mode,panes,covered,openings:affected,lowWindowCount:low.length};
    },{mode,stage}));
    for(const [name,v] of Object.entries(views)){
      await page.evaluate(v=>{const {exterior,walker,show}=window.courtCheck;if(walker)walker.setView(v);else show(v);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},v);
      await page.screenshot({path:fileURLToPath(new URL(`${stage}-${mode}-${name}.png`,destination))});
    }
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(v=>{const {exterior,walker,show}=window.courtCheck;if(walker)walker.setView(v);else show(v);exterior.camera.fov=62;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views.marked);
    await page.screenshot({path:fileURLToPath(new URL(`${stage}-${mode}-mobile.png`,destination))});
    await page.setViewportSize({width:1200,height:900});
  }
  assert.deepEqual(errors,[]);assert.equal(await modelSourceHash(),sourceHash,'Model sources changed during visual checks');
  await writeFile(new URL(`${stage}-browser.json`,destination),JSON.stringify({sourceHash,views,checks,errors},null,2)+'\n');
  console.log(stage==='before'?'PASS: original geometry captured, existing pane obstructions recorded, no page or shader errors.':`PASS: ${stage} ${modes.join('/')}: sash placement/width, exposed panes, flat deck/rim, removed downpipes, desktop/mobile captures, no page or shader errors.`);
}finally{await browser.close();server.kill();}
