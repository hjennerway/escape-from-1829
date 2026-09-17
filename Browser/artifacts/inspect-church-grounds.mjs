import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:'1843'}});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body></body>'}));
 await page.goto('http://127.0.0.1:1843/capture.html');
 await page.evaluate(async()=>{
  const THREE=await import('./vendor/three.module.js');
  const {createEscapeExterior}=await import('./escape-exterior.mjs');
  const {createAerialLayouts}=await import('./aerial-layouts.mjs');
  const {CHURCH_VIEWS}=await import('./church-grounds.mjs');
  document.body.style.margin='0';
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  const exterior=createEscapeExterior(THREE,innerWidth/innerHeight),layouts=createAerialLayouts(THREE,exterior);exterior.scene.fog.density=0;
  exterior.model.traverse(object=>{if(object.isSprite)object.visible=false;});
  window.shot=(view,modern=false)=>{
   layouts.setVisible('historic',!modern);layouts.setVisible('modern',modern);
   const {position,target,fov}=CHURCH_VIEWS[view];
   exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;
   exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();renderer.render(exterior.scene,exterior.camera);
  };
 });
 for(const [view,modern] of [['church',false],['church-plan',false],['church-ground',false],['church',true]]){
  await page.evaluate(({view,modern})=>window.shot(view,modern),{view,modern});
  await page.screenshot({path:`Browser/artifacts/${view}${modern?'-modern':''}.jpg`,quality:93});
 }
 await page.goto('http://127.0.0.1:1843/aerial.html?view=church');
 await page.locator('#churtonNav').filter({hasText:'CHURCH GROUNDS'}).waitFor({state:'visible'});
 await page.screenshot({path:'Browser/artifacts/church-page.jpg',quality:90});
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: church aerial, plan, ground and Modern views rendered; aerial location loaded without browser errors.');
}finally{await browser.close();server.kill();}
