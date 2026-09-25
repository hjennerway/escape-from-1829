// Regenerate the landing stills using the same scene, camera and haze as the menu.
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();
 await page.route('**/landing-capture.html',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><script type="importmap">{"imports":{"three":"./vendor/three.module.js"}}</script></head><body><script type="module">
 import * as THREE from './vendor/three.module.js';
 import {loadEscapeFrontage} from './escape-exterior.mjs';
 import {createLandingExterior} from './landing-scene.mjs';
 import {sampleLanding} from './aerial-controls.mjs';
 const renderer=new THREE.WebGLRenderer({antialias:true});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const exterior=await createLandingExterior(THREE,innerWidth/innerHeight);
 await loadEscapeFrontage(THREE,exterior);exterior.scene.fog.density*=.25;
 window.capture=async(width,height)=>{
  renderer.setSize(width,height);exterior.camera.aspect=width/height;exterior.camera.updateProjectionMatrix();
  const shot=sampleLanding(0,{aspect:width/height,reducedMotion:true});
  exterior.camera.position.set(...shot.position);exterior.camera.lookAt(...shot.target);
  await renderer.compileAsync(exterior.scene,exterior.camera);
  renderer.render(exterior.scene,exterior.camera);
  return renderer.domElement.toDataURL('image/webp',.86).split(',')[1];
 };
 </script></body></html>`}));
 await page.goto(base+'/landing-capture.html',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.capture,null,{timeout:120000});
 for(const [name,width,height] of [['landing-aerial',1440,900],['landing-aerial-mobile',780,1408]]){
  const data=await page.evaluate(([w,h])=>window.capture(w,h),[width,height]);
  const bytes=Buffer.from(data,'base64');await writeFile(new URL('./dist/exterior/'+name+'.webp',import.meta.url),bytes);
  console.log(name+': '+bytes.length+' bytes');
 }
}finally{await browser?.close();server.kill();}
