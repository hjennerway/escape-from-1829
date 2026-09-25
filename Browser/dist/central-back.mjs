// img1.jpg and its red camera mark in Research/1829-back/. The projecting
// rear corners are canted; the concealed east corner reflects the west.
// Footprint depths are photo estimates. The later red roof sketch supplies
// the longitudinal ridge and rear hips; the front apex stays at 17.75.
export const CENTRAL_BACK_OUTLINE=Object.freeze([
  [-8.6,10.4],[-8.6,6.8],[-6.2,4.4],[6.2,4.4],[8.6,6.8],[8.6,10.4]
].map(Object.freeze));
export const CENTRAL_BACK_VIEWS=Object.freeze({
  'central-back-photo':{position:[-18,1.8,-26],target:[-8.4,8.2,6],fov:72},
  'central-back':{position:[-37,31,-57],target:[0,8,6],fov:46}
});

export function addCentralBack(THREE,{model,mesh,worldUV,brick,white,roof,material,details,box}){
  const outline=CENTRAL_BACK_OUTLINE,trim=material(0xcbd4d1),openings=[];
  function prism(name,points,bottom,height,mat){
    const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
    const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1});
    g.rotateX(-Math.PI/2);g.translate(0,bottom,0);
    const body=mesh(worldUV(g,1.7),mat,0,0,0,true);body.name=name;
    body.userData.collisionFootprint=points;
    return body;
  }
  prism('Central back canted masonry',outline,1.4,13.2,brick);
  prism('Central back canted white plinth',outline,0,1.4,white);

  function face(i,t=.5,offset=0){
    const a=outline[i],b=outline[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
    const nx=dz/length,nz=-dx/length;
    return {x:a[0]+dx*t+nx*offset,z:a[1]+dz*t+nz*offset,nx,nz,rotation:Math.atan2(nx,nz)};
  }
  // Mitred profiles keep every pale course continuous across both bevels.
  function offsetLine(distance){
    return outline.map(([x,z],i)=>{
      const a=face(Math.max(0,i-1)),b=face(Math.min(i,outline.length-2));
      const nx=a.nx+b.nx,nz=a.nz+b.nz,scale=distance/(nx*b.nx+nz*b.nz);
      return [x+nx*scale,z+nz*scale];
    });
  }
  function course(name,y,h,out,inside=.08){
    prism(name,[...offsetLine(out),...offsetLine(-inside).reverse()],y-h/2,h,trim);
  }
  for(const y of [3.15,7.1,10.7])course('Central back continuous floor band',y,.24,.17);
  course('Central back lower cornice',14.32,.12,.23);
  course('Central back parapet',14.61,.44,.14,.2);
  course('Central back parapet moulding',14.55,.065,.2);
  course('Central back projecting coping',14.89,.13,.26,.25);

  function window(i,t,y,w,h){
    const p=face(i,t,.065),name='central-back-'+(i===2?'rear':i===1?'west-cant':'east-cant');
    details.sash(name,p.x,y,p.z,p.rotation,w,h);
    openings.push({face:name,...p,y,w,h});
  }
  // Four landing levels on the bevel, with the two upper rear rows visible
  // above the attached two-storey range. Lower rear openings would be buried.
  for(const i of [1,3])for(const [y,h] of [[1.65,2.05],[5.2,2.8],[8.95,2.8],[12.5,2.5]])window(i,.5,y,1.23,h);
  for(const x of [-4,0,4]){
    window(2,(x+6.2)/12.4,12.5,1.15,2.5);
    window(2,(x+6.2)/12.4,9.55,1.15,1.6);
  }
  for(const i of [1,3]){
    const p=face(i,i===1?.08:.92,.17);
    box(details.iron,p.x,7,p.z,.065,14,.065);
  }

  // The red Y in roof-ridges.png runs from the front gable apex along one
  // longitudinal ridge, then divides into the two rear hips. The shallow
  // deck behind the canted parapet remains below these three roof planes.
  const deck=[...offsetLine(.04),[7.5,10.4],[-7.5,10.4]];
  prism('Central back shallow roof',deck,14.57,.08,roof);
  const a=7.5;
  const vertices=[[-a,14.65,10.4],[a,14.65,10.4],[a,14.65,19.56],[-a,14.65,19.56],[0,17.55,13.2],[0,17.75,19.56]];
  const positions=[],uv=[];
  for(const triangle of [[0,1,4],[1,2,5],[1,5,4],[3,0,4],[3,4,5]])for(const index of [...triangle].reverse()){
    const v=vertices[index];positions.push(...v);uv.push(v[0]/3,(v[2]-13.2+v[1]-14.65)/3);
  }
  const cap=new THREE.BufferGeometry();
  cap.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  cap.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));cap.computeVertexNormals();
  mesh(cap,roof,0,0,0,true).name='Reception longitudinal ridge and rear hips';
  // The circled roof junctions match the long, square-ended brick stacks in
  // exterior/1829front2.webp and 1829front3.webp. Their narrow ends face the
  // lawn, with their bases sunk into slate and caps below the front apex.
  for(const side of [-1,1]){
    const name='Reception '+(side<0?'west':'east')+' chimney';
    const x=side*7.05,z=14.1;
    mesh(worldUV(new THREE.BoxGeometry(.72,3,4.6),1.7),brick,x,15.6,z,true).name=name+' stack';
    mesh(worldUV(new THREE.BoxGeometry(.8,.14,4.68),1.7),brick,x,16.95,z,true).name=name+' corbel';
    mesh(worldUV(new THREE.BoxGeometry(.88,.16,4.76),1.7),brick,x,17.18,z,true).name=name+' cap';
  }
  // The original heraldic face is a one-sided triangle. A closed masonry
  // backing meets the slate at the gable, making it opaque from the rear.
  const gableShape=new THREE.Shape([new THREE.Vector2(-7.5,0),new THREE.Vector2(7.5,0),new THREE.Vector2(0,3.1)]);
  const gable=new THREE.ExtrudeGeometry(gableShape,{depth:.14,bevelEnabled:false,steps:1});
  mesh(worldUV(gable,1.7),brick,0,14.65,19.56,true).name='Reception solid pediment backing';
  model.userData.centralBackOpenings=openings;
}
