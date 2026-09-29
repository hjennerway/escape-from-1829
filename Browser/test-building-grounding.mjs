import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {groundBuildingBases} from './dist/building-grounding.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6),l=createAerialLayouts(THREE,e),timeline=prepareEstateTimeline(THREE,e,l);
e.scene.updateMatrixWorld(true);
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
console.log(`PASS: ${pairs.length} wall/plinth joins, ${samples} exposed face samples and ${bases} foundations meet the terrain; early timeline bases and repeat construction stay correct.`);
