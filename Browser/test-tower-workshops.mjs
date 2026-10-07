import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './dist/aerial-performance.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {createEscapeGrounds} from './dist/escape-grounds.mjs';
import {outdoorPath} from './dist/escape-world.mjs';
import {WORKSHOP_GALLERY} from './dist/workshop-gallery.mjs';
import {TOWER_WORKSHOPS} from './dist/tower-workshops.mjs';
import {ESCAPE_CORRIDOR_RUNS,ESCAPE_CORRIDOR_DOORS} from './dist/escape-corridor-plan.mjs';
import {relativeArrow} from './dist/escape-corridors.mjs';
import {ROOM_DOOR_WIDTH} from './dist/asylum-layout.mjs';
import {WORKSHOP_DOOR_HEIGHT} from './dist/workshop-door-dimensions.mjs';
import {MAIN_KITCHEN} from './dist/main-kitchen.mjs';
import {ROOM_DOOR_THICKNESS} from './dist/asylum-doors.mjs';
import {auditCorridorJoins,auditDoorHeaderJoins} from './test-support/escape-corridor-join-probes.mjs';
const {westX,westShift,entrance}=TOWER_WORKSHOPS;
const corridorX=(WORKSHOP_GALLERY.minX+WORKSHOP_GALLERY.maxX)/2;
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);
batchAerialMeshes(THREE,exterior.model);cacheAerialTransforms(exterior.scene);
const walker=createAsylumOutside(THREE,exterior);
function snapshot(root=exterior.model){
 const rows=[];root.traverse(o=>{if(!o.isMesh)return;const hash=createHash('sha256');for(const a of [...Object.values(o.geometry.attributes),o.geometry.index,o.instanceMatrix].filter(Boolean))hash.update(new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength));
  rows.push({id:o.uuid,parent:o.parent.uuid,visible:o.visible,source:!!o.userData.aerialBatchSource,geometry:o.geometry.uuid,hash:hash.digest('hex'),matrix:o.matrix.toArray(),material:[o.material].flat().map(m=>m.uuid)});});return rows.sort((a,b)=>a.id.localeCompare(b.id));
}
const original=snapshot(),roof=exterior.model.getObjectByName('Low west stores south flat return');
const shadowStates=new Map(),materialHooks=new Map(),sceneBeforeRender=exterior.scene.onBeforeRender;
exterior.model.traverse(o=>{if(o.isMesh)shadowStates.set(o,o.castShadow);for(const m of [o.material].flat())if(m)materialHooks.set(m,[m.onBeforeCompile,m.customProgramCacheKey]);});
const tower=exterior.model.getObjectByName('Water tower · rear-right clearing'),originalTower=snapshot(tower);
function visibleHit(root,origin,direction){const meshes=[];root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});return new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,10).intersectObjects(meshes,false)[0];}
const towerViews=[];
for(const y of [.15,1.65,3,4.9]){
 for(const x of [146.7,147.1,148,149.2,150,151.5,152.8])towerViews.push({origin:[x,y,-46.6],direction:[0,0,-1]});
 for(const z of [-59.5,-58.5,-56,-52])towerViews.push({origin:[156.3,y,z],direction:[-1,0,0]});
}
for(const view of towerViews){view.hit=visibleHit(tower,view.origin,view.direction);assert(view.hit,'Original tower surface exists');}
const roofGeometry=roof.geometry,roofMatrix=roof.matrix.toArray();
for(let attempt=0;attempt<2;attempt++){
 const resourcesBefore=exterior.model.children.length,run={},world=createEscapeGrounds(THREE,exterior,walker,{run,recordGrounds(){}});
 assert.deepEqual(snapshot(tower),originalTower,'Interior retains the exact exterior tower meshes, materials, batches and transforms');
 // The marked wicket-side railing must meet actual masonry. A convex hull of
 // the clipped concave ward used to omit 17 m of rail and block the empty lawn.
 assert(walker.clearPermanent(105,-85,0)&&walker.clearPermanent(105,-85,2),'Hale western court remains open after corridor shell clipping');
 assert(walker.clear(105,-83.5),'Player can approach the extended rail across the visible lawn');
 const wallMeshes=[];exterior.haleWard.traverseVisible(o=>{if(o.isMesh)wallMeshes.push(o);});
 const wallHit=new THREE.Raycaster(new THREE.Vector3(90,2.8,-85),new THREE.Vector3(1,0,0),0,40).intersectObjects(wallMeshes,false)[0];
 assert(wallHit,'Visible ward wall anchors the north fence');
 const fenceMatrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(),quaternion=new THREE.Quaternion();let railEnd=-Infinity;
 world.group.getObjectByName('Escape iron fittings').traverse(o=>{if(!o.isInstancedMesh)return;for(let i=0;i<o.count;i++){
  o.getMatrixAt(i,fenceMatrix);fenceMatrix.decompose(position,quaternion,scale);
  if(Math.abs(position.z+85)<.001&&Math.abs(position.y-2.8)<.001&&position.x>87&&scale.x>1)railEnd=Math.max(railEnd,position.x+scale.x/2);
 }});
 assert(railEnd>=wallHit.point.x-.01&&railEnd<wallHit.point.x+.41,'Railing meets visible wall without running through the ward: '+JSON.stringify({railEnd,wallX:wallHit.point.x}));
 assert(walker.clearPermanent(wallHit.point.x-.1,-85,0,0)&&!walker.clearPermanent(wallHit.point.x-.1,-85,0),'Fence fitting excludes player clearance padding');
 for(let x=89;x<wallHit.point.x;x+=.1)for(const y of [0,1.69])assert(!walker.clear(x,-85,y),'Extended rail blocks walking and jumping at '+x);
 // Survey the reported ceiling stripe, partition ends and south return in
 // the actual rebuilt batches. Only the exterior masonry may own this face.
 const facadeMeshes=[];exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isMesh)facadeMeshes.push(o);});
 const joins=auditCorridorJoins(THREE,exterior.model,world.workshops.group);
 assert(joins.corners>=14&&joins.probes>=560,'Survey every connected corridor corner');
 assert.equal(joins.failures.length,0,'Joined painted walls and skirting: '+JSON.stringify(joins.failures.slice(0,8)));
 const headers=auditDoorHeaderJoins(THREE,exterior.model,world.workshops.group);
 assert.equal(headers.probes,432,'Both header ends at all nine locked pairs');
 assert.equal(headers.failures.length,0,'Continuous side walls beside door headers: '+JSON.stringify(headers.failures.slice(0,8)));
 // The diagonal branch must finish inside the gallery rather than making a
 // triangular recess in its east wall. Check the actual rebuilt surfaces.
 for(const z of [-119.6,-119.2,-118.8,-118.4,-118,-117.6,-117.2,-116.8])for(const y of [.11,.35,1.05,3.3,4.9]){
  const hit=visibleHit(exterior.model,[corridorX,y,z],[1,0,0]),depth=y<.18?.3325:.2875;
  assert(hit&&Math.abs(hit.point.x-(WORKSHOP_GALLERY.maxX-depth))<1e-5,'Straight Farndon wall and skirting at '+JSON.stringify({z,y,name:hit?.object.name,point:hit?.point.toArray()}));
  assert(!walker.clear(WORKSHOP_GALLERY.maxX-.12,z),'Walking obstacles follow the straight Farndon wall');
 }
 // The kitchen's low eave crosses the oil-store/gallery join. Exterior trim
 // must stop behind the finished wall, including its fascia and hip flashing.
 for(const z of [-26.61,-26.59,-26.57,-26.53,-26.45,-26.35])for(const y of [4.65,4.72,4.78,4.84,4.9,5]){
  const hit=new THREE.Raycaster(new THREE.Vector3(corridorX,y,z),new THREE.Vector3(-1,0,0),0,2).intersectObjects(facadeMeshes,false)[0];
  assert(hit&&Math.abs(hit.point.x-(WORKSHOP_GALLERY.minX+.2875))<1e-5,'Kitchen roof trim stays behind the finished corridor wall: '+JSON.stringify({z,y,name:hit?.object.name,point:hit?.point.toArray()}));
 }
 let facadeProbes=0;
 function facadeProbe(z,y){const hits=new THREE.Raycaster(new THREE.Vector3(westX-.01,y,z),new THREE.Vector3(1,0,0),0,.04).intersectObjects(facadeMeshes,false);
  assert.equal(hits.length,1,'One exterior brick/plinth face without a coplanar interior edge at '+JSON.stringify({z,y,hits:hits.map(h=>({name:h.object.name,x:h.point.x}))}));
  assert(Math.abs(hits[0].point.x-westX)<1e-5,'West facade follows the purple junction guide');facadeProbes++;
 }
 for(const z of [-49.4,-48.3,-45.9,-43.55,-43.45,-41.55,-40.7,-38.6,-36.35,-33.1,-29.8,-27.9,-26.96,-26.85,-26.72])for(const y of [.02,1,5.07,5.11,6,8])facadeProbe(z,y);
 for(const z of [-43.55,-43.45,-36.3,-26.96,-26.85])for(const y of [2,3,4])facadeProbe(z,y);
 assert.equal(facadeProbes,105);
 // The lawn lies below the authored floor level. Inspect the actual rebuilt
 // facade below zero, where an ungrounded replacement leaves a visible gap.
 for(const z of [-49.4,-48.3,-45.9,-43.55,-43.45,-41.55,-40.7,-38.6,-36.35,-33.1,-29.8,-27.9,-26.96,-26.85,-26.72])for(const y of [exterior.terrain.position.y+.02,-.02,.58,.62])facadeProbe(z,y);
 // The kitchen's north wall must continue up to the workshop's west face.
 // Room-shell clearance must not cut a visible strip out of this junction.
 for(const offset of [.3,.2,.1,.01])for(const y of [exterior.terrain.position.y+.02,.2,.7,1.65,3.8,4.5]){
  const x=westX-offset,hits=new THREE.Raycaster(new THREE.Vector3(x,y,MAIN_KITCHEN.minZ-.4),new THREE.Vector3(0,0,1),0,.6).intersectObjects(facadeMeshes,false);
  assert.equal(hits.length,1,'Continuous kitchen wall/plinth beside the workshop at '+JSON.stringify({x,y,hits:hits.map(h=>h.object.name)}));
  assert(Math.abs(hits[0].point.z-MAIN_KITCHEN.minZ)<1e-5,'Kitchen north facade retains its plane');
  assert(!walker.clear(x,MAIN_KITCHEN.minZ+.3),'Kitchen junction remains solid for walking');
 }
 // Sample texture coordinates from rendered batches on either side of each
 // window cut. A panel-local restart produces a jump in the brick pattern.
 for(const z of [-47,-42.5,-37,-31.5])for(const edge of [z-.625,z+.625])for(const y of [1.2,5.2]){
  const hits=[edge-.015,edge+.015].map(at=>new THREE.Raycaster(new THREE.Vector3(westX-.01,y,at),new THREE.Vector3(1,0,0),0,.04).intersectObjects(facadeMeshes,false)[0]);
  assert(hits.every(h=>h?.uv),'Brick texture is present beside the window cut');
  assert(Math.abs(hits[0].uv.x-hits[1].uv.x)<.02&&Math.abs(hits[0].uv.y-hits[1].uv.y)<1e-5,'Rendered brick courses and joints continue across the window cut at '+JSON.stringify({edge,y,uv:hits.map(h=>h.uv.toArray())}));
 }
 const threshold=new THREE.Box3().setFromObject(exterior.model.getObjectByName('Tower-side stores threshold'));
 assert(Math.abs(threshold.min.y-(exterior.terrain.position.y-.03))<1e-5&&Math.abs(threshold.max.y-.14)<1e-5,'Entrance threshold meets the lawn while retaining its walking height');
 const thresholdHit=visibleHit(exterior.model,[westX-.6,exterior.terrain.position.y+.02,-44.75],[1,0,0]);
 assert(thresholdHit&&Math.abs(thresholdHit.point.x-threshold.min.x)<1e-5,'Grounded entrance threshold closes the gap beneath the doorway');
 // The door's short west facade retains four rectangular sashes. The former
 // two small arched apertures must be closed with brick and interior lining.
 for(const z of [-39.75,-34.25])for(const y of [1.9,2.45]){
  facadeProbe(z,y);
  const hit=visibleHit(exterior.model,[westX+.8,y,z],[-1,0,0]);assert(Math.abs(hit.point.x-(westX+.2875))<1e-5,'Continuous painted lining behind former west arch');
 }
 const skirtingMaterials=new Set();world.workshops.group.traverse(o=>{if(o.isMesh&&/skirting/.test(o.name))skirtingMaterials.add(o.material);});
 for(const view of towerViews){const hit=visibleHit(exterior.model,view.origin,view.direction);
  if(view.origin[1]<.18&&skirtingMaterials.has(hit?.object.material)){
   assert(view.hit.point.distanceTo(hit.point)<.31,'New tower skirting follows the retained plinth and projecting arch sill');
  }else {assert(hit?.object===view.hit.object,'Room must expose the actual tower above skirting: '+JSON.stringify({origin:view.origin,expected:view.hit.object.name,actual:hit?.object.name,point:hit?.point}));assert(hit.point.distanceTo(view.hit.point)<1e-6);}
 }
 assert(Math.abs(WORKSHOP_GALLERY.minX+.2875-153.205)<1e-6,'Finished west wall meets the tower corner face');
 assert(walker.clear(corridorX,-55.2)&&!walker.clear(153.1,-55.2),'Corridor runs against the original tower wall');
 const door=world.nodes.find(n=>n.id==='tower-door'),crowbar=world.nodes.find(n=>n.id==='crowbar'),oil=world.nodes.find(n=>n.id==='oil');
 assert(Math.abs(westX-145.4)<1e-6,'Purple guide moves the facade 0.9 units west');
 assert(Math.abs(world.workshops.pivot.position.x-entrance.x)<1e-6,'Door hinge moves with facade');
 assert(Math.abs(door.x-(entrance.x-.95))<1e-6,'Door interaction stays outside the moved leaf');
 for(const z of [-49,-40,-33,-27]){
  const roofHit=new THREE.Raycaster(new THREE.Vector3(westX+.4,12,z),new THREE.Vector3(0,-1,0),0,5).intersectObjects(facadeMeshes,false)[0];
  assert(roofHit,'Flat roof extends over the moved west wall');
  assert(Math.abs(roofHit.point.y-8.84)<.17,'Roof deck retains its height');
 }
 assert.equal(outdoorPath(walker,{x:145+westShift,z:-45},crowbar).length,0,'Closed stores door excludes both workshops');
 world.use(door);assert(run.towerOpen);assert(!walker.clear(westX,-44.75),'Opening starts with the leaf still closed');world.update(1);assert(walker.clear(westX,-44.75));
 const actor={x:145+westShift,y:0,z:-45,outside:true};
 function walk(to){const route=outdoorPath(walker,actor,to);assert(route.length,'Connected route '+JSON.stringify(to));for(const p of route){for(let i=0;i<60&&Math.hypot(actor.x-p.x,actor.z-p.z)>.04;i++){const dx=p.x-actor.x,dz=p.z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.06,d);walker.update(actor,dx/d*step,dz/d*step,.02);}assert(Math.hypot(actor.x-p.x,actor.z-p.z)<.05,'Physical doorway clearance');}}
 walk({x:corridorX,z:-44.75});assert.equal(outdoorPath(walker,actor,crowbar).length,0,'Closed repair door blocks the tool room');
 for(const [id,target] of [['repair',crowbar],['oil-store',oil],['machine',{x:164,z:-48}]]){
  const room=TOWER_WORKSHOPS.rooms.find(r=>r.id===id),approach={x:room.door[0]+(id==='machine'?-1:1),z:room.door[1]};
  walk(approach);const node=world.nodes.find(n=>n.id==='workshop-door:'+id),record=world.workshops.roomDoors.find(d=>d.id===node.id),plaque=record.pivot.getObjectByName(record.title.replace(' door','')+' door sign');
  assert(plaque&&plaque.parent===record.pivot&&!plaque.userData.aerialBatchSource,'Sign stays attached to moving room door');
  const before=plaque.getWorldPosition(new THREE.Vector3());assert(!walker.clear(node.x,node.z),'Closed room leaf blocks walking');assert.equal(world.near(actor).id,node.id);world.use(node);world.update(1,actor);assert(walker.clear(node.x,node.z),'Opened room leaf clears its doorway');assert(plaque.getWorldPosition(new THREE.Vector3()).distanceTo(before)>.5,'Sign moves with door');
  walk(target);if(id==='repair'){assert.equal(world.workshops.areaAt(actor),'Repair workshop');world.use(crowbar);assert(!world.group.getObjectByName('Takeable crowbar').visible);}if(id==='oil-store'){assert.equal(world.workshops.areaAt(actor),'Oil and parts store');world.use(oil);}
 }
 assert.equal(world.workshops.areaAt(actor),'Machine workshop');
 walk({x:corridorX,z:WORKSHOP_GALLERY.minZ+1});walk({x:corridorX,z:WORKSHOP_GALLERY.maxZ-1});
 for(let z=WORKSHOP_GALLERY.minZ+1;z<WORKSHOP_GALLERY.maxZ-1;z+=.2)assert(walker.clear(corridorX,z),'Full gallery obstructed at '+z);
 assert(!walker.clear(corridorX,WORKSHOP_GALLERY.minZ)&&!walker.clear(corridorX,WORKSHOP_GALLERY.maxZ),'Gallery ends remain enclosed');
 for(const run of ESCAPE_CORRIDOR_RUNS){const length=Math.hypot(run.end[0]-run.start[0],run.end[1]-run.start[1]);
  for(let t=1;t<length-1;t+=.4)assert(walker.clear(run.start[0]+(run.end[0]-run.start[0])*t/length,run.start[1]+(run.end[1]-run.start[1])*t/length),'Continuous '+run.name);
  walk({x:run.end[0]+(run.start[0]-run.end[0])/length,z:run.end[1]+(run.start[1]-run.end[1])/length});
 }
 assert.equal(ESCAPE_CORRIDOR_DOORS.filter(d=>d.marked).length,6,'All six yellow stopping lines');
 for(const d of world.workshops.lockedDoors){walk(d);assert(!walker.clear(...d.point)&&!walker.clear(...d.point,1.69),'Doors block walking and jumping');assert.match(world.use(d),/locked/);}
 assert.equal(world.workshops.group.userData.directionSigns.length,9,'All nine red X locations');
 assert.equal(relativeArrow([0,-1],[0,-1]),'↑');assert.equal(relativeArrow([0,-1],[-1,0]),'←');assert.equal(relativeArrow([0,-1],[1,0]),'→');
 assert.equal(relativeArrow([0,1],[0,-1]),'↓');
 // Inspect authored surfaces, including hidden originals represented in batches.
 const workshop=world.workshops,authored=[];workshop.group.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch)authored.push(o);});
 assert(Math.abs(WORKSHOP_GALLERY.ceiling-.05-5.05)<1e-9,'All corridor ceilings meet the marked workshop wall top');
 const shadowMeshes=[];exterior.model.getObjectByName('Workshop cached static shadow geometry').traverseVisible(o=>{if(o.isMesh)shadowMeshes.push(o);});
 for(const run of ESCAPE_CORRIDOR_RUNS){
  const p=run.start.map((n,i)=>(n+run.end[i])/2),ray=new THREE.Raycaster(new THREE.Vector3(p[0],4.6,p[1]),new THREE.Vector3(0,1,0),0,1);
  const hit=ray.intersectObject(workshop.group.getObjectByName('Connected escape corridor ceiling'),false)[0];assert(hit&&Math.abs(hit.point.y-5.05)<1e-5,'Level ceiling across '+run.id);
  const blocked=[];for(const mesh of shadowMeshes){const side=mesh.material.side;mesh.material.side=THREE.DoubleSide;THREE.Mesh.prototype.raycast.call(mesh,ray,blocked);mesh.material.side=side;}
  assert(blocked.some(h=>Math.abs(h.point.y-5.05)<1e-5),'Joined ceiling blocks sky light in '+run.id);
 }
 exterior.model.traverseVisible(o=>{if(o.isMesh&&o.parent.userData.centerline&&/slate roof.*outside accessible gallery/.test(o.name))assert(new THREE.Box3().setFromObject(o).min.y>5.1,'Retained low corridor roof skirts follow the raised ceiling');});
 for(const leaf of authored.filter(o=>o.name==='Workshop room door leaf')){
  leaf.geometry.computeBoundingBox();const size=leaf.geometry.boundingBox.getSize(new THREE.Vector3()).multiply(leaf.scale);
  assert(Math.abs(size.y-WORKSHOP_DOOR_HEIGHT)<1e-6&&Math.abs(size.x-ROOM_DOOR_THICKNESS)<1e-6&&Math.abs(size.z-(ROOM_DOOR_WIDTH-.16))<1e-6,'Workshop leaves match the stores entrance height');
 }
 for(const d of workshop.lockedDoors){
  const parent=workshop.group.children.find(o=>o.name===d.title&&Math.hypot(o.position.x-d.point[0],o.position.z-d.point[1])<1e-5),leaves=parent.children.filter(o=>o.name==='Locked corridor door leaf');
  const bounds=leaves.map(o=>{o.geometry.computeBoundingBox();o.updateMatrix();return o.geometry.boundingBox.clone().applyMatrix4(o.matrix);}).sort((a,b)=>a.min.x-b.min.x);
  assert(bounds.every(b=>Math.abs(b.max.y-b.min.y-WORKSHOP_DOOR_HEIGHT)<1e-6&&Math.abs(b.max.y-3.7)<1e-6),'Every double door matches the blue entrance height');
  assert(Math.abs(bounds[0].max.x)<1e-9&&Math.abs(bounds[1].min.x)<1e-9,'Double leaves meet exactly at the centre');
  for(const side of [-1,1]){
   const origin=parent.localToWorld(new THREE.Vector3(0,1,-.08)),direction=new THREE.Vector3(side,0,0).transformDirection(parent.matrixWorld),hit=visibleHit(workshop.group,origin.toArray(),direction.toArray());
   assert(hit&&Math.abs(parent.worldToLocal(hit.point.clone()).x)<bounds[1].max.x-.012,'Door jamb masks the side wall without a coplanar face');
  }
  const ux=Math.sin(parent.rotation.y),uz=Math.cos(parent.rotation.y);
  for(const side of [-1,1])for(const offset of [-.005,0,.005]){const hit=visibleHit(workshop.group,[d.point[0]+ux*side+uz*offset,1.1,d.point[1]+uz*side-ux*offset],[-ux*side,0,-uz*side]);assert(hit&&Math.hypot(hit.point.x-d.point[0],hit.point.z-d.point[1])<.06,'No sight gap through closed double doors');}
  // Joined exterior stone courses are ordinary meshes after optimization.
  // Check actual estate batches too: a workshop-only ray misses their depth
  // conflict with the painted header at the two separate Hale contacts.
  for(const x of [-1.3,-.61,.03,.59,1.28])for(const y of [3.82,3.9,3.98,4.15,4.7]){
   const origin=parent.localToWorld(new THREE.Vector3(x,y,.6)),direction=new THREE.Vector3(0,0,-1).transformDirection(parent.matrixWorld);
   const hits=new THREE.Raycaster(origin,direction,0,.9).intersectObjects(facadeMeshes,false);
   assert(hits.length&&Math.abs(hits[0].distance-.48)<1e-4,'Masonry header closes the playable corridor above '+d.id);
   assert.equal(hits.filter(h=>Math.abs(h.distance-hits[0].distance)<.002).length,1,'One rendered header face without exterior-course flicker at '+JSON.stringify({id:d.id,x,y,hits:hits.map(h=>({name:h.object.name,distance:h.distance}))}));
  }
 }
 for(const sign of authored.filter(o=>o.userData.directionSign)){
  const spec=sign.userData.directionSign;assert(sign.material[4].map&&sign.material[5].map,'Text on both sign faces');
  assert.equal(sign.material[4].map.name,spec.lines.join(' / '));assert.equal(sign.material[5].map.name,spec.backLines.join(' / '));
  assert.deepEqual(spec.backLines,spec.backRoutes.map(([title,direction])=>relativeArrow(spec.forward.map(n=>-n),direction)+'  '+title),'Reverse arrows use the reverse approach');
  for(const face of [4,5]){const faceGroup=sign.geometry.groups.find(g=>g.materialIndex===face),uv=sign.geometry.attributes.uv,vertices=Array.from({length:faceGroup.count},(_,i)=>sign.geometry.index.getX(faceGroup.start+i));assert(Math.max(...vertices.map(i=>uv.getX(i)))-Math.min(...vertices.map(i=>uv.getX(i)))>.99,'Full readable UVs on sign face');}
 }
 const positions=workshop.lighting.uniforms.workshopPositions.value.map(p=>p.toArray());
 for(const lamp of workshop.lighting.lamps){workshop.lighting.update(lamp);assert(positions.some(p=>Math.hypot(p[0]-lamp.x,p[1]-lamp.y,p[2]-lamp.z)<1e-6),'Every fitting has permanent world-space illumination');}
 assert.deepEqual(workshop.lighting.uniforms.workshopPositions.value.map(p=>p.toArray()),positions,'Walking cannot reassign tube illumination');
 const skirtMeshes=authored.filter(o=>/skirting/.test(o.name));
 function trimmed(point,direction,label){const hit=new THREE.Raycaster(new THREE.Vector3(...point),new THREE.Vector3(...direction),0,.7).intersectObjects(skirtMeshes,false)[0];assert(hit,'Continuous skirting at '+label);}
 for(const wall of authored.filter(o=>o.material.map&&/Workshop partition|Corridor painted brick|Window lining base|Workshop outer-wall lining|Connecting corridor painted lining|Corridor finished corner return/.test(o.name))){
  const b=wall.geometry.attributes.position,points=Array.from({length:b.count},(_,i)=>[b.getX(i),b.getY(i),b.getZ(i)]),minY=Math.min(...points.map(p=>p[1]))+wall.position.y;
  if(Math.abs(minY-.04)>1e-5)continue;
  const width=Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0])),depth=Math.max(...points.map(p=>p[2]))-Math.min(...points.map(p=>p[2]));
  for(const side of [-1,1])for(const t of [.1,.5,.9]){
   const point=wall.localToWorld(new THREE.Vector3((t-.5)*width,.11-wall.position.y,side*(depth/2+.25))),direction=new THREE.Vector3(0,0,-side).transformDirection(wall.matrixWorld);trimmed(point.toArray(),direction.toArray(),wall.name);
  }
 }
 const rendered=[],glassMaterials=new Set();exterior.model.traverse(o=>{if(o.isMesh&&/glazing|glass/i.test(o.name))for(const m of [o.material].flat())glassMaterials.add(m);});exterior.model.traverseVisible(o=>{if(o.isMesh)rendered.push(o);});
 let windowRays=0;function visiblePane(origin,direction,label){const ray=new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,4),hit=ray.intersectObjects(rendered,false)[0];assert(glassMaterials.has(hit?.object.material),'Visible pane '+label+'; first surface '+hit?.object.name+' '+JSON.stringify({origin,direction,point:hit?.point,material:hit?.object.material.name}));windowRays++;}
 for(const z of [-31.5,-37,-42.5,-47])for(const y of [2.4,4.2]){visiblePane([westX-.7,y,z+.3],[1,0,0],'rectangular west sash exterior');visiblePane([westX+.8,y,z+.3],[-1,0,0],'rectangular west sash interior');}
 world.workshops.group.traverse(o=>{if(o.name!=='Workshop exterior with semicircular windows')return;for(const w of o.userData.openings??[])for(const y of [w.y+.45,w.y+w.spring+w.radius*.6]){const p=o.localToWorld(new THREE.Vector3(w.x+.23,y,w.z+w.side*.65)),direction=new THREE.Vector3(0,0,-w.side).transformDirection(o.matrixWorld);visiblePane(p.toArray(),direction.toArray(),'workshop wall '+o.position.x+','+o.position.z);}});
 assert(windowRays>140,'Lower panes and semicircular heads on both gallery sides and exposed workshop walls receive glazing checks');
 assert(!walker.clear(166.2,-43.1),'Assembly table follows its visible footprint');
 walker.refresh();assert(walker.clear(corridorX,-48),'Tree/collision refresh retains the hollow corridor');assert(!walker.clear(westX,-40),'Moved west wall remains solid');
 assert(walker.clear(westX+.65,-46),'Vestibule floor is accessible inside the shifted facade');
 assert(walker.clear(152.45,-48.5),'Vestibule joins corridor directly');assert(!walker.clear(151.5,-50),'Original tower blocks walking without an extra wall');
 assert.equal(roof.geometry.uuid,roofGeometry.uuid);assert.deepEqual(roof.matrix.toArray(),roofMatrix,'Tower roof contact remains fixed');
 world.dispose();assert.equal(exterior.model.children.length,resourcesBefore);assert.deepEqual(snapshot(),original,'Disposal restores every original mesh, batch, transform and geometry buffer');assert(!walker.clear(156,-48),'Original solid estate restored');
 for(const [object,cast] of shadowStates)assert.equal(object.castShadow,cast,'Original shadow caster restored');
 for(const [material,hooks] of materialHooks)assert.deepEqual([material.onBeforeCompile,material.customProgramCacheKey],hooks,'Original material shader hooks restored');
 assert.equal(exterior.scene.onBeforeRender,sceneBeforeRender,'Atlas render hook removed on restart');
}
console.log('PASS: straight Farndon wall, all corridor masonry/lining/skirting mitres, continuous kitchen/workshop contact, grounded facade, brick registration, original tower faces, wall collisions, actual batches, opening doors, corridor/room walks, fixed roofs and exact restart restoration.');
