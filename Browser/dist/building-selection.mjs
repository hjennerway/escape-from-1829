import {BUILDING_CATALOG} from './building-catalog.mjs';

export function isBuildingVisible(root){
 for(let object=root;object;object=object.parent)if(!object.visible)return false;
 return true;
}

// Clip structural triangles at ward boundaries. In particular, the continuous
// front range belongs to three wards; its mesh centre cannot identify a wing.
function clipPolygon(points,axis,edge,sign){
 const result=[];
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],da=(a[axis]-edge)*sign,db=(b[axis]-edge)*sign;
  if(da>=0)result.push(a);
  if((da>=0)!==(db>=0)){const t=da/(da-db);result.push(a.map((n,j)=>n+(b[j]-n)*t));}
 }
 return result;
}
function appendGeometry(positions,geometry,matrix,bounds){
 const attr=geometry.attributes.position,index=geometry.index,v=[];
 for(let i=0;i<attr.count;i++)v.push([attr.getX(i),attr.getY(i),attr.getZ(i)]);
 const e=matrix.elements;
 for(const p of v){const [x,y,z]=p;p[0]=e[0]*x+e[4]*y+e[8]*z+e[12];p[1]=e[1]*x+e[5]*y+e[9]*z+e[13];p[2]=e[2]*x+e[6]*y+e[10]*z+e[14];}
 const count=index?.count??attr.count;
 for(let i=0;i<count;i+=3){
  let polygon=[0,1,2].map(j=>v[index?index.getX(i+j):i+j]);
  for(const [axis,edge,sign] of bounds??[])polygon=clipPolygon(polygon,axis,edge,sign);
  for(let j=1;j<polygon.length-1;j++)positions.push(...polygon[0],...polygon[j],...polygon[j+1]);
 }
}

// Read original wall/roof surfaces, including originals retained by batching
// and precompiled scene loading. Never alter scene materials or shadows.
export function createBuildingSelection(THREE,exterior){
 const {layouts}=exterior,roots=new Map(),data=new Map();
 const add=(root,id)=>{if(root)roots.set(root,id);};
 for(const [key,id] of Object.entries({chapel:'church',waterTower:'tower',estateChimney:'estate-chimney',annexe:'annexe',churtonWard:'churton',uptonFrithOscroft:'upton',irbyAshley:'irby-ashley',graftonEdge:'grafton-edge',haleWard:'hale',estatesDepartment:'estates',farndonWard:'farndon',witbyWard:'witby',mainAdmin:'main-admin',adminCorridor:'admin-corridor',laundry:'laundry',greenhouses:'greenhouses',outhouse:'outhouse',willows:'willows',towerBuildings:'tower-buildings'}))add(exterior[key],id);
 for(const [id,root] of Object.entries(exterior.annexe.userData.wards))add(root,id);
 add(exterior.garagesMortuary.userData.garages,'garages');add(exterior.garagesMortuary.userData.mortuary,'mortuary');
 add(exterior.model.getObjectByName('Main kitchen'),'main-kitchen');
 const excluded=new Set([exterior.trees,exterior.terrain,exterior.churchGrounds,exterior.legacyAccess,exterior.mast,layouts.roads,layouts.entrance,layouts.carPark,layouts.historicRoads]);
 const coreRegions=[
  ['1829-west',[[0,-20,-1]]],['1829-centre',[[0,-20,1],[0,22,-1]]],
  // The rear cross range is entirely Redesmere/Saughall, including its
  // western end. Place the split in the gap beside the inset east ward arm.
  ['1829-east',[[0,22,1],[0,55,-1]]],
  ['1829-east',[[0,55,1],[0,75,-1],[2,-29,1]]],
  ['barmere',[[0,75,1],[2,-29,1]]],['redesmere',[[0,55,1],[2,-29,-1]]]
 ];
 const worldBox=new THREE.Box3(),size=new THREE.Vector3(),centre=new THREE.Vector3(),instance=new THREE.Matrix4(),matrix=new THREE.Matrix4();
 exterior.scene.updateMatrixWorld(true);
 function store(id,root,geometry,transform,bounds){
  if(!data.has(id))data.set(id,{positions:[],root});
  appendGeometry(data.get(id).positions,geometry,transform,bounds);
 }
 function visit(object,id=null,root=null){
  if(excluded.has(object)||object.userData.aerialBatch||object.userData.buildingDetailLevel>0)return;
  if(!object.visible&&!object.userData.aerialBatchSource&&object.userData.buildingDetailLevel!==0)return;
  if(roots.has(object)){id=roots.get(object);root=object;}
  if(object.isMesh&&!Array.isArray(object.material)&&!object.material.userData.estateGrass){
   const geometry=object.geometry;if(!geometry.boundingBox)geometry.computeBoundingBox();
   for(let i=0;i<(object.isInstancedMesh?object.count:1);i++){
    matrix.copy(object.matrixWorld);
    if(object.isInstancedMesh){object.getMatrixAt(i,instance);matrix.multiply(instance);}
    worldBox.copy(geometry.boundingBox).applyMatrix4(matrix);worldBox.getSize(size);worldBox.getCenter(centre);
    // Ignore ground, planting, tiny window trim and other non-building details.
    if(worldBox.max.y<1.8||size.x*size.z<1.5||Math.min(size.x,size.z)<.12)continue;
    if(size.y<.16&&object.isInstancedMesh)continue;
    if(/path|paving|drive|lawn|gravel|flower|hedge|bed|kerb/i.test(object.name))continue;
    if(id==='hale'){
     const boundary=exterior.haleWard.position.z-4;
     store('hale-daresbury',root,geometry,matrix,[[2,boundary,-1]]);
     store('huxley-dunham',root,geometry,matrix,[[2,boundary,1]]);
    }else if(id==='tower-buildings'&&/South cross-gabled stores|Long east service range/.test(object.name))store('stores',root,geometry,matrix);
    else if(id)store(id,root,geometry,matrix);
    else if(centre.x>-82&&centre.x<108&&centre.z>-58&&centre.z<49&&(object.castShadow||object.isInstancedMesh)){
     for(const [ward,bounds] of coreRegions)store(ward,layouts.shared,geometry,matrix,bounds);
    }
   }
  }
  for(const child of object.children)visit(child,id,root);
 }
 visit(exterior.model);
 const material=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,toneMapped:false}),entries=[];
 for(const metadata of BUILDING_CATALOG){
  const source=data.get(metadata.id);if(!source?.positions.length)continue;
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(source.positions,3));geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const mesh=new THREE.Mesh(geometry,material);mesh.name=metadata.name;mesh.userData.buildingId=metadata.id;mesh.matrixAutoUpdate=false;
  entries.push({...metadata,root:source.root,mesh});
 }
 const raycaster=new THREE.Raycaster(),point=new THREE.Vector2();
 function refresh(){for(const entry of entries)entry.mesh.visible=isBuildingVisible(entry.root);}
 return {entries,refresh,
  pick(clientX,clientY,rect,camera){
   if(!rect.width||!rect.height)return null;
   refresh();camera.updateMatrixWorld();point.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(point,camera);
   const hit=raycaster.intersectObjects(entries.filter(e=>e.mesh.visible).map(e=>e.mesh),false)[0];
   return hit?entries.find(e=>e.id===hit.object.userData.buildingId):null;
  },
  dispose(){for(const entry of entries)entry.mesh.geometry.dispose();material.dispose();}
 };
}

// A half-resolution silhouette and two short blur passes create a white halo
// around the real roof/wall outline. No additional rendering when deselected.
export function createBuildingGlow(THREE,renderer,selection){
 const mask=new THREE.WebGLRenderTarget(1,1),blurX=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false}),blurY=blurX.clone();
 const maskScene=new THREE.Scene(),black=new THREE.MeshBasicMaterial({color:0,side:THREE.DoubleSide,toneMapped:false}),white=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,toneMapped:false});
 for(const entry of selection.entries)maskScene.add(entry.mesh);
 const quadScene=new THREE.Scene(),camera=new THREE.Camera(),geometry=new THREE.PlaneGeometry(2,2);
 const vertexShader='varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const blur=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{image:{value:null},stepSize:{value:new THREE.Vector2()}},vertexShader,fragmentShader:`varying vec2 vUv;uniform sampler2D image;uniform vec2 stepSize;
  void main(){vec4 c=texture2D(image,vUv)*.227027; c+=(texture2D(image,vUv+stepSize*1.384615)+texture2D(image,vUv-stepSize*1.384615))*.316216;c+=(texture2D(image,vUv+stepSize*3.230769)+texture2D(image,vUv-stepSize*3.230769))*.070270;gl_FragColor=c;}`});
 const composite=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,uniforms:{mask:{value:mask.texture},halo:{value:blurY.texture}},vertexShader,fragmentShader:`varying vec2 vUv;uniform sampler2D mask;uniform sampler2D halo;
  void main(){float solid=texture2D(mask,vUv).r;float glow=texture2D(halo,vUv).r;gl_FragColor=vec4(1.,1.,1.,clamp(solid*.19+glow*(1.-solid)*1.65,0.,.86));}`});
 const quad=new THREE.Mesh(geometry,blur);quad.frustumCulled=false;quadScene.add(quad);
 const savedColor=new THREE.Color(),viewportSize=new THREE.Vector2();let selected=null,width=0,height=0;
 return {
  set(entry){selected=entry;},
  render(camera3D){
   if(!selected||!isBuildingVisible(selected.root))return;
   selection.refresh();renderer.getSize(viewportSize);
   const w=Math.ceil(viewportSize.x/2),h=Math.ceil(viewportSize.y/2);
   if(width!==w||height!==h){width=w;height=h;for(const target of [mask,blurX,blurY])target.setSize(w,h);}
   const previous=renderer.getRenderTarget(),autoClear=renderer.autoClear,alpha=renderer.getClearAlpha();renderer.getClearColor(savedColor);
   for(const entry of selection.entries)entry.mesh.material=entry===selected?white:black;
   renderer.autoClear=true;renderer.setClearColor(0,1);renderer.setRenderTarget(mask);renderer.render(maskScene,camera3D);
   quad.material=blur;blur.uniforms.image.value=mask.texture;blur.uniforms.stepSize.value.set(1.5/w,0);renderer.setRenderTarget(blurX);renderer.render(quadScene,camera);
   blur.uniforms.image.value=blurX.texture;blur.uniforms.stepSize.value.set(0,1.5/h);renderer.setRenderTarget(blurY);renderer.render(quadScene,camera);
   renderer.setRenderTarget(previous);renderer.autoClear=false;quad.material=composite;renderer.render(quadScene,camera);
   renderer.autoClear=autoClear;renderer.setClearColor(savedColor,alpha);
  },
  dispose(){mask.dispose();blurX.dispose();blurY.dispose();black.dispose();white.dispose();blur.dispose();composite.dispose();geometry.dispose();}
 };
}
