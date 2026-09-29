import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {groundBuildingBases} from './dist/building-grounding.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6),authored=[];
e.model.updateMatrixWorld(true);
e.model.traverse(o=>{
 if(!o.isMesh)return;
 for(let p=o;p;p=p.parent)if(p===e.trees)return;
 authored.push({o,geometry:o.geometry,matrix:o.matrixWorld.clone(),instances:o.instanceMatrix?.array.slice()});
});
const l=createAerialLayouts(THREE,e);
e.scene.updateMatrixWorld(true);
// Check the actual assembly step, independently of its selection heuristics:
// upper vertices, footprints and all transforms except lower box extents stay
// exact. Shared source geometries must not be mutated in place.
let extended=0;
for(const {o,geometry,matrix,instances} of authored){
 if(o.geometry!==geometry){
  const a=geometry.attributes.position,b=o.geometry.attributes.position;
  assert.equal(a.count,b.count,'Foundation closure retains mesh topology');
  geometry.computeBoundingBox();const bottom=geometry.boundingBox.min.y;
  for(let i=0;i<a.count;i++){
   assert(Math.abs(a.getX(i)-b.getX(i))<1e-5&&Math.abs(a.getZ(i)-b.getZ(i))<1e-5,'Footprints do not move');
   if(Math.abs(a.getY(i)-bottom)<1e-4)assert(b.getY(i)<=a.getY(i),'Only extend foundations downwards');
   else {assert.equal(b.getY(i),a.getY(i),'Every upper vertex stays fixed');for(const axis of ['getX','getY'])if(geometry.attributes.uv)assert.equal(o.geometry.attributes.uv[axis](i),geometry.attributes.uv[axis](i),'Upper texture registration stays fixed');}
  }
  extended++;
 }
 if(instances)for(let i=0;i<o.count;i++){
  const old=new THREE.Matrix4().fromArray(instances,i*16),now=new THREE.Matrix4();o.getMatrixAt(i,now);
  if(old.equals(now))continue;
  for(const j of [0,1,2,3,4,6,7,8,9,10,11,12,14,15])assert.equal(now.elements[j],old.elements[j],'Box footprint and rotation stay exact');
  geometry.computeBoundingBox();const top=geometry.boundingBox.max.y;
  assert(Math.abs(now.elements[13]+now.elements[5]*top-old.elements[13]-old.elements[5]*top)<2e-5,'Instanced tops stay fixed');extended++;
 }
}
assert(extended>500,'Check the full assembled estate foundation closure');
const timeline=prepareEstateTimeline(THREE,e,l);e.scene.updateMatrixWorld(true);
const carden=e.annexe.userData.cardenElevation;
const cardenWalls=['Carden stepped low side range brick walls','Carden tower gabled range brick walls'].map(name=>carden.getObjectByName(name));
const cardenRay=new THREE.Raycaster(),cardenNormal=new THREE.Vector3(1,0,0).transformDirection(carden.matrixWorld);
for(const z of [-17.8,-13,-8.3])for(const y of [.1,1,4]){
 const point=carden.localToWorld(new THREE.Vector3(29.17,y,z));
 cardenRay.set(point.clone().addScaledVector(cardenNormal,.3),cardenNormal.clone().negate());
 const faces=new Set(cardenRay.intersectObjects(cardenWalls).filter(h=>Math.abs(h.distance-.3)<.002).map(h=>h.object));
 assert.equal(faces.size,1,'Carden low and tall ranges have one exposed brick skin');
}
const ray=new THREE.Raycaster(),pairs=[];
for(const group of [e.estatesDepartment,e.farndonWard,e.witbyWard,e.irbyAshley,e.graftonEdge,e.haleWard,e.uptonFrithOscroft]){
 const select=(wall,base,height)=>pairs.push({group,wall:group.getObjectByName(wall),base:group.getObjectByName(base),height});
 if(group===e.estatesDepartment)for(const r of group.userData.ranges)select(r.name,r.name+' dark brick plinth',.28);
 else if([e.farndonWard,e.witbyWard].includes(group))for(const name of ['Single-storey ward walls','Small rear room','Narrow rear link','Low west side room','Projecting central garden bay'])select(name,name+' plinth',.3);
 else if(group===e.haleWard)select('Hale ward two-storey walls','Hale ward brick foundation',.38);
 else if(group===e.uptonFrithOscroft){
  select('Symmetric OS-derived two-storey walls','Stepped masonry plinth',.38);
  const walls=group.children.filter(o=>o.name==='Canted garden bay'),bases=group.children.filter(o=>o.name==='Garden bay plinth');
  walls.forEach((wall,i)=>pairs.push({group,wall,base:bases[i],height:.38}));
 }else select('Yellow-refined '+group.name+' walls','Weathered brick foundation',.38);
}
let samples=0;
for(const {group,wall,base,height} of pairs){
 assert(wall&&base,group.name+' has wall and foundation');
 const footprint=base.userData.collisionFootprint;
 const area=footprint.reduce((sum,p,i)=>{const q=footprint[(i+1)%footprint.length];return sum+p[0]*q[1]-q[0]*p[1];},0);
 for(let i=0;i<footprint.length;i++){
  const a=footprint[i],b=footprint[(i+1)%footprint.length];
  const normal=new THREE.Vector3(b[1]-a[1],0,a[0]-b[0]).multiplyScalar(Math.sign(area)).normalize().transformDirection(base.matrixWorld);
  for(const t of [.05,.37,.73,.95])for(const y of [-.12,.05,height-.01,height+.01,1]){
   const point=new THREE.Vector3(a[0]+(b[0]-a[0])*t,y,a[1]+(b[1]-a[1])*t).applyMatrix4(base.matrixWorld);
   ray.set(point.clone().addScaledVector(normal,.3),normal.clone().negate());ray.far=.305;
   const hits=ray.intersectObjects([wall,base]).filter(h=>Math.abs(h.distance-.3)<.002);
   const faces=new Set(hits.map(h=>h.object));
   assert.equal(faces.size,1,group.name+' / '+wall.name+' has one solid face at edge '+i+', height '+y);
   assert(faces.has(y<height?base:wall),'Wall and plinth join without overlap');samples++;
  }
 }
}
// Every low architectural plinth/foundation, including the historic end wall,
// must extend beneath the actual terrain. Roof bases and excavated walls are
// outside this ground-level set.
let bases=0;
e.model.traverse(o=>{
 if(!o.isMesh||o.isInstancedMesh||!/plinth|foundation|weathered base/i.test(o.name))return;
 const b=new THREE.Box3().setFromObject(o);
 if(b.min.y>.03||b.max.y<.15)return;
 bases++;assert(b.min.y<=e.terrain.position.y,'Foundation reaches the terrain: '+o.name);
});
assert(bases>70,'Audit the complete estate, including tower services and modern buildings');
assert.deepEqual(groundBuildingBases(THREE,e.model,{groundY:e.terrain.position.y,exclude:[e.trees,e.terrain]}),[],'Grounding is idempotent, including the earliest timeline walls');
for(const year of [1829,1849,1916,2021]){timeline.setPeriod(year);for(const part of e.model.getObjectByName('1829 east end wall').children.filter(o=>o.name.endsWith('plinth')))assert(new THREE.Box3().setFromObject(part).min.y<e.terrain.position.y);}
console.log(`PASS: ${pairs.length} wall/plinth joins, ${samples} exposed face samples, Carden join and ${bases} foundations; ${extended} extensions preserve upper geometry, textures and footprints; early timeline bases and repeat construction stay correct.`);
