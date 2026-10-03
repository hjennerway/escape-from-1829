import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const out=new URL('./artifacts/exterior-stair-clearance/',import.meta.url);await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const views=[
 {name:'east-u',position:[15,7,-34],target:[21.5,3.4,-27.5],fov:62},
 {name:'west-u',position:[-15,7,-34],target:[-21.5,3.4,-27.5],fov:62},
 {name:'east-turn',position:[21.1,5.95,-30.9],target:[21.1,5.4,-25.8],fov:78},
 {name:'east-foot',position:[20.3,2.15,-30.5],target:[20.3,4.5,-25.8],fov:72},
 {name:'rear-return',position:[60,5,-25],target:[64.5,2.5,-31],fov:62}
];
try{
 const page=await browser.newPage({viewport:{width:1200,height:850}}),errors=[],report={};
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.stairTest={walker,exterior,renderer,lighting};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.stairTest?.renderer.info.render.frame>3);
 await page.locator('[data-lighting="day"]').click();
 views.push(...await page.evaluate(()=>{
  const {exterior}=window.stairTest,result=[];
  exterior.model.traverse(group=>{
   if(!group.children.some(o=>o.name==='Blue external stair tread'))return;
   const point=p=>group.localToWorld(exterior.camera.position.clone().set(...p)).toArray();
   result.push({name:'annexe-'+result.length,position:point([-40,8,8]),target:point([-31,3,-1]),fov:60});
  });return result;
 }));
 report.explore=await page.evaluate(()=>{
  const {walker}=window.stairTest,result=[];
  for(const side of [-1,1]){
   const route=[[20.3,-30.5],[20.3,-25.8],[21.9,-25.8],[21.9,-30.9],[20.3,-30.9],[20.3,-25.8],[23.4,-25.8]].map(([x,z])=>[side*x,z]);
   walker.setView({position:[route[0][0],2.1,route[0][1]],target:[route[1][0],2.1,route[1][1]]});
   const trace=[];
   function follow(points){
    for(const [x,z] of points){
     const a=walker.actor;walker.setView({position:[a.x,a.y+1.8,a.z],target:[x,a.y+1.8,z]});walker.keys.add('KeyW');
     for(let i=0;i<1500&&Math.hypot(a.x-x,a.z-z)>.02;i++)walker.update(Math.min(.005,Math.hypot(a.x-x,a.z-z)/5));
     walker.keys.clear();walker.update(.1);
     if(Math.hypot(a.x-x,a.z-z)>.03)throw Error('Unreachable stair turn '+JSON.stringify({actor:a,target:[x,z]}));
     trace.push({x:a.x,y:a.y,z:a.z});
    }
   }
   follow(route.slice(1));if(walker.actor.y<5.85)throw Error('Upper stair door was not reached');
   follow([...route].reverse().slice(1));if(walker.actor.y>.5)throw Error('Stair descent did not reach the grounds');
   result.push({side,trace});
  }
  return result;
 });
 for(const view of views){await page.evaluate(v=>window.stairTest.walker.setView(v),view);await page.screenshot({path:fileURLToPath(new URL('explore-'+view.name+'.png',out))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.stairTest.walker.setView({...v,fov:85}),views[0]);
 await page.screenshot({path:fileURLToPath(new URL('explore-mobile.png',out))});
 await page.setViewportSize({width:1200,height:850});
 await page.route('**/game.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+`
window.stairGame={get ready(){return ready;},boot(){start();arrivalCutscene.update(3);state='paused';},pose(x,y,z){Object.assign(player,{x,y,z,floor:2,outside:true,stair:null,verticalTrend:0});state='paused';keys.clear();},get player(){return player;},step(dx,dz,dt){yaw=Math.atan2(-dx,-dz);keys.clear();keys.add('KeyW');state='play';update(dt);state='paused';keys.clear();}};`});});
 await page.goto(base+'/');await page.waitForFunction(()=>window.stairGame?.ready);await page.evaluate(()=>window.stairGame.boot());
 report.game=await page.evaluate(()=>{
  const t=window.stairGame,result=[];
  for(const side of [-1,1]){
   const route=[[20.3,-30.5],[20.3,-25.8],[21.9,-25.8],[21.9,-30.9],[20.3,-30.9],[20.3,-25.8],[23.4,-25.8]].map(([x,z])=>[side*x,z]);
   t.pose(route[0][0],.3,route[0][1]);
   function follow(points){for(const [x,z] of points){for(let i=0;i<2000&&Math.hypot(t.player.x-x,t.player.z-z)>.025;i++){const dx=x-t.player.x,dz=z-t.player.z;t.step(dx,dz,Math.min(.01,Math.hypot(dx,dz)/3.1));}if(Math.hypot(t.player.x-x,t.player.z-z)>.035)throw Error('Game staircase blocked '+JSON.stringify({actor:t.player,target:[x,z]}));}}
   follow(route.slice(1));const top=t.player.y;if(top<5.85)throw Error('Game climb failed');
   follow([...route].reverse().slice(1));if(t.player.y>.5)throw Error('Game descent failed');result.push({side,top,bottom:t.player.y});
  }
  return result;
 });
 if(process.argv.includes('--compiled')){
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.stairAerial={exterior,renderer,controls,lighting,pose(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);}};function frame(){')});});
  for(const mode of ['source','compiled']){
   await page.goto(base+'/aerial.html?models='+mode+'&view=inner-east-photo');await page.waitForFunction(()=>window.stairAerial?.renderer.info.render.frame>3);
   const actual=await page.evaluate(()=>window.stairAerial.exterior.modelBuild.mode);assert.equal(actual,mode==='source'?'procedural':'compiled');
   for(const view of [views[0],views[1],views[4],...views.filter(v=>v.name.startsWith('annexe-'))]){await page.evaluate(v=>{window.stairAerial.lighting.setMode('day');window.stairAerial.pose(v);},view);await page.screenshot({path:fileURLToPath(new URL(mode+'-'+view.name+'.png',out))});}
   report[mode]=actual;
  }
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('browser-validation.json',out),JSON.stringify({...report,errors},null,2)+'\n');
 console.log('PASS: actual Explore and Escape loops climb/descend both U-shaped stairs; desktop/mobile captures and optional source/compiled views; no browser or shader errors.');
}finally{await browser.close();server.kill();}
