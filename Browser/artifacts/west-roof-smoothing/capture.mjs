import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',output=new URL('./',import.meta.url);
await mkdir(output,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],views={marked:{position:[-38,24,10],target:[-62,13,10],fov:48},reverse:{position:[-79,28,10],target:[-59,13,10],fov:48},side:{position:[-65,26,-12],target:[-58,13,9],fov:48}};
try{
 const page=await browser.newPage({viewport:{width:1611,height:850}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={exterior,renderer,controls,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);controls.sync(v.target);}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 if(mode==='compiled'&&await page.evaluate(()=>window.review.exterior.modelBuild.mode)!=='compiled')throw Error('Expected the rebuilt compiled model');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 const probes=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),e=window.review.exterior,parts=[];e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const ray=new THREE.Raycaster(),checks=[];
  for(const [xs,zs,min] of [[[-64.25,-64.1,-63.9],[12,12.5,13],15.5],[[-61,-60,-59,-58,-57,-56],[4.85,5.1],15.49]])for(const x of xs)for(const z of zs){
   ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(parts,false)[0];
   if(!hit||hit.point.y<=min||hit.face.normal.y<=0)throw Error('Visible roof fails to cover brick at '+[x,z]);checks.push({x,z,y:hit.point.y});
  }
  return checks;
 });
 const picks={};
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>{const r=window.review;r.show(v);r.exterior.camera.fov=v.fov;r.exterior.camera.updateProjectionMatrix();r.exterior.invalidateShadows();},v);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',output))});
  picks[name]=await page.evaluate(async()=>{const THREE=await import('/vendor/three.module.js'),e=window.review.exterior,parts=[];e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});const ray=new THREE.Raycaster();return [[720,321],[1100,436],[780,352]].map(([x,y])=>{ray.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),e.camera);const h=ray.intersectObjects(parts,false)[0];return h&&{pixel:[x,y],name:h.object.name,point:h.point.toArray()};});});
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL(stage+'-validation.json',output),JSON.stringify({errors,views,picks,probes,modelMode:await page.evaluate(()=>window.review.exterior.modelBuild)},null,2)+'\n');
 console.log(JSON.stringify({errors,picks}));
}finally{await browser.close();server.kill();}
