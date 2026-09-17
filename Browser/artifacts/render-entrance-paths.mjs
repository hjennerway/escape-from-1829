import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore'});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1400,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:1829/');
  await page.evaluate(async()=>{
    const THREE=await import('./vendor/three.module.js');
    const {createEscapeExterior,loadEscapeFrontage}=await import('./escape-exterior.mjs');
    const {createAerialLayouts}=await import('./aerial-layouts.mjs');
    document.body.replaceChildren();
    document.body.style.cssText='margin:0;overflow:hidden';
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(1);
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    document.body.append(renderer.domElement);
    const exterior=createEscapeExterior(THREE,innerWidth/innerHeight);
    createAerialLayouts(THREE,exterior);
    exterior.model.traverse(object=>{if(object.isSprite)object.visible=false;});
    exterior.scene.fog.density=0;
    exterior.camera.position.set(0,76,82);exterior.camera.lookAt(0,0,29);
    await loadEscapeFrontage(THREE,exterior);
    renderer.render(exterior.scene,exterior.camera);
    window.pathPreview={THREE,renderer,exterior};
  });
  await page.screenshot({path:'Browser/artifacts/entrance-paths-'+(process.argv[2]??'after')+'.png'});
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS: entrance paths render without browser errors.');
}finally{await browser.close();server.kill();}
