import {ROAD_STYLE} from './road-style.mjs';
import {CAR_PARK_OUTLINE} from './kml-car-park-data.mjs';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

export function createModernCarPark(THREE){
  const shape=new THREE.Shape(CAR_PARK_OUTLINE.map(([x,z])=>new THREE.Vector2(x,-z)));
  const layer=ROAD_STYLE.asphaltLayer+1;
  const asphalt=new THREE.MeshStandardMaterial({color:ROAD_STYLE.asphalt,roughness:1,
    polygonOffset:true,polygonOffsetFactor:-layer,polygonOffsetUnits:-2*layer});
  const surface=new THREE.Mesh(new THREE.ShapeGeometry(shape),asphalt);
  surface.name='Car park';surface.rotation.x=-Math.PI/2;surface.position.y=.36;
  surface.receiveShadow=true;surface.renderOrder=3;
  surface.userData={outline:CAR_PARK_OUTLINE,source:'1829 (4).kml · Car park · Polygon'};
  // Stroke the saved concave boundary below the asphalt. Its inner half is
  // covered by the surface, leaving the same pale width as the road ribbons.
  // Joining road asphalt also covers the stroke, keeping junction mouths open.
  const parts=[],width=ROAD_STYLE.edgeWidth;
  for(let i=0;i<CAR_PARK_OUTLINE.length;i++){
    const [x,z]=CAR_PARK_OUTLINE[i],[nx,nz]=CAR_PARK_OUTLINE[(i+1)%CAR_PARK_OUTLINE.length];
    const dx=nx-x,dz=nz-z,length=Math.hypot(dx,dz);
    if(length<1e-6)continue;
    const ox=-dz/length*width,oz=dx/length*width;
    const strip=new THREE.Shape([[x+ox,z+oz],[x-ox,z-oz],[nx-ox,nz-oz],[nx+ox,nz+oz]]
      .map(([px,pz])=>new THREE.Vector2(px,-pz)));
    parts.push(new THREE.ShapeGeometry(strip));
    const joint=new THREE.CircleGeometry(width,ROAD_STYLE.roundSegments);
    joint.translate(x,-z,0);parts.push(joint);
  }
  const borderGeometry=mergeGeometries(parts);
  for(const part of parts)part.dispose();
  const edge=new THREE.MeshStandardMaterial({color:ROAD_STYLE.edge,roughness:1,
    polygonOffset:true,polygonOffsetFactor:-ROAD_STYLE.edgeLayer,polygonOffsetUnits:-2*ROAD_STYLE.edgeLayer});
  const border=new THREE.Mesh(borderGeometry,edge);border.name='Car park border';
  // The surface's local +Z points upward after its ground-plane rotation.
  border.position.z=.32-surface.position.y;border.receiveShadow=true;border.renderOrder=1;
  surface.add(border);
  return surface;
}

// Include crown overhangs even when a trunk stands outside the concave boundary.
export function intersectsCarPark(x,z,radius=0){
  let inside=false;
  for(let i=0,j=CAR_PARK_OUTLINE.length-1;i<CAR_PARK_OUTLINE.length;j=i++){
    const [ax,az]=CAR_PARK_OUTLINE[j],[bx,bz]=CAR_PARK_OUTLINE[i],dx=bx-ax,dz=bz-az;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));
    if(Math.hypot(x-ax-t*dx,z-az-t*dz)<=radius+1e-8)return true;
    if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;
  }
  return inside;
}

// Split the shared broadleaf batches once, keeping complete trees together.
// The resulting branch stays under Trees, so the normal toggle and walking
// collision traversal apply to it as well as Historic/Modern visibility.
export function partitionCarParkTrees(THREE,trees){
  const displaced=new THREE.Group();displaced.name='Trees displaced by modern car park';
  const removedIds=new Set();
  trees.updateWorldMatrix(true,true);
  for(const tree of [...trees.children]){
    if(tree.userData.oakTree||tree.isInstancedMesh)continue;
    const broadleaf=tree.userData.broadleafTree;
    let intersects=false;
    if(broadleaf){
      intersects=intersectsCarPark(broadleaf.x,broadleaf.z,.3*broadleaf.size)||
        broadleaf.crowns.some(crown=>intersectsCarPark(crown.x,crown.z,crown.s));
    }else if(tree.userData.adminPineTree||tree.userData.frontLawnTree){
      // Detailed species use their complete bounds, including all foliage LODs.
      const bounds=new THREE.Box3().setFromObject(tree),center=bounds.getCenter(new THREE.Vector3());
      intersects=intersectsCarPark(center.x,center.z,Math.hypot(bounds.max.x-bounds.min.x,bounds.max.z-bounds.min.z)/2);
    }
    if(intersects){removedIds.add(tree.uuid);displaced.add(tree);}
  }
  const matrix=new THREE.Matrix4();
  for(const batch of [...trees.children]){
    const ids=batch.userData.treeIds;
    if(!ids)continue;
    const removed=ids.filter(id=>removedIds.has(id)).length;
    if(!removed)continue;
    const crowns=new THREE.InstancedMesh(batch.geometry,batch.material,removed);
    crowns.name='Car park displaced broadleaf crowns';
    crowns.castShadow=batch.castShadow;crowns.receiveShadow=batch.receiveShadow;
    crowns.position.copy(batch.position);crowns.quaternion.copy(batch.quaternion);crowns.scale.copy(batch.scale);
    const keptIds=[],removedTreeIds=[];
    for(let i=0;i<ids.length;i++){
      batch.getMatrixAt(i,matrix);
      if(removedIds.has(ids[i])){crowns.setMatrixAt(removedTreeIds.length,matrix);removedTreeIds.push(ids[i]);}
      else{batch.setMatrixAt(keptIds.length,matrix);keptIds.push(ids[i]);}
    }
    batch.count=keptIds.length;batch.userData.treeIds=keptIds;
    batch.instanceMatrix.needsUpdate=true;batch.computeBoundingBox();batch.computeBoundingSphere();
    crowns.userData.treeIds=removedTreeIds;crowns.computeBoundingBox();crowns.computeBoundingSphere();
    displaced.add(crowns);
  }
  trees.add(displaced);return displaced;
}
