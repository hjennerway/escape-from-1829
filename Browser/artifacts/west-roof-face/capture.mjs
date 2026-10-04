import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'after',destination=new URL('./',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1567,height:830}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0"></body>'}));
 if(stage==='before')for(const name of ['escape-exterior.mjs','west-front-setback.mjs','front-inside-corners.mjs','west-range-plan.mjs']){
  const body=await readFile(new URL('before-'+name,destination),'utf8');
  await page.route('**/'+name,route=>route.fulfill({contentType:'text/javascript',body}));
 }
 await page.goto(base+'/capture.html');
 const data=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{createEscapeExterior}=await import('/escape-exterior.mjs'),{createAerialLayouts}=await import('/aerial-layouts.mjs');
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  const exterior=createEscapeExterior(THREE,innerWidth/innerHeight),layouts=createAerialLayouts(THREE,exterior);exterior.scene.fog.density=0;
  layouts.setVisible('modern',false);layouts.setVisible('historic',true);exterior.trees.visible=false;exterior.invalidateShadows();exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
  const views={marked:{position:[-27,26,55],target:[-45,8,18],fov:50},close:{position:[-28,23,41],target:[-42,10,17],fov:50},opposite:{position:[-72,37,51],target:[-40,7,22],fov:50},plan:{position:[-39,65,23],target:[-39,0,23],fov:39}};
  window.review={exterior,layouts,renderer,views,show(name){const v=views[name];exterior.camera.up.set(...(name==='plan'?[1,0,0]:[0,1,0]));exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);},pick(x,y){const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),exterior.camera);const parts=[];exterior.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});const h=ray.intersectObjects(parts,false)[0];return h&&{name:h.object.name,point:h.point.toArray()};}};
  return {views};
 });
 for(const name of Object.keys(data.views)){await page.evaluate(name=>window.review.show(name),name);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',destination))});
  if(name==='close')data.closePicks=await page.evaluate(()=>[[970,521],[951,536],[987,490]].map(p=>({pixel:p,...window.review.pick(...p)})));
  if(name==='marked'){
   data.picks=await page.evaluate(()=>[[1002,372],[1063,373],[996,432]].map(p=>({pixel:p,...window.review.pick(...p)})));
   data.projections=await page.evaluate(async()=>{const THREE=await import('/vendor/three.module.js'),e=window.review.exterior,out={};for(const name of ['West garden inner projecting pavilion','West forward stepped root masonry','West forward inset root east slate roof','West forward stepped root slate roof','West courtyard aligned range','Entrance west recessed slate roof']){const o=e.model.getObjectByName(name);if(!o){out[name]=null;continue;}const b=new THREE.Box3().setFromObject(o),p=b.getCenter(new THREE.Vector3()).project(e.camera);out[name]={min:b.min.toArray(),max:b.max.toArray(),pixel:[(p.x+1)/2*innerWidth,(1-p.y)/2*innerHeight]};}return out;});
  }
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL(stage+'-validation.json',destination),JSON.stringify({...data,errors},null,2)+'\n');
 console.log(JSON.stringify({picks:data.picks,closePicks:data.closePicks,errors},null,2));
}finally{await browser.close();server.kill();}
