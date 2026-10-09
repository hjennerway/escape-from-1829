import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const label=process.argv[2]??'before',mode=process.argv.includes('--compiled')?'compiled':'source';
const destination=new URL('./'+label+'-'+mode+'/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1007,height:576}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async route=>{
  const source=(await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8')).replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(',`window.inspect={THREE,walker,workshops,exterior,renderer,lighting,timeline,render(){renderer.render(exterior.scene,exterior.camera);}};window.__manual=true;\n  loadEscapeFrontage(`);
  await route.fulfill({contentType:'text/javascript',body:source});
 });
 await page.goto(base+'/explore.html?view=irby-corridor&period=1916&lighting=day&models='+mode,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.inspect);
 await page.locator('#game').dispatchEvent('pointerdown',{button:0,pointerId:1,pointerType:'mouse',clientX:500,clientY:280});
 await page.locator('#game').dispatchEvent('pointerup',{button:0,pointerId:1});
 await page.addStyleTag({content:'.explore-guide,#layoutControls,.explore-nav{display:none!important}'});
 if(process.argv.includes('--unbiased-court'))await page.evaluate(()=>{inspect.exterior.model.traverse(o=>{if(o.name.startsWith('Irby Estates continuous service court outside accessible gallery'))o.material.polygonOffset=false;});});
 if(process.argv.includes('--unbiased-ground'))await page.evaluate(()=>{inspect.exterior.model.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&o.material.polygonOffset)o.material.polygonOffset=false;});});
 const model=await page.evaluate(()=>inspect.exterior.modelBuild);console.log(model);
 const receipts=[];
 for(const [name,position,target,open] of [
  ['approach-far',[210,1.8,-66.6],[221.7,1.8,-66.6],false],
  ['approach-middle',[215,1.8,-66.6],[221.7,1.8,-66.6],false],
  ['approach-near',[219.5,1.8,-66.6],[221.7,1.8,-66.6],false],
  ['outside-closed',[225,1.8,-66.6],[221.7,1.8,-66.6],false],
  ['outside-wall',[223.2,1.8,-66.6],[221.7,.4,-66.6],true],
  ['outside-oblique',[225,1.8,-71],[221.7,1.2,-66.6],true],
 ]){
  await page.evaluate(({position,target,open})=>{const {walker,workshops}=inspect;walker.setView({position,target});workshops.workshops.setDoorOpen('irby-corridor-door',open);for(let i=0;i<30;i++)workshops.update(.04,walker.actor);inspect.render();},{position,target,open});
  await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
  if(name==='approach-far'||name==='outside-wall'||name==='outside-closed')receipts.push(await page.evaluate(name=>{
   const {THREE,exterior}=inspect,camera=exterior.camera,meshes=[];exterior.scene.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});const samples=[];
   for(const py of name==='approach-far'?[336,340,342,343,344,345,346,350]:name==='outside-closed'?[530,540,550]:[350,380,420])for(const px of name==='outside-closed'?[800,850,875,900,930,960]:[430,450,475,503,530,560,585]){
    const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(px/1007*2-1,1-py/576*2),camera);
    samples.push({px,py,hits:ray.intersectObjects(meshes,false).slice(0,3).map(h=>({name:h.object.name,parent:h.object.parent.name,point:h.point.toArray(),instance:h.instanceId}))});
   }return {name,samples};
  },name));
 }
 const surfaces=await page.evaluate(()=>{const {THREE,exterior}=inspect,rows=[];exterior.model.traverse(o=>{if(!o.isMesh||o.userData.aerialBatch||o.parent.name==='Workshop cached static shadow geometry')return;const b=new THREE.Box3().setFromObject(o);if(b.max.x>219&&b.min.x<224&&b.max.z>-69.5&&b.min.z<-63.5&&b.min.y<1.5){const parents=[];for(let p=o.parent;p;p=p.parent)parents.push(p.name);rows.push({name:o.name,parents,material:{name:o.material.name,userData:o.material.userData,offset:o.material.polygonOffset},min:b.min.toArray(),max:b.max.toArray(),instanced:o.isInstancedMesh});}});return rows;});
 await writeFile(new URL('inspection.json',destination),JSON.stringify({model,receipts,surfaces,errors},null,2));console.log(JSON.stringify({errors}));
}finally{await browser?.close();server.kill();}
