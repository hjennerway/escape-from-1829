import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const mode=process.argv[2]??'after';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const url=await new Promise(resolve=>server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1400,height:850}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__roadPreview={THREE,renderer,exterior,layouts};function frame(){')});
 });
 await page.goto(url+'/aerial.html?models=source&view=historic-admin-grounds');
 await page.waitForFunction(()=>window.__roadPreview);
 await page.evaluate(()=>{
  const {exterior,layouts,renderer}=window.__roadPreview;
  layouts.setVisible('historic',true);layouts.setVisible('modern',true);
  exterior.camera.position.set(133,170,231);exterior.camera.lookAt(185,0,40);
  exterior.camera.fov=48;exterior.camera.updateProjectionMatrix();exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
 });
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 await page.screenshot({path:`Browser/artifacts/frost-drive-${mode}.png`});
 console.log(JSON.stringify(await page.evaluate(()=>{
  const {THREE,layouts,exterior}=window.__roadPreview,ray=new THREE.Raycaster();ray.camera=exterior.camera;
  layouts.roads.updateMatrixWorld(true);
  return [154,165,178].map(x=>{const z=58.445588793808604+(x-154.05597426621387)*(65.80730663881448-58.445588793808604)/(178.02238499911093-154.05597426621387);ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));return {point:[x,z],frostHits:ray.intersectObject(layouts.roads.getObjectByName('Frost drive'),true).filter(h=>h.object.isMesh).length};});
 })));
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
