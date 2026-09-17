import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {parameters:p}=JSON.parse(readFileSync('Browser/artifacts/service-edge-camera.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1385,height:848}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__edgePreview={THREE,renderer,exterior,layouts};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?view=tower-buildings');
 await page.waitForFunction(()=>window.__edgePreview);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 console.log(await page.evaluate(p=>{
  const {THREE,exterior,renderer}=window.__edgePreview,camera=exterior.camera;
  camera.position.set(...p.slice(0,3));
  const forward=[-Math.sin(p[3])*Math.cos(p[4]),-Math.sin(p[4]),-Math.cos(p[3])*Math.cos(p[4])];
  camera.lookAt(...forward.map((v,i)=>p[i]+v));camera.fov=2*Math.atan(848/2/p[5])*180/Math.PI;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  exterior.scene.fog.density=0;exterior.invalidateShadows();renderer.render(exterior.scene,camera);
  const ground=(pixel,y)=>{const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(pixel[0]/1385*2-1,1-pixel[1]/848*2),camera);const result=new THREE.Vector3();ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-y),result);return result.toArray();};
  return {yellow:[[351,289],[599,414]].map(q=>ground(q,6.54)),green:[[436,548],[615,330]].map(q=>ground(q,6.54)),pink:[[726,187],[623,323]].map(q=>ground(q,7.44))};
 },p));
 await page.screenshot({path:`Browser/artifacts/service-edges-${process.argv[2]??'after'}.png`});
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: service edge view renders without browser errors.');
}finally{await browser.close();}
