import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const out=new URL(process.env.INTERIOR_LOADING_ARTIFACT_DIR??'./artifacts/interior-loading/',import.meta.url);await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const errors=[],results=[];
try{
 browser=await launchHardwareBrowser();
 for(const [name,worker,width,height] of [['assets',false,1200,800],['worker-mobile',true,390,844]]){
  const page=await browser.newPage({viewport:{width,height}});page.setDefaultTimeout(180000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());if(m.text().startsWith('Loading check:'))console.log(m.text());});
  await page.route('**/loading-check.html',route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0"><canvas id="view"></canvas>'}));await page.goto(base+'/loading-check.html');
  const result=await page.evaluate(async({worker,width,height})=>{
   const THREE=await import('/vendor/three.module.js'),{buildAsylumLayout}=await import('/asylum-layout.mjs'),{furnishAsylum}=await import('/asylum-furniture.mjs'),{loadFurnitureModels}=await import('/furniture-models.mjs'),{createInteriorSectionLoader}=await import('/interior-streaming.mjs'),{createInteriorLights}=await import('/interior-lights.mjs');
   const floors=buildAsylumLayout(await(await fetch('/asylum-plan.json')).json()).floors;furnishAsylum(floors,{seed:1829});
   const models=await loadFurnitureModels(THREE),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(74,width/height,.05,150),renderer=new THREE.WebGLRenderer({canvas:document.getElementById('view'),antialias:true});renderer.setSize(width,height);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;scene.background=new THREE.Color(0x343731);scene.fog=new THREE.FogExp2(0x343731,.018);scene.add(new THREE.HemisphereLight(0xc5d6d4,0x686253,1.1));
   const lights=createInteriorLights(THREE,scene,floors.flatMap(f=>[...f.rooms.map(r=>r.label),...f.stairs.map(s=>s.label)].map(([x,z])=>({x,z,y:f.elevation+(f.id===2?2.35:2.9),floor:f.id,color:0xffdbac}))));
   let failNext=false;const originalCompile=renderer.compileAsync.bind(renderer);renderer.compileAsync=(...args)=>{if(failNext){failNext=false;throw Error('Simulated graphics preparation failure');}return originalCompile(...args);};
   let failWorker=worker;const loader=createInteriorSectionLoader(THREE,{scene,floors,models,renderer,camera,fetchFile:worker?()=>Promise.resolve(new Response('',{status:404})):fetch,makeWorker:()=>{if(failWorker){failWorker=false;throw Error('Simulated worker launch failure');}return new Worker('/interior-worker.mjs',{type:'module'});}});
   async function until(check){const deadline=performance.now()+60000;while(!check()){if(performance.now()>deadline)throw Error('Loading timed out: '+JSON.stringify(loader.sections.map(s=>({id:s.id,state:s.state,error:s.error?.message}))));await new Promise(r=>setTimeout(r,20));}}
   const actor={x:floors[0].spawn.x*floors[0].cellSize,z:floors[0].spawn.z*floors[0].cellSize,floor:0,y:0};camera.position.set(actor.x,1.65,actor.z);camera.lookAt(actor.x,1.65,actor.z-6);
   lights.update(actor);
   if(worker){let rejected=false;try{await loader.prepare(actor);}catch{rejected=true;}if(!rejected||!loader.failed)throw Error('Worker launch failure did not remain retryable');loader.retry();}
   await Promise.race([loader.prepare(actor),new Promise((_,reject)=>setTimeout(()=>reject(Error('Initial preparation timed out: '+JSON.stringify(loader.sections.map(s=>({id:s.id,state:s.state,error:s.error?.message})))+'; '+JSON.stringify(loader.stats.steps.slice(-4)))),60000))]);const initial=loader.sections.filter(s=>s.state==='ready').length;if(initial>=10)throw Error('Entry waits for the whole building');console.log('Loading check: entry ready '+initial+' sections');
   const frames=[],replays=[];let previous=performance.now(),active=true;function frame(){if(!active)return;const now=performance.now();frames.push(now-previous);previous=now;renderer.render(scene,camera);requestAnimationFrame(frame);}requestAnimationFrame(frame);
   function replay(seed){const begin=performance.now();furnishAsylum(floors,{seed});loader.furniture.forEach(f=>f.update());replays.push(performance.now()-begin);previous=performance.now();}
   // A failed section stays gated and retries without losing loaded rooms.
   const pending=loader.sections.find(s=>s.state==='waiting'),approach={x:Number.isFinite(pending.minX)?pending.minX+1:pending.maxX-1,z:10,floor:pending.floor};failNext=true;
   if(loader.allowMove(actor,approach))throw Error('Unprepared entry allowed');
   await until(()=>pending.state==='failed');
   const cached=loader.sections.filter(s=>s.state==='ready').length;loader.retry();loader.startBackground();replay(1831);
   await until(()=>loader.complete);
   if(loader.sections.filter(s=>s.state==='ready').length!==10||cached!==initial)throw Error('Retry lost ready rooms');
   if(!loader.allowMove(actor,approach))throw Error('Prepared entry held');
   for(const floor of floors){const ids=new Set(loader.furniture[floor.id].group.children.flatMap(m=>m.userData.furnitureIds));if(ids.size!==floor.furniture.length||floor.furniture.some(i=>!ids.has(i.id)))throw Error('Replay during loading lost furniture');}
   for(const floor of floors){for(const exit of floor.exits){await loader.prepare({...exit.inside,floor:floor.id});if(!loader.isReady({...exit.inside,floor:floor.id}))throw Error('Entrance missing');}for(const stair of floor.stairs)for(const pair of stair.connections)for(const id of pair){const point={x:stair.label[0],z:stair.label[1],floor:id};await loader.prepare(point);if(!loader.isReady(point))throw Error('Stair landing missing');}}
   const before=loader.stats.steps.length;await loader.prepare(actor);if(loader.stats.steps.length!==before)throw Error('Return visit rebuilt a cached room');
   active=false;replay(1830);
   for(const floor of floors){const rendered=new Set(loader.furniture[floor.id].group.children.flatMap(m=>m.userData.furnitureIds));if(rendered.size!==floor.furniture.length||floor.furniture.some(i=>!rendered.has(i.id)))throw Error('Replay changed logical/rendered furniture agreement');}
   const buffers=new Set();scene.traverse(o=>{if(o.geometry)for(const attr of Object.values(o.geometry.attributes))buffers.add(attr.array.buffer);if(o.geometry?.index)buffers.add(o.geometry.index.array.buffer);if(o.instanceMatrix)buffers.add(o.instanceMatrix.array.buffer);});
   renderer.render(scene,camera);const sorted=frames.slice(5).sort((a,b)=>a-b),value={mode:loader.stats.mode,initialSections:initial,totalSections:10,stats:loader.stats,frames:{count:frames.length,median:sorted[Math.floor(sorted.length*.5)],p99:sorted[Math.floor(sorted.length*.99)],maximum:Math.max(...sorted)},replayGenerationMilliseconds:replays,retainedGeometryBufferBytes:[...buffers].reduce((n,b)=>n+b.byteLength,0),heapBytes:performance.memory?.usedJSHeapSize,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};window.loadingCheck={loader,scene,renderer,camera,floors};return value;
  },{worker,width,height});
  assert.equal(result.mode,worker?'worker':'assets');assert(result.frames.count>10);results.push({name,...result});await page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});await page.close();
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',out),JSON.stringify({results,errors},null,2)+'\n');console.log('PASS: assets/worker fallback, desktop/mobile, gated failed entry and retry, every entrance/stair, cached return, replay furniture, frame and memory measurements.');console.log(JSON.stringify(results.map(({name,initialSections,frames,heapBytes,retainedGeometryBufferBytes,stats})=>({name,initialSections,frames,heapBytes,retainedGeometryBufferBytes,firstReadyMilliseconds:stats.firstReadyMilliseconds,maxRestore:Math.max(...stats.steps.filter(s=>s.stage==='restore').map(s=>s.milliseconds)),maxFurniture:Math.max(...stats.steps.filter(s=>s.stage==='furniture').map(s=>s.milliseconds)),maxUpload:Math.max(...stats.steps.filter(s=>s.stage==='upload').map(s=>s.milliseconds))})),null,2));
}finally{await browser?.close();server.kill();}
