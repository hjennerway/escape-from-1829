import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {spawn} from 'node:child_process';
import {writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',out=new URL('./',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const errors=[];
const views={plan:{position:[-51,65,11],target:[-51,0,11],up:[0,0,-1],fov:35},garden:{position:[-40,31,34],target:[-53,13,13],up:[0,1,0],fov:43},court:{position:[-44,31,-18],target:[-58.4,13,5],up:[0,1,0],fov:43},'garden-close':{position:[-44,24,23],target:[-52.5,14.8,14],up:[0,1,0],fov:45},'court-close':{position:[-50,25,-5],target:[-58.4,15,4.7],up:[0,1,0],fov:45}};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1390,height:800}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.review={exterior,renderer,controls,show(v){moved=true;navigationTarget=v.target;exterior.camera.up.set(...v.up);exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});});
 if(stage==='before')await page.route('**/west-cross-range-roof.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-roof.mjs',out),'utf8')}));
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 if(mode==='compiled'&&await page.evaluate(()=>window.review.exterior.modelBuild.mode)!=='compiled')throw Error('Expected compiled loading');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 for(const [name,v] of Object.entries(views)){await page.evaluate(v=>window.review.show(v),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',out))});}
 const diagnostics=await page.evaluate(async()=>{
  const T=await import('/vendor/three.module.js'),e=window.review.exterior,roof=e.model.getObjectByName('West end continuous slate roof').material,parts=[],roofs=[],ray=new T.Raycaster();
  e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});e.model.traverse(o=>{if(o.isMesh&&o.material===roof)roofs.push(o);});
  const cornices=[];e.model.traverse(o=>{if(o.isMesh&&/^West middle arm joined cornice|^West courtyard polygonal bay stone band|^West (court|garden) bay roof render/.test(o.name))cornices.push(o);});
  const intersections=[];let samples=0;
  const bounds=cornices.map(o=>({name:o.name,box:new T.Box3().setFromObject(o)}));
  for(const o of cornices){const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position;
   for(let i=0;i<p.count;i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld)),[a,b,c]=v,n=b.clone().sub(a).cross(c.clone().sub(a));if(n.y<=1e-8)continue;
    for(const w of [[1/3,1/3,1/3],[.1,.2,.7],[.2,.7,.1],[.7,.1,.2]]){const q=v.reduce((q,v,j)=>q.addScaledVector(v,w[j]),new T.Vector3());ray.set(new T.Vector3(q.x,30,q.z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(roofs,false).find(h=>h.point.y<q.y-.0001&&h.point.y>q.y-.2+.0001);samples++;
     if(h)intersections.push({cornice:o.name,point:q.toArray(),slate:h.point.toArray(),roof:h.object.name});}
   }if(g!==o.geometry)g.dispose();
  }
  const retained=[],joins=[];
  const check=(x,z,y,list)=>{ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];if(!h||Math.abs(h.point.y-y)>.002)throw Error('Visible roof mismatch at '+[x,z]+': '+h?.point.y+' expected '+y);list.push({x,z,y:h.point.y,name:h.object.name});};
  for(const x of [-67,-64,-60,-56,-53,-49,-45,-40,-36,-32])check(x,9.25,17.08,retained);
  for(const [x,end] of [[-68,17],[-58.4,3.7],[-52.5,14.5],[-37.5,18.5]])for(const t of [.2,.5,.8])check(x,9.25+(end-9.25)*t,17.08,retained);
  const endpoints=[[-58.4,-61.85,4.6,15.45],[-58.4,-54.95,4.6,15.45],[-52.5,-55.79,13.45,15.05],[-52.5,-49.21,13.45,15.05]];
  for(const [root,x,z,y] of endpoints)for(const t of [.2,.5,.8,.98]){const px=root+(x-root)*t,pz=9.25+(z-9.25)*t;ray.set(new T.Vector3(px,30,pz),new T.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];joins.push({root,x:px,z:pz,y:h?.point.y,expected:17.08+(y-17.08)*t,name:h?.object.name});}
  return {intersections,samples,bounds,retained,joins,modelMode:e.modelBuild};
 });
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(new URL(stage+'-validation.json',out),JSON.stringify({errors,views,...diagnostics},null,2)+'\n');console.log(JSON.stringify({stage,mode,errors,intersections:diagnostics.intersections.length,samples:diagnostics.samples,bounds:diagnostics.bounds,retained:diagnostics.retained.length}));
}finally{await browser?.close();server.kill();}
