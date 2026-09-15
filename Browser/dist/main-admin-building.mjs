// Main/admin building — OS footprint and four supplied exterior photographs.
// The map is registered to Reception; +X is east and +Z is south/front.
// Map pixels, photograph-derived heights and concealed elevations are estimates.
export const ADMIN_OS_REGISTRATION=Object.freeze({u:62,v:37,x:0,z:13,scaleX:1.5,scaleZ:1.6});
export function adminMapPoint(u,v){const r=ADMIN_OS_REGISTRATION;return [r.x+(u-r.u)*r.scaleX,r.z+(v-r.v)*r.scaleZ];}
const origin=adminMapPoint(194,44);
export const MAIN_ADMIN=Object.freeze({x:origin[0],z:origin[1]});
const point=(x,y,z)=>[MAIN_ADMIN.x+x,y,MAIN_ADMIN.z+z];
const shot=(position,target,fov=55)=>Object.freeze({position:point(...position),target:point(...target),fov});
export const MAIN_ADMIN_VIEWS=Object.freeze({
  'main-admin':shot([-74,47,92],[0,6,0],49),
  'main-admin-plan':shot([-108,340,.01],[-108,0,0],52),
  'main-admin-1':shot([-5,1.8,55],[7,7,10],59),
  'main-admin-2':shot([29,10,22],[-15,7,9],68),
  'main-admin-3':shot([-68,1.8,34],[-8,7,3],56),
  'main-admin-4':shot([-62,1.8,52],[0,7,4],53),
  // chimney/img1-loc.png: southeast lawn, looking northwest along the east side.
  'main-admin-east':shot([74,1.8,55],[24,8,-19],57)
});
export const ADMIN_OS_RANGES=Object.freeze([
  {name:'Central administration range',rect:[175,40,213,51],height:14.1,rise:3.3},
  {name:'West projecting pavilion',rect:[169,33,178,53],height:14.1,rise:3.8},
  {name:'East projecting pavilion',rect:[208,39,217,54],height:14.1,rise:3.8},
  // new-shape.png: outer five-eighths projects beyond the recessed connection.
  {name:'Low west side rooms',rect:[160,40,165.625,50],height:4.5,rise:1.65},
  {name:'Recessed low west connection',rect:[165.625,40,169,48],height:4.2,rise:.6},
  // chimney/img1.jpg adds the previously unseen low east rooms.
  {name:'Low east side room',rect:[220,41,227,48.5],height:4.8,rise:2.0},
  {name:'Recessed low east connection',rect:[217,41,220,46.5],height:4.2,rise:.7}
]);

export function createMainAdminBuilding(THREE,{brick,roof,worldUV,material}){
  const building=new THREE.Group();building.name='Main/admin building';building.position.set(MAIN_ADMIN.x,0,MAIN_ADMIN.z);
  const corridor=new THREE.Group();corridor.name='1829 to Main/admin connecting corridor';
  corridor.userData.separateStructure=true;
  const stone=material(0xb5ae99),pale=material(0xd4ceba),dark=material(0x343c3b),frame=material(0xe0e0d3);
  const glass=material(0x799193,{roughness:.46,metalness:.16}),door=material(0x53352c),red=material(0x895040);
  const gravel=material(0x99917b),grass=material(0x667752),batches=new Map(),openings=[],ranges=[];
  function mesh(g,m,x,y,z,name,parent=building){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function solid(m,x,y,z,w,h,d,name,parent=building){return mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x,y,z,name,parent);}
  function box(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});}
  function prism(m,x,y,z,points,h,name){
    const shape=new THREE.Shape();points.forEach(([px,pz],i)=>i?shape.lineTo(px,-pz):shape.moveTo(px,-pz));shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);
    const o=mesh(worldUV(g,1.7),m,x,y,z,name);o.userData.collisionFootprint=points;return o;
  }
  function hip(x,z,w,d,y,rise,name,parent=building){
    const a=w/2+.22,b=d/2+.22,inset=Math.min(a,b)*.9;
    const v=[[-a,0,-b],[a,0,-b],[a,0,b],[-a,0,b],...(w>=d?[[-a+inset,rise,0],[a-inset,rise,0]]:[[0,rise,-b+inset],[0,rise,b-inset]])];
    const faces=w>=d?[[0,1,5],[0,5,4],[1,2,5],[2,3,4],[2,4,5],[3,0,4]]:[[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]];
    const positions=[],uv=[];for(const f of faces)for(const i of [...f].reverse()){positions.push(...v[i]);uv.push(v[i][0]/2.8,(v[i][2]+v[i][1])/2.8);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
    mesh(g,roof,x,y,z,name+' slate roof',parent);
    solid(red,x,y+rise+.04,z,w>=d?w-2*inset:.18,.13,w>=d?.18:d-2*inset,name+' ridge',parent);
  }
  function range(spec){
    const [u0,v0,u1,v1]=spec.rect,a=adminMapPoint(u0,v0),b=adminMapPoint(u1,v1);
    const x=(a[0]+b[0])/2-MAIN_ADMIN.x,z=(a[1]+b[1])/2-MAIN_ADMIN.z,w=b[0]-a[0],d=b[1]-a[1],h=spec.height;
    solid(brick,x,h/2,z,w,h,d,spec.name+' walls');solid(stone,x,.2,z,w+.12,.4,d+.12,spec.name+' plinth');
    for(const y of h>5?[4.65,9.4,13.9]:[h-.2])solid(y===13.9?pale:stone,x,y,z,w+.16,.17,d+.16,spec.name+' stone course');
    solid(pale,x,h+.06,z,w+.38,.22,d+.38,spec.name+' eaves');hip(x,z,w,d,h+.18,spec.rise,spec.name);
    ranges.push({...spec,x,z,w,d});return {x,z,w,d,h};
  }
  const [core,west,east,low,lowLink,eastLow,eastLink]=ADMIN_OS_RANGES.map(range);
  function sash(face,x,y,z,w=1.4,h=2.8,r=0){
    const dx=Math.cos(r),dz=-Math.sin(r),nx=Math.sin(r),nz=Math.cos(r);
    const part=(m,u,v,n,pw,ph,pd)=>box(m,x+dx*u+nx*n,y+v,z+dz*u+nz*n,pw,ph,pd,r);
    openings.push({face,x,y,z,w,h,rotation:r});
    part(dark,0,0,.025,w+.16,h+.12,.10);part(glass,0,0,.09,w,h,.06);
    for(const s of [-1,1]){part(frame,s*w/2,0,.14,.065,h+.1,.08);part(frame,0,s*h/2,.14,w+.09,.07,.08);}
    part(frame,0,0,.16,w,.065,.07);
    // Slender glazing bars keep the established circa-1900 treatment.
    for(const s of [-1,1])part(frame,s*w/6,0,.16,.022,h,.04);
    part(pale,0,-h/2-.11,.12,w+.34,.16,.32);
    part(pale,0,h/2+.18,.10,w+.38,.30,.22);
  }
  const levels=[{y:2.25,h:3.0},{y:7.05,h:3.05},{y:11.75,h:2.55}];
  const front=core.z+core.d/2+.025;
  // Six flanking sashes and three close central lights under the pediment.
  for(const {y,h} of levels){
    for(const x of [-19,-12,12,19])sash('principal frontage',x,y,front,1.45,h);
    if(y>3)for(const x of [-2.15,0,2.15])sash('central grouped windows',x,y,front,1.3,h);
  }
  for(const end of [west,east]){
    const z=end.z+end.d/2;
    // front.png: two storeys with 45-degree chamfers, below the square top floor.
    const outline=[[-4.05,0],[4.05,0],[4.05,.3],[2.35,2],[-2.35,2],[-4.05,.3]];
    prism(brick,end.x,0,z,outline,9.44,'Chamfered two-storey bay walls');
    const trim=outline.map(([x,z])=>[x*1.045,1+(z-1)*1.10]);
    for(const y of [.3,4.65,9.4])prism(stone,end.x,y-.1,z,trim,.20,'Chamfered bay stone course');
    prism(dark,end.x,9.515,z,trim,.13,'Chamfered bay lead roof');
    for(const {y,h} of levels){
      if(y>9){for(const dx of [-1.8,1.8])sash('pavilion front',end.x+dx,y,z+.025,1.65,h);continue;}
      for(const dx of [-1.15,1.15])sash('bay flat front',end.x+dx,y,z+2.025,1.45,h);
      for(const side of [-1,1]){
        const rotation=side*Math.PI/4,nx=Math.sin(rotation),nz=Math.cos(rotation);
        sash('bay chamfer',end.x+side*3.2+nx*.025,y,z+1.15+nz*.025,1.05,h,rotation);
        // Jambs sit on the slanted faces rather than spanning the cut corners.
        for(const u of [-.73,.73])box(pale,end.x+side*3.2+Math.cos(rotation)*u+nx*.13,y,z+1.15-Math.sin(rotation)*u+nz*.13,.19,h+.45,.18,rotation);
      }
    }
  }
  // The east wall now follows chimney/img1.jpg; rear schedules remain inferred.
  for(const {y,h} of levels){
    for(const z of [-13,-8,-3])if(y>5||z===-8)sash('west return',west.x-west.w/2-.025,y,z,1.35,h,-Math.PI/2);
    if(y>5)sash('east photo upper column',east.x+east.w/2+.025,y,4.5,1.35,h,Math.PI/2);
    else for(const z of [12,-6.4])sash('east photo ground',east.x+east.w/2+.025,y,z,1.55,h,Math.PI/2);
    for(const x of [-20,-13,-6,1,8,15])sash('rear inferred',x,y,core.z-core.d/2-.025,1.35,h,Math.PI);
    for(const x of [west.x-2.6,west.x+2.6])sash('west rear inferred',x,y,west.z-west.d/2-.025,1.4,h,Math.PI);
    for(const x of [east.x-2.6,east.x+2.6])sash('east rear inferred',x,y,east.z-east.d/2-.025,1.4,h,Math.PI);
  }
  for(const dx of [-2.55,0,2.55])sash('low west frontage',low.x+dx,2.15,low.z+low.d/2+.025,1.45,2.9);
  sash('recessed low connection',lowLink.x,2.05,lowLink.z+lowLink.d/2+.025,1.4,2.7);
  sash('low west stepped return',low.x+low.w/2+.025,2.05,low.z+low.d/2-1.6,1.1,2.7,Math.PI/2);
  for(const z of [low.z-4.6,low.z,low.z+4.6])sash('low west end',low.x-low.w/2-.025,2.15,z,1.3,2.9,-Math.PI/2);
  // East low room: three tall end sashes, pale heads, low brick plinth and
  // a recessed connection. Front/east elevations are visible in the new photo.
  for(const dz of [-3.8,0,3.8])sash('east low end',eastLow.x+eastLow.w/2+.025,2.5,eastLow.z+dz,1.35,2.8,Math.PI/2);
  for(const dx of [-2.7,2.7])sash('east low south',eastLow.x+dx,2.5,eastLow.z+eastLow.d/2+.025,1.35,2.8);
  sash('east recessed connection',eastLink.x,2.25,eastLink.z+eastLink.d/2+.025,1.4,2.7);
  solid(red,eastLow.x,.43,eastLow.z,eastLow.w+.12,.58,eastLow.d+.12,'East low exposed brick base');
  for(const z of [eastLow.z-eastLow.d/2+.15,eastLow.z+eastLow.d/2-.15])box(dark,eastLow.x+eastLow.w/2+.1,2.35,z,.085,4.7,.085);
  // Shallow external flue piers line up with the two edge chimney stacks.
  for(const z of [10,-1]){
    solid(brick,east.x+east.w/2+.12,7,z,.24,14,2.6,'East elevation chimney breast');
    box(dark,east.x+east.w/2+.29,6.9,z-1.45,.085,13.8,.085);
    for(const y of [4.65,9.4])box(stone,east.x+east.w/2+.27,y,z,.16,.17,2.72);
  }
  // Stone portico: four columns, layered entablature and ball finials.
  solid(dark,0,2.15,front+.055,2.5,4.3,.12,'Recessed main entrance');
  solid(door,0,1.88,front+.16,2.12,3.7,.1,'Timber double entrance door');
  for(const x of [-.53,.53])for(const y of [.65,1.7,2.8])box(red,x,y,front+.23,.77,.75,.065);
  box(glass,0,3.95,front+.18,2.1,.45,.08);box(pale,0,3.72,front+.26,2.2,.1,.1);
  for(const x of [-.13,.13])box(pale,x,1.85,front+.3,.045,.26,.06);
  for(const x of [-3.5,-2.65,2.65,3.5]){
    solid(stone,x,.65,front+2.0,.68,1.3,.68,'Portico column pedestal');
    mesh(new THREE.CylinderGeometry(.24,.30,3.0,12),pale,x,2.7,front+2.0,'Portico stone column');
    for(const y of [1.25,4.2,4.42])box(stone,x,y,front+2.0,.78,.2,.78);
  }
  for(const [y,w,h,d] of [[4.5,8.1,.28,2.9],[4.85,8.5,.42,3.1],[5.13,8.8,.16,3.3]])solid(stone,0,y,front+1.3,w,h,d,'Portico entablature');
  for(const x of [-3.7,-1.25,1.25,3.7]){
    box(stone,x,5.4,front+2.3,.48,.43,.48);
    mesh(new THREE.SphereGeometry(.30,10,8),stone,x,5.85,front+2.3,'Portico ball finial');
  }
  for(let i=0;i<3;i++)solid(stone,0,.08+i*.09,front+2.3-i*.5,7.7,.16+i*.18,2.0,'Entrance step');
  // Triangular central pediment and a modest sculpted crest, approximated from photo 4.
  const triangle=new THREE.Shape();triangle.moveTo(-4.4,0);triangle.lineTo(4.4,0);triangle.lineTo(0,3.4);triangle.closePath();
  mesh(new THREE.ExtrudeGeometry(triangle,{depth:.35,bevelEnabled:false}),stone,0,14.24,front+.15,'Central stone pediment');
  for(const side of [-1,1]){
    const a=new THREE.Vector3(side*4.65,14.22,front+.47),b=new THREE.Vector3(0,17.82,front+.47),v=b.clone().sub(a);
    const o=mesh(new THREE.BoxGeometry(.26,v.length(),.5),pale,...a.add(b).multiplyScalar(.5).toArray(),'Pediment raking cornice');o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
  }
  mesh(new THREE.SphereGeometry(.64,12,10),pale,0,15.35,front+.59,'Pediment crest shield').scale.set(.8,1.15,.24);
  for(const side of [-1,1])for(let i=0;i<4;i++)mesh(new THREE.SphereGeometry(.19,8,6),stone,side*(.6+i*.12),15.65-i*.27,front+.55,'Pediment carved foliage');
  // Broad, tall chimney stacks are a defining feature in all four photographs.
  for(const [x,z,w,d,top] of [[west.x-5.3,7,2.9,2.2,21.3],[west.x+2,-3,2.3,1.6,20.6],[-21,3,2.5,1.5,21.7],[-9,3,2.5,1.55,21.5],[0,2,2.6,1.55,22],[12,3,2.5,1.55,21.3],[east.x+east.w/2-1.05,10,2.65,3.2,21.9],[east.x+east.w/2-1.05,-1,2.65,3.2,21.5]]){
    solid(brick,x,(top+14.1)/2,z,w,top-14.1,d,'Tall admin chimney stack');
    for(const [offset,extra] of [[-.42,.12],[-.17,.28],[0,.18]])box(offset===0?dark:red,x,top+offset,z,w+extra,.17,d+extra);
  }
  for(const x of [-23,-9,9,23])box(dark,x,7,front+.24,.08,13.8,.09);
  for(const p of [west,east])for(const side of [-1,1])box(dark,p.x+side*(p.w/2-.2),7,p.z+p.d/2+.12,.09,13.8,.09);
  // Empty gravel carriage approach and curved lawn, consistent with the estate.
  solid(gravel,-4,-.015,22,91,.14,17,'Admin carriage approach');
  const lawn=mesh(new THREE.CylinderGeometry(1,1,.12,64),grass,0,.10,35,'Admin forecourt lawn');lawn.scale.set(29,1,11);
  const edging=mesh(new THREE.TorusGeometry(1,.009,6,64),stone,0,.18,35,'Curved lawn stone edging');edging.rotation.x=Math.PI/2;edging.scale.set(29,11,1);
  solid(gravel,-53,-.015,4,7,.13,51,'West side access');
  // The photo's curved carriage approach and the lane turning behind the
  // east wing use gravel, retaining the established period grounds treatment.
  function lane(points,width,name){
    const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x-MAIN_ADMIN.x,0,z-MAIN_ADMIN.z)));
    function strip(offset,w,y,h,mat,label){
      const pos=[],indices=[];
      for(let i=0;i<=48;i++){
        const p=curve.getPoint(i/48),t=curve.getTangent(i/48),n=new THREE.Vector3(-t.z,0,t.x).normalize();
        for(const side of [-1,1]){const q=p.clone().addScaledVector(n,offset+side*w/2);pos.push(q.x,y,q.z);}
        if(i<48){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();
      mesh(g,mat,0,h,0,label);
    }
    strip(0,width,.13,0,gravel,name);
    for(const side of [-1,1])strip(side*(width/2+.08),.24,.18,0,stone,name+' stone kerb');
  }
  lane([[230,46],[244,47],[257,54],[267,67],[275,87]],8,'East curved carriage drive');
  lane([[260,58],[257,44],[254,28],[254,8],[250,-13]],6.5,'East wing side access');
  // The black OS link is intentionally an independent, simple one-storey model.
  const start=94.65,end=adminMapPoint(169,35)[0],cz=adminMapPoint(148,35)[1];
  solid(brick,(start+end)/2,1.8,cz,end-start,3.6,6.4,'Connecting corridor walls',corridor);
  solid(stone,(start+end)/2,3.58,cz,end-start+.15,.18,6.55,'Connecting corridor eaves',corridor);
  hip((start+end)/2,cz,end-start,6.4,3.72,1.15,'Connecting corridor',corridor);
  corridor.userData.footprint={minX:start,maxX:end,minZ:cz-3.2,maxZ:cz+3.2};
  const dummy=new THREE.Object3D();
  for(const [m,items] of batches){const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,items.length);batch.name='Admin sash and masonry details';batch.userData.orientedCollision=true;batch.castShadow=true;batch.receiveShadow=true;items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.r,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});building.add(batch);}
  building.userData.openings=openings;building.userData.ranges=ranges;
  building.userData.reference='OS footprint and img1–4; chamfered bays and stepped low west rooms refined from main_refine/front.png and new-shape.png. East side and low wing follow chimney/img1.jpg; rear details inferred.';
  return {building,corridor};
}
