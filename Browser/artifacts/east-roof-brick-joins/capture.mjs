import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source';
const {server,base}=await startTestServer();let browser;const errors=[];
const views={
 front:{position:[30,37,48],target:[34,13,10],fov:47},
 rear:{position:[36,37,-45],target:[33,13,8],fov:47},
 across:{position:[12,32,16],target:[42,13,12],fov:47},
 outer:{position:[88,35,18],target:[51,13,13],fov:47},
 marked:{position:[14,31,21],target:[42,11.5,17],fov:47},
 blue:{position:[24,20,17],target:[30,13.5,15.8],fov:33},
 yellow:{position:[33,23,16],target:[45,14.5,12],fov:39}
};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1800,height:895}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
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
   const T=await import('/vendor/three.module.js'),e=window.review.exterior,ray=new T.Raycaster(),parts=[],out=[];e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
   for(const [x,y] of [[.35,.36],[.42,.65],[.5,.5]]){ray.setFromCamera(new T.Vector2(x*2-1,1-y*2),e.camera);const h=ray.intersectObjects(parts,false)[0];out.push({screen:[x,y],name:h?.object.name,point:h?.point.toArray(),material:h?.object.material.name,color:h?.object.material.color?.getHexString()});}return out;
  });
 }
 const probes=await page.evaluate(async()=>{
  const T=await import('/vendor/three.module.js'),e=window.review.exterior,ray=new T.Raycaster(),parts=[],results=[],roof=e.model.getObjectByName('Entrance east recessed slate roof').material;
  e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  window.review.show({position:[12,32,16],target:[42,13,12],fov:47});e.camera.updateMatrixWorld(true);
  for(const [x,y] of [[780,385],[900,392],[1000,398],...[978,980,982].flatMap(x=>[688,690,692].map(y=>[x,y]))]){
   ray.setFromCamera(new T.Vector2(x/900-1,1-y/447.5),e.camera);const h=ray.intersectObjects(parts,false)[0];
   if(h?.object.material!==roof)throw Error('Visible marked roof pixel exposes brick: '+[x,y,h?.object.name]);results.push({screen:[x,y],point:h.point.toArray(),slate:true});
  }return results;
 });
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show({...v,fov:53}),views.marked);await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',import.meta.url))});
 await writeFile(new URL(stage+'-validation.json',import.meta.url),JSON.stringify({views,picks,probes,errors,mode,modelBuild:await page.evaluate(()=>window.review.exterior.modelBuild)},null,2)+'\n');
 console.log(JSON.stringify({stage,mode,picks,errors}));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser?.close();server.kill();}
