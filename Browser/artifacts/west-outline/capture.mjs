import {chromium} from 'playwright';
import {spawn,execFileSync} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'after',destination=new URL('./',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1224,height:918}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0"></body>'}));
 if(stage==='before')for(const [name,body] of Object.entries(JSON.parse(await readFile(new URL('before-sources.json',destination),'utf8')))){
  await page.route('**/'+name,route=>route.fulfill({contentType:'text/javascript',body}));
 }
 await page.goto(base+'/capture.html');
 const data=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{createEscapeExterior}=await import('/escape-exterior.mjs'),{createAerialLayouts}=await import('/aerial-layouts.mjs');
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  const exterior=createEscapeExterior(THREE,innerWidth/innerHeight),layouts=createAerialLayouts(THREE,exterior);exterior.scene.fog.density=0;
  layouts.setVisible('modern',false);layouts.setVisible('historic',true);exterior.trees.visible=false;exterior.invalidateShadows();exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
  const views={pair1:{position:[-66,1.8,36],target:[-46,7.5,24],fov:68},pair2:{position:[-63,1.8,46],target:[-53,7.5,20],fov:69},pair3:{position:[-54,1.8,50],target:[-53,7.5,20],fov:65},pair4:{position:[-105,1.8,29],target:[-72,7.6,15],fov:37},plan:{position:[-10,210,12],target:[-10,0,12],fov:39},aerial:{position:[-96,50,52],target:[-53,7,18],fov:50}};
  window.westProportions={exterior,layouts,renderer,views,show(name){const v=views[name];exterior.camera.up.set(...(name==='plan'?[1,0,0]:[0,1,0]));exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);}};
  const bounds={};for(const name of ['West front square pavilion','West curved bay','West end continuous wall','West end shallow centre','West front glazed extension']){const b=new THREE.Box3().setFromObject(exterior.model.getObjectByName(name));bounds[name]={min:b.min.toArray(),max:b.max.toArray()};}
  return {views,bounds};
 });
 for(const name of Object.keys(data.views)){await page.evaluate(name=>window.westProportions.show(name),name);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',destination))});}
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL(stage+'-validation.json',destination),JSON.stringify({...data,errors},null,2)+'\n');
 console.log('PASS: all four paired photo directions and west aerial rendered without page/shader errors.');
}finally{await browser.close();server.kill();}
