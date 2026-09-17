import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fit=JSON.parse(readFileSync('Research/annexe-road-trees/placement-fit.json'));
const stage=process.argv[2]??'after';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1112,height:816}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__treePreview={THREE,renderer,exterior,layouts};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?view=annexe');
 await page.waitForFunction(()=>window.__treePreview,{},{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 await page.evaluate(({fit,stage})=>{
  const {THREE,renderer,exterior}=window.__treePreview;
  const p=fit.parameters,camera=exterior.camera;
  camera.position.set(...p.slice(0,3));
  const forward=[-Math.sin(p[3])*Math.cos(p[4]),-Math.sin(p[4]),-Math.cos(p[3])*Math.cos(p[4])];
  camera.lookAt(...forward.map((v,i)=>p[i]+v));
  camera.fov=2*Math.atan(innerHeight/(2*p[5]))*180/Math.PI;camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[8]=1-2*p[6]/innerWidth;
  camera.projectionMatrix.elements[9]=2*p[7]/innerHeight-1;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  exterior.scene.fog.density=0;
  if(stage==='fit')for(const [i,[x,z]] of Object.values(fit.marks).entries()){
   const pin=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.12,16),new THREE.MeshBasicMaterial({color:0x5533ff}));
   pin.position.set(x,.4,z);exterior.model.add(pin);
  }
  exterior.invalidateShadows();renderer.render(exterior.scene,camera);
 },{fit,stage});
 await page.screenshot({path:`Browser/artifacts/annexe-trees-${stage}.png`});
 if(errors.length)throw new Error(errors.join('\n'));
 console.log(`PASS: ${stage} annexe trees render without page errors.`);
}finally{await browser.close();}
