import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const destination=new URL('./',import.meta.url);await mkdir(destination,{recursive:true});
const stage=process.env.SEAM_STAGE??'before';
const instrument=(await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8')).match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1592,height:725}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt')+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);await page.evaluate(()=>groundsTest.begin());await page.keyboard.press('f');
 const report=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=groundsTest,w=t.grounds.workshops,sun=t.exterior.scene.children.find(o=>o.isDirectionalLight),cx=window.corridorX;
  t.pose(cx,-83,.6,.45);
  const camera=new THREE.OrthographicCamera(-1,1,.65,-.65,.05,10),target=new THREE.WebGLRenderTarget(256,256),bytes=new Uint8Array(256*256*4),originalTarget=t.renderer.getRenderTarget();
  const strength=w.lighting.uniforms.workshopStrength.value;w.lighting.uniforms.workshopStrength.value=0;
  const result={};
  for(const mode of ['day','dusk','night']){
   t.exterior.lighting.setMode(mode);const intensity=sun.intensity;
   camera.position.set(cx,4.45,-83);camera.lookAt(w.group.userData.gallery.minX+.2875,4.45,-83);camera.updateMatrixWorld(true);
   const draw=value=>{sun.intensity=value;t.renderer.setRenderTarget(target);t.renderer.render(t.exterior.scene,camera);t.renderer.readRenderTargetPixels(target,0,0,256,256,bytes);return bytes.slice();};
   const off=draw(0),on=draw(intensity),rows=[];
   for(let y=0;y<256;y++){let sum=0,max=0;for(let x=8;x<248;x++){let delta=0;for(let c=0;c<3;c++)delta+=Math.max(0,on[(y*256+x)*4+c]-off[(y*256+x)*4+c]);sum+=delta/3;max=Math.max(max,delta/3);}rows.push({height:4.45+(y/255-.5)*1.3,gain:sum/240,max});}
   result[mode]=rows.filter(r=>r.height>4.85&&r.height<5.05);sun.intensity=intensity;
  }
  t.renderer.setRenderTarget(originalTarget);target.dispose();w.lighting.uniforms.workshopStrength.value=strength;
  result.renderer=t.renderer.getContext().getParameter(t.renderer.getContext().getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  return result;
 });
 for(const mode of ['day','dusk','night']){
  await page.evaluate(mode=>groundsTest.exterior.lighting.setMode(mode),mode);
  for(const [name,pose] of Object.entries({'gallery':[154.773125,-83,.6,.45],'blank-wall':[154.773125,-30,.65,.5],'gallery-north':[154.773125,-108,.65,.42],'hale':[145,-95.405,2.2,.45],'diagonal':[132,-141,1.4,.45]})){
   await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(stage+'-'+mode+'-'+name+'.png',destination))});
  }
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.evaluate(()=>groundsTest.pose(154.773125,-30,.65,.5));await page.screenshot({path:fileURLToPath(new URL(stage+'-phone.png',destination))});
 report.performance=await page.evaluate(()=>{
  const t=groundsTest,w=t.grounds.workshops,gl=t.renderer.getContext(),samples={};
  const measure=(name,frame)=>{const times=[];for(let i=0;i<30;i++){const begin=performance.now();frame(i);t.render();gl.finish();if(i>=10)times.push(performance.now()-begin);}times.sort((a,b)=>a-b);samples[name]={medianMs:times[10],draws:t.renderer.info.render.calls};};
  t.pose(corridorX,-83,.6,.45);measure('still',()=>t.step(1/60));measure('walking',i=>t.pose(corridorX,-78-i*.3,.6,.45));
  t.pose(corridorX,-40,Math.PI/2,-.08);w.setDoorOpen('workshop-door:repair',true);measure('door',()=>t.step(1/60));return {...samples,atlasBakes:w.lighting.bakes};
 });
 await writeFile(new URL(stage+'.json',destination),JSON.stringify({report,errors},null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify({renderer:report.renderer,peak:Object.fromEntries(['day','dusk','night'].map(m=>[m,Math.max(...report[m].map(r=>r.gain))])),performance:report.performance,errors},null,2));
}finally{await browser?.close();server.kill();}
