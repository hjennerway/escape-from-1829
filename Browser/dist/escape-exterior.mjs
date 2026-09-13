// Aerial interpretation of the user's outlined 1829 estate photograph.
// Front road/reception is +Z; the corrected mast position is rear-left (-X, -Z).
import {westFrontPhotoProfile} from './west-front-photo-detail.mjs';
import {westCourtPhotoProfile} from './west-court-photo-detail.mjs';
import {createChapel} from './chapel.mjs';
import {createWaterTower} from './water-tower.mjs';
import {eastPhotoProfile,addEastPhotoDetails} from './east-photo-detail.mjs';
import {courtyardPhotoProfile} from './courtyard-photo-detail.mjs';
import {rearCourtPhotoProfile} from './rear-court-photo-detail.mjs';
import {redesmerePhotoProfile} from './redesmere-photo-detail.mjs';
import {innerCourtPhotoProfile,REAR_END_HEIGHTS,REAR_END_ROOF_RISE,INNER_COURT_SIDE_PROFILE} from './inner-court-photo-detail.mjs';
export {MAP_REAR_PROPORTIONS} from './central-court-photo-detail.mjs';
export const ESCAPE_MAST = Object.freeze({x:-69,z:-62,height:42});
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
  scene.add(new THREE.HemisphereLight(0xe4eff2,0x59634a,2));
  const sun=new THREE.DirectionalLight(0xffe2b7,2.8);sun.position.set(-85,120,60);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-130,right:130,top:130,bottom:-130,near:1,far:350});sun.shadow.bias=-.0003;sun.shadow.normalBias=.25;scene.add(sun);
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.9,...extra});
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
  mesh(new THREE.PlaneGeometry(4000,4000),grass,0,-.15,0).rotation.x=-Math.PI/2;
  // Grounds and surrounding access roads. No red annotation or sale graphics.
  box(path,OUTER_SHIFT/2,-.015,2,151+OUTER_SHIFT,.15,103);
  box(grass,OUTER_SHIFT/2,.08,28,117+OUTER_SHIFT,.1,36);box(grass,OUTER_SHIFT/2,.08,-15,117+OUTER_SHIFT,.1,45);
  box(gravel,EAST_PAVILION_WIDTH/2,.09,59,210+EAST_PAVILION_WIDTH,.1,11);box(gravel,-79,.09,-2,10,.1,133);box(gravel,79+OUTER_SHIFT,.09,0,9,.1,130);
  box(path,OUTER_SHIFT/2,.11,51,151+OUTER_SHIFT,.1,3);box(gravel,OUTER_SHIFT/2,.11,-46,149+OUTER_SHIFT,.1,8);
  box(path,0,.13,34,3.2,.1,34);box(path,OUTER_SHIFT/2,.13,43,114+OUTER_SHIFT,.1,2);
  // Leave the photographed west end's approach open to the front lawn.
  for(const [left,right] of [[-71,-48],[-27,71+OUTER_SHIFT]])box(hedge,(left+right)/2,.55,49,right-left,1.1,.9);
  // Start from the western silhouette and reflect it across Reception.
  // Each tuple is [x, z, width, depth, eaves height]; front is +Z.
  const westBlocks=[
    [-46,12,16,15,14.3],[-31,-10,12,30,11.3],
    // A is the inset rear arm; B is slightly outboard, both inside the
    // western end pavilion. B has a narrow root and a wider stepped foot.
    [-36.5,23,9,14,8.6],[-35,35,12,16,8.6],
    [-31,-30,13,11,REAR_END_HEIGHTS.west-REAR_END_ROOF_RISE],
    // Rooms tracing the irregular western silhouette: an outer end room,
    // a shorter front nib, and small rooms beside A's root. The curved bay
    // remains exposed between the outer rooms and B.
    [-56,13,9,16,9.3],[-54.5,23,6,6,7.2],
    [-40,-3,6,8,7.2],[-22.5,3,6,6,7.2]
  ];
  const eastBlocks=westBlocks.map(([x,z,w,d,h])=>[-x,z,w,d,h]);
  westBlocks[0]=[-48.6,12,21.2,15,14.3];
  // The fire-exit doors belong to the existing pavilion wall, not an extra
  // projecting stair tower. Its former block is omitted below.
  westBlocks[7]=[-39.6,3,7.2,8,11.3]; // Recessed link at the img6 courtyard corner.
  westBlocks[5]=[-62.5,10.25,7,10.5,12.8];
  westBlocks.push([-69,9.25,6,12.5,12.8]); // Rear steps meet the taller flush frontage at z=15.5.
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
  // Mirror the inward walls at x=29/32, retaining the outer east face x=48.1.
  eastBlocks[2]=[40.05,23,16.1,14,8.6];
  eastBlocks[3]=[38.55,35,19.1,16,8.6];
  eastBlocks[0][0]+=EXTRA_BAY/2;eastBlocks[0][2]+=EXTRA_BAY;
  for(const i of [5,6,7])eastBlocks[i][0]+=OUTER_SHIFT;
  const duplicatePavilion=[...eastBlocks[0]];
  duplicatePavilion[0]+=EAST_PAVILION_WIDTH;
  // The marked range beside the square projection has two window storeys.
  duplicatePavilion[1]=8;duplicatePavilion[3]=7;duplicatePavilion[4]=9.3;
  // Ground-floor passage continues through the shallow room at the rear.
  const courtyardPassage={x:76,width:7.1,height:3.3};
  duplicatePavilion.push(courtyardPassage);
  eastBlocks[7].push(courtyardPassage);
  const blocks=[
    [EAST_SHIFT/2,12,76+EAST_SHIFT,10,12.8],
    ...westBlocks,...eastBlocks,duplicatePavilion,
    [duplicatePavilion[0],15.5,EAST_PAVILION_WIDTH,8,4.5,courtyardPassage],
    [69.2,5,6,9,12.8], // Stair block seen behind the cut-through in img2.jpg.
    // Yellow-shaded addition: long outer range and a stepped rear return.
    // Set the return back and towards the outer wing, leaving the rear-left
    // corner open beside the inset arm (which ends at x=37.5, z=-35.5).
    [59+OUTER_SHIFT,-14,10,48,9.3],[61+OUTER_SHIFT,12,10,8,9.3],
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
    box(dark,x,y,z,1.42,2.12,.16,rotation);
    const dx=Math.cos(rotation),dz=-Math.sin(rotation),nx=Math.sin(rotation),nz=Math.cos(rotation);
    box(glass,x+nx*.09,y,z+nz*.09,1.23,1.92,.06,rotation);
    for(const s of [-1,1])box(cream,x+dx*s*.65+nx*.14,y,z+dz*s*.65+nz*.14,.085,2.12,.10,rotation);
    for(const sy of [-1,0,1])box(cream,x+nx*.15,y+sy*1.01,z+nz*.15,1.42,.075,.12,rotation);
    box(cream,x+nx*.16,y,z+nz*.16,.055,2,.08,rotation);
    box(cream,x+nx*.18,y-1.12,z+nz*.18,1.7,.16,.33,rotation);
    box(cream,x+nx*.17,y+1.16,z+nz*.17,1.65,.19,.23,rotation);
  }
  function block(x,z,w,d,h,passage=null){
    const eastInner=(Math.abs(x-40.05)<.01&&z===23)||(Math.abs(x-38.55)<.01&&z===35);
    const westDetail=westCourtPhotoProfile(x,z)||westFrontPhotoProfile(x,z)||eastInner;
    const detail=westDetail||eastPhotoProfile(x,z)||courtyardPhotoProfile(x,z)||rearCourtPhotoProfile(x,z)||redesmerePhotoProfile(x,z),foundation=detail&&!westDetail?4:2;
    const base=passage?Math.max(passage.height,foundation):foundation;
    const body=mesh(worldUV(new THREE.BoxGeometry(w,h-base,d),detail?1.7:3),detail?photoBrick:brick,x,(h+base)/2,z,true);
    const lowerRanges=passage?[[x-w/2,Math.max(x-w/2,passage.x-passage.width/2)],[Math.min(x+w/2,passage.x+passage.width/2),x+w/2]]:[[x-w/2,x+w/2]];
    for(const [left,right] of lowerRanges){
      if(right<=left)continue;
      const middle=(left+right)/2,width=right-left;
      const lowerHeight=passage?Math.min(foundation,passage.height):foundation;
      if(westDetail)mesh(worldUV(new THREE.BoxGeometry(width,lowerHeight,d),1.7),photoBrick,middle,lowerHeight/2,z,true);
      else box(detail?white:cream,middle,lowerHeight/2,z,width,lowerHeight,d);
      if(!westDetail)box(detail?white:cream,middle,foundation+(detail?.04:.1),z,width+(detail?.13:.23),detail?.16:.22,d+(detail?.13:.23));
      if(passage&&base>lowerHeight)mesh(worldUV(new THREE.BoxGeometry(width,base-lowerHeight,d)),detail?photoBrick:brick,middle,(base+lowerHeight)/2,z,true);
    }
    // Outer east white base is retained beyond the mirrored brick inner wing.
    if(eastInner){box(white,48.12,2,z,.12,4,d);if(z===35)box(white,44.55,2,43.02,7.1,4,.12);}
    box(cream,x,h-.12,z,w+.23,.22,d+.23);
    if(passage){
      const left=Math.max(x-w/2,passage.x-passage.width/2),right=Math.min(x+w/2,passage.x+passage.width/2);
      // Visible lintel/soffit above the opening, with no foundation across it.
      box(stone,(left+right)/2,base+.1,z,right-left,.2,d+.15);
      body.name='East courtyard bridge';
    }
    const rearEnd=x===-31&&z===-30;
    box(stone,x,rearEnd?h-.1:h+.12,z,w+.48,.22,d+.48);
    const principal=x===EAST_SHIFT/2&&z===12;
    if(principal){
      // Pitched slate clears the solid cornice slab (top h+.23).
      hipRoof(-35,12,6,d,h+.23,2);
      hipRoof(-19.55,12,24.9,d,h+.26,2.6).name='Entrance west recessed slate roof';
      hipRoof(19.55,12,24.9,d,h+.26,2.6).name='Entrance east recessed slate roof';
      hipRoof(38.55,12,13.1,d,h+.23,2);
    }else if(eastInner){
      // Keep the inner roof pitch/ridge identical to the west; stretch only
      // the outward roof slope to join the retained east courtyard elevation.
      const roofWidth=z===35?12:9,roofX=z===35?35:36.5;
      const cap=hipRoof(roofX,z,roofWidth,d,h+.23,roofWidth*.3);
      const vertices=cap.geometry.attributes.position;
      for(let i=0;i<vertices.count;i++)if(vertices.getX(i)>0)vertices.setX(i,vertices.getX(i)*(1+7.1/(roofWidth/2+.4)));
      vertices.needsUpdate=true;cap.geometry.computeVertexNormals();
      cap.name='East entrance wing slate roof';
    }else hipRoof(x,z,w,d,rearEnd?h:h+.23,rearEnd?REAR_END_ROOF_RISE:Math.min(3.8,Math.min(w,d)*.3));
    if(!detail)for(const side of [-1,1]){
      for(let px=-w/2+2.4;px<w/2-1.5;px+=3.55)for(let y=3.8;y<h-1;y+=3.4){
        if(side<0&&x===EAST_SHIFT/2&&z===12&&x+px>37)continue;
        if(side>0&&principal&&Math.abs(x+px)>=7.1&&Math.abs(x+px)<=32)continue;
        if(passage&&y<base&&Math.abs(x+px-passage.x)<passage.width/2+.9)continue;
        window(x+px,y,z+side*(d/2+.04),side<0?Math.PI:0);
      }
      for(let pz=-d/2+2.5;pz<d/2-1.5;pz+=3.55)for(let y=3.8;y<h-1;y+=3.4){
        if(passage&&y<base&&Math.abs(x+side*w/2-passage.x)<passage.width/2+.2)continue;
        window(x+side*(w/2+.04),y,z+pz,side*Math.PI/2);
      }
    }
    if(!detail&&w>13)for(const side of [-1,1]){if(principal)continue;mesh(worldUV(new THREE.BoxGeometry(.85,2.1,1.3)),brick,x+side*(w*.32),h+2.6,z,true);box(stone,x+side*w*.32,h+3.69,z,1.1,.15,1.5);}
    if(westDetail&&z===3)body.name='West courtyard widened link';
    if(westDetail&&x===-62.5)body.name='West courtyard recessed end';
    if(westDetail&&x===-69)body.name='West courtyard projecting corner';
    return body;
  }
  const white=material(0xe1e3dc),photoBrick=material(0xb3a5a0,{map:bricks});
  for(const b of blocks){
    // The west arm is rebuilt from the detailed east arm and img15/img16.
    if(b[0]===-31&&[-10,-30].includes(b[1]))continue;
    if(innerCourtPhotoProfile(b[0],b[1])){
      const {join,front}=INNER_COURT_SIDE_PROFILE;
      hipRoof(b[0],(join+front)/2,b[2],front-join,REAR_END_HEIGHTS.east-REAR_END_ROOF_RISE,REAR_END_ROOF_RISE);
    }
    else block(...b);
  }
  // The pediment and columned red doorway identify the central 1829 entrance.
  mesh(worldUV(new THREE.BoxGeometry(14.2,11.5,12.8),1.7),photoBrick,0,8.85,13.2,true);
  box(white,0,1.55,13.2,14.2,3.1,12.8);
  hipRoof(0,13.2,14.2,12.8,14.65,2.9);
  for(const y of [3.15,7.1,10.7,14.5])box(white,0,y,19.68,14.5,.24,.32);
  // Reception's fine sash glazing is supplied by the img19 detail module.
  const triangle=new THREE.BufferGeometry();triangle.setAttribute('position',new THREE.Float32BufferAttribute([-7.5,0,0,7.5,0,0,0,3.1,0],3));triangle.computeVertexNormals();mesh(triangle,cream,0,14.65,19.72);
  const relief=triangle.clone();
  relief.setAttribute('uv',new THREE.Float32BufferAttribute([29/333,1-89/499,305/333,1-89/499,167/333,1-29/499],2));
  const dragons=mesh(relief,material(0x477180),0,14.72,19.78);dragons.scale.set(.94,.91,1);dragons.name='Blue dragons and central coat of arms';
  for(const side of [-1,1]){const beam=mesh(new THREE.BoxGeometry(8.2,.22,.4),cream,side*3.75,16.2,19.82);beam.rotation.z=-side*Math.atan2(3.1,7.5);}
  box(cream,0,14.65,19.8,15.3,.25,.5);
  box(stone,0,.9,21.4,5.6,1.8,4.3);box(red,0,3.5,19.9,1.9,3.2,.2);
  for(const x of [-.46,.46])for(const y of [2.45,3.45,4.45])box(material(0x581c23),x,y,20.02,.65,.72,.06);
  box(glass,0,5.55,19.96,1.9,.65,.12);
  for(const x of [-1.1,1.1])box(cream,x,3.9,20.03,.18,4.2,.23);
  box(cream,0,5.99,20.03,2.4,.2,.23);
  for(const x of [-2.1,2.1])for(const z of [20.25,22.7]){
    mesh(new THREE.CylinderGeometry(.23,.3,4.6,12),cream,x,4.1,z,true);box(cream,x,6.45,z,.8,.3,.8);box(cream,x,1.91,z,.75,.25,.75);
    for(const side of [-1,1]){const scroll=mesh(new THREE.CylinderGeometry(.14,.14,.22,12),cream,x+side*.27,6.25,z+.18);scroll.rotation.x=Math.PI/2;}
  }
  box(cream,0,6.7,21.2,5.6,.6,4.0);box(stone,0,7.08,21.2,6,.15,4.3);
  for(let i=0;i<6;i++)box(stone,0,(6-i)*.15,23.7+i*.42,3.7,(6-i)*.3,.44);
  // Both photographed front bays are built by the facade detail modules.
  // Replace the added round bay with a square projection on the blue-marked
  // window section, to its left. Its face stands 5.5 units beyond the facade.
  const squareX=65.5,squareZ=20.75,squareWidth=8.5;
  block(squareX,squareZ,squareWidth,squareWidth,14.3).name='East square projecting bay';
  for(const y of [4.08,8.8])box(white,squareX,y,squareZ,squareWidth+.14,.16,squareWidth+.14);
  addEastPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick:photoBrick,roof,steel,material,hipRoof});
  // Open rear approaches connect the gaps between the arms to the back road.
  for(const x of [-23,23]){box(gravel,x,.18,-20,32,.1,45);box(grass,x<0?-17:x-6,.26,-9,9,.1,11);}
  for(const [x,w] of [[-64,17],[69+OUTER_SHIFT,7]]){box(gravel,x,.17,12,w,.12,62);box(path,x,.16,44,w,.12,2);}
  box(gravel,45+OUTER_SHIFT/2,.18,-12,17+OUTER_SHIFT,.12,39);
  box(gravel,40,.18,-36,7,.12,18);
  box(path,courtyardPassage.x,.2,13,courtyardPassage.width,.1,34);
  // The corrected centre ends before the existing cross-drive at z=-46.
  box(gravel,0,.15,-62,106,.12,23);
  // Broadleaf crowns cast shadows across the front lawn and site edges.
  const bark=material(0x5a4e3d),leaves=[material(0x43583a),material(0x566944),material(0x657448)];
  const crowns=leaves.map(mat=>({mat,items:[]}));
  function tree(x,z,size=1){mesh(new THREE.CylinderGeometry(.18*size,.3*size,4.5*size,6),bark,x,2.25*size,z);
    for(let i=0;i<5;i++)crowns[i%3].items.push({x:x+(random()-.5)*3*size,y:(4.5+random()*2)*size,z:z+(random()-.5)*3*size,s:(1.7+random())*size});}
  // Former parking rows become garden borders, with gravel access alongside.
  const soil=material(0x65513c);
  function plantedBed(x,z,w,d){
    box(stone,x,.25,z,w+.25,.18,d+.25);
    box(soil,x,.36,z,w,.12,d);
    for(let offset=-d/2+1;offset<d/2;offset+=1.6){
      crowns[1].items.push({x:x-.65,y:.85,z:z+offset,s:.7});
      crowns[2].items.push({x:x+.65,y:.7,z:z+offset+.25,s:.55});
    }
  }
  for(const x of [-72,69+OUTER_SHIFT])for(const z of (x<0?[-23,-10,29]:[29])){
    plantedBed(x,z,3.2,8);
    tree(x,z,.65);
  }
  // Rear garden: small orchard groups separated by open walking routes.
  for(const x of [-42,-28,-14,14,28,42]){
    plantedBed(x,-64,6,5);
    tree(x,-64,.85);
  }
  for(const [x,z,s] of [[-25.5,46.7,.85],[33,46.7,.85],[-65,-35,1.1],[68+OUTER_SHIFT,-38,1.25],[-17,-9,.85],[18,-9,.9]])tree(x,z,s);
  for(let i=0;i<24;i++)tree(-100+i*9,-84-(i%3)*7,1+random()*.6);
  for(let i=0;i<9;i++){
    tree(-90,-44+i*12,1.1);
    // Clear the marked Redesmere sightline, retaining an edge tree on the
    // right of the photo and the trees beyond this stretch of the lawn.
    const z=-47+i*12;if(z<=-35||z>=25)tree(92+OUTER_SHIFT,z,1.1);
  }
  // Low surrounding blocks establish the campus without reproducing the sale map.
  for(const [x,z,w,d] of [[-45,-99,28,12],[38,-104,18,13],[99+OUTER_SHIFT,-52,14,25],[-109,5,24,15]]){
    mesh(new THREE.BoxGeometry(w,6,d),material(0x8a7965),x,3,z,true);hipRoof(x,z,w,d,6,2.8);
  }
  const chapel=createChapel(THREE,{brick,roof,stone,dark,worldUV});model.add(chapel);
  const waterTower=createWaterTower(THREE,{brick,roof,dark,worldUV});model.add(waterTower);
  box(path,-9,.08,-93,2,.12,15);
  box(path,-7.5,.08,-99.5,3,.12,2);
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
  for(const {mat,items} of crowns){const batch=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),mat,items.length);batch.castShadow=true;batch.receiveShadow=true;
    items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.s,b.s*.85,b.s);dummy.rotation.set(0,i,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});model.add(batch);}
  return {scene,camera,model,mast,chapel,waterTower};
}
