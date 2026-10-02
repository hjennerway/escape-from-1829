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
 doors.push({...part,label:s.model.name+' '+s.x+','+s.z,normal,right,width:s.w*scale,centre});
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
 doors.push({...part,label:part.object.name+' / '+part.object.parent.name,normal,right,width,centre});
}
// Reception's red double door and the two single inside-corner doors use
// separate decorative builders, so identify their complete coloured leaves.
for(const p of parts){
 const m=p.object.material,colour=m.color?.getHex(),c=p.bounds.getCenter(new THREE.Vector3()),h=p.bounds.max.y-p.bounds.min.y;
 if((colour===0x172e50&&Math.abs(h-2.55)<.01&&Math.abs(c.x)<36&&c.z>15&&c.z<21)||(Math.abs(c.x)<.01&&Math.abs(c.z-19.9)<.01&&Math.abs(h-3.2)<.01))doors.push({...p,label:'1829 bespoke door '+c.x+','+c.z,centre:c,width:Math.abs(c.x)<.01?1.9:.87,normal:new THREE.Vector3(0,0,1),right:new THREE.Vector3(1,0,0)});
}
assert.equal(doors.length,109,'The survey retains every audited door leaf');
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),states=[];
for(const year of [1829,1849,1870,1916,1938,2021]){
 timeline.setPeriod(year);exterior.scene.updateMatrixWorld(true);
 const active=meshes.filter(visible),issues=[];let checked=0;
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
 states.push({year,checked,issues});
}
mkdirSync(new URL('./artifacts/door-supports/',import.meta.url),{recursive:true});
writeFileSync(new URL('./artifacts/door-supports/'+(process.env.DOOR_BASELINE?'baseline-':'')+'threshold-survey.json',import.meta.url),JSON.stringify({doors:doors.length,states},null,2)+'\n');
for(const s of states)console.log(JSON.stringify({...s,issues:[...new Map(s.issues.map(i=>[i.door,i])).values()]}));
assert(states.every(s=>s.issues.length===0),'Every exterior door sill must meet visible ground, a threshold or a platform; see threshold-survey.json');
timeline.setPeriod(1916);
for(const label of ['West','East']){
 const group=exterior.annexe.getObjectByName(label+' mirrored side details'),deck=group.getObjectByName('Fire stair landing'),door=group.getObjectByName('Tower fire exit door');
 const inverse=group.matrixWorld.clone().invert(),localDeck=deck.geometry.boundingBox.clone().applyMatrix4(deck.matrix);
 const stairX=-15*ANNEXE_MAP_SCALE-7,stairZ=-2*ANNEXE_MAP_SCALE+6-17*.36;
 const decks=[deck,group.getObjectByName('Fire stair door walkway')];
 for(const [a,b] of [[[door.position.x-.3,-.2],[-29.78,-.2]],[[-29.78,-.2],[-29.78,-4]],[[-29.78,-4],[stairX,-4]],[[stairX,-4],[stairX,stairZ]]])for(let i=0;i<=20;i++){
  const t=i/20,p=new THREE.Vector3(a[0]+(b[0]-a[0])*t,5.5,a[1]+(b[1]-a[1])*t).applyMatrix4(group.matrixWorld);
  ray.set(p,down);const hit=ray.intersectObjects(decks)[0];assert(hit&&Math.abs(hit.point.clone().applyMatrix4(inverse).y-5.125)<1e-5,'Annexe deck continuously joins its door to the top tread');
 }
 // A facade band must not cut across the relocated doorway. Start on the
 // landing, inside its outer guard, rather than beyond the new balustrade.
 for(const y of [5.3,6.2,7.4,7.8]){
  const p=new THREE.Vector3(door.position.x-.6,y,-.2).applyMatrix4(group.matrixWorld),direction=new THREE.Vector3(1,0,0).transformDirection(group.matrixWorld);ray.set(p,direction);
  const hit=ray.intersectObjects(meshes.filter(visible),false)[0];assert(hit?.object===door,'Annexe fire door remains visible through the facade bands; hit '+hit?.object.name);
 }
 assert(localDeck.min.x<stairX&&localDeck.min.z<stairZ,'Deck overlaps the top stair in plan');
 const topTread=group.children.filter(o=>o.name==='Blue external stair tread').sort((a,b)=>b.position.y-a.position.y)[0];
 assert(5.125-(topTread.position.y+topTread.geometry.parameters.height/2)<.3,'Top stair rise remains consistent with the flight');
}
console.log(`PASS: ${doors.length} exterior door leaves meet visible support across six estate periods.`);
