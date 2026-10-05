import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const errors=[];
const views={marked:{position:[-15,27,41],target:[-38,10,17],fov:44},close:{position:[-22,22,31],target:[-34,13,16],fov:32},opposite:{position:[-24,21,24],target:[-34,12,16],fov:40}};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1669,height:819}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={exterior,renderer,controls,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(0,1,0);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 if(mode==='compiled'&&await page.evaluate(()=>window.review.exterior.modelBuild.mode)!=='compiled')throw Error('Expected compiled loading');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 const picks={};
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',import.meta.url))});
  picks[name]=await page.evaluate(async()=>{
   const T=await import('/vendor/three.module.js'),e=window.review.exterior,ray=new T.Raycaster(),parts=[],out=[];
   e.model.updateMatrixWorld(true);e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
   ray.far=2;
   for(const y of [12.72,12.9,13.025])for(const z of [15.28,15.42,15.56]){
    const origin=new T.Vector3(-34.5,y,z).applyMatrix4(e.model.matrixWorld),direction=new T.Vector3(-1,0,0).transformDirection(e.model.matrixWorld);
    ray.set(origin,direction);const h=ray.intersectObjects(parts,false)[0];
    out.push({y,z,name:h?.object.name,point:h?.point.toArray(),color:h?.object.material.color.getHexString()});
   }
   return out;
  });
 }
 if(stage!=='before'&&Object.values(picks).flat().some(p=>p.name!=='West garden inner projecting pavilion'))throw Error('Render remains in front of the brick wall');
 await writeFile(new URL(stage+'-validation.json',import.meta.url),JSON.stringify({views,picks,errors,mode},null,2)+'\n');
 console.log(JSON.stringify({stage,mode,errors,wallProbes:picks.marked.length,brickProbes:picks.marked.filter(p=>p.name==='West garden inner projecting pavilion').length}));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser?.close();server.kill();}
