// img15 (looking east) and img16 (looking south). Build in the east arm's
// coordinates, reusing its inner elevation and stairs, then reflect at x=0.
import {addInnerCourtPhotoDetails,INNER_COURT_SIDE_PROFILE} from './inner-court-photo-detail.mjs';
import {photoDetailPrimitives} from './photo-detail-primitives.mjs';
import {wingWallGeometry,addWingRoofJunction} from './wing-roof-junctions.mjs';

export const WEST_WING_SIDE_VIEW=Object.freeze({position:[-65,1.8,-21],target:[-34,7,-12],fov:65});
export const WEST_WING_END_VIEW=Object.freeze({position:[-31,1.8,-60],target:[-31,7,-29],fov:57});
export const WEST_WING_PROFILE=INNER_COURT_SIDE_PROFILE;

export function addWestWingPhotoDetails(THREE,{model,worldUV,white,brick,roof,steel,material,hipRoof}){
  const wing=new THREE.Group();wing.name='West wing mirrored from east';
  const batches=new Map();
  function box(mat,x,y,z,w,h,d,rotation=0){
    if(!batches.has(mat))batches.set(mat,[]);
    batches.get(mat).push({x,y,z,w,h,d,rotation});
  }
  function mesh(geometry,mat,x=0,y=0,z=0,shadow=false){
    const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);
    m.castShadow=shadow;m.receiveShadow=true;wing.add(m);return m;
  }
  const ctx={model:wing,box,mesh,worldUV,white,brick,roof,steel,material};
  const details=photoDetailPrimitives(THREE,ctx),{sash,iron,stone,frame,glass}=details;
  // The same 12 x 30 main arm and 13 x 11 end footprint as the east wing.
  mesh(worldUV(wingWallGeometry(THREE),1.7),brick,31,7.15,-10,true).name='West wing main brick range';
  addInnerCourtPhotoDetails(THREE,{...ctx,...details},{
    profile:WEST_WING_PROFILE,customOuterFaces:true,includeGrounds:false
  });
  // Keep source object names distinct from the unaltered eastern originals.
  wing.traverse(o=>{if(o.name.startsWith('Inner '))o.name='West mirrored '+o.name;});
  // Pale eaves follow the stepped walls beneath one continuous grey hipped
  // roof, matching the other wings. The lower gallery roof stays separate.
  function cornice(x,z,w,d){
    box(white,x,14.05,z,w+.35,.16,d+.35);
    box(white,x,14.42,z,w+.35,.22,d+.35);
  }
  cornice(31,-27.5,13,6);
  // Build the junction in source coordinates before reflecting this group.
  addWingRoofJunction(THREE,{worldUV,brick,white,roof,
    mesh:(geometry,mat,x,y,z,...rest)=>mesh(geometry,mat,-x,y,z,...rest),
    box:(mat,x,y,z,...rest)=>box(mat,-x,y,z,...rest)
  },-1);
  const outerColumns=[-29,-25.8,-22,-18.1,-14.2,-10.3,-6.4,-2.5];
  for(const z of outerColumns){
    const x=z<-24.5?37.57:37.07;
    for(const y of [1.35,6.55,11.15])sash('west-wing-outer',x,y,z,Math.PI/2,1.4,y===1.35?1.85:2.9);
    box(stone,x+.04,8.65,z,.25,.1,.38);
  }
  for(const [x,z,d] of [[37.09,-10,30],[37.59,-27.5,6]]){
    box(white,x,4.02,z,.25,.4,d);
    if(z<-24.5)box(iron,x+.06,14,z,.13,.12,d);
  }
  // Three upper end openings: the central sash is wider with narrow sidelights.
  for(const x of [27,31,35])sash('west-wing-upper-end',x,11.55,-30.58,Math.PI,x===31?1.45:1.4,2.7);
  for(const x of [29.92,32.08])sash('west-wing-end-sidelight',x,11.55,-30.6,Math.PI,.48,2.7);

  // Cream-framed glazed gallery above three brick infill panels. The shared
  // sloping roof rises back towards the taller block, as on the east annex.
  const cream=material(0xded7bb),infill=material(0xc5a38d,{map:brick.map});
  box(cream,31,4,-35.62,13.15,8,.18);
  for(const x of [26.75,31,35.25]){
    mesh(worldUV(new THREE.BoxGeometry(3.95,3.35,.12),1.7),infill,x,1.95,-35.77,true);
    glazing(x,6.35,-35.78,Math.PI,3.8,2.5,9);
  }
  for(const x of [24.55,28.88,33.12,37.45])box(cream,x,4.05,-35.85,.2,8,.22);
  box(cream,37.62,4.2,-33,.16,8.1,5);
  mesh(worldUV(new THREE.BoxGeometry(.12,3.35,4.65),1.7),infill,37.76,1.95,-33,true);
  glazing(37.78,6.35,-33,Math.PI/2,4.55,2.5,10);
  function glazing(x,y,z,rotation,w,h,lights){
    const dx=Math.cos(rotation),dz=-Math.sin(rotation),nx=Math.sin(rotation),nz=Math.cos(rotation);
    const part=(mat,u,v,pw,ph)=>box(mat,x+dx*u+nx*.03,y+v,z+dz*u+nz*.03,pw,ph,.08,rotation);
    box(glass,x,y,z,w,h,.08,rotation);
    for(let i=0;i<=lights;i++)part(frame,-w/2+i*w/lights,0,i===0||i===lights?.07:.045,h+.1);
    for(const v of [-h/2,-.48,.45,h/2])part(frame,0,v,w+.1,.065);
    wing.userData.eastPhotoOpenings.push({face:'west-wing-gallery',x,y,z,w,h});
  }
  for(const x of [24.38,37.72])box(iron,x,4.1,-35.85,.09,8.2,.09);
  // Standing seams make the shallow slate/metal roof readable from ground level.
  const pitch=-Math.atan((WEST_WING_PROFILE.frontEaves-WEST_WING_PROFILE.rearEaves)/5);
  for(let x=24.4;x<37.7;x+=.7){
    const seam=mesh(new THREE.BoxGeometry(.035,.06,5.8/Math.cos(pitch)),iron,x,(WEST_WING_PROFILE.rearEaves+WEST_WING_PROFILE.frontEaves)/2+.11,-33);
    seam.rotation.x=pitch;
  }
  for(const z of [-24.45,4.75])box(iron,37.22,z>0?6.35:7,z,.09,z>0?12.7:14,.09);

  const dummy=new THREE.Object3D();
  for(const [mat,items] of batches){
    const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);batch.receiveShadow=true;
    items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.rotation,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});
    wing.add(batch);
  }
  // Reflect the entire geometry, including sloped surfaces, rails and normals.
  wing.scale.x=-1;model.add(wing);
  model.userData.westWingPhotoOpenings=wing.userData.eastPhotoOpenings.map(o=>({...o,x:-o.x}));
}
