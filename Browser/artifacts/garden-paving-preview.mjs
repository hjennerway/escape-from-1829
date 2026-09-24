import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const stage=process.argv[2]??'before';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const baseURL=await new Promise(resolve=>server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1549,height:771}});
 await page.route('**/capture.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0"></body>'}));
 await page.goto(baseURL+'/capture.html');
 await page.evaluate(async(stage)=>{
  const THREE=await import('./vendor/three.module.js');
  const {createEscapeExterior}=await import('./escape-exterior.mjs');
  const {createAerialLayouts}=await import('./aerial-layouts.mjs');
  const exterior=stage==='compiled'?(await (await import('./aerial-scene.mjs')).loadAerialScene(THREE,innerWidth/innerHeight,{search:'?models=compiled&buildingDetail=full'})).exterior:createEscapeExterior(THREE,innerWidth/innerHeight);
  if(stage==='compiled'&&exterior.modelBuild.mode!=='compiled')throw new Error('Compiled scene did not load');
  if(stage!=='compiled')createAerialLayouts(THREE,exterior);
  exterior.scene.fog.density=0;exterior.trees.visible=false;
  exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.invalidateShadows();
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  exterior.camera.position.set(86,65,83);exterior.camera.lookAt(79,0,33);exterior.camera.fov=38;exterior.camera.updateProjectionMatrix();
  renderer.render(exterior.scene,exterior.camera);
 },stage);
 await page.screenshot({path:`Browser/artifacts/garden-paving-${stage}.jpg`,quality:75});
}finally{await browser.close();server.kill();}



