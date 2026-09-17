import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {WEST_REFINEMENT_VIEWS} from '../dist/west-refinement.mjs';
const stage=process.argv[2]??'alignment-before';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:'1841'}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1224,height:918}}),errors=[];
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
    exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
    window.shot=(position,target,fov)=>{
      exterior.camera.position.set(...position);exterior.camera.lookAt(...target);
      exterior.camera.fov=fov;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();
      renderer.render(exterior.scene,exterior.camera);
    };
  });
  for(const [key,{position,target,fov}] of Object.entries({'west-corner':{position:[-64,32,-31],target:[-46,7,1],fov:49},'west-plan':{position:[-50,70,4],target:[-50,0,4],fov:46}})){
    const name=key;
    await page.evaluate(({position,target,fov})=>window.shot(position,target,fov),{position,target,fov});
    await page.screenshot({path:`Browser/artifacts/west-${name}-${stage}.jpg`,quality:90});
  }
  if(stage==='after'){
    await page.route('**/aerial.html*',async route=>{
      const response=await route.fetch(),body=(await response.text()).replace('function frame(){','window.__west={renderer,exterior};\nfunction frame(){');
      await route.fulfill({response,body});
    });
    await page.goto('http://127.0.0.1:1841/aerial.html?models=compiled&view=west-3');
    await page.waitForFunction(()=>window.__west?.renderer.info.render.frame>3);
    const state=await page.evaluate(()=>({mode:window.__west.exterior.modelBuild.mode,end:!!window.__west.exterior.model.getObjectByName('West end continuous wall')}));
    if(state.mode!=='compiled'||!state.end)throw new Error('West end missing from compiled aerial: '+JSON.stringify(state));
    await page.screenshot({path:'Browser/artifacts/west-compiled-page.jpg',quality:90});
    await page.goto('http://127.0.0.1:1841/explore.html?view=west-2');
    await page.waitForFunction(()=>document.querySelector('canvas')?.width>0);
    await page.waitForTimeout(1200);
    await page.screenshot({path:'Browser/artifacts/west-explore-page.jpg',quality:90});
  }
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS: west court alignment corner and plan rendered without browser errors.');
}finally{await browser.close();server.kill();}
