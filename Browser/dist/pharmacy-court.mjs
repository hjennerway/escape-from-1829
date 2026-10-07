// pharmacy/img1-loc.png locates the two cylinders on the workshop side of
// the rear court. The photograph supplies the sash, stair and tank details.
// Positions and dimensions are visual estimates, not surveyed measurements.
export const PHARMACY_VIEWS=Object.freeze({
 pharmacy:{position:[290,125,-95],target:[193,4,-38],fov:46},
 'pharmacy-photo':{position:[184,1.8,-44],target:[175,5,-18.9],fov:65},
 'pharmacy-plan':{position:[191,120,-35.99],target:[191,0,-36],fov:46}
});
export const PHARMACY_TANKS=Object.freeze([
 // Move 8.9 units towards Main/admin, almost touching the blue-circled hall.
 // Retain both sizes and their side-to-side spacing; the east plinth coping
 // stops 0.48 units from its rear wall, with the roof overhang also clear.
 {name:'East pharmacy gas cylinder',x:181.4,z:-18.9,radius:5,plinth:2.7,height:11.5},
 {name:'West pharmacy gas cylinder',x:168.5,z:-18.9,radius:5,plinth:2.7,height:11.5}
].map(Object.freeze));

import {addExteriorStairRail} from './exterior-stair-rail.mjs';
export function addPharmacyCourt(THREE,{group,brick,stone,blue,dark,mat,box,detail,line,sash,door,mesh}){
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
  // Use the service-court factory so guards follow the same placement as
  // their stairs, doors and landing, including the later purple-range move.
  const guard=(a,b)=>addExteriorStairRail(THREE,group,blue,a,b,{name:name+' guard',createMesh:mesh});
  guard([lowX,height/count+.11,railZ],[edge,height+.12,railZ]);
  guard([edge,height+.12,railZ],[x+landingWidth/2,height+.12,railZ]);
  guard([x+landingWidth/2,height+.12,railZ],[x+landingWidth/2,height+.12,z-.12]);
  guard([lowX,height/count+.11,z-.08],[edge,height+.12,z-.08]);
  stairs.push({name,x,z,height,rect:[lowX,z-depth-.13,x+landingWidth/2+.08,z]});
 }
 stair('Pharmacy east rear stairs',218.1,-48.82,1.08);
 stair('Pharmacy west rear stairs',198.6,-49.12,1.08);
 for(const [x,z,h] of [[183.5,-49.05,7.3],[201.4,-49.05,7.3],[209.2,-48.75,8.9],[220.4,-48.75,8.9]]){
  const assembly=new THREE.Group();assembly.name='Pharmacy downpipe assembly';assembly.userData.downpipeAssembly=true;group.add(assembly);
  assembly.add(line([x,.2,z-.2],[x,h,z-.2],dark,.055,'Pharmacy rear downpipe'));
  assembly.add(line([x,.22,z-.2],[x,.22,z-.55],dark,.055,'Pharmacy drain shoe'));
 }
 const metal=new THREE.MeshStandardMaterial({color:0xa6aaa4,roughness:.64,metalness:.34});
 const seam=new THREE.MeshStandardMaterial({color:0x777e79,roughness:.65,metalness:.35});
 const cap=new THREE.MeshStandardMaterial({color:0xb3b5a9,roughness:.82,metalness:.20});
 const tanks=[];
 const bandGeometry=new THREE.TorusGeometry(PHARMACY_TANKS[0].radius+.025,.045,6,96),railGeometry=new THREE.TorusGeometry(PHARMACY_TANKS[0].radius-.08,.035,6,64);
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
  const shell=part(new THREE.CylinderGeometry(r,r,height-plinth,96),metal,(height+plinth)/2,'ribbed metal shell');
  part(new THREE.CylinderGeometry(r-.03,r+.01,.16,96),cap,height+.035,'shallow circular roof');
  for(const y of [plinth+.13,plinth+2.2,plinth+4.4,plinth+6.6,height-.10]){
   const ring=part(bandGeometry,seam,y,'horizontal reinforcing band');ring.rotation.x=Math.PI/2;
  }
  for(const y of [height+.5,height+1.02]){
   const ring=part(railGeometry,seam,y,'roof guardrail');ring.rotation.x=Math.PI/2;
  }
  const dummy=new THREE.Object3D(),ribs=new THREE.InstancedMesh(new THREE.BoxGeometry(.055,height-plinth-.12,.065),seam,128);
  ribs.name=name+' vertical corrugations';ribs.castShadow=true;ribs.receiveShadow=true;
  for(let i=0;i<128;i++){const a=i*Math.PI/64;dummy.position.set((r+.014)*Math.sin(a),(height+plinth)/2,(r+.014)*Math.cos(a));dummy.rotation.set(0,a,0);dummy.updateMatrix();ribs.setMatrixAt(i,dummy.matrix);}
  tank.add(ribs);
  const posts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.034,.034,1.08,6),seam,24);posts.name=name+' roof railing posts';posts.castShadow=true;
  for(let i=0;i<24;i++){const a=i*Math.PI/12;dummy.position.set((r-.08)*Math.sin(a),height+.52,(r-.08)*Math.cos(a));dummy.rotation.set(0,0,0);dummy.updateMatrix();posts.setMatrixAt(i,dummy.matrix);}
  tank.add(posts);tank.position.set(x,0,z);tanks.push(tank);
  const lod=new THREE.LOD(),full=new THREE.Group(),far=new THREE.Group();lod.name=name+' surface detail';
  for(const child of [...tank.children])if(child===shell||child===ribs||/horizontal reinforcing band|roof guardrail$/.test(child.name))full.add(child);
  // Retain the shell silhouette and railing posts. Fine ribs become a repeating
  // material normal at distances where their 55mm width is below one pixel.
  const normalPixels=new Uint8Array(16*4);
  for(let i=0;i<16;i++){const slope=Math.sin(i/16*Math.PI*2)*.4;normalPixels.set([128+slope*127,128,Math.sqrt(1-slope*slope)*127+128,255],i*4);}
  const normalMap=new THREE.DataTexture(normalPixels,16,1);normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;normalMap.repeat.set(128,1);normalMap.needsUpdate=true;
  const farMetal=metal.clone();farMetal.normalMap=normalMap;farMetal.normalScale.set(.65,.65);
  const farShell=new THREE.Mesh(shell.geometry,farMetal);farShell.name=name+' distant corrugated shell';farShell.position.copy(shell.position);farShell.castShadow=farShell.receiveShadow=true;far.add(farShell);
  for(const child of full.children.filter(o=>o!==shell&&o!==ribs)){
   const rail=/guardrail$/.test(child.name),geometry=new THREE.TorusGeometry(rail?r-.08:r+.025,rail?.035:.045,4,48),copy=new THREE.Mesh(geometry,seam);
   copy.name=child.name+' distant';copy.position.copy(child.position);copy.quaternion.copy(child.quaternion);copy.castShadow=copy.receiveShadow=true;far.add(copy);
  }
  lod.addLevel(full,0);lod.addLevel(far,95,.12);far.visible=false;tank.add(lod);
 }
 group.userData.pharmacy={reference:'Research/pharmacy/README.md',windows:rear,stairs,tanks:PHARMACY_TANKS};
 return tanks;
}
