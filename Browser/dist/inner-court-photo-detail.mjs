// img3.jpg and img14.jpg: inner eastern court, viewed from the rear and side.
// Architectural proportions are visual estimates; planting and plain ironwork
// adapt the present-day photograph to the game's circa-1900 grounds.
import {addInnerEastElevation} from './inner-east-elevation.mjs';
export const INNER_COURT_PHOTO_VIEW=Object.freeze({position:[10,1.8,-44],target:[23,6,-26],fov:66});
// The marked rear aerial supersedes the earlier three-level interpretation:
// both stair sections continue the main roof, above matching sloping annexes.
export const INNER_COURT_SIDE_PROFILE=Object.freeze({rear:-35.5,join:-30.5,front:-24.5,stairShift:4,rearEaves:8.3,frontEaves:10.1,eaves:14.3});
export function innerCourtPhotoProfile(x,z){return x===31&&z===-30;}

export function addInnerCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone},options={}){
  const start=model.userData.eastPhotoOpenings.length;
  const plinth=material(0xddd0ae,{map:brick.map}),lawn=material(0x638046),bark=material(0xc0bcb0);
  const leaves=[material(0x496b3a),material(0x567943),material(0x65854a)];
  // Move the occupied stair section towards +Z (the front), replacing the
  // blank red-circled stretch. The rear footprint becomes the low annex.
  const profile=options.profile||INNER_COURT_SIDE_PROFILE;
  const eaves=profile.eaves;
  const stairCentre=(profile.join+profile.front)/2,stairDepth=profile.front-profile.join;
  mesh(worldUV(new THREE.BoxGeometry(13,eaves-2,stairDepth),1.7),brick,31,(eaves+2)/2,stairCentre,true).name='Inner court projecting brick block';
  mesh(worldUV(new THREE.BoxGeometry(13,2,11),1.7),plinth,31,1,-30,true);
  box(white,31,eaves-.1,stairCentre,13.25,.2,stairDepth+.25);
  // The yellow-circled roof rises towards the stair block. Build both its
  // sloping brick side walls and pitched slate surface, not a flat cap.
  const annexDepth=profile.join-profile.rear,annexCentre=(profile.rear+profile.join)/2;
  const rise=profile.frontEaves-profile.rearEaves,slope=rise/annexDepth;
  mesh(worldUV(new THREE.BoxGeometry(13,profile.rearEaves-2,annexDepth),1.7),brick,31,(profile.rearEaves+2)/2,annexCentre,true).name='Inner court low rear annex';
  const wedge=new THREE.BufferGeometry();
  const points=[[-6.5,0,-annexDepth/2],[6.5,0,-annexDepth/2],[-6.5,0,annexDepth/2],[6.5,0,annexDepth/2],[-6.5,rise,annexDepth/2],[6.5,rise,annexDepth/2]];
  const faces=[[0,4,2],[1,3,5],[2,4,5],[2,5,3],[0,1,5],[0,5,4],[0,2,3],[0,3,1]].map(face=>face.reverse());
  wedge.setAttribute('position',new THREE.Float32BufferAttribute(faces.flatMap(f=>f.flatMap(i=>points[i])),3));
  wedge.setAttribute('uv',new THREE.Float32BufferAttribute(faces.flatMap(f=>f.flatMap(i=>[points[i][0]/1.7,points[i][1]/1.7])),2));
  wedge.computeVertexNormals();
  mesh(worldUV(wedge,1.7),brick,31,profile.rearEaves,annexCentre,true).name='Inner court sloping annex walls';
  const pitch=-Math.atan(slope),roofLength=(annexDepth+.8)/Math.cos(pitch),roofY=(profile.rearEaves+profile.frontEaves)/2;
  const annexRoof=mesh(new THREE.BoxGeometry(13.8,.16,roofLength),roof,31,roofY,annexCentre,true);
  annexRoof.rotation.x=pitch;annexRoof.name='Inner court rear annex sloped roof';
  for(const x of [24.4,37.6])mesh(new THREE.BoxGeometry(.18,.18,roofLength),white,x,roofY,annexCentre).rotation.x=pitch;
  for(const z of [profile.rear-.3,profile.join+.3])box(white,31,roofY+(z-annexCentre)*slope,z,13.4,.18,.18);
  if(!options.customOuterFaces){
    for(const x of [24.6,28.85,33.15,37.4])box(white,x,1,-35.57,.16,2,.12);
    box(stone,31,2.04,-35.6,13.15,.16,.26);
    box(stone,24.42,2.04,-30,.26,.16,11);
    // The low rear has basement and upper windows. The former top row belongs
    // on the exposed end of the moved stair section, above the annex roof.
    for(const x of [28.8,33.2])sash('inner-block-basement',x,1.1,-35.57,Math.PI,1.2,1.2);
    for(const x of [27,31,35])sash('inner-block-north',x,6.35,-35.57,Math.PI,1.22,2.5);
    for(const x of [27,31,35])sash('inner-stair-north',x,11.55,profile.join-.07,Math.PI,x===31?2.05:1.12,2.7);
    for(const x of [28.8,36.8])box(iron,x,4.1,-35.8,.09,8.2,.09);
  }
  for(const y of [1.1,6.35])sash('inner-annex-west',24.43,y,-33.3,-Math.PI/2,1.35,y===1.1?1.2:2.5);
  for(const y of [1.1,4.15,7.9])sash('inner-block-west',24.43,y,-33.3+profile.stairShift,-Math.PI/2,1.1,y===1.1?1.4:2.2);
  door(24.42,-29.8+profile.stairShift,-Math.PI/2,2.4);door(24.42,-29.8+profile.stairShift,-Math.PI/2,5.9);
  if(!options.customOuterFaces){
    sash('inner-block-west',24.43,11.15,-33.3+profile.stairShift,-Math.PI/2,1.1,2.7);
    for(const y of [1.1,6.35])sash('inner-annex-east',37.56,y,-33,Math.PI/2,1.1,y===1.1?1.2:2.5);
    for(const y of [1.1,4.15,7.9,11.15])for(const z of [-29,-25.8])sash('inner-block-east',37.56,y,z,Math.PI/2,1.1,y===1.1?1.4:2.2);
  }
  const stairs=new THREE.Group();stairs.name='Inner court iron stairs';model.add(stairs);
  function rail(a,b,r=.03){rod(a,b,r);stairs.attach(model.children[model.children.length-1]);}
  function flight(x,z0,y0,z1,y1,width=1.45){
    const count=18;
    for(let i=0;i<count;i++){
      const t=(i+.5)/count,z=z0+(z1-z0)*t,y=y0+(y1-y0)*t;
      box(iron,x,y,z,width,.075,Math.abs(z1-z0)/count+.03);
      for(const side of [-1,1])box(iron,x+side*width/2,y+.53,z,.035,1.06,.035);
    }
    for(const side of [-1,1]){
      const px=x+side*width/2;
      rail([px,y0+1.06,z0],[px,y1+1.06,z1]);
      rail([px,y0-.1,z0],[px,y1-.1,z1],.065);
    }
  }
  const stairBox=(mat,x,y,z,...size)=>box(mat,x,y,z+profile.stairShift,...size);
  const stairRail=(a,b,r)=>rail([a[0],a[1],a[2]+profile.stairShift],[b[0],b[1],b[2]+profile.stairShift],r);
  const stairFlight=(x,z0,y0,z1,y1)=>flight(x,z0+profile.stairShift,y0,z1+profile.stairShift,y1);
  // img14 resolves three flights and stacked doors. The middle flight turns
  // at a half-landing, rather than meeting a displaced doorway.
  for(const y of [2.4,5.9]){
    stairBox(iron,22.8,y,-29.8,3.2,.14,1.8);
    stairRail([21.2,y+1.06,-28.9],[24.4,y+1.06,-28.9]);
    for(let i=0;i<12;i++)stairBox(iron,21.2+i*.28,y+.53,-28.9,.035,1.06,.035);
  }
  stairBox(iron,21.9,4.15,-34.1,2.1,.14,1.6);
  stairFlight(21.9,-30.7,5.9,-34.1,4.15);
  stairFlight(21.9,-34.1,4.15,-30.7,2.4);
  stairFlight(20.3,-29.8,2.4,-34.1,.3);
  stairBox(iron,20.8,2.4,-29.8,1.4,.14,1.8);
  for(const [x,z,h] of [[21.2,-28.9,5.9],[24.2,-28.9,5.9],[21,-34.8,4.15],[22.8,-34.8,4.15]])stairRail([x,.2,z],[x,h+1.06,z],.075);
  stairRail([21,5.21,-34.8],[22.8,5.21,-34.8]);
  for(let i=0;i<7;i++)stairBox(iron,21+i*.3,4.68,-34.8,.035,1.06,.035);
  // The opposite central-arm stair is positioned by the img11 module.

  // Raised grass, rough stone edging and low white gate walls. The gravel
  // route continues around the garden and through to the rear road.
  if(options.includeGrounds!==false){
    box(plinth,14,.43,-29,8.5,.5,9);
    box(lawn,14,.72,-29,8.5,.1,9);
    for(let row=0;row<2;row++)for(let i=0;i<13;i++){
      const rock=mesh(new THREE.DodecahedronGeometry(.42,0),stone,10+i*.64+(row%2)*.15,.3+row*.3,-33.65,true);
      rock.scale.set(1,.55,.55);rock.rotation.y=i*1.7;
    }
    box(white,17.2,.62,-33.7,2.4,.95,.36);
    box(stone,17.2,1.13,-33.7,2.6,.14,.48);
    for(const x of [16,18.4]){
      box(white,x,.72,-33.7,.55,1.25,.55);
      mesh(new THREE.ConeGeometry(.42,.25,4),stone,x,1.46,-33.7).rotation.y=Math.PI/4;
    }
    // A birch at the left edge frames the facade without hiding its windows.
    const trees=model.getObjectByName('Trees');
    const trunk=mesh(new THREE.CylinderGeometry(.17,.3,7.7,8),bark,26,4.55,-43,true);
    trunk.rotation.z=-.05;trees.add(trunk);
    for(let i=0;i<22;i++){
      const a=i*2.4,y=5.5+(i%6)*.62;
      const crown=mesh(new THREE.IcosahedronGeometry(1,1),leaves[i%3],25.8+Math.sin(a)*1.55,y,-43+Math.cos(a)*1.45,true);
      crown.scale.set(.85,1.45,.85);trees.add(crown);
    }
    for(let i=0;i<10;i++){
      const shrub=mesh(new THREE.IcosahedronGeometry(.52,1),leaves[i%3],18.2,.95,-32+i*.68,true);
      shrub.scale.set(1,.85,1);
    }
  }
  model.userData.innerCourtPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
  addInnerEastElevation(THREE,{model,box,mesh,worldUV,white,brick,roof,sash,iron,stone});
}
