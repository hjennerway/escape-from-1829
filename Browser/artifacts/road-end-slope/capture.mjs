import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';

const stage=process.argv[2]??'after',mode=stage==='compiled'?'compiled':'source';
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(stage==='before')for(const file of ['road-end-fades.mjs','ground-contact.mjs']){
  const body=await readFile(new URL('before-source/'+file,import.meta.url),'utf8');
  await page.route('**/'+file,r=>r.fulfill({contentType:'text/javascript',body}));
 }
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__ends={THREE,exterior,renderer,controls,layouts};function frame(){if(!window.__freezeEnds)requestAnimationFrame(frame);')});
 });
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.__ends?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 await page.evaluate(()=>{
  window.__freezeEnds=true;const {exterior}=window.__ends;
  exterior.scene.fog.density=0;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});
 });
 const views=[['central','Parsons Lane (1829 Central)','end',false],['church','Parsons Lane','end',false],['annexe-start','Ross Avenue (Part 2)','start',true],['annexe-end','Ross Avenue (Part 2)','end',true]];
 const report={views:[],errors};
 for(const [name,road,end,modern] of views){
  const result=await page.evaluate(({road,end,modern})=>{
   const {THREE,exterior,renderer,controls,layouts}=window.__ends;
   exterior.timeline?.setPeriod(modern?2021:1916);layouts.setVisible('historic',!modern);layouts.setVisible('modern',modern);
   const mesh=exterior.model.getObjectByName(road+' '+end+' gravel fade');
   if(!mesh)throw new Error('Missing fade '+road);
   mesh.updateWorldMatrix(true,false);
   const p=mesh.geometry.attributes.position,stride=mesh.userData.roadEndFade.columns+1;
   const left=new THREE.Vector3().fromBufferAttribute(p,0).applyMatrix4(mesh.matrixWorld),right=new THREE.Vector3().fromBufferAttribute(p,stride-1).applyMatrix4(mesh.matrixWorld);
   const center=left.clone().lerp(right,.5),direction=new THREE.Vector3().fromBufferAttribute(p,stride).applyMatrix4(mesh.matrixWorld).sub(left);direction.y=0;direction.normalize();
   const across=right.clone().sub(left).normalize(),target=center.clone().addScaledVector(direction,1);
   const position=center.clone().addScaledVector(direction,7).addScaledVector(across,road==='Parsons Lane (1829 Central)'?-11:11);position.y=1.65;
   exterior.camera.position.copy(position);exterior.camera.lookAt(target);exterior.camera.fov=50;exterior.camera.near=.1;exterior.camera.updateProjectionMatrix();controls.sync(target);exterior.invalidateShadows();
   // Sweep through small camera movements so the transparency is exercised
   // at neighbouring walking angles as well as in the saved still frame.
   for(let i=0;i<20;i++){exterior.camera.position.copy(position).addScaledVector(direction,i*.025);exterior.camera.lookAt(target);renderer.render(exterior.scene,exterior.camera);}
   return {png:renderer.domElement.toDataURL('image/png').split(',')[1],position:position.toArray(),target:target.toArray()};
  },{road,end,modern});
  await writeFile(new URL(stage+'-'+name+'.png',import.meta.url),Buffer.from(result.png,'base64'));
  report.views.push({name,road,end,position:result.position,target:result.target});
 }
 report.build=await page.evaluate(()=>window.__ends.exterior.modelBuild);
 await writeFile(new URL(stage+'.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 assert.deepEqual(errors,[]);if(mode==='compiled')assert.equal(report.build.mode,'compiled');
 console.log('PASS: '+stage+' road-end walking views and camera sweeps');
}finally{await browser?.close();server.kill();}
