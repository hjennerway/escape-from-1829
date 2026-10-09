// Frozen wall planes from the marked frontage, independent of trim metadata.
// Inspect complete visible geometry, including prepared/compiled batches.
export function checkRedesmereFloorBand(THREE,model){
 model.updateMatrixWorld(true);
 const meshes=[];model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 const line=[[41,19.5],[50.7,19.5],[50.7,19.725],[51.975,21],[54.225,21],
  [55.5,19.725],[55.5,19.5],[59.2,19.5],[59.2,25],[69.82,25]];
 const ray=new THREE.Raycaster(),bad=[];let probes=0;
 const fail=(message,point,hits)=>bad.push({message,point,hits:hits.map(h=>({name:h.object.name,point:h.point.toArray()}))});
 for(let i=0;i<line.length-1;i++){
  const a=line[i],b=line[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),nx=-dz/length,nz=dx/length;
  // Tiny bay stems meet a re-entrant mitre: probe their centre so the ray
  // starts outside the neighbouring front course rather than inside it.
  for(const t of length<.4?[.5]:[.2,.5,.8]){
   const x=a[0]+dx*t,z=a[1]+dz*t;
   for(const [y,offset] of [[3.99,0],[4.08,.07]]){
    ray.set(new THREE.Vector3(x+nx*.4,y,z+nz*.4),new THREE.Vector3(-nx,0,-nz));ray.far=.5;
    const hits=ray.intersectObjects(meshes,false),h=hits[0];
    if(!h||h.object.material.color?.getHex()!==0xe1e3dc||Math.abs(h.distance-(.4-offset))>2e-5)
     fail('Matching pale wall and seated band', [x,y,z],hits.slice(0,2));
    probes++;
   }
   for(const [y,side] of [[4.16,1],[4,-1]]){
    ray.set(new THREE.Vector3(x+nx*.035,y+side*.03,z+nz*.035),new THREE.Vector3(0,-side,0));ray.far=.045;
    const hits=ray.intersectObjects(meshes,false);
    if(hits.length!==1||Math.abs(hits[0].point.y-y)>2e-5||hits[0].object.material.color?.getHex()!==0xe1e3dc)
     fail('One level closed top/underside', [x,y,z],hits);
    probes++;
   }
  }
 }
 if(bad.length)throw new Error('Redesmere lower band: '+JSON.stringify(bad));
 return probes;
}
