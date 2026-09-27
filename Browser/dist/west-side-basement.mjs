import {FRONT_BASEMENT,frontBasementShape} from './front-basement.mjs';

// Owner's marked west-side view, 27 September 2026. Enter beside the glazed
// rear end. The follow-up arrow turns the descent towards the wing (+X),
// with the door on the gallery side at the blue X, not beside the lean-to.
export const WEST_SIDE_BASEMENT=Object.freeze({
  grade:-.145,level:FRONT_BASEMENT.grade-FRONT_BASEMENT.depth,
  entry:-35.7,stairX:-42,steps:6,tread:.4,outer:-39.8,end:-1
});
const outline=startX=>[
  [startX,-35.7],[-37.84,-35.7],[-37.84,-30.5],[-37.5,-30.5],
  [-37.5,-24.5],[-37,-24.5],[-37,-1],[-39,-1],[-39,-4.5],
  [-39.8,-4.5],[-39.8,-33.7],[startX,-33.7]
];
export const westSideBasementExcavation=()=>outline(WEST_SIDE_BASEMENT.stairX);
// Remove the obsolete underlying access slab beneath the lowered courtyard,
// its gentle southern transition and the stair's ground-level approach.
export const westCourtAccessExcavation=()=>[
  [-73.5,-38],[-37.84,-38],[-37.84,-30.5],[-37.5,-30.5],
  [-37.5,-24.5],[-37,-24.5],[-37,0],[-55.5,0],[-55.5,4],[-73.5,4]
];

export function addWestSideBasement(THREE,{model,material,brick,worldUV}){
  const {grade,level,entry,stairX,steps,tread,outer}=WEST_SIDE_BASEMENT;
  const group=new THREE.Group();group.name='West side semi-basement';
  group.userData.estateSection='1829';group.userData.walkSurfaces=[];model.add(group);
  const stone=material(0xb8b8aa),white=material(0xe1e3dc),blue=material(0x172e50),nosing=material(0x8e9188);
  const glass=material(0x78989f,{roughness:.48,metalness:.15}),iron=material(0x454b49);
  const galleryBrick=material(0xc5a38d,{map:brick.map});
  const mainBrick=material(0xb3a5a0,{map:brick.map});
  brick=galleryBrick;
  function block(name,mat,x,z,w,d,bottom,top,barrier=false){
    const geometry=new THREE.BoxGeometry(w,top-bottom,d);
    const mesh=new THREE.Mesh(mat.map===brick.map?worldUV(geometry,1.7):geometry,mat);
    mesh.position.set(x,(bottom+top)/2,z);mesh.name='West side basement '+name;
    mesh.castShadow=mesh.receiveShadow=true;mesh.userData.walkBarrier=barrier;
    group.add(mesh);return mesh;
  }
  function paving(name,points,height){
    const mesh=new THREE.Mesh(new THREE.ShapeGeometry(frontBasementShape(THREE,points)),stone);
    mesh.rotation.x=-Math.PI/2;mesh.position.y=height;
    mesh.name='West side basement '+name;mesh.receiveShadow=true;group.add(mesh);
    group.userData.walkSurfaces.push({outline:points,height,grade});return mesh;
  }
  const bottom=stairX+steps*tread;
  paving('lower passage',outline(bottom),level);
  paving('upper approach',[[stairX-1,entry],[stairX,entry],[stairX,entry+2],[stairX-1,entry+2]],grade);
  for(let i=0;i<steps;i++){
    const x=stairX+i*tread,height=grade-(grade-level)*(i+1)/steps;
    block('step '+(i+1)+' riser',brick,x+tread/2,entry+1,tread,2,level-.12,height-.055);
    block('step '+(i+1)+' stone',stone,x+tread/2,entry+1,tread,2,height-.055,height);
    paving('step '+(i+1)+' tread',[[x,entry],[x+tread,entry],[x+tread,entry+2],[x,entry+2]],height+.001);
    block('step '+(i+1)+' nosing',nosing,x+tread-.025,entry+1,.05,2,height-.015,height+.003);
  }
  // Extend the exposed foundations down to the new floor without moving any
  // of the existing windows or upper walls. The lean-to closes the outer end.
  for(const [x,z0,z1] of [[-37.79,entry,-30.5],[-37.45,-30.5,-24.5],[-36.95,-24.5,-1],[-39.05,-4.5,-1]])
    block('exposed foundation '+z0+' '+x,x===-37.79?galleryBrick:mainBrick,x,(z0+z1)/2,.12,z1-z0,level-.12,x===-37.79?.3:.02,true);
  block('foundation return',brick,-37.23,-24.46,.58,.1,level-.12,.02,true);
  block('end foundation',brick,-38,-.96,2,.12,level-.12,.02,true);
  // The right-hand edge rises only 32 cm above the courtyard. The stair mouth
  // stays open, and the wall meets the lean-to flank at the far end.
  block('retaining wall',brick,outer-.1,(-33.7-4.5)/2,.2,29.2,level-.12,grade+.24,true);
  block('retaining coping',stone,outer-.1,(-33.7-4.5)/2,.28,29.2,grade+.24,grade+.32);
  for(const [name,z,left,right] of [['rear stair cheek',entry-.1,stairX,-37.84],['front stair cheek',entry+2.1,stairX,outer]]){
    block(name,brick,(left+right)/2,z,right-left,.2,level-.12,grade+.24,true);
    block(name+' coping',stone,(left+right)/2,z,right-left,.28,grade+.24,grade+.32);
  }
  block('retaining end return',brick,-39.44,-4.48,.92,.16,level-.12,grade+.24,true);
  block('retaining end coping',stone,-39.44,-4.48,1,.24,grade+.24,grade+.32);
  const doorX=-37.94,doorZ=entry+1,doorTop=level+2.35;
  block('end door',blue,doorX,doorZ,.12,1.28,level,doorTop,true);
  for(const z of [doorZ-.72,doorZ+.72])block('door jamb',white,doorX-.04,z,.16,.13,level,doorTop+.1);
  block('door lintel',white,doorX-.04,doorZ,.18,1.6,doorTop,doorTop+.13);
  block('door upper glazing',glass,doorX-.075,doorZ,.04,1.05,doorTop-.65,doorTop-.13);
  block('door glazing bar',white,doorX-.1,doorZ,.04,.035,doorTop-.65,doorTop-.13);
  block('door handle',iron,doorX-.13,doorZ+.43,.05,.04,level+.98,level+1.18);
  block('door threshold',stone,doorX-.13,doorZ,.24,1.6,level-.055,level+.015);
}
