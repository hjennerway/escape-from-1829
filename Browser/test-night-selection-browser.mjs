import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(resolve=>server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:700}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){',
  'window.__selection={exterior,renderer,controls,buildingSelection,buildingPhotos};const originalRender=renderer.render.bind(renderer);renderer.render=(scene,camera)=>{const material=scene.children[0]?.material;if(material?.uniforms?.opacityScale)window.__selectionOpacity=material.uniforms.opacityScale.value;return originalRender(scene,camera);};function frame(){')});});
 await page.goto(base+'/aerial.html?models=compiled');await page.waitForFunction(()=>window.__selection?.renderer.info.render.frame>3);
 assert.equal(await page.evaluate(()=>window.__selection.exterior.modelBuild.mode),'compiled');
 async function clickBuilding(id){
  await page.evaluate(async id=>{
   const THREE=await import('./vendor/three.module.js'),{exterior,buildingSelection:selection,controls,buildingPhotos}=window.__selection;buildingPhotos.close();
   const entry=selection.entries.find(e=>e.id===id),p=entry.mesh.geometry.attributes.position,candidates=[];
   for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2);if(Math.abs(b.clone().sub(a).cross(c.clone().sub(a)).normalize().y)>.25)candidates.push(a.add(b).add(c).multiplyScalar(1/3));}
   candidates.sort((a,b)=>b.y-a.y);
   for(const point of candidates){exterior.camera.position.copy(point).add(new THREE.Vector3(0,125,.001));exterior.camera.lookAt(point);exterior.camera.updateMatrixWorld();if(selection.pick(500,350,{left:0,top:0,width:1000,height:700},exterior.camera)?.id===id){controls.sync(point.toArray());return;}}
   throw Error('No selectable roof for '+id);
  },id);
  await page.mouse.click(500,350);await page.waitForFunction(id=>window.__selection.buildingPhotos.active?.id===id,id);
 }
 await clickBuilding('1829-centre');await page.waitForFunction(()=>window.__selectionOpacity===1);
 await page.locator('#dayNightToggle').click();await page.waitForFunction(()=>window.__selectionOpacity===.3);
 for(const id of ['1829-west','1829-east']){await clickBuilding(id);await page.waitForFunction(()=>window.__selectionOpacity===.3);}
 await page.screenshot({path:new URL('./artifacts/day-night-selection.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
 await page.locator('#dayNightToggle').click();await page.waitForFunction(()=>window.__selectionOpacity===1);assert.deepEqual(errors,[]);
 console.log('PASS: actual clicks select three buildings, night multiplies the final overlay/outline alpha by 0.3, and day restores 1.0.');
}finally{await browser?.close();server.kill();}
