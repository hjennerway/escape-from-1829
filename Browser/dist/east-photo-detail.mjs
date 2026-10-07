import {addRedesmereGardenDetails} from './redesmere-garden-photo-detail.mjs';
import {addExteriorStairRail} from './exterior-stair-rail.mjs';
import {joinEastEntranceRoof} from './east-entrance-roof-join.mjs';
import {addEastForwardEndPhotoDetails} from './east-forward-end-photo-detail.mjs';
import {addWestForwardEndPhotoDetails} from './west-forward-end-photo-detail.mjs';
import {addEastEntranceMirror} from './entrance-symmetry.mjs';
import {addWestWingPhotoDetails} from './west-wing-photo-detail.mjs';
// Visible east forecourt, from 20260912_172141.jpg and the user's camera mark.
// Coordinates are visual estimates. Keep the window schedule explicit so later
// photographs can correct individual openings without changing the whole estate.
import {addWestFrontPhotoDetails} from './west-front-photo-detail.mjs';
import {addWestCourtPhotoDetails} from './west-court-photo-detail.mjs';
import {addWestCantedBay} from './west-refinement.mjs';
import {addCourtyardPhotoDetails} from './courtyard-photo-detail.mjs';
import {addRearCourtPhotoDetails} from './rear-court-photo-detail.mjs';
import {addRedesmerePhotoDetails} from './redesmere-photo-detail.mjs';
import {addWestLawnPhotoDetails} from './west-lawn-photo-detail.mjs';
import {addEntranceWestPhotoDetails} from './entrance-west-photo-detail.mjs';
import {addInnerCourtPhotoDetails} from './inner-court-photo-detail.mjs';
import {addCentralCourtPhotoDetails} from './central-court-photo-detail.mjs';
export const EAST_PHOTO_VIEW=Object.freeze({position:[76,1.8,48],target:[53,5.4,21],fov:76});

export function eastPhotoProfile(x,z){
  return (Math.abs(x-54.175)<.01&&z===12)||
    (x===36.5&&z===23)||(x===35&&z===35)||
    (x===66&&z===16.15)||
    (Math.abs(x-81.875)<.01&&z===8);
}

export function addEastPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,steel,material,hipRoof,details}){
  const {frame,glass,iron,stone,sash,door,rod}=details;
  // The blue-marked strip is flush with the bay frontage, not recessed at
  // z=17. Only the garden side is filled; retain the rear courtyard outline.
  mesh(worldUV(new THREE.BoxGeometry(4.1,10.3,2.5),1.7),brick,43.05,9.15,18.25,true).name='Redesmere flush frontage brick';
  mesh(new THREE.BoxGeometry(4.1,4,2.5),white,43.05,2,18.25,true).name='Redesmere flush frontage white base';
  for(const y of [4.06,8.8])box(white,51.125,y,19.52,20.25,.18,.2);
  for(const [y,h,d] of [[14.18,.22,.23],[14.42,.22,.48]])
    box(white,43.05,y,18.25,4.1+d,h,2.5+d);
  // One stepped hip covers the original range and the filled strip. The
  // courtyard eaves and ridge stay in place, with no small detached hip.
  const roofPoints=[
    [44.7,14.55,4.1],[63.65,14.55,4.1],[63.65,14.55,19.9],
    [40.6,14.55,19.9],[40.6,14.55,16.6],[44.7,14.55,16.6],
    [51.257,16.2,12],[57.093,16.2,12]
  ];
  const roofFaces=[[0,1,7],[0,7,6],[1,2,7],[2,3,6],[2,6,7],[3,4,5],[3,5,6],[5,0,6]];
  const positions=[],uv=[];
  for(const face of roofFaces)for(const i of [...face].reverse()){
    const [x,y,z]=roofPoints[i];positions.push(x,y,z);uv.push(x/3,(z+y-14.55)/3);
  }
  const rangeRoof=new THREE.BufferGeometry();
  rangeRoof.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  rangeRoof.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rangeRoof.computeVertexNormals();
  mesh(rangeRoof,roof,0,0,0,true).name='Redesmere aligned frontage slate roof';

  // The two-storey forward wing: nine positions on its east wall. The eighth
  // position is the blue entrance and upper escape door, not another window.
  const sideZ=[17.3,20,22.3,25.1,27.4,31.2,33.5,38.1,42];
  for(const z of sideZ)if(z!==38.1)for(const y of [2,6.25])sash('forward-wing-east',41.05,y,z,Math.PI/2,1.02,2.45);
  addEastForwardEndPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,material,sash,rod,iron});
  // The inner wall is the reflected img18 elevation, supplied below.
  door(41.08,38.1,Math.PI/2);door(41.08,38.1,Math.PI/2,4.25);
  // External metal stair descends along the wall from the upper blue door.
  const stair=new THREE.Group();stair.name='East forward external stair guards';model.add(stair);
  const guard=(a,b)=>addExteriorStairRail(THREE,stair,iron,a,b);
  box(iron,42,4.18,38.1,1.8,.14,2);
  for(let i=0;i<17;i++){
    const y=4.1-i*.24,z=36.95-i*.3;
    box(iron,42,y,z,1.6,.09,.32);
  }
  for(const x of [41.25,42.78])guard([x,4.15,36.95],[x,.31,32.15]);
  guard([42.78,4.25,39.1],[42.78,4.25,36.95]);
  guard([41.1,4.25,39.1],[42.78,4.25,39.1]);
  guard([41.1,4.25,37.1],[41.25,4.25,37.1]);
  // Three-storey wall flanking the shallow polygonal bay. The right-hand
  // entrance has broad middle glazing and a roof-access door above the
  // adjoining two-storey, blank-fronted projection (owner's September photo).
  // October owner's photo: one close pair on each brick storey, and a
  // three-light bank below. The former widely spaced singles overstated
  // the amount of blank wall between the forward wing and the canted bay.
  for(const y of [6.5,11.6])for(const x of [46.3,47.8])
    sash('pavilion-left-pair',x,y,19.55,0,1.3,2.35);
  for(const x of [45.6,47.1,48.6])sash('pavilion-left-triple',x,2,19.55,0,1.22,2.55);
  for(const x of [56.75,57.95])sash('pavilion-right',x,11.6,19.55,0,1.03,2.2);
  sash('pavilion-right',57.2,6.5,19.55,0,1.7,2.55);
  door(57.2,19.6);
  box(white,57.35,3.55,20.05,3.55,.2,1.15);
  const projectionLeft=59.2,projectionRight=62.25,projectionX=(projectionLeft+projectionRight)/2;
  const projectionWidth=projectionRight-projectionLeft;
  mesh(worldUV(new THREE.BoxGeometry(projectionWidth,5.35,5.5),1.7),brick,projectionX,6.675,22.25,true).name='Redesmere flat-roof projection brick';
  mesh(new THREE.BoxGeometry(projectionWidth,4,5.5),white,projectionX,2,22.25,true).name='Redesmere flat-roof projection white base';
  mesh(new THREE.BoxGeometry(projectionWidth+.18,.23,5.68),white,projectionX,9.465,22.25,true).name='Redesmere flat roof coping';
  const flatRoof=material(0x606868,{roughness:.94});
  mesh(new THREE.BoxGeometry(projectionWidth,.065,5.5),flatRoof,projectionX,9.6125,22.25,true).name='Redesmere flat roof';
  // Narrow pale door: lower solid panel and six glazed lights above. Its
  // threshold sits directly on the flat roof, not at a generic floor level.
  const doorX=60.22,doorBottom=9.645,doorZ=19.62,doorWidth=1.03,doorHeight=2.55;
  const paleDoor=material(0xc2cbc5),doorRecess=material(0x303d3d);
  const access=mesh(new THREE.BoxGeometry(doorWidth,doorHeight,.12),paleDoor,doorX,doorBottom+doorHeight/2,doorZ,true);
  access.name='Redesmere roof-access door';
  box(doorRecess,doorX,doorBottom+1.86,doorZ+.08,.78,1.12,.035);
  box(glass,doorX,doorBottom+1.86,doorZ+.11,.7,1.04,.035);
  for(const dx of [-.43,0,.43])box(frame,doorX+dx,doorBottom+1.86,doorZ+.14,.045,1.18,.06);
  for(const dy of [1.28,1.67,2.06,2.45])box(frame,doorX,doorBottom+dy,doorZ+.14,.88,.045,.06);
  for(const side of [-1,1])box(white,doorX+side*.6,doorBottom+1.31,doorZ,.12,2.72,.2);
  box(white,doorX,doorBottom+2.68,doorZ,1.35,.15,.24);
  box(iron,doorX+.32,doorBottom+1.15,doorZ+.12,.055,.15,.065);
  box(stone,doorX,doorBottom+.025,19.8,1.3,.05,.35);
  box(iron,59.13,4.65,25.08,.065,9.3,.065,0,true);
  // Match the west half-octagonal bays: one broad front, two canted cheeks,
  // matching bands/hip and world-scale brickwork instead of cylinder UVs.
  addWestCantedBay(THREE,{model,mesh,worldUV,brick,white,roof,sash},{
    x:53.1,z:19.45,side:1,name:'East curved bay',face:'polygonal-bay',
    width:4.8,depth:1.55,frontWidth:2.25,returnDepth:.275,height:14.3,baseHeight:4,roofRise:.5,
    bandHeights:[4.06,8.8,14.28,14.45],
    windowRows:[2,6.5,11.6].map(y=>({y,width:y===2?1.45:1.2,sideWidth:y===2?.85:.65,height:2.35}))
  });
  // Square projecting pavilion: exactly two aligned openings on each storey
  // of its front face, and two on its exposed east return.
  for(const y of [2,6.5,11.6]){
    for(const x of [64.05,67.45])sash('square-front',x,y,25.05,0,1.18,2.25);
    // The east return is scheduled separately from redesmere-edge/img3.jpg.
  }
  addRedesmereGardenDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron});
  // Separate service rooms stop at the lane; no windows float in the gap.

  for(const y of [2,6.5])for(const x of [66.7,70.5,81.7]){
    if(x>79)sash('service-rear',x,y,4.45,Math.PI,1.05,2.2);
    if(x>79)sash('service-front',x,y,11.55,0,1.05,2.2);
  }
  // Only the taller rear building has front windows above the low roof.
  sash('service-background',92.4,7.5,10.05,0,1.15,2.2);
  // Dark rainwater pipes break up the long white ground storey.
  for(const z of [17,29,42.7])box(iron,41.2,4.1,z,.085,8.2,.085,0,true);
  for(const x of [62.4,69.6])box(iron,x,7,25.2,.085,14,.085,0,true);
  // The garden cross-walk shares the continuous entrance/passage gravel in
  // entrance-walks.mjs; no differently coloured slab overlaps it here.
  // The marked east lawn column is removed in every period; retain the
  // separate light beside the Redesmere approach. The Hospital Shop red-X
  // correction moves the whole fixture onto the lawn beyond the wall-side path.
  for(const [x,z,h] of [[98.75,39,8]]){
    mesh(new THREE.CylinderGeometry(.06,.095,h,8),steel,x,h/2,z,true);
    rod([x,h-.12,z],[x+1.3,h-.35,z],.06,steel);
    box(iron,x+1.4,h-.4,z,.8,.1,.3);
  }
  addWestFrontPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,hipRoof});
  addWestForwardEndPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,material,sash,door,rod,iron});
  addWestCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,hipRoof});
  addCourtyardPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass,hipRoof});
  addInnerCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone});
  addWestWingPhotoDetails(THREE,{model,worldUV,white,brick,roof,steel,material,hipRoof});
  addCentralCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,sash,door,rod,iron,stone,hipRoof});
  addRearCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass});
  addRedesmerePhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron});
  addWestLawnPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,iron});
  addEntranceWestPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron,frame,glass});
  addEastEntranceMirror(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron,frame,glass});
  joinEastEntranceRoof(THREE,{model,mesh,roof,white,brick,worldUV});
}
