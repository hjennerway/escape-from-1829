import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const stage=process.argv[2]??'before',mode=stage.endsWith('compiled')?'compiled':'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__ends={THREE,exterior,renderer,controls,layouts};function frame(){if(!window.__freezeEnds)requestAnimationFrame(frame);')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.__ends?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 await page.evaluate(()=>{window.__freezeEnds=true;const {exterior}=window.__ends;exterior.scene.fog.density=0;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});});
 const views=[
  ['church',[24,36,-60],[16,0,-94],false],
  ['central',[112,42,-18],[88,0,-52],false],
  ['upton',[62,40,-135],[34,0,-174],false],
  ['south',[186,40,371],[165,0,340],false],
  ['modern-west',[-34,420,300],[80,0,70],true],
  ['modern-east',[365,430,105],[365,0,20],true],
  ['church-walk',[-3,2,-93.55],[30,.2,-93.55],false],
  ['church-side',[16,2,-82],[16,.1,-94],false],
 ];
 await mkdir(new URL('.',import.meta.url),{recursive:true});
 for(const [name,position,target,modern] of views){
  if(process.argv[3]&&!name.startsWith(process.argv[3]))continue;
  const png=await page.evaluate(({position,target,modern})=>{
   const {exterior,renderer,controls,layouts}=window.__ends;
   if(exterior.timeline)exterior.timeline.setPeriod(modern?2021:1916);
   layouts.setVisible('historic',!modern);layouts.setVisible('modern',modern);
   exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=50;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(target);exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
   return renderer.domElement.toDataURL('image/png').split(',')[1];
  },{position,target,modern});
  await writeFile(new URL(stage+'-'+name+'.png',import.meta.url),Buffer.from(png,'base64'));
 }
 const build=await page.evaluate(()=>window.__ends.exterior.modelBuild);
 await writeFile(new URL(stage+'.json',import.meta.url),JSON.stringify({build,errors},null,2));
 if(errors.length)throw new Error(errors.join('\n'));
 if(mode==='compiled'&&build.mode!=='compiled')throw new Error('Compiled scene fell back to source');
 console.log('PASS '+stage+' road end previews');
}finally{await browser?.close();server.kill();}
