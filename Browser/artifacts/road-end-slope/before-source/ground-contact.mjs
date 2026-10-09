import {ROAD_STYLE} from './road-style.mjs';

// Ground overlays retain their authored heights and depth ordering. Close their
// exposed outline down into the lawn so walking views cannot see underneath.
export function closeGroundEdges(THREE,root,groundY=-.15,{visibilityObjects=[]}={}){
 const independentlyVisible=new Set(visibilityObjects);
 root.updateWorldMatrix(true,true);
 const surfaces=[];
 root.traverse(mesh=>{
  // Road-end decals fade through to the lawn and gravel slopes into it. An
  // opaque supporting skirt would put a hard edge back around that transition.
  if(!mesh.isMesh||mesh.isInstancedMesh||mesh.userData.groundContact||mesh.userData.groundContactClosed||mesh.userData.roadEndFade)return;
  const material=mesh.material;
  if(Array.isArray(material)||!(material.userData.estateSurface||material.userData.estateGrass||material.color?.getHex()===ROAD_STYLE.edge))return;
  const g=mesh.geometry;if(!g.boundingBox)g.computeBoundingBox();
  const box=g.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
  if(box.min.y<=groundY+.001||box.max.y>.6)return;
  surfaces.push(mesh);
 });
 const point=new THREE.Vector3(),edgeMaterials=new Map();
 for(const mesh of surfaces){
  const g=mesh.geometry,p=g.attributes.position,index=g.index,edges=new Map();
  const normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld),normal=new THREE.Vector3();
  const n=g.attributes.normal,hasBottom=Array.from({length:n.count},(_,i)=>normal.fromBufferAttribute(n,i).applyMatrix3(normalMatrix).y).some(y=>y<-.5);
  const key=i=>{point.fromBufferAttribute(p,i);return point.toArray().map(v=>Math.round(v*1e5)).join(',');};
  for(let i=0;i<(index?.count??p.count);i+=3){
   const triangle=[0,1,2].map(j=>index?index.getX(i+j):i+j);
   const ny=normal.fromBufferAttribute(n,triangle[0]).applyMatrix3(normalMatrix).y;
   if(hasBottom?ny>-.5:ny<.5)continue;
   if(hasBottom)triangle.reverse();
   for(let j=0;j<3;j++){
    const a=triangle[j],b=triangle[(j+1)%3],ka=key(a),kb=key(b);if(ka===kb)continue;
    const id=ka<kb?ka+'|'+kb:kb+'|'+ka;
    if(edges.has(id))edges.get(id).count++;else edges.set(id,{a,b,count:1});
   }
  }
  const inverse=mesh.matrixWorld.clone().invert(),positions=[],uv=[];
  for(const {a,b,count} of edges.values()){
   if(count!==1)continue;
   const top=[a,b].map(i=>new THREE.Vector3().fromBufferAttribute(p,i));
   const bottom=top.map(v=>{const q=v.clone().applyMatrix4(mesh.matrixWorld);q.y=groundY-.02;return q.applyMatrix4(inverse);});
   const width=top[0].clone().applyMatrix4(mesh.matrixWorld).distanceTo(top[1].clone().applyMatrix4(mesh.matrixWorld))/12;
   const height=top.map((v,i)=>v.clone().applyMatrix4(mesh.matrixWorld).distanceTo(bottom[i].clone().applyMatrix4(mesh.matrixWorld))/12);
   for(const [v,u,t] of [[top[0],0,height[0]],[bottom[0],0,0],[top[1],width,height[1]],[top[1],width,height[1]],[bottom[0],0,0],[bottom[1],width,0]]){positions.push(...v);uv.push(u,t);}
  }
  if(!positions.length)continue;
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
  if(!edgeMaterials.has(mesh.material)){
   const material=mesh.material.clone();
   // A horizontal overlay's slope-scaled depth bias becomes enormous on a
   // vertical face and pulls buried edges through the road at shallow angles.
   material.polygonOffset=false;material.polygonOffsetFactor=material.polygonOffsetUnits=0;
   // Vertical faces use these metre-scaled UVs. The top surface's X/Z-only
   // grass/asphalt projection would stretch one texel down the whole face.
   delete material.userData.estateGrass;delete material.userData.estateSurface;delete material.userData.mineralFinish;
   material.userData.groundContactSide=true;
   edgeMaterials.set(mesh.material,material);
  }
  const edge=new THREE.Mesh(geometry,edgeMaterials.get(mesh.material));edge.name=(mesh.name||mesh.parent.name)+' ground contact';
  edge.userData.groundContact=true;edge.userData.groundContactOwner=mesh.name;
  edge.receiveShadow=true;edge.renderOrder=mesh.renderOrder;
  // Individually toggled surfaces own their sides so hidden old paths cannot
  // leave freestanding edges. These surfaces already stay out of static batches.
  // Other sides remain siblings so the road network can still be batched.
  if(mesh===root||independentlyVisible.has(mesh))mesh.add(edge);
  else {edge.position.copy(mesh.position);edge.quaternion.copy(mesh.quaternion);edge.scale.copy(mesh.scale);mesh.parent.add(edge);}
  mesh.userData.groundContactClosed=true;
 }
}
