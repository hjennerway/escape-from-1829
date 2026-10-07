import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {startTestServer} from './test-support/server.mjs';
const destination=new URL('./artifacts/corridor-repairs/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('**/workshop-light-test.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Workshop light occlusion</title>'}));await page.goto(base+'/workshop-light-test.html');
 const report=await page.evaluate(async()=>{
  const THREE=await import('./vendor/three.module.js'),{createWorkshopLights}=await import('./workshop-interior-lights.mjs');
  const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);scene.background=new THREE.Color(0);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,24),new THREE.MeshStandardMaterial({color:0x888888,roughness:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;group.add(floor);
  const wall=new THREE.Mesh(new THREE.BoxGeometry(.3,5,20),new THREE.MeshStandardMaterial({color:0x888888}));wall.position.set(1,2.5,0);wall.castShadow=true;wall.receiveShadow=true;group.add(wall);
  const pivot=new THREE.Group(),door=new THREE.Mesh(new THREE.BoxGeometry(.15,5,3),wall.material);door.position.set(-1,2.5,0);door.castShadow=true;pivot.add(door);group.add(pivot);
  let lighting=createWorkshopLights(THREE,group,[{fixture:new THREE.Object3D(),x:0,y:4.6,z:0}],{doors:[door]});lighting.update();
  const renderer=new THREE.WebGLRenderer({antialias:false});renderer.setSize(512,512);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const camera=new THREE.PerspectiveCamera(55,1,.1,50);camera.position.set(0,14,10);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  const target=new THREE.WebGLRenderTarget(512,512),bytes=new Uint8Array(512*512*4);
  function draw(intensity){lighting.uniforms.workshopStrength.value=intensity;lighting.bake(renderer);renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,512,512,bytes);return bytes.slice();}
  function delta(a,b,point){const p=new THREE.Vector3(...point).project(camera),x=Math.round((p.x*.5+.5)*511),y=Math.round((p.y*.5+.5)*511);let sum=0;
   for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const i=((y+dy)*512+x+dx)*4;for(let c=0;c<3;c++)sum+=Math.max(0,b[i+c]-a[i+c]);}return sum/75;}
  const strength=lighting.uniforms.workshopStrength.value;
  const off=draw(0),on=draw(strength),lit=[-.3,.001,2],blocked=[3,.001,0],doorPoint=[-3,.001,0];
  const samples={lit:delta(off,on,lit),blocked:delta(off,on,blocked),closedDoor:delta(off,on,doorPoint)};
  lighting.update({x:100,z:100});const walked=draw(strength);samples.walkDifference=walked.reduce((n,b,i)=>n+Math.abs(b-on[i]),0);
  pivot.position.z=8;lighting.invalidate();const doorOff=draw(0),opened=draw(strength);samples.openDoor=delta(doorOff,opened,doorPoint);samples.bakes=lighting.bakes;
  lighting.dispose();wall.castShadow=false;lighting=createWorkshopLights(THREE,group,[{fixture:new THREE.Object3D(),x:0,y:4.6,z:0}],{doors:[door]});const leaking=draw(strength);samples.unoccludedControl=delta(doorOff,leaking,blocked);
  lighting.dispose();target.dispose();floor.geometry.dispose();wall.geometry.dispose();renderer.dispose();return samples;
 });
 await writeFile(new URL('light-occlusion.json',destination),JSON.stringify({report,errors},null,2));
 assert(report.lit>5,'The actual fixture illuminates unobstructed flooring');assert(report.blocked<2,'A solid partition blocks the fixture light');assert(report.unoccludedControl>3,'Removing the blocker demonstrates the old through-wall spill');assert(report.closedDoor<2&&report.openDoor>3,'Moving leaves cast live analytic shadows');assert.equal(report.walkDifference,0,'Walking cannot change fixed lighting pixels');assert.equal(report.bakes,1,'Walking and door motion never rebake static shadows');assert.deepEqual(errors,[]);
 console.log('PASS: stable fixture illumination, partition/door occlusion, positive control, one cached atlas and no shader errors.');
}finally{await browser?.close();server.kill();}
