import {ANNEXE_OUTER_FRONT_FITS} from './annexe-os-refinement.mjs';
// Both outer frontages use the same photographed elevation, fitted to the OS.
// Dimensions are inferred from img1.jpg; the registered ward bodies stay fixed.
export function addOuterFronts(THREE,{model,scale,brick,roof,material,worldUV,hipRoof}){
 return addFronts(THREE,{model,scale,brick,roof,material,worldUV,hipRoof});
}
// Copy the paired apex elevation onto the two marked courtyard fronts. Their
// existing ranges set the fit; the outer wings' entrance rooms stay separate.
export function addCourtFronts(THREE,options){
 return addFronts(THREE,{...options,court:true});
}
function addFronts(THREE,{model,scale,brick,roof,material,worldUV,hipRoof,ranges,court=false}){
 const trim=material(0xa34d32),stone=material(0xb7ac90),frame=material(0xdedfd4),glass=material(0x273a3b),iron=material(0x30464d);
 const groups=[];
 for(const side of [-1,1]){
  const label=side<0?'West':'East',group=new THREE.Group();group.name=label+(court?' court':' outer')+' front elevation';group.scale.x=side;
  const parent=court?model.userData.wards[side<0?'tarvin-jarman':'picton-carden']:(side<0?model.userData.wards['larkton-jodrell']:model);
  parent.add(group);groups.push(group);
  const z=12*scale+.08,h=8.4,start=51*scale,end=77*scale,batches=new Map(),openings=[];
  function mesh(g,m,x,y,z,name){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=court?name.replace(/^Outer/,'Court'):name;o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
  function box(m,x,y,z,w,h,d){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d});}
  function wall(x,z,w,h,d,name){const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),brick,x,h/2,z,name);o.userData.orientedCollision=true;return o;}
  function beam(a,b,width,m,name){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p),o=mesh(new THREE.CylinderGeometry(width/2,width/2,v.length(),6),m,...p.add(q).multiplyScalar(.5).toArray(),name);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());}
  function sash(x,y,front,w=1.25,height=2.75){
   openings.push({x,y,z:front,w,h:height});box(glass,x,y,front+.06,w,height,.08);
   for(const dx of [-w/2,w/2])box(frame,x+dx,y,front+.12,.065,height,.09);
   for(const dy of [-height/2,0,height/2])box(frame,x,y+dy,front+.13,w+.08,.065,.09);
   for(const dx of [-w/6,w/6])box(frame,x+dx,y,front+.14,.028,height,.06);
   for(const dy of [-height/3,-height/6,height/6,height/3])box(frame,x,y+dy,front+.14,w,.028,.06);
   box(stone,x,y-height/2-.08,front+.11,w+.27,.13,.3);
   box(trim,x,y+height/2+.14,front+.07,w+.3,.25,.15);
  }
  wall((start+end)/2,z-.85,end-start,h,1.7,'Outer frontage brick walls');
  for(const y of [.25,4.25,8.14])box(trim,(start+end)/2,y,z+.07,end-start,.32,.18);
  box(iron,(start+end)/2,h,z+.18,end-start+.3,.13,.18);
  const gables=[54*scale,70.5*scale],gw=7.9;
  for(let x=start+1.45;x<end-1;x+=2.65){
   if(gables.some(g=>Math.abs(x-g)<gw/2+.45))continue;
   if(!court&&x>73*scale)continue;
   for(const y of [2.05,6.4])sash(x,y,z);
  }
  if(!court)for(const x of [74.5*scale,76.3*scale])sash(x,6.4,z);
  for(const x of gables){
   const front=z+1.05,depth=6.7,base=8.4,rise=3.0;
   wall(x,front-1.1,gw,h,2.2,'Outer projecting gable brick walls');
   for(const y of [.25,4.25,8.1])box(trim,x,y,front+.08,gw+.12,.34,.2);
   for(const dx of [-2.55,0,2.55])for(const y of [2.05,6.4])sash(x+dx,y,front);
   for(const dx of [-gw/2+.18,gw/2-.18])box(trim,x+dx,4.15,front+.08,.3,8.1,.22);
   const triangle=new THREE.Shape();triangle.moveTo(-gw/2,0);triangle.lineTo(gw/2,0);triangle.lineTo(0,rise);triangle.closePath();
   mesh(worldUV(new THREE.ExtrudeGeometry(triangle,{depth,bevelEnabled:false}),1.7),brick,x,base,front-depth,'Outer decorated brick gable');
   for(const sign of [-1,1]){
    const length=Math.hypot(gw/2+.2,rise),o=mesh(worldUV(new THREE.BoxGeometry(length,.13,depth+.35),1.7),roof,x+sign*gw/4,base+rise/2,front-depth/2,'Outer cross-gable slate roof');o.rotation.z=-sign*Math.atan2(rise,gw/2);
    for(const inset of [0,.25])beam([x+sign*gw/2,base-inset,front+.15],[x,base+rise-inset,front+.15],.14,trim,'Outer terracotta gable verge');
    box(iron,x+sign*(gw/2+.16),4.1,front+.22,.085,8.2,.085);
   }
   for(const y of [base+.3,base+.68])box(trim,x,y,front+.1,gw*(1-(y-base)/rise)-.3,.16,.16);
   mesh(new THREE.CircleGeometry(.36,24),iron,x,base+1.6,front+.04,'Outer circular gable vent');
   mesh(new THREE.TorusGeometry(.4,.09,8,24),stone,x,base+1.6,front+.1,'Outer circular vent surround');
   for(const dx of [-.12,0,.12])box(iron,x+dx,base+1.6,front+.2,.03,.6,.05);
   beam([x,base+rise,front],[x,base+rise+.45,front],.08,iron,'Outer gable finial');
  }
  // Recessed arch and low projecting room at the outer end of each elevation.
  if(!court){
  const door=74.5*scale,room=77*scale,front=z+3.4;
  box(glass,door,1.6,z+.12,1.55,3.2,.1);
  for(const dx of [-.95,.95])box(trim,door+dx,1.55,z+.23,.3,3.1,.35);
  const arch=new THREE.Shape();arch.absarc(0,2.65,1.1,0,Math.PI,false);arch.lineTo(-.78,2.65);arch.absarc(0,2.65,.78,Math.PI,0,true);arch.closePath();
  mesh(new THREE.ExtrudeGeometry(arch,{depth:.32,bevelEnabled:false}),trim,door,0,z+.14,'Outer recessed entrance arch');
  wall(room,front-2.3,4.1,4.1,4.6,'Outer low entrance room brick walls');
  const cap=hipRoof(room,front-2.3,4.5,5,4.1,1.55);cap.name='Outer low entrance room slate roof';group.add(cap);
  sash(room,2.0,front+.02,1.55,3.15);
  for(const y of [.25,3.85])box(trim,room,y,front+.08,4.1,.26,.18);
  box(iron,room,4.1,front+.22,4.6,.12,.16);
  const stackX=72.9*scale,stackY=11.3;
  wall(stackX,z-3,1.3,stackY,1.1,'Outer tall chimney stack');
  for(const y of [stackY-.3,stackY])box(trim,stackX,y,z-3,1.6,.18,1.4);
  }
  const dummy=new THREE.Object3D();
  for(const [mat,items] of batches){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);m.name=(court?'Court':'Outer')+' frontage window and brick details';m.castShadow=true;m.receiveShadow=true;if(court)m.userData.orientedCollision=true;items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});group.add(m);}
  group.userData.openings=openings;
  const host=court?ranges.find(b=>b.name===label+' court front range'):null;
  const fit=host?{start:(side*host.x-host.w/2)/scale,end:(side*host.x+host.w/2)/scale,front:(host.z+host.d/2)/scale}:ANNEXE_OUTER_FRONT_FITS[side<0?'west':'east'];
  const stretch=(fit.end-fit.start)/26;
  group.scale.x=side*stretch;group.position.x=side*(fit.start-51*stretch)*scale;
  group.position.z=(fit.front-12)*scale;
 }
 return groups;
}
