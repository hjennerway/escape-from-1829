import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const output=new URL('./',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:750}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('**/height-preview',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0"></body></html>'}));
 await page.goto(base+'/height-preview');
 const measurements=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),models=await loadFurnitureModels(THREE);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1100,750);renderer.setClearColor(0xc9c4b8);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.append(renderer.domElement);
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff8eb,0x817769,2));
  const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0xb7ad98,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.005;scene.add(floor);
  const bounds={};
  for(const [kind,x] of [['cupboard',-1.15],['bookcase',1.15]]){
   const group=new THREE.Group();for(const part of models[kind])group.add(new THREE.Mesh(part.geometry,part.material));
   group.position.x=x;scene.add(group);const box=new THREE.Box3().setFromObject(group);
   bounds[kind]={size:box.getSize(new THREE.Vector3()).toArray(),minimumY:box.min.y,maximumY:box.max.y};
  }
  const camera=new THREE.PerspectiveCamera(38,1100/750,.01,50);camera.position.set(0,2.6,7.6);camera.lookAt(0,1.35,0);renderer.render(scene,camera);
  return bounds;
 });
 assert(Math.abs(measurements.cupboard.maximumY-measurements.bookcase.maximumY)<1e-5,'The actual rendered tops align');
 assert(Math.abs(measurements.cupboard.size[1]-2.85)<1e-5,'Wardrobe is 2.85 units high');
 assert(Math.abs(measurements.cupboard.size[0]-1.5)<1e-5&&Math.abs(measurements.cupboard.size[2]-.65)<1e-5,'Wardrobe retains its width and depth');
 assert(Math.abs(measurements.cupboard.minimumY)<1e-5,'Wardrobe stays grounded');
 await page.screenshot({path:fileURLToPath(new URL('comparison.png',output))});
 assert.deepEqual(errors,[]);await writeFile(new URL('comparison.json',output),JSON.stringify({measurements,errors},null,2)+'\n');
 console.log('PASS: wardrobe and bookshelf tops align at 2.85 units, wardrobe footprint retained, no runtime/shader errors.');
}finally{await browser.close();server.kill();}
