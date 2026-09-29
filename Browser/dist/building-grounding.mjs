// A flush plinth replaces the foot of a wall. Two coplanar skins flicker;
// retain the wall's upper vertices and texture registration when cutting it.
export function meetPlinth(wall,height){
 const g=wall.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i))<1e-5){
  p.setY(i,height);
  if(uv&&Math.abs(n.getY(i))<.5)uv.setY(i,height/1.7);
 }
 p.needsUpdate=true;if(uv)uv.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
 return wall;
}

// Authored architectural ground level is zero; the lawn is slightly lower.
// Extend only bottom vertices of upright solid architecture into that lawn.
// This runs before timeline partitioning, batching and transform caching.
export function groundBuildingBases(THREE,root,{groundY=-.15,exclude=[]}={}){
 root.updateWorldMatrix(true,true);
 const matrix=new THREE.Matrix4(),world=new THREE.Matrix4(),v=new THREE.Vector3();
 const changes=[];
 root.traverse(o=>{
  if(!o.isMesh)return;
  for(let p=o;p;p=p.parent)if(exclude.includes(p))return;
  const m=o.material;
  if(Array.isArray(m)||m.transparent||m.userData.estateGrass||m.userData.estateSurface||m.userData.groundContactSide)return;
  const g=o.geometry;
  if(!['BoxGeometry','ExtrudeGeometry','CylinderGeometry'].includes(g.type)&&!o.userData.collisionFootprint)return;
  if(o.isInstancedMesh&&g.type!=='BoxGeometry')return;
  if(!g.boundingBox)g.computeBoundingBox();
  const count=o.isInstancedMesh?o.count:1;
  for(let i=0;i<count;i++){
   if(o.isInstancedMesh){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);}else world.copy(o.matrixWorld);
   // Sloping beams and roofs are not ground-level vertical construction.
   if(world.elements[5]<=0||Math.abs(world.elements[1])+Math.abs(world.elements[9])+Math.abs(world.elements[4])+Math.abs(world.elements[6])>1e-5)continue;
   const b=g.boundingBox.clone().applyMatrix4(world),height=b.max.y-b.min.y;
   if(b.min.y<groundY+.001||b.min.y>.025||b.min.y<-.051||height<.15)continue;
   const bottom=groundY-.03;
   if(o.isInstancedMesh){
    const localDrop=(b.min.y-bottom)/o.matrixWorld.elements[5];
    const span=g.boundingBox.max.y-g.boundingBox.min.y;
    matrix.elements[13]-=localDrop*g.boundingBox.max.y/span;
    matrix.elements[5]+=localDrop/span;
    o.setMatrixAt(i,matrix);o.instanceMatrix.needsUpdate=true;
    o.boundingBox=null;o.boundingSphere=null;
   }else{
    // Copies such as Witby share geometry with their source ward. Clone before
    // extending one object so both keep their own placement and cached bounds.
    const geometry=g.clone(),p=geometry.attributes.position,uv=geometry.attributes.uv,n=geometry.attributes.normal;
    const inverse=world.clone().invert();
    for(let k=0;k<p.count;k++){
     v.fromBufferAttribute(p,k).applyMatrix4(world);
     if(Math.abs(v.y-b.min.y)>1e-4)continue;
     v.y=bottom;v.applyMatrix4(inverse);p.setXYZ(k,v.x,v.y,v.z);
     // Keep existing texture coordinates above grade. Extend the vertical
     // texture at the foot instead of stretching the whole wall's mapping.
     if(uv&&Math.abs(n.getY(k))<.5){
      for(let j=0;j<p.count;j++)if(Math.abs(n.getY(j))<.5&&Math.abs(n.getX(k)-n.getX(j))+Math.abs(n.getZ(k)-n.getZ(j))<1e-4&&g.attributes.position.getY(j)>g.boundingBox.min.y+1e-4){
       const dy=g.attributes.position.getY(j)-g.attributes.position.getY(k);
       uv.setY(k,uv.getY(k)+(v.y-g.attributes.position.getY(k))*(g.attributes.uv.getY(j)-g.attributes.uv.getY(k))/dy);break;
      }
     }
    }
    p.needsUpdate=true;if(uv)uv.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();o.geometry=geometry;
   }
   changes.push({name:o.name,parent:o.parent?.name,index:o.isInstancedMesh?i:null,from:b.min.y,to:bottom});
  }
 });
 return changes;
}
