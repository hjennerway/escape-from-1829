// Use short rays through the entrance envelope so far-away scenery cannot
// conceal a leak around the shut leaf. Both faces and oblique angles matter.
export function probeIrbyEntrance(THREE,root,door){
 root.updateMatrixWorld(true);const meshes=[];
 root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 const frame=door.pivot.parent,matrix=frame.matrixWorld,leaks=[],wall=[],paving=[];
 for(const side of [-1,1])for(const angle of [-.35,0,.35]){
  const direction=new THREE.Vector3(angle,0,-side).normalize().transformDirection(matrix);
  for(const x of [-.79,-.775,.765,.78])for(const y of [.36,1.4,2.75,2.84,2.87]){
   const target=new THREE.Vector3(x,y,.1).applyMatrix4(matrix),origin=target.clone().addScaledVector(direction,-.6);
   const hit=new THREE.Raycaster(origin,direction,0,1.2).intersectObjects(meshes,false)[0];
   if(!hit)leaks.push({side,angle,x,y});
  }
 }
 for(const offset of [-2.6,-2,-1.1,1.1,2,2.6])for(const y of [.35,.4,1,2.5]){
  const hit=new THREE.Raycaster(new THREE.Vector3(door.x+1,y,door.z+offset),new THREE.Vector3(-1,0,0),0,1).intersectObjects(meshes,false)[0];
  wall.push({offset,y,x:hit?.point.x});
 }
 for(const offset of [-2.6,-2,-1.1,1.1,2,2.6]){
  const hit=new THREE.Raycaster(new THREE.Vector3(door.x+.25,1,door.z+offset),new THREE.Vector3(0,-1,0),0,1).intersectObjects(meshes,false)[0];
  paving.push({offset,y:hit?.point.y});
 }
 return {leaks,wall,paving};
}
