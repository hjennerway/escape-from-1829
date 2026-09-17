import {attachAerialLayouts} from './aerial-layouts.mjs';
import {attachBuildingDetail} from './building-detail.mjs';
import {cacheAerialTransforms} from './aerial-performance.mjs';
import {matchEstateGrass} from './estate-grass.mjs';
import {MODEL_FORMAT,decodeModel,serializeScene,deserializeScene} from './model-binary.mjs';

// Also used by the offline compiler: there is only one modelling pipeline.
export async function buildAerialScene(THREE,aspect,{detail=true}={}){
  const [{createEscapeExterior},{createAerialLayouts},{createBuildingDetail},{batchAerialMeshes}]=await Promise.all([
    import('./escape-exterior.mjs'),import('./aerial-layouts.mjs'),import('./building-detail.mjs'),import('./aerial-performance.mjs')
  ]);
  const exterior=createEscapeExterior(THREE,aspect),layouts=createAerialLayouts(THREE,exterior);
  const exclude=[exterior.trees,exterior.terrain,...layouts.visibilityObjects];
  const shadowLight=exterior.scene.children.find(o=>o.isDirectionalLight&&o.castShadow);
  const buildingDetail=detail?createBuildingDetail(THREE,exterior.model,{exclude,shadowLight}):null;
  batchAerialMeshes(THREE,exterior.model,{exclude});cacheAerialTransforms(exterior.scene);
  return {exterior,layouts,buildingDetail};
}

export function snapshotAerialScene(THREE,{exterior,layouts,buildingDetail}){
  const refs=Object.fromEntries(Object.entries(exterior).filter(([,value])=>value?.isObject3D).map(([key,value])=>[key,value.uuid]));
  const layoutRefs=Object.fromEntries(Object.entries(layouts).filter(([,value])=>value?.isObject3D).map(([key,value])=>[key,value.uuid]));
  layoutRefs.superseded=layouts.superseded.map(object=>object.uuid);
  const detail=buildingDetail?{stats:buildingDetail.stats,entries:buildingDetail.entries.map(e=>({parent:e.parent.uuid,levels:e.levels.map(o=>o.uuid),center:e.sphere.center.toArray(),radius:e.sphere.radius,windowHeight:e.windowHeight}))}:null;
  return {format:MODEL_FORMAT,scene:serializeScene(THREE,exterior.scene,exterior.camera),refs,layoutRefs,detail};
}

export function restoreAerialScene(THREE,snapshot,aspect,{detail=true}={}){
  if(snapshot.format!==MODEL_FORMAT)throw new Error('Unsupported precompiled model version');
  const {scene,camera,nodes}=deserializeScene(THREE,snapshot.scene);
  nodes.set(camera.uuid,camera);
  const ref=id=>{const object=nodes.get(id);if(!object)throw new Error('Missing precompiled scene reference: '+id);return object;};
  const exterior=Object.fromEntries(Object.entries(snapshot.refs).map(([key,id])=>[key,ref(id)]));
  exterior.scene=scene;exterior.camera=camera;camera.aspect=aspect;camera.updateProjectionMatrix();
  const shadowLight=scene.children.find(o=>o.isDirectionalLight&&o.castShadow);
  shadowLight.shadow.autoUpdate=false;
  exterior.invalidateShadows=()=>{shadowLight.shadow.needsUpdate=true;};
  const materials=new Set();scene.traverse(o=>{for(const m of [o.material].flat())if(m?.userData.estateGrass)materials.add(m);});
  for(const material of materials)matchEstateGrass(material,exterior.terrain.material);
  const layoutRefs=Object.fromEntries(Object.entries(snapshot.layoutRefs).map(([key,id])=>[key,Array.isArray(id)?id.map(ref):ref(id)]));
  const layouts=attachAerialLayouts(exterior,layoutRefs);
  const buildingDetail=snapshot.detail?attachBuildingDetail(THREE,exterior.model,{
    stats:snapshot.detail.stats,shadowLight,
    entries:snapshot.detail.entries.map(e=>({parent:ref(e.parent),levels:e.levels.map(ref),sphere:new THREE.Sphere(new THREE.Vector3(...e.center),e.radius),windowHeight:e.windowHeight,level:0}))
  }):null;
  if(!detail)buildingDetail?.setEnabled(false);
  cacheAerialTransforms(scene);
  return {exterior,layouts,buildingDetail:detail?buildingDetail:null};
}

export async function loadAerialScene(THREE,aspect,{search=globalThis.location?.search??'',fetchFile=globalThis.fetch,warn=console.warn}={}){
  const params=new URLSearchParams(search),options={detail:params.get('buildingDetail')!=='full'},started=performance.now();
  let result,mode='procedural';
  if(params.get('models')!=='source')try{
    const url=new URL('./compiled/manifest.json',import.meta.url),response=await fetchFile(url,{cache:'no-cache'});
    if(response.ok){
      const manifest=await response.json();
      if(manifest.format!==MODEL_FORMAT||manifest.revision!==THREE.REVISION||!/^aerial-[a-f0-9]+\.bin\.gz$/.test(manifest.file))throw new Error('Incompatible precompiled model manifest');
      const download=await fetchFile(new URL(manifest.file,url));
      if(!download.ok)throw new Error('Precompiled model download failed: '+download.status);
      // Explicit gzip works on static hosts, including Pages, without server headers.
      const compressed=await download.arrayBuffer();
      if(compressed.byteLength!==manifest.bytes)throw new Error('Truncated precompiled model download');
      const buffer=await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      result=restoreAerialScene(THREE,decodeModel(buffer),aspect,options);mode='compiled';
    }else if(response.status!==404)throw new Error('Precompiled model manifest failed: '+response.status);
  }catch(error){warn('Precompiled estate unavailable; rebuilding from source.',error);}
  result??=await buildAerialScene(THREE,aspect,options);
  result.exterior.modelBuild={mode,milliseconds:performance.now()-started};
  return result;
}
