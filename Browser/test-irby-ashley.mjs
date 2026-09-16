import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {IRBY_ASHLEY_FOOTPRINT,IRBY_ASHLEY_VIEWS} from './dist/irby-ashley.mjs';
import {historicOSPoint,pointInFootprint} from './dist/historic-footprints.mjs';
import {OS_FOOTPRINTS} from './dist/historic-footprint-data.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),building=exterior.irbyAshley;
const layouts=createAerialLayouts(THREE,exterior);exterior.scene.updateMatrixWorld(true);
assert.equal(building.name,'Irby/Ashley');assert.equal(building.userData.storeys,2);
assert.equal(building.parent,layouts.historic);
// Independent interior/exterior picks from the marked yellow silhouette.
for(const p of [[255,-104],[239,-104],[216,-107],[208,-105],[230,-117],[256,-133],[216,-129]])assert(pointInFootprint(p,IRBY_ASHLEY_FOOTPRINT),'Selected yellow wing must be solid: '+p);
for(const p of [[245,-103],[228,-104],[232,-132],[266,-121],[206,-115]])assert(!pointInFootprint(p,IRBY_ASHLEY_FOOTPRINT),'Marked recess/road must remain open: '+p);
const bounds=new THREE.Box3().setFromObject(building);
assert(bounds.min.x>203&&bounds.max.x<264&&bounds.min.z>-143&&bounds.max.z<-97,'Building must stay registered to the selected OS range');
const ray=new THREE.Raycaster();
function down(x,z){ray.set(new THREE.Vector3(x,25,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(building,true)[0];}
for(const p of [[255,-106],[239,-104],[215,-105],[208,-105],[231,-117],[256,-133],[216,-129]])assert(down(...p)?.point.y>=8.3,'Every main wing needs an upward-facing roof: '+p);
for(const p of [[245,-103],[228,-104],[232,-132]])assert(!down(...p),'Roof must not bridge a courtyard: '+p);
assert(down(242,-129)?.object.name.includes('Glazed'),'The photographed low glazed lean-to must occupy the left court');
building.traverse(o=>{
  if(!o.isMesh)return;
  for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite),'All geometry must be finite');
  if(o.name.endsWith('roof')){const n=o.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(n.getY(i)>0,'Roof triangles must face upwards: '+o.name);}
});
for(const o of building.userData.openings){
  // The corner's low lights sit inside the conservatory; upper sashes remain exposed.
  if(o.y<3.8&&o.x+building.position.x>236&&o.x+building.position.x<248&&o.z+building.position.z<-122)continue;
  const n=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r));
  const p=new THREE.Vector3(o.x,o.y,o.z).add(building.position);
  ray.set(p.clone().addScaledVector(n,.6),n.negate());
  assert(ray.intersectObject(building,true)[0]?.object.isInstancedMesh,'Sash must be visible on its external wall: '+JSON.stringify(o));
}
// Rear corrections from the marked img4 photo: longer glazing, separate
// corner and bay, two intervening windows, and a widely spaced wing pair.
const {conservatory,corner,bays,openings}=building.userData;
assert(conservatory.z0<-137.5-3,'Conservatory must project visibly past the west wing');
assert(down(242,-140)?.object.name.includes('Glazed'),'Extended front must have a glazed roof');
assert(down(246,-125)?.object.name.includes('Quarter-octagonal'),'Corner must have its own hip roof');
// The marked corner peak must meet the west ridge without the former dip.
for(const t of [.25,.5,.75]){
  const hit=down(255.45-8.2*t,-124.02+.87*t);
  assert(hit&&Math.abs(hit.point.y-(11.4-.85*t))<.12,'Yellow-marked roof ridge must stay continuous: '+t);
}
assert(!building.getObjectByName('West wing roof junction'),'Obsolete low roof patch must be removed');
assert(pointInFootprint([246,-125],corner.footprint),'Quarter-octagonal corner must fill the old internal corner');
assert(!pointInFootprint([244.2,-126],corner.footprint),'Corner must retain its diagonal octagonal face');
const adjacentBay=bays.reduce((a,b)=>a.x>b.x?a:b);
const bayRight=Math.max(...adjacentBay.footprint.map(p=>p[0]));
assert(bayRight<conservatory.x0-.5,'Half-octagonal bay must clear the conservatory, including its eaves');
assert(down(adjacentBay.x,-124)?.object.name.includes('bay slate roof'),'Separate bay must retain its slate roof');
const cornerLeft=Math.min(...corner.footprint.map(p=>p[0]));
const intervening=openings.filter(o=>o.y>5&&Math.abs(o.z+building.position.z+122.735)<.01&&o.x+building.position.x>bayRight&&o.x+building.position.x<cornerLeft);
assert.equal(intervening.length,2,'Exactly two exposed upper sashes must separate the half bay and quarter corner');
const wingPair=openings.filter(o=>o.y>5&&Math.abs(o.x+building.position.x-247.665)<.01&&o.z+building.position.z<-126.3);
assert.equal(wingPair.length,2,'West return must retain the purple-marked sash pair');
assert(Math.abs(wingPair[0].z-wingPair[1].z)>7.4,'Purple-marked sashes must be spaced across the exposed return');
const near=new THREE.Vector3(242,15,-140),far=new THREE.Vector3(247,15,-140);
ray.set(near,new THREE.Vector3(0,-1,0));const lowRoof=ray.intersectObject(building,true)[0].point.y;
ray.set(far,new THREE.Vector3(0,-1,0));const highRoof=ray.intersectObject(building,true)[0].point.y;
assert(highRoof>lowRoof,'Extended conservatory must retain the corrected slope towards the west wing');
const obstacles=exteriorObstacles(THREE,exterior.model);
for(const p of [[246,-125],[242,-142],[247.7,-140]])assert(obstacles.some(o=>obstacleContains(o,...p)),'New corner and exposed conservatory walls must block walking: '+p);
assert(!obstacles.some(o=>obstacleContains(o,235.8,-128)),'Access alongside the separate bay and conservatory must remain open');
for(const p of [[255,-104],[239,-104],[216,-107],[230,-117],[256,-133],[216,-129]])assert(obstacles.some(o=>obstacleContains(o,...p)),'Walking must respect every wing');
for(const p of [[245,-103],[228,-104],[232,-132],IRBY_ASHLEY_VIEWS['irby-ashley-1'].position.filter((_,i)=>i!==1),IRBY_ASHLEY_VIEWS['irby-ashley-3'].position.filter((_,i)=>i!==1)])assert(!obstacles.some(o=>obstacleContains(o,...p)),'Courts and camera starts must remain accessible: '+p);
// Retire only the selected range, retaining the long OS connection to its north.
const os=OS_FOOTPRINTS[0].loops[0].map(p=>historicOSPoint(...p));
const remaining=layouts.historicRoads.userData.missingFootprints.segments;
assert(remaining.some(s=>s.points.some(p=>Math.abs(p[0]-os[189][0])<.01&&p[1]>-100)),'Adjoining unmodelled OS corridor must remain');
assert(!remaining.some(s=>s.points.some(p=>p[0]>211&&p[0]<262&&p[1]<-123&&p[1]>-138)),'Superseded OS outline must not reappear outside the refined garden wings');
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const historic of [false,true])for(const modern of [false,true]){
  layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
  assert.equal(visible(building),historic);
  assert.equal(exteriorObstacles(THREE,exterior.model).some(o=>obstacleContains(o,255,-133)),historic,'Hidden Historic building must not leave walking collisions');
}
console.log('PASS: yellow-footprint placement, open courts, roof coverage/normals, exposed sashes, extended conservatory, quarter-octagonal hip, separated bay, corrected window pairs, walking clearances, retained neighbouring OS connection and independent Historic visibility.');
