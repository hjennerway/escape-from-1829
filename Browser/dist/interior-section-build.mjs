import {buildAsylumArchitecture,asylumArchitectureMaterials} from './asylum-architecture.mjs';
import {cellPaddingMaterial} from './padded-cell-models.mjs';
import {clipTimelineGeometry} from './estate-timeline.mjs';
import {serializeScene,encodeModel} from './model-binary.mjs';
import {interiorSections,INTERIOR_SECTION_FORMAT} from './interior-sections.mjs';

// Used by both the offline compiler and the fallback worker. Never runs during walking.
export function buildInteriorFloor(THREE,floor){
 const root=new THREE.Group();buildAsylumArchitecture(THREE,root,floor);root.updateMatrixWorld(true);
 const materials={...asylumArchitectureMaterials(THREE,floor),Padding:cellPaddingMaterial(THREE)};
 root.traverse(o=>{if(o.material?.name==='Asylum door nameplates')materials.Labels=o.material;if(o.material?.name==='Asylum floor signs')materials.StairSigns=o.material;});
 const keys=Object.fromEntries(Object.entries(materials).map(([kind,m])=>[m.uuid,kind]));
 const camera=new THREE.PerspectiveCamera(),sections=interiorSections([floor]);
 function cut(node,section){
  const clone=node.clone(false);clone.children=[];
  if(node.isInstancedMesh){
   const ids=[],matrix=new THREE.Matrix4(),position=new THREE.Vector3();
   for(let i=0;i<node.count;i++){node.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix).applyMatrix4(node.matrixWorld);if(position.x>=section.minX&&position.x<section.maxX)ids.push(i);}
   if(!ids.length)return null;clone.count=ids.length;clone.instanceMatrix=new THREE.InstancedBufferAttribute(new Float32Array(ids.length*16),16);
   ids.forEach((source,i)=>{node.getMatrixAt(source,matrix);clone.setMatrixAt(i,matrix);});clone.computeBoundingBox();clone.computeBoundingSphere();
  }else if(node.isMesh){
   const box=new THREE.Box3().setFromObject(node);if(box.max.x<section.minX||(box.max.x===section.minX&&box.min.x<section.minX)||box.min.x>=section.maxX)return null;
   let g=node.geometry;
   if(box.min.x<section.minX)g=clipTimelineGeometry(THREE,g,node.matrixWorld,section.minX,1);
   if(box.max.x>section.maxX)g=clipTimelineGeometry(THREE,g,node.matrixWorld,section.maxX,-1,'x',false);
   if(!g.attributes.position.count)return null;clone.geometry=g;
   if(clone.userData.labels)clone.userData.labels=clone.userData.labels.filter(l=>l.x>=section.minX&&l.x<section.maxX);
  }
  for(const child of node.children){const part=cut(child,section);if(part)clone.add(part);}
  return clone.isMesh||clone.children.length?clone:null;
 }
 const resource=serializeScene(THREE,new THREE.Group(),camera);resource.materials=[];resource.textures=[];resource.images=[];
 const assets=sections.map(section=>{
  const group=cut(root,section);group.name=section.name;group.userData.interiorSection=section.id;
  const scene=serializeScene(THREE,group,camera);
  // Floor shaders/materials are restored from the shared live library. Only
  // the door-nameplate atlas and floor-sign paint are downloaded once per floor.
  for(const m of scene.materials.filter(m=>['Labels','StairSigns'].includes(keys[m.uuid])))if(!resource.materials.some(old=>old.uuid===m.uuid)){
   resource.materials.push(m);const texture=scene.textures.find(t=>t.uuid===m.map);if(texture){resource.textures.push(texture);resource.images.push(scene.images.find(i=>i.uuid===texture.image));}
  }
  scene.materials=[];scene.textures=[];scene.images=[];
  return {id:section.id,bytes:encodeModel({format:INTERIOR_SECTION_FORMAT,section:section.id,scene,materialKeys:Object.entries(keys)})};
 });
 return {floor:floor.id,resource:encodeModel({format:INTERIOR_SECTION_FORMAT,scene:resource}),assets};
}
