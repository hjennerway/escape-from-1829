import {TOWER_WORKSHOPS} from '../dist/tower-workshops.mjs';
import {WORKSHOP_GALLERY} from '../dist/workshop-gallery.mjs';

// Survey the actual submitted batches at the cylinder-side roof slot and the
// old wider gallery facade. The new lower windows have their own wall cuts.
export function probeWorkshopExterior(THREE,model){
 model.updateMatrixWorld(true);const meshes=[],leaks=[],floating=[],trim=[],roofLeaks=[],roofStrips=[];
 model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 let probes=0;
 for(const z of [-40.3,-39,-37,-36.31,-36.29,-34,-30,-26,-22,-18,-16.8])for(const y of [5.151,5.3,6,7.5,8.82]){
  const hits=new THREE.Raycaster(new THREE.Vector3(WORKSHOP_GALLERY.maxX+.5,y,z),new THREE.Vector3(-1,0,0),0,.6).intersectObjects(meshes,false);
  probes++;if(!hits.some(h=>Math.abs(h.point.x-WORKSHOP_GALLERY.maxX)<1e-4))leaks.push({z,y,hits:hits.map(h=>h.object.name)});
 }
 for(const x of [WORKSHOP_GALLERY.minX+.3,(WORKSHOP_GALLERY.minX+WORKSHOP_GALLERY.maxX)/2,WORKSHOP_GALLERY.maxX-.3])for(const y of [5.2,7,8.82]){
  const hits=new THREE.Raycaster(new THREE.Vector3(x,y,-16.2),new THREE.Vector3(0,0,-1),0,.5).intersectObjects(meshes,false);
  probes++;if(!hits.some(h=>Math.abs(h.point.z+16.6)<1e-4))leaks.push({x,y,end:true});
 }
 for(const name of ['Straight corridor to Farndon','Tower service buildings'])model.getObjectByName(name)?.traverse(o=>{
  if(name==='Straight corridor to Farndon'&&o.isMesh&&!o.userData.aerialBatch&&/gutter|eaves?|fascia|flashing|downpipe|pipe bracket/i.test(o.name))trim.push(o.name);
  if(!o.userData.aerialWindowAssembly)return;const b=new THREE.Box3().setFromObject(o);
  if(b.min.y<WORKSHOP_GALLERY.height&&b.max.y>0&&name==='Straight corridor to Farndon')floating.push({name:o.name,position:o.getWorldPosition(new THREE.Vector3()).toArray()});
  if(name==='Tower service buildings'&&b.min.y<WORKSHOP_GALLERY.height&&b.max.y>0&&b.min.x<TOWER_WORKSHOPS.workshopOutline[3][0]+.4&&b.max.x>TOWER_WORKSHOPS.westX-.4&&b.min.z<-16.2&&b.max.z>-60.7)floating.push({name:o.name,position:o.getWorldPosition(new THREE.Vector3()).toArray()});
 });
 const {minX,maxX,height}=WORKSHOP_GALLERY,cx=(minX+maxX)/2,half=(maxX-minX)/2+.22;
 const roofY=x=>height+.06+.64-.64*Math.abs(x-cx)/half;
 let roofProbes=0;
 for(const z of [-115,-85,-76,-15,-10,-5,2,8])for(const x of [minX,maxX]){
  const outward=x===minX?-1:1;
  for(const y of [height+.015,roofY(x)-.01]){
   const hits=new THREE.Raycaster(new THREE.Vector3(x+outward*.4,y,z),new THREE.Vector3(-outward,0,0),0,.5).intersectObjects(meshes,false);
   roofProbes++;if(!hits.some(h=>Math.abs(h.point.x-x)<1e-4))roofLeaks.push({x,y,z});
  }
  const hit=new THREE.Raycaster(new THREE.Vector3(x,height+2,z),new THREE.Vector3(0,-1,0),0,2).intersectObjects(meshes,false)[0];
  roofProbes++;if(!hit||Math.abs(hit.point.y-roofY(x))>1e-4)roofLeaks.push({x,z,roof:hit?.object.name,y:hit?.point.y});
 }
 for(const z of [-38,-34,-30,-26,-22,-18]){
  const hits=new THREE.Raycaster(new THREE.Vector3(maxX+1.8,5.16,z),new THREE.Vector3(0,1,0),0,1).intersectObjects(meshes,false);
  if(hits.length)roofStrips.push({z,hits:hits.map(h=>h.object.name)});
 }
 // The Main/admin roof retains its wider ridge. Its join must also be closed
 // above the narrower gallery's lower east pitch.
 for(const x of [cx+.3,156.3,maxX-.05])for(const y of [5.4,5.7]){
  const hits=new THREE.Raycaster(new THREE.Vector3(x,y,10.1),new THREE.Vector3(0,0,-1),0,.4).intersectObjects(meshes,false);
  roofProbes++;if(!hits.some(h=>Math.abs(h.point.z-9.8)<1e-4))roofLeaks.push({x,y,join:true});
 }
 return {probes,leaks,floating,trim,roofProbes,roofLeaks,roofStrips};
}

// Walking-height defects outside the replacement rooms: high orphan decks,
// narrow wall-top openings, and the former sunken grass channel beside them.
export function probeWorkshopYard(THREE,model){
 model.updateMatrixWorld(true);const meshes=[],floating=[],seams=[],ground=[];
 model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 const {maxX}=WORKSHOP_GALLERY;let roofSamples=0,groundSamples=0;
 for(const z of [-39,-37,-35,-32,-29,-27,-24,-21,-18])for(const offset of [.4,1.2,2.2,4]){
  const x=maxX+offset,hits=new THREE.Raycaster(new THREE.Vector3(x,10,z),new THREE.Vector3(0,-1,0),0,5).intersectObjects(meshes,false);
  roofSamples++;if(hits.length)floating.push({x,z,names:hits.map(h=>h.object.name),y:hits[0].point.y});
 }
 for(const x of [maxX+.5,158,159,160.3])for(const z of [6.5,7.2,8,12,13.1]){
  const hits=new THREE.Raycaster(new THREE.Vector3(x,4.8,z),new THREE.Vector3(0,-1,0),0,1.3).intersectObjects(meshes,false);
  roofSamples++;if(hits.some(h=>h.object.material.userData.roofTilePixels||/Connecting corridor slate roof/.test(h.object.name)))floating.push({x,z,names:hits.map(h=>h.object.name)});
 }
 for(const x of [maxX+.08,maxX+.4,157.8,158.25,161,166,174,179.7])for(const y of [8.87,8.95]){
  const hits=new THREE.Raycaster(new THREE.Vector3(x,y,-40.1),new THREE.Vector3(0,0,-1),0,.5).intersectObjects(meshes,false);
  roofSamples++;if(!hits.some(h=>Math.abs(h.point.z+40.5)<.002))seams.push({x,y,names:hits.map(h=>h.object.name)});
 }
 for(const z of [-40.1,-39,-37,-35,-32,-29,-27,-24,-21,-18])for(const offset of [.08,.4,1.2,2.2]){
  const x=maxX+offset,hit=new THREE.Raycaster(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0),0,2).intersectObjects(meshes,false)[0];
  groundSamples++;if(!hit||Math.abs(hit.point.y-.34)>1e-5||!hit.object.material.userData.estateSurface)ground.push({x,z,name:hit?.object.name,y:hit?.point.y});
 }
 return {roofSamples,groundSamples,floating,seams,ground};
}

// Frozen walking-view survey of the owner's Main/admin grass strip and open
// cross-corridor bay. Inspect submitted surfaces, including rebuilt batches.
export function probeWorkshopAdminYard(THREE,model){
 model.updateMatrixWorld(true);const meshes=[],ground=[],wall=[],roof=[],debris=[];
 model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 let groundSamples=0,wallSamples=0,roofSamples=0;
 for(const x of [156.65,156.8,157.5,158.5,159,159.045,159.3,160.3])for(const z of [-16,-14,-10,-6,-5.01,-4.99,-4,0,2,4,6,6.54]){
  const hit=new THREE.Raycaster(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0),0,2).intersectObjects(meshes,false)[0];
  groundSamples++;if(!hit||Math.abs(hit.point.y-.34)>1e-5||hit.object.material.userData.estateSurface!=='asphalt')ground.push({x,z,name:hit?.object.name,y:hit?.point.y});
 }
 const roofY=x=>5.85-.64*Math.abs(x-156.3)/2.92;
 for(const x of [156.65,156.8,157.5,158.5,159,159.4,160,160.42])for(const y of [.1,.34,.5,1,2.2,3.7,4.85,roofY(x)-.035]){
  const hit=new THREE.Raycaster(new THREE.Vector3(x,y,6.3),new THREE.Vector3(0,0,1),0,.32).intersectObjects(meshes,false)[0];
  wallSamples++;if(!hit||Math.abs(hit.point.z-6.6)>1e-4)wall.push({x,y,name:hit?.object.name,z:hit?.point.z});
 }
 for(const x of [157,158,159,160.4])for(const z of [6.62,7,8,9.78]){
  const hit=new THREE.Raycaster(new THREE.Vector3(x,7,z),new THREE.Vector3(0,-1,0),0,3).intersectObjects(meshes,false)[0];
  roofSamples++;if(!hit||Math.abs(hit.point.y-roofY(x))>1e-4||!hit.object.material.userData.roofTilePixels)roof.push({x,z,y:hit?.point.y,name:hit?.object.name});
 }
 model.traverse(o=>{if(!o.isMesh||o.userData.aerialBatch||!/Corridor (?:brick plinth|gutter|downpipe|pipe bracket)/.test(o.name))return;
  const b=new THREE.Box3().setFromObject(o);if(b.min.x>156.64&&b.max.x<160.81&&b.min.z<6.6&&b.max.z>-16.6)debris.push(o.name);
 });
 return {groundSamples,wallSamples,roofSamples,ground,wall,roof,debris};
}
