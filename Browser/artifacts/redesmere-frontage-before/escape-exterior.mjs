import {addWillowTrees} from './willow-trees.mjs';
import {addSurvivingLampPosts} from './surviving-lamp-posts.mjs';
import {matchEstateGrass} from './estate-grass.mjs';
import {createBowlingGreen} from './bowling-green.mjs';
import {photoDetailPrimitives} from './photo-detail-primitives.mjs';
import {refineFrontInsideCorners} from './front-inside-corners.mjs';
import {addCentralBack} from './central-back.mjs';
import {wingWallGeometry,addWingRoofJunction} from './wing-roof-junctions.mjs';
// Aerial interpretation of the user's outlined 1829 estate photograph.
// Front road/reception is +Z; the corrected mast position is rear-left (-X, -Z).
import {createTreeLayer} from './tree-layer.mjs';
import {ANNEXE_ROAD_TREES} from './annexe-road-trees.mjs';
import {addBeechTrees} from './front-lawn-trees.mjs';
import {addAdminPineTrees} from './admin-pine-trees.mjs';
import {addOakTrees} from './oak-trees.mjs';
import {westFrontPhotoProfile} from './west-front-photo-detail.mjs';
import {westCourtPhotoProfile,WEST_COURT_ALIGNMENT} from './west-court-photo-detail.mjs';
import {createChapel} from './chapel.mjs';
import {createChurchGrounds} from './church-grounds.mjs';
import {addFrontSteps} from './front-steps.mjs';
import {addFrontBoundaryWall,FRONT_BOUNDARY} from './front-boundary-wall.mjs';
import {addEntranceWalks} from './entrance-walks.mjs';
import {addRedesmerePassage,addRedesmereEndRange} from './redesmere-passage.mjs';
import {addRedesmereEdgeChimney} from './redesmere-edge-chimney.mjs';
import {createWaterTower} from './water-tower.mjs';
import {createEstateChimney} from './estate-chimney.mjs';
import {createAnnexe} from './annexe.mjs';
import {createChurtonWard} from './churton-ward.mjs';
import {createUptonFrithOscroft} from './upton-frith-oscroft.mjs';
import {createIrbyAshley} from './irby-ashley.mjs';
import {createGraftonEdge} from './grafton-edge.mjs';
import {createHaleWard} from './hale-daresbury-huxley-dunham.mjs';
import {createEstatesDepartment} from './estates-department.mjs';
import {createFarndon} from './farndon-ward.mjs';
import {createWitbyWard} from './witby-ward.mjs';
import {placeWard} from './ward-placement.mjs';
import {createLaundry} from './laundry.mjs';
import {createGaragesMortuary} from './garages-mortuary.mjs';
import {createGreenhouses} from './greenhouses.mjs';
import {createOuthouse} from './outhouse.mjs';
import {createWillows} from './willows.mjs';
import {createMainAdminBuilding} from './main-admin-building.mjs';
import {eastPhotoProfile,addEastPhotoDetails} from './east-photo-detail.mjs';
import {courtyardPhotoProfile} from './courtyard-photo-detail.mjs';
import {rearCourtPhotoProfile} from './rear-court-photo-detail.mjs';
import {redesmerePhotoProfile} from './redesmere-photo-detail.mjs';
import {innerCourtPhotoProfile,INNER_COURT_SIDE_PROFILE} from './inner-court-photo-detail.mjs';
export {MAP_REAR_PROPORTIONS} from './central-court-photo-detail.mjs';
// Red-X correction: Churton side of the north crossroads (road centre z=-99).
export const ESCAPE_MAST = Object.freeze({x:-69,z:-89,height:42});
const EAST_SHIFT=7.1,EXTRA_BAY=3.55;
// Retain the added east pavilion and the space made for the outer extension.
const EAST_PAVILION_WIDTH=16+EXTRA_BAY;
const OUTER_SHIFT=EAST_SHIFT+EXTRA_BAY+EAST_PAVILION_WIDTH;
// Map the supplied photograph directly onto the triangular tympanum. The UVs
// select just the relief, leaving the surrounding sky and building out of view.
export async function loadEscapeFrontage(THREE,exterior){
  const photo=await new THREE.TextureLoader().loadAsync('./exterior/1829front.webp');
  photo.colorSpace=THREE.SRGBColorSpace;photo.anisotropy=8;
  const relief=exterior.model.getObjectByName('Blue dragons and central coat of arms');
  relief.material.map=photo;relief.material.color.set(0xffffff);relief.material.needsUpdate=true;
}
export function createEscapeExterior(THREE,aspect){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xb5c7cd);
  scene.fog=new THREE.FogExp2(0xb5c7cd,.0019);
  const camera=new THREE.PerspectiveCamera(46,aspect,.5,2000);
  const model=new THREE.Group();model.name='1829 estate · aerial reconstruction';scene.add(model);
  const trees=createTreeLayer(THREE,model);
  addBeechTrees(THREE,trees);
  addAdminPineTrees(THREE,trees);
  addOakTrees(THREE,trees);
  addWillowTrees(THREE,trees);
  addSurvivingLampPosts(THREE,model);
  scene.add(new THREE.HemisphereLight(0xe4eff2,0x59634a,2));
  const sun=new THREE.DirectionalLight(0xffe2b7,2.8);sun.position.set(145,120,50);sun.target.position.set(230,0,-10);scene.add(sun.target);sun.castShadow=true;
  sun.shadow.mapSize.set(4096,4096);Object.assign(sun.shadow.camera,{left:-360,right:360,top:300,bottom:-300,near:1,far:850});sun.shadow.bias=-.0003;sun.shadow.normalBias=.25;scene.add(sun);
  // Buildings and sunlight are fixed. Camera movement does not change this map.
  sun.shadow.autoUpdate=false;
  const invalidateShadows=()=>{sun.shadow.needsUpdate=true;};
  invalidateShadows();
  const lawnColours=new Set([0x667752,0x638046,0x667b49]);
  const material=(color,extra={})=>{const mat=new THREE.MeshStandardMaterial({color,roughness:.9,...extra});if(lawnColours.has(color))mat.userData.estateGrass=true;return mat;};
  const cream=material(0xd6d0ba),stone=material(0xa39f8a),glass=material(0x56737d,{roughness:.4,metalness:.3}),dark=material(0x303b3b),red=material(0x762c30);
  const grass=material(0x667752),hedge=material(0x3f543b),gravel=material(0x99917b),path=material(0xb0ac97),steel=material(0x78848a,{metalness:.65,roughness:.5});
  const batches=new Map();let seed=1829;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function texture(draw){const c=document.createElement('canvas');c.width=c.height=512;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
  const bricks=texture(g=>{g.fillStyle='#897a69';g.fillRect(0,0,512,512);for(let r=0;r<16;r++)for(let c=-1;c<9;c++){const n=random()*25;g.fillStyle=`rgb(${108+n},${57+n*.6},${44+n*.5})`;g.fillRect(c*64+(r%2)*32+1,r*32+1,62,30);}for(let i=0;i<9000;i++){g.fillStyle=i%2?'#fff2':'#0002';g.fillRect(random()*512,random()*512,2,1);}});
  const slates=texture(g=>{g.fillStyle='#3e4c54';g.fillRect(0,0,512,512);for(let r=0;r<16;r++)for(let c=-1;c<10;c++){const n=Math.floor(random()*20);g.fillStyle=`rgb(${66+n},${76+n},${80+n})`;g.fillRect(c*60+(r%2)*30+1,r*32+1,58,30);}});
  const brick=material(0xffffff,{map:bricks}),roof=material(0xc4c9c6,{map:slates});
  const noise=texture(g=>{g.fillStyle='#c2bfae';g.fillRect(0,0,512,512);for(let i=0;i<19000;i++){g.fillStyle=i%2?'#242e2020':'#eef0d315';g.fillRect(random()*512,random()*512,2,2);}});noise.repeat.set(40,40);grass.map=noise;
  function box(mat,x,y,z,w,h,d,rotation=0){if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push({x,y,z,w,h,d,rotation});}
  function mesh(geo,mat,x=0,y=0,z=0,shadow=false){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;model.add(m);return m;}
  function worldUV(geo,scale=3){const p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/scale,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/scale);return geo;}
  const terrain=mesh(new THREE.PlaneGeometry(4000,4000),grass,0,-.15,0);terrain.rotation.x=-Math.PI/2;terrain.name='Estate terrain';
  const legacyAccess=new THREE.Group();legacyAccess.name='Earlier estate access tracks';model.add(legacyAccess);
  function legacyRoad(mat,x,y,z,w,h,d){const road=mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z);legacyAccess.add(road);}
  // Grounds and surrounding access roads. No red annotation or sale graphics.
  legacyRoad(path,OUTER_SHIFT/2,-.015,2,151+OUTER_SHIFT,.15,103);
  // Use the continuous terrain for the broad lawns. Raised duplicate slabs
  // leave thin vertical seams at the frontage, Parsons Lane and Redesmere.
  // Remove the old full-width outer gravel drive; retain the estate-side access lanes.
  legacyRoad(gravel,-79,.09,-2,10,.1,133);legacyRoad(gravel,79+OUTER_SHIFT,.09,0,9,.1,130);
  legacyRoad(gravel,OUTER_SHIFT/2,.11,-46,149+OUTER_SHIFT,.1,8);
  // The shared terrain supplies the frontage lawn without a duplicate raised panel.
  const approachEnd=FRONT_BOUNDARY.z+.5;
  const frontApproach=mesh(new THREE.BoxGeometry(3.2,.1,approachEnd-17),path,0,.13,(approachEnd+17)/2);frontApproach.name='Extended Reception approach';
  // The entrance lawns reach the boundary wall; cross-walks stop at the wings.
  box(path,37,.13,43,16,.1,2);
  // Extend the Redesmere end paving to the west apron at its existing z=44 axis.
  const gardenWalkEnd=69+OUTER_SHIFT-3.5;
  box(path,(45+gardenWalkEnd)/2,.16,44,gardenWalkEnd-45,.12,2);
  addEntranceWalks(THREE,{model,material});
  // Stone wall replaces the marked hedge frontage, with an open central path.
  // Stop before the saved lane turns across the frontage: retain a verge at the east tip.
  for(const [left,right] of [[-71,-58],[31,89]])box(hedge,(left+right)/2,.55,FRONT_BOUNDARY.z,right-left,1.1,.9);
  addFrontBoundaryWall(THREE,{model,material,worldUV});
  // Start from the western silhouette and reflect it across Reception.
  // Each tuple is [x, z, width, depth, eaves height]; front is +Z.
  const westBlocks=[
    [-46,12,16,15,14.3],[-31,-10,12,30,11.3],
    // A is the inset rear arm; B is slightly outboard, both inside the
    // western end pavilion. B has a narrow root and a wider stepped foot.
    [-36.5,23,9,14,8.6],[-35,35,12,16,8.6],
    [-31,-30,13,11,INNER_COURT_SIDE_PROFILE.eaves], // Detailed rear end built below.
    // Rooms tracing the irregular western silhouette: an outer end room,
    // a shorter front nib, and small rooms beside A's root. The curved bay
    // remains exposed between the outer rooms and B.
    [-56,13,9,16,9.3],[-54.5,23,6,6,7.2],
    [-40,-3,6,8,7.2],[-22.5,3,6,6,7.2]
  ];
  const eastBlocks=westBlocks.map(([x,z,w,d,h])=>[-x,z,w,d,h]);
  westBlocks[0]=[-48.6,(WEST_COURT_ALIGNMENT.wallZ+WEST_COURT_ALIGNMENT.gardenZ)/2,21.2,WEST_COURT_ALIGNMENT.gardenZ-WEST_COURT_ALIGNMENT.wallZ,14.3];
  // The fire-exit doors belong to the existing pavilion wall, not an extra
  // projecting stair tower. Its former block is omitted below.
  westBlocks[7]=[-39.6,3,7.2,8,11.3]; // Recessed link at the img6 courtyard corner.
  westBlocks[5]=[-62.5,10.25,7,10.5,14.3];
  westBlocks.push([-69,9.25,6,12.5,15.2]); // img3: the outer end has one level cornice.
  westBlocks.splice(6,1);
  eastBlocks[1][4]=14.3; // The courtyard return has three occupied storeys.
  // Approximate the red outline: a slightly longer front foot, a shallow
  // courtyard nib and a stepped outer corner joining the yellow extension.
  eastBlocks[3]=[35,36,12,18,8.6];
  eastBlocks[5]=[56,14,10,14,9.3];
  eastBlocks[6]=[54.5,23,6,6,7.2];
  eastBlocks[7]=[44,3,5,8,7.2];
  // Retain the previously adjusted front wing and first curved pavilion.
  // The blue-circled outer rooms move by one complete pavilion width to
  // make room for an identical second red-circled section on their left.
  for(const i of [0,2,3])eastBlocks[i][0]+=EAST_SHIFT;
  // img1 restores the narrow forward end: inner walls remain at x=29/32,
  // and the outer return, its windows and stairs align at x=41.
  eastBlocks[2]=[36.5,23,9,14,8.6];
  eastBlocks[3]=[35,35,12,16,8.6];
  eastBlocks[0][0]+=EXTRA_BAY/2;eastBlocks[0][2]+=EXTRA_BAY;
  // Stop the cross range at the courtyard bay's east return. The photographed
  // recess beside it is open back to z=7.3, rather than filled by this block.
  eastBlocks[0][0]-=.7;eastBlocks[0][2]-=1.4;
  for(const i of [5,6,7])eastBlocks[i][0]+=OUTER_SHIFT;

  // The photographs show separate buildings, not rooms bridging this lane.
  // Cut the rear service range at each side and omit the former corner infill.
  // The two tall end-room placeholders are replaced by the low brick range.
  eastBlocks.splice(5,3);
  const serviceRight=84.2,annexStart=79.55;
  const blocks=[
    [EAST_SHIFT/2,12,76+EAST_SHIFT,10,12.8],
    ...westBlocks,...eastBlocks,
    [(annexStart+serviceRight)/2,8,serviceRight-annexStart,7,9.3],
    // Yellow-shaded addition: long outer range and a stepped rear return.
    // Set the return back and towards the outer wing, leaving the rear-left
    // corner open beside the inset arm (which ends at x=37.5, z=-35.5).
    [59+OUTER_SHIFT,-14,10,48,9.3],
    [46+OUTER_SHIFT,-38,36,10,9.3],[46+OUTER_SHIFT,-44,32,4,9.3]
  ];
  function hipRoof(x,z,w,d,y,rise){
    const a=w/2+.4,b=d/2+.4,inset=Math.min(a,b)*.83;
    const corners=[[-a,0,-b],[a,0,-b],[a,0,b],[-a,0,b]];
    const ridge=w>=d?[[-a+inset,rise,0],[a-inset,rise,0]]:[[0,rise,-b+inset],[0,rise,b-inset]];
    const faces=w>=d?[[0,1,5],[0,5,4],[1,2,5],[2,3,4],[2,4,5],[3,0,4]]:[[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]];
    const verts=[...corners,...ridge],positions=[],uv=[];
    for(const face of faces)for(const i of [...face].reverse()){positions.push(...verts[i]);uv.push(verts[i][0]/3,(verts[i][2]+verts[i][1])/3);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return mesh(g,roof,x,y,z,true);
  }
  function window(x,y,z,rotation=0){
    details.sash('1829-range-sash',x,y,z,rotation,1.12,2.45);
  }
  function block(x,z,w,d,h,passage=null){
    const eastInner=(x===36.5&&z===23)||(x===35&&z===35);
    const westDetail=westCourtPhotoProfile(x,z)||westFrontPhotoProfile(x,z)||eastInner;
    const detail=westDetail||eastPhotoProfile(x,z)||courtyardPhotoProfile(x,z)||rearCourtPhotoProfile(x,z)||redesmerePhotoProfile(x,z),foundation=detail&&!westDetail?4:2;
    const base=passage?Math.max(passage.height,foundation):foundation;
    const rearArm=x===31&&z===-10;
    // The service room meets the low brick range at z=10. Its white base,
    // floor band and lower brickwork stop there instead of overlapping the
    // end range's west-facing wall over z=10..11.5.
    const serviceJoin=Math.abs(x-81.875)<.01&&z===8;
    const bodyBase=serviceJoin?4.55:base;
    const body=mesh(worldUV(rearArm?wingWallGeometry(THREE,base):new THREE.BoxGeometry(w,h-bodyBase,d),detail?1.7:3),detail?photoBrick:brick,x,(h+bodyBase)/2,z,true);
    const lowerDepth=serviceJoin?5.5:d,lowerZ=serviceJoin?7.25:z;
    if(serviceJoin)mesh(worldUV(new THREE.BoxGeometry(w,bodyBase-base,lowerDepth),1.7),photoBrick,x,(bodyBase+base)/2,lowerZ,true).name='Redesmere service wall above white base';
    const lowerRanges=passage?[[x-w/2,Math.max(x-w/2,passage.x-passage.width/2)],[Math.min(x+w/2,passage.x+passage.width/2),x+w/2]]:[[x-w/2,x+w/2]];
    for(const [left,right] of lowerRanges){
      if(right<=left)continue;
      const middle=(left+right)/2,width=right-left;
      const lowerHeight=passage?Math.min(foundation,passage.height):foundation;
      if(westDetail)mesh(worldUV(new THREE.BoxGeometry(width,lowerHeight,d),1.7),photoBrick,middle,lowerHeight/2,z,true);
      else box(detail?white:cream,middle,lowerHeight/2,lowerZ,width,lowerHeight,lowerDepth);
      if(!westDetail)box(detail?white:cream,middle,foundation+(detail?.04:.1),serviceJoin?lowerZ-.0325:z,width+(detail?.13:.23),detail?.16:.22,serviceJoin?lowerDepth+.065:d+(detail?.13:.23));
      if(passage&&base>lowerHeight)mesh(worldUV(new THREE.BoxGeometry(width,base-lowerHeight,d)),detail?photoBrick:brick,middle,(base+lowerHeight)/2,z,true);
    }
    // Outer east white base is retained beyond the mirrored brick inner wing.
    if(eastInner)box(white,41.02,2,z,.12,4,d);
    if(!rearArm&&x!==-69&&x!==-39.6)box(cream,x,h-.12,z,w+.23,.22,d+.23);
    if(passage){
      const left=Math.max(x-w/2,passage.x-passage.width/2),right=Math.min(x+w/2,passage.x+passage.width/2);
      // Visible lintel/soffit above the opening, with no foundation across it.
      box(stone,(left+right)/2,base+.1,z,right-left,.2,d+.15);
      body.name='East courtyard bridge';
    }
    if(!rearArm&&x!==-69&&x!==-39.6)box(stone,x,h+.12,z,w+.48,.22,d+.48);
    const principal=x===EAST_SHIFT/2&&z===12;
    if(principal){
      // Pitched slate clears the solid cornice slab (top h+.23).
      hipRoof(-22.55,12,30.9,d,h+.26,2.6).name='Entrance west recessed slate roof';
      hipRoof(26.1,12,38,d,h+.26,2.6).name='Entrance east recessed slate roof';
    }else if(rearArm){
      addWingRoofJunction(THREE,{mesh,worldUV,box,brick:photoBrick,white,roof},1);
    }else if(eastInner){
      // Both pitches now meet the photo-corrected narrow footprint.
      const roofWidth=z===35?12:9,roofX=z===35?35:36.5;
      const cap=hipRoof(roofX,z,roofWidth,d,h+.23,roofWidth*.3);
      cap.name='East entrance wing slate roof';
    }else if((x===65.5&&z===16.15)||x===-69||x===-39.6){
      // Detailed end roofs and the aligned court range cover these walls.
    }else hipRoof(x,z,w,d,h+.23,Math.min(3.8,Math.min(w,d)*.3));
    if(!detail)for(const side of [-1,1]){
      for(let px=-w/2+2.4;px<w/2-1.5;px+=3.55)for(let y=3.8;y<h-1;y+=3.4){
        if(side<0&&x===EAST_SHIFT/2&&z===12&&x+px>37)continue;
        if(side>0&&principal&&Math.abs(x+px)>=7.1&&Math.abs(x+px)<=32)continue;
        if(passage&&y<base&&Math.abs(x+px-passage.x)<passage.width/2+.9)continue;
        // Leave the whole sash clear of the projecting west frontage.
        const wx=principal&&side>0&&x+px< -32&&x+px> -32.9?-32.9:x+px;
        window(wx,y,z+side*(d/2+.04),side<0?Math.PI:0);
      }
      for(let pz=-d/2+2.5;pz<d/2-1.5;pz+=3.55)for(let y=3.8;y<h-1;y+=3.4){
        if(passage&&y<base&&Math.abs(x+side*w/2-passage.x)<passage.width/2+.2)continue;
        window(x+side*(w/2+.04),y,z+pz,side*Math.PI/2);
      }
    }
    if(!detail&&w>13)for(const side of [-1,1]){if(principal)continue;mesh(worldUV(new THREE.BoxGeometry(.85,2.1,1.3)),brick,x+side*(w*.32),h+2.6,z,true);box(stone,x+side*w*.32,h+3.69,z,1.1,.15,1.5);}
    if(westDetail&&z===3)body.name='West courtyard widened link';
    if(westDetail&&x===-48.6)body.name='West courtyard aligned range';
    if(westDetail&&x===-62.5)body.name='West courtyard recessed end';
    if(westDetail&&x===-69)body.name='West courtyard projecting corner';
    return body;
  }
  const white=material(0xe1e3dc),photoBrick=material(0xb3a5a0,{map:bricks});
  const details=photoDetailPrimitives(THREE,{model,box,mesh,white,steel,material});
  addRedesmerePassage(THREE,{model,mesh,worldUV,white,brick:photoBrick,material});
  addRedesmereEndRange(THREE,{box,mesh,worldUV,brick:photoBrick,material,hipRoof});
  addRedesmereEdgeChimney(THREE,{model,material});
  for(const b of blocks){
    // The west arm is rebuilt from the detailed east arm and img15/img16.
    if(b[0]===-31&&[-10,-30].includes(b[1]))continue;
    // Its detailed walls meet the joined main roof; no intermediate hip.
    if(innerCourtPhotoProfile(b[0],b[1]))continue;
    block(...b);
  }
  // The pediment and columned red doorway identify the central 1829 entrance.
  mesh(worldUV(new THREE.BoxGeometry(14.2,11.5,12.8),1.7),photoBrick,0,8.85,13.2,true);
  box(white,0,1.55,13.2,14.2,3.1,12.8);
  addCentralBack(THREE,{model,mesh,worldUV,brick:photoBrick,white,roof,material,details,box});
  for(const y of [3.15,7.1,10.7,14.5])box(white,0,y,19.68,14.5,.24,.32);
  // Reception's fine sash glazing is supplied by the img19 detail module.
  const triangle=new THREE.BufferGeometry();triangle.setAttribute('position',new THREE.Float32BufferAttribute([-7.5,0,0,7.5,0,0,0,3.1,0],3));triangle.computeVertexNormals();mesh(triangle,cream,0,14.65,19.72);
  const relief=triangle.clone();
  relief.setAttribute('uv',new THREE.Float32BufferAttribute([29/333,1-89/499,305/333,1-89/499,167/333,1-29/499],2));
  const dragons=mesh(relief,material(0x477180),0,14.72,19.78);dragons.scale.set(.94,.91,1);dragons.name='Blue dragons and central coat of arms';
  for(const side of [-1,1]){const beam=mesh(new THREE.BoxGeometry(8.2,.22,.4),cream,side*3.75,16.2,19.82);beam.rotation.z=-side*Math.atan2(3.1,7.5);}
  box(cream,0,14.65,19.8,15.3,.25,.5);
  addFrontSteps(THREE,{model,material});box(red,0,3.5,19.9,1.9,3.2,.2);
  for(const x of [-.46,.46])for(const y of [2.45,3.45,4.45])box(material(0x581c23),x,y,20.02,.65,.72,.06);
  box(glass,0,5.55,19.96,1.9,.65,.12);
  for(const x of [-1.1,1.1])box(cream,x,3.9,20.03,.18,4.2,.23);
  box(cream,0,5.99,20.03,2.4,.2,.23);
  for(const x of [-2.1,2.1])for(const z of [20.25,22.7]){
    mesh(new THREE.CylinderGeometry(.23,.3,4.6,12),cream,x,4.1,z,true);box(cream,x,6.45,z,.8,.3,.8);box(cream,x,1.91,z,.75,.25,.75);
    for(const side of [-1,1]){const scroll=mesh(new THREE.CylinderGeometry(.14,.14,.22,12),cream,x+side*.27,6.25,z+.18);scroll.rotation.x=Math.PI/2;}
  }
  box(cream,0,6.7,21.2,5.6,.6,4.0);box(stone,0,7.08,21.2,6,.15,4.3);

  // Both photographed front bays are built by the facade detail modules.
  // Replace the added round bay with a square projection on the blue-marked
  // window section, to its left. Its face stands 5.5 units beyond the facade.
  const squareX=65.5,squareZ=16.15,squareWidth=8.5,squareDepth=17.7;
  block(squareX,squareZ,squareWidth,squareDepth,14.3).name='East garden pavilion';
  for(const y of [4.08,8.8])box(white,squareX,y,squareZ,squareWidth+.14,.16,squareDepth+.14);
  addEastPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick:photoBrick,roof,steel,material,hipRoof,details});
  refineFrontInsideCorners(THREE,{model,batches,box,mesh,worldUV,white,brick:photoBrick,roof,material,details});
  // Open rear approaches connect the gaps between the arms to the back road.
  for(const x of [-23,23]){box(gravel,x,.18,-20,32,.1,45);box(grass,x<0?-17:x-6,.26,-9,9,.1,11);}
  // The west court and apron share the continuous surface in addEntranceWalks.
  box(gravel,69+OUTER_SHIFT,.17,12,7,.12,62);
  // Retain only the eastern end paving; the marked western cross-walk is removed.
  box(path,69+OUTER_SHIFT,.16,44,7,.12,2);
  box(gravel,45+OUTER_SHIFT/2,.18,-12,17+OUTER_SHIFT,.12,39);
  box(gravel,40,.18,-36,7,.12,18);
  // The passage paving is joined to the garden cross-walk in addEntranceWalks.
  // The corrected centre ends before the existing cross-drive at z=-46.
  legacyRoad(gravel,0,.15,-62,106,.12,23);
  // Broadleaf crowns cast shadows across the front lawn and site edges.
  const bark=material(0x5a4e3d),leaves=[material(0x43583a),material(0x566944),material(0x657448)];
  const crowns=leaves.map(mat=>({mat,items:[],nextRotation:0}));
  // Red-circled planting removal, September 24. Keep random draws and crown
  // rotation indices stable so every unmarked tree retains its exact shape.
  const removedTrees=new Set([
    [-100,-84],[-91,-91],[-82,-98],[-73,-84],[-64,-91],
    [-65,-35],[-72,-23],[-72,-10],[-72,29],[-25.5,46.7],
    [98.2,-38],[122.2,-47],[122.2,-35],
    [122.2,25],[122.2,37],[122.2,49],
    [-42,-64] // Orchard tree protruding through the Churton/Kelsall oblique roof.
  ].map(([x,z])=>`${x},${z}`));
  function tree(x,z,size=1){
    if(removedTrees.has(`${x},${z}`)){
      for(let i=0;i<5;i++){for(let n=0;n<4;n++)random();crowns[i%3].nextRotation++;}
      return null;
    }
    const trunk=mesh(new THREE.CylinderGeometry(.18*size,.3*size,4.5*size,6),bark,x,2.25*size,z);trees.add(trunk);
    const treeCrowns=[];
    for(let i=0;i<5;i++){
      const crown={x:x+(random()-.5)*3*size,y:(4.5+random()*2)*size,z:z+(random()-.5)*3*size,s:(1.7+random())*size};
      treeCrowns.push(crown);crowns[i%3].items.push({...crown,rotation:crowns[i%3].nextRotation++,treeId:trunk.uuid});
    }
    trunk.userData.broadleafTree={x,z,size,crowns:treeCrowns};return trunk;}
  // Former parking rows become garden borders, with gravel access alongside.
  const soil=material(0x65513c);
  const shrubs=leaves.map(mat=>({mat,items:[]}));
  function plantedBed(x,z,w,d){
    box(stone,x,.25,z,w+.25,.18,d+.25);
    box(soil,x,.36,z,w,.12,d);
    for(let offset=-d/2+1;offset<d/2;offset+=1.6){
      shrubs[1].items.push({x:x-.65,y:.85,z:z+offset,s:.7});
      shrubs[2].items.push({x:x+.65,y:.7,z:z+offset+.25,s:.55});
    }
  }
  for(const z of [-23,-10,29]){
    tree(-72,z,.65);
  }
  // The removed east corner planter included a small tree. Preserve the
  // random sequence so the remaining estate trees keep their shapes.
  for(let n=0;n<20;n++)random();
  // Rear garden: small orchard groups separated by open walking routes.
  for(const x of [-42,-28,-14,14,28,42]){
    plantedBed(x,-64,6,5);
    tree(x,-64,.85);
  }
  for(const [x,z,s] of [[-25.5,46.7,.85],[24,46.7,.6],[-65,-35,1.1],[68+OUTER_SHIFT,-38,1.25],[-17,-9,.85],[18,-9,.9]])tree(x,z,s);
  // Clear Churton and Hale's new cross range, including crown clearance.
  // Consume the same random draws so the remaining trees retain their shapes.
  for(let i=0;i<24;i++){const x=-100+i*9,z=-84-(i%3)*7,size=1+random()*.6;
    const haleRoof=x>=80&&x<=148.5&&z>=-93&&z<=-77;
    const bowlingGreenTree=x===107&&z===-98; // Yellow-circled tree in the lawn reference.
    if((x<-60||x>1)&&!haleRoof&&!bowlingGreenTree)tree(x,z,size);else for(let n=0;n<20;n++)random();}
  for(let i=0;i<9;i++){
    // Move the Churton/Kelsall junction tree onto the blue-X lawn; retain
    // its place in the seeded sequence so every crown keeps its shape.
    tree(i===0?-82:-90,i===0?-54:-44+i*12,1.1);
    // Clear the marked Redesmere sightline, retaining an edge tree on the
    // right of the photo and the trees beyond this stretch of the lawn.
    const z=-47+i*12;if(z<=-35||z>=25)tree(92+OUTER_SHIFT,z,1.1);
  }
  // Reuse the reference's small broadleaf crowns after all existing trees,
  // preserving their random shapes and sharing the same foliage batches.
  for(const spec of ANNEXE_ROAD_TREES){
    // Consume the removed entrance tree's draws to preserve later crowns.
    if(spec.removed){for(let i=0;i<5;i++){for(let n=0;n<4;n++)random();crowns[i%3].nextRotation++;}continue;}
    const trunk=tree(spec.x,spec.z,spec.size);trunk.name=spec.name;trunk.userData.annexeRoadTree=spec;
  }
  const churtonWard=createChurtonWard(THREE,{brick:photoBrick,roof,worldUV,material});model.add(churtonWard);
  const uptonFrithOscroft=createUptonFrithOscroft(THREE,{brick:photoBrick,roof,worldUV,material});model.add(uptonFrithOscroft);
  const irbyAshley=createIrbyAshley(THREE,{brick:photoBrick,roof,worldUV,material});model.add(irbyAshley);
  const graftonEdge=createGraftonEdge(THREE,{brick:photoBrick,roof,worldUV,material});model.add(graftonEdge);
  const haleWard=createHaleWard(THREE,{brick:photoBrick,roof,worldUV,material});model.add(haleWard);
  const estatesDepartment=createEstatesDepartment(THREE,{brick:photoBrick,roof,worldUV,material});model.add(estatesDepartment);
  const farndonWard=createFarndon(THREE,{brick:photoBrick,roof,worldUV,material});model.add(farndonWard);
  const witbyWard=createWitbyWard(farndonWard);model.add(witbyWard);
  // Both rear sashes become corridor joints after the complete ward is copied.
  farndonWard.getObjectByName('Farndon rear connection sash').removeFromParent();
  farndonWard.userData.openings=farndonWard.userData.openings.filter(o=>!o.corridorContact);
  witbyWard.getObjectByName('Witby rear connection sash').removeFromParent();
  witbyWard.userData.openings=witbyWard.userData.openings.filter(o=>!o.corridorContact);
  // Reposition only the selected buildings after copying their source geometry.
  // Corridor routes independently reconnect to these final ward positions.
  placeWard(irbyAshley,'irbyAshley');placeWard(farndonWard,'farndon');placeWard(witbyWard,'witby');
  placeWard(graftonEdge,'graftonEdge');placeWard(haleWard,'haleWard');
  const bowlingGreen=createBowlingGreen(THREE);model.add(bowlingGreen);
  const {building:mainAdmin,corridor:adminCorridor}=createMainAdminBuilding(THREE,{brick:photoBrick,roof,worldUV,material});model.add(mainAdmin,adminCorridor);
  const laundry=createLaundry(THREE,{brick:photoBrick,roof,worldUV,material,adminCorridor});model.add(laundry);
  const garagesMortuary=createGaragesMortuary(THREE,{brick:photoBrick,roof,worldUV,material});model.add(garagesMortuary);
  const greenhouses=createGreenhouses(THREE,{brick:photoBrick,roof,worldUV,material});model.add(greenhouses);
  const outhouse=createOuthouse(THREE,{worldUV,material});model.add(outhouse);
  const willows=createWillows(THREE,{worldUV,material});model.add(willows);
  const chapel=createChapel(THREE,{brick,roof,stone,dark,worldUV});model.add(chapel);
  const churchGrounds=createChurchGrounds(THREE);model.add(churchGrounds);
  const estateChimney=createEstateChimney(THREE,{brick,material});model.add(estateChimney);
  const waterTower=createWaterTower(THREE,{brick,roof,dark,worldUV});model.add(waterTower);
  const annexe=createAnnexe(THREE,{brick:photoBrick,roof,white,steel,material,worldUV,hipRoof});model.add(annexe);
  // Tapering open lattice, cross bracing and antenna panels from the mast photos.
  const mast=new THREE.Group();mast.name='Radio mast · rear left';mast.position.set(ESCAPE_MAST.x,0,ESCAPE_MAST.z);model.add(mast);
  function strut(a,b,r=.075){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),5),steel);m.position.copy(start).addScaledVector(v,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());mast.add(m);}
  for(let level=0;level<10;level++){
    const y=level*4.2,lo=2.4-level*.17,hi=lo-.17;
    for(let side=0;side<4;side++){
      const angle=side*Math.PI/2+Math.PI/4,next=angle+Math.PI/2;
      const a=[Math.cos(angle)*lo,y,Math.sin(angle)*lo],b=[Math.cos(angle)*hi,y+4.2,Math.sin(angle)*hi];
      const c=[Math.cos(next)*lo,y,Math.sin(next)*lo],d=[Math.cos(next)*hi,y+4.2,Math.sin(next)*hi];
      strut(a,b,.095);strut(a,c,.065);strut(a,d,.055);strut(c,b,.055);
    }
  }
  strut([0,41,0],[0,45,0],.055);
  for(const y of [23,30,37])for(const side of [-1,1]){strut([0,y,0],[side*2.8,y,0]);const antenna=new THREE.Mesh(new THREE.BoxGeometry(.36,2.5,.55),cream);antenna.position.set(side*2.8,y+.65,0);mast.add(antenna);}
  box(stone,ESCAPE_MAST.x,.1,ESCAPE_MAST.z,8,.3,8);
  box(dark,ESCAPE_MAST.x+7,1.8,ESCAPE_MAST.z,5,3.6,6);
  const dummy=new THREE.Object3D();
  for(const [mat,items] of batches){const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);batch.receiveShadow=true;
    items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.rotation,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});model.add(batch);}
  for(const [parent,canopy] of [[trees,crowns],[model,shrubs]])for(const {mat,items} of canopy){if(!items.length)continue;const batch=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),mat,items.length);batch.castShadow=true;batch.receiveShadow=true;
    if(parent===trees)batch.userData.treeIds=items.map(item=>item.treeId);
    items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.s,b.s*.85,b.s);dummy.rotation.set(0,b.rotation??i,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});parent.add(batch);}
  const lawnMaterials=new Set();
  model.traverse(object=>{for(const mat of (Array.isArray(object.material)?object.material:[object.material]))if(mat?.userData.estateGrass)lawnMaterials.add(mat);});
  for(const mat of lawnMaterials)matchEstateGrass(mat,grass);
  return {scene,camera,model,terrain,legacyAccess,mast,chapel,churchGrounds,waterTower,estateChimney,annexe,newHospital:annexe,churtonWard,uptonFrithOscroft,irbyAshley,graftonEdge,haleWard,bowlingGreen,estatesDepartment,farndonWard,witbyWard,mainAdmin,adminCorridor,laundry,garagesMortuary,greenhouses,outhouse,willows,trees,invalidateShadows};
}
