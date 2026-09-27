import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const mode=process.argv[2]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1440,height:880}}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.__basement={exterior,renderer,controls,layouts};function frame(){')});
  });
  await page.goto(base+'/aerial.html?view=west-wing-side&models='+mode);
  await page.waitForFunction(()=>window.__basement?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__basement.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  const probes=await page.evaluate(async()=>{
    const THREE=await import('./vendor/three.module.js');
    const {WEST_SIDE_BASEMENT:b}=await import('./west-side-basement.mjs');
    const {exterior}=window.__basement,meshes=[];
    exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o)});
    const ray=new THREE.Raycaster(),height=(x,z)=>{
      ray.set(new THREE.Vector3(x,.9,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(meshes,false)[0]?.point.y;
    };
    return {level:b.level,grade:b.grade,steps:Array.from({length:b.steps},(_,i)=>({
      actual:height(b.stairX+(i+.5)*b.tread,b.entry+1),expected:b.grade-(b.grade-b.level)*(i+1)/b.steps+.001
    })),floor:[-32,-25,-18,-4,-2].map(z=>height(-38.3,z)),
      ground:[[-41,-26.05],[-41,-25.95],[-43,-26.05],[-43,-25.95]].map(([x,z])=>height(x,z))};
  });
  for(const step of probes.steps)assert(Math.abs(step.actual-step.expected)<1e-5);
  for(const height of probes.floor)assert(Math.abs(height-probes.level)<1e-5);
  for(const height of probes.ground)assert(Math.abs(height-probes.grade)<.01);
  await page.evaluate(()=>{
    const {exterior}=window.__basement;exterior.scene.fog.density=0;
    exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
    document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');
    exterior.invalidateShadows();
  });
  for(const [name,position,target,fov] of [
    ['reference',[-63,24,-53],[-36,5,-13],50],
    ['stairs',[-44,4.7,-39],[-38.7,-.3,-32.8],62],
    ['passage',[-42,3.8,-26],[-38.3,.3,-10],61],
    ['door',[-42.8,1.8,-34.7],[-37.9,.35,-34.7],64],
    ['junction',[-47,19,-14],[-36.9,13.5,-.4],44]
  ]){
    await page.evaluate(({position,target,fov})=>{
      const {exterior,controls}=window.__basement;
      exterior.camera.position.set(...position);exterior.camera.lookAt(...target);
      exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);
    },{position,target,fov});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:fileURLToPath(new URL('west-basement-'+mode+'-'+name+'.png',import.meta.url))});
  }
  assert.deepEqual(errors,[]);console.log('PASS: '+mode+' stairs, lower floor, level court/lawn, door and upper junction render without errors.');
}finally{await browser?.close();server.kill();}
