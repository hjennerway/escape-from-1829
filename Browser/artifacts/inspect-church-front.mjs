import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise(resolve=>server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1000,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0"></body>'}));
 await page.goto(base+'/capture.html');
 await page.evaluate(async()=>{
  const THREE=await import('./vendor/three.module.js');
  const {createEscapeExterior}=await import('./escape-exterior.mjs');
  const exterior=createEscapeExterior(THREE,innerWidth/innerHeight);
  exterior.scene.fog.density=0;
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  window.shot=front=>{
   exterior.camera.position.set(...(front?[-4.9,7,-70]:[-25,2,-81]));exterior.camera.lookAt(-4.9,10,-105.2);exterior.camera.fov=front?40:44;exterior.camera.updateProjectionMatrix();
   renderer.render(exterior.scene,exterior.camera);
  };
 });
 for(const front of [false,true]){
  await page.evaluate(front=>window.shot(front),front);
  await page.screenshot({path:`Browser/artifacts/church-front-${front?'straight':'photo'}-${process.argv[2]||'after'}.png`});
 }
 if(process.argv[2]!=='before'){
  await page.route('**/aerial.html*',async route=>{
   const response=await route.fetch();
   await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__church={exterior,renderer};function frame(){')});
  });
  await page.goto(base+'/aerial.html?models=compiled&view=church-front');
  await page.waitForFunction(()=>window.__church?.renderer.info.render.frame>3,null,{timeout:120000});
  const mode=await page.evaluate(()=>window.__church.exterior.modelBuild.mode);
  if(mode!=='compiled')throw new Error('Expected compiled church view, got '+mode);
  await page.getByRole('link',{name:'CLOCK FRONT',exact:true}).waitFor();
  await page.screenshot({path:'Browser/artifacts/church-front-page.png'});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: church clock-front photo and straight views rendered without browser errors.');
}finally{await browser.close();server.kill();}
