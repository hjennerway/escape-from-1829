// pharmacy/img1-loc.png locates the two cylinders on the workshop side of
// the rear court. The photograph supplies the sash, stair and tank details.
// Positions and dimensions are visual estimates, not surveyed measurements.
export const PHARMACY_VIEWS=Object.freeze({
 pharmacy:{position:[264,67,-117],target:[194,4,-47],fov:42},
 'pharmacy-photo':{position:[224,1.8,-56],target:[192,4,-50],fov:65},
 'pharmacy-plan':{position:[201,80,-60.99],target:[201,0,-61],fov:46}
});
export const PHARMACY_TANKS=Object.freeze([
 // Centre the row between the main rear wall (z ≈ -49) and workshops
 // (z = -73.5), leaving about seven units of clearance on either side.
 {name:'East pharmacy gas cylinder',x:213,z:-61.25,radius:5,plinth:2.7,height:11.5},
 {name:'West pharmacy gas cylinder',x:199,z:-61.25,radius:5,plinth:2.7,height:11.5}
].map(Object.freeze));

export function addPharmacyCourt(THREE,{group,brick,stone,blue,dark,mat,box,detail,line,sash,door}){
 const rear=[],stairs=[];
 function window(x,y,z,w,h){
  sash(x,y,z,w,h,Math.PI,'Pharmacy rear sash');rear.push({x,y,z,w,h});
 }
 // Rear elevations of the existing central hall, low stepped link and east
 // range. No new shell, taller parapet or roof replaces these host buildings.
 for(const x of [183.4,187.2,191,194.8,198.6]){
  window(x,5.65,-49.04,1.35,2.45);
  if(x!==198.6)window(x,2.2,-49.04,1.35,2.8);
 }
 for(const x of [203.5,207]){
  window(x,4.12,-48.74,1.05,1.8);
  window(x,1.75,-48.74,1.05,1.95);
 }
 for(const x of [211.1,214.6,218.1]){
  window(x,6.6,-48.74,1.4,3.05);
  if(x!==218.1)window(x,2.45,-48.74,1.4,2.9);
 }
 const head=mat(0x703f32);
 // Subtle dark lintels and projecting sills match the photographed rear.
 for(const w of rear){
  detail(head,w.x,w.y+w.h/2+.18,w.z-.11,w.w+.28,.23,.16);
  detail(dark,w.x,w.y-w.h/2-.1,w.z-.23,w.w+.36,.14,.40);
 }
 function stair(name,x,z,height){
  const landingWidth=2.3,depth=2.25,run=3.6,count=6;
  door(x,height+1.45,z-.03,1.4,2.8,Math.PI,blue,'Pharmacy raised rear door');
  box(brick,x,height/2,z-depth/2,landingWidth,height,depth,name+' brick landing');
  box(stone,x,height+.06,z-depth/2,landingWidth+.12,.12,depth+.12,name+' stone landing');
  const edge=x-landingWidth/2;
  for(let i=0;i<count;i++){
   const top=height*(i+1)/count,px=edge-run+(i+.5)*run/count;
   box(brick,px,top/2,z-depth/2,run/count+.015,top,depth,name+' masonry step');
   box(stone,px,top+.055,z-depth/2,run/count+.035,.11,depth+.06,name+' stone tread');
  }
  const railZ=z-depth-.08,lowX=edge-run;
  for(const offset of [.5,1.02]){
   line([lowX,height/count+offset,railZ],[edge,height+offset,railZ],blue,.035,name+' sloping handrail');
   line([edge,height+offset,railZ],[x+landingWidth/2,height+offset,railZ],blue,.035,name+' landing handrail');
   line([x+landingWidth/2,height+offset,railZ],[x+landingWidth/2,height+offset,z-.12],blue,.035,name+' return handrail');
  }
  for(let i=0;i<=12;i++){
   const t=i/12,px=lowX+run*t,y=height/count+(height-height/count)*t;
   detail(blue,px,y+.52,railZ,.04,1.04,.04);
  }
  for(let i=0;i<=7;i++)detail(blue,edge+landingWidth*i/7,height+.52,railZ,.04,1.04,.04);
  for(let i=1;i<=6;i++)detail(blue,x+landingWidth/2,height+.52,railZ+depth*i/6,.04,1.04,.04);
  stairs.push({name,x,z,height,rect:[lowX,z-depth-.13,x+landingWidth/2+.08,z]});
 }
 stair('Pharmacy east rear stairs',218.1,-48.82,1.08);
 stair('Pharmacy west rear stairs',198.6,-49.12,1.08);
 for(const [x,z,h] of [[181,-49.05,7.3],[201.4,-49.05,7.3],[209.2,-48.75,8.9],[220.4,-48.75,8.9]]){
  line([x,.2,z-.2],[x,h,z-.2],dark,.055,'Pharmacy rear downpipe');
  line([x,.22,z-.2],[x,.22,z-.55],dark,.055,'Pharmacy drain shoe');
 }
 const metal=new THREE.MeshStandardMaterial({color:0xa6aaa4,roughness:.64,metalness:.34});
 const seam=new THREE.MeshStandardMaterial({color:0x777e79,roughness:.65,metalness:.35});
 const cap=new THREE.MeshStandardMaterial({color:0xb3b5a9,roughness:.82,metalness:.20});
 const tanks=[];
 for(const spec of PHARMACY_TANKS){
  const {name,x,z,radius:r,plinth,height}=spec;
  const tank=new THREE.Group();tank.name=name;tank.userData.pharmacyTank=spec;tank.userData.layout='historic';
  group.add(tank);
  function part(g,m,y,suffix){const o=new THREE.Mesh(g,m);o.name=name+' '+suffix;o.position.y=y;o.castShadow=true;o.receiveShadow=true;tank.add(o);return o;}
  const baseGeo=new THREE.CylinderGeometry(r+.04,r+.09,plinth,64);
  // Cylindrical UVs preserve courses around the masonry, including the seam.
  const uv=baseGeo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.PI*2*r/1.7,uv.getY(i)*plinth/1.7);
  const base=part(baseGeo,brick,plinth/2,'brick plinth');
  base.userData.collisionFootprint=Array.from({length:48},(_,i)=>[(r+.09)*Math.cos(i*Math.PI/24),(r+.09)*Math.sin(i*Math.PI/24)]);
  part(new THREE.CylinderGeometry(r+.12,r+.12,.16,64),stone,plinth,'plinth coping');
  part(new THREE.CylinderGeometry(r,r,height-plinth,96),metal,(height+plinth)/2,'ribbed metal shell');
  part(new THREE.CylinderGeometry(r-.03,r+.01,.16,96),cap,height+.035,'shallow circular roof');
  for(const y of [plinth+.13,plinth+2.2,plinth+4.4,plinth+6.6,height-.10]){
   const ring=part(new THREE.TorusGeometry(r+.025,.045,6,96),seam,y,'horizontal reinforcing band');ring.rotation.x=Math.PI/2;
  }
  for(const y of [height+.5,height+1.02]){
   const ring=part(new THREE.TorusGeometry(r-.08,.035,6,64),seam,y,'roof guardrail');ring.rotation.x=Math.PI/2;
  }
  const dummy=new THREE.Object3D(),ribs=new THREE.InstancedMesh(new THREE.BoxGeometry(.055,height-plinth-.12,.065),seam,128);
  ribs.name=name+' vertical corrugations';ribs.castShadow=true;ribs.receiveShadow=true;
  for(let i=0;i<128;i++){const a=i*Math.PI/64;dummy.position.set((r+.014)*Math.sin(a),(height+plinth)/2,(r+.014)*Math.cos(a));dummy.rotation.set(0,a,0);dummy.updateMatrix();ribs.setMatrixAt(i,dummy.matrix);}
  tank.add(ribs);
  const posts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.034,.034,1.08,6),seam,24);posts.name=name+' roof railing posts';posts.castShadow=true;
  for(let i=0;i<24;i++){const a=i*Math.PI/12;dummy.position.set((r-.08)*Math.sin(a),height+.52,(r-.08)*Math.cos(a));dummy.rotation.set(0,0,0);dummy.updateMatrix();posts.setMatrixAt(i,dummy.matrix);}
  tank.add(posts);tank.position.set(x,0,z);tanks.push(tank);
 }
 group.userData.pharmacy={reference:'Research/pharmacy/README.md',windows:rear,stairs,tanks:PHARMACY_TANKS};
 return tanks;
}
