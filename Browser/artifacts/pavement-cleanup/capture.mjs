import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const stage=process.argv[2]??'before',mode=stage.includes('compiled')?'compiled':'source',walking=stage.includes('walking');
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1440,height:800}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__kerbs={THREE,exterior,renderer,controls,layouts};function frame(){if(!window.__freezeKerbs)requestAnimationFrame(frame);')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__kerbs={THREE,exterior,renderer,walker,layouts};const clock=new THREE.Timer();')});});
 await page.goto(base+(walking?'/explore.html':'/aerial.html')+'?models='+mode+'&buildingDetail=full&view=estates-photo&period=1916'+(stage.includes('day')?'&lighting=day':''));
 await page.waitForFunction(()=>window.__kerbs?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 await page.evaluate(stage=>{window.__freezeKerbs=true;const {exterior,renderer}=window.__kerbs;renderer.setAnimationLoop(null);exterior.timeline.setPeriod(1916);exterior.scene.fog.density=0;
  if(stage.startsWith('depth-probe'))exterior.model.traverse(o=>{for(const m of [o.material].flat())if(m?.color?.getHex()===0xb8b9af)m.polygonOffsetFactor=0;});
 },stage);
 const {estatesPoint}=await import('../../dist/estates-department.mjs');
 const views=[
  ['entrance',estatesPoint(227,1.9,-47.4),estatesPoint(248.5,3.9,-49.5),64],
  ['short',estatesPoint(227,1.9,-47),estatesPoint(236.5,2,-40),67],
  ['long',estatesPoint(220,1.9,-56.6),estatesPoint(233.8,1.9,-56.6),67],
  ['court-close',[233.6,1.9,-40.6],[237.2,.30,-37.4],67],
  ['court-far',[228,1.9,-45],[238,.7,-36],67],
  ['middle-road',[246,1.9,-59],[237,1.3,-44],70],
  ['island',[258,1.9,-62],[231,1.2,-49],67],
  ['plan',[245,64,-34.99],[245,0,-35],48],
  ['oblique',[214,25,-25],[241,0,-41],52],
  ['forecourt',[213,1.9,75],[198,.35,59],67],
  ['teardrop',[242,1.9,45],[252,.35,34],67],
  ['annexe-fork',[313,1.9,-73],[322,.35,-77],67],
  ['annexe-entrance',[262,1.9,10],[266,.35,-7],67],
  ['church',[-16,1.9,-90],[-3,.2,-106],67],
  ['entrance-drive',[-9,1.9,67],[0,.34,57],67],
  ['shared-bend',[170,1.9,-91],[183,.34,-94],67],
  ['parking-bend',[83,1.9,-120],[90,.34,-130],67],
  ['parking-concave',[105,1.9,-53],[94,.34,-61],67]
 ];
 await mkdir(new URL('.',import.meta.url),{recursive:true});
 for(const [name,position,target,fov] of views){
  const png=await page.evaluate(({name,position,target,fov})=>{
   const {exterior,renderer,controls}=window.__kerbs;
   exterior.timeline.setPeriod(name.startsWith('parking')||name==='shared-bend'?2021:1916);
   exterior.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
   exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls?.sync(target);exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
   return renderer.domElement.toDataURL('image/png').split(',')[1];
  },{name,position,target,fov});
  await writeFile(new URL(stage+'-'+name+'.png',import.meta.url),Buffer.from(png,'base64'));
 }
 const build=await page.evaluate(()=>window.__kerbs.exterior.modelBuild);
 await writeFile(new URL(stage+'.json',import.meta.url),JSON.stringify({build,errors},null,2));
 if(errors.length)throw new Error(errors.join('\n'));
 if(mode==='compiled'&&build.mode!=='compiled')throw new Error('Compiled scene fell back to source');
 console.log('PASS '+stage+' Estates kerb previews');
}finally{await browser?.close();server.kill();}
