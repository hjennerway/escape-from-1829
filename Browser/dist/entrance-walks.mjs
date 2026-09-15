// Narrow gravel walks follow the entrance elevations and join the central
// approach around the split staircase and the semicircular doorway forecourt.
export const FRONT_FORECOURT=Object.freeze({center:[0,27.4],radius:13});
export function addEntranceWalks(THREE,{model,material}){
  const gravel=material(0xa39e88);
  // Inner edge follows the stair cheeks, Reception, recessed frontage and bay;
  // the returning edge keeps the walk 1.2 units wide around every corner.
  const outline=[
    [-1.6,27.4],[-1.6,26.2],[-4.24,26.2],[-4.24,19.6],[-7.1,19.6],
    [-7.1,17.3],[-22.6,17.3],[-22.6,19.7],[-32,19.7],
    [-32,27],[-29,27],[-29,33.15],[-27.5,33.15],
    [-27.5,37.85],[-29,37.85],[-29,43],[-27.8,43],
    [-27.8,39.05],[-26.3,39.05],[-26.3,31.95],[-27.8,31.95],
    [-27.8,25.8],[-30.8,25.8],[-30.8,20.9],[-21.4,20.9],
    [-21.4,18.5],[-8.3,18.5],[-8.3,20.8],[-5.44,20.8],
    [-5.44,27.4],[-2.8,27.4],[-2.8,28.6],[-1.6,28.6]
  ];
  for(const side of [1,-1]){
    const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(side*x,-z)));
    const walk=new THREE.Mesh(new THREE.ShapeGeometry(shape),gravel);
    walk.rotation.x=-Math.PI/2;walk.position.y=.18;walk.receiveShadow=true;
    walk.name=(side===1?'West':'East')+' entrance wall walk';model.add(walk);
  }
  // Pink-marked doorway court: its flat side faces Reception and its curved
  // edge projects into the lawn. The central approach remains open through it.
  const {center:[cx,cz],radius}=FRONT_FORECOURT;
  const arc=Array.from({length:65},(_,i)=>{
    const angle=Math.PI-i*Math.PI/64;
    return [cx+radius*Math.cos(angle),cz+radius*Math.sin(angle)];
  });
  const courtShape=new THREE.Shape(arc.map(([x,z])=>new THREE.Vector2(x,-z)));
  const court=new THREE.Mesh(new THREE.ShapeGeometry(courtShape),material(0xa39e88));
  court.rotation.x=-Math.PI/2;court.position.y=.195;court.receiveShadow=true;
  court.name='Semicircular Reception paved forecourt';court.userData={outline:arc};model.add(court);
  const kerbMaterial=material(0xb8b9af);
  for(const side of [-1,1]){
    const edge=arc.filter(([x])=>side*(x-cx)>=1.8);
    const outer=edge.map(([x,z])=>[cx+(x-cx)*(radius+.22)/radius,cz+(z-cz)*(radius+.22)/radius]);
    const shape=new THREE.Shape([...edge,...outer.reverse()].map(([x,z])=>new THREE.Vector2(x,-z)));
    const kerb=new THREE.Mesh(new THREE.ShapeGeometry(shape),kerbMaterial);
    kerb.rotation.x=-Math.PI/2;kerb.position.y=.21;kerb.receiveShadow=true;
    kerb.name=(side<0?'West':'East')+' forecourt curved kerb';model.add(kerb);
  }
}
