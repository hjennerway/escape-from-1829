import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';

const stage=process.argv[2]??'before',mode=process.argv[3]??'source',out=new URL('./',import.meta.url);
await mkdir(out,{recursive:true});
const sourceHash=await modelSourceHash(),{server,base}=await startTestServer();
const views={
 marked:{position:[-38,32,44],target:[-26,12,12],up:[0,1,0],fov:40},
 reference:{position:[-17,27,40],target:[-29,14,15],up:[0,1,0],fov:40},
 blue:{position:[-29,21,24],target:[-34,14.8,15],up:[0,1,0],fov:34},
 red:{position:[-28,21,28],target:[-22.6,14,17.4],up:[0,1,0],fov:32},
 low:{position:[-17,16,30],target:[-28,14,16],up:[0,1,0],fov:45},
 plan:{position:[-29,50,16],target:[-29,0,16],up:[0,0,-1],fov:34}
};
let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1640,height:900}});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={THREE,exterior,renderer,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(...v.up);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const build=await page.evaluate(()=>window.review.exterior.modelBuild);
 assert.equal(build.mode,mode==='compiled'?'compiled':'procedural');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){
  await page.evaluate(v=>window.review.show(v),v);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',out))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show({...v,fov:48}),views.reference);
 await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-phone.png',out))});
 const survey=await page.evaluate(before=>{
  const {THREE:T,exterior:e}=window.review,parts=[],ray=new T.Raycaster();e.model.updateMatrixWorld(true);
  e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
  const roof=e.model.getObjectByName('West end continuous slate roof').material,roofs=[];e.model.traverse(o=>{if(o.isMesh&&o.material===roof)roofs.push(o);});
  const top=(x,z)=>{ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));return ray.intersectObjects(parts,false).slice(0,4).map(h=>({name:h.object.name,y:h.point.y,normal:h.face.normal.toArray()}));};
  const checked=[];
  const check=(x,z,y)=>{
   const h=top(x,z)[0];if(!h||Math.abs(h.y-y)>.002)throw Error('Visible roof mismatch: '+[x,z,h?.y,y]);
   checked.push({x,z,y:h.y});return h;
  };
  if(!before){
   for(const x of [-34.5,-34.2,-33.9,-33.65,-33.55,-33.2,-32.8,-32.4,-32,-31.5,-31]){
    const h=top(x,14.6)[0],n=h.normal;
    for(const z of [14.85,15,15.2,15.35,15.3849]){
     const q=check(x,z,h.y-n[2]/n[1]*(z-14.6));
     if(q.normal.reduce((sum,v,i)=>sum+v*n[i],0)<1-1e-8)throw Error('Visible blue pitch angle mismatch');
    }
   }
   for(const z of [17.2251,17.3,17.42,17.8,18.2,18.8,19.2]){
    check(-22.6751,z,13.69);check(-22.6749,z,13.69);
   }
   for(const z of [10,12,14,16,18])check(-37.5,z,17.08);
   for(const z of [12.1,14,16,18])check(-25.8,z,15.66);
  }
  return {checked,blue:[-35,-34.7,-34.6,-34.5,-34.2,-33.9,-33.65,-33.5].map(x=>({x,rows:[14.6,14.8,15,15.3,15.3849,15.5].map(z=>({z,hits:top(x,z)}))})),red:[-23.5,-23,-22.9,-22.8,-22.7,-22.6,-22.5,-22.4,-22.3,-22.2,-22.1].map(x=>({x,rows:[16.5,16.8,17,17.1,17.2249,17.3,17.4,17.5,17.6,18].map(z=>({z,hits:top(x,z)}))}))};
 },stage==='before');
 assert.deepEqual(errors,[]);assert.equal(await modelSourceHash(),sourceHash);
 await writeFile(new URL(stage+'-'+mode+'-validation.json',out),JSON.stringify({sourceHash,build,errors,views,survey},null,2)+'\n');
 console.log('PASS: '+stage+' '+mode+' hardware-rendered roof views; no page or shader errors.');
}finally{await browser?.close();server.kill();}
