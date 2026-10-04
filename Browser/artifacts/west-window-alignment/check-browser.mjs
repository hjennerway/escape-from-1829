import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const stage=process.argv[2]??'after',destination=new URL('./',import.meta.url);
const sourceHash=await modelSourceHash();
const views={
  marked:{position:[-73,30,51],target:[-50,8,18],fov:44},
  close:{position:[-68,24,42],target:[-48,7.7,17],fov:48},
  straight:{position:[-47,9,43],target:[-47,8,14],fov:60},
  green:{position:[-55,13,29],target:[-39.8,5,17.5],fov:45}
};
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],checks=[];
try{
  const page=await browser.newPage({viewport:{width:1400,height:940}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',route=>route.abort());
  if(stage==='before'){
    const body=await readFile(new URL('before-west-front-photo-detail.mjs',destination),'utf8');
    await page.route('**/west-front-photo-detail.mjs',route=>route.fulfill({contentType:'text/javascript',body}));
  }
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.windowCheck={exterior,renderer,controls,buildingPhotos,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
  await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.windowCheck={exterior,renderer,walker};const clock=new THREE.Timer();')});});
  const modes=stage==='pages'?['compiled','explore']:stage==='final'?['compiled']:['source'];
  for(const mode of modes){
    await page.goto(base+(mode==='explore'?'/explore.html?view=west-2':`/aerial.html?models=${mode}&view=west-2&buildingDetail=full`));
    await page.waitForFunction(()=>window.windowCheck?.renderer.info.render.frame>3);
    await page.locator('[data-lighting="day"]').click();
    await page.evaluate(()=>window.windowCheck.buildingPhotos?.close());
    await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
    checks.push(await page.evaluate(async({mode,stage})=>{
      const THREE=await import('/vendor/three.module.js'),{exterior,walker}=window.windowCheck;
      const {exteriorObstacles,obstacleContains}=await import('/explore-controls.mjs');
      if(mode!=='explore'&&exterior.modelBuild.mode!==(mode==='source'?'procedural':mode))throw Error('Incorrect model mode '+exterior.modelBuild.mode);
      exterior.trees.visible=false;walker?.setObstacles(exteriorObstacles(THREE,exterior.model));exterior.invalidateShadows();exterior.model.updateMatrixWorld(true);
      const meshes=[],ray=new THREE.Raycaster();exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);if(o.isSprite)o.visible=false;});
      const openings=exterior.model.userData.westFrontPhotoOpenings;
      const affected=openings.filter(o=>o.face==='west-front-bay'||o.face==='west-front-inner-return'||o.face.startsWith('west-front-bay-flank')&&o.x>-49.4);
      let panes=0;
      for(const o of affected){
        const rotation=o.face==='west-front-inner-return'?-Math.PI/2:o.face==='west-front-bay'?(o.x<-52.5?-Math.atan2(2.8-2.8*.28,(6.2-2.3)/2):o.x>-52.5?Math.atan2(2.8-2.8*.28,(6.2-2.3)/2):0):0;
        const nx=Math.sin(rotation),nz=Math.cos(rotation);
        for(const u of [-.32,.32])for(const v of [-.27,.27]){
          ray.set(new THREE.Vector3(o.x+nz*o.w*u+nx*.6,o.y+o.h*v,o.z-nx*o.w*u+nz*.6),new THREE.Vector3(-nx,0,-nz));
          const pane=ray.intersectObjects(meshes,false)[0];
          if(pane?.object.material.color.getHex()!==0x78989f||pane.distance>=.6)throw Error('Covered pane '+JSON.stringify({mode,opening:o,u,v,hit:pane&&{name:pane.object.name,color:pane.object.material.color.getHex(),distance:pane.distance}}));panes++;
        }
      }
      const doorX=stage==='before'?-47.1:-44.7;
      for(const dx of [-.6,-.3,.3,.6])for(const y of [.46,.53,1.36]){
        ray.set(new THREE.Vector3(doorX+dx,y,14.65),new THREE.Vector3(0,0,-1));
        if(ray.intersectObjects(meshes,false)[0]?.object.material.color.getHex()!==0x172e50)throw Error('Door leaf or sill obstruction');
      }
      if(walker){
        const obstacles=exteriorObstacles(THREE,exterior.model);
        if(obstacles.some(o=>obstacleContains(o,doorX,14.65)))throw Error('Garden arrival is blocked');
      }
      return {mode,panes,doorX,openings:affected,errors:[]};
    },{mode,stage}));
    for(const [name,v] of Object.entries(views)){
      await page.evaluate(v=>{const {exterior,walker,show}=window.windowCheck;if(walker)walker.setView(v);else show(v);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},v);
      await page.screenshot({path:fileURLToPath(new URL(`${stage}-${mode}-${name}.png`,destination))});
    }
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(v=>{const {exterior,walker,show}=window.windowCheck;if(walker)walker.setView(v);else show(v);exterior.camera.fov=65;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();},views.close);
    await page.screenshot({path:fileURLToPath(new URL(`${stage}-${mode}-mobile.png`,destination))});
    await page.setViewportSize({width:1400,height:940});
  }
  assert.deepEqual(errors,[]);
  assert.equal(await modelSourceHash(),sourceHash,'Model sources changed during the visual check');
  await writeFile(new URL(`${stage}-browser.json`,destination),JSON.stringify({sourceHash,views,checks,errors},null,2)+'\n');
  console.log(`PASS: ${stage}, ${modes.join('/')}: exposed panes, clear door leaves and arrival, desktop/mobile captures, no page or shader errors.`);
}finally{await browser.close();server.kill();}
