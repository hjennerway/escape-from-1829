import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before';
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1593,height:698}});page.setDefaultTimeout(120000);
 await page.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0"></body>'}));
 await page.goto(base+'/capture.html');
 await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{createEscapeExterior}=await import('/escape-exterior.mjs'),{createAerialLayouts}=await import('/aerial-layouts.mjs');
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  const exterior=createEscapeExterior(THREE,innerWidth/innerHeight),layouts=createAerialLayouts(THREE,exterior);
  layouts.setVisible('modern',false);layouts.setVisible('historic',true);exterior.scene.fog.density=0;exterior.trees.visible=false;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.invalidateShadows();
  window.review={exterior,renderer,show(position,target,fov=45){exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();renderer.render(exterior.scene,exterior.camera);},pick(x,y){const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),exterior.camera);const parts=[];exterior.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});const h=ray.intersectObjects(parts,false)[0];return h&&{name:h.object.name,point:h.point.toArray(),normal:h.face.normal.toArray()};}};
 });
 const views={court:{position:[-16,27,-22],target:[-49,9,7],fov:48},courtClose:{position:[-18,21,-15],target:[-38,13,5],fov:34},garden:{position:[-25,24,47],target:[-40,11,17],fov:42}};
 const data={views,picks:{}};
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v.position,v.target,v.fov),v);
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',import.meta.url))});
  data.picks[name]=await page.evaluate(()=>{const result=[];for(let y=150;y<500;y+=35)for(let x=300;x<1300;x+=55){const p=window.review.pick(x,y);if(p&&/slate closure|roof junction|upper link/.test(p.name))result.push({pixel:[x,y],...p});}return result;});
 }
 await writeFile(new URL(stage+'-validation.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
 console.log(JSON.stringify(data.picks,null,2));
}finally{await browser.close();server.kill();}
