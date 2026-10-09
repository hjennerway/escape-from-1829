import {batchAerialMeshes,cacheAerialTransforms} from './aerial-performance.mjs';
import {insidePolygon,ROOM_DOOR_WIDTH} from './asylum-layout.mjs';
import {ROOM_DOOR_THICKNESS} from './asylum-doors.mjs';
import {ESCAPE_WATER_TOWER} from './water-tower.mjs';
import {WORKSHOP_GALLERY,galleryShellRemainders,addWorkshopArchedWall,addWorkshopGalleryRoof} from './workshop-gallery.mjs';
import {FARNDON_CORRIDOR} from './farndon-corridor.mjs';
import {TOWER_RANGES} from './tower-buildings.mjs';
import {MAIN_KITCHEN} from './main-kitchen.mjs';
import {ADMIN_OS_RANGES,adminMapPoint} from './main-admin-building.mjs';
import {createWorkshopInteriorFinish,CORRIDOR_FINISH} from './workshop-interior-finish.mjs';
import {ESCAPE_CORRIDOR_POLYGONS,ESCAPE_CORRIDOR_RUNS,ESCAPE_CORRIDOR_X,corridorPolygon,containsPoint,unionPolygons} from './escape-corridor-plan.mjs';
import {addEscapeCorridors} from './escape-corridors.mjs';
import {obstacleContains} from './explore-controls.mjs';
import {createWorkshopLights} from './workshop-interior-lights.mjs';
import {createWorkshopShadowBatches} from './workshop-shadow-batches.mjs';
import {WORKSHOP_DOOR_BASE,WORKSHOP_DOOR_HEIGHT,WORKSHOP_DOOR_HEAD} from './workshop-door-dimensions.mjs';
import {corridorWallJoins,miterCorridorWall} from './corridor-wall-joins.mjs';
import {EXPLORE_GALLERY,EXPLORE_CORRIDOR_RUNS,EXPLORE_CORRIDOR_POLYGONS,EXPLORE_CORRIDOR_DOORS,EXPLORE_CORRIDOR_ENTRANCE,EXPLORE_IRBY_ENTRANCE} from './explore-corridor-plan.mjs';
import {restoreGroundProjection} from './ground-materials.mjs';
import {fitWorkshopYardRoofs,closeWorkshopAdminBay} from './workshop-yard-envelope.mjs';
import {fitNorthTowerWall,removeTowerJunctionSashes} from './tower-wall-alignment.mjs';
export const WORKSHOP_DOOR_SECONDS=.95;
const galleryLeft=WORKSHOP_GALLERY.minX,galleryRight=WORKSHOP_GALLERY.maxX;
// Partition faces meet the gallery lining without a change in clear width.
const passageLeft=galleryLeft+.1675,passageRight=galleryRight-.1675;
// Purple junction guide: slide the west facade along the tower's south face.
// Keep the tower, gallery and right-hand room boundaries as fixed anchors.
const sourceWestX=146.3,westShift=-.9,westX=sourceWestX+westShift;

// An Escape interior fitted inside the existing stepped stores/tower outline.
// The west wall and its flat roof edge follow the Escape placement correction.
export const TOWER_WORKSHOPS={
 westX,westShift,
 entrance:{x:westX-.14,z:-44.75,width:1.65},
 outline:[[westX,-50.1],[153.1,-50.1],[153.1,-60.3],[galleryLeft,-60.3],[galleryLeft,WORKSHOP_GALLERY.minZ],[galleryRight,WORKSHOP_GALLERY.minZ],[galleryRight,-60.3],[180,-60.3],[180,-40.5],[galleryRight,-40.5],[galleryRight,WORKSHOP_GALLERY.maxZ],[galleryLeft,WORKSHOP_GALLERY.maxZ],[galleryLeft,-26.6],[westX,-26.6]],
 workshopOutline:[[westX,-50.1],[153.1,-50.1],[153.1,-60.3],[180,-60.3],[180,-40.5],[galleryRight,-40.5],[galleryRight,-16.6],[galleryLeft,-16.6],[galleryLeft,-26.6],[westX,-26.6]],
 corridor:[[148.3+westShift,-44.75],[ESCAPE_CORRIDOR_X,-44.75],[ESCAPE_CORRIDOR_X,WORKSHOP_GALLERY.minZ],[ESCAPE_CORRIDOR_X,WORKSHOP_GALLERY.maxZ]],
 rooms:[{id:'repair',title:'Repair workshop',rect:[westX+.2,-43.5,passageLeft-.15,-36.4],door:[passageLeft,-40]},
  {id:'oil-store',title:'Oil and parts store',rect:[westX+.2,-36.4,passageLeft-.15,-26.9],door:[passageLeft,-31.5]},
  {id:'machine',title:'Machine workshop',rect:[passageRight+.15,-59.9,179.7,-40.8],door:[passageRight,-48.5]}],
 tools:{crowbar:{x:147.3+westShift,z:-40.2,y:1.075,approachX:148.6+westShift},oil:{x:147.3+westShift,z:-30.6,y:1.065,approachX:148.6+westShift}}
};
TOWER_WORKSHOPS.outline=unionPolygons([TOWER_WORKSHOPS.workshopOutline,...ESCAPE_CORRIDOR_POLYGONS])[0];
TOWER_WORKSHOPS.corridors=ESCAPE_CORRIDOR_RUNS;

function meetsPassage(bounds,runs){
 if(bounds.min.y>=WORKSHOP_GALLERY.height||bounds.max.y<=0)return false;
 const corners=[[bounds.min.x,bounds.min.z],[bounds.max.x,bounds.min.z],[bounds.max.x,bounds.max.z],[bounds.min.x,bounds.max.z]];
 return runs.some(run=>{
  const dx=run.end[0]-run.start[0],dz=run.end[1]-run.start[1],length=Math.hypot(dx,dz),half=(WORKSHOP_GALLERY.maxX-WORKSHOP_GALLERY.minX)/2+.32;
  const along=corners.map(([x,z])=>((x-run.start[0])*dx+(z-run.start[1])*dz)/length),across=corners.map(([x,z])=>((x-run.start[0])*dz-(z-run.start[1])*dx)/length);
  const polygon=corridorPolygon(run,.32);
  return Math.max(...along)>-.32&&Math.min(...along)<length+.32&&Math.max(...across)>-half&&Math.min(...across)<half&&bounds.max.x>Math.min(...polygon.map(p=>p[0]))&&bounds.min.x<Math.max(...polygon.map(p=>p[0]))&&bounds.max.z>Math.min(...polygon.map(p=>p[1]))&&bounds.min.z<Math.max(...polygon.map(p=>p[1]));
 });
}

export function createTowerWorkshops(THREE,exterior,walker,resources,sign,{explore=false}={}){
 const runs=explore?EXPLORE_CORRIDOR_RUNS:ESCAPE_CORRIDOR_RUNS,polygons=explore?EXPLORE_CORRIDOR_POLYGONS:ESCAPE_CORRIDOR_POLYGONS;
 const gallery=explore?EXPLORE_GALLERY:WORKSHOP_GALLERY;
 const plan=explore?{...TOWER_WORKSHOPS,outline:unionPolygons([TOWER_WORKSHOPS.workshopOutline,...polygons])[0],corridors:runs}:TOWER_WORKSHOPS;
 const group=new THREE.Group();group.name='Tower corridor and three workshops';group.userData.reference='Research/escape-grounds/README.md';group.userData.plan=plan;
 const tower=exterior.model.getObjectByName('Tower service buildings');
 const galleryRoof=exterior.model.getObjectByName('Straight corridor to Farndon slate roof')?.material;
 const galleryRidge=exterior.model.getObjectByName('Straight corridor to Farndon ridge')?.material;
 const entranceRoof=explore?exterior.model.getObjectByName('Main/admin front corridor slate roof')?.material:null;
 const entranceBrick=explore?exterior.model.getObjectByName('Main/admin corridor front brick gable')?.material:null;
 const irbyRoof=explore?exterior.model.getObjectByName('Water tower to Irby corridor slate roof')?.material:null;
 const irbyBrick=explore?exterior.model.getObjectByName('Irby corridor exposed end gable')?.material:null;
 const corridor=exterior.model.getObjectByName('Straight corridor to Farndon'),court=exterior.model.getObjectByName('Tower service court'),scopes=[tower,exterior.adminCorridor??corridor,exterior.mainAdmin,court?.parent,exterior.haleWard,exterior.irbyAshley,exterior.farndonWard,exterior.uptonFrithOscroft,exterior.graftonEdge,exterior.witbyWard].filter((s,i,list)=>s&&list.indexOf(s)===i);
 // Clear the same low shell volume from the rooms as from the passages.
 // The kitchen's north wall meets the west workshop facade at this cut.
 // Keep its brickwork and plinth up to westX instead of leaving .32 clearance.
 const roomVolumes=[[westX,-50.1,153.1,-26.6],[153.1,-60.3,180,-40.5]].map(([x0,z0,x1,z1])=>({start:[x0,(z0+z1)/2],end:[x1,(z0+z1)/2],half:(z1-z0)/2,startPadding:x0===westX?0:.32}));
 const removed=[],sourceStates=[],oldBatches=[],editedInstances=[],remainders=[];
 // The estate contains named solid shells behind material batches. Unbatch
 // this one building, replace its lower shell, then rebuild its affected batches.
 for(const scope of scopes){
  const batches=[];scope.traverse(o=>{if(o.userData.aerialBatch)batches.push(o);else if(o.isMesh){sourceStates.push([o,o.visible,!!o.userData.aerialBatchSource]);if(o.userData.aerialBatchSource){delete o.userData.aerialBatchSource;o.visible=true;}}});
  for(const b of batches){oldBatches.push([b,b.parent]);b.removeFromParent();}
  // Replace the old decorative front-door fittings along with the cut shell.
  if(explore){const front=scope.getObjectByName('Main/admin corridor front doorway');if(front)for(const o of [...front.children])if(o.name!=='Corridor pavilion side connection walls'){removed.push([o,front]);o.removeFromParent();}}
  if(explore)for(const name of ['Irby corridor end doorway','Irby corridor exposed end gable','Water tower to Irby corridor slate roof','Roof underside: Water tower to Irby corridor slate roof','Eave closure: Water tower to Irby corridor','Water tower to Irby corridor ridge']){
   const o=scope.getObjectByName(name);if(o){removed.push([o,o.parent]);o.removeFromParent();}
  }
  const names=new Set(['Low west stores walls','Low west stores plinth','West stores flat front walls','West stores flat front plinth','Tower east traced abutment walls','Tower east traced abutment plinth','Tower east dormered range walls','Tower east dormered range plinth','Western tower flat link walls','Western tower flat link plinth']);
  // These separated, untextured pads predate the continuous asphalt court.
  // Retaining them exposes sunken patches where the walking shell is cut.
  if(scope===tower)for(const name of ['Twin workshop paved court','Chimney cylinder hardstanding']){
   const o=scope.getObjectByName(name);if(o){removed.push([o,o.parent]);o.removeFromParent();}
  }
  scope.updateWorldMatrix(true,true);
  // These complete shells are replaced, including the wider estate gallery.
  // Its old east windows sit beyond the narrowed passage's proximity cutoff.
  // Remove assemblies with their supporting shell, rather than leaving glass
  // and stone frames suspended outside the new wall.
  const replacedBounds=[];scope.traverse(o=>{if(names.has(o.name)||o.name==='Straight corridor to Farndon walls')replacedBounds.push(new THREE.Box3().setFromObject(o).expandByScalar(.4));});
  // The cut walls supply their own glazing. Keep estate windows beyond the
  // accessible routes, and retain removed assemblies for exact restoration.
  {
   const windows=[];scope.traverse(o=>{if(o.userData.aerialWindowAssembly)windows.push(o);});
   for(const o of windows){const p=o.getWorldPosition(new THREE.Vector3()),b=new THREE.Box3().setFromObject(o);if(b.min.y<WORKSHOP_GALLERY.height&&b.max.y>0&&(replacedBounds.some(bounds=>bounds.intersectsBox(b))||runs.some(r=>{const dx=r.end[0]-r.start[0],dz=r.end[1]-r.start[1],l=Math.hypot(dx,dz),t=((p.x-r.start[0])*dx+(p.z-r.start[1])*dz)/(l*l);return t>=-.5/l&&t<=1+.5/l&&Math.abs((p.x-r.start[0])*dz-(p.z-r.start[1])*dx)/l<3.3;}))){removed.push([o,o.parent]);o.removeFromParent();}}
  }
  const concealedWindows=[];scope.traverse(o=>{if(!o.userData.aerialWindowAssembly)return;const b=new THREE.Box3().setFromObject(o),g=gallery;if(b.min.y<g.height&&b.min.x<g.maxX-.2&&b.max.x>g.minX+.2&&b.min.z<g.maxZ&&b.max.z>g.minZ)concealedWindows.push(o);});
  for(const o of concealedWindows){removed.push([o,o.parent]);o.removeFromParent();}
  // Low kitchen eaves include separate fascia and hip-flashing meshes. Cut
  // these with the roofs so their ends cannot project through the new lining.
  // Joined masonry courses are ordinary meshes after facade optimization.
  // Clip their low corridor sections too: Hale's exterior band otherwise
  // shares the new door-header plane. Upper and outside sections survive.
  const oldGalleryFitting=o=>{if(!/gutter|eaves?|fascia|flashing|downpipe|pipe bracket|brick plinth/i.test(o.name))return false;for(let p=o.parent;p;p=p.parent)if(p.name==='Straight corridor to Farndon')return true;return false;};
  const oldAdminFitting=o=>{if(!/^Corridor (?:gutter|downpipe|pipe bracket|brick plinth)/.test(o.name))return false;for(let p=o.parent;p;p=p.parent)if(/^Corridor (?:north|south) windows$/.test(p.name)&&p.parent?.name==='1829 to Main/admin connecting corridor')return true;return false;};
  const oldConnector=o=>/^(?:Connecting corridor (?:walls|slate roof|ridge)|Roof underside: Connecting corridor slate roof|Eave closure: Connecting corridor)$/.test(o.name);
  const oldFrontRoof=o=>explore&&/^(?:Main\/admin front corridor (?:slate roof|ridge)|Roof underside: Main\/admin front corridor slate roof|Eave closure: Main\/admin front corridor)$/.test(o.name);
  const shells=[];scope.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const b=new THREE.Box3().setFromObject(o),g=gallery;const shell=/walls|plinth|floor|ground|court/i.test(o.name)||o===court,fitting=/gutter|eaves?|fascia|flashing|downpipe|pipe bracket|roof|ridge|joined stone courses/i.test(o.name);const intersects=(shell||fitting)&&b.min.y<g.height&&b.max.y>0&&polygons.some(p=>b.min.x<Math.max(...p.map(v=>v[0]))+.32&&b.max.x>Math.min(...p.map(v=>v[0]))-.32&&b.min.z<Math.max(...p.map(v=>v[1]))+.32&&b.max.z>Math.min(...p.map(v=>v[1]))-.32);if(names.has(o.name)||intersects||oldGalleryFitting(o)||oldAdminFitting(o)||oldConnector(o)||oldFrontRoof(o))shells.push(o);});
  for(const o of shells){
   // Rainwater fittings belonged to the removed wider gallery facades. They
   // cannot survive as low rails and isolated downpipes beside the new walls.
   if(oldGalleryFitting(o)){removed.push([o,o.parent]);o.removeFromParent();continue;}
   // Replace the roof backing and fascia with the slate skin. Leaving its
   // separately generated underside creates a second floating roof silhouette.
   if(oldFrontRoof(o)){removed.push([o,o.parent]);o.removeFromParent();continue;}
   // The old gallery is a solid block, including the machine-room doorway.
   // Its replacement owns the whole wall run; retaining the cut block's side
   // creates an invisible collision strip inside the accessible room.
   // Let this paving meet beneath the flat entrance face, rather than cutting
   // it .08 m beyond the wall and exposing a stepped, triangulated lower edge.
   const irbyCourt=explore&&/^Irby Estates continuous service court(?: ground contact)?$/.test(o.name);
   const towerCourt=/^Tower service court(?: ground contact)?$/.test(o.name);
   const oldGalleryRoof=/^(?:Straight corridor to Farndon (?:slate roof|ridge)|Roof underside: Straight corridor to Farndon slate roof)$/.test(o.name);
   // Clear the complete old roof across the replaced route, including skirts
   // outside the narrowed passage. Preserve outer sections for restoration.
   // The original cross-gallery is wider than the walking passage too. Cut
   // its complete low envelope through the old Main/admin contact; narrow
   // cuts otherwise leave two slate triangles suspended above the yard.
   const shellRuns=oldConnector(o)||oldAdminFitting(o)?[{...runs.find(r=>r.id==='admin'),end:[160.8,9.8],half:oldAdminFitting(o)?3.6:3.45,startPadding:0,endPadding:0}]:oldGalleryRoof?[{...runs.find(r=>r.id==='gallery'),half:FARNDON_CORRIDOR.width,startPadding:0,endPadding:0}]:towerCourt?runs.map(run=>({...run,half:(gallery.maxX-gallery.minX)/2-.05,startPadding:0,endPadding:0})):irbyCourt?runs.map(run=>run.id==='irby'?{...run,endPadding:.20}:run):runs;
   let surfaceSource=o;
   if(towerCourt){
    surfaceSource=o.clone();surfaceSource.geometry=o.geometry.clone();
    const p=surfaceSource.geometry.attributes.position,v=new THREE.Vector3(),inverse=o.matrixWorld.clone().invert();
    // Extend the old X=159 court edge beneath the actual gallery face,
    // including the grass channel all the way to Main/admin's north wall.
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(Math.abs(v.x-159)<.001&&v.z<6.61){v.x=galleryRight-.05;v.applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);}}
    surfaceSource.geometry.computeBoundingBox();surfaceSource.geometry.computeBoundingSphere();
   }
   let courtMaterial;
   if(irbyCourt&&o.material.userData.estateSurface){
    // The aerial overlay's slope bias pulls distant paving through the shut
    // door. Its clipped runtime surface has no overlapping layer to separate.
    courtMaterial=o.material.clone();courtMaterial.polygonOffset=false;
    courtMaterial.polygonOffsetFactor=courtMaterial.polygonOffsetUnits=0;
    restoreGroundProjection(courtMaterial);resources.add(courtMaterial);
   }
   const shellRooms=towerCourt?roomVolumes.map(volume=>({...volume,startPadding:0,endPadding:0})):roomVolumes;
   if(!names.has(o.name)&&o.name!=='Straight corridor to Farndon walls')for(const part of galleryShellRemainders(THREE,surfaceSource,resources,shellRooms,shellRuns)){
    if(courtMaterial)part.material=courtMaterial;
    // These low connecting galleries were raised to the workshop ceiling.
    // Their surviving roof skirts must rise with them: leaving the old roof
    // at 3.6 m makes an exterior shutter across the new window's sun rays.
    // Tower and adjacent building roofs retain their surveyed transforms.
    if(o.parent.userData.centerline&&/slate roof| ridge$/.test(o.name)){
     part.position.y+=WORKSHOP_GALLERY.height-3.6;part.updateMatrix();
    }
    o.parent.add(part);remainders.push(part);
   }
   if(surfaceSource!==o)surfaceSource.geometry.dispose();
   removed.push([o,o.parent]);o.removeFromParent();
  }
  // Clone only the west flat-roof envelope and fixed doorway threshold.
  // Stretch its west edge to the moved wall, leaving slate/tower contacts fixed.
  // Original geometry stays untouched so replay restores the estate exactly.
  if(scope===tower){
   fitNorthTowerWall(THREE,{tower,resources,removed,remainders,west:westX,sourceWest:sourceWestX,
    plinth:removed.find(([o])=>o.name==='Low west stores plinth')?.[0].material});
   fitWorkshopYardRoofs(THREE,{tower,resources,removed,remainders,left:galleryLeft,right:galleryRight,west:westX});
   const fittings=[];scope.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;
    if(['Low west stores arch-front flat roof','Low west stores west parapet','Low west stores west coping','West stores flat front flat roof','Tower-side stores threshold'].includes(o.name)||
     /^West stores flat front stepped (parapet|coping)$/.test(o.name)&&new THREE.Box3().setFromObject(o).min.x<sourceWestX+.3)fittings.push(o);
   });
   for(const o of fittings){
    const clone=o.clone();clone.geometry=o.geometry.clone();resources.add(clone.geometry);
    const pos=clone.geometry.attributes.position,p=new THREE.Vector3(),inverse=o.matrixWorld.clone().invert();
    const bounds=new THREE.Box3().setFromObject(o);
    const rigid=/west (parapet|coping)$|threshold$/.test(o.name)||bounds.max.x<sourceWestX+.3;
    for(let i=0;i<pos.count;i++){
     p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
     p.x+=westShift*(rigid?1:Math.max(0,Math.min(1,(149.7-p.x)/(149.7-sourceWestX))));
     if(o.name==='Tower-side stores threshold'&&Math.abs(p.y-bounds.min.y)<1e-5)p.y=(exterior.terrain?.position.y??-.15)-.03;
     p.applyMatrix4(inverse);pos.setXYZ(i,p.x,p.y,p.z);
    }
    pos.needsUpdate=true;clone.geometry.computeVertexNormals();clone.geometry.computeBoundingBox();clone.geometry.computeBoundingSphere();
    o.parent.add(clone);remainders.push(clone);removed.push([o,o.parent]);o.removeFromParent();
   }
  }
  const m=new THREE.Matrix4(),p=new THREE.Vector3();
  const clearPolygons=runs.map(r=>corridorPolygon(r,-.32));
  scope.traverse(o=>{if(!o.isInstancedMesh)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const world=new THREE.Matrix4();let changed=false;
   for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);world.multiplyMatrices(o.matrixWorld,m);const b=o.geometry.boundingBox.clone().applyMatrix4(world),point=[(b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2];
    if(meetsPassage(b,runs)){
     if(!clearPolygons.some(poly=>containsPoint(point,poly))){
      const source=new THREE.Mesh(o.geometry,o.material);source.name=o.name;source.matrixAutoUpdate=false;source.matrix.copy(m);source.matrixWorld.copy(world);source.castShadow=o.castShadow;source.receiveShadow=o.receiveShadow;source.userData={...o.userData};delete source.userData.aerialBatch;
      for(const part of galleryShellRemainders(THREE,source,resources,[],runs)){o.add(part);remainders.push(part);}
     }
     editedInstances.push([o,i,m.clone()]);o.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0));changed=true;
    }
   }if(changed){o.instanceMatrix.needsUpdate=true;o.computeBoundingBox();o.computeBoundingSphere();}
  });
  scope.traverse(o=>{if(!o.isInstancedMesh||o.name!=='Service glazing and trim')return;
   for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);p.setFromMatrixPosition(m);const panel=p.x>145.8&&p.x<146.3&&Math.abs(p.z+44.75)<.08&&p.y<3.9,handle=Math.abs(p.x-146.02)<.02&&Math.abs(p.z+44.19)<.02&&Math.abs(p.y-1.85)<.02;
    const size=new THREE.Vector3().setFromMatrixScale(m);
    const obsoleteEave=p.x<163&&size.y<.2&&size.x>5&&(
     Math.abs(p.y-6.45)<.01&&[-40.5,-36.3].some(z=>Math.abs(p.z-z)<.01)||
     Math.abs(p.y-8.89)<.01&&[-50.1,-36.3].some(z=>Math.abs(p.z-z)<.01));
    const replacedSouthSash=Math.abs(p.z+16.6)<.55&&p.x>154.8&&p.x<161.4&&p.y<5;
    const westFitting=p.x>145.8&&p.x<146.6&&p.z>-50.1&&p.z<-26.6;
    const westEave=Math.abs(p.x-154.3)<.01&&Math.abs(p.y-8.89)<.01&&[-50.1,-36.3].some(z=>Math.abs(p.z-z)<.01);
    const northEave=Math.abs(p.y-8.89)<.01&&((Math.abs(p.x-151.6)<.01&&Math.abs(p.z+74.1)<.01)||(Math.abs(p.x-154.3)<.01&&Math.abs(p.z+60.3)<.01));
    if(panel||handle||replacedSouthSash||westFitting||westEave||northEave||obsoleteEave){
     editedInstances.push([o,i,m.clone()]);
     if(panel||handle||replacedSouthSash||obsoleteEave)o.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0));
     else {if(westEave||northEave){const q=new THREE.Quaternion(),s=new THREE.Vector3();m.decompose(p,q,s);p.x+=westShift/2;s.x-=westShift;m.compose(p,q,s);}else m.elements[12]+=westShift;o.setMatrixAt(i,m);}
    }}
   o.instanceMatrix.needsUpdate=true;o.computeBoundingBox();o.computeBoundingSphere();
  });
  if(scope===exterior.haleWard)removeTowerJunctionSashes(THREE,{ward:scope,editedInstances});
  batchAerialMeshes(THREE,scope);cacheAerialTransforms(scope);
 }
 // Prune only low canopy instances that enter the new enclosed passages.
 // Retain their original matrices so replay restores the estate exactly.
 exterior.trees?.updateWorldMatrix(true,true);
 exterior.trees?.traverse(o=>{if(!o.isInstancedMesh||!o.userData.treeIds)return;
  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const m=new THREE.Matrix4(),world=new THREE.Matrix4();let changed=false;
  for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);world.multiplyMatrices(o.matrixWorld,m);const b=o.geometry.boundingBox.clone().applyMatrix4(world);
   if(meetsPassage(b,runs)){
    editedInstances.push([o,i,m.clone()]);o.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0));changed=true;
   }
  }if(changed){o.instanceMatrix.needsUpdate=true;o.computeBoundingBox();o.computeBoundingSphere();}
 });
 // Detailed tree templates include shared foliage instance buffers. Remove
 // interfering whole copies rather than changing every tree sharing a buffer.
 for(const tree of [...(exterior.trees?.children??[])]){
  if(tree.isInstancedMesh)continue;const b=new THREE.Box3().setFromObject(tree);
  if(meetsPassage(b,runs)){
   removed.push([tree,tree.parent]);tree.removeFromParent();
  }
 }
 const solids=[];
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.88,...extra});resources.add(m);return m;};
 const timber=material(0x75604a),metal=material(0x465052,{metalness:.6,roughness:.55}),cream=material(0xc3bba2),blue=material(0x668d9b),red=material(0x806151),dark=material(0x343a34),glass=material(0xa4b3af,{emissive:0x607976,emissiveIntensity:.22});
 const {finish,reveal,floor}=createWorkshopInteriorFinish(THREE,{resources,material});
 const cube=new THREE.BoxGeometry(1,1,1);resources.add(cube);
 const outsideBrick=removed.find(([o])=>o.name==='Low west stores walls')?.[0].material??red;
 const outsidePlinth=removed.find(([o])=>o.name==='Low west stores plinth')?.[0].material??red;
 function box(m,size,p,name='',parent=group){
  let geometry=cube;if(m===floor){geometry=new THREE.BoxGeometry(...size);resources.add(geometry);const pos=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+p[0])/4,(pos.getZ(i)+p[2])/4);}
  const o=new THREE.Mesh(geometry,m);if(m!==floor)o.scale.set(...size);o.position.set(...p);o.name=name;o.castShadow=o.receiveShadow=true;o.userData.noWalkingCollision=true;parent.add(o);return o;
 }
 function block(x,z,w,d,h,minY=0){solids.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY,maxY:minY+h});}
 function panel(a,b,bottom,top,m,name,collision=true,thick=.24,joins){const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<.001)return;
  const g=new THREE.BoxGeometry(length,top-bottom,thick);resources.add(g);
  if(joins)miterCorridorWall(g,length,joins,length/2,joins.offset);
  const uv=g.attributes.uv,pos=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(Math.abs(dx)>Math.abs(dz)?(a[0]+b[0])/2+pos.getX(i)*dx/length:(a[1]+b[1])/2+pos.getX(i)*dz/length)/(m===finish?CORRIDOR_FINISH.textureWidth:2),(pos.getY(i)+(top+bottom)/2)/5.05);
  const o=new THREE.Mesh(g,m);o.position.set((a[0]+b[0])/2,(bottom+top)/2,(a[1]+b[1])/2);o.rotation.y=-Math.atan2(dz,dx);o.name=name;o.castShadow=o.receiveShadow=true;o.userData.noWalkingCollision=!collision;o.userData.walkBarrier=collision;group.add(o);
  if(joins&&collision)o.userData.collisionFootprint=[[-length/2+joins.start*(joins.offset-thick/2),-thick/2],[length/2+joins.end*(joins.offset-thick/2),-thick/2],[length/2+joins.end*(joins.offset+thick/2),thick/2],[-length/2+joins.start*(joins.offset+thick/2),thick/2]];
  if(m===finish&&bottom<=.04&&top>.18)for(const side of [-1,1]){
   const offset=side*(thick/2+.0225);
   panel([a[0]-dz/length*offset,a[1]+dx/length*offset],[b[0]-dz/length*offset,b[1]+dx/length*offset],.04,.18,dark,'Workshop wall skirting',false,.045,joins?{...joins,offset:joins.offset+offset}:undefined);
  }
  return o;
 }
 function masonry(a,b,bottom,top,name){const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(!length)return;const ia=[a[0]-dz/length*.12,a[1]+dx/length*.12],ib=[b[0]-dz/length*.12,b[1]+dx/length*.12];
  // Ground-level replacement walls need the same buried foot as the estate.
  // Keep their upper heights and facade plane fixed, including window reveals.
  const base=bottom===0?(exterior.terrain?.position.y??-.15)-.03:bottom;
  function face(low,high,m,label){const wall=panel(ia,ib,low,high,m,label),p=wall.geometry.attributes.position,uv=wall.geometry.attributes.uv;
   // Window cuts split this facade into panels. Register their brickwork to
   // one world coordinate so courses and vertical joints continue across cuts.
   for(let i=0;i<p.count;i++){const along=p.getX(i),coordinate=Math.abs(dx)>Math.abs(dz)?wall.position.x+along*dx/length:wall.position.z+along*dz/length;uv.setX(i,coordinate/2);}uv.needsUpdate=true;
  }
  if(bottom<.6)face(base,Math.min(top,.6),outsidePlinth,name+' plinth');if(top>.6)face(Math.max(bottom,.6),top,outsideBrick,name);
 }
 // The door's short west facade has only the four existing rectangular sashes.
 // Cut their openings through the full-height outer brick and interior lining,
 // keeping their surfaces separate.
 function westWall(z0,z1){
  const holes=[{z:-44.75,w:1.65,y0:0,y1:3.75},...[-31.5,-37,-42.5,-47].map(z=>({z,w:1.25,y0:1.95,y1:4.65}))].filter(h=>h.z-h.w/2>=Math.min(z0,z1)&&h.z+h.w/2<=Math.max(z0,z1)).sort((a,b)=>a.z-b.z);
  let z=z0;
  for(const h of holes){masonry([westX,h.z-h.w/2],[westX,z],0,8.84,'Stores west masonry');if(h.y0)masonry([westX,h.z+h.w/2],[westX,h.z-h.w/2],0,h.y0,'Sash base');masonry([westX,h.z+h.w/2],[westX,h.z-h.w/2],h.y1,8.84,'Opening header');z=h.z+h.w/2;}
  masonry([westX,z1],[westX,z],0,8.84,'Stores west masonry');
  // Same cuts in the inner brick lining, including physical reveals.
  z=z0;for(const h of holes){panel([westX+.265,z],[westX+.265,h.z-h.w/2],.04,5.05,finish,'Corridor painted brick',false,.045);if(h.y0)panel([westX+.265,h.z-h.w/2],[westX+.265,h.z+h.w/2],.04,h.y0,finish,'Window lining base',false,.045);panel([westX+.265,h.z-h.w/2],[westX+.265,h.z+h.w/2],h.y1,5.05,finish,'Window lining head',false,.045);
   if(h.y0){
    const height=h.y1-h.y0,cy=(h.y0+h.y1)/2;
    box(glass,[.035,height,h.w],[westX+.275,cy,h.z],'Inner sash glass');
    // Match tower-buildings.mjs's retained service sash: three columns,
    // two thin crossbars and the heavier central meeting rail (twelve panes).
    for(const side of [-1,1]){
     box(cream,[.065,height,.07],[westX+.31,cy,h.z+side*h.w/2],'Inner sash side frame');
     box(cream,[.065,.07,h.w+.06],[westX+.31,cy+side*height/2,h.z],'Inner sash top bottom frame');
     box(cream,[.065,height,.025],[westX+.31,cy,h.z+side*h.w/6],'Inner sash muntin');
     box(cream,[.065,.03,h.w],[westX+.31,cy+side*height/6,h.z],'Inner sash crossbar');
    }
    box(cream,[.065,.065,h.w],[westX+.31,cy,h.z],'Inner sash meeting rail');
    box(cream,[.3,.13,h.w+.2],[westX+.36,h.y0-.065,h.z],'Stone window sill');
   }
   z=h.z+h.w/2;}
  panel([westX+.265,z],[westX+.265,z1],.04,5.05,finish,'Corridor painted brick',false,.045);
 }
  westWall(-50.1,-26.6);
  const outline=TOWER_WORKSHOPS.workshopOutline;
  const towerHalf=ESCAPE_WATER_TOWER.width/2,towerEast=ESCAPE_WATER_TOWER.x+towerHalf,towerSouth=ESCAPE_WATER_TOWER.z+towerHalf;
  // The tower itself encloses these two edges. Retain its actual photographed
  // brickwork, arch, repairs and corner strips, without a stores wall in front.
  const towerEdge=(a,b)=>(Math.abs(a[1]-towerSouth)<1e-6&&Math.abs(b[1]-towerSouth)<1e-6&&Math.min(a[0],b[0])>=ESCAPE_WATER_TOWER.x-towerHalf-1e-6&&Math.max(a[0],b[0])<=towerEast+1e-6)||
   (Math.abs(a[0]-towerEast)<1e-6&&Math.abs(b[0]-towerEast)<1e-6&&Math.min(a[1],b[1])>=ESCAPE_WATER_TOWER.z-towerHalf-1e-6&&Math.max(a[1],b[1])<=towerSouth+1e-6);
 const neighbors=[...TOWER_RANGES.map(r=>r.rect),[MAIN_KITCHEN.minX,MAIN_KITCHEN.minZ,MAIN_KITCHEN.maxX,MAIN_KITCHEN.maxZ],...ADMIN_OS_RANGES.map(r=>[...adminMapPoint(r.rect[0],r.rect[1]),...adminMapPoint(r.rect[2],r.rect[3])])];
  const isExposed=(x,z)=>!neighbors.some(([x0,z0,x1,z1])=>x>x0+.01&&x<x1-.01&&z>z0+.01&&z<z1-.01);
  function outerWall(a,b){if(a[1]===b[1]&&Math.min(a[0],b[0])<galleryRight&&Math.max(a[0],b[0])>galleryLeft){const direction=Math.sign(b[0]-a[0]);if(a[0]<galleryLeft||a[0]>galleryRight)outerWall(a,[direction>0?galleryLeft:galleryRight,a[1]]);if(b[0]<galleryLeft||b[0]>galleryRight)outerWall([direction>0?galleryRight:galleryLeft,b[1]],b);return;}if(a[0]===westX&&b[0]===westX||towerEdge(a,b)||a[0]===b[0]&&[galleryLeft,galleryRight].includes(a[0]))return;
  // The continuous west facade owns this corner. Bury the return's cut end
  // inside its masonry instead of leaving a second face at the same depth.
  if(a[0]===westX)a=[westX+.24,a[1]];if(b[0]===westX)b=[westX+.24,b[1]];
  const exposed=!(a[0]===153.6&&b[0]===153.6)||Math.min(a[1],b[1])<-26.6;
  const joins=corridorWallJoins(a,b,[plan.outline]);
  if(exposed&&addWorkshopArchedWall(THREE,{group,a,b,resources,brick:outsideBrick,finish,reveal,material,dark,isExposed,joins}))return;
  masonry(a,b,0,8.84,'Tower stores outer masonry');const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),offset=.265;
  const ia=[a[0]-dz/length*offset,a[1]+dx/length*offset],ib=[b[0]-dz/length*offset,b[1]+dx/length*offset];panel(ia,ib,.04,5.05,finish,'Workshop outer-wall lining',false,.045,{...joins,offset});}
  for(let i=0;i<outline.length;i++)outerWall(outline[i],outline[(i+1)%outline.length]);
 // The gallery owns this exposed face after the wider stores shell is cut.
 // Its lower arched wall stops at the interior ceiling; close the unused
 // upper bay to the retained flat roof instead of exposing sky beneath it.
 masonry([galleryRight,-40.5],[galleryRight,-16.6],gallery.height,8.84,'Stores gallery upper masonry');
 masonry([galleryRight,-16.6],[galleryLeft,-16.6],gallery.height,8.84,'Stores gallery upper end return');
 const galleryJoin={ridge:FARNDON_CORRIDOR.x,height:x=>gallery.height+.06+FARNDON_CORRIDOR.rise-FARNDON_CORRIDOR.rise*Math.abs(x-FARNDON_CORRIDOR.x)/(x<FARNDON_CORRIDOR.x?FARNDON_CORRIDOR.x-galleryLeft+.22:FARNDON_CORRIDOR.width/2+.22)};
 if(galleryRoof)addWorkshopGalleryRoof(THREE,{group,resources,gallery,roof:galleryRoof,brick:outsideBrick,ridge:galleryRidge??red,masonry,segments:[
  {z0:Math.max(gallery.minZ,FARNDON_CORRIDOR.endZ),z1:-74.1,capStart:true,startJoin:galleryJoin},
  {z0:-16.6,z1:Math.min(gallery.maxZ,FARNDON_CORRIDOR.startZ),capEnd:true,endJoin:galleryJoin}
 ]});
 closeWorkshopAdminBay(THREE,{group,resources,gallery,roof:entranceRoof??galleryRoof,brick:outsideBrick,masonry});
 // The retained tower supplies these internal walls, including its projecting
 // plinth. Add trim to the inward face without modifying the tower source.
 for(let i=0;i<outline.length;i++){
  const a=outline[i],b=outline[(i+1)%outline.length];if(!towerEdge(a,b))continue;
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length;
  // The bricked ground arch has a 3.5-wide sill projecting .30 from the
  // shaft. Carry the board around its footprint as well as the .075 plinth.
  const centre=Math.abs(dx)>Math.abs(dz)?ESCAPE_WATER_TOWER.x:ESCAPE_WATER_TOWER.z,origin=Math.abs(dx)>Math.abs(dz)?a[0]:a[1],direction=Math.abs(dx)>Math.abs(dz)?ux:uz;
  const cuts=[0,length,...[-1.75,1.75].map(d=>(centre+d-origin)/direction).filter(t=>t>0&&t<length)].sort((a,b)=>a-b);
  const point=(t,offset)=>[a[0]+ux*t-uz*offset,a[1]+uz*t+ux*offset];let previous;
  for(let j=1;j<cuts.length;j++){
   const mid=origin+direction*(cuts[j]+cuts[j-1])/2,offset=(Math.abs(mid-centre)<1.75?.30:.075)+.0225;
   if(previous!==undefined&&previous!==offset)panel(point(cuts[j-1],previous),point(cuts[j-1],offset),.04,.18,dark,'Tower plinth skirting return',false,.045);
   panel(point(cuts[j-1],offset),point(cuts[j],offset),.04,.18,dark,'Tower internal-wall skirting',false,.045);previous=offset;
  }
 }
 // Close the upper, unused service bays; all three rooms open onto the passage.
 const wall=(a,b)=>panel(a,b,.04,5.05,finish,'Workshop partition');
 function doorway(a,b,at,width=ROOM_DOOR_WIDTH,height=WORKSHOP_DOOR_HEAD){const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length,start=[at[0]-ux*width/2,at[1]-uz*width/2],end=[at[0]+ux*width/2,at[1]+uz*width/2];wall(a,start);wall(end,b);panel(start,end,height,5.05,finish,'Workshop doorway header');
  for(const p of [start,end]){const o=box(timber,[.13,height,.28],[p[0],height/2,p[1]],'Worn timber door jamb');o.rotation.y=-Math.atan2(dz,dx);}
  panel(start,end,height-.04,height,timber,'Timber doorway lintel',false,.3);
 }
  // Butt the vestibule partition against the south-east corner strip. Its
  // front projects .105 beyond the shaft; below Y=.3 the plinth projects .075.
  // The stepped end meets both surfaces without cutting into either one.
  doorway([passageLeft,-43.5],[passageLeft,-36.4],[passageLeft,-40]);doorway([passageLeft,-36.4],[passageLeft,-26.9],[passageLeft,-31.5]);
 // Interior partition ends meet the inside of the enclosing masonry, so
 // their painted end caps cannot compete with the exterior brick surface.
 wall([westX+.24,-43.5],[passageLeft,-43.5]);wall([westX+.24,-36.4],[passageLeft,-36.4]);wall([westX+.24,-26.9],[passageLeft,-26.9]);
 // A straight room boundary closes the former unoccupied L-shaped side bay.
 doorway([passageRight,-60.035],[passageRight,-40.5],[passageRight,-48.5]);wall([passageRight,-40.5],[passageRight,-26.6]);
 panel([passageRight,-40.765],[galleryRight,-40.765],.04,5.05,finish,'Machine workshop flush corner return',false,.045);
 // Continue the same finished faces through both corridor/room junctions.
 wall([passageLeft,-26.9],[passageLeft,-26.6]);
 // The network owns one joined ceiling and floor, including the rooms.
 const network=addEscapeCorridors(THREE,{group,workshopOutline:outline,resources,brick:outsideBrick,finish,reveal,paint:cream,dark,floor,timber,metal,box,panel,material,isExposed,runs,polygons,gallery,...(explore?{doors:EXPLORE_CORRIDOR_DOORS,entrance:{...EXPLORE_CORRIDOR_ENTRANCE,roofMaterial:entranceRoof,brickMaterial:entranceBrick},irbyEntrance:{...EXPLORE_IRBY_ENTRANCE,roofMaterial:irbyRoof,brickMaterial:irbyBrick}}:{})});
 function bench(x,z,length=3.5){box(timber,[1.1,.13,length],[x,1,z],'Workshop bench top');for(const dx of [-.4,.4])for(const dz of [-length/2+.18,length/2-.18])box(timber,[.12,.95,.12],[x+dx,.5,z+dz],'Bench leg');box(timber,[.85,.08,length-.25],[x,.26,z],'Bench lower shelf');block(x,z,1.1,length,1.07);}
 const leftMachineX=passageRight+1.9;
 const westBox=(m,size,p,name)=>box(m,size,[p[0]+westShift,p[1],p[2]],name);
 bench(147.3+westShift,-40.2,4.8);bench(147.3+westShift,-30.8,4.4);bench(176.8,-45.5,6);
 // A vice with separate jaws and screw; no giant box impersonating a machine.
 westBox(metal,[.3,.12,.45],[147.65,1.14,-38.7],'Bench vice base');westBox(metal,[.17,.23,.32],[147.76,1.29,-38.7],'Fixed vice jaw');westBox(metal,[.12,.2,.32],[148.05,1.29,-38.7],'Moving vice jaw');westBox(metal,[.5,.035,.04],[148,1.19,-38.7],'Vice screw');westBox(metal,[.025,.28,.035],[148.25,1.2,-38.7],'Vice screw handle');
 // Pegboard, spanners, shelving, oil tins and spare parts.
 westBox(timber,[5.5,1.6,.12],[150.4,2.13,-43.33],'Workshop tool board');
 for(let i=0;i<9;i++){const x=148.4+i*.46;westBox(metal,[.045,.4+(i%3)*.07,.045],[x,2.25,-43.22],'Hanging spanner');westBox(metal,[.15,.07,.045],[x,2.49+(i%3)*.035,-43.22],'Open spanner jaw');}
 for(const y of [.3,1,1.7,2.4])westBox(timber,[1.1,.09,3],[151.6,y,-34.45],'Parts shelf');for(const z of [-35.85,-33.05]){westBox(metal,[.065,2.5,.065],[151.1,1.25,z],'Shelf upright');westBox(metal,[.065,2.5,.065],[152.1,1.25,z],'Shelf upright');}block(151.6+westShift,-34.45,1.1,3,2.5);
 for(const y of [.47,1.17,1.87])for(let i=0;i<4;i++)westBox(i%2?blue:red,[.6,.24,.52],[151.6,y,-35.55+i*.77],'Spare parts bin');
 for(const z of [-28.9,-32.2]){westBox(blue,[.32,.43,.34],[147.3,1.32,z],'Sealed oil tin');westBox(metal,[.11,.035,.12],[147.3,1.55,z],'Oil tin cap');}
 box(blue,[1.8,2.3,.65],[171.3,1.2,-41.25],'Workshop parts cabinet');block(171.3,-41.25,1.8,.65,2.35);for(const y of [.5,1.15,1.8])box(metal,[1.65,.025,.045],[171.3,y,-41.59],'Cabinet drawer handle');
 box(metal,[.85,.12,.8],[176.8,1.15,-44.2],'Drill press foot');box(metal,[.1,1.2,.1],[177.1,1.76,-44.2],'Drill press column');box(blue,[.55,.32,.42],[176.93,2.35,-44.2],'Drill press head');box(metal,[.04,.65,.04],[176.65,1.95,-44.2],'Drill spindle');box(metal,[.55,.07,.5],[176.65,1.58,-44.2],'Drill table');
 // A second station and an assembly table furnish the larger machine room.
 box(blue,[4.4,.75,1.15],[167,.46,-55.4],'Lathe cabinet');box(metal,[4.6,.18,.7],[167,.94,-55.4],'Lathe bed');block(167,-55.4,4.6,1.15,1.7);
 for(const [x,w] of [[165.3,.55],[168.7,.4]])box(blue,[w,.6,.65],[x,1.3,-55.4],'Lathe headstock');box(metal,[2.3,.1,.13],[167.2,1.29,-55.4],'Lathe work spindle');box(metal,[.5,.23,.58],[166.9,1.1,-55.4],'Lathe tool slide');
 const wheelGeometry=new THREE.TorusGeometry(.15,.024,6,16);resources.add(wheelGeometry);for(const x of [165.3,166.9,168.7]){const wheel=new THREE.Mesh(wheelGeometry,metal);wheel.position.set(x,1.18,-54.97);wheel.name='Lathe handwheel';wheel.userData.noWalkingCollision=true;group.add(wheel);}
 box(timber,[4.2,.13,1.6],[166.2,1,-43.1],'Assembly table top');for(const x of [164.4,168])for(const z of [-43.7,-42.5])box(timber,[.14,.95,.14],[x,.5,z],'Assembly table leg');block(166.2,-43.1,4.2,1.6,1.07);
 for(let i=0;i<4;i++)box(metal,[.45,.25,.55],[164.8+i*.75,1.19,-43.1],'Bench machine component');
 box(timber,[3.2,.14,1.8],[166.8,1,-50.9],'Machine assembly island top');for(const x of [165.45,168.15])for(const z of [-51.6,-50.2])box(metal,[.12,.94,.12],[x,.5,z],'Assembly island leg');box(timber,[2.9,.09,1.55],[166.8,.3,-50.9],'Assembly island lower shelf');block(166.8,-50.9,3.2,1.8,1.08);
 box(metal,[.7,.2,.55],[166.2,1.2,-50.9],'Island vice base');for(const x of [165.96,166.44])box(metal,[.14,.22,.55],[x,1.4,-50.9],'Island vice jaw');box(metal,[1,.045,.045],[166.35,1.3,-50.9],'Island vice screw');box(metal,[.035,.3,.035],[166.86,1.3,-50.9],'Island vice handle');
 for(let i=0;i<3;i++){box(metal,[.36,.23,.36],[167.25+i*.35,1.22,-51.25],'Island gear housing');box(blue,[.5,.35,.55],[166.8+i*.6,.53,-50.9],'Island parts tray');}
 // Distinct stations make the machine room useful across its full rectangle,
 // leaving a clear central route from the door between the working aisles.
 const machine=new THREE.Group();machine.name='Machine workshop milling station';machine.position.set(173.3,0,-54.6);group.add(machine);
 box(blue,[1.65,.8,1.35],[0,.44,0],'Milling machine base',machine);box(blue,[.7,1.75,.7],[.3,1.65,-.32],'Milling machine column',machine);box(metal,[2.2,.17,.8],[0,1.22,.25],'Milling cross-slide table',machine);box(blue,[.85,.45,.85],[.12,2.5,-.04],'Milling machine head',machine);box(metal,[.09,.63,.09],[.12,2.03,.3],'Milling spindle',machine);box(metal,[.48,.22,.4],[-.2,1.41,.3],'Milling table vice',machine);block(173.3,-54.6,2.2,1.65,2.75);
 for(const [x,z] of [[173.3,-53.74],[172.55,-54.6]]){const wheel=new THREE.Mesh(wheelGeometry,metal);wheel.position.set(x,1.15,z);wheel.name='Milling feed handwheel';wheel.userData.noWalkingCollision=true;group.add(wheel);box(metal,[.25,.025,.025],[x,1.15,z],'Milling wheel spoke');}
 bench(leftMachineX,-56.5,4.6);box(metal,[.7,.16,.55],[leftMachineX,1.14,-56.2],'Grinder pedestal');box(blue,[.65,.4,.45],[leftMachineX,1.42,-56.2],'Bench grinder motor');
 bench(leftMachineX,-43.5,3.4);box(timber,[.1,1.2,2.8],[passageRight+.19,2.1,-43.5],'Machine fitting station tool board');for(let i=0;i<5;i++)box(metal,[.07,.5,.07],[passageRight+.3,2.15,-44.5+i*.5],'Fitting station hanging tool');
 const disc=new THREE.CylinderGeometry(.23,.23,.15,20);disc.rotateZ(Math.PI/2);resources.add(disc);for(const x of [leftMachineX-.43,leftMachineX+.43]){const wheel=new THREE.Mesh(disc,dark);wheel.position.set(x,1.43,-56.2);wheel.name='Bench grinder wheel';wheel.userData.noWalkingCollision=true;group.add(wheel);box(metal,[.22,.035,.27],[x,1.26,-55.97],'Grinder tool rest');}
 box(blue,[1.2,1.02,.75],[170.4,.55,-47.2],'Rolling machine tool chest');block(170.4,-47.2,1.2,.75,1.08);for(const y of [.34,.56,.78,.97])box(metal,[.85,.025,.045],[170.4,y,-46.8],'Tool chest drawer pull');
 bench(176.8,-56.4,4.4);for(let i=0;i<4;i++){box(metal,[.25,.3,.25],[176.8,1.22,-57.8+i*.9],'Rack stored shaft bearing');box(metal,[.6,.045,.05],[176.8,1.42,-57.8+i*.9],'Rack stored shaft');}
 box(timber,[.1,1.25,4.7],[passageRight+.19,2.12,-55.4],'Machine workshop tool board');for(let i=0;i<8;i++){box(metal,[.06,.4,.06],[passageRight+.3,2.15,-57.25+i*.5],'Machine board spanner');box(metal,[.06,.075,.17],[passageRight+.3,2.39,-57.25+i*.5],'Machine board spanner jaw');}
 const lamps=[...network.lamps];
 for(const [baseX,z] of [[149.7,-39.5],[ESCAPE_CORRIDOR_X,-50.5],[165,-47.5],[173,-54],[164,-56.5],[149.7,-30.5]]){const x=baseX+(baseX<galleryLeft?westShift/2:0),y=WORKSHOP_GALLERY.ceiling-.24;box(metal,[.24,.07,1.6],[x,y+.07,z],'Ceiling lamp housing');const lamp=material(0xe5d6ad,{emissive:0xffe4ac,emissiveIntensity:1.4}),fixture=box(lamp,[.15,.08,1.4],[x,y,z],'Workshop ceiling lamp');fixture.userData.lamp={x,y:y-.25,z};lamps.push({fixture,...fixture.userData.lamp});}
 const roomDoors=TOWER_WORKSHOPS.rooms.map(room=>{
  const width=ROOM_DOOR_WIDTH,leafWidth=width-.16,height=WORKSHOP_DOOR_HEIGHT,side=room.id==='machine'?1:-1;
  const leaf=new THREE.Group();leaf.name=room.title+' opening door';leaf.position.set(room.door[0],WORKSHOP_DOOR_BASE,room.door[1]-leafWidth/2);group.add(leaf);
  box(timber,[ROOM_DOOR_THICKNESS,height,leafWidth],[0,height/2,leafWidth/2],'Workshop room door leaf',leaf);
  for(const face of [-1,1]){
   for(const y of [.95,2.6])box(dark,[.008,1.1,leafWidth-.28],[face*(ROOM_DOOR_THICKNESS/2+.004),y,leafWidth/2],'Room door recessed panel',leaf);
   box(metal,[.15,.17,.075],[face*.1,1.75,leafWidth-.18],'Room door handle',leaf);
  }
  const plaque=sign(room.title.toUpperCase(),-side*.048,2.6,leafWidth/2,-side*Math.PI/2,1.55,{aged:true});plaque.name=room.title+' door sign';leaf.add(plaque);
  return {id:'workshop-door:'+room.id,title:room.title+' door',x:room.door[0],z:room.door[1],y:1.35,pivot:leaf,side,width:leafWidth};
 });
 const pivot=new THREE.Group();pivot.name='Tower stores opening access door';pivot.position.set(TOWER_WORKSHOPS.entrance.x,.05,-45.575);group.add(pivot);
 box(blue,[.1,3.65,1.65],[0,1.825,.825],'Existing blue stores door leaf',pivot);
 for(const y of [.95,2.6])box(dark,[.025,1.1,1.02],[-.063,y,.825],'Recessed door panel',pivot);box(metal,[.12,.24,.065],[-.085,1.8,1.43],'Stores door handle',pivot);
 const doorSign=sign('Workshop',-.083,2.6,.825,-Math.PI/2,1,{aged:true});doorSign.name='Workshop door sign';pivot.add(doorSign);
 const moving=[pivot,...roomDoors.map(d=>d.pivot),...network.openingDoors.map(d=>d.pivot)];
 exterior.model.add(group);group.updateMatrixWorld(true);batchAerialMeshes(THREE,group,{exclude:moving});cacheAerialTransforms(group);for(const leaf of moving)leaf.traverse(o=>o.matrixAutoUpdate=true);walker.refresh();
 const accessDoor={id:'tower-door',title:'Tower workshops access door',x:TOWER_WORKSHOPS.entrance.x,z:TOWER_WORKSHOPS.entrance.z,y:1.35,pivot,side:1},allDoors=[accessDoor,...roomDoors,...network.openingDoors];
 for(const d of allDoors){d.leaf??=d.pivot.getObjectByName(d===accessDoor?'Existing blue stores door leaf':'Workshop room door leaf');d.motion=null;}
 const shadows=createWorkshopShadowBatches(THREE,exterior.model,{exclude:[...moving,exterior.trees].filter(Boolean)});
 const lighting=createWorkshopLights(THREE,group,lamps,{exterior,doors:allDoors.map(d=>d.leaf),shadowGroup:shadows.group});
 function doorObstacle(d){
  const leaf=d.leaf;leaf.updateWorldMatrix(true,false);leaf.geometry.computeBoundingBox();const b=leaf.geometry.boundingBox;
  const corners=[[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]].map(([x,z])=>{const p=new THREE.Vector3(x,0,z).applyMatrix4(leaf.matrixWorld);return [p.x,p.z];});
  const bounds=new THREE.Box3().setFromObject(leaf);
  return {minX:bounds.min.x,maxX:bounds.max.x,minZ:bounds.min.z,maxZ:bounds.max.z,minY:bounds.min.y,maxY:bounds.max.y,corners};
 }
 return {group,solids,pivot,roomDoors,doors:allDoors,lighting,lockedDoors:network.locked,plan,
  areaAt({x,z}){if(!insidePolygon(x,z,plan.outline))return null;const room=TOWER_WORKSHOPS.rooms.find(r=>x>r.rect[0]&&x<r.rect[2]&&z>r.rect[1]&&z<r.rect[3]);return room?.title??runs.find((r,i)=>containsPoint([x,z],polygons[i]))?.name??'Tower corridor';},
  doorObstacle(){return doorObstacle(accessDoor);},
  doorObstacles(){return allDoors.map(doorObstacle);},
  roomDoorObstacles(){return roomDoors.map(doorObstacle);},
  isOpen(id){const d=allDoors.find(d=>d.id===id);return d.motion?d.motion.target!==0:Math.abs(d.pivot.rotation.y)>.01;},
  setDoorOpen(id,open){const d=allDoors.find(d=>d.id===id),target=open?d.side*Math.PI/2:0,from=d.pivot.rotation.y;d.motion={from,target,elapsed:0,duration:WORKSHOP_DOOR_SECONDS*Math.abs(target-from)/(Math.PI/2)};},
  update(dt,actor){
   if(actor)lighting.update(actor);
   let changed=false;
   for(const d of allDoors){
    const m=d.motion;if(!m||dt<=0)continue;
    const elapsed=Math.min(m.duration,m.elapsed+dt),t=m.duration?elapsed/m.duration:1,angle=m.from+(m.target-m.from)*t*t*(3-2*t),previous=d.pivot.rotation.y;
    // Sample the swept leaf so a slow frame cannot close it through the player.
    const steps=Math.max(1,Math.ceil(Math.abs(angle-previous)/.025));let blocked=false;
    for(let i=1;i<=steps;i++){
     d.pivot.rotation.y=previous+(angle-previous)*i/steps;
     const b=doorObstacle(d);
     if(actor?.outside&&(actor.y??0)<b.maxY&&(actor.y??0)+1.5>b.minY&&obstacleContains(b,actor.x,actor.z,.28)){blocked=true;break;}
    }
    if(blocked){d.pivot.rotation.y=previous;d.pivot.updateMatrixWorld(true);continue;}
    m.elapsed=elapsed;changed||=angle!==previous;if(t===1)d.motion=null;
   }
   if(changed)lighting.invalidate();
   return changed;
  },
  sync(open,opened={}){for(const d of allDoors){d.motion=null;d.pivot.rotation.y=(d===accessDoor?open:opened[d.id])?d.side*Math.PI/2:0;d.pivot.updateMatrixWorld(true);}lighting.invalidate();},
  dispose(){lighting.dispose();shadows.dispose();group.removeFromParent();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.userData.aerialBatch)o.geometry.dispose();});
   if(scopes.length){const batches=[];for(const scope of scopes)scope.traverse(o=>{if(o.userData.aerialBatch)batches.push(o);});for(const b of batches){b.removeFromParent();b.geometry.dispose();}for(const o of remainders)o.removeFromParent();
    for(const [o,parent] of removed)parent.add(o);for(const [o,visible,batched] of sourceStates){if(batched)o.userData.aerialBatchSource=true;else delete o.userData.aerialBatchSource;o.visible=visible;}
    for(const [o,i,m] of editedInstances){o.setMatrixAt(i,m);o.instanceMatrix.needsUpdate=true;}for(const o of new Set(editedInstances.map(([o])=>o))){o.computeBoundingBox();o.computeBoundingSphere();}
    for(const [b,parent] of oldBatches)parent.add(b);for(const scope of scopes)cacheAerialTransforms(scope);}
   walker.refresh();
  }
 };
}
