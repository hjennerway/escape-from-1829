// Narrow gravel walks follow the entrance elevations and join the central
// approach around the split staircase. Each lawn stays otherwise unbroken.
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
}
