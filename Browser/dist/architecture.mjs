// Build from the navigation layout so older binary exports cannot seal new routes.
export function buildArchitecture(THREE, scene, layout) {
  const batches = new Map();
  const colors = {Floor:0x30291f,Stone:0x47453b,Plaster:0x666e61,Panel:0x182b28,Brass:0x75521f,Ceiling:0x4a4d46,Darkwood:0x130d08,Glass:0x214a52,Carpet:0x424854};
  function box(kind,x,y,z,w,h,d) {
    if(!batches.has(kind)) batches.set(kind,[]);
    batches.get(kind).push([x,y,z,w,h,d]);
  }
  const s=layout.cellSize;
  const open=(x,z)=>x>=0&&z>=0&&x<layout.width&&z<layout.height&&layout.cells[z*layout.width+x]===1;
  for(let z=0;z<layout.height;z++)for(let x=0;x<layout.width;x++)if(open(x,z)) {
    const px=x*s,pz=z*s;
    const approach=(layout.stairs||[]).some(t=>t.x===x&&z>=t.z&&z<=14);
    box(approach?'Carpet':(x+z)%2?'Floor':'Stone',px,-.12,pz,s,.24,s);
    box('Ceiling',px,3.55,pz,s,.15,s);
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      if(open(x+dx,z+dz))continue;
      // Visual stair alcoves lie beyond the navigable ground-floor approach.
      if(dz===-1&&(layout.stairs||[]).some(t=>t.direction==='UP'&&t.x===x&&t.z===z))continue;
      const wx=px+dx*s/2,wz=pz+dz*s/2,w=dx?.16:s,d=dx?s:.16;
      box('Plaster',wx,1.8,wz,w,3.6,d);
      box('Panel',wx-dx*.1,.63,wz-dz*.1,w,.98,d);
      box('Brass',wx-dx*.12,1.18,wz-dz*.12,w+.06,.07,d+.06);
      box('Darkwood',wx-dx*.12,.12,wz-dz*.12,w+.06,.15,d+.06);
    }
    if(z===16&&x%4===0)box('Darkwood',px,3.33,pz,.2,.24,7.5);
  }
  for(const t of layout.stairs||[]) {
    if(t.direction==='DOWN'){
      box('Carpet',t.x*s,.012,t.z*s,1.8,.024,1.8);
      for(let n=-2;n<=2;n++)box('Brass',t.x*s,.03,t.z*s+n*.28,1.8,.02,.035);
      continue;
    }
    const x=t.x*s,z=(t.z-.5)*s,side=t.mirror||1;
    // Short flight and a mirrored quarter-turn landing inspired by the video.
    // Holding E at the approach transfers actors to the upper-floor landing.
    for(let n=0;n<6;n++) {
      const h=(n+1)*.12;
      box('Carpet',x,h/2,z-(n+.5)*.28,1.8,h,.28);
      box('Stone',x,h-.015,z-n*.28-.025,1.8,.03,.05);
    }
    box('Carpet',x,.36,z-2.18,1.8,.72,1);
    for(let n=0;n<4;n++) {
      const h=.72+(n+1)*.12;
      box('Carpet',x+side*(.9+(n+.5)*.28),h/2,z-2.18,.28,h,1);
    }
    box('Plaster',x+side*.56,1.8,z-2.8,3.12,3.6,.16);
    box('Plaster',x-side*.98,1.8,z-1.4,.16,3.6,2.8);
    box('Plaster',x+side*2.1,1.8,z-1.4,.16,3.6,2.8);
    box('Plaster',x+side*1.54,1.8,z-.08,1.12,3.6,.16);
    box('Ceiling',x+side*.56,3.55,z-1.4,3.12,.15,2.8);
    box('Brass',x-side*.9,1.4,z-1.4,.045,.045,2.4);
  }
  for(const e of layout.exits) {
    const z=e.z*s+(e.z===4?-.7:.7);
    box('Panel',e.x*s,1.25,z,1.7,2.5,.14);
    box('Brass',e.x*s,1.05,z+(e.z>4?-.1:.1),1.3,.08,.08);
  }
  const geometry=new THREE.BoxGeometry(1,1,1),transform=new THREE.Object3D();
  for(const [kind,items] of batches) {
    const material=new THREE.MeshStandardMaterial({color:colors[kind],roughness:.88});
    const mesh=new THREE.InstancedMesh(geometry,material,items.length);
    mesh.name='Layout '+kind;
    items.forEach(([x,y,z,w,h,d],i)=>{
      transform.position.set(x,y,z);transform.scale.set(w,h,d);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;scene.add(mesh);
  }
}
