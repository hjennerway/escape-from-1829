import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';

// Record the authored door schedules without adding audit state to the game.
// The checks below find the actual rendered leaf and ray-test its whole sill.
const shared=[];
globalThis.recordExteriorDoor=(model,x,z,r,bottom)=>shared.push({model,x,z,r,bottom,w:1.42,h:2.72,offset:.1});
registerHooks({load(url,context,next){
 const result=next(url,context);
 const name=url.split('/').at(-1),saved=new URL('./artifacts/door-supports/before-'+name,import.meta.url);
 if(process.env.DOOR_TRIM_BASELINE&&['west-front-photo-detail.mjs','annexe-larkton-recess.mjs'].includes(name))return {...result,source:readFileSync(new URL('./artifacts/door-trim/before-'+name,import.meta.url),'utf8')};
 if(process.env.DOOR_BASELINE&&existsSync(saved))return {...result,source:readFileSync(saved,'utf8')};
 if(url.endsWith('/photo-detail-primitives.mjs'))return {...result,source:readFileSync(new URL(url),'utf8').replace('function door(x,z,rotation=0,bottom=0){','function door(x,z,rotation=0,bottom=0){ globalThis.recordExteriorDoor(model,x,z,rotation,bottom);')};
 if(url.endsWith('/tower-buildings.mjs'))return {...result,source:readFileSync(new URL(url),'utf8').replace('openings.push({x,y,z,r,label,placement});\n }','openings.push({x,y,z,r,label,placement,w,h,door:true});\n }')};
 return result;
}});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const {createEscapeExterior}=await import('./dist/escape-exterior.mjs');
const {createAerialLayouts}=await import('./dist/aerial-layouts.mjs');
const {prepareEstateTimeline}=await import('./dist/estate-timeline.mjs');
const {ANNEXE_MAP_SCALE}=await import('./dist/annexe.mjs');
const exterior=createEscapeExterior(THREE,1.6),layouts=createAerialLayouts(THREE,exterior);
const timeline=prepareEstateTimeline(THREE,exterior,layouts);timeline.setPeriod(2021);
exterior.scene.updateMatrixWorld(true);
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
const meshes=[],parts=[],instance=new THREE.Matrix4();
exterior.model.traverse(o=>{
 if(!o.isMesh)return;
 for(let p=o;p;p=p.parent)if(p===exterior.trees)return;
 meshes.push(o);
 if(o.geometry.type!=='BoxGeometry')return;
 if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
 for(let i=0;i<(o.isInstancedMesh?o.count:1);i++){
  if(o.isInstancedMesh)o.getMatrixAt(i,instance);else instance.identity();
  const world=new THREE.Matrix4().multiplyMatrices(o.matrixWorld,instance),bounds=o.geometry.boundingBox.clone().applyMatrix4(world);
  if(bounds.max.y-bounds.min.y<1.5)continue;
  parts.push({object:o,index:o.isInstancedMesh?i:null,bounds,world});
 }
});
const schedules=[...shared];
for(const s of shared.filter(s=>s.model===exterior.farndonWard))schedules.push({...s,model:exterior.witbyWard});
for(const o of exterior.churtonWard.userData.openings.filter(o=>o.door))schedules.push({model:exterior.churtonWard,...o,r:o.rotation,bottom:o.y-o.h/2,offset:.09});
for(const model of exterior.greenhouses.userData.buildings)for(const o of model.userData.openings.filter(o=>o.kind==='door'))schedules.push({model,x:-.08,z:o.z,r:-Math.PI/2,bottom:o.y-o.height/2,w:o.width,h:o.height,offset:0});
for(const model of [exterior.garagesMortuary.userData.garages,exterior.garagesMortuary.userData.mortuary])for(const o of model.userData.openings.filter(o=>o.kind!=='window'))schedules.push({model,...o,z:o.z-.075,r:Math.PI,bottom:o.y-o.h/2,offset:0});
const services=exterior.model.getObjectByName('Tower service buildings');
for(const o of services.userData.openings.filter(o=>o.door))schedules.push({model:services,...o,bottom:o.y-o.h/2,offset:.09,w:o.label.startsWith('Enlarged west workshop')?o.w*1.5:o.w});
const doors=[];
for(const s of schedules){
 const normal=new THREE.Vector3(Math.sin(s.r),0,Math.cos(s.r)).transformDirection(s.model.matrixWorld);
 const right=new THREE.Vector3(Math.cos(s.r),0,-Math.sin(s.r)).transformDirection(s.model.matrixWorld);
 const centre=s.model.localToWorld(new THREE.Vector3(s.x+Math.sin(s.r)*s.offset,s.bottom+s.h/2,s.z+Math.cos(s.r)*s.offset));
 const top=s.model.localToWorld(new THREE.Vector3(s.x,s.bottom+s.h,s.z)).y;
 const part=parts.find(p=>{const c=p.bounds.getCenter(new THREE.Vector3());return Math.hypot(c.x-centre.x,c.z-centre.z)<.025&&Math.abs(p.bounds.max.y-top)<.015;});
 assert(part,'Find actual door leaf: '+JSON.stringify({group:s.model.name,x:s.x,z:s.z}));
 const scale=new THREE.Vector3().setFromMatrixScale(s.model.matrixWorld).x;
 doors.push({...part,label:s.model.name+' '+s.x+','+s.z,normal,right,width:s.w*scale,centre,
  glazingRails:s.model===exterior.churtonWard?[s.model.localToWorld(new THREE.Vector3(s.x,s.y+s.h*.24,s.z)).y]:[]});
}
const named=new Map([
 ['West side basement end door',[-1,0,0]],['West courtyard lean-to side door',[0,0,1]],
 ['Redesmere roof-access door',[0,0,1]],['Timber double entrance door',[0,0,1]],
 ['Main kitchen service door',[-1,0,0]],['Corridor front timber door',[0,0,1]],
 ['Recess shadowed entrance door',[0,0,1]],['Recess pale room door',[0,0,1]],
 ['Entrance recessed double door',[0,0,1]],['West pavilion door',[0,0,1]],['East pavilion door',[0,0,1]],
 ['Tower fire exit door',[-1,0,0]],['Glazed entrance',[0,0,-1]]
]);
for(const part of parts.filter(p=>!p.object.isInstancedMesh&&named.has(p.object.name))){
 const normal=new THREE.Vector3(...named.get(part.object.name)).transformDirection(part.world);
 const right=new THREE.Vector3(normal.z,0,-normal.x),centre=part.bounds.getCenter(new THREE.Vector3());
 const local=part.object.geometry.boundingBox,size=local.getSize(new THREE.Vector3()),scale=new THREE.Vector3().setFromMatrixScale(part.world);
 const width=size.x<size.z?size.z*scale.z:size.x*scale.x;
 doors.push({...part,label:part.object.name+' / '+part.object.parent.name,normal,right,width,centre,
  glazingRails:part.object.name==='Glazed entrance'&&part.object.parent===exterior.churtonWard?[1.4,2.7].map(y=>exterior.churtonWard.localToWorld(new THREE.Vector3(11.1,y,-17.15)).y):[]});
}
// Reception's red double door and the two single inside-corner doors use
// separate decorative builders, so identify their complete coloured leaves.
for(const p of parts){
 const m=p.object.material,colour=m.color?.getHex(),c=p.bounds.getCenter(new THREE.Vector3()),h=p.bounds.max.y-p.bounds.min.y;
 if((colour===0x172e50&&Math.abs(h-2.55)<.01&&Math.abs(c.x)<36&&c.z>15&&c.z<21)||(Math.abs(c.x)<.01&&Math.abs(c.z-19.9)<.01&&Math.abs(h-3.2)<.01))doors.push({...p,label:'1829 bespoke door '+c.x+','+c.z,centre:c,width:Math.abs(c.x)<.01?1.9:.87,normal:new THREE.Vector3(0,0,1),right:new THREE.Vector3(1,0,0)});
}
assert.equal(doors.length,109,'The survey retains every audited door leaf');
// Survey horizontal trim against the rendered leaves in each door's axes,
// including reflected/rotated wings and individual instances. Broad paving
// and platforms are support surfaces; Churton's authored transom/glazing
// rails are part of its doors. Neither is an unwanted projecting sill.
const horizontalParts=[];
for(const object of meshes){
 if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
 for(let i=0;i<(object.isInstancedMesh?object.count:1);i++){
  if(object.isInstancedMesh)object.getMatrixAt(i,instance);else instance.identity();
  const world=new THREE.Matrix4().multiplyMatrices(object.matrixWorld,instance),bounds=object.geometry.boundingBox.clone().applyMatrix4(world);
  const height=bounds.max.y-bounds.min.y;
  if(height>.01&&height<.4)horizontalParts.push({object,index:object.isInstancedMesh?i:null,bounds,world});
 }
}
function authoredDoorRail(door,part,y){
 const colour=part.object.material.color?.getHex();
 // Ribs and rails are deliberately modelled on these garage/service leaves.
 if([exterior.garagesMortuary.userData.garages,exterior.garagesMortuary.userData.mortuary].includes(part.object.parent)&&[0x477286,0x93bacb].includes(colour))return true;
 if(part.object.parent===services&&colour===0x28778d&&[2.77,3.21].some(h=>Math.abs(h-y)<.01))return true;
 if(part.object.parent===exterior.churtonWard&&door.glazingRails?.some(h=>Math.abs(h-y)<.01))return true;
 if(door.label.endsWith(' -39,43.09')&&colour===0xd3dcd8&&[5.45,6.85].some(h=>Math.abs(h-y)<.01))return true;
 if(door.object.name==='Redesmere roof-access door'&&colour===0xd3dcd8&&[1.28,1.67,2.06,2.45].some(h=>Math.abs(9.645+h-y)<.01))return true;
 return door.object.name==='Recess pale room door'&&part.object.name==='Recess sash bar';
}
const crossingTrim=[];
for(const door of doors){
 const inverse=new THREE.Matrix4().makeBasis(door.right,new THREE.Vector3(0,1,0),door.normal).setPosition(door.centre).invert();
 const leaf=door.object.geometry.boundingBox.clone().applyMatrix4(inverse.clone().multiply(door.world));
 for(const part of horizontalParts){
  if(part.object===door.object&&part.index===door.index||!part.bounds.intersectsBox(door.bounds.clone().expandByScalar(.3)))continue;
  const b=part.object.geometry.boundingBox.clone().applyMatrix4(inverse.clone().multiply(part.world));
  if(b.max.z-b.min.z>.65||b.min.x>leaf.min.x+.12||b.max.x<leaf.max.x-.12)continue;
  if(b.min.y<=leaf.min.y+.04||b.max.y>=leaf.max.y-.04||b.max.z<leaf.max.z+.005||b.min.z>leaf.max.z+.35)continue;
  const y=part.bounds.getCenter(new THREE.Vector3()).y;
  if(authoredDoorRail(door,part,y))continue;
  crossingTrim.push({door,part,y});
 }
}
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),states=[];
for(const year of [1829,1849,1870,1916,1938,2021]){
 timeline.setPeriod(year);exterior.scene.updateMatrixWorld(true);
 const active=meshes.filter(visible),issues=[],trimIssues=[];let checked=0;
 for(const {door,part,y} of crossingTrim){
  if(!visible(door.object)||!visible(part.object))continue;
  // Confirm the actual surface spans the leaf: bounding boxes alone can
  // include empty fragments of a clipped or angled facade course.
  const blocked=[-.35,0,.35].every(u=>{
   const point=door.centre.clone().addScaledVector(door.normal,.6).addScaledVector(door.right,door.width*u);point.y=y;
   ray.set(point,door.normal.clone().negate());ray.far=.9;
   return ray.intersectObject(part.object,false).some(h=>(h.instanceId??null)===part.index&&h.distance<.58);
  });
  if(blocked)trimIssues.push({door:door.label,trim:part.object.name,instance:part.index,y});
 }
 for(const d of doors){
  if(!visible(d.object))continue;checked++;
  const y=d.bounds.min.y;
  for(const u of [-.4,0,.4]){
   const point=d.centre.clone().addScaledVector(d.normal,.2).addScaledVector(d.right,d.width*u);point.y=y+.5;
   ray.set(point,down);
   const hit=ray.intersectObjects(active,false).find(h=>h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.5&&(h.object!==d.object||(h.instanceId??null)!==d.index));
   const gap=hit?y-hit.point.y:Infinity;
   if(gap>.025)issues.push({door:d.label,point:point.toArray(),bottom:y,support:hit?.object.name,supportY:hit?.point.y,gap});
  }
 }
 states.push({year,checked,issues,trimIssues});
}
mkdirSync(new URL('./artifacts/door-supports/',import.meta.url),{recursive:true});
writeFileSync(new URL(process.env.DOOR_TRIM_BASELINE?'./artifacts/door-trim/baseline-survey.json':'./artifacts/door-supports/'+(process.env.DOOR_BASELINE?'baseline-':'')+'threshold-survey.json',import.meta.url),JSON.stringify({doors:doors.length,states},null,2)+'\n');
for(const s of states)console.log(JSON.stringify({...s,issues:[...new Map(s.issues.map(i=>[i.door,i])).values()]}));
assert(states.every(s=>s.issues.length===0),'Every exterior door sill must meet visible ground, a threshold or a platform; see threshold-survey.json');
assert(states.every(s=>s.trimIssues.length===0),'No unintended horizontal sill or facade strip crosses an exterior door; see threshold-survey.json');
timeline.setPeriod(1916);
for(const label of ['West','East']){
 const group=exterior.annexe.getObjectByName(label+' mirrored side details'),deck=group.getObjectByName('Fire stair landing'),door=group.getObjectByName('Tower fire exit door');
 const inverse=group.matrixWorld.clone().invert(),localDeck=deck.geometry.boundingBox.clone().applyMatrix4(deck.matrix);
 const stairX=-15*ANNEXE_MAP_SCALE-7,stairZ=-2*ANNEXE_MAP_SCALE+6-17*.36;
 const landingEdge=stairZ-.21;
 const decks=[deck,group.getObjectByName('Fire stair door walkway')];
 for(const [a,b] of [[[door.position.x-.3,-.2],[-29.78,-.2]],[[-29.78,-.2],[-29.78,-4]],[[-29.78,-4],[stairX,-4]],[[stairX,-4],[stairX,landingEdge]]])for(let i=0;i<=20;i++){
  const t=i/20,p=new THREE.Vector3(a[0]+(b[0]-a[0])*t,5.5,a[1]+(b[1]-a[1])*t).applyMatrix4(group.matrixWorld);
  ray.set(p,down);const hit=ray.intersectObjects(decks)[0];assert(hit&&Math.abs(hit.point.clone().applyMatrix4(inverse).y-5.125)<1e-5,'Annexe deck continuously joins its door to the top tread');
 }
 // A facade band must not cut across the relocated doorway. Start on the
 // landing, inside its outer guard, rather than beyond the new balustrade.
 for(const y of [5.3,6.2,7.4,7.8]){
  const p=new THREE.Vector3(door.position.x-.6,y,-.2).applyMatrix4(group.matrixWorld),direction=new THREE.Vector3(1,0,0).transformDirection(group.matrixWorld);ray.set(p,direction);
  const hit=ray.intersectObjects(meshes.filter(visible),false)[0];assert(hit?.object===door,'Annexe fire door remains visible through the facade bands; hit '+hit?.object.name);
 }
 assert(localDeck.min.x<stairX&&localDeck.max.x>stairX,'Turning deck spans the full flight mouth');
 assert(Math.abs(localDeck.max.z-landingEdge)<1e-6,'Deck meets the top tread edge without covering its rising surface');
 const topTread=group.children.filter(o=>o.name==='Blue external stair tread').sort((a,b)=>b.position.y-a.position.y)[0];
 assert(5.125-(topTread.position.y+topTread.geometry.parameters.height/2)<.3,'Top stair rise remains consistent with the flight');
}
console.log(`PASS: ${doors.length} exterior door leaves meet visible support and have no unintended crossing sill strips across six estate periods.`);
