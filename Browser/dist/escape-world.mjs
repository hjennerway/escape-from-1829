import {visible,walkable,path} from './core.mjs';
import {insidePolygon,segmentDistance,stairRoute} from './asylum-layout.mjs';
import {furnitureContains} from './furniture-collision.mjs';
import {STAIR_WIDTH,RAIL_HEIGHT} from './asylum-stairs.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './aerial-performance.mjs';

export function createEscapeLandmark(THREE,exterior){
 // The night backdrop is dated 1916, which hides the modern mast. A scenario
 // copy makes the requested endpoint visible without altering timeline inputs.
 const source=exterior.mast;if(!source)throw Error('Escape radio mast model is missing');
 const landmark=source.clone(true),batches=[];landmark.name='Escape radio mast landmark';
 landmark.traverse(o=>{if(o.userData.aerialBatch)batches.push(o);o.visible=true;o.matrixAutoUpdate=true;delete o.userData.aerialBatchSource;delete o.userData.estateSection;});
 for(const batch of batches)batch.removeFromParent();
 const footing=new THREE.Mesh(new THREE.BoxGeometry(6,.25,6),new THREE.MeshStandardMaterial({color:0x626359,roughness:1}));footing.position.y=.125;footing.castShadow=true;footing.receiveShadow=true;landmark.add(footing);
 exterior.model.add(landmark);batchAerialMeshes(THREE,landmark);cacheAerialTransforms(exterior.scene);exterior.invalidateShadows();
 return landmark;
}

// Scenario fittings belong to Escape only. Explore retains the reviewed building.
export function createEscapeWorld(THREE,floors,groups,progress,{reducedMotion=false}={}){
 const nodes=[],gates=[];
 const metal=new THREE.MeshStandardMaterial({color:0x35443c,roughness:.8});
 const brass=new THREE.MeshStandardMaterial({color:0xb79a57,metalness:.65,roughness:.35,emissive:0x6b4315,emissiveIntensity:.32});
 const wood=new THREE.MeshStandardMaterial({color:0x55412c,roughness:.85});
 const glowMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{color:{value:new THREE.Color(0xffd071)},strength:{value:1}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 color; uniform float strength; varying vec2 vUv; void main(){float d=length((vUv-.5)*2.0);float soft=1.0-smoothstep(.15,1.0,d);float ring=smoothstep(.45,.55,d)*(1.0-smoothstep(.60,.78,d));gl_FragColor=vec4(color,strength*(.7*soft+.35*ring));}'});
 // A small camera-facing glow remains visible when desk papers are viewed
 // almost edge-on. Depth testing keeps it behind walls and furniture.
 const pixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5);pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=Math.round(255*Math.pow(Math.max(0,1-r),2));}
 const glowTexture=new THREE.DataTexture(pixels,64,64);glowTexture.needsUpdate=true;glowTexture.magFilter=THREE.LinearFilter;
 const beaconMaterial=new THREE.SpriteMaterial({map:glowTexture,color:0xffcf70,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
 function box(parent,size,position,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);mesh.position.set(...position);parent.add(mesh);return mesh;}
 function glow(parent,width,height,z=-.015){const halo=new THREE.Mesh(new THREE.PlaneGeometry(width+.9,height+.9),glowMaterial);halo.name='Warm interaction glow';halo.position.z=z;parent.add(halo);return halo;}
 function text(parent,title,body,width=1.2,height=.8,{y:mountY=1.35,twoSided=true,paper=false}={}){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;const c=canvas.getContext('2d');
  c.fillStyle='#ded0ae';c.fillRect(0,0,768,512);c.fillStyle='#2a302b';c.textAlign='center';c.font='bold 36px Georgia';
  c.fillText(title,384,66,720);c.font='28px Georgia';
  const words=body.split(' ');let line='',y=126;
  for(const word of words){if((line+' '+word).length>38){c.fillText(line,384,y,710);line=word;y+=42;}else line+=(line?' ':'')+word;}
  if(line)c.fillText(line,384,y,710);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  // Each side has its own outward-facing print; a double-sided plane mirrors
  // the lettering from behind. The board also keeps grille bars out of the text.
  box(parent,[width,height,paper?.012:.04],[0,mountY,0],paper?wood:metal);
  const material=new THREE.MeshBasicMaterial({map:texture});
  for(const side of twoSided?[1,-1]:[1]){
   const plane=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
   plane.name='Printed escape notice';plane.position.set(0,mountY,side*(paper?.007:.021));if(side<0)plane.rotation.y=Math.PI;parent.add(plane);
  }
 }
 function anchor(floorIndex,roomId,{separate=false}={}){
  const floor=floors[floorIndex],room=floor.rooms.find(r=>r.id===roomId);
  if(!room)throw Error('Missing escape room '+roomId);
  const candidates=[];
  const minX=Math.min(...room.points.map(p=>p[0])),maxX=Math.max(...room.points.map(p=>p[0])),minZ=Math.min(...room.points.map(p=>p[1])),maxZ=Math.max(...room.points.map(p=>p[1]));
  for(let z=Math.ceil(minZ*2)/2;z<=maxZ;z+=.5)for(let x=Math.ceil(minX*2)/2;x<=maxX;x+=.5)
   if(insidePolygon(x,z,room.points)&&walkable(floor,x,z,.5)&&(!separate||nodes.every(n=>n.floor!==floorIndex||Math.hypot(x-n.x,z-n.z)>2.5)))candidates.push({x,z,d:Math.hypot(x-room.label[0],z-room.label[1])});
  candidates.sort((a,b)=>a.d-b.d);if(!candidates.length)throw Error('No clear escape interaction in '+roomId);
  return candidates[0];
 }
 const approachOrigins=new Map();
 function approach(floor,mount,room){
  const candidates=[];
  for(const radius of [1.15,1.5,1.85])for(let i=0;i<24;i++){
   const angle=mount.rotation+i*Math.PI/12,x=Math.round((mount.x+Math.sin(angle)*radius)*2)/2,z=Math.round((mount.z+Math.cos(angle)*radius)*2)/2;
   if(Math.hypot(x-mount.x,z-mount.z)<2.05&&insidePolygon(x,z,room.points)&&walkable(floor,x,z,.5)&&visible(floor,{x,z},{x:mount.x,z:mount.z}))candidates.push({x,z,score:radius+(1-Math.cos(angle-mount.rotation))*.6});
  }
  const originId=floor.id+':'+room.id;
  if(!approachOrigins.has(originId))approachOrigins.set(originId,room.id==='Reception'?{x:0,z:17.5}:anchor(floor.id,room.id));
  const origin=approachOrigins.get(originId);
  candidates.sort((a,b)=>a.score-b.score);return candidates.find(p=>Math.hypot(p.x-origin.x,p.z-origin.z)<.01||path(floor,origin,p).length);
 }
 function wallMount(floor,room,width){
  const candidates=[];
  // Use the actual cut masonry runs, avoiding openings, windows, parked doors
  // and furniture. The small backing beds against the room-facing wall skin.
  for(const wall of floor.walls.filter(w=>!w.exterior)){
   const [a,b]=[wall.a,wall.b],length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
   for(let t=width/2+.15;t<length-width/2-.15;t+=.4)for(const side of [-1,1]){
    const nx=-dz*side,nz=dx*side,x=a[0]+dx*t+nx*.13,z=a[1]+dz*t+nz*.13;
    if(![-width/2,0,width/2].every(u=>insidePolygon(x+dx*u,z+dz*u,room.points)))continue;
    if((floor.windows??[]).some(p=>segmentDistance(p.x,p.z,a,b)<.15&&Math.hypot(p.x-x+nx*.13,p.z-z+nz*.13)<(p.width??1.4)/2+width/2+.20))continue;
    if(![.55,1.1].every(d=>[-width/2,0,width/2].every(u=>walkable(floor,x+nx*d+dx*u,z+nz*d+dz*u,.25))))continue;
    const mount={x,z,y:1.4,rotation:Math.atan2(nx,nz),kind:'wall',wall};
    candidates.push({...mount,score:Math.hypot(x-room.label[0],z-room.label[1])});
   }
  }
  candidates.sort((a,b)=>a.score-b.score);
  for(const mount of candidates){const standing=approach(floor,mount,room);if(standing)return {...mount,standing};}
  throw Error('No supported escape fitting in '+room.id);
 }
 function deskMount(floor,room,{reception=false}={}){
  const desk=floor.furniture?.find(i=>i.roomId===room.id&&i.kind===(reception?'receptionDesk':'table'));if(!desk)return null;
  const c=Math.cos(desk.rotation),s=Math.sin(desk.rotation);
  for(const u of reception?[-.76]:[.46,-.46,0]){
   const v=reception?.29:.32,x=desk.x+c*u+s*v,z=desk.z-s*u+c*v;
   // Papers/key lie within the tabletop and clear its existing loose books.
   if(!reception&&(floor.furniture??[]).some(i=>i.supportId===desk.id&&[-.34,-.17,0,.17,.34,.50].some(a=>[-.20,0,.20].some(b=>furnitureContains(i,x+c*a+s*b,z-s*a+c*b,.004)))))continue;
   const mount={x,z,y:desk.y+desk.height+.008,rotation:desk.rotation,kind:'desk',supportId:desk.id};
   const standing=approach(floor,mount,room);if(standing)return {...mount,standing};
  }
  return null;
 }
 function modelKey(parent,position,rotation=0){
  const key=new THREE.Group();key.name='Takeable brass key';key.position.set(...position);key.rotation.z=rotation;
  key.add(new THREE.Mesh(new THREE.TorusGeometry(.042,.009,8,20),brass));
  box(key,[.015,.16,.018],[0,-.111,0],brass);
  for(const [x,y] of [[.022,-.165],[.022,-.19]])box(key,[.045,.017,.022],[x,y,0],brass);
  parent.add(key);return key;
 }
 function node(id,title,body,floorIndex,roomId){
  const floor=floors[floorIndex],room=id==='reclaim'?floor.furnishingAreas.find(r=>r.id==='Reception'):floor.rooms.find(r=>r.id===roomId);
  const mount=(['memo','plan','release-note','office-index','reclaim'].includes(id)?deskMount(floor,room,{reception:id==='reclaim'}):null)??wallMount(floor,room,id==='staff-key'?.34:1.0);
  const group=new THREE.Group();group.name='Escape fitting · '+id;group.position.set(mount.x,mount.y,mount.z);group.rotation.y=mount.rotation;
  const face=new THREE.Group();if(mount.kind==='desk')face.rotation.x=-Math.PI/2;group.add(face);
  let key,handle,halo,tray,keys;
  if(id==='staff-key'){
   box(face,[.30,.40,.04],[0,-.065,0],wood);
   box(face,[.013,.025,.09],[0,.045,.025],brass);box(face,[.013,.035,.013],[0,.055,.064],brass);
   key=modelKey(face,[0,0,.053]);halo=glow(face,.30,.40);halo.position.y=-.065;
  }else if(id==='reclaim'){
   tray=new THREE.Group();tray.name='Reception property tray';group.add(tray);
   // Rims meet the base top; overlapping their flush outer faces z-fights.
   const baseHeight=.014,rimHeight=.0415,rimY=(baseHeight+rimHeight)/2;
   box(tray,[.50,baseHeight,.28],[0,0,0],wood);
   for(const x of [-.244,.244])box(tray,[.012,rimHeight,.28],[x,rimY,0],brass);
   for(const z of [-.134,.134])box(tray,[.476,rimHeight,.012],[0,rimY,z],brass);
   keys=new THREE.Group();keys.name='Confiscated keys';keys.rotation.x=-Math.PI/2;keys.position.y=.018;tray.add(keys);
   modelKey(keys,[-.11,.06,0],-.5);modelKey(keys,[.10,.05,0],.6);key=keys;
   halo=glow(face,.50,.28);halo.position.z=.006;
  }else{
   text(face,title,body,mount.kind==='desk'?.68:1,mount.kind==='desk'?.40:.68,{y:id==='release'?.20:0,twoSided:false,paper:mount.kind==='desk'});
   halo=glow(face,mount.kind==='desk'?.68:1,mount.kind==='desk'?.40:.68);
   if(mount.kind==='desk')halo.position.z=.002;
   if(id==='plan'){
    key=modelKey(face,[.43,.08,mount.kind==='desk'?.003:.06],-.35);
    if(mount.kind==='wall')box(face,[.009,.022,.065],[.43,.124,.043],brass);
   }
   if(id==='release'){
    halo.position.y=.20;box(face,[.14,.40,.10],[0,-.40,.015],metal);
    box(face,[.055,.055,.04],[0,-.40,.073],brass);handle=box(face,[.035,.25,.04],[0,-.40,.095],brass);
   }
  }
  groups[floorIndex].add(group);nodes.push({id,title,floor:floorIndex,x:mount.standing.x,z:mount.standing.z,group,roomId:room.id,mount,key,handle,halo,tray});
 }
 const run=progress.run;
 node('memo','STAFF MEMORANDUM',`Offices above the wards use a stair key. Key kept in room ${progress.roomNumber(0,run.keyRoom)}, beside Reception. Basement maintenance notice records the safety release.`,0,'R26');
 node('staff-key','STAFF STAIR KEY','Stair key · return to this rack after use. Upper offices only.',0,run.keyRoom);
 node('reclaim','PROPERTY TRAY','',0,'Reception');
 node('release-note','MAINTENANCE NOTICE',`Upper staff grilles S1 and S5 share the basement safety release. Control in room ${progress.roomNumber(2,'B4')}. Outside-door locks are separate.`,2,'B3');
 node('release','STAFF SAFETY RELEASE',`Release both upper gates. Porter’s record and brass outside key: second floor, room ${progress.roomNumber(3,run.office)}, ${run.office==='R41'?'above Reception':'beside the Library'}.`,2,'B4');
 node('plan','PORTER’S SERVICE RECORD',`Tonight: ${run.variant} outer entrance. Other outside doors bolted. Brass key attached. Perimeter path continues northwest to the lattice mast.`,3,run.office);
 // An upstairs landing notice makes either record location discoverable in-world.
 node('office-index','OFFICE FILING',`Porter’s route record filed in ${run.office==='R41'?'Records':'Librarian'} office · room ${progress.roomNumber(3,run.office)}, second floor. Stair key does not fit outside doors.`,1,'R26');
 for(const n of nodes){const beacon=new THREE.Sprite(beaconMaterial);beacon.name='Available interaction beacon';beacon.position.set(0,n.mount.kind==='desk'?.48:.60,.14);beacon.scale.set(.48,.70,1);n.group.add(beacon);n.beacon=beacon;}
 for(const stair of floors[1].stairs.filter(s=>s.connections.some(([a,b])=>a===1&&b===3))){
  const route=stairRoute(stair,floors[1].elevation,floors[3].elevation,1,3),a=route[0],b=route[1];
  const length=Math.hypot(b[0]-a[0],b[2]-a[2]),dx=(b[0]-a[0])/length,dz=(b[2]-a[2])/length;
  // Fit the gate to the actual flight mouth, on the level landing just before
  // the first riser. Its posts share the stair edges and join the banisters.
  const setback=.08,x=b[0]-dx*setback,z=b[2]-dz*setback,y=a[1],height=2.35;
  const group=new THREE.Group();group.name='Staff stair gate '+stair.id;
  group.position.set(x,y-floors[1].elevation,z);group.rotation.y=Math.atan2(dx,dz);
  const frame=new THREE.Group();frame.name='Fixed stair gate frame';group.add(frame);
  const half=STAIR_WIDTH/2;
  function pin(parent,radius,length,position,mat=metal){
   const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,8),mat);mesh.position.set(...position);parent.add(mesh);return mesh;
  }
  for(const side of [-1,1]){
   const edge=side*half;
   // Foot plates bed into the landing; anchor heads and collars show how the
   // upright is fixed. The short rail return meets the existing flight rail.
   box(frame,[.16,.035,.2],[edge,.006,0],metal);
   box(frame,[.09,height,.09],[edge,height/2,0],metal);
   box(frame,[.12,.045,.12],[edge,.075,0],metal);
   box(frame,[.07,.07,setback+.07],[edge,RAIL_HEIGHT,setback/2],metal);
   for(const offset of [-.057,.057])pin(frame,.012,.018,[edge,.032,offset],brass);
  }
  box(frame,[STAIR_WIDTH+.09,.075,.09],[0,height-.0375,0],metal);
  const leaf=new THREE.Group();leaf.name='Staff stair grille leaf';group.add(leaf);
  const leafWidth=STAIR_WIDTH-.14,bottom=.07,top=height-.11;
  for(const side of [-1,1])box(leaf,[.055,top-bottom,.055],[side*(leafWidth/2-.0275),(top+bottom)/2,0],metal);
  for(const level of [bottom+.03,RAIL_HEIGHT,top-.03])box(leaf,[leafWidth,.06,.055],[0,level,0],metal);
  for(let k=-4;k<=4;k++)pin(leaf,.013,top-bottom-.06,[k*.12,(top+bottom)/2,0]);
  // Three hinge knuckles bridge the small working gap between post and leaf.
  for(const level of [.35,1.15,2.02]){
   pin(frame,.025,.14,[-half+.045,level,-.055]);
   box(frame,[.085,.09,.035],[-half+.015,level,-.055],metal);
   box(leaf,[.13,.065,.04],[-leafWidth/2+.04,level,-.043],metal);
  }
  box(frame,[.055,.17,.1],[half-.025,1.3,-.015],metal);
  box(leaf,[.12,.18,.085],[leafWidth/2-.06,1.3,-.01],metal);
  box(leaf,[.16,.028,.028],[leafWidth/2-.09,1.3,-.064],brass);
  text(leaf,'STAFF OFFICES',`Stair key required. Porter’s record + brass outside key: second-floor room ${progress.roomNumber(3,run.office)}, ${run.office==='R41'?'above Reception':'beside the Library'}.`,.72,.32);
  for(const sx of [-.32,.32])for(const sy of [1.23,1.47]){
   const rivet=pin(leaf,.011,.012,[sx,sy,-.043],brass);rivet.rotation.x=Math.PI/2;
  }
  groups[1].add(group);
  gates.push({id:stair.id,x,z,y,dx,dz,height,group,leaf});
 }
 function near(actor){
  if(actor.outside)return null;
  const floor=floors[actor.floor];
  const found=nodes.filter(n=>n.floor===actor.floor&&n.group.visible&&(n.id!=='staff-key'||n.key.visible)&&Math.hypot(actor.x-n.mount.x,actor.z-n.mount.z)<2.1&&visible(floor,actor,{x:n.mount.x,z:n.mount.z,y:floor.elevation+n.mount.y-1.5}));
  found.sort((a,b)=>Math.hypot(actor.x-a.mount.x,actor.z-a.mount.z)-Math.hypot(actor.x-b.mount.x,actor.z-b.mount.z));
  const gate=gates.find(g=>!progress.run.opened.has(g.id)&&Math.hypot(actor.x-g.x,actor.z-g.z)<1.8&&Math.abs((actor.x-g.x)*-g.dz+(actor.z-g.z)*g.dx)<1.2&&Math.abs(actor.y-g.y)<1);
  return gate?{id:'gate:'+gate.id,title:'Staff offices · locked upper grille',gate}:found[0];
 }
 function allowMove(actor,next){
  return gates.every(g=>{
   if(progress.run.opened.has(g.id)||next.y+1.8<g.y||next.y>g.y+g.height)return true;
   const side=p=>(p.x-g.x)*g.dx+(p.z-g.z)*g.dz;
   const a=side(actor),b=side(next);
   if(a*b>0&&Math.abs(b)>.35)return true;
   const t=a===b?1:Math.max(0,Math.min(1,a/(a-b))),x=actor.x+(next.x-actor.x)*t,z=actor.z+(next.z-actor.z)*t;
   return Math.abs((x-g.x)*-g.dz+(z-g.z)*g.dx)>.95;
  });
 }
 function sync(){for(const g of gates)g.leaf.visible=!run.opened.has(g.id);for(const n of nodes){if(n.key)n.key.visible=n.id==='staff-key'?!run.staffKey:n.id==='reclaim'?run.confiscated.size>0:!run.serviceKey;const active=n.key?n.key.visible:n.id==='release'?!(run.opened.has('S1')&&run.opened.has('S5')):!progress.has(n.id);n.halo.visible=n.beacon.visible=active;if(n.id==='reclaim'){n.key.children[0].visible=run.confiscated.has('staffKey');n.key.children[1].visible=run.confiscated.has('serviceKey');}if(n.handle)n.handle.rotation.z=run.opened.has('S5')?Math.PI/2:0;}}
 function update(time){const pulse=reducedMotion?1:.90+.18*Math.sin(time*Math.PI*2/2.8);glowMaterial.uniforms.strength.value=pulse;beaconMaterial.opacity=.85*pulse;for(const n of nodes)n.beacon.scale.set(.48*pulse,.70*pulse,1);}
 sync();return {nodes,gates,near,allowMove,sync,update,anchor,dispose(){const geometries=new Set(),materials=new Set([metal,brass,wood,glowMaterial,beaconMaterial]),textures=new Set([glowTexture]);for(const o of [...nodes.map(n=>n.group),...gates.map(g=>g.group)]){o.removeFromParent();o.traverse(m=>{if(m.isMesh&&m.geometry)geometries.add(m.geometry);if(m.material){materials.add(m.material);if(m.material.map)textures.add(m.material.map);}});}for(const g of geometries)g.dispose();for(const t of textures)t.dispose();for(const m of materials)m.dispose();}};
}

// Grid routing uses the active outdoor collision model, including visible trees.
const navigationCaches=new WeakMap();
export function outdoorPath(walker,from,to){
 const minX=-132,minZ=-127,width=260,height=222;
 const cell=p=>[Math.round(p.x-minX),Math.round(p.z-minZ)],start=cell(from),end=cell(to);
 if([...start,...end].some(n=>!Number.isFinite(n)))return [];
 const valid=([x,z])=>x>=0&&z>=0&&x<width&&z<height;
 if(!valid(start)||!valid(end))return [];
 const key=([x,z])=>z*width+x,begin=key(start),finish=key(end),previous=new Map([[begin,-1]]),distance=new Map([[begin,0]]);
 let cache=navigationCaches.get(walker);if(!cache||cache.revision!==walker.revision){cache={revision:walker.revision,edges:new Map()};navigationCaches.set(walker,cache);}
 const queue=[];
 function push(entry){let i=queue.length;queue.push(entry);while(i){const p=(i-1)>>1;if(queue[p].cost<=entry.cost)break;queue[i]=queue[p];i=p;}queue[i]=entry;}
 function pop(){const first=queue[0],last=queue.pop();if(queue.length){let i=0;while(i*2+1<queue.length){let j=i*2+1;if(j+1<queue.length&&queue[j+1].cost<queue[j].cost)j++;if(queue[j].cost>=last.cost)break;queue[i]=queue[j];i=j;}queue[i]=last;}return first;}
 push({n:begin,cost:0,travel:0});let examined=0;
 while(queue.length&&examined++<40000){
  const {n,travel}=pop();if(travel!==distance.get(n))continue;if(n===finish)break;
  const x=n%width,z=Math.floor(n/width);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const next=[x+dx,z+dz];if(!valid(next))continue;const j=key(next),cost=distance.get(n)+1;
   if(cost>=(distance.get(j)??Infinity))continue;
   const edge=Math.min(j,n)*width*height+Math.max(j,n);
   if(!cache.edges.has(edge))cache.edges.set(edge,[0,.25,.5,.75,1].every(t=>walker.clear(minX+x+dx*t,minZ+z+dz*t,0)));
   if(!cache.edges.get(edge))continue;
   previous.set(j,n);distance.set(j,cost);push({n:j,travel:cost,cost:cost+Math.abs(next[0]-end[0])+Math.abs(next[1]-end[1])});
  }
 }
 if(!previous.has(finish))return [];
 const route=[];for(let n=finish;n!==begin;n=previous.get(n))route.push({x:minX+n%width,z:minZ+Math.floor(n/width)});
 return route.reverse();
}
