import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import * as THREE from './dist/vendor/three.module.js';
import {decodeModel} from './dist/model-binary.mjs';
import {restoreAerialScene} from './dist/aerial-scene.mjs';
import {modelSourceHash} from './model-build-inputs.mjs';
import {PERIODS} from './dist/estate-periods.mjs';

const manifest=JSON.parse(await readFile(new URL('./dist/compiled/manifest.json',import.meta.url),'utf8'));
assert.equal(manifest.sourceHash,await modelSourceHash(),'Rebuild models after editing source');
const packed=await readFile(new URL('./dist/compiled/'+manifest.file,import.meta.url));
assert.equal(createHash('sha256').update(packed).digest('hex'),manifest.sha256);
const raw=gunzipSync(packed),snapshot=decodeModel(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length));
const estate=restoreAerialScene(THREE,snapshot,16/9),{exterior,layouts,buildingDetail}=estate;
assert.equal(exterior.camera.aspect,16/9);assert(buildingDetail.stats.windows>2400);
assert.equal(exterior.newHospital,exterior.annexe);assert.equal(exterior.trees.parent,layouts.shared);
for(const historic of [true,false])for(const modern of [true,false]){
  layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
  assert.deepEqual(layouts.state,{historic,modern});assert.equal(layouts.shared.visible,historic||modern);assert.equal(layouts.carParkTrees.visible,!modern);
}
assert(exterior.terrain.material.customProgramCacheKey().startsWith('estate-grass'));
const light=exterior.scene.children.find(o=>o.isDirectionalLight);
assert.equal(light.shadow.autoUpdate,false);assert.equal(light.shadow.needsUpdate,true);

// The real page catches texture orientation, shader hooks, named frontage lookup
// and runtime controls that a serialization-only test cannot exercise.
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const baseURL=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);server.once('exit',code=>reject(new Error('Preview server exited: '+code)));});
let browser;const errors=[],metrics={},shots=new Map();
try{
  browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1000,height:700}});
  // Full-detail startup can exceed 30s with CI's software WebGL. Navigation
  // needs the same allowance as the rendered-frame check below.
  page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>{errors.push(error.message);console.error(error.stack);});
  page.on('console',message=>{if(message.type()==='error')console.error('Browser:',message.text());});
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch(),body=(await response.text()).replace('function frame(){','window.__models={renderer,exterior,layouts,buildingDetail,controls};\nfunction frame(){');
    await route.fulfill({response,body});
  });
  async function load(query){
    console.log('Checking aerial'+query);
    const start=performance.now();await page.goto(baseURL+'/aerial.html'+query);
    try{await page.waitForFunction(()=>window.__models?.renderer.info.render.frame>3,null,{timeout:120000});}
    catch(error){console.error(await page.evaluate(()=>({ready:document.readyState,debug:!!window.__models,frame:window.__models?.renderer.info.render.frame,build:window.__models?.exterior.modelBuild})));throw error;}
    return {...await page.evaluate(()=>({
      ...window.__models.exterior.modelBuild,triangles:window.__models.renderer.info.render.triangles,calls:window.__models.renderer.info.render.calls,
      levels:window.__models.buildingDetail?.entries.map(e=>e.level)
    })),readyMilliseconds:performance.now()-start};
  }
  for(const mode of ['source','compiled']){
    metrics[mode]=await load('?models='+mode);assert.equal(metrics[mode].mode,mode==='source'?'procedural':'compiled');
    shots.set(mode,await page.screenshot());
  }
  assert.equal(metrics.source.triangles,metrics.compiled.triangles,'Compiled scene must draw the same geometry');
  assert.equal(metrics.source.calls,metrics.compiled.calls,'Prebuilding must preserve batches');
  assert.deepEqual(metrics.source.levels,metrics.compiled.levels);
  // Compare both paths on the same browser/driver. Allow tiny rasterization and
  // color-rounding differences, but reject missing geometry or flipped textures.
  metrics.identicalScreenshot=shots.get('source').equals(shots.get('compiled'));
  metrics.pixels=await page.evaluate(async images=>{
    const read=async encoded=>{
      const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),image=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
      const canvas=new OffscreenCanvas(image.width,image.height),context=canvas.getContext('2d');context.drawImage(image,0,0);image.close();
      return context.getImageData(0,0,canvas.width,canvas.height).data;
    };
    const [a,b]=await Promise.all(images.map(read));let changed=0,total=0;
    for(let i=0;i<a.length;i+=4){let difference=0;for(let c=0;c<3;c++)difference+=Math.abs(a[i+c]-b[i+c]);if(difference>9)changed++;total+=difference;}
    return {significantFraction:changed/(a.length/4),meanChannelError:total/(a.length/4*3)};
  },[shots.get('source').toString('base64'),shots.get('compiled').toString('base64')]);
  assert(metrics.pixels.significantFraction<.005&&metrics.pixels.meanChannelError<.5,'Precompiled rendering must visually match procedural rendering');
  await page.keyboard.press('t');assert.equal(await page.evaluate(()=>window.__models.exterior.trees.visible),false);
  await page.keyboard.press('t');
  for(const index of [0,4,6,9,10,11,8]){
    await page.locator('#periodSlider').fill(String(index));
    assert.equal(await page.evaluate(()=>window.__models.exterior.timeline.period.year),PERIODS[index].year);
  }
  const before=await page.evaluate(()=>window.__models.exterior.camera.position.toArray());
  await page.mouse.move(500,350);await page.mouse.down();await page.mouse.move(570,370);await page.mouse.up();
  await page.waitForFunction(before=>JSON.stringify(window.__models.exterior.camera.position.toArray())!==JSON.stringify(before),before);
  await page.setViewportSize({width:390,height:844});await page.locator('#resetAerial').click();
  assert.equal(await page.evaluate(()=>window.__models.exterior.camera.aspect),390/844);
  metrics.fullDetail=await load('?models=compiled&buildingDetail=full&view=front');
  assert.equal(metrics.fullDetail.mode,'compiled');assert.equal(await page.evaluate(()=>window.__models.buildingDetail),null);
  // Missing, stale/incompatible and damaged assets all keep the page usable.
  await page.route('**/compiled/manifest.json',route=>route.fulfill({status:404,body:'Not built'}));
  assert.equal((await load('')).mode,'procedural');
  await page.unroute('**/compiled/manifest.json');
  await page.route('**/compiled/manifest.json',route=>route.fulfill({json:{...manifest,format:999}}));
  assert.equal((await load('')).mode,'procedural');
  await page.unroute('**/compiled/manifest.json');
  await page.route('**/compiled/*.bin.gz',route=>route.fulfill({body:Buffer.from('broken model')}));
  assert.equal((await load('')).mode,'procedural');
  assert.deepEqual(errors,[]);
  const artifacts=new URL('./artifacts/',import.meta.url);await mkdir(artifacts,{recursive:true});
  for(const [mode,shot] of shots)await writeFile(new URL('precompiled-'+mode+'.png',artifacts),shot);
  await writeFile(new URL('precompiled-models.json',artifacts),JSON.stringify({bytes:manifest.bytes,uncompressedBytes:manifest.uncompressedBytes,...metrics},null,2)+'\n');
  console.log('PASS: compiled estate, shadows, grass shaders, exact draw counts, tree/layout controls, orbit, portrait, full detail and missing/incompatible/damaged model fallback.');
  console.log(JSON.stringify(metrics,null,2));
}finally{await browser?.close();server.kill();}
