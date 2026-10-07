import {GROUNDS_OUTLINE,GROUNDS_GATES} from './escape-grounds-state.mjs';
import {createTowerWorkshops,TOWER_WORKSHOPS,WORKSHOP_DOOR_SECONDS} from './tower-workshops.mjs';
import {createMaintenanceProps} from './maintenance-props.mjs';
import {asylumSignTexture,asylumSignGeometry} from './asylum-sign-paint.mjs';

// Runtime fittings and an accessible workshop interior for the Escape scenario.
export function createEscapeGrounds(THREE,exterior,walker,progress,{noise=()=>{},creak=()=>{}}={}){
 const group=new THREE.Group();group.name='Escape grounds boundary and tool store';
 const run=progress.run,solids=[],buckets=new Map(),gates={},resources=new Set();
 const colors={hedge:0x344b32,leaf:0x40583a,brick:0x665046,stone:0xa09780,iron:0x424d45,wood:0x76604a,slate:0x424746,brass:0xb5a369};
 const materials=Object.fromEntries(Object.entries(colors).map(([key,color])=>[key,new THREE.MeshStandardMaterial({color,roughness:.88})]));
 const cube=new THREE.BoxGeometry(1,1,1),matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3();resources.add(cube);
 const props=createMaintenanceProps(THREE,resources);
 const workshops=createTowerWorkshops(THREE,exterior,walker,resources,sign);solids.push(...workshops.solids);
 const obstacle=(x,z,w,d,h=3.4,blocksSight=true,minY=0)=>({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY,maxY:minY+h,blocksSight});
 function box(kind,size,position,{parent=null,angle=0,name=''}={}){
  if(parent){const m=new THREE.Mesh(cube,materials[kind]);m.scale.set(...size);m.position.set(...position);m.rotation.y=angle;m.name=name;m.castShadow=m.receiveShadow=true;m.userData.noWalkingCollision=true;parent.add(m);return m;}
  if(!buckets.has(kind))buckets.set(kind,[]);q.setFromAxisAngle(new THREE.Vector3(0,1,0),angle);matrix.compose(v.set(...position),q,new THREE.Vector3(...size));buckets.get(kind).push(matrix.clone());
 }
 function panel(a,b,kind){
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,angle=-Math.atan2(dz,dx),thick=kind==='hedge'?1.25:.32;
  const nx=-dz/length*thick/2,nz=dx/length*thick/2,corners=[[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]];
  solids.push({...obstacle(x,z,Math.abs(dx)+thick,Math.abs(dz)+thick,3.4,kind==='hedge'),corners});
  if(kind==='hedge'){
   box('hedge',[length,3.4,thick],[x,1.7,z],{angle});
   // Overlapping low-poly foliage softens the outline; the dense core is visible.
   for(let i=0;i<Math.ceil(length/.8);i++){
    const t=(i+.5)/Math.ceil(length/.8);box('leaf',[.75,.24,.9],[a[0]+dx*t,3.35+(i%3)*.03,a[1]+dz*t],{angle});
   }
  }else{
   if(kind!=='gate'){box('brick',[length,.48,.42],[x,.24,z],{angle});box('stone',[length,.1,.46],[x,.53,z],{angle});}
   for(const y of [kind==='gate'?.65:1.15,2.8])box('iron',[length,.075,.09],[x,y,z],{angle});
   const count=Math.ceil(length/.22);for(let i=0;i<=count;i++){const t=i/count;box('iron',[.045,kind==='gate'?3.3:2.85,.06],[a[0]+dx*t,kind==='gate'?1.7:1.96,a[1]+dz*t],{angle});}
  }
 }
 // Split at solid building walls and the two openings. Iron panels fit the
 // physical footprint; thick hedges keep clearance beside corridor walls.
 for(let side=0;side<GROUNDS_OUTLINE.length;side++){
  const a=GROUNDS_OUTLINE[side],b=GROUNDS_OUTLINE[(side+1)%GROUNDS_OUTLINE.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.ceil(length/.4);
  const kind=a[1]===-85&&b[1]===-85||a[0]===144&&b[0]===144?'iron':'hedge',wallPadding=kind==='iron'?0:.27;
  let start=null;
  const point=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  for(let i=0;i<=steps;i++){
   const p=point((i+.5)/steps),gate=Object.values(GROUNDS_GATES).some(g=>Math.abs(p[1]-g.z)<.01&&Math.abs(p[0]-g.x)<g.width/2+.2);
   const building=i<steps&&[0,.2,.4].every(offset=>{const s=point((i+offset/.4)/steps);return !walker.clearPermanent(s[0],s[1],0,wallPadding)&&!walker.clearPermanent(s[0],s[1],2,wallPadding);});
   const draw=i<steps&&!gate&&!building;
   if(draw&&start===null)start=i;
   if(!draw&&start!==null){
    const from=point(start/steps),to=point(i/steps);
    if(a[1]===66&&b[1]===66&&from[0]>4&&to[0]<-4){panel(from,[4,66],'hedge');panel([4,66],[-4,66],'gate');panel([-4,66],to,'hedge');}
    else panel(from,to,kind);
    start=null;
   }
  }
 }
 for(const x of [-4,4]){box('brick',[.5,3.6,.6],[x,1.8,66]);box('stone',[.6,.16,.7],[x,3.68,66]);solids.push(obstacle(x,66,.5,.6,3.76));}
 box('iron',[.12,3.3,.14],[0,1.7,66]);box('brass',[.4,.12,.14],[.1,1.35,65.88]);
 sign('NIGHT GATE · LOCKED\nPedestrian gate: west path',0,2.35,65.75,Math.PI,2.4);
 function sign(text,x,y,z,angle=0,width=1.5,{fontSize=30,centered=false,aged=false}={}){
  if(aged){
   const texture=asylumSignTexture(THREE,text.split('\n'),{name:text+' door sign'});resources.add(texture);
   const mat=new THREE.MeshStandardMaterial({map:texture,roughness:.94});resources.add(mat);
   const geometry=asylumSignGeometry(THREE,width,width*320/1024,.008);resources.add(geometry);
   const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.rotation.y=angle;m.userData.noWalkingCollision=true;group.add(m);return m;
  }
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#d8ceb3';c.fillRect(0,0,512,256);c.strokeStyle='#776c56';c.lineWidth=12;c.strokeRect(8,8,496,240);c.fillStyle='#29382c';c.textAlign='center';c.font=`bold ${fontSize}px Georgia`;const lines=text.split('\n');if(centered)c.textBaseline='middle';lines.forEach((line,i)=>c.fillText(line,256,centered?128+(i-(lines.length-1)/2)*fontSize:64+i*48,470));
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;resources.add(texture);
  const mat=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});resources.add(mat);const geometry=new THREE.PlaneGeometry(width,width/2);resources.add(geometry);const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.rotation.y=angle;m.userData.noWalkingCollision=true;group.add(m);return m;
 }
 for(const [id,g] of Object.entries(GROUNDS_GATES)){
  for(const x of [g.x-g.width/2-.2,g.x+g.width/2+.2]){box('brick',[.42,3.65,.58],[x,1.825,g.z]);box('stone',[.52,.16,.68],[x,3.73,g.z]);solids.push(obstacle(x,g.z,.42,.58,3.81));}
  const pivot=new THREE.Group();pivot.name=id+' boundary gate';pivot.position.set(g.x-g.width/2,0,g.z);group.add(pivot);
  const w=g.width;
  for(const y of [.65,1.45,3.1])box('iron',[w,.11,.12],[w/2,y,0],{parent:pivot});
  for(let x=.09;x<w;x+=.18)box('iron',[.055,3.3,.065],[x,1.7,0],{parent:pivot});
  box('brass',[.24,.1,.15],[w-.2,1.35,.12],{parent:pivot});
  const boards=new THREE.Group();boards.name='Wicket retaining boards';pivot.add(boards);
  if(id==='wicket')props.wicket(pivot,boards,w);
  gates[id]={...g,pivot,boards};
  const notice=sign(id==='pedestrian'?'PEDESTRIAN GATE\nPlease close quietly':'MAINTENANCE WICKET\nBoards need prising off',w/2,id==='pedestrian'?2.45:2.05,.23,0,id==='pedestrian'?1.5:1.6);pivot.add(notice);
 }
 const crowbar=props.crowbar(),oil=props.oilCan();
 oil.rotation.y=Math.PI/2;
 for(const [id,object] of [['crowbar',crowbar],['oil',oil]]){const p=TOWER_WORKSHOPS.tools[id];object.position.set(p.x,p.y,p.z);group.add(object);}
 for(const [kind,matrices] of buckets){const mesh=new THREE.InstancedMesh(cube,materials[kind],matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.name='Escape '+kind+' fittings';mesh.castShadow=mesh.receiveShadow=true;mesh.userData.noWalkingCollision=true;group.add(mesh);}
 exterior.model.add(group);group.updateMatrixWorld(true);
 // Batch repeated bars within each moving leaf, retaining independent hinges.
 for(const parent of [crowbar,oil,...Object.values(gates).flatMap(g=>[g.pivot,g.boards])]){
  for(const mat of Object.values(materials)){
   const meshes=parent.children.filter(m=>m.isMesh&&m.geometry===cube&&m.material===mat);if(meshes.length<2)continue;
   const batch=new THREE.InstancedMesh(cube,mat,meshes.length);batch.name='Escape moving fittings';batch.userData.noWalkingCollision=true;batch.castShadow=batch.receiveShadow=true;
   meshes.forEach((m,i)=>{m.updateMatrix();batch.setMatrixAt(i,m.matrix);parent.remove(m);});parent.add(batch);
  }
 }
 const nodes=[...Object.entries(TOWER_WORKSHOPS.tools).map(([id,p])=>({id,title:id==='crowbar'?'Crowbar':'Oil can',x:p.approachX,z:p.z,y:p.y})),...workshops.roomDoors.map(({id,title,x,z,y})=>({id,title,x,z,y})),...workshops.lockedDoors,{id:'tower-door',title:'Tower workshops · access door',x:TOWER_WORKSHOPS.entrance.x-.95,z:TOWER_WORKSHOPS.entrance.z,y:1.35},{id:'night-gate',title:'Locked carriage gate',x:0,z:64.5,y:1.35},...Object.entries(GROUNDS_GATES).map(([id,g])=>({id,title:id==='pedestrian'?'Pedestrian gate':'Boarded maintenance wicket',...g,y:1.35}))];
 let work=0,working=null,knock=0;
 const note=(id,title,text,point)=>progress.recordGrounds(id,title,text,point);
 function sync({snapDoors=true}={}){
  crowbar.visible=!run.crowbar;oil.visible=!run.oil;
  if(snapDoors)workshops.sync(!!run.towerOpen,run.workshopDoors);
  const blocks=[...solids,workshops.doorObstacle(),...workshops.roomDoorObstacles()];
  for(const [id,g] of Object.entries(gates)){
   const open=run[id+'Open'];g.pivot.rotation.y=open?-Math.PI/2:0;g.boards.visible=id==='wicket'&&!open;
   blocks.push(open?obstacle(g.x-g.width/2,g.z+g.width/2,.15,g.width,3.4,false):obstacle(g.x,g.z,g.width,.24,3.4,id==='wicket'));
  }
  group.updateMatrixWorld(true);walker.setObstacles(blocks);exterior.invalidateShadows();
 }
 function near(actor){
  if(!actor.outside)return null;
  return nodes.filter(n=>(n.id!=='crowbar'||!run.crowbar)&&(n.id!=='oil'||!run.oil)&&(!gates[n.id]||!run[n.id+'Open'])&&Math.hypot(actor.x-(n.id==='tower-door'?TOWER_WORKSHOPS.entrance.x:n.x),actor.z-n.z)<1.85&&Math.abs((actor.y??0))<.7&&(['crowbar','oil'].includes(n.id)?[.2,.4,.6,.8].every(t=>walker.clearSight(actor.x+(n.x-actor.x)*t,actor.z+(n.z-actor.z)*t,.8)):true)).sort((a,b)=>Math.hypot(actor.x-a.x,actor.z-a.z)-Math.hypot(actor.x-b.x,actor.z-b.z))[0];
 }
 const isDoor=n=>n&&(n.id==='tower-door'||n.id.startsWith('workshop-door:'));
 function action(n){return isDoor(n)?workshops.isOpen(n.id)?'CLOSE':'OPEN':'USE';}
 function inspect(n){
  if(gates[n.id]&&run[n.id+'Open'])return;
  if(n.id==='night-gate')note(n.id,n.title,'The carriage gate is locked for the night. Its notice directs pedestrians along the west perimeter path to the north gate.',n);
  if(n.id==='pedestrian')note(n.id,n.title,'The pedestrian gate is unlatched, but its hinges squeak. I can watch the patrol and slip through; oil would quiet the hinges.',n);
  if(n.id==='wicket')note(n.id,n.title,'Boards hold this maintenance wicket closed. A crowbar could prise them off. The work would be noisy. Tools are inside the water tower workshops to the east. Use the blue stores door beside the tower.',n);
 }
 function use(n){
  inspect(n);
  if(n.id.startsWith('corridor-lock:'))return 'These double doors are locked. This section is closed.';
  if(isDoor(n)){
   const open=!workshops.isOpen(n.id);
   if(n.id==='tower-door'){run.towerOpen=open;if(open)note(n.id,'Tower workshops','I opened the blue stores door beside the water tower. The connecting corridor leads to a repair workshop, an oil and parts store, and a machine workshop.',n);}
   else {run.workshopDoors??={};run.workshopDoors[n.id]=open;}
   workshops.setDoorOpen(n.id,open);creak({id:n.id,opening:open,duration:WORKSHOP_DOOR_SECONDS});
   return n.title+(open?' opens.':' closes.');
  }
  if(n.id==='night-gate')return 'Locked for the night. Follow the west path to the pedestrian gate, or investigate the maintenance wicket.';
  if(n.id==='crowbar'||n.id==='oil'){
   run[n.id]=true;note(n.id,n.title,n.id==='crowbar'?'I took a crowbar from the repair bench inside the water tower workshops. It can remove the boards from the north maintenance wicket.':'I took an oil can from the oil and parts store inside the water tower workshops. It can quiet the pedestrian gate.',n);sync({snapDoors:false});return n.id==='crowbar'?'Crowbar taken. The boarded wicket is along the north boundary.':'Oil can taken. It will quiet the pedestrian gate.';
  }
  if(n.id==='pedestrian'){
   run.pedestrianOpen=true;if(!run.oil)noise({x:n.x,z:n.z+1},48,'squeak');
   note(n.id,n.title,run.oil?'I oiled the hinges and opened the pedestrian gate quietly.':'I opened the pedestrian gate. Its squeaking hinges may attract the guard.',n);sync({snapDoors:false});return run.oil?'Hinges oiled. The gate opens quietly.':'The gate squeaks open. Keep an eye on the guard.';
  }
  return run.crowbar?'Hold E to prise off the boards.':'These boards need a crowbar. Enter the blue stores door beside the water tower.';
 }
 function workOn(n,held,dt){
  if(n?.id!=='wicket'||!held||!run.crowbar||run.wicketOpen){work=0;working=null;knock=0;return null;}
  if(working!==n.id){working=n.id;noise({x:n.x,z:n.z+1},65,'pry');}
  work+=dt;knock+=dt;if(knock>=1){knock=0;noise({x:n.x,z:n.z+1},65,'pry');}
  if(work<3)return null;
  run.wicketOpen=true;note(n.id,'Maintenance wicket opened','I prised off the boards and opened the wicket. It remains open, even if I am caught.',n);sync({snapDoors:false});work=0;working=null;return 'The boards come free. The maintenance wicket is open.';
 }
 sync();
 return {group,nodes,gates,solids,workshops,near,inspect,use,action,workOn,sync,update(dt,actor){if(workshops.update(dt,actor))sync({snapDoors:false});},get work(){return work},dispose(){walker.setObstacles([]);group.removeFromParent();workshops.dispose();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const r of resources)r.dispose();for(const m of Object.values(materials))m.dispose();exterior.invalidateShadows();}};
}
