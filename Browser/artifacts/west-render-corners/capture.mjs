import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'after',out=new URL('./',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1536,height:960}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0"></body>'}));
 await page.goto(base+'/capture.html');
 const views=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{createEscapeExterior}=await import('/escape-exterior.mjs'),{createAerialLayouts}=await import('/aerial-layouts.mjs');
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  const exterior=createEscapeExterior(THREE,innerWidth/innerHeight),layouts=createAerialLayouts(THREE,exterior);exterior.scene.fog.density=0;
  layouts.setVisible('modern',false);layouts.setVisible('historic',true);exterior.trees.visible=false;exterior.invalidateShadows();exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
  const views={garden:{position:[-90,31,47],target:[-52,7,20],fov:48},yellow:{position:[-50,14,23],target:[-40,8.6,17.5],fov:38},frontCorner:{position:[-78,10,26],target:[-72.25,8.6,20.58],fov:42},endSteps:{position:[-84,11,15],target:[-72.5,8,12.75],fov:46},frontCornice:{position:[-77,18,26],target:[-72.3,15.2,20.65],fov:40},courtCorner:{position:[-78,10,-1],target:[-72.25,8.6,4.82],fov:42},middleCornice:{position:[-60,17,23],target:[-55.6,14.9,15.8],fov:40}};
  window.renderCorners={exterior,renderer,show(v){exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.near=.03;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);}};
  return views;
 });
 for(const [name,view] of Object.entries(views)){await page.evaluate(v=>window.renderCorners.show(v),view);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',out))});}
 await writeFile(new URL(stage+'-capture.json',out),JSON.stringify({views,errors},null,2)+'\n');
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS: seven west trim views without page/shader errors.');
}finally{await browser.close();server.kill();}
