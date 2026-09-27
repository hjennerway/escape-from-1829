// Owner's marked front view, 27 September 2026: red entrances descend,
// the yellow walk follows the stepped facade, and the inner blue exits rise.
// Keep the window schedule and main entrance stairs at their existing heights.
export const FRONT_BASEMENT=Object.freeze({grade:.195,depth:.81,steps:4,tread:.4});
const floorOutline=[
  [28.95,19.7],[22.6,19.7],[22.6,17.3],[7.1,17.3],
  [7.1,19.6],[4.24,19.6],[4.24,21.6],[9.1,21.6],
  [9.1,19.3],[20.6,19.3],[20.6,21.7],[28.95,21.7]
];
const excavationOutline=[
  ...floorOutline.slice(0,6),[4.24,23.2],[6.24,23.2],[6.24,21.6],
  ...floorOutline.slice(7,11),[25.15,21.7],[25.15,23.3],
  [27.15,23.3],[27.15,21.7],[28.95,21.7]
];
export const frontBasementExcavations=()=>[-1,1].map(side=>excavationOutline.map(([x,z])=>[side*x,z]));
export function frontBasementShape(THREE,outline){return new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));}

// Cut the continuous lawn and the old underlying access slab as well as the
// visible paving; otherwise those higher surfaces conceal the sunken walks.
export function excavatedGroundGeometry(THREE,outline){
  const shape=frontBasementShape(THREE,outline);
  for(const hole of frontBasementExcavations())shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  return new THREE.ShapeGeometry(shape);
}

export function addFrontBasement(THREE,{model,material}){
  const {grade,depth,steps,tread}=FRONT_BASEMENT,level=grade-depth;
  const stone=material(0xb8b8aa),masonry=material(0x79665c),white=material(0xe1e3dc),nosing=material(0x8e9188);
  for(const side of [-1,1]){
    const group=new THREE.Group(),label=(side<0?'West':'East')+' semi-basement';
    group.name=label+' walk';group.userData.estateSection='1829';
    group.userData.walkSurfaces=[];model.add(group);
    const reflect=points=>points.map(([x,z])=>[side*x,z]);
    function surface(name,outline,height,thickness=0){
      const points=reflect(outline),shape=frontBasementShape(THREE,points);
      const geometry=thickness?new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false}):new THREE.ShapeGeometry(shape);
      const mesh=new THREE.Mesh(geometry,stone);
      mesh.rotation.x=-Math.PI/2;mesh.position.y=height-thickness;mesh.name=label+' '+name;
      mesh.receiveShadow=true;group.add(mesh);
      group.userData.walkSurfaces.push({outline:points,height,grade});return mesh;
    }
    function block(name,mat,x,z,w,d,bottom,top){
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,top-bottom,d),mat);
      mesh.position.set(side*x,(bottom+top)/2,z);mesh.name=label+' '+name;
      mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;
    }
    function wall(name,a,b,bottom,top,width,mat,barrier=false){
      const dx=b[0]-a[0],dz=b[1]-a[1];
      const mesh=block(name,mat,(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(dx,dz),width,bottom,top);
      mesh.rotation.y=-Math.atan2(dz,side*dx);mesh.userData.orientedCollision=true;
      mesh.userData.walkBarrier=barrier;return mesh;
    }
    surface('lower paving',floorOutline,level);
    // Extend only the exposed foundation below the original walls. The bottom
    // row of windows, blue doors and all existing upper masonry stay fixed.
    for(let i=0;i<5;i++)wall('exposed foundation '+i,floorOutline[i],floorOutline[i+1],level-.08,.02,.08,white);
    // Four equal risers at each end, running towards the lawn. Both flights
    // meet the same lower walk and the original approach at the upper edge.
    for(const [name,x,z] of [['outer descent',26.15,21.7],['inner ascent',5.24,21.6]]){
      for(let i=0;i<steps;i++){
        const back=z+i*tread,front=back+tread,height=level+(i+1)*depth/steps;
        block(name+' riser '+(i+1),masonry,x,(back+front)/2,2,tread,level-.08,height-.055);
        surface(name+' tread '+(i+1),[[x-1,back],[x+1,back],[x+1,front],[x-1,front]],height,.055);
        block(name+' nosing '+(i+1),nosing,x,back+.02,2,.04,height-.012,height+.002);
      }
    }
    surface('outer upper landing',[[25.15,23.3],[30.1,23.3],[30.1,24.5],[25.15,24.5]],grade);
    // A stone retaining edge follows every exposed lawn boundary, including
    // the stair cheeks, leaving both stair mouths open. Offset into the lawn.
    const retaining=[
      [[4.16,19.6],[4.16,23.2]],[[6.32,23.2],[6.32,21.68]],
      [[6.32,21.68],[9.18,21.68]],[[9.18,21.68],[9.18,19.38]],
      [[9.18,19.38],[20.52,19.38]],[[20.52,19.38],[20.52,21.78]],
      [[20.52,21.78],[25.07,21.78]],[[25.07,21.78],[25.07,23.3]],
      [[27.23,23.3],[27.23,21.78]],[[27.23,21.78],[29.03,21.78]],
      [[29.03,21.78],[29.03,19.7]]
    ];
    retaining.forEach(([a,b],i)=>{
      wall('retaining wall '+i,a,b,level-.08,grade-.025,.16,masonry,true);
      wall('retaining coping '+i,a,b,grade-.025,grade+.055,.2,stone);
    });
  }
}
