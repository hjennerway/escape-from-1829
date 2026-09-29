// locations.png fixes the roadside footprints and the two camera directions.
// Photo-derived dimensions and the obscured rear elevations are estimates.
import {VIVIENNE_LANE,GARAGE_LANE_SHIFT} from './road-centerlines.mjs';
export const GARAGES=Object.freeze({x:177,z:99.4+GARAGE_LANE_SHIFT,rotation:-Math.atan(.1),length:52.5,depth:7.2,eave:3.2});
const transform=(site,x,y,z)=>[site.x+Math.cos(site.rotation)*x+Math.sin(site.rotation)*z,y,site.z-Math.sin(site.rotation)*x+Math.cos(site.rotation)*z];
// Express the earlier mortuary correction in the translated site's frame so
// the whole building and its path move by exactly the same amount as the lane.
export const MORTUARY_PREVIOUS=Object.freeze({x:164,z:110+GARAGE_LANE_SHIFT,rotation:GARAGES.rotation,eave:3.35});
// Halve the entrance-to-kerb distance along the road normal. The red/blue
// correction extends each crossbar end three units, keeping both arms equal.
const roadA=VIVIENNE_LANE[9],roadB=VIVIENNE_LANE[10],roadDX=roadB[0]-roadA[0],roadDZ=roadB[1]-roadA[1],roadLength=Math.hypot(roadDX,roadDZ);
const toward=[roadDZ/roadLength,-roadDX/roadLength],entrance=transform(MORTUARY_PREVIOUS,0,0,-4);
const previousGap=-((entrance[0]-roadA[0])*toward[0]+(entrance[2]-roadA[1])*toward[1])-3.6;
export const MORTUARY=Object.freeze({...MORTUARY_PREVIOUS,x:MORTUARY_PREVIOUS.x+toward[0]*previousGap/2,z:MORTUARY_PREVIOUS.z+toward[1]*previousGap/2,halfWidth:8.2,armExtension:3});
export const garagePoint=(x,y,z)=>transform(GARAGES,x,y,z);
export const mortuaryPoint=(x,y,z)=>transform(MORTUARY,x,y,z);
export const GARAGE_MORTUARY_VIEWS=Object.freeze({
 'garages':{position:[222,45,65+GARAGE_LANE_SHIFT],target:[195,2,105+GARAGE_LANE_SHIFT],fov:53},
 'garages-site':{position:[166,95,185+GARAGE_LANE_SHIFT],target:[190,0,66+GARAGE_LANE_SHIFT],fov:49},
 'garages-plan':{position:[195,104,104.01+GARAGE_LANE_SHIFT],target:[195,0,104+GARAGE_LANE_SHIFT],fov:48},
 'garages-1':{position:garagePoint(54,1.85,-4.8),target:garagePoint(22,2,-.1),fov:66},
 'garages-2':{position:garagePoint(13,1.85,-12),target:garagePoint(3,2.25,1),fov:69},
 'mortuary':{position:mortuaryPoint(12,9,-18),target:mortuaryPoint(0,2,1),fov:48},
 'mortuary-ground':{position:mortuaryPoint(0,1.85,-11),target:mortuaryPoint(0,2,0),fov:60}
});

export function createGaragesMortuary(THREE,{brick,roof,worldUV,material}){
 const site=new THREE.Group();site.name='Roadside garages and mortuary';site.userData.layout='historic';
 site.userData.reference='Research/garages/README.md';
 const blue=material(0x78a4ba),blueDark=material(0x477286),blueLight=material(0x93bacb);
 const iron=material(0x354244),stone=material(0xaaa697),frame=material(0xc1c9c5);
 const glass=material(0x597477,{roughness:.53}),recess=material(0x273334),red=material(0x965945);
 glass.userData.windowGlass=true;
 const concrete=material(0x98968b),brickBase=material(0x644436),slate=roof.clone();
 slate.color.set(0xadb5ba);brick=brick.clone();brick.color.set(0xcdb3a9);
 const rect=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
 function builder(name,placement){
  const group=new THREE.Group();group.name=name;group.position.set(placement.x,0,placement.z);group.rotation.y=placement.rotation;site.add(group);
  const batches=new Map(),openings=[];
  function mesh(g,m,name){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
  function box(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});}
  function solid(points,h,name,mat=brick,bottom=0){
   const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
   const g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);g.translate(0,bottom,0);
   const o=mesh(worldUV(g,1.7),mat,name);if(h>.6)o.userData.collisionFootprint=points;return o;
  }
  function surface(triangles,m,name,up=false){
   const points=[];for(let tri of triangles){const v=tri.map(p=>new THREE.Vector3(...p));if(up&&v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).y<0)tri=[...tri].reverse();points.push(...tri.flat());}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(points.flatMap((_,i)=>i%3===0?[points[i]/1.7,(points[i+1]+points[i+2])/1.7]:[]),2));g.computeVertexNormals();return mesh(g,m,name);
  }
  function pitched(x0,z0,x1,z1,eave,rise,name,axis='x',gableMaterial=brick){
   const a=x0-.18,b=x1+.18,c=z0-.2,d=z1+.2,cx=(a+b)/2,cz=(c+d)/2,y=eave+.08,r=y+rise;
   const v=[[a,y,c],[b,y,c],[b,y,d],[a,y,d],...(axis==='x'?[[a,r,cz],[b,r,cz]]:[[cx,r,c],[cx,r,d]])];
   const faces=axis==='x'?[[0,1,5],[0,5,4],[2,3,4],[2,4,5]]:[[0,3,5],[0,5,4],[1,2,5],[1,5,4]];
   surface(faces.map(f=>f.map(i=>v[i])),slate,name+' slate roof',true);
   const ends=axis==='x'?[[0,4,3],[1,2,5]]:[[0,1,4],[3,5,2]];
   // Wall-plane gables avoid slate triangles on the brick ends.
   const gables=surface(ends.map(f=>f.map(i=>v[i])),gableMaterial,name+' gables');gables.material=gableMaterial.clone();gables.material.side=THREE.DoubleSide;
   box(red,cx,r+.04,cz,axis==='x'?b-a:.13,.12,axis==='x'?.13:d-c);
   if(axis==='x')for(const z of [c,d])box(iron,cx,y-.04,z,b-a,.13,.15);
   else for(const x of [a,b])box(iron,x,y-.04,cz,.15,.13,d-c);
  }
  function opening(x,z,w,h,kind='garage',y=.12){
   const centre=y+h/2;
   // The common photo facade faces local -Z, out toward Vivienne Smith Lane.
   box(recess,x,centre,z-.028,w+.18,h+.13,.075);
   box(blue,x,centre,z-.075,w,h,.07);
   for(const s of [-1,1])box(blueLight,x+s*(w/2+.045),centre,z-.14,.09,h+.12,.1);
   box(blueLight,x,y+h+.06,z-.14,w+.18,.12,.12);
   if(kind==='garage'){
    for(let i=1;i<12;i++){const py=y+h*i/12;box(blueDark,x,py,z-.118,w-.05,.021,.016);box(blueLight,x,py-.035,z-.116,w-.08,.015,.012);}
    box(iron,x,centre-.17,z-.158,.065,.17,.055);box(iron,x+.07,centre-.11,z-.16,.17,.035,.045);
   }else{
    for(let i=1;i<Math.ceil(w/.19);i++)box(blueDark,x-w/2+i*.19,centre,z-.117,.012,h-.08,.015);
    box(blueDark,x,centre,z-.131,.04,h,.03);
    for(const py of [y+.3,y+h*.45,y+h*.82])box(blueLight,x,py,z-.142,w-.08,.065,.04);
    box(iron,x+w*.3,centre,z-.177,.045,.23,.055);
   }
   box(stone,x,y+h+.19,z-.06,w+.29,.18,.18);
   openings.push({kind,x,z,y:centre,w,h});
  }
  function window(x,z,w=1.65,h=1.6,y=1.95,r=0){
   const part=(m,u,v,n,pw,ph,pd)=>box(m,x+Math.cos(r)*u-Math.sin(r)*n,y+v,z-Math.sin(r)*u-Math.cos(r)*n,pw,ph,pd,r);
   part(recess,0,0,.035,w+.15,h+.12,.09);part(glass,0,0,.09,w,h,.07);
   // Narrow pale-blue metal frames, three vertical lights and upper transoms.
   for(const s of [-1,1]){part(frame,s*w/2,0,.16,.05,h+.1,.08);part(frame,0,s*h/2,.16,w+.1,.05,.08);part(frame,s*w/6,0,.175,.04,h,.07);}
   part(frame,0,h*.25,.175,w,.04,.06);part(stone,0,-h/2-.09,.17,w+.23,.12,.26);
   for(let i=0;i<9;i++)part(stone,-w/2+(i+.5)*w/9,-.05,.13,.035,h*.81,.012);
   openings.push({kind:'window',x,z,y,w,h,r});
  }
  function drain(x,z,h){box(iron,x,h/2,z,.085,h,.09);box(stone,x,.46,z-.015,.105,.75,.115);for(const y of [.9,2.3])box(iron,x,y,z-.025,.14,.055,.11);}
  function finish(){const dummy=new THREE.Object3D();for(const [mat,items]of batches){const b=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);b.name=name+' doors, glazing and trim';b.castShadow=true;b.receiveShadow=true;b.userData.orientedCollision=true;items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.rotation.set(0,p.r,0);dummy.updateMatrix();b.setMatrixAt(i,dummy.matrix);});group.add(b);}group.userData.openings=openings;return group;}
  return {group,box,solid,surface,pitched,opening,window,drain,finish};
 }
 const g=builder('Garage row',GARAGES);
 const ranges=[{name:'Western garages and offices',x0:0,x1:13.6,depth:7.2,h:3.2,rise:1.18,axis:'x'},
  {name:'Tall workshop bay',x0:13.6,x1:17.7,depth:8.2,h:4.45,rise:1.35,axis:'z'},
  {name:'Long eastern garage range',x0:17.7,x1:52.5,depth:7.2,h:3.2,rise:1.18,axis:'x'}];
 for(const r of ranges){g.solid(rect(r.x0,0,r.x1,r.depth),r.h,r.name+' walls');g.solid(rect(r.x0-.025,-.025,r.x1+.025,r.depth+.025),.24,r.name+' plinth',brickBase);g.pitched(r.x0,0,r.x1,r.depth,r.h,r.rise,r.name,r.axis);g.box(stone,(r.x0+r.x1)/2,r.h-.13,-.07,r.x1-r.x0,.22,.16);}
 // Img2, seen from east to west: tall double door, one garage, two offices,
 // then two more garage doors. Img1 looks along the twelve-bay eastern row.
 g.opening(15.65,0,3.25,3.85,'double');
 g.opening(11.85,0,2.55,2.66);
 for(const x of [1.45,4.25])g.opening(x,0,2.4,2.66);
 g.window(9.63,0,1.5,1.74,1.98);g.opening(8.33,0,.7,2.64,'office');
 g.window(7.26,0,1.38,1.74,1.98);g.opening(6.02,0,.7,2.64,'office');
 // Upper glass lights in the two slim office doors.
 for(const x of [8.33,6.02]){g.box(glass,x,2.12,-.137,.56,1.04,.035);for(const y of [1.62,1.97,2.62])g.box(blueLight,x,y,-.165,.6,.045,.055);}
 for(let i=0;i<12;i++)g.opening(17.7+(i+.5)*2.9,0,2.53,2.66,i===8?'double':'garage');
 for(const x of [.05,13.5,17.83,26.4,35.1,43.8,52.45])g.drain(x,-.24,x>13.5&&x<17.8?4.45:3.2);
 // A concrete threshold apron joins the lane without adding another road.
 g.solid([[-.4,-5.1],[18.5,-3.3],[52.8,-3.55],[52.8,7.5],[-.4,7.5]],.12,'Garage concrete apron',concrete,-.03);
 // Side and rear openings are deliberately sparse where the photos hide them.
 for(const x of [6.7,10.6])g.window(x,7.2,1.2,.75,2.25,Math.PI);
 g.group.userData.ranges=ranges;g.finish();

 const m=builder('T-shaped mortuary',MORTUARY),e=MORTUARY.eave,half=MORTUARY.halfWidth;
 const footprint=[[-half,1],[-1.9,1],[-1.9,-4],[1.9,-4],[1.9,1],[half,1],[half,6],[-half,6]];
 m.solid(footprint,e,'Mortuary T-shaped brick walls');m.solid(footprint,.23,'Mortuary dark brick plinth',brickBase);
 // Continuous cross roof: clip the front slope around the entrance roof's
 // valleys. The entry ridge meets the crossbar at the same ridge height.
 const x0=-half-.2,x1=half+.2,z0=.8,z1=6.2,cz=3.5,y=e+.08,rise=1.6,peak=y+rise;
 const stem=2.08;
 const a=[x0,y,z0],b=[x1,y,z0],c=[x0,peak,cz],d=[x1,peak,cz],l=[-stem,y,z0],rr=[stem,y,z0],join=[0,peak,cz];
 m.surface([[a,c,l],[l,c,join],[rr,join,d],[rr,d,b],[[x0,y,z1],d,c],[[x0,y,z1],[x1,y,z1],d]],slate,'Mortuary crossbar slate roof',true);
 // The unequal slope widths meet on the two visible diagonal valleys.
 m.surface([[[-stem,y,-4.2],l,join],[[-stem,y,-4.2],join,[0,peak,-4.2]],[[stem,y,-4.2],[0,peak,-4.2],join],[[stem,y,-4.2],join,rr]],slate,'Mortuary entrance slate roof',true);
 const gables=m.surface([[[x0,y,z0],[x0,peak,cz],[x0,y,z1]],[[x1,y,z1],[x1,peak,cz],[x1,y,z0]],[[-stem,y,-4.04],[stem,y,-4.04],[0,peak,-4.04]]],brick,'Mortuary brick gables');gables.material=brick.clone();gables.material.side=THREE.DoubleSide;
 m.box(red,0,peak+.035,cz,x1-x0,.14,.15);m.box(red,0,peak+.035,(-4.2+cz)/2,.15,.14,cz+4.2);
 m.opening(0,-4,1.28,2.6,'mortuary');
 for(const x of [-(half+1.9)/2,(half+1.9)/2])m.window(x,1,1.5,1.3,1.99);
 m.window(-half,3.6,1.45,1.3,2,Math.PI/2);m.window(half,3.6,1.45,1.3,2,-Math.PI/2);
 for(const x of [-3.5,3.5]){
  m.solid(rect(x-.42,3.03,x+.42,3.97),2.15,'Mortuary chimney stack',brick,4.35);
  m.box(red,x,6.3,3.5,1.05,.19,1.13);m.box(stone,x,6.49,3.5,1.1,.16,1.18);
  m.box(iron,x,6.585,3.5,.53,.045,.6);
 }
 // A broad, low blue ridge vent matches the tower service buildings' blue
 // roof dormers. Its walls emerge from the host slopes.
 const ventBlue=material(0x739eae),ventFrame=material(0xd5dcd5),ventGlass=material(0x526b70);
 ventGlass.userData.windowGlass=true;
 m.solid(rect(-1.4,2.7,1.4,4.3),1.22,'Mortuary blue ridge vent walls',ventBlue,4.4);
 m.pitched(-1.4,2.7,1.4,4.3,5.62,.28,'Mortuary ridge vent','x',ventBlue);
 for(const side of [-1,1]){
  const vz=3.5+side*.82;
  m.box(recess,0,5.34,vz,2.6,.48,.065);m.box(ventGlass,0,5.34,vz+side*.04,2.5,.4,.045);
  for(const x of [-1.26,-.42,.42,1.26])m.box(ventFrame,x,5.34,vz+side*.08,.045,.44,.065);
  for(const y of [5.12,5.34,5.56])m.box(ventFrame,0,y,vz+side*.08,2.57,.045,.065);
 }
 m.group.userData.ridgeVent={x:0,z:3.5,style:'Tower service blue dormer',top:5.98};
 for(const x of [-half-.17,half+.17]){m.box(iron,x,e,3.5,.12,.13,5.4);m.drain(x,1,e);}
 for(const z of [.8,6.2])for(const side of [-1,1])m.box(iron,side*(half+.2+2.08)/2,e,z,half+.2-2.08,.12,.14);
 for(const x of [-2.08,2.08])m.box(iron,x,e,-1.7,.12,.13,5);
 m.solid(rect(-2.35,-6.4,2.35,-3.9),.12,'Mortuary entrance path',concrete,-.025);
 const pathEnd=(3.6*roadLength+roadDX*(roadA[1]-MORTUARY.z)+roadDZ*(MORTUARY.x-roadA[0]))/(roadDX*Math.cos(MORTUARY.rotation)-roadDZ*Math.sin(MORTUARY.rotation));
 m.solid(rect(-.85,pathEnd,.85,-6.35),.1,'Mortuary path to the lane',concrete,-.025);
 m.group.userData.footprint=footprint;m.finish();
 site.userData.garages=g.group;site.userData.mortuary=m.group;
 return site;
}
