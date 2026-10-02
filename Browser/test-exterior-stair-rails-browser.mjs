import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const out=new URL('./artifacts/exterior-stair-rails/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:850}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.railTest={THREE,walker,exterior,renderer,lighting};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.railTest?.renderer.info.render.frame>3);
 await page.locator('[data-lighting="day"]').click();
 const views=[
  {name:'west-garden',position:[-54,6,33],target:[-62.6,4.5,23],fov:55},
  {name:'west-garden-upper',position:[-59,11,28],target:[-63,7,22],fov:60},
  {name:'west-garden-turn',position:[-62.1,6.1,26.05],target:[-62,6,21],fov:74},
  {name:'west-forward',position:[-48,6,52],target:[-42,3,45],fov:58},
  {name:'east-forward',position:[49,5,44],target:[42,3,36],fov:58},
  {name:'east-court',position:[78,7,-5],target:[69.5,4.5,3],fov:62},
  {name:'rear-return',position:[61,5,-25],target:[65,2.5,-31],fov:58},
  {name:'central',position:[15,4,-40],target:[8.9,3.5,-39],fov:64},
  {name:'inner-east',position:[15,7,-36],target:[22,3.5,-28],fov:60},
  {name:'inner-west',position:[-15,7,-36],target:[-22,3.5,-28],fov:60},
  {name:'front-steps',position:[7,5,31],target:[0,2,24],fov:58}
 ];
 // Optional selection keeps follow-up visual checks focused on changed views.
 const selected=process.argv.find(arg=>arg.startsWith('--views='))?.slice(8).split(',');
 const annexe=await page.evaluate(()=>{
  const {exterior,THREE}=window.railTest,result=[];
  exterior.model.traverse(g=>{
   if(!g.children.some(o=>o.name==='Blue external stair tread'))return;
   const position=g.localToWorld(new THREE.Vector3(-40,8,8)).toArray(),target=g.localToWorld(new THREE.Vector3(-31,3,-1)).toArray();
   result.push({name:'annexe-'+result.length,position,target,fov:60});
  });
  const pharmacy=exterior.model.getObjectByName('Tower service buildings').userData.pharmacy;
  for(const [i,s] of pharmacy.stairs.entries())result.push({name:'pharmacy-'+i,position:[s.x-4,4,s.z-7],target:[s.x-1,1.4,s.z-1.1],fov:64});
  return result;
 });views.push(...annexe);
 const captures=views.filter(v=>!selected||selected.includes(v.name));
 for(const view of captures){
  await page.evaluate(v=>window.railTest.walker.setView(v),view);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(view.name+'.png',out))});
 }
 await page.locator('[data-lighting="dusk"]').click();await page.evaluate(v=>window.railTest.walker.setView(v),views[0]);
 await page.screenshot({path:fileURLToPath(new URL('west-dusk.png',out))});
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.railTest.walker.setView({...v,fov:85}),views[0]);
 await page.screenshot({path:fileURLToPath(new URL('west-mobile.png',out))});
 const collision=await page.evaluate(()=>{
  const {walker}=window.railTest;walker.setView({position:[-62.1,6.12,26.05],target:[-62.1,6.12,30]});
  walker.keys.add('KeyW');for(let i=0;i<60;i++)walker.update(.02);walker.keys.clear();return {...walker.actor};
 });assert(collision.z<26.45&&collision.y>4.2,'Actual exploration movement stops at the west landing railing');
 assert.deepEqual(errors,[]);await writeFile(new URL(selected?'final-browser-validation.json':'browser-validation.json',out),JSON.stringify({views:captures.map(v=>v.name),collision,errors},null,2));
 console.log(`PASS: real exploration railing collision, ${captures.length} desktop views, dusk/mobile views, no browser or shader errors.`);
}finally{await browser.close();server.kill();}
