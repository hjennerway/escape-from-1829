import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';

const before=process.argv.includes('--before'),mode=process.argv.includes('--compiled')?'compiled':'source';
const stage=before?'before':mode,output=new URL('./',import.meta.url);
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const views={court:{position:[-53,25,-22],target:[-60,7,5],fov:45},pipe:{position:[-62,12,-10],target:[-67,4.7,5],fov:43}};
let browser;const errors=[];
try{
  browser=await launchHardwareBrowser();
  const page=await browser.newPage({viewport:{width:1426,height:825},reducedMotion:'reduce'});
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',route=>route.abort());
  if(before){
    const source=await readFile(new URL('before-west-court-photo-detail.mjs',output),'utf8');
    await page.route('**/west-court-photo-detail.mjs',route=>route.fulfill({contentType:'text/javascript',body:source}));
  }
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.pipeReview={exterior,renderer,controls,show(v){moved=true;navigationTarget=v.target;exterior.camera.position.set(...v.position);exterior.camera.lookAt(...v.target);exterior.camera.fov=v.fov;exterior.camera.updateProjectionMatrix();controls.sync(v.target);exterior.invalidateShadows();}};function frame(){')});
  });
  await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full&view=west-4');
  await page.waitForFunction(()=>window.pipeReview?.renderer.info.render.frame>3);
  assert.equal(await page.evaluate(()=>window.pipeReview.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  await page.locator('[data-lighting="day"]').click();
  await page.evaluate(()=>{const e=window.pipeReview.exterior;e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();});
  await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
  const metrics={};
  for(const [name,v] of Object.entries(views)){
    await page.evaluate(v=>window.pipeReview.show(v),v);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:fileURLToPath(new URL(stage+'-'+name+'.png',output))});
    metrics[name]=await page.evaluate(()=>{const {renderer,exterior}=window.pipeReview;renderer.render(exterior.scene,exterior.camera);return {triangles:renderer.info.render.triangles,calls:renderer.info.render.calls};});
  }
  const probes=before?[]:await page.evaluate(async()=>{
    const THREE=await import('/vendor/three.module.js'),e=window.pipeReview.exterior,parts=[],ray=new THREE.Raycaster(),results=[];
    e.model.updateMatrixWorld(true);e.model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
    function hit(x,y){ray.set(new THREE.Vector3(x,y,3.9),new THREE.Vector3(0,0,1));return ray.intersectObjects(parts,false)[0];}
    for(const y of [.5,1.7,6.1,8.85]){
      const p=hit(-66.55,y);
      if(p?.object.material.color.getHex()!==0x454b49||Math.abs(p.point.z-4.6975)>.00001)throw Error('Relocated visible pipe missing '+JSON.stringify({y,name:p?.object.name,point:p?.point.toArray(),color:p?.object.material.color.getHex()}));
      results.push({type:'pipe',point:p.point.toArray()});
    }
    for(const y of [1.7,6.1,10])if(hit(-71.7,y)?.object.material.color.getHex()===0x454b49)throw Error('Former far-end pipe remains');
    if(hit(-66.55,9.1)?.object.material.color.getHex()===0x454b49)throw Error('Pipe protrudes above low roof');
    for(const o of e.model.userData.westCourtPhotoOpenings.filter(o=>['west-court-low-bay','west-court-outer'].includes(o.face))){
      for(const u of [-.27,.27]){
        const pane=hit(o.x+u*o.w,o.y+.23*o.h);
        if(pane?.object.material.color.getHex()!==0x78989f)throw Error('Adjacent sash obstructed '+JSON.stringify(o));
        results.push({type:'pane',point:pane.point.toArray()});
      }
    }
    return results;
  });
  const comparison={};
  if(mode==='compiled'){
    const source=JSON.parse(await readFile(new URL('source-validation.json',output),'utf8'));
    for(const name of Object.keys(views)){
      assert.deepEqual(metrics[name],source.metrics[name],'Matching local scene submission');
      comparison[name]=await page.evaluate(async encoded=>{
        async function pixels(s){const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0)),img=await createImageBitmap(new Blob([b],{type:'image/png'})),c=new OffscreenCanvas(img.width,img.height),ctx=c.getContext('2d');ctx.drawImage(img,0,0);img.close();return ctx.getImageData(0,0,c.width,c.height).data;}
        const [a,b]=await Promise.all(encoded.map(pixels));let changed=0,total=0;
        for(let i=0;i<a.length;i+=4){let d=0;for(let c=0;c<3;c++)d+=Math.abs(a[i+c]-b[i+c]);if(d>9)changed++;total+=d;}
        return {significantFraction:changed/(a.length/4),meanChannelError:total/(a.length/4*3)};
      },await Promise.all(['source','compiled'].map(async prefix=>(await readFile(new URL(prefix+'-'+name+'.png',output))).toString('base64'))));
      assert(comparison[name].significantFraction<.005&&comparison[name].meanChannelError<.5,'Local source/compiled view matches');
    }
    const manifest=JSON.parse(await readFile(new URL('../../dist/compiled/manifest.json',import.meta.url),'utf8'));
    assert.equal(manifest.sourceHash,await modelSourceHash(),'Compiled source fingerprint is current');
  }
  assert.deepEqual(errors,[]);
  await writeFile(new URL(stage+'-validation.json',output),JSON.stringify({mode,views,metrics,probes,comparison,errors},null,2)+'\n');
  console.log('PASS: '+stage+' courtyard/pipe views, '+probes.length+' local visible probes, no page or shader errors.');
}finally{await browser?.close();server.kill();}
