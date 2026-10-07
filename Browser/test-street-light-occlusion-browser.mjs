import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {startTestServer} from './test-support/server.mjs';

const destination=new URL('./artifacts/wall-light-leaks/',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('**/light-occlusion-test.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Street-light occlusion regression</title>'}));
 await page.goto(base+'/light-occlusion-test.html');
 const report=await page.evaluate(async()=>{
  const THREE=await import('./vendor/three.module.js');
  const {createDayNight}=await import('./day-night.mjs');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,.1,7000),model=new THREE.Group();
  scene.background=new THREE.Color(0);scene.fog=new THREE.FogExp2(0,.001);scene.add(model);
  const sun=new THREE.DirectionalLight();scene.add(sun,sun.target,new THREE.HemisphereLight());
  model.userData.streetLamps=[{x:0,z:0,angle:0}];
  const renderer=new THREE.WebGLRenderer({antialias:false});renderer.setSize(512,512);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const exterior={scene,camera,model,invalidateShadows:()=>{sun.shadow.needsUpdate=true;}};
  const lighting=createDayNight(THREE,exterior,renderer,{reducedMotion:true});lighting.setMode('dusk');
  // Isolate the actual production pool from sky, point lights and window glow.
  const testScene=new THREE.Scene();testScene.background=new THREE.Color(0);
  const wall=new THREE.Mesh(new THREE.BoxGeometry(30,4,.5),new THREE.MeshBasicMaterial({color:0x303030}));testScene.add(wall);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshBasicMaterial({color:0x303030}));floor.rotation.x=-Math.PI/2;floor.position.y=.34;testScene.add(floor);
  const pools=lighting.pools.clone();pools.count=1;testScene.add(pools);
  const target=new THREE.WebGLRenderTarget(512,512),bytes=new Uint8Array(512*512*4),matrix=new THREE.Matrix4(),rows=[];
  const saved={enabled:pools.material.polygonOffset,factor:pools.material.polygonOffsetFactor,units:pools.material.polygonOffsetUnits};
  function draw(visible,old=false){
   pools.visible=visible;pools.material.polygonOffset=old||saved.enabled;
   pools.material.polygonOffsetFactor=old?-10:saved.factor;pools.material.polygonOffsetUnits=old?-20:saved.units;
   renderer.setRenderTarget(target);renderer.render(testScene,camera);renderer.readRenderTargetPixels(target,0,0,512,512,bytes);return bytes.slice();
  }
  function pixel(point){const p=new THREE.Vector3(...point).project(camera);return [Math.round((p.x*.5+.5)*511),Math.round((p.y*.5+.5)*511)];}
  function change(a,b,point){const [x,y]=pixel(point);let delta=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const i=((y+dy)*512+x+dx)*4;for(let c=0;c<3;c++)delta=Math.max(delta,b[i+c]-a[i+c]);
  }return delta;}
  // Escape, Explore and the aerial camera use different near planes.
  for(const near of [.05,.1,.5])for(const distance of [12,30,60,100,200]){
   camera.near=near;camera.updateProjectionMatrix();
   camera.position.set(0,1.65,0);camera.lookAt(0,1.65,-distance);camera.updateMatrixWorld(true);
   wall.position.set(0,2,-distance);pools.setMatrixAt(0,matrix.makeTranslation(0,.405,-distance-5));pools.instanceMatrix.needsUpdate=true;
   const off=draw(false),fixed=draw(true),old=draw(true,true);
   const probes=[];for(const x of [-6,-3,0,3,6])for(const y of [.75,1,1.25,1.5,1.75,2,2.5,3]){
    const point=[x,y,-distance+.25];probes.push({point,fixed:change(off,fixed,point),old:change(off,old,point)});
   }
   // Remove the wall for a separate positive control at the bright pool centre.
   wall.visible=false;camera.position.y=12;camera.lookAt(0,.405,-distance-5);camera.updateMatrixWorld(true);
   const ground=[0,.405,-distance-5],groundOff=draw(false),groundOn=draw(true);
   rows.push({near,distance,probes,ground:change(groundOff,groundOn,ground)});wall.visible=true;
  }
  target.dispose();renderer.dispose();
  return {rows};
 });
 await writeFile(new URL('occlusion-validation.json',destination),JSON.stringify(report,null,2)+'\n');
 const probes=report.rows.flatMap(row=>row.probes);
 assert(probes.some(p=>p.old>10),'Original ground-glow settings reproduce a visible stripe through a solid wall');
 assert(probes.every(p=>p.fixed<=1),'Ground glow must remain occluded by solid walls at every viewing distance');
 assert(report.rows.every(r=>r.ground>10),'Preserve visible glow on open paving below the lamp');
 assert.deepEqual(errors,[],'No page or shader errors');
 console.log(`PASS: ${probes.length} wall samples at five distances with Escape, Explore and aerial near planes; original bias leaks, repaired pools stay occluded and open ground remains illuminated.`);
}finally{await browser?.close();server.kill();}
