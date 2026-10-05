// Match the shared 512px slate map's 60px tiles and 32px courses at scale 3.
export const ROOF_TILE_WIDTH=3*60/512;
export const ROOF_TILE_COURSE=3*32/512;

export function roofTileUV(THREE,geometry,matrixWorld,material,precise=false){
 const p=geometry.attributes.position,index=geometry.index,oldUV=geometry.attributes.uv;
 const pixels=material.userData.roofTilePixels,image=material.map.image;
 const scaleU=pixels[0]/(image.width*ROOF_TILE_WIDTH),scaleV=pixels[1]/(image.height*ROOF_TILE_COURSE);
 const positions=Array.from({length:p.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrixWorld));
 const source=Array.from({length:index?.count??p.count},(_,i)=>index?index.getX(i):i),faces=[],unchanged=new Set(),planes=[];
 let slopes=0;
 for(let i=0;i<source.length;i+=3){
  const ids=source.slice(i,i+3),[a,b,c]=ids.map(id=>positions[id]);
  const normal=b.clone().sub(a).cross(c.clone().sub(a));
  if(normal.lengthSq()<1e-16){faces.push(null);ids.forEach(id=>unchanged.add(id));continue;}
  normal.normalize();if(normal.y<0)normal.negate();
  if(normal.y<.001||normal.y>.999999){faces.push(null);ids.forEach(id=>unchanged.add(id));continue;}
  // Share a frame across coplanar triangles, including reversed undersides.
  let plane=planes.find(frame=>frame.normal.dot(normal)>1-1e-10);
  if(!plane){
   const u=new THREE.Vector3(normal.z,0,-normal.x).normalize(),v=normal.clone().cross(u).normalize();
   plane={normal,u,v};planes.push(plane);
  }
  const coords=ids.map(id=>[positions[id].dot(plane.u)*scaleU,positions[id].dot(plane.v)*scaleV]);
  // Tiny clipped faces lose useful precision at large world UV coordinates.
  // Whole repeats preserve the texture phase while keeping Float32 UVs local.
  if(precise){
   const offsetU=Math.round(coords[0][0]),offsetV=Math.round(coords[0][1]);
   for(const uv of coords){uv[0]-=offsetU;uv[1]-=offsetV;}
  }
  faces.push(coords);slopes++;
 }
 if(!slopes)return geometry;
 const uv=oldUV?Array.from(oldUV.array):new Array(p.count*2).fill(0),variants=new Map(),duplicates=[],indices=[...source];
 for(const id of unchanged)variants.set(id,[{id,u:uv[id*2],v:uv[id*2+1]}]);
 for(let face=0;face<faces.length;face++){
  if(!faces[face])continue;
  for(let corner=0;corner<3;corner++){
   const offset=face*3+corner,original=source[offset],[u,v]=faces[face][corner];
   let choices=variants.get(original);if(!choices){choices=[];variants.set(original,choices);}
   let choice=choices.find(value=>Math.abs(value.u-u)<1e-5&&Math.abs(value.v-v)<1e-5);
   if(!choice){
    const id=choices.length?p.count+duplicates.length:original;
    if(choices.length)duplicates.push(original);
    choice={id,u,v};choices.push(choice);uv[id*2]=u;uv[id*2+1]=v;
   }
   indices[offset]=choice.id;
  }
 }
 const result=geometry.clone();
 // A vertex shared across roof pitches needs separate UVs at the hip/ridge.
 if(duplicates.length)for(const [name,attr] of Object.entries(geometry.attributes)){
  if(name==='uv')continue;
  const values=new attr.array.constructor((p.count+duplicates.length)*attr.itemSize);values.set(attr.array);
  duplicates.forEach((source,i)=>values.set(attr.array.subarray(source*attr.itemSize,(source+1)*attr.itemSize),(p.count+i)*attr.itemSize));
  result.setAttribute(name,new THREE.BufferAttribute(values,attr.itemSize,attr.normalized));
 }
 result.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 if(index)result.setIndex(indices);
 return result;
}

export function finishRoofTiles(THREE,root){
 root.updateWorldMatrix(true,true);
 root.traverse(mesh=>{
  if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.material?.userData.roofTilePixels)return;
  mesh.geometry=roofTileUV(THREE,mesh.geometry,mesh.matrixWorld,mesh.material,mesh.userData.preciseRoofUV===true);
 });
}
