import {ESCAPE_WATER_TOWER} from './water-tower.mjs';
import {addPharmacyCourt,PHARMACY_VIEWS} from './pharmacy-court.mjs';
import {SERVICE_COURT_MOVES,moveServiceRect,moveServiceView} from './service-court-placement.mjs';
import {IRBY_CORRIDOR} from './irby-corridor.mjs';
import {MAIN_KITCHEN} from './main-kitchen.mjs';

import {TOWER_ROOF_CONTACTS} from './tower-roof-profiles.mjs';
export {TOWER_ROOF_CONTACTS} from './tower-roof-profiles.mjs';

// tower_buildings/img1–4 and their camera marks. The OS trace anchors the
// outer ranges; roof heights and obscured internal divisions are estimates.
// The block circled blue in img4 is deliberately outside this reconstruction.
export const TOWER_BUILDING_VIEWS=Object.freeze({
 ...PHARMACY_VIEWS,
 'tower-buildings':{position:[279,108,81],target:[179,8,-36],fov:52},
 'tower-buildings-roofs':{position:[105,89,2],target:[166,7,-46],fov:52},
 // The enlarged third workshop fills the former western camera position.
 'tower-twin-gables':moveServiceView({position:[223,1.8,-71],target:[204.5,5.2,-74],fov:68},SERVICE_COURT_MOVES.workshops),
 'tower-workshop-copy':moveServiceView({position:[122,72,-158],target:[185,5,-68],fov:46},SERVICE_COURT_MOVES.workshops),
 'tower-twin-gables-site':{position:[99,100,-172],target:[185,4,-48],fov:52},
 'tower-roof-white-door':{position:[148,15,-26],target:[148,10,-51],fov:55},
 'tower-roof-north':{position:[148,15,-86],target:[148,10,-59.5],fov:55},
 'tower-roof-away':{position:[179,16,-55.2],target:[153,10,-55.2],fov:55},
 'tower-buildings-1':{position:[119,15,-8],target:[157,18,-51],fov:62},
 'tower-buildings-2':{position:[198,19,7],target:[190,7,-35],fov:70},
 'tower-buildings-3':{position:[269,3,39],target:[205,10,-21],fov:63},
 'tower-buildings-4':{position:[229,18,17],target:[243,6,-54],fov:100},
 'tower-buildings-plan':{position:[186,185,-28],target:[186,0,-28.01],fov:52}
});
// The marked yellow frontage follows the unchanged eastern stores wall.
export const TOWER_SERVICE_FRONT=-16.6;
// Slide towards main/admin (+Z); the user chose extra travel to clear the fixed chimney.
export const TOWER_ADMIN_SHIFT=8.5;
const shiftedRanges=new Set(['Chimney service hall','Ramp entrance link','East court flat infill','South cross-gabled stores','Long east service range','North east stepped link']);
const towardsAdmin=z=>z+TOWER_ADMIN_SHIFT;
// Latest blue line: grow the three backs to the corridor, holding the
// courtyard fronts and their photographed roof dormers in place.
const workshopRear=IRBY_CORRIDOR.start[1]+IRBY_CORRIDOR.width/2-SERVICE_COURT_MOVES.workshops.z;
const workshopDormerZ=-80.5;
const sourceRanges=[
 {name:'Tower east traced abutment',rect:[153.1,-60.3,158.2,-50.1],height:8.84,roof:'traced'},
 {name:'Tower east dormered range',rect:[158.2,-60.3,180,-40.5],height:8.84,rise:3.9,axis:'x',roof:'traced',hipInset:5},
 {name:'North tower range',rect:[146.3,-74.1,162.3,-60.3],height:8.84,rise:4.076470588235294,axis:'z',roof:'corridor',attach:'south'},
 // The pink guide retracts the west edge to world X=190; the other edges stay fixed.
 {name:'Dormered central service hall',rect:[182.5,-49,202,-32],height:7.3,rise:4.6,axis:'z',roof:'gable'},
 // Move the yellow building twelve units outwards (-Z), then duplicate it
 // towards the tower. East/west slopes leave south gables facing the yard.
 {name:'Rear east gabled workshop',rect:[204.5,workshopRear,218.5,-73.5],height:6.4,rise:3.4,axis:'z',roof:'gable'},
 {name:'Rear west gabled workshop',rect:[190.5,workshopRear,204.5,-73.5],height:6.4,rise:3.4,axis:'z',roof:'gable'},
 {name:'Western tower flat link',rect:[153.1,-40.5,159.3,-36.3],height:6.4,roof:'flat'},
 // Yellow correction: the long axis turns north/south, with a flat front
 // section and a hipped ridge terminating against the tower's south wall.
 {name:'Low west stores',rect:[146.3,-50.1,162.3,-36.3],height:8.84,rise:4.076470588235294,axis:'z',roof:'corridor',attach:'north'},
 {name:'West stores flat front',rect:[146.3,-36.3,162.3,TOWER_SERVICE_FRONT],height:8.84,roof:'flat',
  footprint:[[146.3,-36.3],[162.3,-36.3],[162.3,TOWER_SERVICE_FRONT],[MAIN_KITCHEN.maxX,TOWER_SERVICE_FRONT],[MAIN_KITCHEN.maxX,MAIN_KITCHEN.minZ],[146.3,MAIN_KITCHEN.minZ]]},
 // The old buried wall overlap under the west stores is not part of the moved outline.
 // Red to yellow: retract the rear to world Z=-13.3. Purple to green:
 // retract the circular-window end to X=190 and carry the flat link to it.
 {name:'Chimney service hall',rect:[162.3,-32,182.5,TOWER_SERVICE_FRONT],roofRect:[162.3,-32,182.5,TOWER_SERVICE_FRONT],height:6.4,rise:7.2,axis:'x',roof:'hip-gable',gableEnd:'east',hipInset:4},
 // Extend the red rear edge to the central hall and widen the purple flat
 // face to its east wall (world X=209.5), shortening the blue stores to match.
 {name:'Ramp entrance link',rect:[182.5,-40.5,202,TOWER_SERVICE_FRONT],height:6.4,roof:'flat',parapetEdges:['north','south','west']},
 // Red-marked enclosed court: fill between the existing four ranges with
 // a level roof continuous with the entrance link, without an internal parapet.
 {name:'East court flat infill',rect:[202,-49,208.8,-28.1],height:6.4,roof:'flat',joinedRoof:'Ramp entrance link',parapetEdges:[]},
 {name:'South cross-gabled stores',rect:[202,-28.1,220.86,TOWER_SERVICE_FRONT],height:9.0,rise:3.9,axis:'x',roof:'gable'},
 {name:'Long east service range',rect:[208.8,-57.2,220.86,-28.1],height:9.0,rise:3.5,axis:'z',roof:'hip'},
 {name:'North east stepped link',rect:[202,-57.2,211.4,-49],height:5.5,rise:2.1,axis:'x',roof:'gable'}
].map(range=>{
 if(!shiftedRanges.has(range.name))return range;
 const translate=([x0,z0,x1,z1])=>[x0,towardsAdmin(z0),x1,towardsAdmin(z1)];
 return {...range,rect:translate(range.rect),...(range.roofRect?{roofRect:translate(range.roofRect)}:{})};
});
const purpleRanges=new Set([...shiftedRanges,'Dormered central service hall']);
const rangeMove=name=>purpleRanges.has(name)?'purple':name.startsWith('Rear ')?'workshops':null;
export const TOWER_RANGES=Object.freeze(sourceRanges.map(range=>{
 const move=SERVICE_COURT_MOVES[rangeMove(range.name)];
 return move?{...range,rect:moveServiceRect(range.rect,move),...(range.roofRect?{roofRect:moveServiceRect(range.roofRect,move)}:{})}:range;
}));

// Red/yellow screenshot correction: copy the west workshop into the adjoining
// yellow footprint, retaining its north edge and the original building height.
// The later Irby corridor correction shortens its depth to match the other
// two workshops, preserving the pharmacy approach after the row moves forward.
const sourceWorkshopCopy=Object.freeze({
 name:'Enlarged west workshop',source:'Rear west gabled workshop',
 dormer:'Enlarged workshop blue dormer',sourceDormer:'Rear building blue dormer 2',
 footprintScale:1.5,depthScale:1,rect:Object.freeze([169.5,workshopRear,190.5,-73.5])
});
export const TOWER_WORKSHOP_COPY=Object.freeze({...sourceWorkshopCopy,
 rect:Object.freeze(moveServiceRect(sourceWorkshopCopy.rect,SERVICE_COURT_MOVES.workshops))});

export function createTowerBuildings(THREE,exterior){
 const group=new THREE.Group();group.name='Tower service buildings';
 group.userData.reference='Research/tower-buildings/README.md';
 group.userData.ranges=TOWER_RANGES;group.userData.layout='historic';
 group.userData.adminShift={distance:TOWER_ADMIN_SHIFT,axis:'z',ranges:[...shiftedRanges]};
 group.userData.courtMoves=SERVICE_COURT_MOVES;
 group.userData.replacedOSEdges={sourceBuilding:0,sourceLoop:0,indices:[82,83,84]};
 // The photograph establishes an open yard here, superseding old OS marks.
 group.userData.replacedOSAreas=[[[180.3,-73.5],[222,-73.5],[222,-49],[180.3,-49]]];
 const brick=exterior.mainAdmin.getObjectByName('Central administration range walls').material.clone();
 brick.color.multiplyScalar(1.13);
 const roof=exterior.mainAdmin.getObjectByName('Central administration range slate roof').material.clone();
 roof.color.multiplyScalar(1.15);
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.88});
 const stone=mat(0xb9b5a5),frame=mat(0xd5dcd5),glass=mat(0x526b70),dark=mat(0x343d3b),red=mat(0x995f49),blue=mat(0x739eae),flat=mat(0x4e5450);
 const batches=new Map(),openings=[],copyMeshes=[],copyDetails=[];
 const movingMeshes=[];
 let placement=null;
 let captureWorkshop=false;
 function uv(g){const p=g.attributes.position,n=g.attributes.normal,a=[];for(let i=0;i<p.count;i++){const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));a.push((x>z?p.getZ(i):p.getX(i))/1.7,(y>.5?p.getZ(i):p.getY(i))/1.7);}g.setAttribute('uv',new THREE.Float32BufferAttribute(a,2));return g;}
 function mesh(g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;group.add(o);if(placement)movingMeshes.push({object:o,placement});if(captureWorkshop)copyMeshes.push(o);return o;}
 function box(m,x,y,z,w,h,d,name=''){return mesh(uv(new THREE.BoxGeometry(w,h,d)),m,x,y,z,name);}
 function detail(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);const item={x,y,z,w,h,d,r,placement};batches.get(m).push(item);if(captureWorkshop)copyDetails.push({material:m,item});}
 function poly(points,m,name){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.computeVertexNormals();return mesh(uv(g),m,0,0,0,name);}
 function line(a,b,m,r=.065,name=''){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),8),m,...a.map((n,i)=>(n+b[i])/2),name);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function pitched(spec){
  const {rect:[x0,z0,x1,z1],height:h,rise,axis,roof:type,name}=spec;
  const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,e=h+.14;
  const a=w/2+.2,b=d/2+.2,alongX=axis==='x';
  const inset=spec.hipInset??(['hip','attached-hip','hip-gable'].includes(type)?Math.min(a,b)*.85:0);
  const startEnd=alongX?'west':'north',finishEnd=alongX?'east':'south';
  const startInset=spec.attach===startEnd||spec.gableEnd===startEnd?0:inset,endInset=spec.attach===finishEnd||spec.gableEnd===finishEnd?0:inset;
  const v=[[-a,e,-b],[a,e,-b],[a,e,b],[-a,e,b],...(alongX?[[-a+startInset,e+rise,0],[a-endInset,e+rise,0]]:[[0,e+rise,-b+startInset],[0,e+rise,b-endInset]])];
  const faces=alongX?[[0,1,5],[0,5,4],[1,2,5],[2,3,4],[2,4,5],[3,0,4]]:[[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]];
  // Gables are brick; only the slopes receive slate.
  const ends=alongX?[2,5]:[0,3],gableFaces=type==='gable'?ends:type==='hip-gable'?[alongX?(spec.gableEnd==='west'?5:2):(spec.gableEnd==='north'?0:3)]:[];
  poly(faces.filter((_,i)=>type==='attached-hip'?i!==(spec.attach==='north'?0:3):!gableFaces.includes(i)).flatMap(f=>[...f].reverse().map(i=>[cx+v[i][0],v[i][1],cz+v[i][2]])),roof,name+' slate roof');
  for(const i of gableFaces)poly([...faces[i]].reverse().map(j=>[cx+v[j][0],v[j][1],cz+v[j][2]]),spec.gableMaterial??brick,name+' brick gable');
  line([cx+v[4][0],e+rise+.05,cz+v[4][2]],[cx+v[5][0],e+rise+.05,cz+v[5][2]],red,.10,name+' ridge');
 }
 for(const spec of sourceRanges){
  placement=rangeMove(spec.name);
  const {rect:[x0,z0,x1,z1],height:h,name}=spec,cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
  if(spec.footprint){
   // Cut the entire stores shell and roof back around the kitchen corner.
   // A polygon collision preserves the recess instead of blocking its bounds.
   function shapePart(m,bottom,height,suffix){
    const shape=new THREE.Shape(spec.footprint.map(([x,z])=>new THREE.Vector2(x,-z)));
    const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);
    const part=mesh(uv(g),m,0,bottom,0,name+suffix);part.userData.collisionFootprint=spec.footprint;return part;
   }
   // Stack the wall above its plinth instead of rendering coincident faces.
   shapePart(brick,.6,h-.6,' walls');shapePart(red,0,.6,' plinth');shapePart(flat,h,.16,' flat roof');
   for(let i=0;i<spec.footprint.length;i++){
    const a=spec.footprint[i],b=spec.footprint[(i+1)%spec.footprint.length];
    const alongX=a[1]===b[1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    // Only exposed edges receive a parapet; the north side remains joined.
    if(a[1]===z0&&b[1]===z0)continue;
    box(brick,(a[0]+b[0])/2,h+.26,(a[1]+b[1])/2,alongX?length:.25,.45,alongX?.25:length,name+' stepped parapet');
    box(stone,(a[0]+b[0])/2,h+.5,(a[1]+b[1])/2,alongX?length:.38,.12,alongX?.38:length,name+' stepped coping');
   }
   continue;
  }
  captureWorkshop=name===TOWER_WORKSHOP_COPY.source;
  if(name==='North tower range'){
   // Retain the stepped tower corridor after removing the yellow-marked hall.
   box(brick,151.6,h/2,-69.5,10.6,h,9.2,name+' west walls');
   box(brick,154.3,h/2,-62.6,16,h,4.6,name+' tower walls');
  }else{
   box(brick,cx,h/2,cz,w,h,d,name+' walls');
   box(red,cx,.3,cz,w+.08,.6,d+.08,name+' plinth');
  }
  if(spec.roof==='flat'){
   const joined=sourceRanges.find(r=>r.joinedRoof===name);
   if(joined){
    // One L-shaped slab avoids shadow seams from touching roof boxes.
    const [a,b,c,d]=joined.rect;
    const outline=[[x0,z0],[a,z0],[a,b],[c,b],[c,d],[x1,d],[x1,z1],[x0,z1]];
    const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));
    const g=new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:false});g.rotateX(-Math.PI/2);
    mesh(uv(g),flat,0,h,0,name+' flat roof');
   }else if(!spec.joinedRoof)box(flat,cx,h+.08,cz,w,.16,d,name+' flat roof');
   const parapets=spec.parapetEdges??['north','south','west','east'];
   for(const [edge,z] of [['north',z0],['south',z1]])if(parapets.includes(edge)){box(brick,cx,h+.26,z,w,.45,.25);box(stone,cx,h+.5,z,w+.15,.12,.38);}
   for(const [edge,x] of [['west',x0],['east',x1]])if(parapets.includes(edge)){box(brick,x,h+.26,cz,.25,.45,d);box(stone,x,h+.5,cz,.38,.12,d+.15);}
  }else if(!['corridor','traced'].includes(spec.roof))pitched({...spec,rect:spec.roofRect??spec.rect});
  for(const z of (name.startsWith('Rear ')&&spec.roof==='gable'?[]:[z0,z1])){const endX=name==='North tower range'&&z===z0?156.9:x1;detail(dark,(x0+endX)/2,h+.05,z,endX-x0+.3,.13,.14);}
 }
 captureWorkshop=false;
 placement=null;
 // Img1: the corridor begins one third of the way across each N/S face.
 // Its centre strip is flat in front of the upper arch; the shallow slope
 // starts at the final third and rises to a ridge east of the tower wall.
 const junction={startX:146.3,flatEndX:149.7,ridgeX:156,endX:162.3,deck:TOWER_ROOF_CONTACTS.deck,peak:TOWER_ROOF_CONTACTS.deck+(TOWER_ROOF_CONTACTS.corner-TOWER_ROOF_CONTACTS.deck)*6.3/3.4};
 group.userData.towerJunction=junction;group.userData.roofContacts=TOWER_ROOF_CONTACTS;
 function skyTriangle(a,b,c){return (b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>0?[a,b,c]:[a,c,b];}
 function clipPlane(points,axis,value,sign){
  const out=[];
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],da=(a[axis]-value)*sign,db=(b[axis]-value)*sign;
   if(da>=0)out.push(a);
   if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((n,k)=>n+(b[k]-n)*t));}
  }return out;
 }
 for(const spec of TOWER_RANGES.filter(r=>r.roof==='corridor')){
  const {name,rect:[x0,z0,x1,z1],attach}=spec,{flatEndX:flatX,ridgeX,deck,peak}=junction;
  box(flat,(x0+flatX)/2,deck-.08,(z0+z1)/2,flatX-x0,.16,z1-z0,name+' arch-front flat roof');
  // No parapet crosses the arch or the join from the flat strip to slate.
  if(name!=='Low west stores')box(stone,x0+.06,deck+.015,(z0+z1)/2+(attach==='north'?.125:-.125),.18,.12,z1-z0-.25,name+' outer flat coping');
  // This corner now shares the east-range ridge; its south return is flat.
  if(name==='Low west stores')continue;
  const hipLength=5.2;
  const v=[[flatX,deck,z0],[x1,deck,z0],[x1,deck,z1],[flatX,deck,z1],
   [ridgeX,peak,z0+(attach==='north'?0:hipLength)],[ridgeX,peak,z1-(attach==='south'?0:hipLength)]];
  const faces=[[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]].filter((_,i)=>i!==(attach==='north'?0:3));
  const triangles=[];
  for(const f of faces){const original=skyTriangle(...f.map(i=>v[i]));
   const parts=name==='North tower range'
    ?[clipPlane(original,0,156.9,-1),clipPlane(clipPlane(original,0,156.9,1),2,-64.9,1)]
    :[original];
   for(const p of parts)for(let i=1;i<p.length-1;i++)triangles.push(...skyTriangle(p[0],p[i],p[i+1]));
  }
  poly(triangles,roof,name+' slate roof');
  line(v[4],v[5],red,.09,name+' ridge');
  if(name==='North tower range'){
   // Close the two roof cuts exposed by the removed northern hall.
   const cutX=156.9,cutZ=-64.9,hipBreak=z0+hipLength*(1-Math.abs(cutX-ridgeX)/6.3);
   const roofHeight=(x,z)=>deck+(peak-deck)*Math.max(0,Math.min(1,1-Math.abs(x-ridgeX)/6.3,(z-z0)/hipLength));
   const returns=[];
   for(const edge of [[[cutX,z0],[cutX,hipBreak],[cutX,cutZ]],[[cutX,cutZ],[x1,cutZ]]]){
    for(let i=1;i<edge.length;i++){
     const [ax,az]=edge[i-1],[bx,bz]=edge[i],a=[ax,spec.height,az],b=[bx,spec.height,bz],at=[ax,roofHeight(ax,az),az],bt=[bx,roofHeight(bx,bz),bz];
     returns.push(a,at,bt,a,bt,b);
    }
   }
   poly(returns,brick,name+' exposed return walls');
  }
 }
 // Face 4 has two inward-falling slopes separated by a flat centre.
 // Continue the N/S roof cross-sections around both corners. There is no
 // parapet across the traced contact lines or central arch-front channel.
 const corridorHeight=x=>junction.deck+(junction.peak-junction.deck)*Math.max(0,1-Math.abs(x-junction.ridgeX)/6.3);
 const neckHeight=(x,z)=>junction.deck+Math.max(0,(Math.abs(z+55.2)-1.7)/3.4)*(corridorHeight(x)-junction.deck);
 const eastRidge={startX:junction.ridgeX,endX:175,z:-50.1,height:junction.peak},southEaveZ=-40.5;
 const southNeckHeight=(x,z)=>junction.deck+Math.max(0,(z+53.5)/3.4)*(eastRidge.height-junction.deck)*Math.min(1,Math.max(0,(x-junction.flatEndX)/6.3));
 const southRoofHeight=(x,z)=>junction.deck+(eastRidge.height-junction.deck)*Math.max(0,Math.min(1,(x-junction.flatEndX)/6.3,(180-x)/5,(southEaveZ-z)/(southEaveZ-eastRidge.z)));

 function roofGrid(name,xs,zs,height,material=roof){
  const tris=[];
  for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){
   const a=[xs[i-1],height(xs[i-1],zs[j-1]),zs[j-1]],b=[xs[i],height(xs[i],zs[j-1]),zs[j-1]],
    c=[xs[i],height(xs[i],zs[j]),zs[j]],d=[xs[i-1],height(xs[i-1],zs[j]),zs[j]];
   tris.push(...skyTriangle(a,b,c),...skyTriangle(a,c,d));
  }
  return poly(tris,material,name);
 }
 const neckXs=[153.1,156,158.2];
 roofGrid('Tower east north contact slate roof',neckXs,[-60.3,-56.9],neckHeight);
 roofGrid('Tower east south contact slate roof',neckXs,[-53.5,-50.1],southNeckHeight);
 roofGrid('Tower east arch-front flat roof',neckXs,[-56.9,-53.5],()=>junction.deck,flat);
 line([156,junction.peak,-60.3],[156,junction.deck,-56.9],red,.09,'North contact hip ridge');
 line([156,junction.deck,-53.5],[156,junction.peak,-50.1],red,.09,'South contact hip ridge');
 for(const z of [-60.3,-50.1])mesh(new THREE.SphereGeometry(.095,12,8),red,156,junction.peak,z,'Contact ridge joint');
 // Blend the traced west edge into the existing eastern hall roof without
 // a height step. The south edge meets the offset corridor at the same level.
 const mainXs=[158.2,159.5,161,163.2,166,171,175,177.5,180],mainZs=[-60.3,-56.9,-55.2,-53.5,eastRidge.z];
 function mainRoofHeight(x,z){
  if(z>=eastRidge.z)return southRoofHeight(x,z);
  const hip=junction.deck+(eastRidge.height-junction.deck)*Math.max(0,Math.min(1,(180-x)/5,(z+60.3)/(eastRidge.z+60.3)));
  const blend=Math.min(1,Math.max(0,(x-158.2)/5));
  const contact=z<=-53.5?neckHeight(158.2,z):southNeckHeight(158.2,z);
  return contact*(1-blend)+hip*blend;
 }
 roofGrid('Tower east dormered range slate roof',mainXs,mainZs,mainRoofHeight);
 // One continuous south-facing roof, with a west hip where the ridge ends
 // at the user's blue point. No second north/south ridge crosses this slope.
 const a=[junction.flatEndX,junction.deck,eastRidge.z],b=[eastRidge.startX,eastRidge.height,eastRidge.z],
  c=[eastRidge.endX,eastRidge.height,eastRidge.z],d=[180,junction.deck,eastRidge.z],
  e=[180,junction.deck,southEaveZ],f=[junction.flatEndX,junction.deck,southEaveZ];
 poly([...skyTriangle(a,b,f),...skyTriangle(b,c,e),...skyTriangle(b,e,f),...skyTriangle(c,d,e)],roof,'Tower south continuous slate roof');
 box(flat,(junction.flatEndX+junction.endX)/2,junction.deck-.08,(southEaveZ-36.3)/2,junction.endX-junction.flatEndX,.16,-36.3-southEaveZ,'Low west stores south flat return');
 // Continue the front parapet around both exposed edges of the adjoining
 // flat roof, up to the tower and slate eaves. Keep the arch contact and
 // the join between the level decks open, with no internal raised divider.
 for(const [x,z0,z1,edge] of [[146.3,-50.1,-36.3,'west'],[162.3,-40.5,-36.3,'east']]){
  box(brick,x,8.84+.26,(z0+z1)/2,.25,.45,z1-z0,'Low west stores '+edge+' parapet');
  box(stone,x,8.84+.5,(z0+z1)/2,.38,.12,z1-z0,'Low west stores '+edge+' coping');
 }
 line([eastRidge.startX,eastRidge.height+.05,eastRidge.z],[eastRidge.endX,eastRidge.height+.05,eastRidge.z],red,.10,'Tower east dormered range ridge');
 // Exposed eaves have brick beneath them; the roof never floats over the wall.
 for(const z of [-60.3,-40.5]){
  const side=[];
  for(let i=1;i<mainXs.length;i++){
   const a=mainXs[i-1],b=mainXs[i],v=[[a,junction.deck-.16,z],[b,junction.deck-.16,z],[b,mainRoofHeight(b,z),z],[a,mainRoofHeight(a,z),z]];
   for(const f of z===-60.3?[[0,2,1],[0,3,2]]:[[0,1,2],[0,2,3]])side.push(...f.map(k=>v[k]));
  }
  poly(side,brick,'East range eaves infill');
 }
 function sash(x,y,z,w=1.35,h=2.45,r=0,label='Service sash'){
  const nx=Math.sin(r),nz=Math.cos(r),dx=Math.cos(r),dz=-Math.sin(r);
  const p=(m,u,v,n,pw,ph,pd)=>detail(m,x+dx*u+nx*n,y+v,z+dz*u+nz*n,pw,ph,pd,r);
  openings.push({x,y,z,r,label,placement});p(dark,0,0,.035,w+.18,h+.15,.10);p(glass,0,0,.10,w,h,.05);
  for(const s of [-1,1]){p(frame,s*w/2,0,.15,.07,h,.08);p(frame,0,s*h/2,.15,w+.06,.07,.08);}
  for(const u of [-w/6,w/6])p(frame,u,0,.17,.025,h,.035);
  for(const v of [-h/6,h/6])p(frame,0,v,.17,w,.03,.035);
  p(frame,0,0,.18,w,.065,.05);p(stone,0,-h/2-.12,.12,w+.34,.17,.35);p(red,0,h/2+.16,.09,w+.28,.24,.18);
 }
 function door(x,y,z,w,h,r=0,m=blue,label='Service door'){
  const nx=Math.sin(r),nz=Math.cos(r);detail(dark,x,y,z,w+.2,h+.2,.12,r);detail(m,x+nx*.09,y,z+nz*.09,w,h,.1,r);
  for(const side of [-1,1])detail(stone,x+Math.cos(r)*side*(w/2+.09),y,z-Math.sin(r)*side*(w/2+.09),.15,h+.22,.19,r);
  detail(stone,x,y+h/2+.15,z,w+.38,.2,.22,r);openings.push({x,y,z,r,label,placement});
 }
 // Img1's adjoining workshop gables: tall middle sash, smaller flanking
 // lights, stone heads and blue service doors. Hidden elevations are inferred.
 const workshops=sourceRanges.filter(r=>r.name.startsWith('Rear ')&&r.roof==='gable');
 const workshopBlue=mat(0x28778d);
 placement='workshops';
 for(const spec of workshops){
  captureWorkshop=spec.name===TOWER_WORKSHOP_COPY.source;
  const [x0,z0,x1,z1]=spec.rect,cx=(x0+x1)/2,front=z1+.24;
  const west=spec.name.includes('west'),doorWidth=west?2.5:4.1;
  // Close the eave-height joint beneath the slightly overhanging gable.
  for(const z of [z0,z1])box(brick,cx,spec.height+.07,z,x1-x0+.4,.14,.42,spec.name+' gable base course');
  door(cx,1.95,front,doorWidth,3.8,0,workshopBlue,spec.name+' blue door');
  // Recessed timber panels and glazed transom above each blue door.
  detail(dark,cx,3.21,front+.16,doorWidth-.24,.9,.06);
  detail(glass,cx,3.21,front+.20,doorWidth-.4,.72,.04);
  for(const u of (west?[-1,-1/3,1/3,1]:[-1,0,1]))detail(workshopBlue,cx+u*(doorWidth-.3)/2,3.21,front+.24,.07,.86,.05);
  if(west)detail(workshopBlue,cx,3.21,front+.24,doorWidth,.065,.05);
  detail(workshopBlue,cx,2.77,front+.24,doorWidth,.10,.06);
  if(!west)detail(dark,cx,1.43,front+.16,.035,2.6,.03);
  detail(dark,cx+(west?-1:.35),1.5,front+.23,.09,.28,.08);
  for(const [dx,y,w,h] of [[0,6.7,1.7,3.1],[-3.35,6.4,1.2,2.3],[3.35,6.4,1.2,2.3]]){
   sash(cx+dx,y,front,w,h,0,spec.name+' upper sash');
   detail(stone,cx+dx,y+h/2+.22,front+.15,w+.48,.36,.25);
  }
  detail(stone,cx,4.13,front+.15,doorWidth+.6,.38,.3);
  const peak=spec.height+.14+spec.rise;
  for(const side of [-1,1]){
   line([cx+side*7.16,spec.height+.2,front],[cx,peak+.10,front],red,.12,spec.name+' gable coping');
  }
  line([cx,peak,front],[cx,peak+.48,front],red,.075,spec.name+' ridge finial');
  for(const x of [x0,x1]){
   line([x,spec.height+.05,z0],[x,spec.height+.05,z1],dark,.075,spec.name+' eaves gutter');
  }
  line([x1-.10,.18,front+.08],[x1-.10,6.4,front+.08],dark,.06,spec.name+' yard downpipe');
 }
 captureWorkshop=false;
 placement=null;
 // Paved passage exposed by shortening the central hall, continuous up to
 // the workshop doors. Ground-level surfacing does not block the walker.
 box(flat,202,-.04,-48.4,60,.08,31,'Twin workshop paved court');
 // Extend the existing pad to the hall's rear wall under the moved cylinders.
 box(flat,174.8,-.04,-24.15,24,.08,21.7,'Chimney cylinder hardstanding');
 placement='purple';
 // Main south face: four taller lights, recessed entry and lower ramp-side lights.
 for(const x of [163,168,173,178])sash(x,3.35,towardsAdmin(TOWER_SERVICE_FRONT+.03),1.45,2.9);
 door(190,3.45,towardsAdmin(-16.57),2.4,4.3,0,dark,'Ramp entrance');
 // Keep the stores openings and rooflight on their shortened host; only
 // their horizontal positions change, preserving all opening dimensions.
 const storesFrontX=x=>202+(x-196)*(220.86-202)/(220.86-196);
 for(const x of [199,207])sash(storesFrontX(x),2.45,towardsAdmin(-16.57),2.0,1.8);
 door(storesFrontX(216),1.65,towardsAdmin(-16.56),1.65,3.0,0,dark);
 // img3: blue double doors and a high gable light at the east end, with a
 // repeated high sash rhythm continuing north along the long range.
 door(220.89,2.05,towardsAdmin(-21.9),3.4,3.8,Math.PI/2,blue,'Blue stores double doors');
 sash(220.9,10.55,towardsAdmin(-22.35),1.3,1.9,Math.PI/2,'High stores gable sash');
 // main_redfine2/img2: tall upper sashes above a mostly solid ground storey.
 for(const z of [-30.4,-34.9,-39.4,-43.9,-48.4,-52.8])sash(220.89,6.5,towardsAdmin(z),1.3,3.05,Math.PI/2,'Rear lane upper sash');
 for(const z of [-51.1,-42.2])sash(220.89,1.65,towardsAdmin(z),1.45,1.95,Math.PI/2,'Rear lane ground sash');
 door(220.9,1.6,towardsAdmin(-46.7),1.55,3.05,Math.PI/2,dark,'Rear lane recessed door');
 door(220.9,1.85,towardsAdmin(-27.05),1.55,3.5,Math.PI/2,frame,'Court end pale service door');
 // Shallow segmental brick heads sit above the lower openings.
 for(const [z,width,head] of [[-51.1,1.45,2.74],[-42.2,1.45,2.74],[-46.7,1.55,3.24]]){
  const triangles=[],radius=width/2+.12;
  for(let i=0;i<16;i++){
   const a=i*Math.PI/16,b=(i+1)*Math.PI/16;
   const p=(t,outer)=>[221.04,head+Math.sin(t)*(.3+(outer?.2:0)),towardsAdmin(z)+Math.cos(t)*(radius+(outer?.2:0))];
   triangles.push(p(a,false),p(b,true),p(b,false),p(a,false),p(a,true),p(b,true));
  }
  poly(triangles,red,'Rear lane segmental brick head');
 }
 const laneRange=sourceRanges.find(r=>r.name==='Long east service range');
 const laneZ=(laneRange.rect[1]+laneRange.rect[3])/2;
 box(dark,220.98,9.04,laneZ,.17,.18,laneRange.rect[3]-laneRange.rect[1],'Rear lane eaves gutter');
 for(const z of [-32.1,-40.5,-54.9]){
  box(dark,221.02,4.5,towardsAdmin(z),.11,9,.11,'Rear lane downpipe');
  line([221.02,.22,towardsAdmin(z)],[221.3,.22,towardsAdmin(z)+.4],dark,.055,'Rear lane drain shoe');
 }
 placement=null;
 for(const z of [-31.5,-37,-42.5,-47])sash(146.27,3.3,z,1.25,2.7,-Math.PI/2);
 // Blue-marked bay beside the water tower: retain both flanking sashes.
 door(146.24,1.9,-44.75,1.65,3.7,-Math.PI/2,blue,'Tower-side stores entrance');
 for(const y of [1.0,2.65])detail(dark,146.08,y,-44.75,.99,1.15,.04,-Math.PI/2);
 detail(stone,146.02,1.85,-44.19,.08,.25,.08,-Math.PI/2);
 box(stone,146.14,.07,-44.75,.40,.14,2.03,'Tower-side stores threshold');
 for(const x of [156,160])sash(x,3.3,TOWER_SERVICE_FRONT+.03,1.3,2.7);
 // The chimney identifies the green img2 building. The tower-connected stores
 // retain their hipped end; only the chimney hall carries the circular light.
 placement='purple';
 const chimneyHall=sourceRanges.find(r=>r.name==='Chimney service hall');
 // Anticlockwise quarter-turn: the former south gable now faces east.
 // The roof covers the whole yellow section, up to the adjoining west stores.
 const roundWindow={x:chimneyHall.roofRect[2]+.24,y:10.4,z:(chimneyHall.roofRect[1]+chimneyHall.roofRect[3])/2,radius:.85};
 const {x:wx,y:wy,z:wz,radius:wr}=roundWindow;
 mesh(new THREE.CircleGeometry(wr,48),glass,wx,wy,wz,'Chimney hall circular window').rotation.y=Math.PI/2;
 mesh(new THREE.TorusGeometry(wr+.12,.13,10,48),red,wx-.02,wy,wz,'Chimney hall circular brick surround').rotation.y=Math.PI/2;
 mesh(new THREE.TorusGeometry(wr,.05,8,48),frame,wx+.035,wy,wz,'Chimney hall circular window frame').rotation.y=Math.PI/2;
 for(let i=0;i<3;i++){
  const angle=i*Math.PI*2/3,point=(r,a)=>new THREE.Vector3(wx+.055,wy+r*Math.sin(a),wz-r*Math.cos(a));
  const curve=new THREE.QuadraticBezierCurve3(point(0,angle),point(.55,angle+.65),point(wr,angle));
  mesh(new THREE.TubeGeometry(curve,16,.032,6,false),frame,0,0,0,'Chimney hall curved window mullion');
 }
 group.userData.roundWindow=roundWindow;
 const dormers=[],dormerSupports=group.children.filter(o=>o.isMesh&&o.name.endsWith('slate roof'));
 group.updateMatrixWorld(true);
 function dormer(name,x,z,bottom,top,axis){
  // Clip the cheeks to the host slope so blue walls emerge from the slate.
  const corners=[[x-1.8,z-1.75],[x+1.8,z-1.75],[x+1.8,z+1.75],[x-1.8,z+1.75]];
  const bases=corners.map(([px,pz])=>{const ray=new THREE.Raycaster(new THREE.Vector3(px,40,pz),new THREE.Vector3(0,-1,0));return Math.min(top-.05,ray.intersectObjects(dormerSupports,false)[0]?.point.y-.06||bottom);});
  const sides=[];
  for(let i=0;i<4;i++){const j=(i+1)%4,a=[...corners[i]],b=[...corners[j]];
   sides.push([a[0],bases[i],a[1]],[a[0],top+.14,a[1]],[b[0],top+.14,b[1]],
    [a[0],bases[i],a[1]],[b[0],top+.14,b[1]],[b[0],bases[j],b[1]]);
  }
  const part=poly(sides,blue,name+' walls');part.userData.roofDormer=name;dormers.push({name,x,z,axis,placement});
  pitched({name,rect:[x-1.9,z-1.85,x+1.9,z+1.85],height:top,rise:1.1,axis,roof:'gable',gableMaterial:blue});
  // Matching vents face down both host slopes, perpendicular to the ridge.
  for(const side of [1,-1]){
   if(axis==='z')sash(x+side*1.83,top-.6,z,2.6,1.0,side*Math.PI/2,name+' glazing');
   else sash(x,top-.6,z+side*1.78,2.6,1.0,side===1?0:Math.PI,name+' glazing');
  }
 }
 // Marked ridge correction: both protrusions straddle the east/west crest.
 // Keep their glazing above the higher host roof at this new position.
 placement=null;
 for(const [i,x] of [164.5,173.3].entries())dormer('East range blue dormer '+(i+1),x,eastRidge.z,eastRidge.height,eastRidge.height+1.4,'x');
 // Red correction / img3: one protrusion centred on the central hall roof.
 placement='purple';
 const centralHall=sourceRanges.find(r=>r.name==='Dormered central service hall');
 dormer('Central hall blue dormer',(centralHall.rect[0]+centralHall.rect[2])/2,(centralHall.rect[1]+centralHall.rect[3])/2,10.3,13.3,'z');
 // The existing blue roof protrusion moves with the yellow building and
 // is duplicated with it. Both remain aligned with their north/south ridges.
 placement='workshops';
 for(const [i,spec] of workshops.entries()){
  captureWorkshop=spec.name===TOWER_WORKSHOP_COPY.source;
  dormer('Rear building blue dormer '+(i+1),(spec.rect[0]+spec.rect[2])/2,workshopDormerZ,9.94,11.4,'z');
 }
 captureWorkshop=false;
 // Clone the actual shell, roof, dormer and facade details together. Keeping
 // BoxGeometry on the copied walls also supplies walking/OS-marker clearance.
 const copy=sourceWorkshopCopy,source=workshops.find(r=>r.name===copy.source);
 const sx=(source.rect[0]+source.rect[2])/2,sz=(source.rect[1]+source.rect[3])/2;
 const cx=(copy.rect[0]+copy.rect[2])/2,cz=(copy.rect[1]+copy.rect[3])/2,s=copy.footprintScale,ds=copy.depthScale;
 const copied=new THREE.Group();copied.name=copy.name;copied.scale.set(s,1,ds);
 copied.position.set(cx-s*sx,0,cz-ds*sz);group.add(copied);
 movingMeshes.push({object:copied,placement});
 const copyName=name=>name.replace(copy.source,copy.name).replace(copy.sourceDormer,copy.dormer);
 for(const original of copyMeshes){const part=original.clone();part.name=copyName(part.name);if(part.userData.roofDormer)part.userData.roofDormer=copy.dormer;copied.add(part);}
 for(const {material,item:b} of copyDetails){
  // Copied facade details use axis-aligned quarter turns; their width runs
  // along Z on the dormer sides, and along X on the workshop gable front.
  const turned=Math.abs(Math.sin(b.r))>.5;
  detail(material,cx+(b.x-sx)*s,b.y,cz+(b.z-sz)*ds,b.w*(turned?ds:s),b.h,b.d*(turned?s:ds),b.r);
 }
 for(const o of [...openings])if(o.label.startsWith(copy.source)||o.label.startsWith(copy.sourceDormer))openings.push({...o,x:cx+(o.x-sx)*s,z:cz+(o.z-sz)*ds,label:copyName(o.label)});
 dormers.push({name:copy.dormer,x:cx,z:workshopDormerZ,axis:'z',footprintScale:s,depthScale:ds,placement});
 group.userData.workshopCopy=TOWER_WORKSHOP_COPY;
 group.userData.dormers=dormers;
 placement='purple';
 // Flush rooflight sits on the near-facing slope of the southern cross range.
 const light=box(frame,storesFrontX(202),8.85,towardsAdmin(-20.0),1.7,.10,1.7,'Stores rooflight frame');light.rotation.x=Math.atan2(3.9,5.95);
 const pane=box(glass,storesFrontX(202),8.92,towardsAdmin(-19.96),1.4,.055,1.4,'Stores rooflight glass');pane.rotation.x=light.rotation.x;
 // Ramp shared by img2 and img3: higher entrance at the west, low east landing.
 const x0=185.9,x1=219.4,z0=towardsAdmin(-15.9),z1=towardsAdmin(-12.8),high=1.30,low=.28;
 poly([[x0,high,z0],[x0,high,z1],[x1,low,z1],[x0,high,z0],[x1,low,z1],[x1,low,z0]],stone,'Sloping service ramp');
 poly([[x0,.18,z1],[x1,.18,z1],[x1,low,z1],[x0,.18,z1],[x1,low,z1],[x0,high,z1]],brick,'Ramp brick retaining wall');
 box(stone,189.5,high-.1,towardsAdmin(-17.6),4,.2,4,'Raised entrance landing');
 for(const z of [z1]){
  for(let i=0;i<=6;i++){const t=i/6,x=x0+(x1-x0)*t,y=high+(low-high)*t;line([x,y,z],[x,y+1.05,z],blue,.055,'Ramp handrail post');}
  for(const h of [.52,1.05])line([x0,high+h,z],[x1,low+h,z],blue,.05,'Ramp handrail');
 }
 for(const [x,z,h] of [[220.99,towardsAdmin(-17),6.3],[220.99,towardsAdmin(-56.8),6.3],[202.15,towardsAdmin(-16.45),6.3]])line([x,.3,z],[x,h,z],dark,.07,'Service downpipe');
 placement=null;
 line([153.25,.3,-36.2],[153.25,6.3,-36.2],dark,.07,'Service downpipe');
 placement='purple';
 addPharmacyCourt(THREE,{group,brick,stone,blue,dark,mat,box,detail,line,sash,door});
 // Apply each move only after the source roofs have supplied dormer heights.
 // Shared trim batches retain per-detail ownership so no fixed range moves.
 const movePoint=(point,key)=>{const move=SERVICE_COURT_MOVES[key];if(move){point.x+=move.x;point.z+=move.z;}return point;};
 for(const {object,placement:key} of movingMeshes)movePoint(object.position,key);
 for(const point of [...openings,...dormers]){movePoint(point,point.placement);delete point.placement;}
 movePoint(roundWindow,'purple');
 for(const window of group.userData.pharmacy.windows)movePoint(window,'purple');
 for(const stair of group.userData.pharmacy.stairs){movePoint(stair,'purple');stair.rect=moveServiceRect(stair.rect,SERVICE_COURT_MOVES.purple);}
 for(const items of batches.values())for(const item of items)movePoint(item,item.placement);
 const dummy=new THREE.Object3D();
 for(const [m,items] of batches){const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,items.length);batch.name='Service glazing and trim';batch.castShadow=true;batch.receiveShadow=true;items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.r,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});group.add(batch);}
 group.userData.openings=openings;
 group.userData.towerAbutment={x:ESCAPE_WATER_TOWER.x+ESCAPE_WATER_TOWER.width/2,deck:TOWER_ROOF_CONTACTS.deck,corner:TOWER_ROOF_CONTACTS.corner,ridge:junction.peak};
 return group;
}
