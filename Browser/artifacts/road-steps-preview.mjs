import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const stage=process.argv[2]??'before',mode=stage==='compiled'?'compiled':'source',walking=stage==='walking';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 if(stage==='baseline')for(const name of ['road-style','historic-roads','modern-roads','modern-entrance','countess-roundabout','modern-car-park']){
  await page.route('**/'+name+'.mjs',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL('./road-steps-before-source/'+name+'.mjs',import.meta.url),'utf8')}));
 }
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__roads={THREE,exterior,renderer,controls,layouts};function frame(){if(!window.__roadsFreeze)requestAnimationFrame(frame);')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__roads={THREE,exterior,renderer,walker,layouts:exterior.layouts};const clock=new THREE.Timer();')});});
 await page.goto(base+(walking?'/explore.html':'/aerial.html?models='+mode+'&buildingDetail=full'));
 await page.waitForFunction(()=>window.__roads?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 await page.evaluate(()=>{const {exterior,renderer}=window.__roads;window.__roadsFreeze=true;renderer.setAnimationLoop(null);exterior.trees.visible=true;exterior.invalidateShadows();});
 const views=[
  ['annexe-seam',[316,1.85,-59],[322,-1.2,-48],67],
  ['annexe-estates',[284,1.85,-59],[313,.35,-68],65],
  ['annexe-avenue',[306,1.85,-65],[330,.35,-50],65],
  ['estates-court',[239,1.85,14],[229,.35,-8],65],
  ['admin-front',[215,1.85,46],[193,.34,37],65],
  ['reception',[0,1.85,80],[0,.34,58],65],
  ['overview',[277,130,35],[295,0,-53],55],
  ['roundabout',null,null,65,'modern'],
  ['car-park',null,null,65,'modern']
 ].filter(v=>!process.argv[3]||v[0]===process.argv[3]);
 for(const [name,position,target,fov,layout] of views){
  const png=await page.evaluate(({name,position,target,fov,layout})=>{
   const {THREE,exterior,renderer,controls,layouts}=window.__roads;
   layouts.setVisible('historic',layout!=='modern');layouts.setVisible('modern',layout==='modern');
   exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
   if(!position){
    const owner=name==='roundabout'?layouts.countessRoundabout.getObjectByName('Countess roundabout asphalt'):layouts.carPark;
    const points=owner===layouts.carPark?owner.userData.outline:layouts.countessRoundabout.userData.outline;
    const a=points[0],b=points[1],mid=a.map((v,i)=>(v+b[i])/2),centre=new THREE.Box3().setFromObject(owner).getCenter(new THREE.Vector3());
    const direction=new THREE.Vector3(centre.x-mid[0],0,centre.z-mid[1]).normalize();
    position=[mid[0]-direction.x*5,1.85,mid[1]-direction.z*5];target=[mid[0]+direction.x*14,.34,mid[1]+direction.z*14];
   }
   exterior.camera.near=.1;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls?.sync(target);exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
   return renderer.domElement.toDataURL('image/png').split(',')[1];
  },{name,position,target,fov,layout});
  await writeFile(`Browser/artifacts/road-steps-${stage}-${name}.png`,Buffer.from(png,'base64'));
 }
 const selectedMode=await page.evaluate(()=>window.__roads.exterior.modelBuild?.mode??'walking');
 if(stage==='compiled'&&selectedMode!=='compiled')throw new Error('Compiled preview fell back to source');
 await writeFile(`Browser/artifacts/road-steps-${stage}.json`,JSON.stringify({mode:selectedMode,errors},null,2));
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: '+stage+' road previews.');
}finally{await browser?.close();server.kill();}
