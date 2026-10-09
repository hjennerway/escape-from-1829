import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {startTestServer} from './test-support/server.mjs';

const destination=new URL('artifacts/pavement-cleanup/',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/pavement-depth-test.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Pavement burial regression</title>'}));
 await page.goto(base+'/pavement-depth-test.html');
 const report=await page.evaluate(async()=>{
  const THREE=await import('./vendor/three.module.js');
  const {createHistoricRoads}=await import('./historic-roads.mjs');
  const {createModernRoads}=await import('./modern-roads.mjs');
  const {createModernCarPark}=await import('./modern-car-park.mjs');
  const {createRoadRibbonGeometry}=await import('./road-ribbon.mjs');
  const exterior={model:new THREE.Group(),terrain:{material:new THREE.MeshStandardMaterial()}};
  // Use the production materials rather than a second copy of the fix.
  const historic=createHistoricRoads(THREE,exterior),modern=createModernRoads(THREE),parking=createModernCarPark(THREE);
  const samples=[
   historic.getObjectByName('Admin north service road border').children[0].material,
   historic.getObjectByName('Estates entrance smooth kerb join').material,
   modern.getObjectByName('Warren Lane').children[0].children[0].material,
   parking.getObjectByName('Car park border').material
  ];
  const scene=new THREE.Scene();scene.background=new THREE.Color(0);
  const renderer=new THREE.WebGLRenderer({antialias:false});renderer.setSize(512,512);
  const target=new THREE.WebGLRenderTarget(512,512),bytes=new Uint8Array(512*512*4);
  const camera=new THREE.PerspectiveCamera(67,1,.1,7000);
  // Align the thin, distant strip with a pixel centre instead of the boundary
  // between the two middle rows, keeping the positive control observable.
  camera.setViewOffset(512,512,0,.5,512,512);
  // A former border buried by a forecourt: the centimetre height separation
  // must occlude it even at the very shallow angles reached while walking.
  const line=[[-15,-12],[0,-12],[15,-12]];
  const edge=new THREE.Mesh(createRoadRibbonGeometry(THREE,line,1.2,.32),new THREE.MeshBasicMaterial({color:0xff00ff}));
  const paving=historic.getObjectByName('Tower service court').material;
  const cover=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshBasicMaterial({color:0x202020,polygonOffset:true,polygonOffsetFactor:paving.polygonOffsetFactor,polygonOffsetUnits:paving.polygonOffsetUnits}));
  cover.rotation.x=-Math.PI/2;cover.position.set(0,.34,-12);scene.add(edge,cover);
  function draw(material,old=false){
   Object.assign(edge.material,{polygonOffset:material.polygonOffset,polygonOffsetFactor:old?-3:material.polygonOffsetFactor,polygonOffsetUnits:material.polygonOffsetUnits});
   renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,512,512,bytes);
   let pink=0;for(let i=0;i<bytes.length;i+=4)if(bytes[i]>200&&bytes[i+1]<20&&bytes[i+2]>200)pink++;
   return pink;
  }
  const rows=[];
  for(const near of [.05,.1,.5])for(const distance of [5,20,60,120,250]){
   camera.near=near;camera.position.set(0,1.9,-12+distance);camera.lookAt(0,.32,-12);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
   const hidden=samples.map(material=>draw(material)),old=draw(samples[0],true);
   cover.visible=false;const exposed=draw(samples[0]);cover.visible=true;
   // A real raised inner kerb must remain above its adjoining lawn island.
   const lawn=historic.getObjectByName('Admin teardrop grass island').material;
   cover.position.y=.37;cover.material.polygonOffsetFactor=lawn.polygonOffsetFactor;cover.material.polygonOffsetUnits=lawn.polygonOffsetUnits;
   edge.position.y=.06;camera.lookAt(0,.38,-12);camera.updateMatrixWorld(true);const raised=draw(samples[1]);edge.position.y=0;
   cover.position.y=.34;cover.material.polygonOffsetFactor=paving.polygonOffsetFactor;cover.material.polygonOffsetUnits=paving.polygonOffsetUnits;
   rows.push({near,distance,hidden,old,exposed,raised});
  }
  renderer.dispose();target.dispose();return {rows,factors:samples.map(m=>m.polygonOffsetFactor)};
 });
 await writeFile(new URL('depth-validation.json',destination),JSON.stringify(report,null,2)+'\n');
 assert(report.rows.some(r=>r.old>20),'Reproduce the original pale border appearing through the road');
 assert(report.rows.every(r=>r.hidden.every(n=>n===0)),'Buried pavement stays hidden at every camera distance and near plane');
 assert(report.rows.every(r=>r.exposed>0),'Pavement remains visible where asphalt does not cover it');
 assert(report.rows.every(r=>r.raised>0),'Raised inner kerbs stay visible above adjoining lawn islands');
 assert.deepEqual(errors,[],'No browser errors');
 console.log('PASS: historic, shared, joined and parking kerbs stay buried beneath roads from 5 to 250 metres; exposed edging remains visible.');
}finally{await browser?.close();server.kill();}
