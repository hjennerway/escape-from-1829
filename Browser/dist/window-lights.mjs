export const WINDOWS_PER_LIGHT=15;
export const WINDOW_LIGHT_COLOR=0xffd28e;

// Give each pane an identity before batching or window LOD. These attributes
// survive the compiled scene, so every representation uses the same selection.
export function prepareWindowLights(THREE,root){
 if(root.userData.nightWindowCount!==undefined)return;
 let count=0;
 const size=new THREE.Vector3(),matrix=new THREE.Matrix4(),instance=new THREE.Matrix4();
 root.traverse(mesh=>{
  const material=mesh.material,geometry=mesh.geometry;
  if(!mesh.isMesh||Array.isArray(material)||!material.isMeshStandardMaterial||material.map||material.transparent)return;
  const c=material.color;
  const glass=material.userData.windowGlass||(material.metalness>=.08&&material.metalness<=.35&&material.roughness<.8&&c.r<c.g*.95&&c.b>c.r);
  if(!glass)return;
  material.userData.nightWindowGlass=true;
  if(!geometry.boundingBox)geometry.computeBoundingBox();geometry.boundingBox.getSize(size);
  mesh.updateMatrix();
  const ids=[];
  for(let i=0;i<(mesh.isInstancedMesh?mesh.count:1);i++){
   if(mesh.isInstancedMesh){mesh.getMatrixAt(i,instance);matrix.multiplyMatrices(mesh.matrix,instance);}else matrix.copy(mesh.matrix);
   const axes=[0,1,2].map(j=>new THREE.Vector3().setFromMatrixColumn(matrix,j));
   const [w,h,d]=axes.map((a,j)=>a.length()*size.getComponent(j));
   const upright=Math.abs(axes[1].normalize().y)>.99;
   const pane=mesh.visible&&upright&&h>=.4&&h<=8&&Math.max(w,d)>=.4&&Math.max(w,d)<=8&&Math.min(w,d)<=.18;
   ids.push(pane?++count:0);
  }
  // A shared box geometry can also belong to masonry or another instance set.
  mesh.geometry=geometry.clone();
  mesh.geometry.setAttribute('nightWindowId',mesh.isInstancedMesh?
   new THREE.InstancedBufferAttribute(new Float32Array(ids),1):
   new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count).fill(ids[0]),1));
  if(ids.some(Boolean))mesh.userData.nightWindowIds=ids.filter(Boolean);
 });
 root.userData.nightWindowCount=count;
}

export function createWindowLights(THREE,root,{random=Math.random}={}){
 prepareWindowLights(THREE,root);
 const count=root.userData.nightWindowCount,materials=new Set(),entries=[];
 // A 2D lookup also supports future estates exceeding the GPU texture width.
 const width=Math.min(1024,count+1),height=Math.ceil((count+1)/width),pixels=new Uint8Array(width*height*4);
 const selection=new THREE.DataTexture(pixels,width,height);selection.needsUpdate=true;
 const enabled={value:0},priorities=new Float64Array(count+1),selected=[];
 root.traverse(mesh=>{
  if(mesh.userData.nightWindowIds)entries.push({mesh,ids:mesh.userData.nightWindowIds,visible:null});
  if(mesh.material?.userData.nightWindowGlass)materials.add(mesh.material);
 });
 for(const material of materials){
  material.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,{nightWindows:{value:selection},nightWindowSize:{value:new THREE.Vector2(width,height)},nightWindowsEnabled:enabled,
    nightWindowColor:{value:new THREE.Color(WINDOW_LIGHT_COLOR).multiplyScalar(3)}});
   shader.vertexShader=`attribute float nightWindowId;
uniform sampler2D nightWindows;
uniform vec2 nightWindowSize;
uniform float nightWindowsEnabled;
varying float vNightWindowLight;
`+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
vec2 nightWindowUV=(vec2(mod(nightWindowId,nightWindowSize.x),floor(nightWindowId/nightWindowSize.x))+.5)/nightWindowSize;
vNightWindowLight=texture2D(nightWindows,nightWindowUV).r*nightWindowsEnabled;`);
   shader.fragmentShader='uniform vec3 nightWindowColor;\nvarying float vNightWindowLight;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
vec3 windowEmission=nightWindowColor*vNightWindowLight;
#ifdef USE_EMISSIVEMAP
 windowEmission*=texture2D(emissiveMap,vEmissiveMapUv).rgb;
#endif
totalEmissiveRadiance+=windowEmission;`);
  };
  material.customProgramCacheKey=()=> 'night-windows-v1';material.needsUpdate=true;
 }
 function isVisible(mesh){
  for(let object=mesh;object;object=object.parent){
   if(object.userData.buildingDetailLevel!==undefined)continue;
   if(object===mesh&&object.userData.aerialBatchSource)continue;
   if(!object.visible)return false;
  }
  return true;
 }
 function update(force=false){
  if(!enabled.value)return;
  let changed=force;
  for(const entry of entries){const visible=isVisible(entry.mesh);if(visible!==entry.visible){entry.visible=visible;changed=true;}}
  if(!changed)return;
  const visible=[...new Set(entries.filter(e=>e.visible).flatMap(e=>e.ids))];
  visible.sort((a,b)=>priorities[a]-priorities[b]||a-b);
  selected.splice(0,selected.length,...visible.slice(0,Math.round(visible.length/WINDOWS_PER_LIGHT)));
  pixels.fill(0);for(const id of selected)pixels[id*4]=255;selection.needsUpdate=true;
 }
 function setNight(value){
  if(value&&!enabled.value){for(let i=1;i<=count;i++)priorities[i]=random();enabled.value=1;update(true);}
  else if(!value){enabled.value=0;selected.length=0;pixels.fill(0);selection.needsUpdate=true;}
 }
 return {setNight,update,count,selected,selection,get visibleCount(){return entries.filter(e=>e.visible).reduce((sum,e)=>sum+e.ids.length,0);}};
}
