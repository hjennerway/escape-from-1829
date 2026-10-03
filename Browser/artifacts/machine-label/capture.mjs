import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const destination=new URL('./',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:926,height:748}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/machine-label-preview',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><link rel="icon" href="data:,"></head><body style="margin:0"></body></html>'}));
 await page.goto(base+'/machine-label-preview');
 const checks=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{createMedicalFurnitureModels}=await import('/medical-furniture-models.mjs');
  const parts=createMedicalFurnitureModels(THREE).electrotherapy;
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0xc9c4b8);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.append(renderer.domElement);
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff8eb,0x817769,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0xb7ad98,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.005;scene.add(floor);
  const group=new THREE.Group();scene.add(group);for(const part of parts)group.add(new THREE.Mesh(part.geometry,part.material));group.updateMatrixWorld(true);
  const label=group.children.find(m=>m.material.name==='MEDICAL ELECTRICITY'),box=label.geometry.boundingBox,center=box.getCenter(new THREE.Vector3());
  const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.01,50);
  const views={front:[.25,1.65,2.65],elevated:[.45,2.1,2.65]};
  window.machineLabelPreview={show(view){camera.position.set(...views[view]);camera.lookAt(0,.74,0);renderer.render(scene,camera);}};
  const samples=[];
  for(const [view,position] of Object.entries(views))for(const u of [-.9,0,.9])for(const v of [-.9,0,.9]){
   const target=new THREE.Vector3(center.x+u*(box.max.x-box.min.x)/2,center.y+v*(box.max.y-box.min.y)/2,center.z),origin=new THREE.Vector3(...position);
   const hit=new THREE.Raycaster(origin,target.clone().sub(origin).normalize()).intersectObject(group,true)[0];
   if(hit?.object!==label)throw Error('Label is occluded at '+view+' '+u+' '+v);
   samples.push({view,u,v,visible:true});
  }
  window.machineLabelPreview.show('front');
  return {labelBounds:{min:box.min.toArray(),max:box.max.toArray()},visibleSamples:samples};
 });
 for(const view of ['front','elevated']){await page.evaluate(v=>window.machineLabelPreview.show(v),view);await page.screenshot({path:fileURLToPath(new URL(view+'.png',destination))});}
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL('validation.json',destination),JSON.stringify({...checks,errors},null,2)+'\n');
 console.log('PASS: close front/elevated model renders, all 18 label visibility rays clear, no page or WebGL errors.');
}finally{await browser.close();server.kill();}
