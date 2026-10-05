import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const stage=process.argv[2]??'before',mode=process.argv[3]??'source',out=new URL('./',import.meta.url);
await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,
 stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const errors=[],views=[
 ['redesmere','Redesmere aligned frontage slate roof',[.6,.75,1],1.1],
 ['west-join','West cross-range continuous roof join',[-.5,1,1],1.1],
 ['lean-to','West garden lean-to slate roof',[-1,.85,.4],1.2],
 ['oblique','Rear oblique wing slate roof',[1,1.2,1],1.1],
 ['annexe','Central hall slate roof',[1,1,1],1.1],
 ['service','Tower east dormered range slate roof',[1,1,1],1.1],
 ['outhouse','Outhouse continuous slate roof',[-1,1,1],1.4]
];
try{
 browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),
  args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:820}});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){',
   'window.review={exterior,renderer,controls,show(p,t){moved=true;navigationTarget=t;exterior.camera.position.set(...p);exterior.camera.lookAt(...t);controls.sync(t);}};function frame(){')});
 });
 await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full');
 await page.waitForFunction(()=>window.review?.renderer.info.render.frame>3);
 const actual=await page.evaluate(()=>window.review.exterior.modelBuild.mode);
 assert.equal(actual,mode==='source'?'procedural':'compiled');
 await page.locator('[data-lighting="day"]').click();
 await page.evaluate(()=>{const e=window.review.exterior;e.scene.fog.density=0;e.trees.visible=false;
  e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 const reports=[];
 for(const [name,roof,direction,zoom] of views){
  if(process.argv.includes('--service-only')&&name!=='service')continue;
  const view=await page.evaluate(async({roof,direction,zoom})=>{
   const THREE=await import('/vendor/three.module.js'),e=window.review.exterior,o=e.model.getObjectByName(roof);
   if(!o)throw Error('Missing roof: '+roof);
   const b=new THREE.Box3().setFromObject(o),target=b.getCenter(new THREE.Vector3()),size=b.getSize(new THREE.Vector3());
   const distance=Math.max(size.x,size.z)*zoom;
   const position=target.clone().add(new THREE.Vector3(...direction).normalize().multiplyScalar(distance));
   window.review.show(position.toArray(),target.toArray());return {roof,position:position.toArray(),target:target.toArray()};
  },{roof,direction,zoom});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const pixels=await page.evaluate(()=>{const {renderer,exterior}=window.review;renderer.render(exterior.scene,exterior.camera);
   const gl=renderer.getContext(),data=new Uint8Array(32*32*4);
   gl.readPixels(Math.floor(gl.drawingBufferWidth/2)-16,Math.floor(gl.drawingBufferHeight/2)-16,32,32,gl.RGBA,gl.UNSIGNED_BYTE,data);
   return {min:Math.min(...data.filter((_,i)=>i%4!==3)),max:Math.max(...data.filter((_,i)=>i%4!==3))};});
  assert(pixels.max-pixels.min>5,'Roof canvas must contain visible detail');
  await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',out))});
  reports.push({name,...view,pixels});console.log('Captured '+stage+' '+mode+' '+name);
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(target=>{
  const e=window.review.exterior,t=e.camera.position.clone().set(...target);
  const position=e.camera.position.clone().sub(t).multiplyScalar(2.6).add(t);
  window.review.show(position.toArray(),target);
 },reports.at(-1).target);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-phone.png',out))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(stage+'-'+mode+'-views.json',out),JSON.stringify({actual,errors,reports},null,2)+'\n');
}finally{await browser?.close();server.kill();}
