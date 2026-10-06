import {GLTFLoader} from './vendor/GLTFLoader.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {FURNITURE_CATALOG} from './asylum-furniture.mjs';
import {createMedicalFurnitureModels} from './medical-furniture-models.mjs';
import {createWardrobeModel} from './wardrobe-model.mjs';
import {createReceptionFurnitureModels} from './reception-furniture-models.mjs';
import {createHallFurnitureModels} from './hall-furniture-models.mjs';
import {createSanitaryFurnitureModels} from './sanitary-furniture-models.mjs';
import {applyFurnitureFinish} from './furniture-finishes.mjs';
import {createCellMattressModel} from './padded-cell-models.mjs';

const libraries=new WeakMap();
function normalize(THREE,geometry,width,height,depth,bounds=null){
 const g=geometry.clone();g.computeBoundingBox();const b=bounds??g.boundingBox,size=b.getSize(new THREE.Vector3());
 g.translate(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2);g.scale(width/size.x,height/size.y,depth/size.z);return g;
}
function agedMaterial(THREE,map,paint=false,kind='wood'){
 const material=new THREE.MeshStandardMaterial({map,roughness:.96,metalness:0,color:map?0xffffff:0x76634b});
 material.name=paint?'Faded medicine cupboard paint':'Aged furniture';
 return applyFurnitureFinish(THREE,material,{kind:paint?'coating':kind,cacheKey:`aged-${paint}`,tint:`
  float furnitureGrey=dot(diffuseColor.rgb,vec3(.299,.587,.114));
  ${paint?'diffuseColor.rgb=mix(vec3(.34,.38,.31),vec3(.66,.70,.58),smoothstep(.04,.65,furnitureGrey));':'diffuseColor.rgb=mix(vec3(furnitureGrey),diffuseColor.rgb,.22)*vec3(.82,.76,.65);'}
 `});
}
export function loadFurnitureModels(THREE){
 if(!libraries.has(THREE))libraries.set(THREE,(async()=>{
  const loader=new GLTFLoader(),raw={},distant={};
  await Promise.all(Object.entries(FURNITURE_CATALOG).map(async([kind,model])=>{
   if(model.procedural)return;
   const gltf=await loader.loadAsync(new URL(`./models/furniture/${model.source}.gltf`,import.meta.url).href);gltf.scene.updateMatrixWorld(true);
   const pieces=[];gltf.scene.traverse(mesh=>{if(mesh.isMesh){pieces.push(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));raw.map??=mesh.material.map;}});
   raw[kind]=pieces.length===1?pieces[0]:mergeGeometries(pieces);
   if(['chair','bench'].includes(kind)){
    const lod=await loader.loadAsync(new URL(`./models/furniture/${model.source}_distant.gltf`,import.meta.url).href);lod.scene.traverse(mesh=>{if(mesh.isMesh)distant[kind]=mesh.geometry;});
   }
  }));
  const wood=agedMaterial(THREE,raw.map),matte=agedMaterial(THREE,raw.map,false,'matte'),frame=agedMaterial(THREE,null),models={};
  const design=agedMaterial(THREE,null);design.color.setHex(0x9e8059);design.vertexColors=true;
  for(const [kind,model] of Object.entries(FURNITURE_CATALOG)){
   if(kind==='bookcase'||model.procedural)continue;
   const material=['chair','bench'].includes(kind)?design:['books','bed'].includes(kind)?matte:wood;
   raw[kind].computeBoundingBox();
   models[kind]=[{geometry:normalize(THREE,raw[kind],model.width,model.height,model.depth),...(distant[kind]?{distantGeometry:normalize(THREE,distant[kind],model.width,model.height,model.depth,raw[kind].boundingBox)}:{}),material,paint:material}];
  }
  models.cupboard=createWardrobeModel(THREE);
  models.cellMattress=createCellMattressModel(THREE);
  // Four KayKit shelves, matching timber sides and the same pack's books form
  // a freestanding bookcase. The source shelf is a wall shelf, not a tall case.
  const shelves=[],books=[],stockedBooks=[],frames=[],shelf=normalize(THREE,raw.bookcase,1.13,.23,.34),book=normalize(THREE,raw.books,.42,.27,.20);
  // The source bounds include upright brackets above the horizontal board.
  // Find the actual board surface beneath the books instead of using maxY.
  const probe=new THREE.Mesh(shelf,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})),ray=new THREE.Raycaster(new THREE.Vector3(0,1,.02),new THREE.Vector3(0,-1,0));
  const boardTop=ray.intersectObject(probe,false)[0]?.point.y;if(boardTop===undefined)throw Error('Bookcase shelf surface missing');
  const shelfSurfaces=[],bookBottoms=[];
  for(let level=0;level<4;level++){
   shelves.push(shelf.clone().translate(0,.10+level*.42,0));
   const surface=.10+level*.42+boardTop,bottom=surface+.002;
   shelfSurfaces.push(surface);bookBottoms.push(bottom);books.push(book.clone().translate(level%2?.20:-.20,bottom,.02));
   for(const x of [-.26,.26])stockedBooks.push(book.clone().translate(x,bottom,.02));
  }
  function board(w,h,d,x,y,z){frames.push(new THREE.BoxGeometry(w,h,d).translate(x,y,z));}
  for(const side of [-1,1])board(.06,1.90,.38,side*.595,.95,0);
  board(1.25,.08,.38,0,1.86,0);board(1.25,.08,.38,0,.04,0);board(1.13,1.74,.028,0,.95,-.176);
  models.bookcase=[{geometry:mergeGeometries(shelves),material:wood},{geometry:mergeGeometries(books),material:matte},{geometry:mergeGeometries(frames),material:frame}];
  // Scale the complete assembly together so books retain their shelf contact.
  const bookcase=FURNITURE_CATALOG.bookcase,sx=bookcase.width/1.25,sy=bookcase.height/1.90,sz=bookcase.depth/.38;
  for(const part of models.bookcase)part.geometry.scale(sx,sy,sz);
  models.bookcase[1].stockedGeometry=mergeGeometries(stockedBooks).scale(sx,sy,sz);
  models.bookcase[1].geometry.userData={shelfSurfaces:shelfSurfaces.map(y=>y*sy),bookBottoms:bookBottoms.map(y=>y*sy)};probe.material.dispose();
  Object.assign(models,createMedicalFurnitureModels(THREE));
  Object.assign(models,createReceptionFurnitureModels(THREE));
  Object.assign(models,createHallFurnitureModels(THREE));
  Object.assign(models,createSanitaryFurnitureModels(THREE));
  for(const g of Object.values(raw))if(g?.isBufferGeometry)g.dispose();
  return models;
 })());
 return libraries.get(THREE);
}
const furnitureDetail=new WeakMap();
export function createFurnitureFloor(THREE,parent,floor,models,{sectionFor=()=>'',isSectionReady=()=>true}={}){
 const group=new THREE.Group();group.name='Asylum furniture';parent.add(group);
 const entries=[],built=new Set();furnitureDetail.set(group,entries);
 const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),position=new THREE.Vector3(),scale=new THREE.Vector3(1,1,1),axis=new THREE.Vector3(0,1,0);
 function update({append=false,sectionId=null}={}){
  const added=[];
  if(!append){entries.length=0;for(const mesh of built){mesh.removeFromParent();mesh.dispose();}built.clear();}
  for(const [kind,parts] of Object.entries(models))for(const painted of [false,true])for(const stocked of [false,true]){
   const sections=new Map();
   for(const item of floor.furniture.filter(item=>item.kind===kind&&!!item.medical===painted&&!!item.stocked===stocked&&(sectionId!==null?sectionFor(item)===sectionId:isSectionReady(sectionFor(item))))){
    const seating=kind==='chair'||kind==='bench',cellSize=seating?12:24;
    const key=`${sectionFor(item)}:${seating?item.roomId??'corridor':'area'}:${Math.floor(item.x/cellSize)},${Math.floor(item.z/cellSize)}`;
    if(!sections.has(key))sections.set(key,[]);sections.get(key).push(item);
   }
   for(const [section,items] of sections){
   for(let part=0;part<parts.length;part++){
    const model=parts[part];if(model.paintOnly&&!painted)continue;
    const mesh=new THREE.InstancedMesh(stocked?(model.stockedGeometry??model.geometry):model.geometry,painted?model.paint:model.material,items.length);
    mesh.name=`Furniture ${kind}${painted?' painted':''}${stocked?' stocked':''} ${part}`;mesh.userData.furnitureIds=items.map(item=>item.id);
    mesh.userData.interiorSection=section;mesh.userData.interiorSectionId=sectionFor(items[0]);
    mesh.userData.interiorRooms=[...new Set(items.map(item=>item.roomId).filter(Boolean))];
    for(let i=0;i<items.length;i++){const item=items[i],catalog=FURNITURE_CATALOG[kind];position.set(item.x,item.y,item.z);rotation.setFromAxisAngle(axis,item.rotation);scale.set(item.width/catalog.width,item.height/catalog.height,item.depth/catalog.depth);matrix.compose(position,rotation,scale);mesh.setMatrixAt(i,matrix);}
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);added.push(mesh);built.add(mesh);
    if(model.distantGeometry)entries.push({mesh,full:mesh.geometry,distant:model.distantGeometry,height:Math.max(...items.map(i=>i.height)),level:0});
   }
   }
  }
  group.userData.seed=floor.furnitureSeed;group.userData.items=floor.furniture;
  return added;
 }
 function removeSection(id){for(const mesh of built)if(mesh.userData.interiorSectionId===id){mesh.removeFromParent();mesh.dispose();built.delete(mesh);}for(let i=entries.length-1;i>=0;i--)if(entries[i].mesh.userData.interiorSectionId===id)entries.splice(i,1);}
 update();return {group,update,removeSection};
}

// Shared by Escape and Explore. Smaller batches also make future section loading
// possible without changing item IDs, collision records or the resource library.
export function updateFurnitureDetail(THREE,scene,camera,viewportHeight){
 camera.updateMatrixWorld();
 const point=new THREE.Vector3(),scale=new THREE.Vector3(),projection=Math.abs(camera.projectionMatrix.elements[5])*viewportHeight/2;
 for(const floor of scene.children)for(const group of floor.children){
  const entries=furnitureDetail.get(group);if(!entries)continue;
  group.updateWorldMatrix(true,true);
  for(const entry of entries){
   const {mesh}=entry;point.copy(mesh.boundingSphere.center).applyMatrix4(mesh.matrixWorld).applyMatrix4(camera.matrixWorldInverse);scale.setFromMatrixScale(mesh.matrixWorld);
   const nearest=Math.max(.1,-point.z-mesh.boundingSphere.radius*Math.max(scale.x,scale.y,scale.z)),pixels=entry.height*projection/nearest;
   if(entry.level===0&&pixels<48)entry.level=1;else if(entry.level===1&&pixels>60)entry.level=0;
   mesh.geometry=entry.level?entry.distant:entry.full;
  }
 }
}
