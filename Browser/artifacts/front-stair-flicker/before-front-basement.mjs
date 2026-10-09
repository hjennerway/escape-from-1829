// Owner's marked front view, 27 September 2026: red entrances descend,
// the yellow walk follows the stepped facade, and the inner blue exits rise.
// Keep the window schedule and main entrance stairs at their existing heights.
import {mitreRightAngleWalls} from './wall-mitres.mjs';
export const FRONT_BASEMENT=Object.freeze({grade:.195,depth:1.215,steps:6,tread:.4});
export const FRONT_BASEMENT_OUTER_FLIGHT=Object.freeze({inner:28.35,outer:30.75,z:20.7,width:2});
const floorOutline=[
  [28.35,19.7],[22.6,19.7],[22.6,17.3],[7.1,17.3],
  [7.1,19.6],[4.24,19.6],[4.24,21.6],[9.1,21.6],
  [9.1,19.3],[20.6,19.3],[20.6,21.7],[28.35,21.7]
];
const excavationOutline=[
  [30.75,19.7],...floorOutline.slice(1,6),[4.24,24],[6.24,24],[6.24,21.6],
  ...floorOutline.slice(7,11),[30.75,21.7]
];
export const frontBasementExcavations=()=>[-1,1].map(side=>excavationOutline.map(([x,z])=>[side*x,z]));
export function frontBasementShape(THREE,outline){return new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));}

// Cut the continuous lawn and the old underlying access slab as well as the
// visible paving; otherwise those higher surfaces conceal the sunken walks.
export function excavatedGroundGeometry(THREE,outline,excavations=frontBasementExcavations()){
  const shape=frontBasementShape(THREE,outline);
  for(const hole of excavations)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
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
    const wallRuns=[];
    function wall(name,a,b,bottom,top,width,mat,barrier=false){
      const dx=b[0]-a[0],dz=b[1]-a[1];
      const mesh=block(name,mat,(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(dx,dz),width,bottom,top);
      mesh.rotation.y=-Math.atan2(dz,side*dx);mesh.userData.orientedCollision=true;
      mesh.userData.walkBarrier=barrier;wallRuns.push(mesh);return mesh;
    }
    surface('lower paving',floorOutline,level);
    // Extend only the exposed foundation below the original walls. The bottom
    // row of windows and upper masonry stay fixed. The blue doorway builder
    // shares this paving level so its sills follow the excavation.
    for(let i=0;i<5;i++)wall('exposed foundation '+i,floorOutline[i],floorOutline[i+1],level-.08,.02,.08,white);
    // Six original-height risers make the walk 50% deeper. The outer flight
    // runs along the facade from the blue-marked corner, not into the lawn.
    for(const [name,outer] of [['outer descent',true],['inner ascent',false]]){
      for(let i=0;i<steps;i++){
        const start=(outer?FRONT_BASEMENT_OUTER_FLIGHT.inner:21.6)+i*tread,end=start+tread,height=level+(i+1)*depth/steps;
        const x=outer?(start+end)/2:5.24,z=outer?20.7:(start+end)/2;
        const w=outer?tread:2,d=outer?2:tread;
        block(name+' riser '+(i+1),masonry,x,z,w,d,level-.08,height-.055);
        surface(name+' tread '+(i+1),[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]],height,.055);
        block(name+' nosing '+(i+1),nosing,outer?start+.02:x,outer?z:start+.02,outer?.04:2,outer?2:.04,height-.012,height+.002);
      }
    }
    // A stone retaining edge follows every exposed lawn boundary, including
    // the stair cheeks, leaving both stair mouths open. Offset into the lawn.
    const retaining=[
      [[4.16,19.6],[4.16,24]],[[6.32,24],[6.32,21.68]],
      [[6.32,21.68],[9.18,21.68]],[[9.18,21.68],[9.18,19.38]],
      [[9.18,19.38],[20.52,19.38]],[[20.52,19.38],[20.52,21.78]],
      [[20.52,21.78],[30.75,21.78]],[[28.35,19.62],[30.75,19.62]]
    ];
    retaining.forEach(([a,b],i)=>{
      // The outer stair's back wall meets the white facade at z=19.7.
      // Recess only the masonry above the facade's foot by 3 cm. The lower
      // wall must still meet the excavation at z=19.7 to conceal the terrain.
      if(i===7){
        wall('retaining wall '+i+' foundation',a,b,level-.08,0,.16,masonry,true);
        const setback=.03;
        wall('retaining wall '+i,[a[0],a[1]-setback/2],[b[0],b[1]-setback/2],0,grade-.025,.16-setback,masonry,true);
      }else wall('retaining wall '+i,a,b,level-.08,grade-.025,.16,masonry,true);
      wall('retaining coping '+i,a,b,grade-.025,grade+.055,.2,stone);
    });
    mitreRightAngleWalls(THREE,wallRuns);
  }
}
