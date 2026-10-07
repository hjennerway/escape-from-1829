import {batchAerialMeshes,cacheAerialTransforms} from './aerial-performance.mjs';

// Flatten the estate's small material/visibility scopes for shadow draws only.
// This keeps door animation from redrawing thousands of static window fittings.
export function createWorkshopShadowBatches(THREE,root,{exclude=[]}={}){
 const group=new THREE.Group();group.name='Workshop cached static shadow geometry';group.userData.noWalkingCollision=true;
 const material=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false});material.shadowSide=THREE.DoubleSide;
 const sources=[];root.updateMatrixWorld(true);
 root.traverseVisible(object=>{
  if(!object.isMesh||object.isSkinnedMesh||!object.castShadow||Array.isArray(object.material)||object.material.transparent||object.material.alphaTest||Object.keys(object.geometry.morphAttributes).length)return;
  for(let parent=object;parent;parent=parent.parent)if(exclude.includes(parent))return;
  // Depth needs positions only; avoid retaining a second estate's normals,
  // UVs and colours just to draw its silhouettes.
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',object.geometry.attributes.position.clone());
  if(object.geometry.index)geometry.setIndex(object.geometry.index.clone());
  geometry.setDrawRange(object.geometry.drawRange.start,object.geometry.drawRange.count);
  const proxy=object.isInstancedMesh?new THREE.InstancedMesh(geometry,material,object.count):new THREE.Mesh(geometry,material);
  if(object.isInstancedMesh)proxy.instanceMatrix=object.instanceMatrix;
  proxy.matrix.copy(object.matrixWorld);proxy.matrixAutoUpdate=false;proxy.castShadow=true;proxy.userData.noWalkingCollision=true;
  group.add(proxy);sources.push(object);object.castShadow=false;
 });
 group.updateMatrixWorld(true);batchAerialMeshes(THREE,group,{cellSize:32});cacheAerialTransforms(group);
 for(const object of [...group.children])if(object.userData.aerialBatchSource){object.removeFromParent();object.geometry.dispose();}
 // Colour draws submit no triangles. Shadow draws use the retained geometry.
 group.traverseVisible(object=>{if(object.isMesh){
  object.raycast=()=>{};
  object.onBeforeRender=()=>{object.userData.savedRange=object.geometry.drawRange.count;object.geometry.drawRange.count=0;};
  object.onAfterRender=()=>{object.geometry.drawRange.count=object.userData.savedRange;};
 }});
 group.matrix.copy(root.matrixWorld).invert();root.add(group);group.updateMatrixWorld(true);
 return {group,sources,dispose(){
  group.removeFromParent();for(const object of sources)object.castShadow=true;
  group.traverse(object=>{object.geometry?.dispose();if(object.isInstancedMesh)object.dispose();});material.dispose();
 }};
}
