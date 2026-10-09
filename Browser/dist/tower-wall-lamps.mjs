// Decorative gas-style wall lanterns for the fictional tower interior.
// Shared geometry/materials let the stationary ironwork join the tower batches.
export function createTowerWallLamps(THREE,resources){
 const keep=o=>(resources.add(o),o);
 const iron=keep(new THREE.MeshStandardMaterial({color:0x252923,roughness:.77,metalness:.5}));
 const brass=keep(new THREE.MeshStandardMaterial({color:0x947141,roughness:.63,metalness:.6}));
 const glass=keep(new THREE.MeshStandardMaterial({color:0xffdb9c,roughness:.2,transparent:true,opacity:.18,depthWrite:false}));
 const flame=keep(new THREE.MeshStandardMaterial({color:0xffecc4,emissive:0xffc66b,emissiveIntensity:2,roughness:1}));
 const cube=keep(new THREE.BoxGeometry(1,1,1)),hood=keep(new THREE.ConeGeometry(.265,.17,4)),sphere=keep(new THREE.SphereGeometry(1,8,6));
 return function lantern(parent,{x,y,z,angle=0,scale=1,name='Tower gas wall lantern'}){
  const group=new THREE.Group();group.name=name;group.userData.aerialBatchScope=true;group.position.set(x,y,z);group.rotation.y=angle;group.scale.setScalar(scale);parent.add(group);
  // The broad estate shadow map cannot resolve this fine metalwork without
  // speckling. The lit fittings use their normals and local light directly.
  function mesh(geometry,material,size,p,name){const m=new THREE.Mesh(geometry,material);m.name=name;m.scale.set(...size);m.position.set(...p);m.userData.noWalkingCollision=true;group.add(m);return m;}
  const box=(mat,size,p,name)=>mesh(cube,mat,size,p,name);
  box(iron,[.15,.42,.045],[0,-.08,0],'Lantern wall plate');
  box(brass,[.027,.53,.027],[0,-.18,.045],'Gas supply pipe');
  box(iron,[.04,.045,.34],[0,-.23,.18],'Lantern wall bracket');
  const brace=box(iron,[.027,.29,.027],[0,-.33,.16],'Lantern bracket brace');brace.rotation.x=-Math.PI/4;
  box(iron,[.34,.055,.29],[0,-.20,.34],'Lantern base');
  box(iron,[.34,.04,.29],[0,.22,.34],'Lantern crown');
  for(const a of [-1,1])for(const b of [-1,1])box(iron,[.018,.42,.018],[a*.145,.01,.34+b*.12],'Lantern glazing bar');
  for(const side of [-1,1]){
   box(glass,[.27,.38,.008],[0,.01,.34+side*.12],'Lantern glass pane');
   box(glass,[.008,.38,.23],[side*.145,.01,.34],'Lantern glass pane');
  }
  const cap=mesh(hood,iron,[1,1,1],[0,.31,.34],'Pitched lantern hood');cap.rotation.y=Math.PI/4;
  box(iron,[.06,.11,.06],[0,.43,.34],'Lantern vent');
  mesh(sphere,brass,[.04,.05,.04],[0,.51,.34],'Lantern finial');
  box(brass,[.07,.12,.07],[0,-.13,.34],'Gas burner');
  mesh(sphere,flame,[.038,.11,.038],[0,.015,.34],'Warm gas flame');
  return group;
 };
}
