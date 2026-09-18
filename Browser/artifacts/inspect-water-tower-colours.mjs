import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const baseSource=await readFile(new URL('water-tower-colours-before.mjs.txt',import.meta.url),'utf8');
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
const data={},errors=[];
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:740,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__tower={exterior,layouts,controls,renderer};\nfunction frame(){')});});
 for(const version of (process.argv.includes('--compiled')?['compiled']:['before','after'])){
  if(version==='before')await page.route('**/water-tower.mjs',route=>route.fulfill({body:baseSource,contentType:'text/javascript'}));
  else await page.unroute('**/water-tower.mjs');
  await page.goto(base+'/aerial.html?models='+(version==='compiled'?'compiled':'source')+'&view=tower-3&period=2021');
  await page.waitForFunction(()=>window.__tower?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__tower.exterior.modelBuild.mode),version==='compiled'?'compiled':'procedural');
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav,#deviceLocationStatus {display:none!important}'});
  data[version]=await page.evaluate(()=>{
   const {exterior}=window.__tower,tower=exterior.waterTower;
   return {position:tower.position.toArray(),scars:[1,3,4].map(n=>{
    const face=tower.children.find(f=>f.userData.photoSide===n),scar=face.getObjectByName('Descending intersecting roof scars');
    return {side:n,matrix:face.matrixWorld.elements,meshes:scar.children.map(m=>({positions:[...m.geometry.attributes.position.array],color:m.material.color.toArray()}))};
   })};
  });
  for(const side of [1,2,3,4]){
   await page.evaluate(side=>{
    const {exterior,controls}=window.__tower,{camera,waterTower}=exterior;
    const angle=[0,0,-Math.PI/2,Math.PI,Math.PI/2][side],{x,z}=waterTower.position,target=[x,9,z];
    camera.position.set(x+Math.sin(angle)*26,10.5,z+Math.cos(angle)*26);camera.fov=45;camera.updateProjectionMatrix();camera.lookAt(...target);controls.sync(target);
   },side);
   await page.waitForTimeout(300);
   await page.screenshot({path:new URL('water-tower-colours-'+version+'-'+side+'.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
  }
 }
 if(!process.argv.includes('--compiled'))assert.deepEqual(data.after,data.before,'The tower placement and every roof scar vertex/material must remain unchanged');
 assert.deepEqual(errors,[]);
 await writeFile(new URL('water-tower-colours'+(process.argv.includes('--compiled')?'-compiled':'')+'-validation.json',import.meta.url),JSON.stringify({mode:process.argv.includes('--compiled')?'compiled':'procedural',roofScarsUnchanged:process.argv.includes('--compiled')?undefined:true,browserErrors:errors,sides:[1,2,3,4]},null,2)+'\n');
 console.log(process.argv.includes('--compiled')?'PASS: rebuilt compiled model renders all four tower sides without browser errors.':'PASS: all four sides rendered before/after; exact roof scar geometry, colours and tower placement preserved; no browser errors.');
}finally{await browser?.close();server.kill();}

