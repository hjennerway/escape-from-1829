import {ESCAPE_WATER_TOWER} from './water-tower.mjs';
import {ESTATE_CHIMNEY} from './estate-chimney.mjs';

import {TOWER_ROOF_CONTACTS} from './tower-roof-profiles.mjs';
export {TOWER_ROOF_CONTACTS} from './tower-roof-profiles.mjs';

// tower_buildings/img1–4 and their camera marks. The OS trace anchors the
// outer ranges; roof heights and obscured internal divisions are estimates.
// The block circled blue in img4 is deliberately outside this reconstruction.
export const TOWER_BUILDING_VIEWS=Object.freeze({
 'tower-buildings':{position:[279,108,81],target:[179,8,-36],fov:52},
 'tower-buildings-roofs':{position:[105,89,2],target:[166,7,-46],fov:52},
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
const shiftedRanges=new Set(['Chimney service hall','Ramp entrance link','South cross-gabled stores','Long east service range','North east stepped link']);
const towardsAdmin=z=>z+TOWER_ADMIN_SHIFT;
export const TOWER_RANGES=Object.freeze([
 {name:'Tower east traced abutment',rect:[153.1,-60.3,158.2,-50.1],height:8.84,roof:'traced'},
 {name:'Tower east dormered range',rect:[158.2,-60.3,180,-40.5],height:8.84,rise:3.9,axis:'x',roof:'traced',hipInset:5},
 {name:'North tower range',rect:[146.3,-74.1,162.3,-60.3],height:8.84,rise:4.076470588235294,axis:'z',roof:'corridor',attach:'south'},
 {name:'Dormered central service hall',rect:[180,-60.3,202,-32],height:7.3,rise:4.6,axis:'z',roof:'gable'},
 // Small distant roof just right of the purple gable in img2, separated by a short passage.
 {name:'Rear hipped service building',rect:[204.5,-75.5,218.5,-61.5],height:6.4,rise:3.4,axis:'z',roof:'hip',hipInset:4},
 {name:'Western tower flat link',rect:[153.1,-40.5,159.3,-36.3],height:6.4,roof:'flat'},
 // Yellow correction: the long axis turns north/south, with a flat front
 // section and a hipped ridge terminating against the tower's south wall.
 {name:'Low west stores',rect:[146.3,-50.1,162.3,-36.3],height:8.84,rise:4.076470588235294,axis:'z',roof:'corridor',attach:'north'},
 {name:'West stores flat front',rect:[146.3,-36.3,162.3,TOWER_SERVICE_FRONT],height:8.84,roof:'flat'},
 // The old buried wall overlap under the west stores is not part of the moved outline.
 {name:'Chimney service hall',rect:[162.3,-40.5,185.83,TOWER_SERVICE_FRONT],roofRect:[162.3,-40.5,185.83,TOWER_SERVICE_FRONT],height:6.4,rise:7.2,axis:'x',roof:'hip-gable',gableEnd:'east',hipInset:4},
 {name:'Ramp entrance link',rect:[185.83,-32,196,TOWER_SERVICE_FRONT],height:6.4,roof:'flat'},
 {name:'South cross-gabled stores',rect:[196,-28.1,220.86,TOWER_SERVICE_FRONT],height:6.4,rise:3.9,axis:'x',roof:'gable'},
 {name:'Long east service range',rect:[208.8,-57.2,220.86,-28.1],height:6.4,rise:3.5,axis:'z',roof:'hip'},
 {name:'North east stepped link',rect:[202,-57.2,211.4,-49],height:5.5,rise:2.1,axis:'x',roof:'gable'}
].map(range=>{
 if(!shiftedRanges.has(range.name))return range;
 const translate=([x0,z0,x1,z1])=>[x0,towardsAdmin(z0),x1,towardsAdmin(z1)];
 return {...range,rect:translate(range.rect),...(range.roofRect?{roofRect:translate(range.roofRect)}:{})};
}));

export function createTowerBuildings(THREE,exterior){
 const group=new THREE.Group();group.name='Tower service buildings';
 group.userData.reference='Research/tower-buildings/README.md';
 group.userData.ranges=TOWER_RANGES;group.userData.layout='historic';
 group.userData.adminShift={distance:TOWER_ADMIN_SHIFT,axis:'z',ranges:[...shiftedRanges]};
 group.userData.replacedOSEdges={sourceBuilding:0,sourceLoop:0,indices:[82,83,84]};
 const brick=exterior.mainAdmin.getObjectByName('Central administration range walls').material.clone();
 brick.color.multiplyScalar(1.13);
 const roof=exterior.mainAdmin.getObjectByName('Central administration range slate roof').material.clone();
 roof.color.multiplyScalar(1.15);
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.88});
 const stone=mat(0xb9b5a5),frame=mat(0xd5dcd5),glass=mat(0x526b70),dark=mat(0x343d3b),red=mat(0x995f49),blue=mat(0x739eae),flat=mat(0x4e5450);
 const batches=new Map(),openings=[];
 function uv(g){const p=g.attributes.position,n=g.attributes.normal,a=[];for(let i=0;i<p.count;i++){const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));a.push((x>z?p.getZ(i):p.getX(i))/1.7,(y>.5?p.getZ(i):p.getY(i))/1.7);}g.setAttribute('uv',new THREE.Float32BufferAttribute(a,2));return g;}
 function mesh(g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 function box(m,x,y,z,w,h,d,name=''){return mesh(uv(new THREE.BoxGeometry(w,h,d)),m,x,y,z,name);}
 function detail(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});}
 function poly(points,m,name){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.computeVertexNormals();return mesh(uv(g),m,0,0,0,name);}
 function line(a,b,m,r=.065,name=''){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),8),m,...a.map((n,i)=>(n+b[i])/2),name);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 // Recess only the stationary hall's low masonry beside the wider chimney
 // foundation. Its walls and roof above this small recess stay in position.
 function foundationClearedBox(material,rect,y0,y1,name){
  const [x0,z0,x1,z1]=rect,cutX=ESTATE_CHIMNEY.x+3,cutZ0=ESTATE_CHIMNEY.z-1.75,cutZ1=ESTATE_CHIMNEY.z+1.75,cutY=.85,points=[];
  function part(a,b,c,d,lo,hi){
   if(c<=a||d<=b||hi<=lo)return;
   const g=new THREE.BoxGeometry(c-a,hi-lo,d-b).toNonIndexed();g.translate((a+c)/2,(lo+hi)/2,(b+d)/2);
   const positions=g.attributes.position;for(let i=0;i<positions.count;i++)points.push([positions.getX(i),positions.getY(i),positions.getZ(i)]);g.dispose();
  }
  part(x0,z0,x1,z1,Math.max(y0,cutY),y1);
  const top=Math.min(y1,cutY);
  part(cutX,z0,x1,z1,y0,top);part(x0,z0,cutX,cutZ0,y0,top);part(x0,cutZ1,cutX,z1,y0,top);
  const result=poly(points,material,name);
  result.userData.collisionFootprint=[[x0,z0],[x1,z0],[x1,z1],[x0,z1],[x0,cutZ1],[cutX,cutZ1],[cutX,cutZ0],[x0,cutZ0]];
  return result;
 }
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
 for(const spec of TOWER_RANGES){
  const {rect:[x0,z0,x1,z1],height:h,name}=spec,cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
  if(name==='North tower range'){
   // Retain the stepped tower corridor after removing the yellow-marked hall.
   box(brick,151.6,h/2,-69.5,10.6,h,9.2,name+' west walls');
   box(brick,154.3,h/2,-62.6,16,h,4.6,name+' tower walls');
  }else if(name==='Dormered central service hall'){
   foundationClearedBox(brick,[x0,z0,x1,z1],0,h,name+' walls');
   foundationClearedBox(red,[x0-.04,z0-.04,x1+.04,z1+.04],0,.6,name+' plinth');
  }else{
   box(brick,cx,h/2,cz,w,h,d,name+' walls');
   box(red,cx,.3,cz,w+.08,.6,d+.08,name+' plinth');
  }
  if(spec.roof==='flat'){
   box(flat,cx,h+.08,cz,w,.16,d,name+' flat roof');
   for(const z of [z0,z1]){box(brick,cx,h+.26,z,w,.45,.25);box(stone,cx,h+.5,z,w+.15,.12,.38);}
   for(const x of [x0,x1]){box(brick,x,h+.26,cz,.25,.45,d);box(stone,x,h+.5,cz,.38,.12,d+.15);}
  }else if(!['corridor','traced'].includes(spec.roof))pitched({...spec,rect:spec.roofRect??spec.rect});
  for(const z of [z0,z1]){const endX=name==='North tower range'&&z===z0?156.9:x1;detail(dark,(x0+endX)/2,h+.05,z,endX-x0+.3,.13,.14);}
 }
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
  box(stone,x0+.06,deck+.015,(z0+z1)/2+(attach==='north'?.125:-.125),.18,.12,z1-z0-.25,name+' outer flat coping');
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
  openings.push({x,y,z,r,label});p(dark,0,0,.035,w+.18,h+.15,.10);p(glass,0,0,.10,w,h,.05);
  for(const s of [-1,1]){p(frame,s*w/2,0,.15,.07,h,.08);p(frame,0,s*h/2,.15,w+.06,.07,.08);}
  for(const u of [-w/6,w/6])p(frame,u,0,.17,.025,h,.035);
  for(const v of [-h/6,h/6])p(frame,0,v,.17,w,.03,.035);
  p(frame,0,0,.18,w,.065,.05);p(stone,0,-h/2-.12,.12,w+.34,.17,.35);p(red,0,h/2+.16,.09,w+.28,.24,.18);
 }
 function door(x,y,z,w,h,r=0,m=blue,label='Service door'){
  const nx=Math.sin(r),nz=Math.cos(r);detail(dark,x,y,z,w+.2,h+.2,.12,r);detail(m,x+nx*.09,y,z+nz*.09,w,h,.1,r);
  for(const side of [-1,1])detail(stone,x+Math.cos(r)*side*(w/2+.09),y,z-Math.sin(r)*side*(w/2+.09),.15,h+.22,.19,r);
  detail(stone,x,y+h/2+.15,z,w+.38,.2,.22,r);openings.push({x,y,z,r,label});
 }
 // Main south face: four taller lights, recessed entry and lower ramp-side lights.
 for(const x of [163,168,173,178])sash(x,3.35,towardsAdmin(TOWER_SERVICE_FRONT+.03),1.45,2.9);
 door(190,3.45,towardsAdmin(-16.57),2.4,4.3,0,dark,'Ramp entrance');
 for(const x of [199,207])sash(x,2.45,towardsAdmin(-16.57),2.0,1.8);
 door(216,1.65,towardsAdmin(-16.56),1.65,3.0,0,dark);
 // img3: blue double doors and a high gable light at the east end, with a
 // repeated high sash rhythm continuing north along the long range.
 door(220.89,2.05,towardsAdmin(-21.9),3.4,3.8,Math.PI/2,blue,'Blue stores double doors');
 sash(220.9,8.0,towardsAdmin(-22.35),1.3,2.1,Math.PI/2,'High stores gable sash');
 for(const z of [-30.4,-34.9,-39.4,-43.9,-48.4,-52.8])sash(220.89,4.2,towardsAdmin(z),1.3,2.4,Math.PI/2);
 for(const z of [-20.8,-26,-31.5,-37,-42.5,-47])sash(146.27,3.3,z,1.25,2.7,-Math.PI/2);
 for(const x of [149,154,159])sash(x,3.3,TOWER_SERVICE_FRONT+.03,1.3,2.7);
 // The chimney identifies the green img2 building. The tower-connected stores
 // retain their hipped end; only the chimney hall carries the circular light.
 const chimneyHall=TOWER_RANGES.find(r=>r.name==='Chimney service hall');
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
  const part=poly(sides,blue,name+' walls');part.userData.roofDormer=name;dormers.push({name,x,z,axis});
  pitched({name,rect:[x-1.9,z-1.85,x+1.9,z+1.85],height:top,rise:1.1,axis,roof:'gable',gableMaterial:blue});
  // Glazing faces down the host slope, perpendicular to the roof ridge.
  if(axis==='z')sash(x+1.83,top-.6,z,2.6,1.0,Math.PI/2,name+' glazing');
  else sash(x,top-.6,z+1.78,2.6,1.0,0,name+' glazing');
 }
 // Marked ridge correction: both protrusions straddle the east/west crest.
 // Keep their glazing above the higher host roof at this new position.
 for(const [i,x] of [164.5,173.3].entries())dormer('East range blue dormer '+(i+1),x,eastRidge.z,eastRidge.height,eastRidge.height+1.4,'x');
 // Red correction / img3: one protrusion centred on the central hall roof.
 const centralHall=TOWER_RANGES.find(r=>r.name==='Dormered central service hall');
 dormer('Central hall blue dormer',(centralHall.rect[0]+centralHall.rect[2])/2,(centralHall.rect[1]+centralHall.rect[3])/2,10.3,13.3,'z');
 // Img2 also shows a smaller, separate hipped building further back.
 dormer('Rear building blue dormer',211.5,-68.5,9.94,11.4,'z');
 group.userData.dormers=dormers;
 // Flush rooflight sits on the near-facing slope of the southern cross range.
 const light=box(frame,202,8.85,towardsAdmin(-20.0),1.7,.10,1.7,'Stores rooflight frame');light.rotation.x=Math.atan2(3.9,5.95);
 const pane=box(glass,202,8.92,towardsAdmin(-19.96),1.4,.055,1.4,'Stores rooflight glass');pane.rotation.x=light.rotation.x;
 // Ramp shared by img2 and img3: higher entrance at the west, low east landing.
 const x0=185.9,x1=219.4,z0=towardsAdmin(-15.9),z1=towardsAdmin(-12.8),high=1.30,low=.28;
 poly([[x0,high,z0],[x0,high,z1],[x1,low,z1],[x0,high,z0],[x1,low,z1],[x1,low,z0]],stone,'Sloping service ramp');
 poly([[x0,.18,z1],[x1,.18,z1],[x1,low,z1],[x0,.18,z1],[x1,low,z1],[x0,high,z1]],brick,'Ramp brick retaining wall');
 box(stone,189.5,high-.1,towardsAdmin(-17.6),4,.2,4,'Raised entrance landing');
 for(const z of [z1]){
  for(let i=0;i<=6;i++){const t=i/6,x=x0+(x1-x0)*t,y=high+(low-high)*t;line([x,y,z],[x,y+1.05,z],blue,.055,'Ramp handrail post');}
  for(const h of [.52,1.05])line([x0,high+h,z],[x1,low+h,z],blue,.05,'Ramp handrail');
 }
 for(const [x,z,h] of [[220.99,towardsAdmin(-17),6.3],[220.99,towardsAdmin(-56.8),6.3],[196.15,towardsAdmin(-16.45),6.3],[153.25,-36.2,6.3]])line([x,.3,z],[x,h,z],dark,.07,'Service downpipe');
 const dummy=new THREE.Object3D();
 for(const [m,items] of batches){const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,items.length);batch.name='Service glazing and trim';batch.castShadow=true;batch.receiveShadow=true;items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.r,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});group.add(batch);}
 group.userData.openings=openings;
 group.userData.towerAbutment={x:ESCAPE_WATER_TOWER.x+ESCAPE_WATER_TOWER.width/2,deck:TOWER_ROOF_CONTACTS.deck,corner:TOWER_ROOF_CONTACTS.corner,ridge:junction.peak};
 return group;
}
