// laundry/img1.jpg supplies the elevations; img1-loc.png supplies the blue
// block and green link footprints. Dimensions and concealed faces are estimates.
export const LAUNDRY=Object.freeze({
  minX:102,maxX:116.6,minZ:28,maxZ:56.8,eaves:4.35,rise:2.05,
  linkMinX:102,linkMaxX:108.6,linkHeight:3.25,layout:'historic'
});
export const LAUNDRY_VIEWS=Object.freeze({
  laundry:{position:[78,48,103],target:[100,2,29],fov:48},
  'laundry-plan':{position:[105,92,31.01],target:[105,0,31],fov:46},
  'laundry-photo':{position:[70,1.9,67],target:[104,3.7,29],fov:58}
});

export function createLaundry(THREE,{brick,roof,worldUV,material,adminCorridor}){
  const group=new THREE.Group();group.name='Laundry and brick connecting corridor';
  const b=LAUNDRY,cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2;
  group.position.set(cx,0,cz);
  const white=material(0xe1e3d9),trim=material(0xd6d9d1),plinth=material(0x959b8f);
  const glass=material(0x596c68,{roughness:.55,metalness:.08}),recess=material(0x3f4641);
  const gutter=material(0x4c5550),felt=material(0x565b53),coping=material(0x96998b);
  const slate=roof.clone();slate.color.set(0xd5ded0);
  const linkBrick=brick.clone();linkBrick.color.set(0xd7bfa0);
  const batches=new Map(),openings=[];
  function mesh(g,m,x,y,z,name){
    const o=new THREE.Mesh(g,m);o.name=name;o.position.set(x-cx,y,z-cz);
    o.castShadow=true;o.receiveShadow=true;group.add(o);return o;
  }
  function solid(m,x,y,z,w,h,d,name){return mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x,y,z,name);}
  function box(m,x,y,z,w,h,d,r=0){
    if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x:x-cx,y,z:z-cz,w,h,d,r});
  }
  solid(white,cx,b.eaves/2,cz,b.maxX-b.minX,b.eaves,b.maxZ-b.minZ,'Laundry white rendered walls');
  solid(plinth,cx,.15,cz,b.maxX-b.minX+.035,.3,b.maxZ-b.minZ+.035,'Laundry weathered base');
  // Seven high, near-square multi-pane lights above plain white panels.
  function window(x,z,r,w=1.5,h=1.25,y=3.18,label='Laundry high window'){
    const dx=Math.cos(r),dz=-Math.sin(r),nx=Math.sin(r),nz=Math.cos(r);
    const part=(m,u,v,n,pw,ph,pd)=>box(m,x+dx*u+nx*n,y+v,z+dz*u+nz*n,pw,ph,pd,r);
    part(recess,0,0,0,w+.15,h+.15,.09);part(glass,0,0,.055,w,h,.06);
    for(const s of [-1,1]){part(trim,s*w/2,0,.115,.065,h+.12,.08);part(trim,0,s*h/2,.115,w+.12,.07,.08);}
    for(const s of [-1,1]){part(trim,s*w/6,0,.13,.032,h,.05);part(trim,0,s*h/6,.13,w,.032,.05);}
    part(trim,0,-h/2-.09,.14,w+.24,.12,.19);
    openings.push({label,x,y,z,r,w,h});
  }
  const spacing=(b.maxZ-b.minZ)/7;
  for(let i=0;i<7;i++){
    const z=b.minZ+(i+.5)*spacing;
    window(b.minX-.035,z,-Math.PI/2,i===6?1.85:1.5);
    // Opposite elevation is concealed in img1; repeat the restrained bay rhythm.
    window(b.maxX+.035,z,Math.PI/2);
    for(const x of [b.minX-.07,b.maxX+.07]){
      box(trim,x,2.03,b.minZ+i*spacing+.08,.16,4.06,.14);
      if(i===1||i===4){
        box(trim,x,1.26,z,.1,2.22,1.48);
        box(plinth,x+(x<cx?-.07:.07),1.24,z+.12,.035,.23,.035);
      }
    }
  }
  // The road-facing end remains a simple white wall beneath a full hip.
  for(const x of [b.minX+.13,b.maxX-.13])box(trim,x,2.03,b.maxZ+.045,.18,4.06,.13);
  // Eaves, gutters and corner rainwater pipes continue around all four faces.
  for(const x of [b.minX-.13,b.maxX+.13]){
    box(trim,x,b.eaves-.11,cz,.22,.22,b.maxZ-b.minZ+.25);
    box(gutter,x,b.eaves+.015,cz,.19,.12,b.maxZ-b.minZ+.45);
    for(const z of [b.minZ+.24,b.maxZ-.24])box(gutter,x,.15+(b.eaves-.25)/2,z,.08,b.eaves-.25,.08);
  }
  for(const z of [b.minZ-.13,b.maxZ+.13]){
    box(trim,cx,b.eaves-.11,z,b.maxX-b.minX+.25,.22,.22);
    box(gutter,cx,b.eaves+.015,z,b.maxX-b.minX+.45,.12,.19);
  }
  const x0=b.minX-.3,x1=b.maxX+.3,z0=b.minZ-.3,z1=b.maxZ+.3;
  const inset=(x1-x0)/2,y=b.eaves+.08,peak=y+b.rise;
  const points=[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],[cx,peak,z0+inset],[cx,peak,z1-inset]];
  const positions=[],uv=[];
  for(const face of [[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]]){
    const vertices=face.map(i=>new THREE.Vector3(...points[i]));
    if(new THREE.Vector3().crossVectors(vertices[1].clone().sub(vertices[0]),vertices[2].clone().sub(vertices[0])).y<0)vertices.reverse();
    for(const p of vertices){positions.push(p.x-cx,p.y,p.z-cz);uv.push((p.x-cx)/3,(p.z-cz+p.y)/3);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
  mesh(geometry,slate,cx,0,cz,'Laundry hipped slate roof');
  box(gutter,cx,peak+.035,cz,.18,.12,z1-z0-2*inset);
  // Two modest extract cowls appear on the roof in the photograph.
  for(const z of [cz-5,cz+4]){
    mesh(new THREE.CylinderGeometry(.17,.2,.47,10),coping,cx,peak+.15,z,'Laundry roof vent stem');
    mesh(new THREE.ConeGeometry(.45,.23,10),trim,cx,peak+.48,z,'Laundry roof vent cowl');
  }
  // Abut the existing range's actual front wall, so the green link cannot
  // float short of its host if that range is adjusted later.
  const host=adminCorridor.userData.sections.find(s=>s.name==='Redesmere connector building');
  const linkBack=host.cz+host.depth/2,linkFront=b.minZ+.04;
  const lx=(b.linkMinX+b.linkMaxX)/2,lz=(linkBack+linkFront)/2,lw=b.linkMaxX-b.linkMinX,ld=linkFront-linkBack;
  solid(linkBrick,lx,b.linkHeight/2,lz,lw,b.linkHeight,ld,'Laundry connecting corridor brick walls');
  solid(felt,lx,b.linkHeight+.085,lz,lw+.16,.17,ld+.08,'Laundry corridor flat roof');
  for(const x of [b.linkMinX-.04,b.linkMaxX+.04])box(coping,x,b.linkHeight+.19,lz,.18,.09,ld);
  for(const z of [linkBack,linkFront])box(coping,lx,b.linkHeight+.19,z,lw+.18,.09,.18);
  for(const z of [linkFront-2.3,linkFront-6.1])window(b.linkMinX-.035,z,-Math.PI/2,1.02,.94,2.39,'Laundry corridor window');
  box(gutter,b.linkMinX-.14,1.55,linkFront-.4,.07,3.1,.07);
  const dummy=new THREE.Object3D();
  for(const [m,items] of batches){
    const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,items.length);batch.name='Laundry glazing and trim';batch.castShadow=true;batch.receiveShadow=true;
    items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.rotation.set(0,p.r,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});group.add(batch);
  }
  group.userData.openings=openings;
  group.userData.footprints=[{minX:b.minX,maxX:b.maxX,minZ:b.minZ,maxZ:b.maxZ},{minX:b.linkMinX,maxX:b.linkMaxX,minZ:linkBack,maxZ:linkFront}];
  group.userData.reference='Research/laundry/README.md: blue white block and green flat-roof brick link, positioned from img1-loc.png; elevations from img1.jpg. Red identifies the existing ivy range. Dimensions and concealed elevations are estimates.';
  return group;
}
