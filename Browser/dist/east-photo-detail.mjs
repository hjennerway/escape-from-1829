// Visible east forecourt, from 20260912_172141.jpg and the user's camera mark.
// Coordinates are visual estimates. Keep the window schedule explicit so later
// photographs can correct individual openings without changing the whole estate.
import {addCourtyardPhotoDetails} from './courtyard-photo-detail.mjs';
import {addRearCourtPhotoDetails} from './rear-court-photo-detail.mjs';
export const EAST_PHOTO_VIEW=Object.freeze({position:[76,1.8,48],target:[53,5.4,21],fov:76});

export function eastPhotoProfile(x,z){
  return (Math.abs(x-54.875)<.01&&z===12)||
    (Math.abs(x-43.6)<.01&&z===23)||(Math.abs(x-42.1)<.01&&z===36)||
    (x===65.5&&z===20.75)||(Math.abs(x-74.425)<.01&&[8,15.5].includes(z));
}

export function addEastPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,steel,material}){
  const frame=material(0xd3dcd8),glass=material(0x78989f,{roughness:.48,metalness:.15});
  const recess=material(0x303d3d),blue=material(0x172e50),iron=material(0x454b49),stone=material(0xb2b6af);
  const openings=[];model.userData.eastPhotoOpenings=openings;
  function sash(face,x,y,z,rotation=0,w=1.12,h=2.45){
    openings.push({face,x,y,z,w,h});
    const dx=Math.cos(rotation),dz=-Math.sin(rotation),nx=Math.sin(rotation),nz=Math.cos(rotation);
    const part=(mat,u,v,n,pw,ph,pd)=>box(mat,x+dx*u+nx*n,y+v,z+dz*u+nz*n,pw,ph,pd,rotation);
    part(recess,0,0,0,w+.14,h+.12,.1);part(glass,0,0,.055,w,h,.06);
    for(const s of [-1,1])part(frame,s*w/2,0,.1,.065,h+.12,.09);
    for(const s of [-1,1])part(frame,0,s*h/2,.1,w+.12,.07,.09);
    // Three lights across, six high, with a slightly heavier sash meeting rail.
    for(const s of [-1,1])part(frame,s*w/6,0,.115,.025,h,.05);
    for(let i=1;i<6;i++)part(frame,0,-h/2+i*h/6,.12,w,i===3?.055:.025,.06);
    part(white,0,-h/2-.09,.14,w+.32,.12,.24);
    part(stone,0,h/2+.08,.04,w+.22,.12,.13);
  }
  function door(x,z,rotation=0,bottom=0){
    const dx=Math.cos(rotation),dz=-Math.sin(rotation),nx=Math.sin(rotation),nz=Math.cos(rotation);
    box(recess,x,bottom+1.48,z,1.65,2.96,.12,rotation);
    box(blue,x+nx*.1,bottom+1.36,z+nz*.1,1.42,2.72,.12,rotation);
    for(const side of [-1,1])box(white,x+dx*side*.81+nx*.16,bottom+1.5,z+dz*side*.81+nz*.16,.12,3.05,.16,rotation);
    box(glass,x+nx*.18,bottom+2.8,z+nz*.18,1.42,.32,.08,rotation);
    box(white,x+nx*.2,bottom+3.06,z+nz*.2,1.9,.17,.26,rotation);
    box(white,x+nx*.22,bottom+1.4,z+nz*.22,.04,2.55,.05,rotation);
    for(const side of [-1,1])box(steel,x+dx*side*.15+nx*.23,bottom+1.35,z+dz*side*.15+nz*.23,.045,.24,.07,rotation);
  }
  // The two-storey forward wing: nine positions on its east wall. The eighth
  // position is the blue entrance and upper escape door, not another window.
  const sideZ=[17.3,20,22.3,25.1,27.4,31.2,33.5,38.1,43];
  for(const z of sideZ)if(z!==38.1)for(const y of [2,6.25])sash('forward-wing-east',48.15,y,z,Math.PI/2,1.02,2.45);
  for(const y of [2,6.25])for(const x of [38.5,42.1,45.7])sash('forward-wing-end',x,y,45.05,0,1.08,2.45);
  for(const y of [2,6.25])for(const z of [29.5,34,38.5,43])sash('forward-wing-west',36.05,y,z,-Math.PI/2);
  door(48.18,38.1,Math.PI/2);door(48.18,38.1,Math.PI/2,4.25);
  // External metal stair descends along the wall from the upper blue door.
  box(iron,49.1,4.18,38.1,1.8,.14,2);
  for(let i=0;i<17;i++){
    const y=4.1-i*.24,z=36.95-i*.3;
    box(iron,49.1,y,z,1.6,.09,.32);
    for(const x of [48.35,49.88])box(iron,x,y+.53,z,.045,1.06,.045);
  }
  function rod(a,b,r=.025,mat=iron){
    const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);
    const m=mesh(new THREE.CylinderGeometry(r,r,v.length(),5),mat,...p.clone().add(q).multiplyScalar(.5).toArray());
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
  }
  for(const x of [48.35,49.88])rod([x,5.2,38.9],[x,5.2,36.95]);
  for(const x of [48.35,49.88])rod([x,5.2,36.95],[x,1.36,32.15]);
  // Three conspicuous tall chimney stacks with three pots each.
  for(const [z,h] of [[20,2.5],[33.4,3.8],[43.5,2.5]]){
    mesh(worldUV(new THREE.BoxGeometry(1.25,h,1.1),1.7),brick,43.8,10.1+h/2,z,true);
    box(stone,43.8,10.1+h,z,1.42,.16,1.26);
    for(const dx of [-.4,0,.4])mesh(new THREE.CylinderGeometry(.105,.13,.45,8),brick,43.8+dx,10.4+h,z,true);
  }
  // Recessed three-storey wall flanking the shallow polygonal bay. A broad
  // paired top sash and the blue entrance distinguish the right-hand recess.
  for(const y of [2,6.5,11])sash('pavilion-left',49.6,y,19.55,0,1.02,2.35);
  sash('pavilion-right',58.2,11,19.55,0,2.25,2.4);
  sash('pavilion-right',59.6,6.5,19.55,0,.55,2.2);
  door(58.4,19.6);
  box(white,58.4,3.55,20.05,3.25,.2,1.15);
  const bayX=53.1,bayZ=19,r=2.55;
  mesh(new THREE.CylinderGeometry(r,r,10.3,8),brick,bayX,9.15,bayZ,true).name='East curved bay';
  mesh(new THREE.CylinderGeometry(r,r,4,8),white,bayX,2,bayZ,true);
  for(const y of [4.06,8.8,14.28])mesh(new THREE.CylinderGeometry(r+.08,r+.08,.16,8),white,bayX,y,bayZ);
  mesh(new THREE.ConeGeometry(r+.24,1.15,8),roof,bayX,14.96,bayZ,true);
  // Windows sit on the three outward facets, with no windows buried in brick.
  const apothem=r*Math.cos(Math.PI/8);
  for(const angle of [-Math.PI/4,0,Math.PI/4])for(const y of [2,6.5,11]){
    // CylinderGeometry has vertices on +Z: rotate the body by half a segment
    // below so the middle facet is flat and these openings sit flush.
    sash('polygonal-bay',bayX+Math.sin(angle)*(apothem+.06),y,bayZ+Math.cos(angle)*(apothem+.06),angle,y===2?1.45:1.05,2.35);
  }
  for(const o of model.children)if(o.geometry?.type==='CylinderGeometry'&&o.position.x===bayX&&o.position.z===bayZ)o.rotation.y=Math.PI/8;
  // Square projecting pavilion: exactly two aligned openings on each storey
  // of its front face, and two on its exposed east return.
  for(const y of [2,6.5,11]){
    for(const x of [63.65,67.35])sash('square-front',x,y,25.05,0,1.15,2.45);
    for(const z of [18.4,22.4])sash('square-east',69.8,y,z,Math.PI/2,1.2,2.45);
  }
  // The low link sits below the pavilion's first-floor windows; the courtyard
  // opening remains walkable. Its taller rear block is set behind this roof.
  for(const y of [2,6.5])for(const x of [66.7,70.5,81.7]){
    if(x>79)sash('service-rear',x,y,4.45,Math.PI,1.05,2.2);
    if(x>79)sash('service-front',x,y,11.55,0,1.05,2.2);
  }
  for(const x of [71,81.7])sash('low-link',x,1.85,19.55,0,.95,2.15);
  // Dark rainwater pipes break up the long white ground storey.
  for(const z of [17,29,44.7])box(iron,48.3,4.1,z,.085,8.2,.085);
  for(const x of [61.4,69.6])box(iron,x,7,25.2,.085,14,.085);
  // Photo foreground: an access lane close to the building, a slim young tree
  // and lighting columns, leaving the window elevations readable.
  const asphalt=material(0x777d79),paving=material(0xb7b9ac),foliage=material(0x617849),bark=material(0x665c46);
  box(paving,61,.18,29.5,25,.1,2.1);box(asphalt,64,.19,33,31,.1,4.6);
  mesh(new THREE.CylinderGeometry(.09,.14,5.6,7),bark,55.5,2.8,30,true);
  for(let i=0;i<13;i++){
    const a=i*2.4,y=3.1+i*.38,s=.6+Math.sin(i*1.9)*.18;
    const crown=mesh(new THREE.IcosahedronGeometry(1,1),foliage,55.5+Math.sin(a)*.38,y,30+Math.cos(a)*.35,true);
    crown.scale.set(s,s*1.35,s);
  }
  for(const [x,z,h] of [[55,43,11.8],[75,31,8]]){
    mesh(new THREE.CylinderGeometry(.06,.095,h,8),steel,x,h/2,z,true);
    rod([x,h-.12,z],[x+1.3,h-.35,z],.06,steel);
    box(iron,x+1.4,h-.4,z,.8,.1,.3);
  }
  addCourtyardPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass});
  addRearCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass});
}
