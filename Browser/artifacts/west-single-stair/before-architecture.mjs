import {createInteriorMaterials} from './interior-materials.mjs';
import {createAsylumRoomFinisher,asylumRoomWallMaterials} from './asylum-room-finishes.mjs';
import {basementMuralMaterials} from './basement-mural.mjs';
import {asylumSkirtingGeometry} from './asylum-skirting.mjs';
import {asylumWallShapes,extrudeAsylumWalls} from './asylum-wall-geometry.mjs';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {mergeAsylumMasonry} from './asylum-wall-joins.mjs';
import {segmentDistance,insidePolygon,asylumExitCenter} from './asylum-layout.mjs';
import {asylumWindowCenters,ASYLUM_WINDOW_WIDTH} from './asylum-windows.mjs';
import {roomDoorHandle,ROOM_DOOR_FRAME_CASING_DEPTH,ROOM_DOOR_HINGE_RADIUS} from './asylum-doors.mjs';
import {addAsylumDoorLabels} from './asylum-door-labels.mjs';
import {stairShape,stairOpening,stairConnection,stairFlights,stairLandingPolygons,stairFlightGeometry,handrailGeometry,STAIR_WIDTH,STAIR_SLAB_THICKNESS,RAIL_HEIGHT} from './asylum-stairs.mjs';
const cache=new WeakMap();
export function asylumWallSurfaces(floor){
 const surfaces=[];
 for(const w of floor.walls){const [a,b]=[w.a,w.b],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(length<2)continue;
  const nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  for(let i=0;i<Math.floor(length/2.5);i++){const t=(i+.5)/Math.floor(length/2.5),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
   const normal=floor.outline.loops.some(loop=>insidePolygon(x+nx*.3,z+nz*.3,loop))?1:-1;
   surfaces.push({x:x+nx*.115*normal,z:z+nz*.115*normal,rotation:Math.atan2(nx*normal,nz*normal),dx:-nx*normal,dz:-nz*normal,window:w.exterior||floor.windows?.some(p=>segmentDistance(p.x,p.z,a,b)<.1)});
  }
 }
 return surfaces;
}
export function buildAsylumArchitecture(THREE,scene,floor){
 if(!cache.has(THREE))cache.set(THREE,createInteriorMaterials(THREE,globalThis.document));
 const batches=new Map(),windowFrames=[],ceilingHeight=floor.id===2?2.9:3.8;
 const roomMaterials=asylumRoomWallMaterials(THREE,cache.get(THREE));
 const materials=floor.id===2?basementMuralMaterials(THREE,roomMaterials,ceilingHeight):roomMaterials;
 const roomFinisher=createAsylumRoomFinisher(THREE,floor,ceilingHeight);
 // Continue masonry through the ceiling and the floor above. Stair openings
 // expose the space between those surfaces; stopping at the room ceiling
 // leaves a band below the next storey. The overlap also seals float seams,
 // but stays below the upper floor's .002 surface to avoid raised thresholds.
 const nextElevation=Math.min(...floor.levelElevations.filter(y=>y>floor.elevation));
 const height=Math.max(ceilingHeight+.02,Number.isFinite(nextElevation)?nextElevation-floor.elevation+.001:0);
 const box=(kind,x,y,z,w,h,d,ry=0,rz=0)=>{if(!batches.has(kind))batches.set(kind,[]);batches.get(kind).push([x,y,z,w,h,d,ry,rz]);};
 // Closed slabs retain the walking/ceiling heights and seal the exposed
 // shaft rims. The floor underside is .2 below its storey; the ceiling below
 // meets it exactly, so their vertical reveals neither overlap nor leave a
 // see-through band. Outward caps also remain visible from the reverse side.
 const floorSurface=.002,floorBottom=-.2;
 const ceilingTop=Number.isFinite(nextElevation)?nextElevation-floor.elevation+floorBottom:ceilingHeight+.2;
 function slab(name,y,kind,bottom,top,ceiling=false){
  for(const loop of floor.outline.loops){
   const shape=new THREE.Shape(loop.map(([x,z])=>new THREE.Vector2(x,-z)));
   for(const stair of floor.stairs){
    if(!stair.connections.some(([lower,upper])=>(ceiling?lower:upper)===floor.id))continue;
    const {minX:x0,maxX:x1,minZ:z0,maxZ:z1}=stairOpening(stair);
    if(!insidePolygon((x0+x1)/2,(z0+z1)/2,loop))continue;
    shape.holes.push(new THREE.Path([[x0,z0],[x0,z1],[x1,z1],[x1,z0]].map(([x,z])=>new THREE.Vector2(x,-z))));
   }
   const geometry=new THREE.ExtrudeGeometry(shape,{depth:top-bottom,bevelEnabled:false,steps:1});
   geometry.rotateX(-Math.PI/2);geometry.translate(0,bottom-y,0);
   const mesh=new THREE.Mesh(geometry,materials[kind]);mesh.name=name;mesh.position.y=y;scene.add(mesh);
  }
 }
 slab('Asylum floor',floorSurface,'Floor',floorBottom,floorSurface);
 slab('Asylum ceiling',ceilingHeight,'Ceiling',ceilingHeight,ceilingTop,true);
 const skirting=new THREE.Mesh(asylumSkirtingGeometry(THREE,floor.walls),materials.Skirting);
 skirting.name='Asylum Skirting';scene.add(skirting);
 const masonry=[];
 const wall=(a,b)=>masonry.push({a,b});
 // Explicit schedules cover the basement lining and Reception's upper canted
 // bay. Merge collinear runs so windows can cross sampled wall/lining joins;
 // each opening follows its wall direction, including the 45-degree faces.
 const scheduledWindows=floor.id===2||floor.windowMode==='scheduled';
 const wallRuns=scheduledWindows?mergeAsylumMasonry(floor.walls):floor.walls;
 for(const w of wallRuns){
  const [a,b]=[w.a,w.b],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(scheduledWindows){
   const dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length,angle=-Math.atan2(dz,dx);
   const windows=(floor.windows??[]).filter(p=>segmentDistance(p.x,p.z,a,b)<1e-5).map(p=>({...p,t:(p.x-a[0])*dx+(p.z-a[1])*dz})).sort((p,q)=>p.t-q.t);
   let previous=a;
   for(const p of windows){
    const {x,z,width,height:wh,sill,t}=p,head=sill+wh;
    windowFrames.push({x,z,dx,dz,width,depth:.24,bottom:sill-.035,top:head+.035});
    if(t-width/2<0||t+width/2>length)throw new Error('Scheduled window extends past its wall: '+p.roomId);
    wall(previous,[x-dx*width/2,z-dz*width/2]);
    box('Brick',x,sill/2,z,width,sill,.18,angle);
    box('Plaster',x,(height+head)/2,z,width,height-head,.18,angle);
    box('Glass',x,sill+wh/2,z,width,wh,.04,angle);
    for(const side of [-1,1]){
     box('Sash',x+dx*side*(width/2-.035),sill+wh/2,z+dz*side*(width/2-.035),.07,wh,.24,angle);
     box('Sash',x,sill+(side+1)*wh/2,z,width-.14,.07,.24,angle);
     box('Sash',x+dx*side*width/6,sill+wh/2,z+dz*side*width/6,.025,wh-.07,.16,angle);
    }
    for(let i=1;i<6;i++)box('Sash',x,sill+i*wh/6,z,width-.14,i===3?.055:.025,.20,angle);
    box('Stone',x,sill-.05,z,width+.2,.1,.32,angle);
    previous=[x+dx*width/2,z+dz*width/2];
   }
   wall(previous,b);continue;
  }
  if(!w.exterior||length<3.5){wall(a,b);continue;}
  const dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length,angle=-Math.atan2(dz,dx),width=ASYLUM_WINDOW_WIDTH;
  let previous=a;
  for(const t of asylumWindowCenters(w,floor.walls)){
   const x=a[0]+dx*t,z=a[1]+dz*t,left=[x-dx*width/2,z-dz*width/2],right=[x+dx*width/2,z+dz*width/2];
   wall(previous,left);box('Brick',x,.45,z,width,.9,.18,angle);box('Plaster',x,(height+2.9)/2,z,width,height-2.9,.18,angle);
   box('Glass',x,1.92,z,width,1.92,.05,angle);
   windowFrames.push({x,z,dx,dz,width:width+.08,depth:.24,bottom:.92,top:2.94});
   for(const side of [-1,1])box('Sash',x+dx*side*width/2,1.93,z+dz*side*width/2,.08,2.02,.24,angle);
   box('Sash',x,2.90,z,width-.08,.08,.24,angle);
   box('Sash',x,1.92,z,width,.075,.24,angle);box('Sash',x,1.92,z,.06,1.92,.24,angle);box('Stone',x,.95,z,width+.2,.10,.32,angle);previous=right;
  }
  wall(previous,b);
 }
 // Use the same continuous mitred footprint as the skirting. Square-ended
 // boxes leave a notch on the convex side of every angled wall junction.
 // Union also removes caps and overlapping faces at T/duplicate partitions.
 const wallShapes=asylumWallShapes(THREE,mergeAsylumMasonry(masonry));
 for(const exit of floor.exits){
  const {x,z}=asylumExitCenter(exit),angle=exit.axis==='x'?Math.PI/2:0;
  if(floor.id===0&&exit.id==='D1'){
   // Interior face of the existing front entrance: the same red double door,
   // six dark panels and cream surround, fitted below the reception ceiling.
   box('EntrancePaint',x,1.6,z,1.9,3.2,.18);
   box('EntranceInset',x,1.6,z-.096,.018,3.2,.012);
   for(const u of [-.46,.46])for(const y of [.55,1.55,2.55]){
    box('EntranceInset',x+u,y,z-.108,.65,.72,.036);
    for(const side of [-1,1]){
     box('EntrancePaint',x+u+side*.345,y,z-.135,.04,.80,.035);
     box('EntrancePaint',x+u,y+side*.38,z-.135,.65,.04,.035);
    }
   }
   for(const side of [-1,1]){
    box('EntranceFrame',x+side*1.055,1.8,z-.15,.21,3.6,.6);
    box('Brass',x+side*.12,1.17,z-.16,.045,.28,.075);
   }
   box('EntrancePaint',x,3.23,z,1.9,.06,.18);
   box('Glass',x,3.43,z,1.9,.4,.08);
   box('EntranceFrame',x,3.7,z-.15,2.32,.2,.6);
   continue;
  }
  const panelHeight=exit.wallOpening?.height??2.36;
  box('Panel',x,panelHeight/2,z,1.55,panelHeight,.09,angle);
  // Cover the masonry returns with .015 lateral clearance and meet the
  // lintel's underside without overlapping jamb/head faces.
  for(const side of [-1,1])box('Stone',x+(exit.axis==='z'?side*.835:0),panelHeight/2,z+(exit.axis==='x'?side*.835:0),.12,panelHeight,.22,angle);
  box('Stone',x,2.53,z,1.82,.13,.22,angle);
  box('Brass',x,1.12,z,1.0,.07,.17,angle);
 }
 // Painted timber surrounds borrow the existing green door paint and sash
 // trim. Returns and stepped casings cover both faces without a raised sill.
 for(const door of floor.doorways){
  const {x,z,dx,dz,width,height:head,depth}=door,angle=-Math.atan2(dz,dx);
  const part=(kind,u,y,v,w,h,d)=>box(kind,x+dx*u-dz*v,y,z+dz*u+dx*v,w,h,d,angle);
  part('Plaster',0,(height+head)/2,0,width,height-head,depth);
  for(const side of [-1,1]){
   part('DoorFrame',side*(width/2-.025),(head-.07)/2,0,.09,head-.07,depth+.035);
   for(const face of [-1,1]){
    part('DoorFrame',side*(width/2+.03),(head-.035)/2,face*(depth/2+ROOM_DOOR_FRAME_CASING_DEPTH/2),.20,head-.035,ROOM_DOOR_FRAME_CASING_DEPTH);
    part('Sash',side*(width/2+.115),(head+.165)/2,face*(depth/2+.06),.03,head+.165,.018);
   }
  }
  part('DoorFrame',0,head-.035,0,width,.07,depth+.035);
  for(const face of [-1,1]){
   part('DoorFrame',0,head+.065,face*(depth/2+ROOM_DOOR_FRAME_CASING_DEPTH/2),width+.26,.20,ROOM_DOOR_FRAME_CASING_DEPTH);
   part('Sash',0,head+.18,face*(depth/2+.06),width+.29,.03,.018);
  }
 }
 // Room leaves share the existing green paint and hardware batches. The
 // transforms come from the same fixed poses used by walking/navigation.
 for(const door of floor.roomDoors??[]){
  const {x,z,width,height:h,y,depth,rotation:angle,tx,tz}=door;
  const part=(kind,u,py,v,w,ph,d)=>box(kind,x+tx*u+Math.sin(angle)*v,py,z+tz*u+Math.cos(angle)*v,w,ph,d,angle);
  part('RoomDoor',0,y+h/2,0,width,h,depth);
  // Raised timber panels on both faces, with no competing coplanar faces.
  for(const face of [-1,1])for(const py of [.60,1.75])part('RoomDoor',0,py,face*(depth/2+.004),width-.28,.76,.008);
  const handle=roomDoorHandle(door);
  for(const face of [-1,1]){
   part('Brass',width/2-.18,1.10,face*(depth/2+.012),.07,.18,.024);
  }
  box('Brass',handle.x,1.10,handle.z,.065,.065,handle.depth,angle);
  const hingeFace=-door.hingeSide*door.roomSide,frameAngle=-Math.atan2(door.dz,door.dx);
  for(const py of [.30,1.20,2.12]){
   // One plate is fixed to the casing; the other follows the leaf. Both meet
   // the pin, rather than leaving isolated hinge blocks in front of the frame.
   box('Iron',door.hingeX+door.dx*door.hingeSide*.04+door.dz*door.roomSide*(ROOM_DOOR_HINGE_RADIUS-.002),py,
    door.hingeZ+door.dz*door.hingeSide*.04-door.dx*door.roomSide*(ROOM_DOOR_HINGE_RADIUS-.002),.10,.13,.004,frameAngle);
   part('Iron',-width/2+.04,py,hingeFace*(depth/2+.002),.10,.13,.004);
   box('Iron',door.hingeX,py,door.hingeZ,ROOM_DOOR_HINGE_RADIUS*2,.13,ROOM_DOOR_HINGE_RADIUS*2,frameAngle);
  }
 }
 addAsylumDoorLabels(THREE,scene,floor,box);
 const stairSurfaces=[],stairSolids=[];
 function deck(x,z,w,d,y,landing=false,ry=0){
  if(landing)box('Stone',x,y-STAIR_SLAB_THICKNESS/2,z,w,STAIR_SLAB_THICKNESS,d);
  box('Carpet',x,y+.008,z,w-.08,.012,d-.04,ry);
  stairSurfaces.push({x,z,w,d,ry,y});
 }
 function polygonDeck(points,y){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:STAIR_SLAB_THICKNESS,bevelEnabled:false,steps:1});
  geometry.rotateX(-Math.PI/2);geometry.translate(0,y-STAIR_SLAB_THICKNESS,0);stairSolids.push(geometry);
  const carpet=new THREE.ShapeGeometry(shape);carpet.rotateX(-Math.PI/2);carpet.translate(0,y+.008,0);
  const mesh=new THREE.Mesh(carpet,materials.Carpet);mesh.name='Asylum Carpet';scene.add(mesh);
  stairSurfaces.push({points,y});
 }
 for(const source of floor.stairs)for(const [lower,upper] of source.connections)if(lower===floor.id){
  const stair=stairConnection(source,lower,upper);
  const s=stairShape(stair),rise=floor.levelElevations[upper]-floor.elevation,mid=rise/2,steps=Math.ceil(mid/.18);
  for(const [a,b] of stairFlights(stair,0,rise)){
   stairSolids.push(stairFlightGeometry(THREE,a[0],STAIR_WIDTH,a[2],b[2],a[1],b[1],steps,b[0]));
   const run=Math.hypot(b[0]-a[0],b[2]-a[2]),angle=Math.atan2(b[0]-a[0],b[2]-a[2]);
   for(let i=0;i<steps;i++){
    const t=(i+.5)/steps;
    deck(a[0]+(b[0]-a[0])*t,a[2]+(b[2]-a[2])*t,STAIR_WIDTH,run/steps,a[1]+(i+1)/steps*(b[1]-a[1]),false,angle);
   }
  }
  // Fit the return and arrival edges to the flights, including angled runs.
  const polygons=stairLandingPolygons(stair);
  if(polygons.length){polygonDeck(polygons[0],mid);polygonDeck(polygons[1],rise);}
  else deck((s.minX+s.maxX)/2,s.rear,s.maxX-s.minX,STAIR_WIDTH,mid,true);
 }
 const rails=floor.stairRails,posts=new Set();
 for(const rail of rails)for(let j=1;j<rail.length;j++){
  const a=rail[j-1],b=rail[j],length=Math.hypot(b[0]-a[0],b[2]-a[2]),count=Math.ceil(length/.2);
  for(let i=0;i<=count;i++){
   const t=i/count,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,base=a[1]+(b[1]-a[1])*t,top=base+RAIL_HEIGHT-.035,key=[x,top,z].map(v=>v.toFixed(5)).join(',');
   if(posts.has(key))continue;posts.add(key);
   const support=stairSurfaces.filter(s=>{
    if(Math.abs(s.y-base)>=.2)return false;
    if(s.points)return insidePolygon(x,z,s.points)||s.points.some((p,j)=>segmentDistance(x,z,p,s.points[(j+1)%s.points.length])<.001);
    const dx=x-s.x,dz=z-s.z;
    return Math.abs(dx*Math.cos(s.ry)-dz*Math.sin(s.ry))<=s.w/2+.001&&Math.abs(dx*Math.sin(s.ry)+dz*Math.cos(s.ry))<=s.d/2+.001;
   });
   const bottom=support.length?Math.max(...support.map(s=>s.y)):base;
   const postWidth=i===0||i===count ? .07 : .03;
   box('Iron',x,(bottom+top)/2,z,postWidth,top-bottom,.04);
  }
 }
 const handrails=new THREE.Mesh(handrailGeometry(THREE,rails),materials.Iron);handrails.name='Asylum Handrails';scene.add(handrails);
 const transform=new THREE.Object3D(),geometry=new THREE.BoxGeometry(1,1,1);
 // Keep each finish in one draw call, including the retained window masonry
 // and doorway headers. All vertices remain in building texture coordinates.
 for(const [kind,bottom,top] of [['Brick',0,1.1],['Plaster',1.1,height],['Stone']]){
  const parts=[];
  if(kind==='Stone')parts.push(...stairSolids);
  else if(kind==='Brick')parts.push(extrudeAsylumWalls(THREE,wallShapes,bottom,top));
  else{
   // Unite headers with the adjoining walls at each head height. Separate
   // solids leave hidden caps and overlapping faces at angled jamb returns.
   const headers=floor.exitHeaders??[],levels=[bottom,...new Set(headers.map(w=>w.height)),top].sort((a,b)=>a-b);
   for(let i=1;i<levels.length;i++){
    const lo=levels[i-1],hi=levels[i];
    const runs=mergeAsylumMasonry([...masonry,...headers.filter(w=>w.height<=lo)]);
    parts.push(extrudeAsylumWalls(THREE,asylumWallShapes(THREE,runs),lo,hi));
   }
  }
  for(const [x,y,z,w,h,d,ry,rz] of batches.get(kind)??[]){
   transform.position.set(x,y,z);transform.scale.set(w,h,d);transform.rotation.set(0,ry,rz);transform.updateMatrix();
   parts.push(geometry.toNonIndexed().applyMatrix4(transform.matrix));
  }
  const merged=mergeGeometries(parts),finished=kind==='Stone'?merged:roomFinisher.geometry(merged);
  if(finished!==merged)merged.dispose();
  const mesh=new THREE.Mesh(finished,materials[kind]);mesh.name='Asylum '+kind;scene.add(mesh);
  for(const part of parts)part.dispose();
  batches.delete(kind);
 }
 const dado=new THREE.Mesh(roomFinisher.rail(windowFrames),materials.Dado);dado.name='Asylum Dado';scene.add(dado);
 for(const [kind,items] of batches){const mesh=new THREE.InstancedMesh(geometry,materials[['DoorFrame','RoomDoor'].includes(kind)?'Panel':kind],items.length);mesh.name='Asylum '+kind;
  for(let i=0;i<items.length;i++){const [x,y,z,w,h,d,ry,rz]=items[i];transform.position.set(x,y,z);transform.scale.set(w,h,d);transform.rotation.set(0,ry,rz);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);}
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();scene.add(mesh);
 }
}
