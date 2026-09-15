// The annexe, registered against the original OS extract (417 x 433).
// Similarity registration: 1829 Reception and chapel stay fixed. Pixel picks,
// heights and concealed elevations are estimates; this is not a measured survey.
export const ANNEXE_OS_REGISTRATION=Object.freeze({
 reception:{pixel:[285,308],world:[0,13]},chapel:{pixel:[215,351],world:[-6,-120]},
 redesmere:{pixel:[242,265],world:[94.5,-14]}
});
const a=-5299/6749,b=-9568/6749;
export const ANNEXE_MAP_SCALE=Math.hypot(a,b);
export function annexeMapPoint(u,v){return [a*(u-285)+b*(v-308),13-b*(u-285)+a*(v-308)];}
const origin=annexeMapPoint(138,83),c=Math.cos(Math.PI/12),s=Math.sin(Math.PI/12);
export const ANNEXE=Object.freeze({x:origin[0],z:origin[1],rotation:Math.atan2(b*c-a*s,a*c+b*s)});
export function annexePoint(x,y,z){const c=Math.cos(ANNEXE.rotation),s=Math.sin(ANNEXE.rotation);return [ANNEXE.x+c*x+s*z,y,ANNEXE.z-s*x+c*z];}
const shot=(p,t,fov=55)=>Object.freeze({position:annexePoint(...p),target:annexePoint(...t),fov});
const north=annexeMapPoint(138,82),south=[ANNEXE.x+(ANNEXE.x-north[0])*.01,ANNEXE.z+(ANNEXE.z-north[1])*.01],site=annexeMapPoint(205,203);
export const ANNEXE_VIEWS=Object.freeze({
 annexe:shot([-150,135,215],[0,3,-10],56),
 'annexe-front':shot([0,1.8,120],[0,9,14],48),
 'annexe-front-right':shot([10,1.8,108],[3,9,14],48),
 'annexe-img1':shot([28,1.8,124],[4,9,14],52),
 'annexe-side':shot([-57,2.5,-12],[-18,10,-3],63),
 'annexe-side-right':shot([57,2.5,-12],[18,10,-3],63),
 'annexe-ground':shot([0,1.8,89],[0,8,14],61),
 'annexe-plan':{position:[south[0],360,south[1]],target:[ANNEXE.x,0,ANNEXE.z],fov:52},
 'annexe-site':{position:[site[0]+(ANNEXE.x-north[0])*.01,680,site[1]+(ANNEXE.z-north[1])*.01],target:[site[0],0,site[1]],fov:59}
});
// The rear east L turns approximately 22 degrees counter-clockwise on the OS
// plan. Both ranges rotate about their junction with the central spine.
export const ANNEXE_REAR_EAST=Object.freeze({angle:22*Math.PI/180,pivot:[4,-28.5]});
// Black masonry, expressed as rectangles in the OS building's 15-degree axes.
// Front ward courts and rear courts remain open to the sky.
// Only the central pavilions retain three storeys; outer wards have two.
export const ANNEXE_RANGES=Object.freeze([
 {name:'Central hall',rect:[-11,-6,11,10],h:7.4,rise:8.0,custom:true},
 {name:'Entrance range',rect:[-9,10,9,15],h:4.7,rise:2.5,custom:true},
 ...[-1,1].flatMap(side=>{
  const mirror=r=>side<0?[-r[2],r[1],-r[0],r[3]]:r,label=side<0?'West':'East';
  return [
   {name:label+' front pavilion',rect:mirror([11,4,20,17]),h:13.2,rise:3.3,custom:true},
   {name:label+' square tower',rect:mirror([12,-5,18,2]),h:20.8,rise:3.1,custom:true},
   {name:label+' front connecting ward',rect:mirror([20,5,70,11]),h:8.4,rise:2.6},
   {name:label+' court inner return',rect:mirror([27,11,32,25]),h:8.4,rise:2},
   {name:label+' court front range',rect:mirror([27,23,51,29]),h:8.4,rise:2.3},
   {name:label+' court outer return',rect:mirror([46,11,51,25]),h:8.4,rise:2},
   // A solid corner projects into each void, leaving an L-shaped court.
   {name:label+' court corner infill',rect:mirror([39,17,46,23]),h:8.4,rise:2}
  ];
 }),
 {name:'West end ward',rect:[-77,-11,-70,12],h:8.4,rise:2.6},
 {name:'West rear pavilion',rect:[-77,-19,-63,-12],h:8.4,rise:2.8},
 {name:'West rear link',rect:[-67,-16,-63,5],h:4.3,rise:1.3},
 {name:'West end projecting rooms',rect:[-82,-3,-75,8],h:8.4,rise:2.1},
 {name:'East end ward',rect:[70,-12,77,12],h:8.4,rise:2.6},
 {name:'East rear pavilion',rect:[65,-22,81,-16],h:8.4,rise:2.8},
 {name:'East rear link',rect:[64,-17,68,5],h:4.3,rise:1.3},
 {name:'East end projecting rooms',rect:[76,-2,84,6],h:8.4,rise:2.1},
 {name:'Central rear spine',rect:[-5,-32,5,-5],h:8.4,rise:2.6},
 {name:'Rear west angled service range',rect:[-13,-48,-5,-29],h:8.4,rise:2.4,angle:.28},
 {name:'Rear service head',rect:[-18,-49,-5,-42],h:8.4,rise:2.5},
 {name:'Rear east connecting range',rect:[4,-31,34,-26],h:8.4,rise:2.2,section:'rear-east'},
 {name:'Rear east end pavilion',rect:[30,-42,37,-26],h:8.4,rise:2.8,section:'rear-east'}
]);
export function createAnnexe(THREE,{brick,roof,material,worldUV,hipRoof}){
 const model=new THREE.Group();model.name='The annexe';model.position.set(ANNEXE.x,0,ANNEXE.z);model.rotation.y=ANNEXE.rotation;
 const red=material(0x9d4935),blue=material(0x285575),frame=material(0xe0e3da),glass=material(0x536c75,{roughness:.48,metalness:.15});
 const dark=material(0x202927),stone=material(0x9e9683),lead=material(0x8c999b),road=material(0x96968a);
 const batches=new Map(),ranges=[],openings=[];
 function mesh(g,m,x,y,z,name){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;model.add(o);return o;}
 function solid(m,x,y,z,w,h,d,name,r=0){const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x,y,z,name);o.rotation.y=r;o.userData.orientedCollision=true;return o;}
 function box(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});}
 function beam(p,q,width,m,name){const a=new THREE.Vector3(...p),b=new THREE.Vector3(...q),v=b.clone().sub(a);const o=mesh(new THREE.CylinderGeometry(width/2,width/2,v.length(),6),m,...a.add(b).multiplyScalar(.5).toArray(),name);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function hip(x,z,w,d,y,rise,name,r=0){const o=hipRoof(x,z,w,d,y,rise);model.add(o);o.rotation.y=r;o.name=name+' slate roof';return o;}
 function position(b,u,n){const c=Math.cos(b.r),s=Math.sin(b.r);return [b.x+c*u+s*n,b.z-s*u+c*n];}
 function occupied(x,y,z,self){return ranges.some(b=>{if(b===self||y>b.h)return false;const dx=x-b.x,dz=z-b.z,c=Math.cos(b.r),s=Math.sin(b.r);return Math.abs(c*dx-s*dz)<b.w/2+.05&&Math.abs(s*dx+c*dz)<b.d/2+.05;});}
 function sash(name,x,y,z,w=1.35,h=2.75,r=0,arched=false){
  openings.push({name,x,y,z,w,h,rotation:r,arched});
  const c=Math.cos(r),s=Math.sin(r),part=(m,u,v,n,pw,ph,pd)=>box(m,x+c*u+s*n,y+v,z-s*u+c*n,pw,ph,pd,r);
  const radius=w/2,shoulder=h/2-(arched?radius:0);
  if(arched){
   const shape=new THREE.Shape();shape.moveTo(-radius,-h/2);shape.lineTo(radius,-h/2);shape.lineTo(radius,shoulder);shape.absarc(0,shoulder,radius,0,Math.PI,false);shape.closePath();
   const o=mesh(new THREE.ShapeGeometry(shape),glass,x+s*.10,y,z+c*.10,name+' arched glazing');o.rotation.y=r;
   const points=[];for(let i=0;i<=24;i++){const t=Math.PI*i/24;points.push(new THREE.Vector3(x+c*radius*Math.cos(t)+s*.18,y+shoulder+radius*Math.sin(t),z-s*radius*Math.cos(t)+c*.18));}
   mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.045,5,false),frame,0,0,0,name+' arched frame');
  }else part(glass,0,0,.10,w,h,.07);
  for(const side of [-1,1])part(frame,side*w/2,(-h/2+shoulder)/2,.16,.075,shoulder+h/2,.09);
  part(frame,0,-h/2,.17,w+.1,.085,.1);
  if(!arched)part(frame,0,h/2,.17,w+.1,.085,.1);
  for(const u of [-w/6,w/6]){const top=arched?shoulder+Math.sqrt(radius*radius-u*u):h/2;part(frame,u,(top-h/2)/2,.18,.035,top+h/2,.06);}
  for(let v=-h/2+.46;v<shoulder+.01;v+=.46)part(frame,0,v,.18,w,.035,.07);
  part(frame,0,0,.18,w,.065,.07);part(stone,0,-h/2-.10,.13,w+.28,.14,.26);
  if(!arched)part(red,0,h/2+.13,.07,w+.32,.25,.17);
 }
 function gable(name,x,z,w,base,rise,depth=1.2){
  const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,rise);sh.closePath();
  mesh(worldUV(new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:false}),1.7),brick,x,base,z-depth,name+' brick gable');
  for(const side of [-1,1]){
   const slope=Math.atan2(rise,w/2),o=solid(roof,x+side*w/4,base+rise/2,z-depth/2,Math.hypot(w/2,rise)+.4,.16,depth+.4,name+' slate roof');o.rotation.z=-side*slope;
   for(const dy of [0,-.25])beam([x+side*(w/2+.1),base+dy,z+.17],[x,base+rise+dy,z+.17],.18,red,name+' terracotta verge');
  }
  box(red,x,base-.14,z+.05,w+.25,.25,.26);
 }
 for(const spec of ANNEXE_RANGES){
  const [x0,z0,x1,z1]=spec.rect.map(v=>v*ANNEXE_MAP_SCALE),b={...spec,x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0,r:spec.angle??0};
  if(spec.section==='rear-east'){
   const {angle,pivot}=ANNEXE_REAR_EAST,px=pivot[0]*ANNEXE_MAP_SCALE,pz=pivot[1]*ANNEXE_MAP_SCALE,dx=b.x-px,dz=b.z-pz;
   b.x=px+Math.cos(angle)*dx+Math.sin(angle)*dz;b.z=pz-Math.sin(angle)*dx+Math.cos(angle)*dz;b.r+=angle;
  }
  ranges.push(b);
  solid(brick,b.x,b.h/2,b.z,b.w,b.h,b.d,b.name+' brick walls',b.r);
  box(red,b.x,.25,b.z,b.w+.13,.5,b.d+.13,b.r);
  for(const y of [4.35,8.65,12.6])if(y<b.h)box(red,b.x,y,b.z,b.w+.16,.32,b.d+.16,b.r);
  box(red,b.x,b.h-.22,b.z,b.w+.18,.35,b.d+.18,b.r);
  hip(b.x,b.z,b.w,b.d,b.h,b.rise,b.name,b.r);
  for(const side of [-1,1]){
   const p=position(b,0,side*(b.d/2+.25));box(blue,p[0],b.h+.02,p[1],b.w+.7,.14,.16,b.r);
   const q=position(b,side*(b.w/2+.25),0);box(blue,q[0],b.h+.02,q[1],.16,.14,b.d+.7,b.r);
  }
 }
 for(const b of ranges){
  for(const face of ['long','end'])for(const side of [-1,1]){
   const span=face==='long'?b.w:b.d,count=Math.max(1,Math.floor((span-1.5)/3.8));
   for(let i=0;i<count;i++){
    const u=(i-(count-1)/2)*3.8,[x,z]=face==='long'?position(b,u,side*(b.d/2+.035)):position(b,side*(b.w/2+.035),u);
    const r=b.r+(face==='long'?(side<0?Math.PI:0):side*Math.PI/2);
    for(const y of b.h>11?[2.15,6.5,10.7]:b.h>7?[2.15,6.5]:[2.15]){
     if(b.custom&&(face==='long'&&side>0||b.name.includes('tower')))continue;
     if([-.8,0,.8].some(u=>occupied(x+Math.cos(r)*u+Math.sin(r)*.3,y,z-Math.sin(r)*u+Math.cos(r)*.3,b)))continue;
     sash(b.name,x,y,z,1.35,y>10?2.5:2.8,r);
    }
   }
  }
  for(const side of [-1,1]){const [x,z]=position(b,side*(b.w/2-.4),b.d/2+.32);if(!occupied(x,b.h/2,z,b))box(blue,x,b.h/2,z,.105,b.h,.105);}
 }
 const hall=ranges[0],entrance=ranges[1],front=hall.z+hall.d/2+.04,entryZ=entrance.z+entrance.d/2+.05;
 // Three round-headed, pedimented dormers above the low entrance roof.
 for(const x of [-11,0,11]){
  solid(brick,x,9.1,front+.35,5.1,4.0,2,'Hall dormer cheek');
  sash('Hall dormer',x,9.1,front+1.39,2.25,3.4,0,true);gable('Hall dormer',x,front+1.4,5.7,11.1,2,4);
 }
 for(const x of [-8,8])sash('Entrance range',x,2.5,entryZ,1.65,2.9);
 // Rusticated jambs and a real arch frame the recessed double door.
 const portalZ=entryZ+.9;
 for(const side of [-1,1])for(let i=0;i<9;i++)solid(i%3===0?stone:red,side*1.85,.25+i*.45,portalZ,.75,.43,1.55,'Portal rusticated jamb');
 const arch=new THREE.Shape();arch.absarc(0,3.45,2.25,0,Math.PI,false);arch.lineTo(-1.45,3.45);arch.absarc(0,3.45,1.45,Math.PI,0,true);arch.closePath();
 mesh(new THREE.ExtrudeGeometry(arch,{depth:1.55,bevelEnabled:false}),red,0,0,portalZ-.77,'Entrance terracotta arch');
 solid(dark,0,1.8,entryZ+.1,2.85,3.6,.15,'Entrance recessed double door');
 for(const x of [-.72,.72])for(const y of [.65,1.7,2.8])box(blue,x,y,entryZ+.2,1.12,.77,.06);
 gable('Entrance pediment',0,portalZ+.8,6.3,5.5,2.55,2.5);
 solid(red,0,5.35,portalZ,5.5,.5,1.6,'Entrance pediment base');
 for(let i=0;i<3;i++)solid(stone,0,.08+i*.08,portalZ+1.15-i*.3,5.3,.16+i*.16,1.2,'Entrance step');
 for(const side of [-1,1]){
  const label=side<0?'West':'East',p=ranges.find(b=>b.name===label+' front pavilion'),t=ranges.find(b=>b.name===label+' square tower'),z=p.z+p.d/2+.05;
  gable(label+' front pavilion',p.x,z+.15,p.w+.25,12.9,3.2,5.5);
  sash(label+' pavilion arched window',p.x,11.65,z+.2,1.8,3.1,0,true);
  sash(label+' pavilion sash',p.x,6.55,z,1.5,2.85);
  for(const dx of [-1.8,1.8])sash(label+' entrance side light',p.x+dx,2.35,z,1,3);
  solid(blue,p.x,1.65,z+.13,1.35,3.3,.16,label+' pavilion door');
  for(const dx of [-1.1,1.1])box(red,p.x+dx,2.15,z+.27,.45,4.3,.4);
  box(red,p.x,4.3,z+.3,3.1,.48,.5);
  for(const face of [-1,1]){
   sash(label+' tower high sash',t.x+face*2.1,18.4,t.z+t.d/2+.06,1.05,1.75);
   sash(label+' tower side sash',t.x+face*(t.w/2+.04),10.5,t.z,1.45,3.1,face*Math.PI/2);
  }
  for(const side of [-1,1]){
   sash(label+' tower upper side light',t.x+side*(t.w/2+.04),18.4,t.z,1.15,1.8,side*Math.PI/2);
   sash(label+' tower lower side sash',t.x+side*(t.w/2+.04),6.4,t.z,1.5,2.9,side*Math.PI/2);
  }
  for(let i=-3;i<=3;i++)for(const side of [-1,1])box(red,t.x+i*1.25,20.3,t.z+side*(t.d/2+.12),.24,.72,.28);
  beam([t.x-1.1,24.35,t.z],[t.x+1.1,24.35,t.z],.12,lead,'Tower ridge crest');
  for(const dx of [-1.05,0,1.05])beam([t.x+dx,23.9,t.z],[t.x+dx,24.7,t.z],.12,lead,'Tower crest finial');
 }
 // Open octagonal belfry, crossed base, visible bell and domed metal cap.
 const bellY=hall.h+hall.rise,bellZ=hall.z;
 solid(lead,0,bellY+.75,bellZ,2.3,1.5,2.3,'Bell tower base');
 for(const side of [-1,1])for(const sign of [-1,1])beam([-1,bellY+.1+(sign>0?0:1.3),bellZ+side*1.18],[1,bellY+.1+(sign>0?1.3:0),bellZ+side*1.18],.11,dark,'Belfry crossed timber');
 mesh(new THREE.CylinderGeometry(1.48,1.48,.18,8),lead,0,bellY+1.65,bellZ,'Belfry lower cornice');
 for(let i=0;i<8;i++){const t=i*Math.PI/4;mesh(new THREE.CylinderGeometry(.10,.12,2.05,8),frame,1.12*Math.cos(t),bellY+2.65,bellZ+1.12*Math.sin(t),'Belfry open column');}
 mesh(new THREE.CylinderGeometry(.30,.6,.74,12),material(0x64533b,{metalness:.5}),0,bellY+2.55,bellZ,'Visible hanging bell');
 mesh(new THREE.CylinderGeometry(1.4,1.5,.22,8),lead,0,bellY+3.73,bellZ,'Belfry upper cornice');
 const dome=mesh(new THREE.SphereGeometry(1.43,16,10,0,Math.PI*2,0,Math.PI/2),lead,0,bellY+3.82,bellZ,'Bell tower dome');dome.scale.y=1.15;
 beam([0,bellY+5.35,bellZ],[0,bellY+7,bellZ],.09,dark,'Bell tower weather vane');
 beam([-.5,bellY+6.65,bellZ],[.5,bellY+6.65,bellZ],.07,dark,'Weather vane crossbar');
 for(const b of ranges.filter(b=>b.h>7&&!b.name.includes('tower')&&!b.name.includes('hall'))){
  const [x,z]=position(b,b.w*.28,0),base=b.h+b.rise*.65,top=base+2.55;
  solid(brick,x,(base+top)/2,z,1.65,top-base,1,b.name+' chimney stack',b.r);
  for(const dy of [-.24,0])box(red,x,top+dy,z,1.96,.18,1.28,b.r);
  for(const dx of [-.5,0,.5]){const p=position(b,b.w*.28+dx,0);mesh(new THREE.CylinderGeometry(.13,.17,.8,8),red,p[0],top+.43,p[1],'Terracotta chimney pot');}
 }
 
 // Build the side.jpg details once, then reflect the entire assembly across
 // the entrance axis, including its glazing, gutters, landing and fire stair.
 const sideMeshStart=model.children.length,sideOpeningStart=openings.length;
 const sideBatchStarts=new Map([...batches].map(([mat,items])=>[mat,items.length]));
 // Low canted bay visible ahead of the west tower in side.jpg.
 const bayPoints=[[-29,-17],[-37,-17],[-40,-14],[-40,-8],[-37,-5],[-29,-5]];
 const bayShape=new THREE.Shape();bayPoints.forEach(([x,z],i)=>i?bayShape.lineTo(x,-z):bayShape.moveTo(x,-z));bayShape.closePath();
 const bayGeometry=new THREE.ExtrudeGeometry(bayShape,{depth:4.4,bevelEnabled:false});bayGeometry.rotateX(-Math.PI/2);
 mesh(worldUV(bayGeometry,1.7),brick,0,0,0,'West low canted bay walls');
 const roofPoints=bayPoints.map(([x,z])=>[x,4.4,z]),ridge=[-31,6.1,-11],verts=[],uv=[];
 for(let i=0;i<roofPoints.length;i++)for(const p of [roofPoints[i],roofPoints[(i+1)%roofPoints.length],ridge]){verts.push(...p);uv.push(p[0]/3,p[2]/3);}
 const bayRoof=new THREE.BufferGeometry();bayRoof.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));bayRoof.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));bayRoof.computeVertexNormals();
 mesh(bayRoof,roof,0,0,0,'West canted bay slate roof');
 for(let i=0;i<bayPoints.length;i++){
  const p=bayPoints[i],q=bayPoints[(i+1)%bayPoints.length],dx=q[0]-p[0],dz=q[1]-p[1],r=Math.atan2(-dz,dx);
  beam([p[0],4.4,p[1]],[q[0],4.4,q[1]],.15,blue,'Blue canted bay gutter');
  if(i<5){const length=Math.hypot(dx,dz),count=Math.max(1,Math.floor(length/2.3));
   for(let k=0;k<count;k++){const f=(k+.5)/count;sash('West low canted bay',p[0]+f*dx+Math.sin(r)*.04,2.3,p[1]+f*dz+Math.cos(r)*.04,1.15,2.9,r);}
  }
 }
 solid(blue,-29.15,3.6,-.2,.15,2.8,1.4,'Tower fire exit door');
 solid(blue,-30.1,5.05,-.2,2.0,.15,2.0,'Fire stair landing');

 const tx=-15*ANNEXE_MAP_SCALE,tz=-2*ANNEXE_MAP_SCALE;
 for(let i=0;i<18;i++)solid(blue,tx-7,.2+i*.27,tz+6-i*.36,1.65,.10,.42,'Blue external stair tread');
 for(const side of [-1,1])beam([tx-7+side*.87,1.1,tz+6],[tx-7+side*.87,5.7,tz-.5],.08,blue,'Blue stair handrail');
 for(let i=0;i<6;i++)for(const side of [-1,1])beam([tx-7+side*.87,.2+i*.81,tz+6-i*1.08],[tx-7+side*.87,1.1+i*.81,tz+6-i*1.08],.06,blue,'Blue stair baluster');
 const westSide=new THREE.Group();westSide.name='West mirrored side details';
 for(const child of model.children.slice(sideMeshStart))westSide.add(child);model.add(westSide);
 const eastSide=westSide.clone(true);eastSide.name='East mirrored side details';eastSide.scale.x=-1;
 eastSide.traverse(o=>{o.name=o.name.replace(/^West /,'East ');});model.add(eastSide);
 for(const [mat,items] of batches)for(const item of items.slice(sideBatchStarts.get(mat)??0))items.push({...item,x:-item.x,r:-item.r});
 for(const o of openings.slice(sideOpeningStart))openings.push({...o,name:o.name.replace(/^West /,'East '),x:-o.x,rotation:-o.rotation});
 function drive(x0,z0,x1,z1,w){const dx=x1-x0,dz=z1-z0;solid(road,(x0+x1)/2,.025,(z0+z1)/2,Math.hypot(dx,dz),.09,w,'Annexe drive',Math.atan2(-dz,dx));}
 drive(0,28,0,101,6);drive(-144,65,144,65,5);drive(-144,65,-144,-62,5);drive(144,65,144,-46,5);
 const dummy=new THREE.Object3D();
 for(const [mat,items] of batches){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);m.receiveShadow=true;m.castShadow=true;m.name=mat===blue?'Blue gutters and downpipes':'Annexe facade details';
  for(let i=0;i<items.length;i++){const b=items[i];dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.r,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);}model.add(m);
 }
 model.userData.ranges=ranges;model.userData.annexeOpenings=openings;model.userData.osRegistration=ANNEXE_OS_REGISTRATION;
 return model;
}
