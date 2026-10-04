import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const mode=process.argv[2]??'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1223,height:780}}),errors=[],checks=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(mode==='explore'){
    await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__walkProportions={walker,exterior,renderer,lighting};const clock=new THREE.Timer();')});});
    await page.goto(base+'/explore.html?view=east-photo');
    await page.waitForFunction(()=>window.__walkProportions?.renderer.info.render.frame>3);
    await page.evaluate(()=>{const {exterior,lighting,walker}=window.__walkProportions;lighting.setMode('day');exterior.scene.fog.density=0;exterior.trees.visible=false;walker.setObstacles();exterior.invalidateShadows();});
    for(const [name,width,height] of [['walking',1400,850],['mobile',390,844]]){
      await page.setViewportSize({width,height});
      await page.evaluate(()=>{window.__walkProportions.walker.setView({position:[64,1.8,51],target:[57,7,20],fov:62});});
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.screenshot({path:`Browser/artifacts/redesmere-proportions/explore-${name}.png`});
    }
    const walking=await page.evaluate(()=>{
      const {walker}=window.__walkProportions,results=[];
      for(const [name,x,z,steps] of [['bay',53.1,24.5,30],['beside-bay',50,23,20],['projection',61.5,28,20],['passage',76,27,40]]){
        walker.setView({position:[x,1.8,z],target:[x,1.8,z-10]});walker.keys.add('KeyW');
        for(let i=0;i<steps;i++)walker.update(.1);walker.keys.clear();
        results.push({name,x:walker.actor.x,z:walker.actor.z});
      }
      return results;
    });
    await writeFile('Browser/artifacts/redesmere-proportions/explore-browser.json',JSON.stringify({errors,walking},null,2)+'\n');
    console.log(JSON.stringify({walking}));
    const at=name=>walking.find(p=>p.name===name).z;
    assert(at('bay')>21.2&&at('bay')<21.5,'Walking stops at the new shallow bay with the live player radius');
    assert(at('beside-bay')<20.1&&at('beside-bay')>19.7,'Walking clears the cheek and stops at the adjoining wall');
    assert(at('projection')>25.2&&at('projection')<25.5,'Walking stops at the blank projection');
    assert(at('passage')<8,'The existing passage remains usable');
    assert.deepEqual(errors,[]);
    await writeFile('Browser/artifacts/redesmere-proportions/explore-browser.json',JSON.stringify({errors,walking},null,2)+'\n');
    console.log('PASS: actual Explore desktop/mobile rendering and bay, cheek, projection and passage walking.');
  }else{
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);','').replace('function frame(){','window.__proportions={exterior,renderer,controls};moved=true;function frame(){')});});
  await page.goto(base+'/aerial.html?models='+mode+'&period=1916&buildingDetail=full');
  await page.waitForFunction(()=>window.__proportions?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.__proportions.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.evaluate(()=>{const {exterior}=window.__proportions;exterior.scene.fog.density=0;exterior.trees.visible=false;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.invalidateShadows();document.querySelectorAll('body > :not(canvas)').forEach(o=>o.style.display='none');});
  for(const [name,position,target,fov,width,height] of [
    ['walking',[64,1.8,51],[57,7,20],62,1223,780],
    ['reference',[49,1.8,63],[58,6.1,20],53,688,917],
    ['detail',[64,16,45],[57.5,8,21],48,1223,780],
    ['plan',[56,60,23.1],[56,0,23],38,1223,780]
  ]){
    await page.setViewportSize({width,height});
    await page.evaluate(({position,target,fov})=>{const {exterior,controls}=window.__proportions;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls.sync(target);exterior.invalidateShadows();},{position,target,fov});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:`Browser/artifacts/redesmere-proportions/${mode}-${name}.png`});
    checks.push({name,position,target,fov,width,height});
  }
  assert.deepEqual(errors,[]);
  await writeFile(`Browser/artifacts/redesmere-proportions/${mode}-browser.json`,JSON.stringify({mode,errors,checks},null,2)+'\n');
  console.log('PASS: '+mode+' full-detail walking, reference, oblique and plan views without runtime or shader errors.');
  }
}finally{await browser?.close();server.kill();}
