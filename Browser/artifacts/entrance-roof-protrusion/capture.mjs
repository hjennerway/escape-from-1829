import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';

const stage=process.argv[2]??'after',mode=process.argv[3]??'source';
const sourceHash=await modelSourceHash();
await mkdir(new URL('./',import.meta.url),{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const views={
  west:{position:[-37,30,45],target:[-16,12.8,16.5],fov:45},
  westClose:{position:[-31,21,29],target:[-22,13.5,17.5],fov:38},
  eastClose:{position:[31,21,29],target:[22,13.5,17.5],fov:38},
  westLow:{position:[-31,14.5,28],target:[-22,13.5,17.5],fov:38},
  junction:{position:[-16,20,24],target:[-7.5,14.4,16.7],fov:35}
};
let browser;
try{
  browser=await launchHardwareBrowser();
  const page=await browser.newPage({viewport:{width:1400,height:950}}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',r=>r.abort());
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={THREE,exterior,renderer,show(v){moved=true;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);}};function frame(){')});
  });
  await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
  await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
  const build=await page.evaluate(()=>window.review.exterior.modelBuild);
  assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  for(const [name,view] of Object.entries(views)){
    await page.evaluate(v=>window.review.show(v),view);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',import.meta.url))});
  }
  const survey=await page.evaluate(()=>{
    const {THREE,exterior:e}=window.review,ray=new THREE.Raycaster();e.model.updateMatrixWorld(true);
    const material=e.model.getObjectByName('Entrance west projection slate roof').material,roofs=[];
    e.model.traverse(o=>{if(o.isMesh&&o.material===material)roofs.push(o);});
    return [-1,1].map(side=>({side,probes:[[7.2,16.7],[7.4,16.7],[7.6,16.7],[7.8,16.7],[7.4,17],[7.6,17],[7.8,17],[7.4,17.2],[7.6,17.2],[7.8,17.2]].map(([x,z])=>{
      ray.set(new THREE.Vector3(side*x,30,z),new THREE.Vector3(0,-1,0));
      return {x:side*x,z,hits:ray.intersectObjects(roofs,false).map(h=>({name:h.object.name,point:h.point.toArray()}))};
    })}));
  });
  const tip=await page.evaluate(()=>{
    const {THREE,exterior:e}=window.review,ray=new THREE.Raycaster();
    const edge=e.model.getObjectByName('Entrance west slate pitches to render edge');
    const lower=e.model.getObjectByName('Entrance west recessed slate roof');
    const height=(object,x,z)=>{
      ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
      return ray.intersectObject(object,false)[0]?.point.y;
    };
    return [-8.1,-7.9,-7.7,-7.51,-7.3,-7.11].map(x=>({x,
      lower:height(lower,x,16.6999),seam:height(edge,x,16.7001),
      heights:[16.7001,16.85,17,17.2].map(z=>({z,y:height(edge,x,z)}))}));
  });
  if(stage!=='before')for(const p of tip){
    assert(Math.abs(p.lower-p.seam)<.001,'The lower roof join has no upward tip or open seam');
    for(const h of p.heights)assert(h.y>13.13&&h.y<13.4,'The repaired entrance slate stays below Reception\'s cornice');
  }
  assert.deepEqual(errors,[]);
  assert.equal(await modelSourceHash(),sourceHash,'Model source changed during the focused capture');
  await writeFile(new URL(stage+'-'+mode+'-validation.json',import.meta.url),JSON.stringify({sourceHash,build,errors,views,survey,tip},null,2)+'\n');
  console.log('PASS: '+stage+' '+mode+' entrance roof and immediate joins rendered on verified hardware.');
}finally{await browser?.close();server.kill();}
