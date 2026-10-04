// Probe actual pane and bar surfaces, including the reflected rear-wing group.
export function auditTripartitePanes(THREE,model){
  model.updateMatrixWorld(true);
  const windows=[];
  model.traverse(group=>{
    for(const o of group.userData.eastPhotoOpenings??[]){
      const side=o.face.endsWith('sidelight')||(o.face==='west-end-middle'&&o.w<1);
      const centre=['west-front-bay-flank','entrance-west-central-glazing','entrance-east-central-glazing'].includes(o.face)||
        (o.face==='west-end-middle'&&o.w>1)||(o.face==='west-wing-upper-end'&&o.x===31);
      if(side||centre)windows.push({group,o,columns:side?2:3});
    }
  });
  const ray=new THREE.Raycaster(),meshes=[];
  model.traverseVisible(o=>{if(o.isMesh&&[0x78989f,0xd3dcd8].includes(o.material.color?.getHex()))meshes.push(o);});
  const probes=[];
  for(const {group,o,columns} of windows){
    const rotation=o.face.startsWith('west-end-')?-Math.PI/2:o.face.startsWith('west-wing-')?Math.PI:0;
    const normal=new THREE.Vector3(Math.sin(rotation),0,Math.cos(rotation)).transformDirection(group.matrixWorld);
    const tangent=new THREE.Vector3(Math.cos(rotation),0,-Math.sin(rotation)).transformDirection(group.matrixWorld);
    const centre=new THREE.Vector3(o.x,o.y,o.z).applyMatrix4(group.matrixWorld);
    function probe(u,v,color){
      ray.set(centre.clone().addScaledVector(tangent,u*o.w).add(new THREE.Vector3(0,v*o.h,0)).addScaledVector(normal,.3),normal.clone().negate());
      const hit=ray.intersectObjects(meshes,false)[0];
      if(hit?.object.material.color.getHex()!==color)throw Error('Incorrect pane/bar '+JSON.stringify({face:o.face,x:o.x,y:o.y,u,v,columns,hit:hit&&{color:hit.object.material.color.getHex(),name:hit.object.name,point:hit.point.toArray()}}));
      probes.push({face:o.face,u,v,color});
    }
    for(let i=0;i<columns;i++)for(const v of [-5/12,-3/12,-1/12,1/12,3/12,5/12])probe(-.5+(i+.5)/columns,v,0x78989f);
    for(let i=1;i<columns;i++)probe(-.5+i/columns,1/12,0xd3dcd8);
    // Former thirds on a sidelight now fall inside the two clear panes.
    if(columns===2)for(const u of [-1/6,1/6])probe(u,1/12,0x78989f);
    for(const v of [-1/3,-1/6,0,1/6,1/3])probe(columns===2?.25:0,v,0xd3dcd8);
  }
  const sideCount=windows.filter(w=>w.columns===2).length,centreCount=windows.length-sideCount;
  if(sideCount!==22||centreCount!==9)throw Error('Missing matching sash: '+JSON.stringify({sideCount,centreCount}));
  return {sideCount,centreCount,probes:probes.length};
}
