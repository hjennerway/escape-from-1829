import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const out=new URL('./artifacts/west-forward-fire-exit/',import.meta.url);await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const views=[
  {name:'angle',position:[-49,3.8,53],target:[-41.4,3.7,44.8],fov:54},
  {name:'photo-angle',position:[-35.5,2.6,52],target:[-42,4,44.5],fov:64},
  {name:'front',position:[-36.6,2.05,46.05],target:[-45.2,3.9,46.05],fov:65},
  {name:'overview',position:[-52,13,63],target:[-40,3.9,44.5],fov:49},
  {name:'door',position:[-41.9,7.1,49.8],target:[-39,5.1,43.5],fov:58}
];
const browser=await launchHardwareBrowser();
try{
  const page=await browser.newPage({viewport:{width:1220,height:900},reducedMotion:'reduce'}),errors=[],metrics={};
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.fireExitTest={THREE,walker,exterior,renderer,lighting};const clock=new THREE.Timer();')});});
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.fireExitTest={THREE,renderer,exterior,layouts,buildingDetail,controls};function frame(){')});});
  async function ready(url){await page.goto(base+url);await page.waitForFunction(()=>window.fireExitTest?.renderer.info.render.frame>3);await page.locator('[data-lighting="day"]').click();await page.addStyleTag({content:'body > :not(canvas){visibility:hidden!important}'});}
  async function capture(mode,selected=views){
    const captures={};
    for(const view of selected){
      await page.evaluate(v=>{
        const t=window.fireExitTest;t.exterior.scene.fog.density=0;
        if(t.walker)t.walker.setView(v);
        else{const c=t.exterior.camera;c.position.set(...v.position);c.lookAt(...v.target);c.fov=v.fov;c.updateProjectionMatrix();t.controls.sync(v.target);}
      },view);
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const shot=await page.screenshot({path:fileURLToPath(new URL(mode+'-'+view.name+'.png',out))});
      // The page adds a separate selection-glow pass. Compare the actual scene
      // submission, whose counters exclude that overlay and cached shadow work.
      captures[view.name]={shot,...await page.evaluate(()=>{const {renderer,exterior}=window.fireExitTest;renderer.render(exterior.scene,exterior.camera);return {triangles:renderer.info.render.triangles,calls:renderer.info.render.calls};})};
    }
    return captures;
  }
  if(process.argv.includes('--before')){
    const source=await readFile(new URL('before-west-forward-end-photo-detail.mjs',out),'utf8');
    await page.route('**/west-forward-end-photo-detail.mjs',route=>route.fulfill({contentType:'text/javascript',body:source}));
    await ready('/explore.html?view=west-forward-end-photo');await capture('before');
  }else{
    await ready('/explore.html?view=west-forward-end-photo');await capture('after');
    metrics.walking=await page.evaluate(()=>{
      const {walker}=window.fireExitTest,trace=[];
      function follow(points){
        for(const [x,z] of points){
          const a=walker.actor;let i=0;
          while(Math.hypot(a.x-x,a.z-z)>.035&&i++<1500){
            // Camera yaw is zero: D changes x, W changes -z.
            walker.keys.clear();const dx=x-a.x,dz=z-a.z;
            walker.keys.add(Math.abs(dx)>Math.abs(dz)?(dx>0?'KeyD':'KeyA'):(dz>0?'KeyS':'KeyW'));walker.update(.008);
          }
          walker.keys.clear();walker.update(.05);
          if(Math.hypot(a.x-x,a.z-z)>.055)throw Error('Fire-exit route blocked '+JSON.stringify({target:[x,z],actor:a}));
          trace.push({...a});
        }
      }
      walker.setView({position:[-38.9,2.1,46.05],target:[-38.9,2.1,40]});
      follow([[-39.35,46.05],[-45.75,46.05],[-45.75,44.5],[-39.35,44.5],[-39,44.5],[-39,43.8]]);
      if(walker.actor.y<4.2)throw Error('Fire-exit climb does not reach the door');
      if(walker.nearbyDoor()?.id!=='F5'||!walker.useDoor()||walker.actor.outside)throw Error('F5 does not enter');
      if(!walker.useDoor()||!walker.actor.outside)throw Error('F5 does not return outside');
      // Reset only the camera facing before walking down; preserve door arrival.
      const a={...walker.actor};walker.setView({position:[a.x,a.y+1.8,a.z],target:[a.x,a.y+1.8,a.z-1]});
      follow([[-39,44.5],[-39.35,44.5],[-45.75,44.5],[-45.75,46.05],[-38.9,46.05]]);
      if(walker.actor.y>.7)throw Error('Fire-exit descent does not reach ground');
      return trace;
    });
    await page.setViewportSize({width:390,height:844});await capture('after-mobile',[{...views[0],position:[-49.8,4.2,54.5],target:[-42,3.8,44.9],fov:78}]);
    await page.setViewportSize({width:1220,height:900});
    if(process.argv.includes('--compiled')){
      const shots={};
      for(const mode of ['source','compiled']){
        await ready('/aerial.html?models='+mode+'&buildingDetail=full&view=west-forward-end-photo');
        const build=await page.evaluate(()=>window.fireExitTest.exterior.modelBuild);
        assert.equal(build.mode,mode==='source'?'procedural':'compiled');metrics[mode]=build;shots[mode]=await capture(mode);
      }
      metrics.comparison={};
      // Compare only views of the changed stair, this facade and its approach.
      for(const view of views){
        const a=shots.source[view.name],b=shots.compiled[view.name];
        assert.equal(a.triangles,b.triangles,'Matching geometry in '+view.name);
        assert.equal(a.calls,b.calls,'Matching scene draw calls in '+view.name);
        const pixels=await page.evaluate(async encoded=>{
          const read=async s=>{const bytes=Uint8Array.from(atob(s),c=>c.charCodeAt(0)),img=await createImageBitmap(new Blob([bytes],{type:'image/png'}));const c=new OffscreenCanvas(img.width,img.height),ctx=c.getContext('2d');ctx.drawImage(img,0,0);img.close();return ctx.getImageData(0,0,c.width,c.height).data;};
          const [a,b]=await Promise.all(encoded.map(read));let changed=0,total=0;
          for(let i=0;i<a.length;i+=4){let diff=0;for(let c=0;c<3;c++)diff+=Math.abs(a[i+c]-b[i+c]);if(diff>9)changed++;total+=diff;}
          return {significantFraction:changed/(a.length/4),meanChannelError:total/(a.length/4*3)};
        },[a.shot.toString('base64'),b.shot.toString('base64')]);
        assert(pixels.significantFraction<.005&&pixels.meanChannelError<.5,'Source/compiled fire-exit match in '+view.name);
        metrics.comparison[view.name]={...pixels,triangles:a.triangles,sourceCalls:a.calls,compiledCalls:b.calls};
      }
    }
  }
  assert.deepEqual(errors,[]);metrics.errors=errors;
  await writeFile(new URL(process.argv.includes('--before')?'before-browser.json':'browser-validation.json',out),JSON.stringify(metrics,null,2)+'\n');
  console.log('PASS: matching fire-exit photo views, '+(process.argv.includes('--before')?'original capture':'actual F5 climb/door/descent and phone view')+', no browser or shader errors.');
}finally{await browser.close();server.kill();}
