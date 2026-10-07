import {interiorSections,sectionAt,sectionDistance,INTERIOR_SECTION_FORMAT} from './interior-sections.mjs';
import {decodeModel,deserializeScene} from './model-binary.mjs';
import {asylumArchitectureMaterials} from './asylum-architecture.mjs';
import {cellPaddingMaterial} from './padded-cell-models.mjs';
import {createFurnitureFloor} from './furniture-models.mjs';

const paint=()=>new Promise(resolve=>{const timer=setTimeout(resolve,50);requestAnimationFrame(()=>setTimeout(()=>{clearTimeout(timer);resolve();},0));});
const unpack=async bytes=>decodeModel(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());

export function createInteriorSectionLoader(THREE,{scene,floors,models,renderer,camera,floorGroups=null,fetchFile=fetch,makeWorker=()=>new Worker(new URL('./interior-worker.mjs',import.meta.url),{type:'module'}),schedule=paint}){
 const sections=interiorSections(floors).map(s=>({...s,state:'waiting',promise:null,error:null})),materials=new Map(),resources=new Map(),fallback=new Map(),stats={mode:'assets',steps:[],firstReadyMilliseconds:null},started=performance.now();
 const groups=floorGroups??floors.map(floor=>{const g=new THREE.Group();g.name=floor.name;g.position.y=floor.elevation;scene.add(g);return g;});
 for(const floor of floors)materials.set(floor.id,{...asylumArchitectureMaterials(THREE,floor),Padding:cellPaddingMaterial(THREE)});
 const furniture=floors.map(floor=>createFurnitureFloor(THREE,groups[floor.id],floor,models,{sectionFor:item=>sectionAt(sections,{...item,floor:floor.id}).id,isSectionReady:id=>sections.find(s=>s.id===id)?.state==='ready'}));
 let worker=null,workerRequest=null,workerQueue=Promise.resolve(),preparation=Promise.resolve(),libraryReady=null,running=false,background=false,target={x:0,z:17,floor:0},held=false;
 const manifest=fetchFile(new URL('./compiled/interior/manifest.json',import.meta.url),{cache:'no-cache'}).then(async response=>response.ok?response.json():null).then(value=>value?.format===INTERIOR_SECTION_FORMAT?value:null).catch(()=>null);
 const summary=()=>{scene.userData.interiorSectionsReady=sections.filter(s=>s.state==='ready').length;scene.userData.interiorSectionsComplete=sections.every(s=>s.state==='ready');};summary();
 function workerFloor(floor){
  if(fallback.has(floor))return fallback.get(floor);
  const job=workerQueue.then(()=>new Promise((resolve,reject)=>{
   try{
    worker??=makeWorker();workerRequest={resolve,reject};
    worker.onmessage=({data})=>{const request=workerRequest;workerRequest=null;if(data.error)request.reject(Error(data.error));else request.resolve(data);};
    worker.onerror=event=>{workerRequest?.reject(Error(event.message||'Room preparation failed'));workerRequest=null;worker.terminate();worker=null;};
    worker.postMessage({floor:JSON.parse(JSON.stringify(floors[floor]))});
   }catch(error){reject(error);}
  }));workerQueue=job.catch(()=>{if(fallback.get(floor)===job)fallback.delete(floor);});fallback.set(floor,job);stats.mode='worker';return job;
 }
 async function download(file){const response=await fetchFile(new URL('./compiled/interior/'+file,import.meta.url));if(!response.ok)throw Error('Room download failed');return response.arrayBuffer();}
 async function floorResource(floor){
  if(resources.has(floor))return resources.get(floor);
  const task=(async()=>{
   const files=await manifest;let data;
   try{if(!files?.resources[floor])throw Error('No prepared rooms');data=await unpack(await download(files.resources[floor].file));}
   catch{const built=await workerFloor(floor);data=decodeModel(built.resource.buffer);}
   const restored=deserializeScene(THREE,data.scene);
   for(const [kind,name] of [['Labels','Asylum door nameplates'],['StairSigns','Asylum floor signs']]){const material=Object.values(restored.materials).find(m=>m.name===name);if(material)materials.get(floor)[kind]=material;}
  })().catch(error=>{resources.delete(floor);throw error;});resources.set(floor,task);return task;
 }
 async function load(section){
  if(section.promise)return section.promise;
  section.state='loading';
  section.promise=(async()=>{
   await floorResource(section.floor);const files=await manifest;let data;
   try{const asset=files?.sections.find(s=>s.id===section.id);if(!asset)throw Error('No prepared section');data=await unpack(await download(asset.file));}
   catch{const built=await workerFloor(section.floor),asset=built.assets.find(s=>s.id===section.id);data=decodeModel(asset.bytes.buffer);}
   if(data.format!==INTERIOR_SECTION_FORMAT||data.section!==section.id)throw Error('Incompatible prepared rooms');
   libraryReady??=warmLibrary().catch(error=>{libraryReady=null;throw error;});await libraryReady;
   const prepared=preparation.then(async()=>{
   await schedule();let begin=performance.now();
   const sharedMaterials=Object.fromEntries(data.materialKeys.map(([id,kind])=>[id,materials.get(section.floor)[kind]]).filter(([,m])=>m));
   const group=deserializeScene(THREE,data.scene,{sharedMaterials}).scene;
   stats.steps.push({section:section.id,stage:'restore',milliseconds:performance.now()-begin});
   try{
   await schedule();begin=performance.now();
   // Compile new shader variants asynchronously before the player can enter.
   if(renderer?.compileAsync)await renderer.compileAsync(group,camera,scene);
   stats.steps.push({section:section.id,stage:'graphics',milliseconds:performance.now()-begin});
   let seed,added;
   do{
    await schedule();begin=performance.now();seed=floors[section.floor].furnitureSeed;
    furniture[section.floor].removeSection(section.id);added=furniture[section.floor].update({append:true,sectionId:section.id});for(const mesh of added)group.add(mesh);
    stats.steps.push({section:section.id,stage:'furniture',milliseconds:performance.now()-begin});
    if(renderer?.compileAsync)await renderer.compileAsync(group,camera,scene);
    await warm(group,section.id);
   }while(seed!==floors[section.floor].furnitureSeed);
   for(const mesh of added)furniture[section.floor].group.add(mesh);
   // Retain the established floor inspection structure and per-room bounds.
   for(const child of [...group.children]){
    if(child.name==='Asylum Cell Padding'){
     let aggregate=groups[section.floor].children.find(o=>o.name===child.name);
     if(!aggregate){aggregate=new THREE.Group();aggregate.name=child.name;aggregate.userData.rooms=child.userData.rooms;groups[section.floor].add(aggregate);}
     for(const mesh of [...child.children])aggregate.add(mesh);
    }else groups[section.floor].add(child);
   }
   section.state='ready';section.error=null;summary();stats.firstReadyMilliseconds??=performance.now()-started;
   }catch(error){furniture[section.floor].removeSection(section.id);group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});throw error;}
   });preparation=prepared.catch(()=>{});await prepared;
  })().catch(error=>{section.state='failed';section.error=error;summary();throw error;});return section.promise;
 }
 async function warm(group,id){
  if(!renderer?.setRenderTarget)return;
  const targetTexture=new THREE.WebGLRenderTarget(8,8),warmScene=new THREE.Scene(),meshes=[];
  targetTexture.texture.colorSpace=renderer.outputColorSpace;warmScene.fog=scene.fog;
  scene.traverse(o=>{if(o.isLight)warmScene.add(o.clone());});
  group.traverse(o=>{if(o.isMesh)meshes.push(o);});group.updateMatrixWorld(true);
  try{
   // Match the upload scene's shader variants before issuing its first draw.
   warmScene.add(group);const oldShadows=renderer.shadowMap.enabled,previousTarget=renderer.getRenderTarget();renderer.shadowMap.enabled=false;
   // Render targets use a different tone-mapping program from the canvas.
   // Compile that exact variant as well, before the upload draws begin.
   let compile;try{renderer.setRenderTarget(targetTexture);compile=renderer.compileAsync(warmScene,camera);}finally{renderer.setRenderTarget(previousTarget);renderer.shadowMap.enabled=oldShadows;}await compile;warmScene.remove(group);
   for(let i=0;i<meshes.length;){await schedule();const begin=performance.now(),oldTarget=renderer.getRenderTarget(),shadows=renderer.shadowMap.enabled;
    renderer.shadowMap.enabled=false;renderer.setRenderTarget(targetTexture);
    try{do{const mesh=meshes[i++],parent=mesh.parent,culled=mesh.frustumCulled;warmScene.add(mesh);mesh.frustumCulled=false;try{renderer.render(warmScene,camera);}finally{parent.add(mesh);mesh.frustumCulled=culled;}}while(i<meshes.length&&performance.now()-begin<6);}
    finally{renderer.setRenderTarget(oldTarget);renderer.shadowMap.enabled=shadows;}
    stats.steps.push({section:id,stage:'upload',milliseconds:performance.now()-begin});
   }
  }finally{targetTexture.dispose();}
 }
 async function warmLibrary(){
  if(!renderer?.setRenderTarget)return;
  // The basement mural and quilt finishes introduce the expensive shader
  // variants absent from the entry rooms. Warm those shared finishes before
  // entry; room geometry and furniture remain deferred to their sections.
  const group=new THREE.Group(),box=new THREE.BoxGeometry(1,1,1),walls=box.toNonIndexed(),basement=materials.get(2);
  walls.setAttribute('roomFinish',new THREE.Float32BufferAttribute(new Float32Array(walls.attributes.position.count*2),2));
  box.setIndex(new THREE.BufferAttribute(new Uint32Array(box.index.array),1));
  for(const [geometry,material] of [[walls,basement.Brick],[walls,basement.Plaster],[box,basement.Padding]]){const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;group.add(mesh);}
  try{await warm(group,'shared-library');}finally{box.dispose();walls.dispose();}
 }
 function pump(){
  if(running||!background)return;const next=sections.filter(s=>s.state==='waiting').sort((a,b)=>sectionDistance(a,target)-sectionDistance(b,target))[0];if(!next){if(sections.every(s=>s.state==='ready')){worker?.terminate();worker=null;}return;}
  running=true;load(next).catch(error=>console.warn('Room preparation failed',error)).finally(()=>{running=false;pump();});
 }
 function required(actor){
  const result=new Set([sectionAt(sections,actor)]);
  for(const s of sections)if(s.floor===actor.floor&&sectionDistance(s,actor)<10)result.add(s);
  for(const stair of floors[actor.floor].stairs)if(Math.hypot(stair.label[0]-actor.x,stair.label[1]-actor.z)<12)for(const connection of stair.connections)if(connection.includes(actor.floor))for(const floor of connection)result.add(sectionAt(sections,{x:stair.label[0],floor}));
  return [...result].filter(Boolean);
 }
 const controller={sections,groups,furniture,stats,
  async prepare(actor){target={...actor};await Promise.all(required(actor).map(load));held=false;},
  startBackground(){background=true;pump();},
  update(actor){if(actor.outside)return;target={...actor};for(const section of required(actor))if(section.state==='waiting')load(section).catch(()=>{});pump();},
  isReady(actor){return Boolean(sectionAt(sections,actor)?.state==='ready');},
  allowMove(from,to){if(to.outside){held=false;return true;}const section=sectionAt(sections,to);if(section?.state==='ready'){held=false;return true;}held=true;target={...to};if(section?.state==='waiting')load(section).catch(()=>{});pump();return false;},
  retry(){for(const s of sections)if(s.state==='failed'){s.state='waiting';s.promise=null;s.error=null;}const next=sectionAt(sections,target);if(next?.state==='waiting')load(next).catch(()=>{});pump();},
  get holding(){return held;},get failed(){return sections.some(s=>s.state==='failed');},get complete(){return sections.every(s=>s.state==='ready');},
  dispose(){background=false;worker?.terminate();worker=null;}
 };
 return controller;
}
