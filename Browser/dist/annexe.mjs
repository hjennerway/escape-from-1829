import {addOakmereCourt} from './annexe-oakmere-court.mjs';
import {addLarktonRecess,LARKTON_SHIFT} from './annexe-larkton-recess.mjs';
import {alignAnnexeRearSide,ANNEXE_REAR_WEST_SHIFT,ANNEXE_REAR_HEAD_SHIFT} from './annexe-rear-side-alignment.mjs';
import {shortenAnnexeTowers} from './annexe-tower-height.mjs';
import {addAnnexeEastVeranda} from './annexe-east-veranda.mjs';
import {addCardenElevation} from './annexe-carden-detail.mjs';
import {ANNEXE_REAR_SHIFT,stretchAnnexeRearZ} from './annexe-rear-stretch.mjs';
import {ANNEXE_EAST_FRONT_SHIFT,annexeFrontSection,restoreAnnexeFrontLink} from './annexe-front-links.mjs';
import {addOakmereElevation} from './annexe-oakmere-detail.mjs';
import {addOakmereWestElevation} from './annexe-oakmere-west.mjs';
import {addAnnexeRearKitchen} from './annexe-rear-kitchen.mjs';
import {addOuterFronts,addCourtFronts} from './annexe-outer-front.mjs';
import {refineAnnexeRanges,ANNEXE_OS_REFINEMENT} from './annexe-os-refinement.mjs';
import {ANNEXE_PHOTO_PLACEMENT} from './annexe-photo-placement.mjs';
import {ANNEXE_PLACEMENT_REFERENCE,annexePlacementMapPoint,placeAnnexeFront} from './annexe-placement.mjs';
import {ANNEXE_GROUNDS,annexeGroundPoint} from './annexe-ground-placement.mjs';
// Original 417 x 433 outline registration supplies the existing dimensions.
// The church/Churton/Grafton map retains the accepted frontage orientation.
// Keep local dimensions independent of the later aerial-led site scale/position.
export const ANNEXE_OS_REGISTRATION=Object.freeze({
 reception:{pixel:[285,308],world:[0,13]},chapel:{pixel:[215,351],world:[-6,-120]},
 redesmere:{pixel:[242,265],world:[94.5,-14]}
});
const a=-5299/6749,b=-9568/6749;
export const ANNEXE_MAP_SCALE=Math.hypot(a,b);
export function annexeMapPoint(u,v){return [a*(u-285)+b*(v-308),13-b*(u-285)+a*(v-308)];}
const basePlacement=placeAnnexeFront(17*ANNEXE_MAP_SCALE);
const placementSite=ANNEXE_PHOTO_PLACEMENT.site,relativeScale=ANNEXE_PHOTO_PLACEMENT.relativeScale;
export const ANNEXE_SITE=Object.freeze({...basePlacement,x:placementSite.x,z:placementSite.z,scale:placementSite.planScale});
const [frontX,frontMapZ]=ANNEXE_PHOTO_PLACEMENT.frontAnchorMap,frontZ=frontMapZ*ANNEXE_MAP_SCALE;
const c=Math.cos(basePlacement.rotation),s=Math.sin(basePlacement.rotation),scale=placementSite.planScale*relativeScale;
// Retain the accepted forecourt placement. The later east-link restoration
// moves only the selected wings; it does not recalculate this root offset.
const frontageOffset=-ANNEXE_PHOTO_PLACEMENT.forecourtCentreMapX*ANNEXE_MAP_SCALE*scale;
export const ANNEXE=Object.freeze({...basePlacement,
 x:placementSite.x+(placementSite.planScale-scale)*(c*frontX+s*frontZ)+c*frontageOffset,
 z:placementSite.z+(placementSite.planScale-scale)*(-s*frontX+c*frontZ)-s*frontageOffset,
 scale,verticalScale:relativeScale,frontAnchor:Object.freeze([frontX,frontZ])
});
export function annexePoint(x,y,z){const c=Math.cos(ANNEXE.rotation),s=Math.sin(ANNEXE.rotation),k=ANNEXE.scale;return [ANNEXE.x+k*(c*x+s*z),y,ANNEXE.z+k*(-s*x+c*z)];}
export function annexeLocal([x,z]){const c=Math.cos(ANNEXE.rotation),s=Math.sin(ANNEXE.rotation),dx=x-ANNEXE.x,dz=z-ANNEXE.z;return [(c*dx-s*dz)/ANNEXE.scale,(s*dx+c*dz)/ANNEXE.scale];}
export function annexeSitePoint(x,y,z){const c=Math.cos(ANNEXE_SITE.rotation),s=Math.sin(ANNEXE_SITE.rotation),k=ANNEXE_SITE.scale;return [ANNEXE_SITE.x+k*(c*x+s*z),y,ANNEXE_SITE.z+k*(-s*x+c*z)];}
export function annexeSiteLocal([x,z]){const c=Math.cos(ANNEXE_SITE.rotation),s=Math.sin(ANNEXE_SITE.rotation),dx=x-ANNEXE_SITE.x,dz=z-ANNEXE_SITE.z;return [(c*dx-s*dz)/ANNEXE_SITE.scale,(s*dx+c*dz)/ANNEXE_SITE.scale];}
const shot=(p,t,fov=55)=>Object.freeze({position:annexePoint(p[0],p[1]>30?p[1]*ANNEXE.scale:p[1],p[2]),target:annexePoint(...t),fov});
const rearShot=(p,t,fov)=>shot([p[0],p[1],stretchAnnexeRearZ(p[2]/ANNEXE_MAP_SCALE)*ANNEXE_MAP_SCALE],[t[0],t[1],stretchAnnexeRearZ(t[2]/ANNEXE_MAP_SCALE)*ANNEXE_MAP_SCALE],fov);
const rearWardShot=(p,t,fov)=>shot([p[0],p[1],p[2]+ANNEXE_REAR_SHIFT*ANNEXE_MAP_SCALE],[t[0],t[1],t[2]+ANNEXE_REAR_SHIFT*ANNEXE_MAP_SCALE],fov);
const sideShot=(fn,shift,p,t,fov)=>fn([p[0]+shift[0]*ANNEXE_MAP_SCALE,p[1],p[2]+shift[1]*ANNEXE_MAP_SCALE],[t[0]+shift[0]*ANNEXE_MAP_SCALE,t[1],t[2]+shift[1]*ANNEXE_MAP_SCALE],fov);
const larktonShot=(p,t,fov)=>sideShot(shot,[LARKTON_SHIFT,0],p,t,fov);
const rearHeadShot=(p,t,fov)=>sideShot(rearWardShot,ANNEXE_REAR_HEAD_SHIFT,p,t,fov);
const rearWestShot=(p,t,fov)=>sideShot(rearShot,[ANNEXE_REAR_WEST_SHIFT,0],p,t,fov);
const eastFrontShot=(p,t,fov)=>shot([p[0]+ANNEXE_EAST_FRONT_SHIFT*ANNEXE_MAP_SCALE,p[1],p[2]],[t[0]+ANNEXE_EAST_FRONT_SHIFT*ANNEXE_MAP_SCALE,t[1],t[2]],fov);
// The supplied coloured circles identify wards, not new building outlines.
// The west outer frontage and its court link belong to Larkton/Jodrell.
// The entrance, east connecting range and unmarked east end stay shared.
export const ANNEXE_WARDS=Object.freeze([
 {id:'larkton-jodrell',name:'Larkton/Jodrell',referenceColor:'yellow',
  rangeNames:['West end ward','West rear pavilion','West end projecting rooms','West end middle rooms','West front connecting ward','West court outer link'],
  aerial:larktonShot([-245,125,77],[-156,5,-35]),walk:larktonShot([-196,1.8,-35],[-166,6,-35],65)},
 {id:'tarvin-jarman',name:'Tarvin/Jarman',referenceColor:'blue',
  rangeNames:['West court inner return','West court front range','West court outer return','West court corner infill','West court back range'],
  aerial:shot([-116,113,145],[-76,4,19]),walk:shot([-76,1.8,65],[-76,7,40],65)},
 {id:'leighton-newton',name:'Leighton/Newton',referenceColor:'red',
  rangeNames:['Rear east connecting range','Rear east end pavilion'],
  aerial:rearWardShot([102,118,-202],[47,5,-94]),walk:rearWardShot([103,1.8,-120],[67,6,-105],65)},
 {id:'oakmere',name:'Oakmere',referenceColor:'purple',
  rangeNames:['Rear west angled service range','Rear service head'],
  aerial:rearHeadShot([-112,114,-218],[-52,5,-105]),walk:rearHeadShot([-87,1.8,-109],[-52,6,-103],65)},
 {id:'picton-carden',name:'Picton/Carden',referenceColor:'green',
  rangeNames:['East court inner return','East court front range','East court outer return','East court corner infill','East court back range'],
  aerial:eastFrontShot([119,116,153],[69,4,24]),walk:eastFrontShot([69,1.8,70],[69,7,45],65)}
].map(ward=>Object.freeze({...ward,rangeNames:Object.freeze(ward.rangeNames)})));
export const ANNEXE_WARD_VIEWS=Object.freeze(Object.fromEntries(ANNEXE_WARDS.map(ward=>[ward.id,ward.aerial])));
export const ANNEXE_WARD_WALKS=Object.freeze(Object.fromEntries(ANNEXE_WARDS.map(ward=>[ward.id,ward.walk])));
const mapNorth=annexePlacementMapPoint([0,0]),mapSouth=annexePlacementMapPoint([0,1]);
const southOffset=mapSouth.map((value,i)=>(value-mapNorth[i])*.01),site=annexePlacementMapPoint([155,192]);
export const ANNEXE_VIEWS=Object.freeze({
 ...ANNEXE_WARD_VIEWS,
 'oakmere-photo':rearWestShot([-101,2.2,-65],[-31,6,-51],49),
 'annexe-outer-west':larktonShot([-201,2,34],[-146,5.5,0],58),
 'annexe-outer-east':eastFrontShot([211,2,56],[145,5.5,20],58),
 'oakmere-lawn':rearWestShot([-138,66,-103],[-24,5,-46],51),
 annexe:shot([-215,185,290],[0,3,-30],56),
 'annexe-roads':{position:[350,420,85],target:[330,0,-45],fov:52},
 'annexe-access':shot([0,360,130],[0,0,-5],52),
 'annexe-entrance':shot([0,15,112],[0,1,60],65),
 'annexe-front':shot([0,1.8,120],[0,9,14],48),
 'annexe-front-right':shot([10,1.8,108],[3,9,14],48),
 'annexe-img1':shot([28,1.8,124],[4,9,14],52),
 'annexe-side':shot([-57,2.5,-12],[-18,10,-3],63),
 'annexe-side-right':shot([57,2.5,-12],[18,10,-3],63),
 'annexe-jarman-photo':shot([-78,1.8,111],[-76,4.9,49],60),
 'annexe-carden-photo':shot([67,1.8,-55],[0,9,-6],60),
 'annexe-ground':shot([0,1.8,89],[0,8,14],61),
 'annexe-kitchen':rearShot([-2,1.8,-62],[0,4,-40],74),
 // Fixed overview matched to the rear-wall alignment reference.
 // Do not stretch the camera with the geometry when comparing this view.
 'annexe-rear-court':shot([-1.631612,107.569876/ANNEXE.scale,-67.68697],[-2.071306,0,-51.17476],48),
 'annexe-plan':{position:[ANNEXE.x+southOffset[0],370,ANNEXE.z+southOffset[1]],target:[ANNEXE.x,0,ANNEXE.z],fov:52},
 'annexe-photo-site':{position:[620,360,435],target:[200,4,0],fov:48},
 'annexe-site':{position:[site[0]+southOffset[0],680,site[1]+southOffset[1]],target:[site[0],0,site[1]],fov:59}
});
// The rear east L turns approximately 22 degrees counter-clockwise on the OS
// plan. Both ranges rotate about their junction with the central spine.
export const ANNEXE_REAR_EAST=Object.freeze({angle:22*Math.PI/180,pivot:[9,-42+ANNEXE_REAR_SHIFT]});
// Black masonry, expressed as rectangles in the OS building's 15-degree axes.
// Front ward courts and rear courts remain open to the sky.
// Only the central pavilions retain three storeys; outer wards have two.
export const ANNEXE_RANGES=Object.freeze(refineAnnexeRanges([
 {name:'Central hall',rect:[-11,-6,11,10],h:7.4,rise:8.0,custom:true},
 {name:'Entrance range',rect:[-9,10,9,21],h:4.7,rise:2.5,custom:true},
 ...[-1,1].flatMap(side=>{
  const mirror=r=>side<0?[-r[2],r[1],-r[0],r[3]]:r,label=side<0?'West':'East';
  return [
   {name:label+' front pavilion',rect:mirror([11,4,20,17]),h:13.2,rise:3.3,custom:true},
   {name:label+' square tower',rect:mirror([12,-5,18,2]),h:20.8,rise:3.1,custom:true},
   {name:label+' front connecting ward',rect:mirror([20,5,70,11]),h:8.4,rise:2.6},
   {name:label+' court inner return',rect:mirror([27,11,32,25]),h:8.4,rise:2},
   {name:label+' court front range',rect:mirror([27,23,51,29]),h:8.4,rise:2.3},
   {name:label+' court outer return',rect:mirror([46,11,51,25]),h:8.4,rise:2},
   // A solid corner projects into each void, leaving an L-shaped court.
   {name:label+' court corner infill',rect:mirror([39,17,46,23]),h:8.4,rise:2}
  ];
 }),
 {name:'West end ward',rect:[-77,-11,-70,12],h:8.4,rise:2.6},
 {name:'West rear pavilion',rect:[-77,-19,-63,-12],h:8.4,rise:2.8},
 {name:'West rear link',rect:[-67,-16,-63,5],h:4.3,rise:1.3},
 {name:'West end projecting rooms',rect:[-82,-3,-75,8],h:8.4,rise:2.1},
 {name:'East end ward',rect:[70,-12,77,12],h:8.4,rise:2.6},
 // The red-to-blue plan correction places this pavilion on the inner side
 // of the rear link (x=66), retaining its dimensions and a joined corner.
 {name:'East rear pavilion',rect:[51,-22,67,-16],h:8.4,rise:2.8},
 {name:'East rear link',rect:[64,-17,68,5],h:4.3,rise:1.3},
 {name:'East end projecting rooms',rect:[76,-2,84,6],h:8.4,rise:2.1},
 {name:'Central rear spine',rect:[-5,-32,5,-5],h:4.7,rise:1.9},
 {name:'Rear west angled service range',rect:[-13,-48,-5,-29],h:8.4,rise:2.4,angle:.28},
 {name:'Rear service head',rect:[-18,-49,-5,-42],h:8.4,rise:2.5},
 // Shorten the yellow-marked L leg from 30 to 18 map units; its return
 // moves inward by the same 12 units before the whole L is rotated.
 {name:'Rear east connecting range',rect:[4,-31,22,-26],h:8.4,rise:2.2,section:'rear-east'},
 {name:'Rear east end pavilion',rect:[18,-42,25,-26],h:8.4,rise:2.8,section:'rear-east'}
]));
export function createAnnexe(THREE,{brick,roof,material,worldUV,hipRoof}){
 const model=new THREE.Group();model.name='The annexe';model.position.set(ANNEXE.x,0,ANNEXE.z);model.rotation.y=ANNEXE.rotation;model.scale.set(ANNEXE.scale,ANNEXE.verticalScale,ANNEXE.scale);
 const wards=Object.fromEntries(ANNEXE_WARDS.map(ward=>{
  const group=new THREE.Group();group.name=ward.name;
  group.userData.wardId=ward.id;group.userData.referenceColor=ward.referenceColor;
  model.add(group);return [ward.id,group];
 }));
 const rangeWards=new Map(ANNEXE_WARDS.flatMap(ward=>ward.rangeNames.map(name=>[name,ward.id])));
 const sections={westLink:new THREE.Group(),eastOuter:new THREE.Group(),rearWest:new THREE.Group(),rearConnector:new THREE.Group()};
 sections.rearWest.name='Rear court west assembly';sections.rearConnector.name='Rear service court link assembly';
 sections.westLink.name='West court entrance link';sections.eastOuter.name='East outer ward assembly';
 model.add(...Object.values(sections));
 const rearSection=name=>name==='Rear court west range'?'rearWest':name==='Rear service court link'?'rearConnector':null;
 let currentWard=null,currentSection=null;
 const parent=()=>wards[currentWard]??sections[currentSection]??model;
 const red=material(0x9d4935),blue=material(0x285575),frame=material(0xe0e3da),glass=material(0x536c75,{roughness:.48,metalness:.15});
 const dark=material(0x202927),stone=material(0x9e9683),lead=material(0x8c999b),road=material(0x96968a);
 const batches=new Map(),ranges=[],openings=[];
 function mesh(g,m,x,y,z,name){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;parent().add(o);return o;}
 function solid(m,x,y,z,w,h,d,name,r=0){const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x,y,z,name);o.rotation.y=r;o.userData.orientedCollision=true;return o;}
 function box(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r,owner:parent()});}
 function beam(p,q,width,m,name){const a=new THREE.Vector3(...p),b=new THREE.Vector3(...q),v=b.clone().sub(a);const o=mesh(new THREE.CylinderGeometry(width/2,width/2,v.length(),6),m,...a.add(b).multiplyScalar(.5).toArray(),name);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function hip(x,z,w,d,y,rise,name,r=0){const o=hipRoof(x,z,w,d,y,rise);parent().add(o);o.rotation.y=r;o.name=name+' slate roof';return o;}
 function position(b,u,n){const c=Math.cos(b.r),s=Math.sin(b.r);return [b.x+c*u+s*n,b.z-s*u+c*n];}
 const wingShift=b=>['oakmere','leighton-newton'].includes(b?.wardId)?ANNEXE_REAR_SHIFT*ANNEXE_MAP_SCALE:0;
 function occupied(x,y,z,self){return ranges.some(b=>{if(b===self||y>b.h)return false;const dx=x-b.x,dz=z+wingShift(self)-b.z-wingShift(b),c=Math.cos(b.r),s=Math.sin(b.r);return Math.abs(c*dx-s*dz)<b.w/2+.05&&Math.abs(s*dx+c*dz)<b.d/2+.05;});}
 function sash(name,x,y,z,w=1.35,h=2.75,r=0,arched=false){
  openings.push({name,x,y,z,w,h,rotation:r,arched,wardId:currentWard});
  const c=Math.cos(r),s=Math.sin(r),part=(m,u,v,n,pw,ph,pd)=>box(m,x+c*u+s*n,y+v,z-s*u+c*n,pw,ph,pd,r);
  const radius=w/2,shoulder=h/2-(arched?radius:0);
  if(arched){
   const shape=new THREE.Shape();shape.moveTo(-radius,-h/2);shape.lineTo(radius,-h/2);shape.lineTo(radius,shoulder);shape.absarc(0,shoulder,radius,0,Math.PI,false);shape.closePath();
   const o=mesh(new THREE.ShapeGeometry(shape),glass,x+s*.10,y,z+c*.10,name+' arched glazing');o.rotation.y=r;
   const points=[];for(let i=0;i<=24;i++){const t=Math.PI*i/24;points.push(new THREE.Vector3(x+c*radius*Math.cos(t)+s*.18,y+shoulder+radius*Math.sin(t),z-s*radius*Math.cos(t)+c*.18));}
   mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.045,5,false),frame,0,0,0,name+' arched frame');
  }else part(glass,0,0,.10,w,h,.07);
  for(const side of [-1,1])part(frame,side*w/2,(-h/2+shoulder)/2,.16,.075,shoulder+h/2,.09);
  part(frame,0,-h/2,.17,w+.1,.085,.1);
  if(!arched)part(frame,0,h/2,.17,w+.1,.085,.1);
  for(const u of [-w/6,w/6]){const top=arched?shoulder+Math.sqrt(radius*radius-u*u):h/2;part(frame,u,(top-h/2)/2,.18,.035,top+h/2,.06);}
  for(let v=-h/2+.46;v<shoulder+.01;v+=.46)part(frame,0,v,.18,w,.035,.07);
  part(frame,0,0,.18,w,.065,.07);part(stone,0,-h/2-.10,.13,w+.28,.14,.26);
  if(!arched)part(red,0,h/2+.13,.07,w+.32,.25,.17);
 }
 function gable(name,x,z,w,base,rise,depth=1.2){
  const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,rise);sh.closePath();
  mesh(worldUV(new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:false}),1.7),brick,x,base,z-depth,name+' brick gable');
  for(const side of [-1,1]){
   const slope=Math.atan2(rise,w/2),o=solid(roof,x+side*w/4,base+rise/2,z-depth/2,Math.hypot(w/2,rise)+.4,.16,depth+.4,name+' slate roof');o.rotation.z=-side*slope;
   for(const dy of [0,-.25])beam([x+side*(w/2+.1),base+dy,z+.17],[x,base+rise+dy,z+.17],.18,red,name+' terracotta verge');
  }
  box(red,x,base-.14,z+.05,w+.25,.25,.26);
 }
 for(const spec of ANNEXE_RANGES){
  currentWard=rangeWards.get(spec.name)??spec.wardId??null;
  currentSection=rearSection(spec.name)??annexeFrontSection(spec.name);
  const [x0,z0,x1,z1]=spec.rect.map(v=>v*ANNEXE_MAP_SCALE),b={...spec,wardId:currentWard,x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0,r:spec.angle??0};
  if(spec.section==='rear-east'){
   const {angle,pivot}=ANNEXE_REAR_EAST,px=pivot[0]*ANNEXE_MAP_SCALE,pz=(pivot[1]-ANNEXE_REAR_SHIFT)*ANNEXE_MAP_SCALE,dx=b.x-px,dz=b.z-pz;
   b.x=px+Math.cos(angle)*dx+Math.sin(angle)*dz;b.z=pz-Math.sin(angle)*dx+Math.cos(angle)*dz;b.r+=angle;
  }
  ranges.push(b);
  // Keep the neighbouring ward occupancy mask; build the recessed link below.
  if(b.name==='West court outer link')continue;
  solid(brick,b.x,b.h/2,b.z,b.w,b.h,b.d,b.name+' brick walls',b.r);
  box(red,b.x,.25,b.z,b.w+.13,.5,b.d+.13,b.r);
  for(const y of [4.35,8.65,12.6])if(y<b.h&&!b.kitchen)box(red,b.x,y,b.z,b.w+.16,.32,b.d+.16,b.r);
  box(red,b.x,b.h-.22,b.z,b.w+.18,.35,b.d+.18,b.r);
  hip(b.x,b.z,b.w,b.d,b.h,b.rise,b.name,b.r);
  for(const side of [-1,1]){
   const p=position(b,0,side*(b.d/2+.25));box(blue,p[0],b.h+.02,p[1],b.w+.7,.14,.16,b.r);
   const q=position(b,side*(b.w/2+.25),0);box(blue,q[0],b.h+.02,q[1],.16,.14,b.d+.7,b.r);
  }
 }
 const courtFrontRanges=ranges.filter(b=>b.name.endsWith('court front range'));
 for(const b of ranges){
  currentWard=b.wardId;
  currentSection=rearSection(b.name)??annexeFrontSection(b.name);
  if(b.kitchen||b.name==='West court outer link')continue;
  for(const face of ['long','end'])for(const side of [-1,1]){
   if(face==='end'&&((b.name==='Rear court back range'&&side>0)||(b.name==='Rear court back east range'&&side<0)))continue;
   if(b.name==='Central rear spine'&&side<0)continue; // Preserve the accepted blank rear and west generic faces.
   const span=face==='long'?b.w:b.d,count=Math.max(1,Math.floor((span-1.5)/3.8));
   for(let i=0;i<count;i++){
    const u=(i-(count-1)/2)*3.8,[x,z]=face==='long'?position(b,u,side*(b.d/2+.035)):position(b,side*(b.w/2+.035),u);
    const r=b.r+(face==='long'?(side<0?Math.PI:0):side*Math.PI/2);
    if(face==='long'&&side>0&&Math.abs(x)>=51*ANNEXE_MAP_SCALE&&/front connecting ward|end ward/.test(b.name))continue;
    if(face==='long'&&side>0&&courtFrontRanges.some(front=>Math.abs(z-front.z-front.d/2-.035)<.01&&Math.abs(x-front.x)<front.w/2))continue;
    for(const y of b.h>11?[2.15,6.5,10.7]:b.h>7?[2.15,6.5]:[2.15]){
     if(b.custom&&(face==='long'&&side>0||b.name.includes('tower')))continue;
     if([-.8,0,.8].some(u=>occupied(x+Math.cos(r)*u+Math.sin(r)*.3,y,z-Math.sin(r)*u+Math.cos(r)*.3,b)))continue;
     sash(b.name,x,y,z,1.35,y>10?2.5:2.8,r);
    }
   }
  }
  for(const side of [-1,1]){const [x,z]=position(b,side*(b.w/2-.4),b.d/2+.32);if(!occupied(x,b.h/2,z,b))box(blue,x,b.h/2,z,.105,b.h,.105);}
 }
 currentWard=null;currentSection=null;
 const hall=ranges[0],entrance=ranges[1],front=hall.z+hall.d/2+.04,entryZ=entrance.z+entrance.d/2+.05;
 const frontDormerStart=model.children.length,frontDormerBatches=new Map([...batches].map(([m,items])=>[m,items.length]));
 // Three round-headed, pedimented dormers above the low entrance roof.
 for(const x of [-11,0,11]){
  solid(brick,x,9.1,front+.35,5.1,4.0,2,'Hall dormer cheek');
  sash('Hall dormer',x,9.1,front+1.39,2.25,3.4,0,true);gable('Hall dormer',x,front+1.4,5.7,11.1,2,4);
 }
 const frontDormers={meshes:model.children.slice(frontDormerStart),batches:[...batches].map(([material,items])=>({material,items:items.slice(frontDormerBatches.get(material)??0)})).filter(b=>b.items.length),openings:openings.filter(o=>o.name==='Hall dormer')};
 for(const x of [-8,8])sash('Entrance range',x,2.5,entryZ,1.65,2.9);
 // Rusticated jambs and a real arch frame the recessed double door.
 const portalZ=entryZ+.9;
 for(const side of [-1,1])for(let i=0;i<9;i++)solid(i%3===0?stone:red,side*1.85,.25+i*.45,portalZ,.75,.43,1.55,'Portal rusticated jamb');
 const arch=new THREE.Shape();arch.absarc(0,3.45,2.25,0,Math.PI,false);arch.lineTo(-1.45,3.45);arch.absarc(0,3.45,1.45,Math.PI,0,true);arch.closePath();
 mesh(new THREE.ExtrudeGeometry(arch,{depth:1.55,bevelEnabled:false}),red,0,0,portalZ-.77,'Entrance terracotta arch');
 solid(dark,0,1.8,entryZ+.1,2.85,3.6,.15,'Entrance recessed double door');
 for(const x of [-.72,.72])for(const y of [.65,1.7,2.8])box(blue,x,y,entryZ+.2,1.12,.77,.06);
 gable('Entrance pediment',0,portalZ+.8,6.3,5.5,2.55,2.5);
 solid(red,0,5.35,portalZ,5.5,.5,1.6,'Entrance pediment base');
 for(let i=0;i<3;i++)solid(stone,0,.08+i*.08,portalZ+1.15-i*.3,5.3,.16+i*.16,1.2,'Entrance step');
 for(const side of [-1,1]){
  const label=side<0?'West':'East',p=ranges.find(b=>b.name===label+' front pavilion'),t=ranges.find(b=>b.name===label+' square tower'),z=p.z+p.d/2+.05;
  gable(label+' front pavilion',p.x,z+.15,p.w+.25,12.9,3.2,5.5);
  sash(label+' pavilion arched window',p.x,11.65,z+.2,1.8,3.1,0,true);
  sash(label+' pavilion sash',p.x,6.55,z,1.5,2.85);
  for(const dx of [-1.8,1.8])sash(label+' entrance side light',p.x+dx,2.35,z,1,3);
  solid(blue,p.x,1.65,z+.13,1.35,3.3,.16,label+' pavilion door');
  for(const dx of [-1.1,1.1])box(red,p.x+dx,2.15,z+.27,.45,4.3,.4);
  box(red,p.x,4.3,z+.3,3.1,.48,.5);
  for(const face of [-1,1]){
   sash(label+' tower high sash',t.x+face*2.1,18.4,t.z+t.d/2+.06,1.05,1.75);
   sash(label+' tower side sash',t.x+face*(t.w/2+.04),10.5,t.z,1.45,3.1,face*Math.PI/2);
  }
  for(const side of [-1,1]){
   sash(label+' tower upper side light',t.x+side*(t.w/2+.04),18.4,t.z,1.15,1.8,side*Math.PI/2);
   sash(label+' tower lower side sash',t.x+side*(t.w/2+.04),6.4,t.z,1.5,2.9,side*Math.PI/2);
  }
  for(let i=-3;i<=3;i++)for(const side of [-1,1])box(red,t.x+i*1.25,20.3,t.z+side*(t.d/2+.12),.24,.72,.28);
  beam([t.x-1.1,24.35,t.z],[t.x+1.1,24.35,t.z],.12,lead,'Tower ridge crest');
  for(const dx of [-1.05,0,1.05])beam([t.x+dx,23.9,t.z],[t.x+dx,24.7,t.z],.12,lead,'Tower crest finial');
 }
 // Open octagonal belfry, crossed base, visible bell and domed metal cap.
 const bellY=hall.h+hall.rise,bellZ=hall.z;
 solid(lead,0,bellY+.75,bellZ,2.3,1.5,2.3,'Bell tower base');
 for(const side of [-1,1])for(const sign of [-1,1])beam([-1,bellY+.1+(sign>0?0:1.3),bellZ+side*1.18],[1,bellY+.1+(sign>0?1.3:0),bellZ+side*1.18],.11,dark,'Belfry crossed timber');
 mesh(new THREE.CylinderGeometry(1.48,1.48,.18,8),lead,0,bellY+1.65,bellZ,'Belfry lower cornice');
 for(let i=0;i<8;i++){const t=i*Math.PI/4;mesh(new THREE.CylinderGeometry(.10,.12,2.05,8),frame,1.12*Math.cos(t),bellY+2.65,bellZ+1.12*Math.sin(t),'Belfry open column');}
 mesh(new THREE.CylinderGeometry(.30,.6,.74,12),material(0x64533b,{metalness:.5}),0,bellY+2.55,bellZ,'Visible hanging bell');
 mesh(new THREE.CylinderGeometry(1.4,1.5,.22,8),lead,0,bellY+3.73,bellZ,'Belfry upper cornice');
 const dome=mesh(new THREE.SphereGeometry(1.43,16,10,0,Math.PI*2,0,Math.PI/2),lead,0,bellY+3.82,bellZ,'Bell tower dome');dome.scale.y=1.15;
 beam([0,bellY+5.35,bellZ],[0,bellY+7,bellZ],.09,dark,'Bell tower weather vane');
 beam([-.5,bellY+6.65,bellZ],[.5,bellY+6.65,bellZ],.07,dark,'Weather vane crossbar');
 for(const b of ranges.filter(b=>b.h>7&&!b.name.includes('tower')&&!b.name.includes('hall')&&b.name!=='West court outer link')){
  currentWard=b.wardId;
  currentSection=rearSection(b.name)??annexeFrontSection(b.name);
  const [x,z]=position(b,b.w*.28,0),base=b.h+b.rise*.65,top=base+2.55;
  solid(brick,x,(base+top)/2,z,1.65,top-base,1,b.name+' chimney stack',b.r);
  for(const dy of [-.24,0])box(red,x,top+dy,z,1.96,.18,1.28,b.r);
  for(const dx of [-.5,0,.5]){const p=position(b,b.w*.28+dx,0);mesh(new THREE.CylinderGeometry(.13,.17,.8,8),red,p[0],top+.43,p[1],'Terracotta chimney pot');}
 }
 
 currentWard=null;currentSection=null;
 // Build the original west side details, then retain the reflected stair across
 // the entrance axis. The later Carden annotation removes only the east bay.
 const sideMeshStart=model.children.length;
 // Low canted bay visible ahead of the west tower in side.jpg.
 const bayPoints=[[-29,-17],[-37,-17],[-40,-14],[-40,-8],[-37,-5],[-29,-5]];
 const bayShape=new THREE.Shape();bayPoints.forEach(([x,z],i)=>i?bayShape.lineTo(x,-z):bayShape.moveTo(x,-z));bayShape.closePath();
 const bayGeometry=new THREE.ExtrudeGeometry(bayShape,{depth:4.4,bevelEnabled:false});bayGeometry.rotateX(-Math.PI/2);
 mesh(worldUV(bayGeometry,1.7),brick,0,0,0,'West low canted bay walls');
 const roofPoints=bayPoints.map(([x,z])=>[x,4.4,z]),ridge=[-31,6.1,-11],verts=[],uv=[];
 for(let i=0;i<roofPoints.length;i++)for(const p of [roofPoints[i],roofPoints[(i+1)%roofPoints.length],ridge]){verts.push(...p);uv.push(p[0]/3,p[2]/3);}
 const bayRoof=new THREE.BufferGeometry();bayRoof.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));bayRoof.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));bayRoof.computeVertexNormals();
 mesh(bayRoof,roof,0,0,0,'West canted bay slate roof');
 for(let i=0;i<bayPoints.length;i++){
  const p=bayPoints[i],q=bayPoints[(i+1)%bayPoints.length],dx=q[0]-p[0],dz=q[1]-p[1],r=Math.atan2(-dz,dx);
  beam([p[0],4.4,p[1]],[q[0],4.4,q[1]],.15,blue,'Blue canted bay gutter');
  if(i<5){const length=Math.hypot(dx,dz),count=Math.max(1,Math.floor(length/2.3));
   for(let k=0;k<count;k++){const f=(k+.5)/count;sash('West low canted bay',p[0]+f*dx+Math.sin(r)*.04,2.3,p[1]+f*dz+Math.cos(r)*.04,1.15,2.9,r);}
  }
 }
 solid(blue,-29.15,3.6,-.2,.15,2.8,1.4,'Tower fire exit door');
 solid(blue,-30.1,5.05,-.2,2.0,.15,2.0,'Fire stair landing');

 const tx=-15*ANNEXE_MAP_SCALE,tz=-2*ANNEXE_MAP_SCALE;
 for(let i=0;i<18;i++)solid(blue,tx-7,.2+i*.27,tz+6-i*.36,1.65,.10,.42,'Blue external stair tread');
 for(const side of [-1,1])beam([tx-7+side*.87,1.1,tz+6],[tx-7+side*.87,5.7,tz-.5],.08,blue,'Blue stair handrail');
 for(let i=0;i<6;i++)for(const side of [-1,1])beam([tx-7+side*.87,.2+i*.81,tz+6-i*1.08],[tx-7+side*.87,1.1+i*.81,tz+6-i*1.08],.06,blue,'Blue stair baluster');
 const westSide=new THREE.Group();westSide.name='West mirrored side details';
 for(const child of model.children.slice(sideMeshStart))westSide.add(child);model.add(westSide);
 const eastSide=westSide.clone(true);eastSide.name='East mirrored side details';eastSide.scale.x=-1;
 eastSide.traverse(o=>{o.name=o.name.replace(/^West /,'East ');});
 // The latest annotation removes the mirrored east bay, retaining its stairs.
 for(const o of [...eastSide.children])if(/canted bay/.test(o.name))eastSide.remove(o);
 model.add(eastSide);
 function drive(x0,z0,x1,z1,w){
  // The legacy gameplay tracks also stay fixed in world space.
  const dx=x1-x0,dz=z1-z0,p=annexeGroundPoint((x0+x1)/2,.025,(z0+z1)/2);
  const c=Math.cos(ANNEXE.rotation),s=Math.sin(ANNEXE.rotation),x=p[0]-ANNEXE.x,z=p[2]-ANNEXE.z;
  const track=solid(road,(c*x-s*z)/ANNEXE.scale,p[1]/ANNEXE.verticalScale,(s*x+c*z)/ANNEXE.scale,Math.hypot(dx,dz)/ANNEXE.scale,.09,w/ANNEXE.scale,'Annexe drive',Math.atan2(-dz,dx)+ANNEXE_GROUNDS.rotation-ANNEXE.rotation);
  track.scale.y=1/ANNEXE.verticalScale;
 }
 drive(0,28,0,101,6);drive(-144,65,144,65,5);drive(-144,65,-144,-62,5);drive(144,65,144,-46,5);
 const dummy=new THREE.Object3D();
 for(const [mat,items] of batches){
  const byOwner=new Map();
  for(const item of items){if(!byOwner.has(item.owner))byOwner.set(item.owner,[]);byOwner.get(item.owner).push(item);}
  for(const [owner,details] of byOwner){
   const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,details.length);m.receiveShadow=true;m.castShadow=true;m.name=mat===blue?'Blue gutters and downpipes':'Annexe facade details';
   for(let i=0;i<details.length;i++){const b=details[i];dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.r,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);}owner.add(m);
  }
 }
 for(const ward of ANNEXE_WARDS)wards[ward.id].userData.ranges=ranges.filter(b=>b.wardId===ward.id);
 model.userData.wards=wards;
 model.userData.outerFronts=addOuterFronts(THREE,{model,scale:ANNEXE_MAP_SCALE,brick,roof,material,worldUV,hipRoof});
 model.userData.courtFronts=addCourtFronts(THREE,{model,ranges,scale:ANNEXE_MAP_SCALE,brick,roof,material,worldUV,hipRoof});
 model.userData.oakmereElevation=addOakmereElevation(THREE,{model,host:ranges.find(b=>b.name==='Central rear spine'),oppositeWindows:openings.filter(o=>o.name==='Central rear spine'&&o.rotation>0),brick,roof,material,worldUV,hipRoof});
 model.userData.oakmereWestElevation=addOakmereWestElevation(THREE,{model,host:ranges.find(b=>b.name==='Rear court west range'),brick,roof,material,worldUV,hipRoof});
 model.userData.rearKitchen=addAnnexeRearKitchen(THREE,{model,ranges,scale:ANNEXE_MAP_SCALE,brick,roof,material,worldUV,hipRoof});
 model.userData.cardenElevation=addCardenElevation(THREE,{model,hall,ranges,frontDormers,brick,roof,material,worldUV,hipRoof});
 // Move the attached wings rigidly, retaining their roofs, window spacing
 // and angled footprints. Metadata follows the rendered groups for picking
 // and geometric checks; no front-facing assembly is transformed.
 for(const id of ['oakmere','leighton-newton']){
  const dz=ANNEXE_REAR_SHIFT*ANNEXE_MAP_SCALE;wards[id].position.z+=dz;
  for(const b of ranges)if(b.wardId===id)b.z+=dz;
  for(const o of openings)if(o.wardId===id)o.z+=dz;
 }
 model.userData.eastVeranda=addAnnexeEastVeranda(THREE,{parent:sections.eastOuter,scale:ANNEXE_MAP_SCALE,roof,material,worldUV});
 restoreAnnexeFrontLink({model,sections,wards,ranges,openings,scale:ANNEXE_MAP_SCALE});
 alignAnnexeRearSide({model,sections,wards,ranges,openings,scale:ANNEXE_MAP_SCALE});
 addLarktonRecess(THREE,{model,ranges,openings,scale:ANNEXE_MAP_SCALE,brick,roof,material,worldUV,hipRoof});
 addOakmereCourt(THREE,{model,scale:ANNEXE_MAP_SCALE,brick,roof,material,worldUV,hipRoof});
 model.userData.ranges=ranges;model.userData.annexeOpenings=openings;model.userData.osRegistration=ANNEXE_OS_REGISTRATION;
 model.userData.placement=ANNEXE_PLACEMENT_REFERENCE;model.userData.osRefinement=ANNEXE_OS_REFINEMENT;model.userData.photoPlacement=ANNEXE_PHOTO_PLACEMENT;
 shortenAnnexeTowers(THREE,model,ranges,openings);
 return model;
}
