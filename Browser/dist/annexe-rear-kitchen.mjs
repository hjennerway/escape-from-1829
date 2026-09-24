import {ANNEXE_REAR_WEST_SHIFT} from './annexe-rear-side-alignment.mjs';
import {stretchAnnexeRearRect,stretchAnnexeRearZ} from './annexe-rear-stretch.mjs';
// img1 looks from the rear court towards +Z. The west tower crest is on
// the photograph's right; the existing freestanding chimney is on its left.
export const ANNEXE_KITCHEN_REFERENCE=Object.freeze({
 photo:'Research/annexe-kitchen/img1.jpg',
 landmarks:'Research/annexe-kitchen/img1-locations.jpg',
 camera:'Research/annexe-kitchen/render.png',
 note:'Photo-estimated kitchen and service links; fully paved court and small rear access lane. Front elevations remain unchanged.'
});
export const ANNEXE_REAR_PAVING=Object.freeze({
 court:stretchAnnexeRearRect([-8.15+ANNEXE_REAR_WEST_SHIFT,-39.15,8.15,-25.9]),
 lane:stretchAnnexeRearRect([-3,-55,1,-38.9])
});

export function addAnnexeRearKitchen(THREE,{model,ranges,scale,roof,material,worldUV,hipRoof}){
 const group=new THREE.Group();group.name='Annexe rear kitchen and paving';model.add(group);
 const trim=material(0x99553d),stone=material(0xaca997),frame=material(0xd4d7c9),dark=material(0x192423),blue=material(0x3c626e),lead=material(0x78878a);
 const paving=material(0x414b4e,{roughness:1}),joint=material(0x424c49),batches=new Map(),openings=[];
 function mesh(g,m,x,y,z,name){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 function box(m,x,y,z,w,h,d,name){return mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x,y,z,name);}
 function detail(m,x,y,z,w,h,d){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d});}
 function beam(a,b,r,m,name){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,...p.add(q).multiplyScalar(.5).toArray(),name);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 for(const [name,rect] of Object.entries(ANNEXE_REAR_PAVING)){
  const [x0,z0,x1,z1]=rect.map(v=>v*scale);
  const o=box(paving,(x0+x1)/2,.045,(z0+z1)/2,x1-x0,.07,z1-z0,'Annexe rear '+(name==='court'?'courtyard paving':'access road'));
  o.castShadow=false;o.userData.groundSurface=true;
 }
 const kitchen=ranges.find(b=>b.name==='Rear court front range'),front=kitchen.z-kitchen.d/2;
 // A long ridge and short hips match the kitchen's broad, steep slate roof.
 const previous=model.getObjectByName('Rear court front range slate roof');previous.removeFromParent();previous.geometry.dispose();
 const x0=kitchen.x-kitchen.w/2-.28,x1=kitchen.x+kitchen.w/2+.28,z0=front-.30,z1=kitchen.z+kitchen.d/2+.30,y=kitchen.h,top=y+kitchen.rise;
 const vertices=[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],[x0+.8,top,kitchen.z],[x1-.8,top,kitchen.z]],positions=[],uv=[];
 for(const face of [[0,4,5],[0,5,1],[1,5,2],[2,5,4],[2,4,3],[3,4,0]])for(const i of face){const v=vertices[i];positions.push(...v);uv.push(v[0]/3,v[2]/3);}
 const roofGeometry=new THREE.BufferGeometry();roofGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));roofGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));roofGeometry.computeVertexNormals();
 mesh(roofGeometry,roof,0,0,0,'Rear court front range slate roof');
 // Four high dark openings, with pale heads and slender frames. No lawn
 // islands: the owner specifies paving across the entire courtyard.
 for(let i=0;i<4;i++){
  const x=kitchen.x+(i-1.5)*3.65,y=3.45,w=1.95,h=3.35,z=front-.045;
  openings.push({x,y,z,w,h});
  detail(dark,x,y,z-.055,w,h,.09);
  for(const side of [-1,1])detail(frame,x+side*w/2,y,z-.11,.065,h+.12,.10);
  for(const side of [-1,1])detail(frame,x,y+side*h/2,z-.11,w+.12,.07,.10);
  detail(stone,x,y+h/2+.12,z-.075,w+.3,.18,.19);
  detail(stone,x,y-h/2-.1,z-.14,w+.22,.12,.23);
  if(i<3)detail(trim,x+1.825,3.05,front-.055,.32,6.1,.17);
 }
 for(const y of [.28,5.9])detail(trim,kitchen.x,y,front-.065,kitchen.w+.12,.22,.15);
 for(const side of [-1,1])detail(blue,kitchen.x+side*(kitchen.w/2-.18),3.0,front-.23,.095,6,.10);
 // Lead ridge ventilator and a delicate end weather vane.
 const ridgeY=kitchen.h+kitchen.rise;
 box(lead,kitchen.x,ridgeY-.16,kitchen.z,1.2,.95,1.15,'Annexe kitchen lead ventilator base');
 box(dark,kitchen.x,ridgeY+.47,kitchen.z,.68,.45,.65,'Annexe kitchen ventilator opening');
 for(const dx of [-.36,.36])for(const dz of [-.34,.34])detail(lead,kitchen.x+dx,ridgeY+.46,kitchen.z+dz,.07,.52,.07);
 const cap=hipRoof(kitchen.x,kitchen.z,1.16,1.10,ridgeY+.73,.22);group.add(cap);cap.name='Annexe kitchen ventilator slate roof';
 const finialX=kitchen.x-kitchen.w/2+1.0;
 beam([finialX,ridgeY-.3,kitchen.z],[finialX,ridgeY+1.1,kitchen.z],.025,dark,'Annexe kitchen weather vane');
 beam([finialX-.23,ridgeY+.65,kitchen.z],[finialX+.23,ridgeY+.65,kitchen.z],.022,dark,'Annexe kitchen weather vane crossbar');
 // Set-back blue doors and a slatted service gate to the photo's right.
 const west=ranges.find(b=>b.name==='Rear court front west service link'),z=west.z-west.d/2-.08;
 const doors=[{x:-6.15*scale,w:1.35,h:2.55},{x:-7.35*scale,w:1.65,h:2.55}];
 for(const d of doors){
  detail(blue,d.x,d.h/2,z-.04,d.w,d.h,.1);
  detail(joint,d.x,d.h/2,z-.10,.025,d.h,.025);
  for(const dx of [-.27,.27])detail(dark,d.x+dx,.42,z-.11,.36,.25,.025);
  detail(stone,d.x,2.72,z-.08,d.w+.16,.13,.13);
 }
 const gateX=-5.15*scale,gateW=1.25;
 detail(dark,gateX,1.42,z-.015,gateW,2.84,.055);
 for(let i=0;i<=16;i++)detail(blue,gateX-gateW/2+i*gateW/16,1.42,z-.12,.04,2.84,.10);
 for(const y of [.46,2.37])detail(blue,gateX,y,z-.17,gateW,.10,.09);
 // Flush drainage grates do not introduce walking obstacles.
 for(const x of [-7.4,4.4]){
  detail(joint,x*scale,.091,stretchAnnexeRearZ(-37.7)*scale,.46,.018,.72);
  for(let i=0;i<6;i++)detail(lead,x*scale,.104,stretchAnnexeRearZ(-37.99)*scale+i*.115,.40,.012,.028);
 }
 const dummy=new THREE.Object3D();
 for(const [mat,items] of batches){
  const o=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);o.name='Annexe rear kitchen details';o.userData.orientedCollision=true;o.castShadow=true;o.receiveShadow=true;
  items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);});group.add(o);
 }
 group.userData.reference=ANNEXE_KITCHEN_REFERENCE;group.userData.openings=openings;group.userData.paving=ANNEXE_REAR_PAVING;
 return group;
}
