// Churton Ward: six supplied photographs and the yellow satellite outline.
// Single-storey masonry with two long returns and a shorter oblique rear wing.
// Seren Lodge marker registered to the fixed 1829 entrance; units
// and concealed details are visual estimates, not a measured building survey.
export const CHURTON_WARD=Object.freeze({x:-44.3,z:-65.9,rotation:0});

export function churtonPoint(x,y,z){
  const c=Math.cos(CHURTON_WARD.rotation),s=Math.sin(CHURTON_WARD.rotation);
  return [CHURTON_WARD.x+c*x+s*z,y,CHURTON_WARD.z-s*x+c*z];
}
const shot=(position,target,fov=53)=>Object.freeze({position:churtonPoint(...position),target:churtonPoint(...target),fov});
export const CHURTON_VIEWS=Object.freeze({
  churton:shot([-47,31,-49],[1,2,0],48),
  'churton-plan':shot([0,92,.01],[0,0,0],45),
  'churton-1':shot([-9,1.8,37],[-10,3.5,17],57),
  'churton-2':shot([-36,1.8,33],[-7,3.5,8],60),
  'churton-3':shot([37,1.8,28],[9,3.4,1],59),
  'churton-4':shot([29,1.8,-38],[3,3,-9],56),
  'churton-5':shot([-27,1.8,-42],[0,3,-8],56),
  'churton-6':shot([-47,1.8,-39],[-3,3,-2],62)
});

export function createChurtonWard(THREE,{brick,roof,worldUV,material}){
  const ward=new THREE.Group();ward.name='Churton Ward';
  ward.position.set(CHURTON_WARD.x,0,CHURTON_WARD.z);ward.rotation.y=CHURTON_WARD.rotation;
  const red=material(0x8c4837),plinth=material(0x665449),frame=material(0xd4d8cb);
  const glass=material(0x68838a,{roughness:.43,metalness:.15}),dark=material(0x303635);
  const sill=material(0x796657),gravel=material(0x99917b),grass=material(0x667752),hedge=material(0x43583a);
  const batches=new Map(),openings=[],ranges=[];
  function mesh(g,m,x,y,z,name,parent=ward){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function solid(m,x,y,z,w,h,d,name,parent=ward){const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x,y,z,name,parent);o.userData.orientedCollision=true;return o;}
  function box(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});}
  function beam(a,b,width,m=red,parent=ward){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const o=mesh(new THREE.BoxGeometry(width,v.length(),width),m,...p.clone().add(q).multiplyScalar(.5).toArray(),'Brick verge',parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function gable(name,x,z,w,d,eave=5.4,rise=2.6,rotation=0,roofBackExtension=0){
    const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;ward.add(group);
    const wall=solid(brick,0,eave/2,0,w,eave,d,name+' walls',group);wall.userData.orientedCollision=true;
    solid(plinth,0,.21,0,w+.1,.42,d+.1,name+' plinth',group).userData.orientedCollision=true;
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
    mesh(worldUV(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),1.7),brick,0,eave,-d/2,name+' gable infill',group);
    const slope=Math.atan2(rise,w/2),length=Math.hypot(w/2,rise)+.28;
    for(const side of [-1,1]){const o=solid(roof,side*w/4,eave+rise/2,-roofBackExtension/2,length,.15,d+.45+roofBackExtension,name+' slate roof',group);o.rotation.z=-side*slope;solid(dark,side*(w/2+.13),eave-.03,-roofBackExtension/2,.12,.15,d+.6+roofBackExtension,name+' gutter',group);}
    solid(red,0,eave+rise+.09,-roofBackExtension/2,.2,.18,d+.55+roofBackExtension,name+' ridge',group);
    for(const end of (roofBackExtension>0?[1]:[-1,1])){
      solid(red,0,eave-.12,end*(d/2+.03),w,.22,.12,name+' gable brick band',group);
      for(const side of [-1,1])for(const offset of [0,-.24])beam([side*w/2,eave+offset,end*(d/2+.06)],[0,eave+rise+offset,end*(d/2+.06)],.14,red,group);
    }
    ranges.push({name,x,z,w,d,rotation});return group;
  }
  function hip(name,x,z,w,d,eave=5.4,rise=2.2){
    solid(brick,x,eave/2,z,w,eave,d,name+' walls');solid(plinth,x,.2,z,w+.08,.4,d+.08,name+' plinth');
    const a=w/2+.24,b=d/2+.24,inset=Math.min(a,b)*.8;
    const v=[[-a,0,-b],[a,0,-b],[a,0,b],[-a,0,b],... (w>=d?[[-a+inset,rise,0],[a-inset,rise,0]]:[[0,rise,-b+inset],[0,rise,b-inset]])];
    const faces=w>=d?[[0,1,5],[0,5,4],[1,2,5],[2,3,4],[2,4,5],[3,0,4]]:[[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]];
    const positions=[],uv=[];for(const f of faces)for(const i of [...f].reverse()){positions.push(...v[i]);uv.push(v[i][0]/3,(v[i][2]+v[i][1])/3);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();mesh(geometry,roof,x,eave,z,name+' slate roof');
    for(const side of [-1,1]){box(dark,x+side*a,eave-.02,z,.12,.13,d+.6);box(dark,x,eave-.02,z+side*b,w+.6,.13,.12);}
    ranges.push({name,x,z,w,d,rotation:0});
  }
  // Photo 4/5 lawn face is -Z. Photo 1 is the broad gable at +Z.
  // The satellite silhouette has two unequal returns and an oblique middle spur.
  hip('Lawn connecting range',3,-6.1,30,12.2,5.4,2.15);
  gable('Mast-side long ward',-10,2.5,15.5,33,5.4,3.25);
  hip('Church-side return',16.5,-2.4,9.5,23.8,5.4,2.1);
  hip('Church-side lawn bay',17,-14.2,8.5,5.1,5.4,1.7);
  // Corrected diagonal: the rear tip leans toward the church-side return.
  const rearWingAngle=.52;
  // Continue both slate slopes and the ridge beneath the connecting roof.
  // Its rising hip hides the extended end, forming a continuous valley join.
  gable('Rear oblique wing',5.0,6.3,6.7,13.6,5.15,1.7,rearWingAngle,6.4);
  // Small lower room in photo 2, tucked against the long wing's outside wall.
  solid(brick,-18.9,1.75,10.9,3.1,3.5,10.8,'Low side room walls');
  const leanShape=new THREE.Shape();leanShape.moveTo(-1.55,0);leanShape.lineTo(1.55,0);leanShape.lineTo(1.55,1.2);leanShape.closePath();
  mesh(worldUV(new THREE.ExtrudeGeometry(leanShape,{depth:10.8,bevelEnabled:false}),1.7),brick,-18.9,3.5,5.5,'Low side room sloped infill');
  const leanRoof=solid(roof,-18.9,4.1,10.9,Math.hypot(3.1,1.2)+.3,.16,11.3,'Low side room slate roof');leanRoof.rotation.z=Math.atan2(1.2,3.1);
  box(dark,-20.6,3.5,10.9,.12,.14,11.4);
  function opening(face,x,z,rotation=0,w=1.1,h=2.6,y=2.75,door=false){
    const dx=Math.cos(rotation),dz=-Math.sin(rotation),nx=Math.sin(rotation),nz=Math.cos(rotation);
    function part(m,u,v,n,pw,ph,pd){box(m,x+dx*u+nx*n,y+v,z+dz*u+nz*n,pw,ph,pd,rotation);}
    openings.push({face,x,y,z,w,h,rotation,door});
    part(dark,0,0,.015,w+.18,h+.12,.11);part(door?dark:glass,0,0,.09,w,h,.06);
    for(const s of [-1,1]){part(frame,s*w/2,0,.15,.065,h+.08,.09);part(frame,0,s*h/2,.15,w+.09,.07,.09);}
    if(!door){part(frame,0,0,.18,w,.07,.07);for(const s of [-1,1])part(frame,s*w/6,0,.18,.026,h,.04);part(sill,0,-h/2-.11,.18,w+.36,.16,.36);}
    else{part(frame,0,h*.24,.18,w,.07,.08);part(glass,0,h*.36,.13,w-.08,h*.22,.06);part(frame,w*.3,-.1,.22,.04,.2,.05);part(sill,0,-h/2,.25,w+.35,.1,.55);}
    // Splayed red brick heads, with a slightly raised keystone.
    for(let i=-3;i<=3;i++)part(red,i*(w+.18)/7,h/2+.2+(i===0?.07:0),.13,(w+.18)/7-.02,.28+(i===0?.14:0),.18);
    part(dark,0,.28-y,.065,.45,.2,.07);
  }
  // Lawn frontage: hipped entry bay, five sashes, and projecting gabled end.
  for(const x of [-.4,1.7,3.8,5.9,8])opening('lawn range',x,-12.22,Math.PI,1.05,2.55);
  for(const x of [15.1,19])opening('lawn hipped bay',x,-16.77,Math.PI,1.08,2.8);
  opening('lawn gable door',-6.6,-14.02,Math.PI,.95,3.75,2.05,true);
  opening('lawn gable broad sash',-11,-14.02,Math.PI,1.9,2.85,2.65);
  opening('lawn gable side sash',-16,-14.02,Math.PI,.83,2.85);
  // Photo 1: two sashes, a transomed door, then a broader sash.
  for(const [x,w] of [[-14.4,1.2],[-10.9,1.2],[-5.3,1.65]])opening('rear broad gable',x,19.02,0,w,2.65);
  opening('rear broad gable door',-8,19.02,0,1.15,4.05,2.15,true);
  // Photo 2 / 6 long outer elevation, central raised gable and low side room.
  for(const z of [-10.6,-7,3.6,17.1])opening('mast-side long elevation',-17.77,z,-Math.PI/2,1.05,2.8);
  for(const z of [7,10.7,14.5])opening('low side room',-20.47,z,-Math.PI/2,1.05,1.7,2.1);
  // Shallow cross gable gives the long side its photographed central pediment.
  gable('Long elevation cross gable',-16.5,-.8,7.3,3,5.4,2.65,Math.PI/2);
  for(const z of [-2.6,-.8,1])opening('side cross gable',-18.03,z,-Math.PI/2,1.04,2.95);
  // Photo 3: the hipped end and its long side overlook the main estate.
  for(const z of [-11.9,-8.5,-5,-1.5,2,5.6])opening('church-side return',21.27,z,Math.PI/2,1.05,2.65);
  for(const z of [2,4.4,6.7])opening('inner return',11.73,z,-Math.PI/2,.93,2.5);
  for(const x of [13.8,16.5,19.2])opening('hipped rear end',x,9.52,0,1.05,2.7);
  // Windows and a double door follow the oblique return's actual axes.
  const r=rearWingAngle,c=Math.cos(r),s=Math.sin(r);
  function spur(u,v,side,w=1){opening('oblique rear wing',5+c*u+s*v,6.3-s*u+c*v,r+side,w,2.5);}
  spur(-1.55,6.81,0,.95);spur(1.55,6.81,0,.95);
  opening('oblique wing door',5+s*6.82,6.3+c*6.82,r,1.35,3.5,1.95,true);
  for(const v of [1.7,4.7]){spur(3.37,v,Math.PI/2,.9);spur(-3.37,v,-Math.PI/2,.9);}
  // White-sided, dark flat-canopy entrance visible in photos 4, 5 and 6.
  solid(frame,9.3,2.3,-14.6,.3,4.6,4.8,'Pale entrance side wall');
  solid(dark,11.1,4.72,-14.6,4.4,.28,5.1,'Entrance flat canopy');
  solid(glass,11.1,2.2,-17.04,3.2,4.25,.1,'Glazed entrance');
  for(const x of [9.55,11.1,12.65])box(frame,x,2.2,-17.15,.08,4.4,.1);
  for(const y of [.1,1.4,2.7,4.3])box(frame,11.1,y,-17.15,3.2,.07,.1);
  solid(sill,11.1,.08,-17.6,4.5,.16,1.3,'Entrance threshold');
  // Corbelled brick chimney stacks and clay pots punctuate all three roofs.
  for(const [x,z,y,w] of [[-13,-7,8.1,1.1],[-12,12,8.6,1.3],[15,-10,7.1,1.2],[17,3,7.3,1.1],[4,-6,7.4,1.2],[-1,-5,7.5,1.2]]){
    solid(brick,x,y+.4,z,w,3,.85,'Churton chimney shaft');
    for(const [dy,extra] of [[1.6,.2],[1.82,.34],[1.98,.12]])box(red,x,y+dy,z,w+extra,.16,1+extra);
    for(const side of [-1,1]){mesh(new THREE.CylinderGeometry(.16,.19,.48,10),red,x+side*w*.25,y+2.25,z,'Clay chimney pot');mesh(new THREE.CircleGeometry(.12,10),dark,x+side*w*.25,y+2.495,z,'Open chimney pot').rotation.x=-Math.PI/2;}
  }
  for(const [x,z] of [[-17.9,-13.8],[-17.9,18.8],[21.4,9.2],[21.4,-16.5],[-2.1,18.8]])box(dark,x,2.6,z,.09,5.2,.09);
  // Gravel follows the estate's existing period treatment; the lawn and low
  // hedge retain the photographed church-facing setting and open entrances.
  solid(gravel,0,-.015,0,49,.16,44,'Ward perimeter gravel');
  solid(grass,1,.085,-25,44,.1,14,'Church-facing lawn');
  solid(gravel,11.1,.16,-24.7,2.7,.08,15,'Lawn entrance walk');
  for(const [x,w] of [[-6.5,29],[18.3,10]])solid(hedge,x,.52,-32.3,w,1.0,1.0,'Low lawn hedge');
  solid(gravel,1,-.005,-36.5,51,.12,6,'Church-side lane');
  solid(gravel,-25,-.01,-5,6,.12,65,'Mast-side access');
  solid(gravel,0,-.01,25,56,.12,6,'Estate-side access');
  const dummy=new THREE.Object3D();
  for(const [m,items] of batches){const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,items.length);batch.name='Churton window and masonry details';batch.castShadow=true;batch.receiveShadow=true;items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.r,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});ward.add(batch);}
  ward.userData.openings=openings;ward.userData.ranges=ranges;
  return ward;
}
