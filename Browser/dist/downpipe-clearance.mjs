// Run after all facade details exist, before timeline splitting and batching.
// Explicit pipe identities keep stair supports, columns and glazing bars fixed.
export function markDownpipeInstances(mesh,items){
 const indices=items.flatMap((item,index)=>item.downpipe===true||item.downpipe?.pipe?[index]:[]);
 if(indices.length)mesh.userData.downpipeInstances=indices;
 const attachments={};
 for(const index of indices){
  const assembly=items[index].downpipe?.assembly;
  if(assembly)attachments[index]=items.flatMap((item,i)=>i!==index&&item.downpipe?.assembly===assembly?[i]:[]);
 }
 if(Object.keys(attachments).length)mesh.userData.downpipeAttachments=attachments;
}

export const DOWNPIPE_WINDOW_MARGIN=.2;
const DEPTH_MARGIN=.4,EPSILON=1e-5;

export function collectDownpipeWindows(THREE,root){
 root.updateWorldMatrix(true,true);
 const windows=[],pipes=[],matrix=new THREE.Matrix4(),instance=new THREE.Matrix4();
 root.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.visible)return;
  const material=mesh.material;
  const c=material?.color;
  const glass=material?.userData.windowGlass||(!Array.isArray(material)&&material?.isMeshStandardMaterial&&!material.map&&!material.transparent&&
   material.metalness>=.08&&material.metalness<=.35&&material.roughness<.8&&c.r<c.g*.95&&c.b>c.r);
  const indices=mesh.userData.downpipeInstances;
  const named=/\bdownpipe\b/i.test(mesh.name);
  if(!glass&&!indices&&!named)return;
  const geometry=mesh.geometry;
  if(!geometry.boundingBox)geometry.computeBoundingBox();
  const size=geometry.boundingBox.getSize(new THREE.Vector3());
  const centre=geometry.boundingBox.getCenter(new THREE.Vector3());
  for(let i=0;i<(mesh.isInstancedMesh?mesh.count:1);i++){
   if(mesh.isInstancedMesh){mesh.getMatrixAt(i,instance);matrix.multiplyMatrices(mesh.matrixWorld,instance);}else matrix.copy(mesh.matrixWorld);
   const axes=[0,1,2].map(j=>new THREE.Vector3().setFromMatrixColumn(matrix,j));
   const lengths=axes.map((a,j)=>a.length()*size.getComponent(j));
   const upright=Math.abs(axes[1].clone().normalize().y)>.999;
   if(glass&&upright&&lengths[1]>=.3&&lengths[1]<=8&&Math.max(lengths[0],lengths[2])>=.35&&Math.max(lengths[0],lengths[2])<=8&&Math.min(lengths[0],lengths[2])<=.2){
    const widthAxis=lengths[0]>=lengths[2]?0:2;
    windows.push({mesh,index:i,centre:centre.clone().applyMatrix4(matrix),
     tangent:axes[widthAxis].clone().normalize(),normal:axes[2-widthAxis].clone().normalize(),
     halfWidth:lengths[widthAxis]/2,halfHeight:lengths[1]/2});
   }
   if(upright&&(indices?.includes(i)||named)){
    const corners=[];
    for(const x of [geometry.boundingBox.min.x,geometry.boundingBox.max.x])
     for(const y of [geometry.boundingBox.min.y,geometry.boundingBox.max.y])
      for(const z of [geometry.boundingBox.min.z,geometry.boundingBox.max.z])corners.push(new THREE.Vector3(x,y,z).applyMatrix4(matrix));
    pipes.push({mesh,index:mesh.isInstancedMesh?i:null,corners});
   }
  }
 });
 return {windows,pipes};
}

// Displacements along a wall which would overlap this window, including its
// frame/sill and the full pipe thickness. Intersect tangent and depth intervals
// so perpendicular return windows are respected too.
function forbiddenInterval(pipe,window,direction){
 const ys=pipe.corners.map(p=>p.y);
 if(Math.max(...ys)<window.centre.y-window.halfHeight-.12||Math.min(...ys)>window.centre.y+window.halfHeight+.12)return null;
 let low=-Infinity,high=Infinity;
 for(const [axis,half] of [[window.tangent,window.halfWidth+DOWNPIPE_WINDOW_MARGIN],[window.normal,DEPTH_MARGIN]]){
  const projections=pipe.corners.map(p=>p.clone().sub(window.centre).dot(axis));
  const min=Math.min(...projections),max=Math.max(...projections),speed=direction.dot(axis);
  if(Math.abs(speed)<EPSILON){if(min>=half||max<=-half)return null;continue;}
  const a=(-half-max)/speed,b=(half-min)/speed;
  low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));
  if(low>=high)return null;
 }
 return [low,high];
}

export function downpipeWindowOverlaps(pipe,window){
 return !!forbiddenInterval(pipe,window,{dot:()=>0});
}

export function avoidWindowDownpipes(THREE,root){
 const {windows,pipes}=collectDownpipeWindows(THREE,root),moved=[];
 for(const pipe of pipes){
  const overlap=windows.find(window=>downpipeWindowOverlaps(pipe,window));
  if(!overlap)continue;
  const direction=overlap.tangent;
  const intervals=windows.map(window=>forbiddenInterval(pipe,window,direction)).filter(Boolean).sort((a,b)=>a[0]-b[0]);
  const merged=[];
  for(const interval of intervals){
   const last=merged.at(-1);
   if(last&&interval[0]<=last[1]+EPSILON)last[1]=Math.max(last[1],interval[1]);else merged.push([...interval]);
  }
  const blocked=merged.find(([a,b])=>a<0&&b>0);
  if(!blocked)continue;
  const distance=Math.abs(blocked[0])<=Math.abs(blocked[1])?blocked[0]-EPSILON:blocked[1]+EPSILON;
  if(!Number.isFinite(distance))throw new Error('No clear wall position for '+pipe.mesh.name);
  const shift=direction.clone().multiplyScalar(distance),mesh=pipe.mesh;
  if(pipe.index!==null){
   // Use two transformed points to retain scale through mirrored and
   // non-uniformly scaled annexe/ward parents.
   const inverse=new THREE.Matrix4().copy(mesh.matrixWorld).invert();
   const local=shift.clone().applyMatrix4(inverse).sub(new THREE.Vector3().applyMatrix4(inverse));
   const instance=new THREE.Matrix4();
   for(const index of [pipe.index,...(mesh.userData.downpipeAttachments?.[pipe.index]??[])]){
    mesh.getMatrixAt(index,instance);
    instance.elements[12]+=local.x;instance.elements[13]+=local.y;instance.elements[14]+=local.z;
    mesh.setMatrixAt(index,instance);
   }
   mesh.instanceMatrix.needsUpdate=true;
   mesh.computeBoundingBox();mesh.computeBoundingSphere();
  }else{
   const assembly=mesh.parent?.userData.downpipeAssembly?mesh.parent:mesh;
   const inverse=new THREE.Matrix4().copy(assembly.parent.matrixWorld).invert();
   const local=shift.clone().applyMatrix4(inverse).sub(new THREE.Vector3().applyMatrix4(inverse));
   assembly.position.add(local);assembly.updateWorldMatrix(false,true);
  }
  for(const corner of pipe.corners)corner.add(shift);
  moved.push({name:mesh.name,index:pipe.index,position:pipe.corners[0].clone().sub(shift).toArray(),shift:shift.toArray(),window:overlap.mesh.name});
 }
 root.userData.downpipeClearance={pipes:pipes.length,windows:windows.length,moved};
 return root.userData.downpipeClearance;
}
