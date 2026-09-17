import {photoDetailPrimitives} from './photo-detail-primitives.mjs';
import {placeWardViews,WARD_POSITIONS} from './ward-placement.mjs';
import {IRBY_CONNECTION_FRONT} from './irby-corridor.mjs';

// location.png is a perspective aerial: register its ground-level brown OS
// corners first, then regularise the yellow revision along the estate axes.
// Tools/register_irby_ashley.mjs records the independent control-point fit.
export const IRBY_ASHLEY=Object.freeze({x:234,z:-118,eave:8.4,storeys:2,
  reference:'Research/irby-ashley/README.md',layout:'historic'});
export const IRBY_ASHLEY_ORIGINAL_FOOTPRINT=Object.freeze([
  [260.6,-98.6],[250.4,-98.6],[250.4,-112.7],[241.7,-112.7],
  [241.7,-98.6],[235.4,-98.6],[235.4,-112.7],[221.7,-112.7],
  [221.7,-101.9],[204.2,-101.9],[204.2,-109.4],[211.9,-109.4],
  [211.9,-122.7],[208.1,-122.7],[208.1,-127],[211.9,-127],
  [211.9,-131.8],[219.2,-131.8],[219.2,-122.7],[247.7,-122.7],
  [247.7,-137.5],[263.2,-137.5],[263.2,-124.2],[260.6,-124.2]
].map(p=>Object.freeze(p)));
// Retain the original footprint for the independently refined Grafton copy.
// Latest blue footprint: extend the rectangular tower-side return to the
// corridor side. The entire earlier cross wing/cap in yellow is removed.
const connectionFront=IRBY_CONNECTION_FRONT-(WARD_POSITIONS.irbyAshley.z-IRBY_ASHLEY.z);
export const IRBY_ASHLEY_FOOTPRINT=Object.freeze([
 ...IRBY_ASHLEY_ORIGINAL_FOOTPRINT.slice(0,8),
 [221.7,connectionFront],[211.9,connectionFront],
 ...IRBY_ASHLEY_ORIGINAL_FOOTPRINT.slice(12)
].map(p=>Object.freeze(p)));
export const IRBY_ASHLEY_VIEWS=placeWardViews('irbyAshley',IRBY_ASHLEY,{
  'irby-ashley':{position:[283,55,-181],target:[234,3.5,-118],fov:48},
  // Looking +Z keeps the service road on the left, as in location.png.
  'irby-ashley-rear':{position:[223,35,-181],target:[238,4,-126],fov:48},
  'irby-ashley-plan':{position:[234,93,-118.01],target:[234,0,-118],fov:48},
  'irby-ashley-site':{position:[233,180,-169],target:[233,0,-85],fov:48},
  'irby-ashley-1':{position:[258.5,2.3,-156.5],target:[239,4.5,-120],fov:66},
  // The purple dot is labelled img2 in the request; img1 is the supplied file.
  'irby-ashley-2':{position:[258.5,2.3,-156.5],target:[239,4.5,-120],fov:66},
  'irby-ashley-3':{position:[220.14,2.3,-145.87],target:[242,4.8,-122.7],fov:66},
  'irby-ashley-4':{position:[229,18,17],target:[237,5,-112],fov:70}
});
export const IRBY_ASHLEY_ORIGINAL_ROOFS=Object.freeze([
  {name:'Continuous garden range',rect:[211.9,-122.7,260.6,-112.7],axis:'x',rise:2.7},
  {name:'Roadside north wing',rect:[250.4,-124.2,260.6,-98.6],axis:'z',rise:2.8,gable:true},
  {name:'Narrow north wing',rect:[235.4,-118,241.7,-98.6],axis:'z',rise:2.3,gable:true},
  {name:'Tower-side return',rect:[211.9,-122.7,221.7,-101.9],axis:'z',rise:2.6},
  {name:'Tower-facing cross wing',rect:[204.2,-109.4,221.7,-101.9],axis:'x',rise:2.3},
  {name:'West garden gable',rect:[247.7,-137.5,263.2,-124.2],axis:'z',rise:3,gable:true},
  {name:'East garden gable',rect:[211.9,-131.8,219.2,-118],axis:'z',rise:2.5,gable:true},
  {name:'Small east service projection',rect:[208.1,-127,211.9,-122.7],axis:'z',rise:1.1,eave:4.0}
]);
export const IRBY_ASHLEY_ROOFS=Object.freeze([
 ...IRBY_ASHLEY_ORIGINAL_ROOFS.filter(r=>r.name!=='Tower-facing cross wing')
  .map(r=>r.name==='Tower-side return'?{...r,rect:[211.9,-122.7,221.7,connectionFront]}:r)
]);

export function createIrbyAshley(THREE,{brick,roof,worldUV,material,rearElevation=null}){
  const building=new THREE.Group();building.name='Irby/Ashley';
  brick=brick.clone();brick.color.set(0xf2ded0);
  const {x:cx,z:cz,eave}=IRBY_ASHLEY;building.position.set(cx,0,cz);
  const footprint=rearElevation?.footprint??IRBY_ASHLEY_FOOTPRINT;
  const roofs=rearElevation?.roofs??IRBY_ASHLEY_ROOFS;
  const local=footprint.map(([x,z])=>[x-cx,z-cz]);
  const white=material(0xbab9ab),steel=material(0x354447),red=material(0x8f4e38);
  const batches=new Map(),openings=[],bays=[],roofSurfaces=[];
  function mesh(g,m,x=0,y=0,z=0,name=''){
    const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;
    o.castShadow=true;o.receiveShadow=true;building.add(o);return o;
  }
  function box(m,x,y,z,w,h,d,r=0){
    if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});
  }
  function mass(points,height,bottom,mat,name){
    const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
    const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);
    const wall=mesh(worldUV(g,1.7),mat,0,bottom,0,name);wall.userData.collisionFootprint=points;
    return wall;
  }
  // The tiny side projection has a lower roof and a continuous tall main wall.
  const mainFootprint=rearElevation?local:local.filter(([x,z])=>!(Math.abs(x+cx-208.1)<.01&&[-122.7,-127].some(v=>Math.abs(z+cz-v)<.01)));
  mass(mainFootprint,eave,0,brick,'Yellow-refined Irby/Ashley walls').userData.historicOutlinePadding=.7;
  mass(mainFootprint,.38,0,material(0x685549),'Weathered brick foundation');
  const projection=[[208.1,-127],[211.9,-127],[211.9,-122.7],[208.1,-122.7]].map(([x,z])=>[x-cx,z-cz]);
  if(!rearElevation)mass(projection,4,0,brick,'Low east service room').userData.historicOutlinePadding=.7;
  const detail=photoDetailPrimitives(THREE,{model:building,box,mesh,white,steel,material});
  function sash(x,y,z,r,w=1.3,h=2.75,label='Tall multi-pane sash'){
    detail.sash(label,x,y,z,r,w,h);
    const nx=Math.sin(r),nz=Math.cos(r);
    // Broad grey stone head and dark projecting sill, visible in img1/img3.
    box(white,x+nx*.07,y+h/2+.15,z+nz*.07,w+.43,.28,.22,r);
    box(steel,x+nx*.19,y-h/2-.15,z+nz*.19,w+.43,.13,.4,r);
    openings.push({x,y,z,r,w,h,label});
  }
  function trim(a,b,{height=eave,band=true,outward=1}={}){
    const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),nx=-dz/length*outward,nz=dx/length*outward,r=Math.atan2(nx,nz);
    const at=(m,y,h,d,n)=>box(m,(a[0]+b[0])/2+nx*n,y,(a[1]+b[1])/2+nz*n,length,h,d,r);
    if(band)at(brick,3.9,.18,.18,.03);
    at(red,height-.58,.14,.19,.07);at(brick,height-.24,.18,.3,.09);
    at(steel,height+.02,.12,.18,.18);
    for(let t=.19;t<length;t+=.42)box(red,a[0]+dx*t/length+nx*.11,height-.41,a[1]+dz*t/length+nz*.11,.18,.17,.26,r);
  }
  function surface(vertices,faces,mat,name,upward=false){
    const p=[],uv=[];
    for(const face of faces){
      const points=face.map(i=>vertices[i]);
      if(upward){const normal=new THREE.Vector3().crossVectors(new THREE.Vector3(...points[1]).sub(new THREE.Vector3(...points[0])),new THREE.Vector3(...points[2]).sub(new THREE.Vector3(...points[0])));if(normal.y<0)points.reverse();}
      for(const [x,y,z] of points){p.push(x,y,z);uv.push(x/2,(z+y)/2);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
    const o=mesh(g,mat,0,0,0,name);if(upward)roofSurfaces.push(o);return o;
  }
  function ridge(a,b,r=.06,mat=red){detail.rod(a,b,r,mat);}
  const conservatory={x0:236.5,x1:247.7,z0:-142,z1:-122.7};
  const cornerX=247.7-cx,cornerZ=-122.7-cz,cornerRadius=3.6;
  const cornerInset=cornerRadius*(Math.SQRT2-1);
  const cornerOutline=[[cornerX,cornerZ],[cornerX,cornerZ-cornerRadius],
    [cornerX-cornerInset,cornerZ-cornerRadius],
    [cornerX-cornerRadius,cornerZ-cornerInset],[cornerX-cornerRadius,cornerZ]];
  const cornerPeak=[cornerX-.45,eave+2.15,cornerZ-.45];
  // The rear valley meets the existing garden-range slope, while the
  // yellow-marked ridge joins the corner peak to the west gable ridge.
  const cornerValley=[cornerPeak[0],eave+2.7*(1.6+.18)/5.18,cornerZ+1.6];
  for(const spec of roofs){
    const [wx0,wz0,wx1,wz1]=spec.rect,x0=wx0-cx-.18,x1=wx1-cx+.18,z0=wz0-cz-.18,z1=wz1-cz+.18;
    const y=spec.eave??eave,top=y+spec.rise,alongX=spec.axis==='x',inset=spec.gable?0:Math.min(x1-x0,z1-z0)*.43;
    const v=[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],
      ...(alongX?[[x0+inset,top,(z0+z1)/2],[x1-inset,top,(z0+z1)/2]]:[[(x0+x1)/2,top,z0+inset],[(x0+x1)/2,top,z1-inset]])];
    const faces=alongX?[[0,1,5],[0,5,4],[2,3,4],[2,4,5]]:[[1,2,5],[1,5,4],[3,0,4],[3,4,5]];
    const ends=alongX?[[1,2,5],[3,0,4]]:[[0,1,4],[2,3,5]];
    if(spec.name==='West garden gable'){
      const cornerEave=[cornerOutline[1][0],eave+.05,cornerOutline[1][1]];
      v.push(cornerEave,cornerPeak,[(x0+x1)/2,y,z1]);
      // Replace the old rear west slope/verge with a continuous ridge to
      // the octagonal hip. The front and east gable faces remain in place.
      surface(v,[...faces.slice(0,2),[6,0,4],[6,4,5],[6,5,7]],roof,spec.name+' slate roof',true);
      const gable=surface(v,[ends[0],[2,8,5]],brick,spec.name+' brick gables');
      gable.material=brick.clone();gable.material.side=THREE.DoubleSide;
      worldUV(gable.geometry,1.7);
      for(const i of [0,1])ridge(v[i],v[4],.095,red);
      ridge(v[2],v[5],.095,red);
      ridge(v[4],v[5],.085);
      ridge(v[5],cornerPeak,.085);
      surface([v[5],cornerPeak,cornerValley,[(x0+x1)/2,y,-117.7-cz]],
        [[0,1,2],[0,2,3]],roof,'Corner to west ridge junction slate roof',true);
      continue;
    }
    surface(v,spec.gable?faces:faces.concat(ends),roof,spec.name+' slate roof',true);
    if(spec.gable){
      const gable=surface(v,ends,brick,spec.name+' brick gables');gable.material=brick.clone();gable.material.side=THREE.DoubleSide;
      worldUV(gable.geometry,1.7);
      for(const f of ends)for(const i of [0,1])ridge(v[f[i]],v[f[2]],.095,red);
    }else for(const [i,j] of alongX?[[0,4],[3,4],[1,5],[2,5]]:[[0,4],[1,4],[2,5],[3,5]])ridge(v[i],v[j],.045,steel);
    ridge(v[4],v[5],.085);
  }
  // img4.png separates the corner return, two flat-wall windows and the
  // half-octagonal bay. Keep the bay clear of the conservatory's court edge.
  let corner=null;
  if(!rearElevation){
    mass(cornerOutline,eave,0,brick,'Quarter-octagonal garden corner');
    const cornerRoof=cornerOutline.map(([x,z])=>[x,eave+.05,z]);
    // The exposed three-sided hip shares its peak with the west ridge.
    // Its rear plane drains into the garden range; no isolated pyramid or
    // lower gable-edge connection remains at the blue-circled junction.
    cornerRoof[0]=cornerValley;
    cornerRoof.push(cornerPeak);
    surface(cornerRoof,[[1,2,5],[2,3,5],[3,4,5],[4,0,5]],roof,'Quarter-octagonal corner slate roof',true);
    for(let i=1;i<4;i++){
      const a=cornerOutline[i],b=cornerOutline[i+1];trim(a,b);
      if(i===3)continue; // The short return towards the main range is plain brick.
      const dx=b[0]-a[0],dz=b[1]-a[1],r=Math.atan2(-dz,dx);
      const x=(a[0]+b[0])/2+Math.sin(r)*.035,z=(a[1]+b[1])/2+Math.cos(r)*.035;
      sash(x,5.9,z,r,i===1?.9:1.35,2.7,'Quarter-octagonal corner upper sash');
      sash(x,2.45,z,r,i===1?.85:1.25,1.05,'Quarter-octagonal corner lower light');
      ridge(cornerRoof[5],cornerRoof[i+1],.045,steel);
    }
    corner={footprint:cornerOutline.map(([x,z])=>[x+cx,z+cz])};
    for(const bx of [232.8,225.1]){
      const x=bx-cx,z=-122.7-cz;
      const outline=[[x+2.8,z+.03],[x+2.8,z-.48],[x+1.65,z-1.65],[x-1.65,z-1.65],[x-2.8,z-.48],[x-2.8,z+.03]];
      mass(outline,eave,0,brick,'Canted garden window bay');
      const v=outline.map(([u,w])=>[u,eave+.05,w]);v[0][1]=v[5][1]=eave+1.75;v[0][2]=v[5][2]=z+1.9;
      surface(v,[[0,1,2],[0,2,3],[0,3,5],[3,4,5]],roof,'Canted garden bay slate roof',true);
      for(let i=0;i<5;i++){
        const a=outline[i],b=outline[i+1];trim(a,b);
        if(i===0||i===4)continue;
        const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),r=Math.atan2(-dz/l,dx/l);
        for(const y of [2.05,5.9])sash((a[0]+b[0])/2+Math.sin(r)*.025,y,(a[1]+b[1])/2+Math.cos(r)*.025,r,i===2?1.35:.86,2.7,'Canted bay sash');
      }
      bays.push({x:bx,z:-122.7,footprint:outline.map(([u,v])=>[u+cx,v+cz])});
    }
  }
  // Positive-area main perimeter: (dz, -dx) is the outward normal.
  for(let i=0;i<mainFootprint.length;i++){
    const a=mainFootprint[i],b=mainFootprint[(i+1)%mainFootprint.length];
    const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<.01)continue;
    const nx=dz/length,nz=-dx/length,r=Math.atan2(nx,nz);
    const wx=(a[0]+b[0])/2+cx,wz=(a[1]+b[1])/2+cz;
    if(rearElevation&&a[1]+cz<=-122.7+.001&&b[1]+cz<=-122.7+.001)continue;
    const gardenGable=nz<-.9&&(wz<-131);
    const westGardenReturn=Math.abs(wx-247.7)<.1&&wz<-122.7;
    const gardenWall=nz<-.9&&Math.abs(wz+122.7)<.1;
    // Stop the old eaves at the new corner instead of crossing its hip roof.
    trim(westGardenReturn?[a[0],cornerZ-cornerRadius]:a,gardenWall?[cornerX-cornerRadius,b[1]]:b,{outward:-1});
    const count=gardenGable?1:westGardenReturn?2:gardenWall?4:Math.max(0,Math.floor((length-.8)/3.55));
    for(let n=0;n<count;n++){
      // Explicit stations preserve the two sashes between corner and bay.
      // The west-wing pair stays spread across the exposed wall, clear of
      // the corner addition, matching the purple marks in the photograph.
      const t=gardenGable?.24:(n+.5)/count;
      const x=(gardenWall?[221,228.95,238.15,241.55][n]-cx:a[0]+dx*t)+nx*.035;
      const z=(westGardenReturn?[-135.9,-127.8][n]-cz:a[1]+dz*t)+nz*.035;
      if(gardenWall&&bays.some(bay=>Math.abs(x+cx-bay.x)<3.35))continue;
      // Low side room and glazed lean-to cover these ground-floor sections.
      const covered=(Math.abs(x+cx-211.9)<.1&&z+cz<-122.6&&z+cz>-127.1)||
        (gardenWall&&x+cx>conservatory.x0&&x+cx<conservatory.x1)||
        (westGardenReturn&&z+cz>conservatory.z0&&z+cz<conservatory.z1);
      const entry=n===Math.floor(count/2)&&((nz>.9&&wx>250)||(nz<-.9&&wz<-131));
      if(entry)detail.door(x,z,r);
      const corridorContact=!rearElevation&&nz>.9&&x+cx>211.8&&x+cx<221.8&&
        Math.abs(z+cz-connectionFront)<.1;
      if(!covered&&!entry&&!corridorContact)sash(x,2.05,z,r,1.3,2.65);
      sash(x,5.9,z,r,gardenGable?1.4:1.3,2.75);
    }
    if(length>5)box(steel,a[0]+dx*.07+nx*.2,4.1,a[1]+dz*.07+nz*.2,.095,8.1,.095);
  }
  // Gable chimney breasts and tall, narrow stacks are prominent in both photos.
  const chimneys=[[255.45,-137.05,12.8],[255.5,-99.3,12.2],[238.55,-113.5,13.6],[224.6,-117.7,12.7],[215.55,-130.9,12.5]];
  for(const [wx,wz,height] of chimneys.filter(c=>!rearElevation||c[1]>-130)){
    const x=wx-cx,z=wz-cz;
    const o=mesh(worldUV(new THREE.BoxGeometry(1.15,height-eave+1,1.05),1.7),brick,x,(height+eave-1)/2,z,'Brick chimney stack');
    for(const [y,w,d] of [[height-.35,1.32,1.22],[height-.13,1.42,1.3]])box(red,x,y,z,w,.17,d);
    box(steel,x,height-.025,z,1.04,.055,.91);
    if(wz<-130){
      const breast=mesh(worldUV(new THREE.BoxGeometry(.82,8.5,.28),1.7),brick,x,4.25,wz<-135?-137.58-cz:-131.88-cz,'Garden gable chimney breast');
      breast.userData.orientedCollision=true;
    }
  }
  // Low glazed lean-to from img1/img3, retained as usable historic glazing.
  if(!rearElevation){
    const {x0:wx0,x1:wx1,z0:wz0,z1:wz1}=conservatory,x0=wx0-cx,x1=wx1-cx,z0=wz0-cz,z1=wz1-cz;
    const glass=material(0x819695,{roughness:.38,metalness:.12}),paint=material(0xaebebe);
    // Blue-arrow correction: the high edge meets the west garden wing at x1.
    // Fall across X into the court, perpendicular to the previous Z slope.
    const roofY=x=>2.85+(x-x0)/(x1-x0)*.9;
    // The extension passes the wing's end, exposing a new right-hand side.
    for(const [a,b] of [[[x0,z0],[x1,z0]],[[x0,z1],[x0,z0]],[[x1,z0],[x1,-137.5-cz]]]){
      const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),r=Math.atan2(-dz,dx),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
      const wall=mesh(worldUV(new THREE.BoxGeometry(len,1.05,.3),1.7),brick,mid[0],.525,mid[1],'Conservatory low brick wall');wall.rotation.y=r;wall.userData.orientedCollision=true;
      surface([[a[0],1.05,a[1]],[b[0],1.05,b[1]],[b[0],roofY(b[0]),b[1]],[a[0],roofY(a[0]),a[1]]],[[0,2,1],[0,3,2]],glass,'Conservatory side glazing');
      const sections=Math.ceil(len/1.25);
      for(let i=0;i<=sections;i++){
        const t=i/sections,x=a[0]+dx*t,z=a[1]+dz*t,top=roofY(x);
        box(paint,x,(1.05+top)/2,z,.07,top-1.05,.07);
      }
      box(paint,mid[0],1.05,mid[1],len,.075,.1,r);
      ridge([a[0],roofY(a[0])+.02,a[1]],[b[0],roofY(b[0])+.02,b[1]],.055,paint);
    }
    const roofV=[[x0,roofY(x0),z0],[x1,roofY(x1),z0],[x1,roofY(x1),z1],[x0,roofY(x0),z1]];
    surface(roofV,[[0,1,2],[0,2,3]],glass,'Glazed courtyard lean-to roof',true);
    for(let x=x0;x<=x1+.01;x+=1.25)ridge([x,roofY(x)+.03,z0],[x,roofY(x)+.03,z1],.045,paint);
    for(let z=z0;z<=z1+.01;z+=1.45)ridge([x0,roofY(x0)+.03,z],[x1,roofY(x1)+.03,z],.045,paint);
  }
  const rearData=rearElevation?.build(THREE,{building,brick,roof,worldUV,material,mesh,box,mass,surface,sash,trim,detail,eave,cx,cz})??{};
  const dummy=new THREE.Object3D();
  for(const [mat,items] of batches){
    const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);batch.name='Irby/Ashley sashes, masonry bands and rainwater goods';batch.castShadow=true;batch.receiveShadow=true;batch.userData.orientedCollision=true;
    items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.rotation.set(0,b.r,0);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});building.add(batch);
  }
  building.userData={...building.userData,source:IRBY_ASHLEY,footprint,storeys:2,openings,bays,corner,conservatory:rearElevation?null:conservatory,roofs,...rearData,
    // Only this selected range is superseded; leave the adjoining OS corridor.
    replacedOSEdges:{sourceBuilding:0,sourceLoop:0,indices:Array.from({length:19},(_,i)=>170+i)}};
  return building;
}
