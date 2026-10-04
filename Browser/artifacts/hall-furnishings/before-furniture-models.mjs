import {GLTFLoader} from './vendor/GLTFLoader.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {FURNITURE_CATALOG} from './asylum-furniture.mjs';
import {createMedicalFurnitureModels} from './medical-furniture-models.mjs';
import {createWardrobeModel} from './wardrobe-model.mjs';
import {createReceptionFurnitureModels} from './reception-furniture-models.mjs';
import {applyFurnitureFinish} from './furniture-finishes.mjs';

const libraries=new WeakMap();
function normalize(THREE,geometry,width,height,depth){
 const g=geometry.clone();g.computeBoundingBox();const b=g.boundingBox,size=b.getSize(new THREE.Vector3());
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
  const loader=new GLTFLoader(),raw={};
  await Promise.all(Object.entries(FURNITURE_CATALOG).map(async([kind,model])=>{
   if(model.procedural)return;
   const gltf=await loader.loadAsync(new URL(`./models/furniture/${model.source}.gltf`,import.meta.url).href);gltf.scene.updateMatrixWorld(true);
   const pieces=[];gltf.scene.traverse(mesh=>{if(mesh.isMesh){pieces.push(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));raw.map??=mesh.material.map;}});
   raw[kind]=pieces.length===1?pieces[0]:mergeGeometries(pieces);
  }));
  const wood=agedMaterial(THREE,raw.map),matte=agedMaterial(THREE,raw.map,false,'matte'),frame=agedMaterial(THREE,null),models={};
  const design=agedMaterial(THREE,null);design.color.setHex(0x9e8059);design.vertexColors=true;
  for(const [kind,model] of Object.entries(FURNITURE_CATALOG)){
   if(kind==='bookcase'||model.procedural)continue;
   const material=['chair','bench'].includes(kind)?design:['books','bed'].includes(kind)?matte:wood;
   models[kind]=[{geometry:normalize(THREE,raw[kind],model.width,model.height,model.depth),material,paint:material}];
  }
  models.cupboard=createWardrobeModel(THREE);
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
  for(const g of Object.values(raw))if(g?.isBufferGeometry)g.dispose();
  return models;
 })());
 return libraries.get(THREE);
}
export function createFurnitureFloor(THREE,parent,floor,models){
 const group=new THREE.Group();group.name='Asylum furniture';parent.add(group);
 const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),position=new THREE.Vector3(),scale=new THREE.Vector3(1,1,1),axis=new THREE.Vector3(0,1,0);
 function update(){
  for(const mesh of [...group.children]){group.remove(mesh);mesh.dispose();}
  for(const [kind,parts] of Object.entries(models))for(const painted of [false,true])for(const stocked of [false,true]){
   const items=floor.furniture.filter(item=>item.kind===kind&&!!item.medical===painted&&!!item.stocked===stocked);
   if(!items.length)continue;
   for(let part=0;part<parts.length;part++){
    const model=parts[part];if(model.paintOnly&&!painted)continue;
    const mesh=new THREE.InstancedMesh(stocked?(model.stockedGeometry??model.geometry):model.geometry,painted?model.paint:model.material,items.length);
    mesh.name=`Furniture ${kind}${painted?' painted':''}${stocked?' stocked':''} ${part}`;mesh.userData.furnitureIds=items.map(item=>item.id);
    for(let i=0;i<items.length;i++){const item=items[i],catalog=FURNITURE_CATALOG[kind];position.set(item.x,item.y,item.z);rotation.setFromAxisAngle(axis,item.rotation);scale.set(item.width/catalog.width,item.height/catalog.height,item.depth/catalog.depth);matrix.compose(position,rotation,scale);mesh.setMatrixAt(i,matrix);}
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);
   }
  }
  group.userData.seed=floor.furnitureSeed;group.userData.items=floor.furniture;
 }
 update();return {group,update};
}
