import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const stage=process.argv[2]??'after';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:'1839'}});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1224,height:918}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(stage==='before')await page.route('**/escape-exterior.mjs',async route=>{
    const response=await route.fetch(),body=(await response.text()).replace(
      'addCentralBack(THREE,{model,mesh,worldUV,brick:photoBrick,white,roof,material,details,box});',
      'hipRoof(0,13.2,14.2,12.8,14.65,2.9);');
    await route.fulfill({response,body});
  });
  await page.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body></body>'}));
  await page.goto('http://127.0.0.1:1839/capture.html');
  await page.evaluate(async()=>{
    const THREE=await import('./vendor/three.module.js');
    const {createEscapeExterior}=await import('./escape-exterior.mjs');
    const {createAerialLayouts}=await import('./aerial-layouts.mjs');
    document.body.innerHTML='';document.body.style.margin='0';
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
    renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    const exterior=createEscapeExterior(THREE,innerWidth/innerHeight);
    createAerialLayouts(THREE,exterior);exterior.scene.fog.density=0;
    exterior.model.traverse(object=>{if(object.isSprite)object.visible=false;});
    window.shot=(position,target,fov)=>{
      exterior.camera.position.set(...position);exterior.camera.lookAt(...target);
      exterior.camera.fov=fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();
      renderer.render(exterior.scene,exterior.camera);
    };
  });
  for(const [name,position,target,fov] of [
    ['photo',[-18,1.8,-26],[-8.4,8.2,6],72],
    ['aerial',[-37,31,-57],[0,8,6],46],
    ['detail',[-21,17,-12],[-2,10,7],48],
    ['roof',[-22,33,-19],[0,13,12],46],
    ['front',[0,10,55],[0,9,17],42]
  ]){
    await page.evaluate(({position,target,fov})=>window.shot(position,target,fov),{position,target,fov});
    await page.screenshot({path:`Browser/artifacts/central-back-${name}-${stage}.jpg`,quality:90});
  }
  if(stage==='after')for(const [pageName,view] of [['explore','central-back-photo'],['aerial','central-back']]){
    await page.goto(`http://127.0.0.1:1839/${pageName}.html?view=${view}`);
    await page.waitForFunction(()=>document.querySelector('canvas')?.width>0);
    await page.waitForTimeout(1500);
    await page.screenshot({path:`Browser/artifacts/central-back-${pageName}-page.jpg`,quality:90});
  }
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS: rear photo direction, aerial, detail and fixed front render.');
}finally{await browser.close();server.kill();}
