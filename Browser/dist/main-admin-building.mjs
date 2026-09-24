// Main/admin building — OS footprint and four supplied exterior photographs.
// The map is registered to Reception; +X is east and +Z is south/front.
// Map pixels, photograph-derived heights and concealed elevations are estimates.
import {addAdminCorridorDetail} from './admin-corridor-detail.mjs';
import {addFarndonCorridor,FARNDON_CORRIDOR,FARNDON_CORRIDOR_VIEWS} from './farndon-corridor.mjs';
import {addWardCorridors,WARD_CORRIDOR_NODES} from './ward-corridors.mjs';
import {addHaleCorridors,HALE_CORRIDOR_RUNS} from './hale-corridors.mjs';
import {addIrbyCorridor,IRBY_CORRIDOR_VIEWS} from './irby-corridor.mjs';
import {MAIN_KITCHEN,createMainKitchen} from './main-kitchen.mjs';
import {ADMIN_FRONT_CORRIDOR,addAdminFrontCorridor} from './admin-front-corridor.mjs';
export const ADMIN_OS_REGISTRATION=Object.freeze({u:62,v:37,x:0,z:13,scaleX:1.5,scaleZ:1.6});
export function adminMapPoint(u,v){const r=ADMIN_OS_REGISTRATION;return [r.x+(u-r.u)*r.scaleX,r.z+(v-r.v)*r.scaleZ];}
const origin=adminMapPoint(194,44);
export const MAIN_ADMIN=Object.freeze({x:origin[0],z:origin[1]});
const point=(x,y,z)=>[MAIN_ADMIN.x+x,y,MAIN_ADMIN.z+z];
const shot=(position,target,fov=55)=>Object.freeze({position:point(...position),target:point(...target),fov});
export const MAIN_ADMIN_VIEWS=Object.freeze({
  ...FARNDON_CORRIDOR_VIEWS,
  ...IRBY_CORRIDOR_VIEWS,
  'main-admin':shot([-74,47,92],[0,6,0],49),
  'main-admin-plan':shot([-108,340,.01],[-108,0,0],52),
  'main-admin-1':shot([-5,1.8,55],[7,7,10],59),
  'main-admin-2':shot([29,10,22],[-15,7,9],68),
  'main-admin-3':shot([-68,1.8,34],[-8,7,3],56),
  'main-admin-4':shot([-62,1.8,52],[0,7,4],53),
  // chimney/img1-loc.png: southeast lawn, looking northwest along the east side.
  // Step forward on the same sightline to clear the OS-refined annexe ward.
  'main-admin-east':shot([63.8010694154,1.8,39.9055827348],[24,8,-19],68),
  // main_refine3/cameras.png: yellow arrow at the east end, blue in the rear court.
  'main-admin-annexe-end':{position:[254.5,2.3,23],target:[233,9.3,23],fov:80},
  // Keep the rear-court camera in the Estates gateway as that OS range is modelled.
  'main-admin-rear-court':{position:[235,2.4,-49],target:[220,8.5,17],fov:50},
  'main-admin-corridor':{position:[128,21,48],target:[128,3,9.8],fov:63}
});
export const ADMIN_OS_RANGES=Object.freeze([
  {name:'Central administration range',rect:[175,40,213,51],height:14.1,rise:3.3},
  {name:'West projecting pavilion',rect:[169,33,178,53],height:14.1,rise:3.8},
  {name:'East projecting pavilion',rect:[208,43,217,54],height:14.1,rise:3.8},
  // The marked front corridor reuses Farndon's fixed axis. Only the room's
  // inner edge moves; its outer wall, front and rear remain in place.
  {name:'Low west side rooms',rect:[160,40,62+(ADMIN_FRONT_CORRIDOR.x-ADMIN_FRONT_CORRIDOR.width/2)/1.5,50],height:4.5,rise:1.65},
  // main_refine3 replaces the earlier combined-roof interpretation. The side wing
  // has a pitched two-window room and a recessed link to the existing court block.
  {name:'East stepped rear link',rect:[217,37,223,41],height:7.2,roof:'corner-hip'},
  {name:'East recessed rear link',rect:[216.3333333333,35.25,220,37],height:5.8,roof:'flat'},
  {name:'East upper return',rect:[217,37,219,43],height:13.0,rise:2.5},
  // Img2: upper projection, hipped stair bay and flat court block.
  {name:'Rear projecting window range',rect:[200,35.75,209.3333333333,40],height:14.1,rise:3.5},
  {name:'Rear canted stair bay',rect:[211,35.25,216.3333333333,39],height:10.5,rise:2.5,cant:'north',cut:1.2},
  {name:'Rear flat court block',rect:[208,32.75,216.3333333333,35.25],height:6.9,roof:'flat'},
  // The tall annexe-end mass steps down at the back, within the old footprint.
  {name:'East rear shoulder',rect:[208,39,217,43],height:13.0,rise:2.5}
]);

export function createMainAdminBuilding(THREE,{brick,roof,worldUV,material}){
  const building=new THREE.Group();building.name='Main/admin building';building.position.set(MAIN_ADMIN.x,0,MAIN_ADMIN.z);
  const corridor=new THREE.Group();corridor.name='1829 to Main/admin connecting corridor';
  corridor.userData.separateStructure=true;
  const stone=material(0xb5ae99),pale=material(0xd4ceba),dark=material(0x343c3b),frame=material(0xe0e0d3);
  const glass=material(0x799193,{roughness:.46,metalness:.16}),door=material(0x53352c),red=material(0x895040);
  const gravel=material(0x99917b),grass=material(0x667752),batches=new Map(),openings=[],ranges=[];
  function mesh(g,m,x,y,z,name,parent=building){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function solid(m,x,y,z,w,h,d,name,parent=building){return mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x,y,z,name,parent);}
  function box(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});}
  function prism(m,x,y,z,points,h,name){
    const shape=new THREE.Shape();points.forEach(([px,pz],i)=>i?shape.lineTo(px,-pz):shape.moveTo(px,-pz));shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);
    const o=mesh(worldUV(g,1.7),m,x,y,z,name);o.userData.collisionFootprint=points;return o;
  }
  function hip(x,z,w,d,y,rise,name,parent=building){
    const a=w/2+.22,b=d/2+.22,inset=Math.min(a,b)*.9;
    const v=[[-a,0,-b],[a,0,-b],[a,0,b],[-a,0,b],...(w>=d?[[-a+inset,rise,0],[a-inset,rise,0]]:[[0,rise,-b+inset],[0,rise,b-inset]])];
    const faces=w>=d?[[0,1,5],[0,5,4],[1,2,5],[2,3,4],[2,4,5],[3,0,4]]:[[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]];
    const positions=[],uv=[];for(const f of faces)for(const i of [...f].reverse()){positions.push(...v[i]);uv.push(v[i][0]/2.8,(v[i][2]+v[i][1])/2.8);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
    mesh(g,roof,x,y,z,name+' slate roof',parent);
    solid(red,x,y+rise+.04,z,w>=d?w-2*inset:.18,.13,w>=d?.18:d-2*inset,name+' ridge',parent);
  }
  function range(spec){
    const [u0,v0,u1,v1]=spec.rect,a=adminMapPoint(u0,v0),b=adminMapPoint(u1,v1);
    const x=(a[0]+b[0])/2-MAIN_ADMIN.x,z=(a[1]+b[1])/2-MAIN_ADMIN.z,w=b[0]-a[0],d=b[1]-a[1],h=spec.height;
    if(spec.cant){
      // Photo-supported canted end/stair bays with matching roof outlines.
      const cut=spec.cut??2.1,outline=spec.cant==='north'
        ?[[-w/2,-d/2+cut],[-w/2+cut,-d/2],[w/2-cut,-d/2],[w/2,-d/2+cut],[w/2,d/2],[-w/2,d/2]]
        :[[-w/2,-d/2],[w/2-cut,-d/2],[w/2,-d/2+cut],[w/2,d/2-cut],[w/2-cut,d/2],[-w/2,d/2]];
      prism(brick,x,0,z,outline,h,spec.name+' walls');
      for(const [y,depth,mat] of [[0,.55,red],[h-.2,.17,stone],[h,.18,pale]])prism(mat,x,y,z,outline.map(([a,b])=>[a*1.02,b*1.02]),depth,spec.name+' canted course');
      const positions=[],uv=[],edge=outline.map(([a,b])=>[a*1.045,h+.18,b*1.045]);
      for(let i=0;i<edge.length;i++)for(const p of [edge[(i+1)%edge.length],edge[i],[0,h+.18+spec.rise,0]]){positions.push(...p);uv.push(p[0]/2.8,(p[2]+p[1])/2.8);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();mesh(g,roof,x,0,z,spec.name+' slate roof');
      ranges.push({...spec,x,z,w,d});return {x,z,w,d,h};
    }
    solid(brick,x,h/2,z,w,h,d,spec.name+' walls');solid(stone,x,.2,z,w+.12,.4,d+.12,spec.name+' plinth');
    if(spec.roof==='corner-hip'){
      // The attached three-sided roof is added after the ranges are assembled.
      solid(pale,x,h+.06,z,w+.38,.22,d+.38,spec.name+' eaves');
      ranges.push({...spec,x,z,w,d});return {x,z,w,d,h};
    }
    if(spec.roof==='flat'){
      solid(dark,x,h+.07,z,w,.14,d,spec.name+' flat roof');
      for(const edgeZ of [z-d/2,z+d/2]){
        solid(brick,x,h+.3,edgeZ,w,.6,.24,spec.name+' brick parapet');
        solid(stone,x,h+.62,edgeZ,w+.18,.13,.4,spec.name+' coping');
      }
      for(const edgeX of [x-w/2,x+w/2]){
        solid(brick,edgeX,h+.3,z,.24,.6,d,spec.name+' brick parapet');
        solid(stone,edgeX,h+.62,z,.4,.13,d+.18,spec.name+' coping');
      }
      solid(red,x,h-.32,z,w+.12,.22,d+.12,spec.name+' parapet string');
      ranges.push({...spec,x,z,w,d});return {x,z,w,d,h};
    }
    for(const y of h>12?[4.65,9.4,Math.min(13.9,h-.2)]:h>9?[4.65,9.4,h-.2]:[h-.2])solid(y===13.9?pale:stone,x,y,z,w+.16,.17,d+.16,spec.name+' stone course');
    solid(pale,x,h+.06,z,w+.38,.22,d+.38,spec.name+' eaves');hip(x,z,w,d,h+.18,spec.rise,spec.name);
    ranges.push({...spec,x,z,w,d});return {x,z,w,d,h};
  }
  const [core,west,east,low,eastStep,eastRearLink,eastUpper,rearProjection,rearStair,rearCourt,eastShoulder]=ADMIN_OS_RANGES.map(range);
  // main_refine3 identifies the blue wing from both directions. The steep
  // three-sided hip covers only the two-window room. Its lower flat link meets
  // the east side of the red court block: img1 and img2 show that same block.
  // The ridge joins the upper return wall behind the blue-marked wing.
  const wingNorth=eastStep.z-eastStep.d/2,wingSouth=eastStep.z+eastStep.d/2;
  const wingZ=eastStep.z,wingW=eastStep.w,roofY=7.38,roofRise=2.5;
  const wallX=eastUpper.x+eastUpper.w/2,roofEast=eastStep.x+wingW/2+.22;
  const roofNorth=wingNorth-.22,roofSouth=wingSouth+.22,ridgeX=roofEast-3.4;
  const wn=[wallX,roofY,roofNorth],en=[roofEast,roofY,roofNorth],es=[roofEast,roofY,roofSouth],ws=[wallX,roofY,roofSouth];
  const wallRidge=[wallX,roofY+roofRise,wingZ],outerRidge=[ridgeX,roofY+roofRise,wingZ];
  const roofPositions=[],roofUV=[];
  for(const triangle of [[wallRidge,en,wn],[wallRidge,outerRidge,en],[outerRidge,es,en],[wallRidge,ws,es],[wallRidge,es,outerRidge]])for(const p of triangle){
    roofPositions.push(...p);roofUV.push(p[0]/2.8,(p[2]+p[1])/2.8);
  }
  const wingRoofGeometry=new THREE.BufferGeometry();
  wingRoofGeometry.setAttribute('position',new THREE.Float32BufferAttribute(roofPositions,3));
  wingRoofGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(roofUV,2));wingRoofGeometry.computeVertexNormals();
  mesh(wingRoofGeometry,roof,0,0,0,'East pointed side wing slate roof');
  solid(red,(wallX+ridgeX)/2,roofY+roofRise+.045,wingZ,ridgeX-wallX,.12,.16,'East side wing hip ridge');
  function sash(face,x,y,z,w=1.4,h=2.8,r=0){
    const dx=Math.cos(r),dz=-Math.sin(r),nx=Math.sin(r),nz=Math.cos(r);
    const part=(m,u,v,n,pw,ph,pd)=>box(m,x+dx*u+nx*n,y+v,z+dz*u+nz*n,pw,ph,pd,r);
    openings.push({face,x,y,z,w,h,rotation:r});
    part(dark,0,0,.025,w+.16,h+.12,.10);part(glass,0,0,.09,w,h,.06);
    for(const s of [-1,1]){part(frame,s*w/2,0,.14,.065,h+.1,.08);part(frame,0,s*h/2,.14,w+.09,.07,.08);}
    part(frame,0,0,.16,w,.065,.07);
    // Slender glazing bars keep the established circa-1900 treatment.
    for(const s of [-1,1])part(frame,s*w/6,0,.16,.022,h,.04);
    part(pale,0,-h/2-.11,.12,w+.34,.16,.32);
    part(pale,0,h/2+.18,.10,w+.38,.30,.22);
  }
  const levels=[{y:2.25,h:3.0},{y:7.05,h:3.05},{y:11.75,h:2.55}];
  const front=core.z+core.d/2+.025;
  // Six flanking sashes and three close central lights under the pediment.
  for(const {y,h} of levels){
    for(const x of [-19,-12,12,19])sash('principal frontage',x,y,front,1.45,h);
    if(y>3)for(const x of [-2.15,0,2.15])sash('central grouped windows',x,y,front,1.3,h);
  }
  for(const end of [west,east]){
    const z=end.z+end.d/2;
    // front.png: two storeys with 45-degree chamfers, below the square top floor.
    const outline=[[-4.05,0],[4.05,0],[4.05,.3],[2.35,2],[-2.35,2],[-4.05,.3]];
    prism(brick,end.x,0,z,outline,9.44,'Chamfered two-storey bay walls');
    const trim=outline.map(([x,z])=>[x*1.045,1+(z-1)*1.10]);
    for(const y of [.3,4.65,9.4])prism(stone,end.x,y-.1,z,trim,.20,'Chamfered bay stone course');
    prism(dark,end.x,9.515,z,trim,.13,'Chamfered bay lead roof');
    for(const {y,h} of levels){
      if(y>9){for(const dx of [-1.8,1.8])sash('pavilion front',end.x+dx,y,z+.025,1.65,h);continue;}
      for(const dx of [-1.15,1.15])sash('bay flat front',end.x+dx,y,z+2.025,1.45,h);
      for(const side of [-1,1]){
        const rotation=side*Math.PI/4,nx=Math.sin(rotation),nz=Math.cos(rotation);
        sash('bay chamfer',end.x+side*3.2+nx*.025,y,z+1.15+nz*.025,1.05,h,rotation);
        // Jambs sit on the slanted faces rather than spanning the cut corners.
        for(const u of [-.73,.73])box(pale,end.x+side*3.2+Math.cos(rotation)*u+nx*.13,y,z+1.15-Math.sin(rotation)*u+nz*.13,.19,h+.45,.18,rotation);
      }
    }
  }
  // main_redfine2 reveals the rear projections, replacing the hidden window grid.
  for(const {y,h} of levels){
    // The attached corridor covers this ground-floor face. The marked sash
    // is removed, while all six upper-floor windows stay in their positions.
    if(y>5)for(const z of [-13,-8,-3])sash('west return',west.x-west.w/2-.025,y,z,1.35,h,-Math.PI/2);
    if(y>5)sash('east photo upper column',east.x+east.w/2+.025,y,4.5,1.35,h,Math.PI/2);
    else for(const z of [12,-6.4])sash('east photo ground',east.x+east.w/2+.025,y,z,1.55,h,Math.PI/2);
    for(const x of [-20,-13,-6,1])sash('rear retained',x,y,core.z-core.d/2-.025,1.35,h,Math.PI);
    for(const x of [west.x-2.6,west.x+2.6])sash('west rear inferred',x,y,west.z-west.d/2-.025,1.4,h,Math.PI);

  }
  for(const dx of [-2.05,0,2.05])sash('low west frontage',low.x+dx,2.15,low.z+low.d/2+.025,1.45,2.9);
  sash('low west stepped return',low.x+low.w/2+.025,2.05,low.z+low.d/2-1.6,1.1,2.7,Math.PI/2);
  for(const z of [low.z-4.6,low.z,low.z+4.6])sash('low west end',low.x-low.w/2-.025,2.15,z,1.3,2.9,-Math.PI/2);
  // Paired tall sashes occupy the pitched room. The small sash steps back
  // into the low link; the square end keeps its sash and basement opening.
  for(const dz of [-1.45,1.45])sash('east corner paired sash',eastStep.x+eastStep.w/2+.025,4.65,eastStep.z+dz,1.45,3.05,Math.PI/2);
  sash('east corner south sash',eastUpper.x+eastUpper.w/2+1,4.65,wingSouth+.025,1.05,3.05);
  sash('east corner recessed sash',eastRearLink.x+eastRearLink.w/2+.025,3.45,eastRearLink.z,1.35,1.7,Math.PI/2);
  sash('rear court east sash',rearCourt.x+rearCourt.w/2+.025,4.6,rearCourt.z,1.55,2.65,Math.PI/2);
  sash('rear court east basement',rearCourt.x+rearCourt.w/2+.025,.95,rearCourt.z,1.6,.8,Math.PI/2);
  // Img2 sees the low pitched roof beside the retained red court block,
  // with two levels of sash windows on the upper return behind it.
  for(const y of [7.0,11.1])sash('east upper return north',eastUpper.x,y,eastUpper.z-eastUpper.d/2-.025,1.5,2.6,Math.PI);
  for(const room of [eastStep,eastRearLink,rearCourt])box(stone,room.x+room.w/2+.06,2.6,room.z,.14,.13,room.d);
  box(stone,eastStep.x,2.6,wingSouth+.06,wingW,.13,.14);
  for(const z of [wingNorth+.18,wingSouth-.18])box(dark,eastStep.x+wingW/2+.12,3.6,z,.085,7.2,.085);
  // Img2 puts the close upper group on a projecting rear face.
  for(const dx of [-2.1,0,2.1])sash('rear grouped upper',rearProjection.x+dx,11.65,rearProjection.z-rearProjection.d/2-.025,1.45,2.75,Math.PI);
  for(const dx of [-3.7,0,3.7])for(const y of [2.3,7.05])sash('rear projection sash',rearProjection.x+dx,y,rearProjection.z-rearProjection.d/2-.025,1.35,2.85,Math.PI);
  for(const dx of [-1.5,1.5])sash('rear stair upper',rearStair.x+dx,8.85,rearStair.z-rearStair.d/2-.025,1.2,2.45,Math.PI);

  for(const dx of [-3.4,3.4])sash('rear court upper',rearCourt.x+dx,4.65,rearCourt.z-rearCourt.d/2-.025,1.85,2.65,Math.PI);
  const courtFace=rearCourt.z-rearCourt.d/2-.04;
  box(dark,rearCourt.x-1.3,1.25,courtFace-.04,4.3,2.5,.12);
  box(frame,rearCourt.x-1.3,1.15,courtFace-.12,4.0,2.3,.10);
  for(const dx of [-2.65,-1.3,.05])box(dark,rearCourt.x+dx,.65,courtFace-.2,1.15,.95,.08);
  for(const dx of [-2.65,-1.3,.05])sash('rear court door glazing',rearCourt.x+dx,1.72,courtFace-.18,1.1,1.0,Math.PI);
  box(pale,rearCourt.x+3.45,.72,courtFace-.12,1.85,1.3,.18);
  for(const x of [rearCourt.x-rearCourt.w/2+.2,rearCourt.x+rearCourt.w/2-.2])box(dark,x,3.45,courtFace-.12,.1,6.9,.1);
  // Shallow external flue piers line up with the two edge chimney stacks.
  for(const z of [10,-1]){
    solid(brick,east.x+east.w/2+.12,7,z,.24,14,2.6,'East elevation chimney breast');
    box(dark,east.x+east.w/2+.29,6.9,z-1.45,.085,13.8,.085);
    for(const y of [4.65,9.4])box(stone,east.x+east.w/2+.27,y,z,.16,.17,2.72);
  }
  // Stone portico: four columns, layered entablature and ball finials.
  solid(dark,0,2.15,front+.055,2.5,4.3,.12,'Recessed main entrance');
  solid(door,0,1.88,front+.16,2.12,3.7,.1,'Timber double entrance door');
  for(const x of [-.53,.53])for(const y of [.65,1.7,2.8])box(red,x,y,front+.23,.77,.75,.065);
  box(glass,0,3.95,front+.18,2.1,.45,.08);box(pale,0,3.72,front+.26,2.2,.1,.1);
  for(const x of [-.13,.13])box(pale,x,1.85,front+.3,.045,.26,.06);
  for(const x of [-3.5,-2.65,2.65,3.5]){
    solid(stone,x,.65,front+2.0,.68,1.3,.68,'Portico column pedestal');
    mesh(new THREE.CylinderGeometry(.24,.30,3.0,12),pale,x,2.7,front+2.0,'Portico stone column');
    for(const y of [1.25,4.2,4.42])box(stone,x,y,front+2.0,.78,.2,.78);
  }
  for(const [y,w,h,d] of [[4.5,8.1,.28,2.9],[4.85,8.5,.42,3.1],[5.13,8.8,.16,3.3]])solid(stone,0,y,front+1.3,w,h,d,'Portico entablature');
  for(const x of [-3.7,-1.25,1.25,3.7]){
    box(stone,x,5.4,front+2.3,.48,.43,.48);
    mesh(new THREE.SphereGeometry(.30,10,8),stone,x,5.85,front+2.3,'Portico ball finial');
  }
  for(let i=0;i<3;i++)solid(stone,0,.08+i*.09,front+2.3-i*.5,7.7,.16+i*.18,2.0,'Entrance step');
  // Triangular central pediment and a modest sculpted crest, approximated from photo 4.
  const triangle=new THREE.Shape();triangle.moveTo(-4.4,0);triangle.lineTo(4.4,0);triangle.lineTo(0,3.4);triangle.closePath();
  mesh(new THREE.ExtrudeGeometry(triangle,{depth:.35,bevelEnabled:false}),stone,0,14.24,front+.15,'Central stone pediment');
  for(const side of [-1,1]){
    const a=new THREE.Vector3(side*4.65,14.22,front+.47),b=new THREE.Vector3(0,17.82,front+.47),v=b.clone().sub(a);
    const o=mesh(new THREE.BoxGeometry(.26,v.length(),.5),pale,...a.add(b).multiplyScalar(.5).toArray(),'Pediment raking cornice');o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
  }
  mesh(new THREE.SphereGeometry(.64,12,10),pale,0,15.35,front+.59,'Pediment crest shield').scale.set(.8,1.15,.24);
  for(const side of [-1,1])for(let i=0;i<4;i++)mesh(new THREE.SphereGeometry(.19,8,6),stone,side*(.6+i*.12),15.65-i*.27,front+.55,'Pediment carved foliage');
  // Broad, tall chimney stacks are a defining feature in all four photographs.
  for(const [x,z,w,d,top] of [[west.x-5.3,7,2.9,2.2,21.3],[west.x+2,-3,2.3,1.6,20.6],[-21,3,2.5,1.5,21.7],[-9,3,2.5,1.55,21.5],[0,2,2.6,1.55,22],[12,3,2.5,1.55,21.3],[east.x+east.w/2-1.45,10,2.65,3.2,21.9],[east.x+east.w/2-1.45,-1,2.65,3.2,21.5]]){
    solid(brick,x,(top+13.4)/2,z,w,top-13.4,d,'Tall admin chimney stack');
    for(const [offset,extra] of [[-.42,.12],[-.17,.28],[0,.18]])box(offset===0?dark:red,x,top+offset,z,w+extra,.17,d+extra);
  }
  for(const x of [-23,-9,9,23])box(dark,x,7,front+.24,.08,13.8,.09);
  for(const p of [west,east])for(const side of [-1,1])box(dark,p.x+side*(p.w/2-.2),7,p.z+p.d/2+.12,.09,13.8,.09);
  // Empty gravel carriage approach and curved lawn, consistent with the estate.
  solid(gravel,-4,-.015,22,91,.14,17,'Admin carriage approach');
  const lawn=mesh(new THREE.CylinderGeometry(1,1,.12,64),grass,0,.10,35,'Admin forecourt lawn');lawn.scale.set(29,1,11);
  const edging=mesh(new THREE.TorusGeometry(1,.009,6,64),stone,0,.18,35,'Curved lawn stone edging');edging.rotation.x=Math.PI/2;edging.scale.set(29,11,1);
  solid(gravel,-53,-.015,4,7,.13,51,'West side access');
  // The photo's curved carriage approach and the lane turning behind the
  // east wing use gravel, retaining the established period grounds treatment.
  function lane(points,width,name){
    const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x-MAIN_ADMIN.x,0,z-MAIN_ADMIN.z)));
    function strip(offset,w,y,h,mat,label){
      const pos=[],indices=[];
      for(let i=0;i<=48;i++){
        const p=curve.getPoint(i/48),t=curve.getTangent(i/48),n=new THREE.Vector3(-t.z,0,t.x).normalize();
        for(const side of [-1,1]){const q=p.clone().addScaledVector(n,offset+side*w/2);pos.push(q.x,y,q.z);}
        if(i<48){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();
      mesh(g,mat,0,h,0,label);
    }
    strip(0,width,.13,0,gravel,name);
    for(const side of [-1,1])strip(side*(width/2+.08),.24,.18,0,stone,name+' stone kerb');
  }
  lane([[230,46],[244,47],[257,54],[267,67],[275,87]],8,'East curved carriage drive');
  lane([[260,58],[257,44],[254,28],[254,8],[250,-13]],6.5,'East wing side access');
  // Retain the deeper Redesmere connector up to the new kitchen's west wall;
  // continue the low corridor along the kitchen's south wall. Keep the small
  // concealed joint below the existing Redesmere roofs. Its
  // ivy-fronted range ends at x=99.8 (roof overhang to 100.2); neither it nor
  // its separate chimney is part of this refinement.
  const start=94.65,end=adminMapPoint(169,35)[0],cz=adminMapPoint(148,35)[1];
  const buildingStart=100.45,split=MAIN_KITCHEN.minX,connectorFront=cz+3.2;
  const sections=[
    {name:'Redesmere concealed connector',start,end:buildingStart,cz,depth:6.4,height:3.6,rise:.64},
    {name:'Redesmere connector building',start:buildingStart,end:split,cz:connectorFront-5.9,depth:11.8,height:4.8,rise:3.2},
    {name:'Connecting corridor',start:split,end,cz,depth:6.4,height:3.6,rise:.64}
  ];
  const corridorBrick=brick.clone();corridorBrick.color.set(0xc7a391);
  for(const section of sections){
    const {name,start:a,end:b,cz:z,depth,height,rise}=section,x=(a+b)/2;
    solid(corridorBrick,x,height/2,z,b-a,height,depth,name+' walls',corridor);
    hip(x,z,b-a,depth,height+.06,rise,name,corridor);
    if(a>=buildingStart)addAdminCorridorDetail(THREE,{corridor,...section,brick,material,worldUV,
      omitWindow:(x,side)=>Math.abs(x-FARNDON_CORRIDOR.x)<FARNDON_CORRIDOR.width/2+.8||side===-1&&x>=MAIN_KITCHEN.minX-1&&x<=MAIN_KITCHEN.maxX+1});
  }
  corridor.userData.sections=sections;
  corridor.userData.footprints=sections.map(s=>({minX:s.start,maxX:s.end,minZ:s.cz-s.depth/2,maxZ:s.cz+s.depth/2}));
  corridor.userData.footprint={minX:start,maxX:end,minZ:connectorFront-11.8,maxZ:connectorFront};
  addFarndonCorridor(THREE,{corridor,brick,roof,material,worldUV,
    omitWindow:(z,side)=>side===-1&&((z>=MAIN_KITCHEN.minZ-1&&z<=MAIN_KITCHEN.maxZ+1)||[...HALE_CORRIDOR_RUNS.map(run=>run.end[1]),WARD_CORRIDOR_NODES.farndon[1]].some(jointZ=>Math.abs(z-jointZ)<FARNDON_CORRIDOR.width/2+.8))});
  addWardCorridors(THREE,{corridor,brick,roof,material,worldUV});
  addHaleCorridors(THREE,{corridor,brick,roof,material,worldUV});
  addIrbyCorridor(THREE,{corridor,brick,roof,material,worldUV});
  corridor.add(createMainKitchen(THREE,{brick,material,worldUV}));
  addAdminFrontCorridor(THREE,{corridor,brick,roof,material,worldUV});
  corridor.userData.frontExtension=ADMIN_FRONT_CORRIDOR;
  corridor.userData.reference='Research/admin-corridor/README.md; Research/main-kitchen/README.md: the deeper Redesmere connector now ends at the kitchen west wall, and the low corridor follows its south wall. Front alignment, concealed Redesmere joint, ivy-fronted range and chimney are retained.';
  const dummy=new THREE.Object3D();
  for(const [m,items] of batches){const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,items.length);batch.name='Admin sash and masonry details';batch.userData.orientedCollision=true;batch.castShadow=true;batch.receiveShadow=true;items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.r,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});building.add(batch);}
  building.userData.openings=openings;building.userData.ranges=ranges;
  building.userData.reference='OS footprint and img1–4; chamfered bays and stepped low west rooms refined from main_refine/front.png and new-shape.png. The paired main_refine3 views identify one attached, three-sided hipped side room and recessed link to the existing flat court block, with an upper return behind. The red-marked court frontage and stair bay retain their geometry. The green-marked foreground structure is excluded. Concealed joins and dimensions are estimates. See Research/main-refine3/README.md.';
  return {building,corridor};
}
