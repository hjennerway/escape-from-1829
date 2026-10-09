import {clipTimelineGeometry} from './estate-timeline.mjs';

// Owner's marked west-side walking view, 9 October 2026. Fit the north
// abutment to the accepted south stores facade without moving the tower.
export function fitNorthTowerWall(THREE,{tower,resources,removed,remainders,west,sourceWest,plinth}){
 const shift=west-sourceWest,anchor=149.7;
 function stretch(part,{coping=false,wall=false,base=false}={}){
  part.updateWorldMatrix(true,false);
  const inverse=part.matrixWorld.clone().invert(),p=part.geometry.attributes.position,uv=part.geometry.attributes.uv,v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
   v.fromBufferAttribute(p,i).applyMatrix4(part.matrixWorld);
   v.x+=shift*(coping?1:wall?Number(v.x<=sourceWest+.001):Math.max(0,Math.min(1,(anchor-v.x)/(anchor-sourceWest))));
   if(wall&&!base&&v.y<.6){if(uv)uv.setY(i,uv.getY(i)+(.6-v.y)/1.7);v.y=.6;}
   v.applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);
  }
  p.needsUpdate=true;if(uv)uv.needsUpdate=true;
  part.geometry.computeVertexNormals();part.geometry.computeBoundingBox();part.geometry.computeBoundingSphere();
  // The clipped shell keeps a separate footprint for precise walking checks.
  // Move its boundary by the same transform as the visible masonry.
  const footprint=points=>points.map(([x,z])=>{
   v.set(x,0,z).applyMatrix4(part.matrixWorld);
   v.x+=shift*(coping?1:wall?Number(v.x<=sourceWest+.001):Math.max(0,Math.min(1,(anchor-v.x)/(anchor-sourceWest))));
   v.applyMatrix4(inverse);return [v.x,v.z];
  });
  if(part.userData.collisionFootprint)part.userData.collisionFootprint=footprint(part.userData.collisionFootprint);
  if(part.userData.collisionFootprints)part.userData.collisionFootprints=part.userData.collisionFootprints.map(footprint);
 }
 // Clipped wall pieces already own disposable geometry. Stretch those pieces
 // together so their external plane and corridor cuts remain continuous.
 for(const part of [...remainders])if(/^North tower range (?:west|tower) walls/.test(part.name)){
  part.updateWorldMatrix(true,false);
  // Preserve the full lower shell, including its exposed end returns and
  // corridor cuts, when the brick wall starts above the lighter base.
  const lower=clipTimelineGeometry(THREE,part.geometry,part.matrixWorld,.6,-1,'y');
  if(lower.attributes.position.count){
   resources.add(lower);const base=part.clone();base.geometry=lower;base.material=plinth;
   base.name='North tower range matching plinth';part.parent.add(base);stretch(base,{wall:true,base:true});remainders.push(base);
  }else lower.dispose();
  stretch(part,{wall:true});
 }
 for(const name of ['North tower range arch-front flat roof','North tower range outer flat coping']){
  const original=tower.getObjectByName(name);if(!original)continue;
  const part=original.clone();part.geometry=original.geometry.clone();resources.add(part.geometry);
  original.parent.add(part);stretch(part,{coping:name.endsWith('coping')});
  remainders.push(part);removed.push([original,original.parent]);original.removeFromParent();
 }
}

export function removeTowerJunctionSashes(THREE,{ward,editedInstances}){
 if(!ward)return;
 // Select the last two south-facing bays from the original ward records.
 // Their centres follow the ward placement, rather than a screen coordinate.
 const bays=(ward.userData.openings??[]).filter(o=>Math.abs(o.r)<1e-6)
  .map(o=>({...o,point:ward.localToWorld(new THREE.Vector3(o.x,o.y,o.z))}));
 const right=Math.max(...bays.map(o=>o.point.x)),pair=bays.filter(o=>Math.abs(o.point.x-right)<1e-6);
 const matrix=new THREE.Matrix4(),world=new THREE.Matrix4(),p=new THREE.Vector3();
 ward.traverse(part=>{
  if(!part.isInstancedMesh)return;let changed=false;
  for(let i=0;i<part.count;i++){
   part.getMatrixAt(i,matrix);world.multiplyMatrices(part.matrixWorld,matrix);p.setFromMatrixPosition(world);
   // The complete sash is inside this envelope; continuous masonry bands
   // and the neighbouring full-height downpipe have their centres outside it.
   if(!pair.some(o=>Math.abs(p.x-o.point.x)<(o.w+.5)/2&&Math.abs(p.y-o.point.y)<o.h/2+.32&&Math.abs(p.z-o.point.z)<.42))continue;
   editedInstances.push([part,i,matrix.clone()]);part.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0));changed=true;
  }
  if(changed){part.instanceMatrix.needsUpdate=true;part.computeBoundingBox();part.computeBoundingSphere();}
 });
}
