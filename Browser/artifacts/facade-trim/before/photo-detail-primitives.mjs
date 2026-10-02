// Shared sash, door and ironwork geometry for the photo-based elevations.
export function photoDetailPrimitives(THREE,{model,box,mesh,white,steel,material}){
  const frame=material(0xd3dcd8),glass=material(0x78989f,{roughness:.48,metalness:.15});
  const recess=material(0x303d3d),blue=material(0x172e50),iron=material(0x454b49),stone=material(0xb2b6af);
  const openings=[];model.userData.eastPhotoOpenings=openings;
  function sash(face,x,y,z,rotation=0,w=1.12,h=2.45){
    openings.push({face,x,y,z,w,h});
    const dx=Math.cos(rotation),dz=-Math.sin(rotation),nx=Math.sin(rotation),nz=Math.cos(rotation);
    const part=(mat,u,v,n,pw,ph,pd)=>box(mat,x+dx*u+nx*n,y+v,z+dz*u+nz*n,pw,ph,pd,rotation);
    part(recess,0,0,0,w+.14,h+.12,.1);part(glass,0,0,.055,w,h,.06);
    for(const s of [-1,1])part(frame,s*w/2,0,.1,.065,h+.12,.09);
    for(const s of [-1,1])part(frame,0,s*h/2,.1,w+.12,.07,.09);
    // Three lights across, six high, with a slightly heavier sash meeting rail.
    for(const s of [-1,1])part(frame,s*w/6,0,.115,.025,h,.05);
    for(let i=1;i<6;i++)part(frame,0,-h/2+i*h/6,.12,w,i===3?.055:.025,.06);
    part(white,0,-h/2-.09,.14,w+.32,.12,.24);
    part(stone,0,h/2+.08,.04,w+.22,.12,.13);
  }
  function door(x,z,rotation=0,bottom=0){
    const dx=Math.cos(rotation),dz=-Math.sin(rotation),nx=Math.sin(rotation),nz=Math.cos(rotation);
    box(recess,x,bottom+1.48,z,1.65,2.96,.12,rotation);
    box(blue,x+nx*.1,bottom+1.36,z+nz*.1,1.42,2.72,.12,rotation);
    for(const side of [-1,1])box(white,x+dx*side*.81+nx*.16,bottom+1.5,z+dz*side*.81+nz*.16,.12,3.05,.16,rotation);
    box(glass,x+nx*.18,bottom+2.8,z+nz*.18,1.42,.32,.08,rotation);
    box(white,x+nx*.2,bottom+3.06,z+nz*.2,1.9,.17,.26,rotation);
    box(white,x+nx*.22,bottom+1.4,z+nz*.22,.04,2.55,.05,rotation);
    for(const side of [-1,1])box(steel,x+dx*side*.15+nx*.23,bottom+1.35,z+dz*side*.15+nz*.23,.045,.24,.07,rotation);
  }
  function rod(a,b,r=.025,mat=iron){
    const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);
    const m=mesh(new THREE.CylinderGeometry(r,r,v.length(),5),mat,...p.clone().add(q).multiplyScalar(.5).toArray());
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
    return m;
  }
  return {frame,glass,recess,blue,iron,stone,sash,door,rod};
}
