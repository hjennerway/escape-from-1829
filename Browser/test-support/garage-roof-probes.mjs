import assert from 'node:assert/strict';

export function checkGarageRoofJoins(THREE,site){
 site.updateWorldMatrix(true,true);
 const garage=site.userData.garages,mortuary=site.userData.mortuary;
 const ray=new THREE.Raycaster();let gableSamples=0,soffitSamples=0;
 // Inspect original surfaces in both paths. The compiled scene also retains
 // inactive window-atlas proxies; raycasting those would mask the real panes.
 const meshes=group=>{const result=[];group.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch&&!o.userData.buildingWindowProxy)result.push(o);});return result;};
 const garageMeshes=meshes(garage),mortuaryMeshes=meshes(mortuary);
 function cast(group,objects,point,out,reach=.6){
  const target=new THREE.Vector3(...point).applyMatrix4(group.matrixWorld);
  const direction=new THREE.Vector3(...out).transformDirection(group.matrixWorld);
  ray.set(target.clone().addScaledVector(direction,reach),direction.negate());ray.far=reach+.01;
  return ray.intersectObjects(objects,false);
 }
 // Independent profiles at all exposed gables. Sample both former filler
 // patches and the bare gable between them, including the shallow blue vent.
 const profiles=[
  [garage,garageMeshes,'x',-.18,-.2,7.4,3.28,4.46,-1],
  [garage,garageMeshes,'x',52.68,-.2,7.4,3.28,4.46,1],
  [garage,garageMeshes,'z',-.2,13.42,17.88,4.53,5.88,-1],
  [garage,garageMeshes,'z',8.4,13.42,17.88,4.53,5.88,1],
  [mortuary,mortuaryMeshes,'x',-8.4,.8,6.2,3.43,5.03,-1],
  [mortuary,mortuaryMeshes,'x',8.4,.8,6.2,3.43,5.03,1],
  [mortuary,mortuaryMeshes,'z',-4.2,-2.08,2.08,3.43,5.03,-1],
  [mortuary,mortuaryMeshes,'x',-1.4,2.5,4.5,5.7,5.98,-1],
  [mortuary,mortuaryMeshes,'x',1.4,2.5,4.5,5.7,5.98,1]
 ];
 for(const [group,objects,axis,plane,start,end,base,peak,sign] of profiles){
  for(const t of [.13,.27,.41,.59,.73,.87]){
   const along=start+(end-start)*t,top=base+(peak-base)*(1-Math.abs(2*t-1));
   for(const f of [.11,.39,.68,.91]){
    const y=base+(top-base)*f,point=axis==='x'?[plane,y,along]:[along,y,plane];
    const out=axis==='x'?[sign,0,0]:[0,0,sign];
    const hits=cast(group,objects,point,out).filter(h=>Math.abs(h.distance-.6)<.001);
    assert.equal(hits.length,1,'One outward gable face at '+group.name+' '+point+'; no coplanar filler');
    gableSamples++;
   }
  }
 }
 // The narrow underside beyond the wall must stay opaque around the whole
 // T and every rectangular range, rather than fixing flicker by deleting fill.
 const mortuaryOutline=[[-8.4,.8],[-2.08,.8],[-2.08,-4.2],[2.08,-4.2],[2.08,.8],[8.4,.8],[8.4,6.2],[-8.4,6.2]];
 const rectangles=[[-.18,-.2,13.78,7.4,3.2],[13.42,-.2,17.88,8.4,4.45],[17.52,-.2,52.68,7.4,3.2]];
 const outlines=rectangles.map(([a,b,c,d,y])=>[garage,garageMeshes,[[a,b],[c,b],[c,d],[a,d]],y]);
 outlines.push([mortuary,mortuaryMeshes,mortuaryOutline,3.35],[mortuary,mortuaryMeshes,[[-1.58,2.5],[1.58,2.5],[1.58,4.5],[-1.58,4.5]],5.62]);
 for(const [group,objects,outline,y] of outlines)for(let i=0;i<outline.length;i++){
  const a=outline[i],b=outline[(i+1)%outline.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(const t of [.17,.43,.79]){
   const point=[a[0]+(b[0]-a[0])*t-(b[1]-a[1])*.06/length,y,a[1]+(b[1]-a[1])*t+(b[0]-a[0])*.06/length];
   const hits=cast(group,objects,point,[0,-1,0],.035);
   assert(hits.some(h=>Math.abs(h.distance-.035)<.001),'Closed underside beyond wall at '+group.name+' '+point);
   soffitSamples++;
  }
 }
 // A ridge-coloured filler formerly stood in front of the central glass.
 for(const side of [-1,1])for(const x of [-.13,.07,.17])for(const y of [5.24,5.49]){
  const z=side<0?2.6175:4.3825;
  const hit=cast(mortuary,mortuaryMeshes,[x,y,z],[0,0,side])[0];
  assert(hit?.object.material.userData.windowGlass,'Vent pane remains exposed, with no ridge support across it');
 }
 console.log('PASS: '+gableSamples+' single-face garage/mortuary gable probes, '+soffitSamples+' closed underside probes and 12 unobstructed vent panes.');
 return {gableSamples,soffitSamples,ventSamples:12};
}
