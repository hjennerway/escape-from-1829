import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const stage=process.argv[2]??'draft',out=new URL('./',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await launchHardwareBrowser();
try{
  const page=await browser.newPage({viewport:{width:1224,height:918}}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  if(stage==='draft'){
    let source=await readFile(new URL('../../dist/west-front-photo-detail.mjs',import.meta.url),'utf8');
    source=source.replace("import {addExteriorStairRail} from './exterior-stair-rail.mjs';","import {addWestGardenStair} from './west-garden-stair.mjs';");
    source=source.replace(/  for\(const \[x,y\] of \[\[-58\.6,4\.25\],\[-58,8\.5\]\]\).*\r?\n/,'');
    source=source.replace(/  const stair=new THREE.Group\(\);stair.name='West front iron return stair';[\s\S]*?(?=  \/\/ Lower forward range:)/,"  addWestGardenStair(THREE,{model,iron,door});\n\n");
    await page.route('**/west-front-photo-detail.mjs',r=>r.fulfill({contentType:'text/javascript',body:source}));
    const draft=await readFile(new URL('west-garden-stair.mjs',out),'utf8');
    await page.route('**/west-garden-stair.mjs',r=>r.fulfill({contentType:'text/javascript',body:draft}));
  }
  if(stage==='before'){
    const source=await readFile(new URL('before-Browser_dist_west-front-photo-detail.mjs',out),'utf8');
    await page.route('**/west-front-photo-detail.mjs',r=>r.fulfill({contentType:'text/javascript',body:source}));
  }
  if(stage==='compiled')await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('function frame(){',`window.stairTest={THREE,exterior,renderer,walker:{setView(v){moved=true;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);}}};function frame(){`)});
  });
  await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.stairTest={THREE,walker,exterior,renderer,lighting};const clock=new THREE.Timer();')});});
  await page.goto(base+(stage==='compiled'?'/aerial.html?models=compiled&view=west-2':'/explore.html'));await page.waitForFunction(()=>window.stairTest?.renderer.info.render.frame>3);
  if(stage==='compiled')assert.equal(await page.evaluate(()=>window.stairTest.exterior.modelBuild.mode),'compiled');
  await page.locator('[data-lighting="day"]').click();
  await page.addStyleTag({content:'body>*:not(canvas):not(script):not(style){visibility:hidden!important}'});
  const views=[
    {name:'ground',position:[-57,2.1,32],target:[-62,6,16],fov:60},
    {name:'landing',position:[-57,8,24],target:[-62,5.5,16.5],fov:64},
    {name:'overhead',position:[-61,22,23],target:[-61,4.3,16.7],fov:54}
  ];
  for(const view of views){
    await page.evaluate(v=>{window.stairTest.walker.setView(v);window.stairTest.exterior.scene.fog.density=0;},view);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:fileURLToPath(new URL(stage+'-'+view.name+'.png',out))});
  }
  if(stage!=='before'&&stage!=='compiled'){
    const result=await page.evaluate(stage=>{
      const {walker,THREE,exterior}=window.stairTest,outside=walker.outside;
      // Exercise the actual Explore movement, including middle door access.
      const route=[[-60.3,14.8],[-60.3,20.0],[-63,20.0],[-63,14.3],[-63,20.0],[-61.65,20.0],[-61.65,16.0],[-61.65,14.9],[-63,14.9],[-63,14.3]];
      const poses=[];
      walker.setView({position:[-60.3,2.1,14.8],target:[-60.3,2.1,15.8]});
      function follow(points){for(const [x,z] of points){
        for(let i=0;i<1800&&Math.hypot(walker.actor.x-x,walker.actor.z-z)>.04;i++){
          const angle=Math.atan2(x-walker.actor.x,z-walker.actor.z);
          walker.setView({position:[walker.actor.x,walker.actor.y+1.8,walker.actor.z],target:[walker.actor.x+Math.sin(angle),walker.actor.y+1.8,walker.actor.z+Math.cos(angle)]});
          walker.keys.add('KeyW');walker.update(.007);walker.keys.clear();
        }
        if(Math.hypot(walker.actor.x-x,walker.actor.z-z)>.08)throw new Error('Blocked stair route '+JSON.stringify({target:[x,z],actor:walker.actor,poses}));
        poses.push({...walker.actor});
      }}
      follow(route.slice(1));
      if(walker.actor.y<8.4)throw new Error('Upper door unreachable '+JSON.stringify(poses));
      follow([...route].reverse().slice(1));
      if(walker.actor.y>.7)throw new Error('Stair descent failed '+JSON.stringify(poses));
      if(stage==='after'){
        follow(route.slice(1,4));
        if(walker.nearbyDoor()?.id!=='F4'||!walker.useDoor()||walker.actor.outside)throw new Error('Moved door cannot enter the building');
        if(!walker.useDoor()||!walker.actor.outside)throw new Error('Moved door cannot return to the platform');
        if(Math.hypot(walker.actor.x+63,walker.actor.z-14.3)>.05)throw new Error('Moved door returns to the wrong platform');
        if(exterior.camera.getWorldDirection(new THREE.Vector3()).z<.99)throw new Error('Leaving the moved door faces the old wall');
      }
      return {poses};
    },stage);
    await writeFile(new URL(stage+'-walk.json',out),JSON.stringify(result,null,2));
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(v=>window.stairTest.walker.setView({...v,fov:85}),views[0]);
  await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',out))});
  assert.deepEqual(errors,[]);console.log('PASS: '+stage+' GPU screenshots and Explore stair access.');
}finally{await browser.close();server.kill();}
