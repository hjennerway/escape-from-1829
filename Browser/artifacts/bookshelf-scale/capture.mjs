import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const output=new URL('./',import.meta.url);await mkdir(output,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const checks={},errors=[];
try{
 for(const mode of ['before','after']){
  const page=await browser.newPage({viewport:{width:1000,height:800}});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/bookshelf-preview',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0"></body></html>'}));
  if(mode==='before')await page.route('**/asylum-furniture.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace("bookcase:{source:'shelf_B_large',width:1.25*1.5,depth:.38*1.5,height:1.90*1.5}","bookcase:{source:'shelf_B_large',width:1.25,depth:.38,height:1.90}")});});
  await page.goto(base+'/bookshelf-preview');
  checks[mode]=await page.evaluate(async()=>{
   const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),models=await loadFurnitureModels(THREE);
   const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1000,800);renderer.setClearColor(0xc9c4b8);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.append(renderer.domElement);
   const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff8eb,0x817769,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);
   const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0xb7ad98,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.005;scene.add(floor);
   const grid=new THREE.GridHelper(12,12,0x958978,0xa79b87);grid.position.y=.001;scene.add(grid);
   const group=new THREE.Group();for(const part of models.bookcase)group.add(new THREE.Mesh(part.geometry,part.material));scene.add(group);
   const box=new THREE.Box3().setFromObject(group),size=box.getSize(new THREE.Vector3()),camera=new THREE.PerspectiveCamera(38,1000/800,.01,50);camera.position.set(3.2,2.65,5.4);camera.lookAt(0,1.35,0);renderer.render(scene,camera);
   const shelfMesh=new THREE.Mesh(models.bookcase[0].geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})),positions=models.bookcase[1].geometry.attributes.position,contacts=[];
   for(let level=0;level<4;level++){
    const indices=Array.from({length:positions.count/4},(_,i)=>level*positions.count/4+i),bottom=Math.min(...indices.map(i=>positions.getY(i))),minX=Math.min(...indices.map(i=>positions.getX(i))),maxX=Math.max(...indices.map(i=>positions.getX(i))),minZ=Math.min(...indices.map(i=>positions.getZ(i))),maxZ=Math.max(...indices.map(i=>positions.getZ(i)));
    const ray=new THREE.Raycaster(new THREE.Vector3((minX+maxX)/2,bottom+.02,(minZ+maxZ)/2),new THREE.Vector3(0,-1,0)),surface=ray.intersectObject(shelfMesh,false)[0]?.point.y;contacts.push({bottom,surface,gap:bottom-surface});
   }
   shelfMesh.material.dispose();return {bounds:size.toArray(),minimumY:box.min.y,contacts};
  });
  await page.screenshot({path:fileURLToPath(new URL(mode+'.png',output))});await page.close();
 }
 assert.deepEqual(errors,[]);
 for(let axis=0;axis<3;axis++)assert(Math.abs(checks.after.bounds[axis]/checks.before.bounds[axis]-1.5)<1e-6,'The complete visible assembly is 150% on each axis');
 assert(Math.abs(checks.after.minimumY)<1e-6,'The enlarged case remains on the floor');
 for(const contact of checks.after.contacts)assert(Math.abs(contact.gap-.003)<1e-5,'Scaled books remain seated on their supporting shelf');
 await writeFile(new URL('geometry-validation.json',output),JSON.stringify({checks,errors},null,2)+'\n');
 console.log('PASS: complete bookshelf 150% on all axes, grounded base, four supported book groups, before/after rendered captures.');
}finally{await browser.close();server.kill();}
