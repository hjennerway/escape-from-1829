// Matching gravel walks connect Reception's semicircle to both entrance wings.
export const FRONT_FORECOURT=Object.freeze({center:[0,27.4],radius:13});
export function addEntranceWalks(THREE,{model,material}){
  const gravel=material(0xa39e88);
  function paving(shape,name,height=.195){
    const walk=new THREE.Mesh(new THREE.ShapeGeometry(shape,24),gravel);
    walk.rotation.x=-Math.PI/2;walk.position.y=height;walk.receiveShadow=true;
    walk.name=name;model.add(walk);return walk;
  }
  function polygon(points){return new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));}
  // Inner edge follows the stair cheeks, Reception, recessed frontage and bay;
  // widen the lawn-facing edge from 1.2 to 2 units without moving the masonry.
  const outline=[
    [-1.6,27.4],[-1.6,26.2],[-4.24,26.2],[-4.24,19.6],[-7.1,19.6],
    [-7.1,17.3],[-22.6,17.3],[-22.6,19.7],[-32,19.7],
    [-32,27],[-29,27],[-29,33.15],[-27.5,33.15],
    [-27.5,37.85],[-29,37.85],[-29,43.2],[-27,43.2],
    [-27,39.85],[-25.5,39.85],[-25.5,31.15],[-27,31.15],
    [-27,25],[-30,25],[-30,21.7],[-20.6,21.7],
    [-20.6,19.3],[-9.1,19.3],[-9.1,21.6],[-6.24,21.6],
    [-6.24,28.2],[-3.6,28.2],[-3.6,29.4],[-1.6,29.4]
  ];
  for(const side of [1,-1]){
    paving(polygon(outline.map(([x,z])=>[side*x,z])),(side===1?'West':'East')+' entrance wall walk');
  }
  const branchWidth=3.2,branchFront=FRONT_FORECOURT.center[1]+branchWidth;
  for(const side of [-1,1]){
    // A short inset overlaps the curved court; two tangent quarter-turns make
    // a gentle T-junction onto the wall walk, toward both the door and wing end.
    const shape=new THREE.Shape();
    shape.moveTo(side*12.4,-27.4);shape.lineTo(side*24.6,-27.4);
    shape.quadraticCurveTo(side*28.2,-27.4,side*28.2,-23.8);
    shape.lineTo(side*30.1,-23.8);shape.lineTo(side*30.1,-26.9);
    shape.lineTo(side*28.95,-27);shape.lineTo(side*28.95,-33);
    shape.lineTo(side*25.5,-33);
    shape.quadraticCurveTo(side*25.5,-branchFront,side*23.1,-branchFront);
    shape.lineTo(side*12.4,-branchFront);shape.closePath();
    paving(shape,(side<0?'West':'East')+' sweeping forecourt branch');
  }

  // The front aprons meet the widened inner walks and stop at the requested
  // destinations. The east return clears the iron stair and opens into the
  // existing Redesmere court; the west apron reaches the masonry stair foot.
  // Sit just above the old small front strips, avoiding a patchwork of colours.
  paving(polygon([[-27,43],[-29,43],[-47,43],[-47,48.6],[-27,48.6]]),
    'West wing path to fire exit stairs',.28);
  const east=new THREE.Shape();
  east.moveTo(27,-43);east.lineTo(41,-43);east.lineTo(41,-19.6);
  east.lineTo(45,-19.6);east.lineTo(45,-27.4);
  east.quadraticCurveTo(45,-28.45,46.1,-28.45);
  east.lineTo(48.6,-28.45);east.lineTo(48.6,-30.55);
  east.lineTo(46.1,-30.55);east.quadraticCurveTo(45,-30.55,45,-31.65);
  east.lineTo(45,-47.8);east.lineTo(27,-47.8);east.closePath();
  paving(east,'East wing path to Redesmere courtyard',.28);
  // Pink-marked doorway court: its flat side faces Reception and its curved
  // edge projects into the lawn. The central approach remains open through it.
  const {center:[cx,cz],radius}=FRONT_FORECOURT;
  const arc=Array.from({length:65},(_,i)=>{
    const angle=Math.PI-i*Math.PI/64;
    return [cx+radius*Math.cos(angle),cz+radius*Math.sin(angle)];
  });
  const court=paving(polygon(arc),'Semicircular Reception paved forecourt');court.userData={outline:arc};
  const kerbMaterial=material(0xb8b9af);
  for(const side of [-1,1]){
    // Open the curved edging across each new branch, as at the central approach.
    const first=[side*Math.sqrt(radius*radius-branchWidth*branchWidth)+cx,branchFront];
    const remaining=arc.filter(([x,z])=>side*(x-cx)>=1.8&&z>branchFront);
    const edge=side<0?[first,...remaining]:[...remaining,first];
    const outer=edge.map(([x,z])=>[cx+(x-cx)*(radius+.22)/radius,cz+(z-cz)*(radius+.22)/radius]);
    const shape=new THREE.Shape([...edge,...outer.reverse()].map(([x,z])=>new THREE.Vector2(x,-z)));
    const kerb=new THREE.Mesh(new THREE.ShapeGeometry(shape),kerbMaterial);
    kerb.rotation.x=-Math.PI/2;kerb.position.y=.21;kerb.receiveShadow=true;
    kerb.name=(side<0?'West':'East')+' forecourt curved kerb';model.add(kerb);
  }
}
