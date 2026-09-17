// September 17 red footprint, registered against the existing courtyard.
// Snap the east/south walls to the two corridor faces, with no shared area.
export const MAIN_KITCHEN=Object.freeze({
 minX:120,maxX:153.6,minZ:-26.6,maxZ:6.6,eaves:4.8,rise:2.65,sections:3,
 layout:'historic'
});
export const MAIN_KITCHEN_VIEWS=Object.freeze({
 'main-kitchen':{position:[105,77,49],target:[137,3,-10],fov:46},
 'main-kitchen-plan':{position:[137,106,-9.99],target:[137,0,-10],fov:46},
 'main-kitchen-roofs':{position:[138,22,47],target:[137,5,-10],fov:44}
});
export const MAIN_KITCHEN_WALK=Object.freeze({position:[110,1.8,-17],target:[133,4,-12],fov:62});

export function createMainKitchen(THREE,{brick,material,worldUV}){
 const b=MAIN_KITCHEN,group=new THREE.Group();group.name='Main kitchen';
 group.userData={layout:b.layout,storeys:1,footprint:b,roofSections:b.sections,reference:'Research/main-kitchen/README.md'};
 const masonry=brick.clone();masonry.color.set(0xc7a391);
 const white=material(0xf2f3ed,{roughness:.72,metalness:.08});
 const seam=material(0xdadfd8,{roughness:.78}),stone=material(0xcecaba),trim=material(0xe5e8e0);
 const glass=material(0x536a6c,{roughness:.5,metalness:.12}),iron=material(0x475251),door=material(0x617d80);
 function mesh(g,m,name){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 function box(m,x,y,z,w,h,d,name){const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,name);o.position.set(x,y,z);return o;}
 function line(a,c,m,r,name){const direction=new THREE.Vector3(...c).sub(new THREE.Vector3(...a));
  const o=mesh(new THREE.CylinderGeometry(r,r,direction.length(),6),m,name);
  o.position.set(...a.map((v,i)=>(v+c[i])/2));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
  if(m===seam)o.castShadow=false;return o;
 }
 const w=b.maxX-b.minX,d=b.maxZ-b.minZ,cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2;
 box(masonry,cx,(b.eaves+.44)/2,cz,w,b.eaves-.44,d,'Main kitchen walls');
 box(stone,cx,.22,cz,w,.44,d,'Main kitchen plinth');
 // Three complete hips share valley edges. Shared sides stay exactly inside
 // the footprint, so neither the stores nor the galleries receive an overhang.
 const bayWidth=w/b.sections,eave=b.eaves,peak=eave+b.rise;
 for(let i=0;i<b.sections;i++){
  const x0=b.minX+i*bayWidth,x1=x0+bayWidth,x=(x0+x1)/2;
  const hip=bayWidth/2,z0=b.minZ,z1=b.maxZ;
  const vertices=[[x0,eave,z0],[x1,eave,z0],[x1,eave,z1],[x0,eave,z1],
   [x,peak,z0+hip],[x,peak,z1-hip]];
  const positions=[],uv=[];
  for(const face of [[0,4,1],[1,4,5],[1,5,2],[2,5,3],[3,5,4],[3,4,0]]){
   for(const j of face){positions.push(...vertices[j]);uv.push(vertices[j][0]/2,vertices[j][2]/2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  const roof=mesh(g,white,`Main kitchen white hipped roof ${i+1}`);
  roof.userData={section:i+1,ridge:[vertices[4],vertices[5]],footprint:[x0,z0,x1,z1]};
  line(vertices[4],vertices[5],white,.075,`Main kitchen white ridge ${i+1}`);
  for(const [a,c] of [[0,4],[1,4],[2,5],[3,5]])line(vertices[a],vertices[c],seam,.035,'Main kitchen hip flashing');
  // Fine raised metal seams follow the actual four pitched faces.
  for(let z=z0+1.4;z<z1;z+=1.4){
   const rise=Math.min(1,(z-z0)/hip,(z1-z)/hip),top=eave+b.rise*rise+.015;
   const inset=hip*rise;
   line([x0,eave+.015,z],[x0+inset,top,z],seam,.013,'Main kitchen roof seam');
   line([x1-inset,top,z],[x1,eave+.015,z],seam,.013,'Main kitchen roof seam');
  }
  if(i)box(iron,x0,eave+.008,cz,.14,.025,d,'Main kitchen valley gutter');
 }
 for(const x of [b.minX+.065,b.maxX-.065])box(iron,x,b.eaves-.04,cz,.13,.13,d,'Main kitchen side gutter');
 for(const z of [b.minZ+.06,b.maxZ-.06])box(trim,cx,b.eaves-.08,z,w,.16,.12,'Main kitchen fascia');
 // Modest single-storey service windows on the exposed lawn elevations.
 function window(x,z,rotation){
  const face=new THREE.Group();face.name='Main kitchen window';face.position.set(x,2.65,z);face.rotation.y=rotation;group.add(face);
  function part(m,x,y,z,w,h,d){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;face.add(o);}
  part(glass,0,0,.035,1.75,1.75,.05);
  for(const x of [-.91,0,.91])part(trim,x,0,.085,.07,1.89,.08);
  for(const y of [-.91,.2,.91])part(trim,0,y,.085,1.89,.07,.08);
  part(stone,0,-1.02,.09,2.13,.16,.27);part(stone,0,1.05,.06,2.12,.18,.18);
 }
 for(const z of [-22,-16,-10,-4])window(b.minX-.02,z,-Math.PI/2);
 for(const x of [124,130,136,142])window(x,b.minZ-.02,Math.PI);
 box(door,b.minX-.04,1.48,-.3,.08,2.9,1.8,'Main kitchen service door');
 box(trim,b.minX-.06,2.96,-.3,.12,.1,2,'Main kitchen door lintel');
 for(const z of [-1.25,.65])box(trim,b.minX-.06,1.48,z,.12,2.9,.1,'Main kitchen door jamb');
 return group;
}
