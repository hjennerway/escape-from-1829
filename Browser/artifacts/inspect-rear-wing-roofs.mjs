import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const stage=process.argv[2]??'after';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:'1841'}});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1200,height:850}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body></body>'}));
  await page.goto('http://127.0.0.1:1841/capture.html');
  await page.evaluate(async()=>{
    const THREE=await import('./vendor/three.module.js');
    const {createEscapeExterior}=await import('./escape-exterior.mjs');
    const {createAerialLayouts}=await import('./aerial-layouts.mjs');
    document.body.style.margin='0';
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
    ['aerial',[-98,82,-135],[0,5,-8],46],
    ['rear-detail',[-64,54,-99],[0,7,-13],44],
    ['west',[-53,31,-57],[-31,12,-28],42],
    ['east',[8,29,-58],[31,10,-28],42],
    ['east-end',[31,12,-64],[31,8,-29],42]
  ]){
    await page.evaluate(({position,target,fov})=>window.shot(position,target,fov),{position,target,fov});
    await page.screenshot({path:`Browser/artifacts/rear-wing-roofs-${name}-${stage}.jpg`,quality:90});
  }
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS: rear aerial, west hip, east roof and east end rendered without browser errors.');
}finally{await browser.close();server.kill();}
