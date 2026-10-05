import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {auditCourtyardShadows,auditSunlitReceiverPlanes} from './fixtures/exterior-shadow-samples.mjs';

const destination=new URL('./artifacts/courtyard-light/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1200,height:760},reducedMotion:'reduce'}),errors=[],report=[];page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.courtCheck={THREE,get ready(){return ready;},get exterior(){return exterior;},get renderer(){return renderer;},get camera(){return camera;},boot(){start();arrivalCutscene.update(3);state='paused';torch.visible=false;},pose(x,z,tx,tz,tilt=-.1,y=0){Object.assign(player,{x,y,z,floor:0,outside:true,stair:null,verticalTrend:0});yaw=Math.atan2(x-tx,z-tz);pitch=tilt;state='paused';keys.clear();showFloor();camera.position.set(x,y+1.65,z);camera.rotation.set(pitch,yaw,0);$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.courtCheck?.ready);await page.evaluate(()=>window.courtCheck.boot());
 await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 await page.evaluate(()=>{
  // The historical seam control uses the daylight sun, independent of menu lighting.
  const {exterior}=window.courtCheck;exterior.lighting.setMode('day');exterior.scene.updateMatrixWorld(true);
  const sun=exterior.scene.children.find(o=>o.isDirectionalLight),materials=new Map();
  exterior.model.traverse(o=>{for(const m of [o.material].flat())if(m&&!materials.has(m))materials.set(m,m.shadowSide);});
  window.courtCheck.saved={materials,bias:sun.shadow.bias,normalBias:sun.shadow.normalBias,filter:window.courtCheck.THREE.ShaderChunk.shadowmap_pars_fragment};
 });
 // Demonstrate that the original settings fail the same pixel/ray survey.
 await page.evaluate(()=>{const {exterior,saved}=window.courtCheck,sun=exterior.scene.children.find(o=>o.isDirectionalLight);for(const [m] of saved.materials)m.shadowSide=null;sun.shadow.bias=-.0003;sun.shadow.normalBias=.25;exterior.invalidateShadows();});
 const baseline=await page.evaluate(auditCourtyardShadows),leaks=baseline.flatMap(r=>r.measurements).filter(m=>m.blocked&&m.light>.05);
 // Driver precision changes how many old seams appear; the original settings
 // must still fail, while the repaired settings must seal every core sample.
 assert(leaks.length>0,'The rendered regression must detect the original courtyard seams');
 await page.evaluate(()=>{const {exterior,saved}=window.courtCheck,sun=exterior.scene.children.find(o=>o.isDirectionalLight);for(const [m,side] of saved.materials)m.shadowSide=side;sun.shadow.bias=saved.bias;sun.shadow.normalBias=saved.normalBias;exterior.invalidateShadows();});
 // The unmodified renderer must reproduce self-shadow banding at these offsets.
 const stockShader=(await import('./node_modules/three/src/renderers/shaders/ShaderChunk/shadowmap_pars_fragment.glsl.js')).default;
 await page.evaluate(stock=>{window.courtCheck.THREE.ShaderChunk.shadowmap_pars_fragment=stock;},stockShader);
 const striped=await page.evaluate(auditSunlitReceiverPlanes);
 assert(striped.some(r=>r.dim>r.count*.1),'Regression detects the original tessellated wall shadows');
 await page.evaluate(()=>{const c=window.courtCheck;c.THREE.ShaderChunk.shadowmap_pars_fragment=c.saved.filter;});
 for(const mode of ['day','dusk','night']){
  await page.evaluate(mode=>{const {exterior}=window.courtCheck;exterior.lighting.setMode(mode);const sun=exterior.scene.children.find(o=>o.isDirectionalLight);sun.updateMatrix();sun.target.updateMatrix();exterior.scene.updateMatrixWorld(true);exterior.invalidateShadows();},mode);
  const receivers=await page.evaluate(auditSunlitReceiverPlanes);
  const surveys=await page.evaluate(auditCourtyardShadows);report.push({mode,receivers,surveys});
  const samples=surveys.flatMap(r=>r.measurements),blocked=samples.filter(m=>m.blocked);
  await writeFile(new URL('rendered-shadow-survey.json',destination),JSON.stringify({baselineLeaks:leaks.length,striped,report,errors},null,2)+'\n');
  for(const receiver of receivers)assert(receiver.darkest>=.98,mode+' self-shadow stripes: '+JSON.stringify(receiver));
  assert(samples.length>=80,'Survey both courtyards and adjoining wall bases');assert(blocked.length>=30,'Verify solid masonry occludes the sun');
  for(const sample of blocked.filter(m=>m.core))assert(sample.light<=.05,mode+' light leak: '+JSON.stringify(sample));
  assert(samples.some(m=>!m.blocked&&m.light>.9),'Preserve direct sunlight on genuinely open ground');
  await page.evaluate(()=>window.courtCheck.pose(-21,-9.3,-25,-9.3));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(mode+'-validated-corner.png',destination))});
 }
 await page.evaluate(()=>window.courtCheck.pose(0,62,0,15,.18));await page.screenshot({path:fileURLToPath(new URL('validated-frontage.png',destination))});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.courtCheck.pose(-21,-9.3,-25,-9.3));await page.screenshot({path:fileURLToPath(new URL('validated-mobile.png',destination))});
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${report.reduce((sum,r)=>sum+r.receivers.reduce((s,v)=>s+v.count,0),0)} sunlit receiver pixels without stripes and ${report.reduce((sum,r)=>sum+r.surveys.reduce((s,v)=>s+v.measurements.length,0),0)} rendered contact samples across both courtyards in day/dusk/night; stock filter stripes and ${leaks.length} original leaks rejected; desktop/mobile and no page/shader errors.`);
}finally{await browser?.close();server.kill();}
