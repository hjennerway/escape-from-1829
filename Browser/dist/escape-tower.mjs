import {TOWER_CLIMB as P,TOWER_FLIGHTS,TOWER_WINDOWS,TOWER_FACES,insideEscapeTower} from './escape-tower-plan.mjs';
import {clipTimelineGeometry} from './estate-timeline.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './aerial-performance.mjs';
import {obstacleContains} from './explore-controls.mjs';
import {WORKSHOP_DOOR_SECONDS} from './tower-workshops.mjs';
import {createTowerWallLamps} from './tower-wall-lamps.mjs';

// A reversible runtime conversion, like the adjoining workshop interior.
// Retain original geometry and batch objects for exact restoration on retry.
export function createEscapeTower(THREE,exterior,walker,progress,{noise=()=>{},creak=()=>{},ambience:playAmbience=()=>{}}={}){
 const source=exterior.waterTower??exterior.model.getObjectByName('Water tower · rear-right clearing');
 if(!source)return null;
 const run=progress.run,resources=new Set(),originals=[],batches=[],replacements=[],solids=[];
 const group=new THREE.Group();group.name='Escape water tower stair and lookout';exterior.model.add(group);
 source.updateWorldMatrix(true,true);
 source.traverse(o=>{if(o.userData.aerialBatch)batches.push([o,o.parent]);else if(o.isMesh)originals.push({o,parent:o.parent,visible:o.visible,batched:o.userData.aerialBatchSource,collision:o.userData.noWalkingCollision});});
 for(const [b] of batches)b.removeFromParent();
 // Clear the interior, entrance and existing slit infill on all four faces.
 const cuts=[
  [P.x-4.65,P.x+4.65,-.05,33.1,P.z-4.65,P.z+4.65],
  [P.x-.74,P.x+.74,-.05,3.43,P.z+4.6,P.z+5.6]
 ];
 const windows=TOWER_WINDOWS.map(w=>{
  const points=[[w.u-w.width/2,w.bottom],[w.u+w.width/2,w.bottom],[w.u+w.width/2,w.spring]];
  if(w.radius)for(let i=1;i<=24;i++){const a=i*Math.PI/24;points.push([w.u+Math.cos(a)*w.radius,w.spring+Math.sin(a)*w.radius]);}
  else points.push([w.u-w.width/2,w.spring]);
  const {ux,uz,nx,nz}=TOWER_FACES[w.side];
  const toFace=new THREE.Matrix4().set(ux,0,uz,-ux*P.x-uz*P.z,0,1,0,0,nx,0,nz,-nx*P.x-nz*P.z,0,0,0,1);
  return {...w,points,toFace};
 });
 function subtract(geometry,matrix,cut){
  if(!geometry.boundingBox)geometry.computeBoundingBox();const b=geometry.boundingBox.clone().applyMatrix4(matrix);
  if(b.max.x<cut[0]||b.min.x>cut[1]||b.max.y<cut[2]||b.min.y>cut[3]||b.max.z<cut[4]||b.min.z>cut[5])return [geometry];
  const parts=[];let rest=geometry;
  for(const [axis,edge,sign] of [['x',cut[0],-1],['x',cut[1],1],['y',cut[2],-1],['y',cut[3],1],['z',cut[4],-1],['z',cut[5],1]]){
   const kept=clipTimelineGeometry(THREE,rest,matrix,edge,sign,axis),next=clipTimelineGeometry(THREE,rest,matrix,edge,-sign,axis,false);
   if(rest!==geometry)rest.dispose();rest=next;
   if(kept.attributes.position.count)parts.push(kept);else kept.dispose();
  }
  rest.dispose();geometry.dispose();return parts;
 }
 function subtractWindow(geometry,matrix,w){
  const local=w.toFace.clone().multiply(matrix);
  if(!geometry.boundingBox)geometry.computeBoundingBox();const b=geometry.boundingBox.clone().applyMatrix4(local);
  if(b.max.z<4.6||b.min.z>5.65||b.max.y<w.bottom||b.min.y>w.spring+w.radius||b.max.x<w.u-w.width/2||b.min.x>w.u+w.width/2)return [geometry];
  // Each edge of the convex arched outline is a clipping plane. This keeps
  // the rounded head and brick rings intact, including the narrow top pair.
  const planes=[new THREE.Matrix4().set(0,0,1,-4.6,0,1,0,0,1,0,0,0,0,0,0,1),new THREE.Matrix4().set(0,0,-1,5.65,0,1,0,0,1,0,0,0,0,0,0,1)];
  for(let i=0;i<w.points.length;i++){
   const [u,y]=w.points[i],[v,h]=w.points[(i+1)%w.points.length],du=v-u,dy=h-y;
   planes.push(new THREE.Matrix4().set(-dy,du,0,dy*u-du*y,0,1,0,0,0,0,1,0,0,0,0,1));
  }
  const parts=[];let rest=geometry;
  for(const plane of planes){
   const transform=plane.multiply(local),kept=clipTimelineGeometry(THREE,rest,transform,0,-1,'x',false),next=clipTimelineGeometry(THREE,rest,transform,0,1);
   if(rest!==geometry)rest.dispose();rest=next;
   if(kept.attributes.position.count)parts.push(kept);else kept.dispose();
  }
  rest.dispose();geometry.dispose();return parts;
 }
 for(const {o,parent} of originals){
  o.removeFromParent();let parts=[o.geometry.clone()];
  for(const cut of cuts)parts=parts.flatMap(g=>subtract(g,o.matrixWorld,cut));
  for(const w of windows)parts=parts.flatMap(g=>subtractWindow(g,o.matrixWorld,w));
  for(const geometry of parts){
   resources.add(geometry);const mesh=o.clone(false);mesh.geometry=geometry;mesh.visible=true;mesh.userData={...o.userData,noWalkingCollision:true};delete mesh.userData.aerialBatchSource;
   parent.add(mesh);replacements.push(mesh);
  }
 }
 batchAerialMeshes(THREE,source);cacheAerialTransforms(source);
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.88,...extra});resources.add(m);return m;};
 const brickSource=originals.find(({o})=>o.name==='Square brick shaft')?.o.material;
 const lining=brickSource?brickSource.clone():material(0x81705d);resources.add(lining);lining.side=THREE.DoubleSide;
 const metal=material(0x454b48,{metalness:.35}),wood=material(0x796044),dark=material(0x222b2b),concrete=material(0x79776c),brass=material(0xb19a65),frame=material(0xbab4a2);
 const lantern=createTowerWallLamps(THREE,resources),landingLamps=[];
 const cube=new THREE.BoxGeometry(1,1,1);resources.add(cube);
 function box(m,size,p,name,{support=false,parent=group}={}){
  const mesh=new THREE.Mesh(cube,m);mesh.name=name;mesh.scale.set(...size);mesh.position.set(...p);mesh.castShadow=mesh.receiveShadow=true;mesh.userData.noWalkingCollision=!support;parent.add(mesh);return mesh;
 }
 function block(x,z,w,d,bottom,top,blocksSight=true){const b={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:bottom,maxY:top,blocksSight};solids.push(b);return b;}
 function point(side,u,y,depth){const {ux,uz,nx,nz}=TOWER_FACES[side];return [P.x+ux*u+nx*depth,y,P.z+uz*u+nz*depth];}
 function masonry(vertices,side,name){
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
  const uv=[],normals=geometry.attributes.normal,{ux,uz,nx,nz}=TOWER_FACES[side];
  for(let i=0;i<vertices.length;i+=3){
   const n=i/3,u=ux*vertices[i]+uz*vertices[i+2],depth=nx*vertices[i]+nz*vertices[i+2],horizontal=Math.abs(normals.getY(n))>.7,front=Math.abs(normals.getX(n)*nx+normals.getZ(n)*nz)>.7;
   uv.push((front||horizontal?u:depth)/4.4,(horizontal?depth:vertices[i+1])/4.4);
  }
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));resources.add(geometry);
  const mesh=new THREE.Mesh(geometry,lining);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;mesh.userData.noWalkingCollision=true;group.add(mesh);return mesh;
 }
 function wall(side,start,end,bottom,top){
  if(end-start<.001||top-bottom<.001)return;
  const vertical=side==='west'||side==='east',[x,,z]=point(side,(start+end)/2,0,4.85);
  const size=vertical?[.4,top-bottom,end-start]:[end-start,top-bottom,.4];
  // Only the room-facing skin belongs to the lining. Box side caps formerly
  // duplicated the jamb/sill returns and flickered inside each opening.
  const a=point(side,start,bottom,4.65),b=point(side,start,top,4.65),c=point(side,end,top,4.65),d=point(side,end,bottom,4.65);
  masonry([...a,...b,...c,...a,...c,...d],side,'Tower interior masonry');
  block(x,z,size[0],size[2],bottom,top);
 }
 // Line the existing windows with real masonry returns. Their arched heads
 // are capped above the curve; no added rectangular frames hide the brickwork.
 for(const side of Object.keys(TOWER_FACES)){
  const holes=windows.filter(w=>w.side===side).map(w=>[w.u-w.width/2,w.u+w.width/2,w.bottom,w.spring+w.radius]);
  if(side==='south')holes.push([-.74,.74,0,3.43]);
  const levels=[...new Set([0,33.1,...holes.flatMap(h=>h.slice(2))])].sort((a,b)=>a-b);
  for(let i=1;i<levels.length;i++){
   const bottom=levels[i-1],top=levels[i],active=holes.filter(h=>h[2]<=bottom&&h[3]>=top).sort((a,b)=>a[0]-b[0]);let start=-4.65;
   for(const h of active){wall(side,start,h[0],bottom,top);start=h[1];}wall(side,start,4.65,bottom,top);
  }
 }
 for(const w of windows){
  const vertices=[],quad=(a,b,c,d)=>vertices.push(...a,...b,...c,...a,...c,...d),at=(u,y,depth)=>point(w.side,u,y,depth);
  for(let i=0;i<w.points.length;i++){
   const [u,y]=w.points[i],[v,h]=w.points[(i+1)%w.points.length];
   quad(at(u,y,4.65),at(u,y,5.475),at(v,h,5.475),at(v,h,4.65));
   if(w.radius&&i>=2&&i<w.points.length-1){
    const top=w.spring+w.radius;
    quad(at(u,y,4.65),at(v,h,4.65),at(v,top,4.65),at(u,top,4.65));
   }
  }
  masonry(vertices,w.side,'Existing tower window masonry return');
  const [x,,z]=point(w.side,w.u,0,4.85),vertical=w.side==='west'||w.side==='east';
  block(x,z,vertical?.4:w.width,vertical?w.width:.4,w.bottom,w.spring+w.radius,false);
 }
 box(concrete,[9.3,.18,9.3],[P.x,P.base-.09,P.z],'Tower ground landing',{support:true});
 box(concrete,[1.45,.18,.9],[P.x,P.base-.09,P.z+5.1],'Tower entrance step',{support:true});
 const rail=(a,b,y0,y1)=>{
  const count=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.36);
  for(let i=0;i<=count;i++){
   const t=i/count,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=y0+(y1-y0)*t;
   box(metal,[.045,1.12,.045],[x,y+.56,z],'Tower stair baluster');
   if(i<count){const t1=(i+1)/count,nx=a.x+(b.x-a.x)*t1,nz=a.z+(b.z-a.z)*t1,ny=y0+(y1-y0)*t1;
    const beam=box(metal,[.055,Math.hypot(nx-x,ny-y,nz-z),.055],[(x+nx)/2,(y+ny)/2+1.1,(z+nz)/2],'Tower stair handrail');beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(nx-x,ny-y,nz-z).normalize());
    block((x+nx)/2,(z+nz)/2,Math.abs(nx-x)+.06,Math.abs(nz-z)+.06,Math.min(y,ny),Math.max(y,ny)+1.25,false);
   }
  }
 };
 const route=[{x:P.x,z:P.z+5.75,y:0},{x:P.x,z:P.z+3.3,y:P.base},{...TOWER_FLIGHTS[0].a,y:P.base}];
 // The ground slab is the first landing. A second slab at the same height
 // caused the flickering square at the foot of the stairs.
 const wallEdge=4.67,treadExtension=wallEdge-P.lane-P.width/2,landingExtension=wallEdge-P.lane-P.landing/2;
 landingLamps.push(lantern(group,{x:P.x+4.63,y:P.base+1.9,z:route[2].z,angle:-Math.PI/2}));
 for(const [i,f] of TOWER_FLIGHTS.entries()){
  const length=6.6-P.landing,step=length/P.steps;
  for(let j=0;j<P.steps;j++){
   const t=P.landing/2+(j+.5)*step-.006,y=f.startY+(j+1)*P.rise/P.steps;
   // Widen only the wall side, preserving the inner handrail and stairwell.
   box(metal,[f.dx?step+.012:P.width+treadExtension,.10,f.dz?step+.012:P.width+treadExtension],[f.a.x+f.dx*t-f.dz*treadExtension/2,y-.05,f.a.z+f.dz*t+f.dx*treadExtension/2],`Tower flight ${i+1} tread ${j+1}`,{support:true});
  }
  const sx=Math.sign(f.b.x-P.x),sz=Math.sign(f.b.z-P.z);
  box(metal,[P.landing+landingExtension,.12,P.landing+landingExtension],[f.b.x+sx*landingExtension/2,f.endY-.06,f.b.z+sz*landingExtension/2],`Tower landing ${i+1}`,{support:true});
  const a={x:f.a.x+f.dx*.95+f.dz*.96,z:f.a.z+f.dz*.95-f.dx*.96},b={x:f.b.x-f.dx*.95+f.dz*.96,z:f.b.z-f.dz*.95-f.dx*.96};
  rail(a,b,f.startY+.17,f.endY);
  // The two flight rails meet at the inner corner. Both landing approaches
  // remain open; a rail across either landing edge would block the turn.
  route.push({...f.b,y:f.endY});
  landingLamps.push(lantern(group,{x:P.x+sx*4.63,y:f.endY+1.9,z:f.b.z,angle:-sx*Math.PI/2}));
 }
 // The final flight occupies the south strip. Its opening stays clear.
 box(wood,[wallEdge*2,.16,wallEdge+2.35],[P.x,P.top-.08,P.z+(2.35-wallEdge)/2],'Tower lookout landing',{support:true});
 rail({x:P.x-4.35,z:P.z+2.35},{x:P.x+2.3,z:P.z+2.35},P.top,P.top);
 box(dark,[5.8,2.4,5.8],[P.x,31.35,P.z],'Overhead water tank');
 for(const x of [-2.85,2.85])box(metal,[.12,2.5,5.9],[P.x+x,31.35,P.z],'Tank reinforcing strap');
 box(metal,[.15,29.7,.15],[P.x+.4,15.05,P.z],'Tower water riser');
 box(brass,[.42,.42,.16],[P.x+.4,1.4,P.z+.1],'Sealed supply fitting');
 block(P.x+.4,P.z,.25,.25,0,30);
 const pivot=new THREE.Group();pivot.name='Freed tower maintenance door';pivot.position.set(P.x+.64,0,P.z+5.38);group.add(pivot);
 const leaf=box(dark,[1.28,3.23,.08],[-.64,1.815,0],'Tower maintenance hatch',{parent:pivot});
 box(brass,[.05,.22,.08],[-1.15,1.8,.06],'Tower hatch handle',{parent:pivot});
 // Full-depth jambs bridge the lining to the original exterior frame. A
 // front rebate overlaps the closed leaf, sealing even oblique sightlines.
 for(const side of [-1,1]){
  box(frame,[.14,3.25,.88],[P.x+side*.72,1.825,P.z+5.03],'Tower hatch jamb');
  block(P.x+side*.72,P.z+5.03,.14,.88,.2,3.45);
  box(frame,[.08,3.25,.04],[P.x+side*.65,1.825,P.z+5.45],'Tower hatch rebate');
 }
 box(frame,[1.58,.08,.88],[P.x,3.48,P.z+5.03],'Tower hatch head');
 box(frame,[1.38,.065,.04],[P.x,3.43,P.z+5.45],'Tower hatch head rebate');
 const retaining=box(wood,[1.65,.13,.1],[P.x,1.35,P.z+5.52],'Tower retaining timber');
 const notice={id:'tower-maintenance',title:'Tower maintenance notice',x:P.x+1.15,z:P.z+5.6,y:P.base};
 const hatch={id:'tower-hatch',title:'Water tower · stiff maintenance hatch',...P.entrance};
 const lookout={id:'tower-lookout',title:'Water tower · west lookout',...P.lookout};
 function sign(text,x,y,z,angle,width){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;const c=canvas.getContext('2d');c.fillStyle='#c8bca0';c.fillRect(0,0,768,384);c.strokeStyle='#625d4b';c.lineWidth=12;c.strokeRect(10,10,748,364);c.fillStyle='#293329';c.textAlign='center';c.font='bold 40px Georgia';text.split('\n').forEach((line,i)=>c.fillText(line,384,80+i*65,720));
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;resources.add(texture);const mat=material(0xffffff,{map:texture}),geometry=new THREE.PlaneGeometry(width,width/2);resources.add(geometry);
  const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.rotation.y=angle;mesh.userData.noWalkingCollision=true;mesh.name=text.split('\n')[0];group.add(mesh);
 }
 sign('TOWER INSPECTION\nFree retaining bar with crowbar\nOil the hinge before opening\nReturn by the same stairs',P.x+1.6,2.05,P.z+5.5,0,1.55);
 sign('WEST LOOKOUT\nNorth gates below\nMast beyond the west path\nListen before descending',P.x-4.59,P.top+.35,P.z,Math.PI/2,1.2);
 // A smaller lantern mounts on the existing slit reveal, keeping its light
 // visible from the grounds without enlarging the historic window opening.
 lantern(group,{x:P.x-5.25,y:28.05,z:P.z+1.085,angle:Math.PI,scale:.55,name:'Tower high inspection lantern'});
 // Crossfade between neighbouring fixtures without moving a lit source.
 // Alternating slots recycle at zero brightness on each landing. Keeping
 // both lights in the scene avoids shader churn and needs no shadow maps.
 const lights=Array.from({length:2},(_,i)=>{const light=new THREE.PointLight(0xffce88,0,12,2);light.name=`Tower landing fill ${i+1}`;group.add(light);return light;});
 let lightLevel=null,lightPresence=0;
 let work=0,knock=0,ambience=0,echo=0,previousY=null,motion=null;
 const note=(id,title,text,point)=>progress.recordGrounds(id,title,text,point);
 function sync({snapDoor=true}={}){if(snapDoor){motion=null;pivot.rotation.y=run.towerHatchOpen?-Math.PI/2:0;}retaining.visible=!run.towerHatchOpen;group.updateMatrixWorld(true);}
 function doorObstacle(){
  // Explicitly refresh descendants: the stationary tower's cached parent
  // transform otherwise leaves the leaf bounds one animation frame behind.
  pivot.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(leaf);
  const corners=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(([x,z])=>{const p=new THREE.Vector3(x,0,z).applyMatrix4(leaf.matrixWorld);return [p.x,p.z];});
  return {minX:bounds.min.x,maxX:bounds.max.x,minZ:bounds.min.z,maxZ:bounds.max.z,minY:bounds.min.y,maxY:bounds.max.y,corners};
 }
 function obstacles(){return [...solids,doorObstacle()];}
 function inspect(n){if(n.id==='tower-maintenance'||n.id==='tower-hatch')note('tower-maintenance','Water tower inspection','A notice beside the tower entrance says the retaining bar needs a crowbar. Oil quiets the stiff hinge. The lamp above marks an inspection lookout; return by the same stairs. The tools are in the adjoining repair workshop and oil store.',notice);}
 function near(actor){
  if(!actor.outside)return null;
  return [hatch,lookout,notice].filter(n=>!(n===hatch&&run.towerHatchOpen)&&Math.abs(actor.y-n.y)<.65&&Math.hypot(actor.x-n.x,actor.z-n.z)<(n===notice?1.45:1.65)).sort((a,b)=>Math.hypot(actor.x-a.x,actor.z-a.z)-Math.hypot(actor.x-b.x,actor.z-b.z))[0];
 }
 function use(n){
  inspect(n);
  if(n===hatch)return run.crowbar?'Hold E to free the retaining bar. Oil will quiet the hinge.':'The retaining bar needs a crowbar. Search the adjoining repair workshop; oil will quiet the hinge.';
  if(n===notice)return 'Maintenance instructions copied. Crowbar in the repair workshop; oil in the parts store.';
  if(n===lookout){run.towerSurveyed=true;note('tower-lookout','View from the tower','From the west lookout I can see the north boundary: the pedestrian gate lies far to the west; the boarded maintenance wicket is nearer, northwest of the tower. Beyond them the perimeter path leads west to the lattice mast. I should watch for security before descending. The same stairs lead back to the workshops.',lookout);return 'The gates and mast are in view. Watch the grounds, then retrace the stairs.';}
 }
 function workOn(n,held,dt){
  if(n!==hatch||!held||!run.crowbar||run.towerHatchOpen){work=knock=0;return null;}
  work+=dt;knock+=dt;
  if(knock>=1){knock=0;creak({id:'tower-bar',opening:true,duration:.35,volume:.055});}
  if(work<3)return null;
  run.towerHatchOpen=true;run.towerHatchOiled=!!run.oil;motion={elapsed:0};sync({snapDoor:false});work=knock=0;
  const heard=noise(P.noise,run.oil?24:280,'tower-hatch');
  creak({id:'tower-hinge',opening:true,duration:WORKSHOP_DOOR_SECONDS,volume:run.oil?.035:.16});
  note('tower-hatch','Tower access opened',run.oil?'I freed the retaining bar and oiled the hinge. The tower entrance opens quietly and stays open.':'I freed the retaining bar. The stiff hinge rang across the yard; security may investigate. The entrance stays open.',hatch);
  return run.oil?'The oiled hatch opens quietly. Follow the landing lamps upwards.':heard?'The hinge rings out. Security is coming towards the tower yard.':'The hinge rings across the yard. Listen for security as you climb.';
 }
 function update(dt,actor){
  let changed=false;
  if(motion&&dt>0){
   const elapsed=Math.min(WORKSHOP_DOOR_SECONDS,motion.elapsed+dt),t=elapsed/WORKSHOP_DOOR_SECONDS,angle=-Math.PI/2*t*t*(3-2*t),previous=pivot.rotation.y;
   const steps=Math.max(1,Math.ceil(Math.abs(angle-previous)/.025));let blocked=false;
   for(let i=1;i<=steps;i++){
    pivot.rotation.y=previous+(angle-previous)*i/steps;const b=doorObstacle();
    if(actor?.outside&&(actor.y??0)<b.maxY&&(actor.y??0)+1.5>b.minY&&obstacleContains(b,actor.x,actor.z,.28)){blocked=true;break;}
   }
   if(blocked){pivot.rotation.y=previous;pivot.updateMatrixWorld(true);}
   else {motion.elapsed=elapsed;changed=angle!==previous;if(t===1)motion=null;}
  }
  const inside=insideEscapeTower(actor);
  if(dt>0){
   // Smooth physical tread-height changes as well as entry/exit. Exponential
   // easing has the same timing at different frame rates and freezes at dt=0.
   lightPresence+=((inside?1:0)-lightPresence)*(1-Math.exp(-dt/.18));
   if(Math.abs(lightPresence-(inside?1:0))<.0001)lightPresence=inside?1:0;
   if(inside){
    const target=Math.max(0,Math.min(P.flights,(actor.y-P.base)/P.rise));
    lightLevel=lightLevel===null?target:lightLevel+(target-lightLevel)*(1-Math.exp(-dt/.12));
   }
   if(lightLevel!==null){
    const floor=Math.min(P.flights-1,Math.floor(lightLevel)),t=lightLevel-floor,blend=t*t*(3-2*t);
    for(let i=0;i<2;i++){
     const light=lights[(floor+i)%2];
     light.position.set(0,.015,.38).applyMatrix4(landingLamps[floor+i].matrixWorld);
     light.intensity=14*lightPresence*(i?blend:1-blend);
    }
   }
   if(!inside&&lightPresence===0)lightLevel=null;
  }
  if(!inside){previousY=null;ambience=echo=0;return changed;}
  ambience+=dt;echo+=dt;
  if(ambience>4.6){ambience=0;playAmbience('drip');}
  if(previousY!==null&&Math.abs(actor.y-previousY)>.025&&echo>.65){echo=0;playAmbience('step');}
  previousY=actor.y;
  return changed;
 }
 sync();group.updateMatrixWorld(true);batchAerialMeshes(THREE,group,{exclude:[pivot,retaining]});cacheAerialTransforms(group);pivot.matrixAutoUpdate=true;for(const light of lights)light.matrixAutoUpdate=true;walker.refresh();exterior.invalidateShadows();
 return {group,nodes:[notice,hatch,lookout],route,solids,obstacles,near,inspect,use,workOn,sync,update,get work(){return work},
  areaAt:actor=>insideEscapeTower(actor)?actor.y>P.top-.5?'Water tower lookout':'Water tower stairs':null,
  dispose(){
   group.removeFromParent();group.traverse(o=>{if(o.userData.aerialBatch)o.geometry.dispose();});const current=[];source.traverse(o=>{if(o.userData.aerialBatch)current.push(o);});for(const b of current){b.removeFromParent();b.geometry.dispose();}
   for(const o of replacements)o.removeFromParent();for(const {o,parent,visible,batched,collision} of originals){parent.add(o);o.visible=visible;if(batched===undefined)delete o.userData.aerialBatchSource;else o.userData.aerialBatchSource=batched;if(collision===undefined)delete o.userData.noWalkingCollision;else o.userData.noWalkingCollision=collision;}
   for(const [b,parent] of batches)parent.add(b);cacheAerialTransforms(source);for(const r of resources)r.dispose();walker.refresh();exterior.invalidateShadows();
  }
 };
}
