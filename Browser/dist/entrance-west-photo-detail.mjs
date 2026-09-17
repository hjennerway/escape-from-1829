// img19.jpg: northward view from the lawn immediately west of Reception.
// Window positions and the projecting three-bay section are photo estimates.
export const ENTRANCE_WEST_PHOTO_VIEW=Object.freeze({position:[-10,1.8,43.8],target:[-20.7,7.2,18],fov:44});
export const ENTRANCE_WEST_PROFILE=Object.freeze({left:-32,right:-7.1,step:-22.6,wallZ:17.3,projectionZ:19.7,base:3.1,eaves:12.8});

export function addEntranceWestPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron,frame,glass,includeReception=true}){
  const start=model.userData.eastPhotoOpenings.length;
  const p=ENTRANCE_WEST_PROFILE,trim=material(0xcbd4d1),headStone=material(0xd8dad1),panel=material(0xaab5af);
  function range(name,left,right,back,front,height){
    const x=(left+right)/2,z=(back+front)/2,w=right-left,d=front-back;
    mesh(worldUV(new THREE.BoxGeometry(w,height-p.base,d),1.7),brick,x,(height+p.base)/2,z,true).name=name;
    mesh(worldUV(new THREE.BoxGeometry(w,p.base,d),1.7),white,x,p.base/2,z,true).name=name+' white lower storey';
    box(trim,x,p.base+.05,z,w+.12,.2,d+.12);
    return {x,z,w,d};
  }
  range('Entrance west recessed wall',p.step,p.right,16.95,p.wallZ,p.eaves);
  const projection=range('Entrance west three-bay projection',p.left,p.step,16.9,p.projectionZ,13.35);
  hipRoof(projection.x,16.1,projection.w,7.2,13.4,.7).name='Entrance west projection slate roof';
  // Broad parapet cornice, built along the front and the exposed right return.
  function cornice(x,z,w,height,rotation=0){
    for(const [dy,h,depth] of [[0,.58,.24],[-.35,.1,.38],[-.49,.1,.31],[.34,.1,.35]])box(trim,x,height+dy,z,w,h,depth,rotation);
  }
  cornice((p.left+p.step)/2,p.projectionZ+.1,p.step-p.left+.15,13.3);
  cornice(p.step+.08,(p.wallZ+p.projectionZ)/2,p.projectionZ-p.wallZ+.2,13.3,Math.PI/2);
  cornice((p.step+p.right)/2,p.wallZ+.1,p.right-p.step+.2,12.75);
  box(trim,p.step+.06,p.base+.05,18.5,.18,.2,2.5);
  // Pale white base and floor bands wrap onto the west side of Reception.
  box(white,-7.16,1.55,18.35,.15,3.1,2.7);
  for(const y of [3.15,7.1,10.7,14.5])box(trim,-7.2,y,18.35,.23,.2,2.7);

  function opening(face,x,y,z,w=1.25,h=2.85,rotation=0,splayed=false){
    sash(face,x,y,z,rotation,w,h);
    if(!splayed)return;
    const a=w/2+.07,b=w/2+.34,g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute([-a,0,0,a,0,0,b,.34,0,-a,0,0,b,.34,0,-b,.34,0],3));g.computeVertexNormals();
    const head=mesh(g,headStone,x+Math.sin(rotation)*.14,y+h/2+.06,z+Math.cos(rotation)*.14);head.rotation.y=rotation;
  }
  // Five single sashes per upper floor in the recessed stretch.
  const columns=[-21,-17.85,-14.7,-11.55,-8.4];
  for(const y of [5.45,9.75])for(const x of columns)opening('entrance-west-recess',x,y,p.wallZ+.07,1.22,2.85,0,x===-8.4);
  for(const x of [-28.1,-24.25])for(const y of [5.6,10])opening('entrance-west-projection',x,y,p.projectionZ+.07,1.25,2.9,0,y===5.6);
  // Broad central glazing with narrow sidelights and pale upright mullions.
  for(const y of [5.7,10]){
    opening('entrance-west-central-glazing',-26.15,y,p.projectionZ+.07,.98,2.9);
    for(const dx of [-.8,.8])opening('entrance-west-sidelight',-26.15+dx,y,p.projectionZ+.07,.3,2.9);
    for(const dx of [-.61,.61])box(trim,-26.15+dx,y,p.projectionZ+.22,.12,3.1,.2);
  }
  box(panel,-26.15,3.85,p.projectionZ+.17,1.88,.65,.13);
  box(trim,-26.15,3.5,p.projectionZ+.25,2.1,.14,.3);
  opening('entrance-west-step-return',p.step+.07,5.45,18.5,1,2.8,Math.PI/2);
  opening('entrance-west-step-return',p.step+.07,1.45,18.5,.7,2.05,Math.PI/2);
  // The white lower level contains two doors, not a third generic sash row.
  for(const x of [-28.1,-24.25])opening('entrance-west-lower',x,1.45,p.projectionZ+.07,1.25,2.1);
  for(const x of [-21,-17.85,-14.7,-8.4])opening('entrance-west-lower',x,1.45,p.wallZ+.07,1.22,2.1);
  door(-26.15,p.projectionZ+.08,0,-.28);
  door(-11.55,p.wallZ+.08,0,-.28);
  // Fine glazing on the Reception front ties the photographed right edge to
  // the new elevation; the red door, columns and heraldry retain their shape.
  if(includeReception)for(const x of [-4,0,4])for(const y of [4.3,8.9,12.4])if(x!==0||y!==4.3)
    opening('reception-front-sash',x,y,19.68,1.23,2.45,0,true);
  for(const x of [-31.8,-22.85])box(iron,x,6.35,p.projectionZ+.19,.075,12.7,.075);
  box(iron,-7.35,6.1,p.wallZ+.19,.08,12.2,.08);
  // Door access is along the shared narrow walk against the stepped facade.
  model.userData.entranceWestPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
