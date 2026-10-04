import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'after',destination=new URL('./',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:940,height:654}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.endSections={exterior,renderer,controls,buildingPhotos,show(){moved=true;navigationTarget=[-72.25,7.4,12.75];exterior.camera.up.set(0,1,0);exterior.camera.position.set(-103,22,12.75);exterior.camera.lookAt(...navigationTarget);controls.sync(navigationTarget);}};function frame(){')});});
 if(stage==='before')await page.route('**/west-refinement.mjs',route=>route.fulfill({contentType:'text/javascript',path:fileURLToPath(new URL('before-west-refinement.mjs',destination))}));
 const checks=[];
 for(const mode of stage==='before'?['source']:['source','compiled']){
  await page.goto(base+'/aerial.html?models='+mode+'&view=west-3&buildingDetail=full');
  await page.waitForFunction(()=>window.endSections?.renderer.info.render.frame>3);
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>window.endSections.buildingPhotos?.close());
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  checks.push(await page.evaluate(async({mode,stage})=>{
   const THREE=await import('/vendor/three.module.js'),{exterior,controls}=window.endSections;
   if(mode==='compiled'&&exterior.modelBuild.mode!=='compiled')throw Error('Compiled model did not load');
   exterior.trees.visible=false;exterior.scene.fog.density=0;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
   const wall=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West end continuous wall'));
   const pier=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West end shallow centre'));
   const total=wall.max.z-wall.min.z,widths=[pier.min.z-wall.min.z,pier.max.z-pier.min.z,wall.max.z-pier.max.z];
   if(Math.abs(total-15.5)>1e-5)throw Error('Overall width changed');
   if(stage!=='before'&&widths.some((w,i)=>Math.abs(w/total-[.35,.30,.35][i])>1e-5))throw Error('Wrong section proportions');
   const ray=new THREE.Raycaster(),meshes=[];exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
   let panes=0;
   for(const o of exterior.model.userData.westEndPhotoOpenings)for(const u of [-.26,.26])for(const v of [-.27,.27]){
    ray.set(new THREE.Vector3(o.x-.6,o.y+o.h*v,o.z+o.w*u),new THREE.Vector3(1,0,0));
    const hit=ray.intersectObjects(meshes,false)[0];if(hit?.object.material.color.getHex()!==0x78989f||hit.distance>=.6)throw Error('West-end pane is buried '+o.face);panes++;
   }
   window.endSections.show();exterior.camera.fov=37;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();
   return {mode:exterior.modelBuild.mode,total,widths,ratios:widths.map(w=>w/total),panes};
  },{mode,stage}));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'.png',destination))});
  if(stage!=='before'){
   await page.setViewportSize({width:390,height:844});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.evaluate(()=>{window.endSections.show();window.endSections.exterior.camera.fov=57;window.endSections.exterior.camera.updateProjectionMatrix();window.endSections.exterior.invalidateShadows();});
   await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-mobile.png',destination))});
   await page.setViewportSize({width:940,height:654});
  }
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL(stage+'-validation.json',destination),JSON.stringify({checks,errors},null,2)+'\n');
 console.log('PASS: fixed west-end width, section measurements, exposed glazing and source/compiled desktop/phone captures.');
}finally{await browser.close();server.kill();}
