// Use short rays through the entrance envelope so far-away scenery cannot
// conceal a leak around the shut leaf. Both faces and oblique angles matter.
export function probeIrbyEntrance(THREE,root,door){
 root.updateMatrixWorld(true);const meshes=[];
 root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 const frame=door.pivot.parent,matrix=frame.matrixWorld,leaks=[],wall=[],paving=[],floor=[];
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
 // Stay inside the threshold edges and away from the jambs/closed leaf.
 // Multiple hits at floor height reveal competing rendered surfaces.
 for(const dx of [-.4,-.22,-.20,-.10,-.02,.15])for(const dz of [-.7,0,.7]){
  const hits=new THREE.Raycaster(new THREE.Vector3(door.x+dx,.6,door.z+dz),new THREE.Vector3(0,-1,0),0,.7).intersectObjects(meshes,false).filter(h=>Math.abs(h.point.y-.04)<1e-4);
  floor.push({dx,dz,surfaces:[...new Set(hits.map(h=>h.object.uuid))].length,y:hits[0]?.point.y});
 }
 return {leaks,wall,paving,floor};
}

// Removing the concrete must leave every visible stone pixel unchanged.
// Angle-dependent differences catch depth fighting even when one view is clean.
export function probeIrbyThresholdPixels({THREE,renderer,exterior},door){
 const gl=renderer.getContext(),width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
 const floor=exterior.model.getObjectByName('Continuous escape corridor and workshop floor');
 const capture=()=>{renderer.render(exterior.scene,exterior.camera);const pixels=new Uint8Array(width*height*4);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;};
 const full=capture(),visible=floor.visible;let hidden;
 try{floor.visible=false;hidden=capture();}finally{floor.visible=visible;}
 let changed=0,maximum=0,samples=0;
 for(let dx=-.19;dx<-.02;dx+=.01)for(let dz=-.7;dz<.7;dz+=.02){
  const p=new THREE.Vector3(door.x+dx,.04,door.z+dz).project(exterior.camera),px=Math.floor((p.x*.5+.5)*width),py=Math.floor((p.y*.5+.5)*height);
  if(px<0||px>=width||py<0||py>=height)continue;
  const i=(py*width+px)*4,difference=Math.max(...[0,1,2].map(c=>Math.abs(full[i+c]-hidden[i+c])));
  samples++;maximum=Math.max(maximum,difference);if(difference>3)changed++;
 }
 return {samples,changed,maximum};
}
