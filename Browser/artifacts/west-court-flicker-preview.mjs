import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const stage=process.argv[2]??'after',mode=stage==='compiled'?'compiled':'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1440,height:880}}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__court={THREE,exterior,renderer,controls,layouts};function frame(){')});
  });
  await page.goto(base+'/aerial.html?models='+mode);
  await page.waitForFunction(()=>window.__court?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__court.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  const views=[
    ['aerial',[-80,200,130],[-25,0,-8],46],
    ['aerial-shift',[-78,200,132],[-25,0,-8],46],
    ['distant',[-100,530,270],[-45,0,-10],46],
    ['court',[-85,35,-48],[-50,0,-12],46],
    ['stairs',[-44,4.7,-39],[-38.7,-.3,-32.8],62]
  ];
  for(const [name,position,target,fov] of views){
    await page.evaluate(({position,target,fov})=>{
      const {exterior,controls}=window.__court;
      exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;
      exterior.camera.updateProjectionMatrix();controls.sync(target);exterior.invalidateShadows();
    },{position,target,fov});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:`Browser/artifacts/west-court-flicker-${stage}-${name}.png`});
  }
  const samples=await page.evaluate(()=>{
    const {THREE,exterior,layouts}=window.__court,ray=new THREE.Raycaster(),results=[];
    for(const historic of [false,true])for(const modern of [false,true]){
      layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
      exterior.model.updateMatrixWorld(true);const meshes=[];
      exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o)});
      results.push({historic,modern,points:[[-60,-15],[-73,-33],[-73,1],[-42.5,-34.7],[-50,-30],[-38.3,-18]].map(([x,z])=>{
        ray.set(new THREE.Vector3(x,.9,z),new THREE.Vector3(0,-1,0));
        return {x,z,hits:ray.intersectObjects(meshes,false).map(h=>({name:h.object.name,parent:h.object.parent.name,y:h.point.y}))};
      })});
    }
    return results;
  });
  assert.deepEqual(errors,[]);
  await writeFile(`Browser/artifacts/west-court-flicker-${stage}.json`,JSON.stringify({mode,views,samples,errors},null,2)+'\n');
  console.log(`PASS: ${stage} courtyard aerial, shifted, distant, close and stair views; ground surface probes saved.`);
}finally{await browser?.close();server.kill();}
