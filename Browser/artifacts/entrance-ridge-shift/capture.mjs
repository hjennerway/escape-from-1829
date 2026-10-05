import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {spawn} from 'node:child_process';
import {writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const stage=process.argv[2]??'before',mode=process.argv[3]??'source',out=new URL('./',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const errors=[];
const views={marked:{position:[-38,32,44],target:[-26,12,12],up:[0,1,0],fov:40},close:{position:[-30,25,35],target:[-26,14,16],up:[0,1,0],fov:40},low:{position:[-30,16,32],target:[-26,13.5,17],up:[0,1,0],fov:45},plan:{position:[-28,52,16],target:[-28,0,16],up:[0,0,-1],fov:32}};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1350,height:800}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
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
  const cornices=[];e.model.traverse(o=>{if(o.isMesh&&/^Entrance west mitred cornice/.test(o.name))cornices.push(o);});
  const intersections=[];
  for(const o of cornices){const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position;
   for(let i=0;i<p.count;i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld)),[a,b,c]=v,n=b.clone().sub(a).cross(c.clone().sub(a));if(n.y<=1e-8)continue;
    for(const w of [[1/3,1/3,1/3],[.1,.2,.7],[.2,.7,.1],[.7,.1,.2]]){const q=v.reduce((q,v,j)=>q.addScaledVector(v,w[j]),new T.Vector3());ray.set(new T.Vector3(q.x,q.y+1,q.z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(roofs,false).find(h=>h.point.y<q.y-.0001&&h.point.y>q.y-.1);
     if(h)intersections.push({cornice:o.name,point:q.toArray(),slate:h.point.toArray(),roof:h.object.name});}
   }if(g!==o.geometry)g.dispose();
  }
  const ridge=[];for(const z of [12.05,13,14,15,16,17,18,18.3]){ray.set(new T.Vector3(-25.8,30,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];ridge.push({z,y:h?.point.y,name:h?.object.name});}
  const retained=[],contacts=[];
  const check=(x,z,y,list)=>{ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];if(!h||Math.abs(h.point.y-y)>.002)throw Error('Visible roof mismatch at '+[x,z]+': '+h?.point.y+' expected '+y);list.push({x,z,y:h.point.y});};
  for(const x of [-67,-64,-60,-56,-53,-49,-45,-40,-36,-32])check(x,9.25,17.08,retained);
  for(const [x,end] of [[-68,17],[-58.4,3.7],[-52.5,14.5],[-37.5,18.5]])for(const t of [.2,.5,.8])check(x,9.25+(end-9.25)*t,17.08,retained);
  for(const x of [-26.8,-25,-22,-19,-16,-13,-11.3])check(x,12,15.66,retained);
  for(const x of [-28.6,-27.5,-26.5,-25.5,-24.5,-23.5,-22.8])check(x,19.6249,13.69,contacts);
  for(const x of [-28,-27,-26,-25,-24,-23]){ray.set(new T.Vector3(x,30,19.8),new T.Vector3(0,-1,0));const h=ray.intersectObjects(parts,false)[0];if(!h||h.object.material===roof||Math.abs(h.point.y-13.69)>.001)throw Error('Slate over exposed front cornice');contacts.push({x,z:19.8,y:h.point.y});}
  return {intersections,ridge,retained,contacts,modelMode:e.modelBuild};
 });
 await page.setViewportSize({width:390,height:844});await page.evaluate(v=>window.review.show({...v,fov:48}),views.marked);await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',out))});
 if(errors.length)throw Error(errors.join('\n'));
 if(stage!=='before'&&(diagnostics.intersections.length||diagnostics.ridge.some(p=>Math.abs(p.y-15.66)>.00001)))throw Error('Ridge or render regression');
 await writeFile(new URL(stage+'-validation.json',out),JSON.stringify({errors,views,...diagnostics},null,2)+'\n');console.log(JSON.stringify({stage,mode,errors,intersections:diagnostics.intersections.length,ridge:diagnostics.ridge,retained:diagnostics.retained.length,contacts:diagnostics.contacts.length}));
}finally{await browser?.close();server.kill();}
