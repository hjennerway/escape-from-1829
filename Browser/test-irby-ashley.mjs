import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {IRBY_ASHLEY_FOOTPRINT,IRBY_ASHLEY_VIEWS} from './dist/irby-ashley.mjs';
import {IRBY_CONNECTION_FRONT} from './dist/irby-corridor.mjs';
import {historicOSPoint,pointInFootprint} from './dist/historic-footprints.mjs';
import {OS_FOOTPRINTS} from './dist/historic-footprint-data.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),building=exterior.irbyAshley;
const offset=building.userData.placement.offset,placed=([x,z])=>[x+offset.x,z+offset.z];
const layouts=createAerialLayouts(THREE,exterior);exterior.scene.updateMatrixWorld(true);
assert.equal(building.name,'Irby/Ashley');assert.equal(building.userData.storeys,2);
assert.equal(building.parent,layouts.historic);
// Independent interior/exterior picks from the marked yellow silhouette.
for(const p of [[255,-104],[239,-104],[216,-107],[216,-96],[230,-110],[256,-123],[216,-119]])assert(pointInFootprint(p,IRBY_ASHLEY_FOOTPRINT),'Refined wing and shifted rear range must be solid: '+p);
for(const p of [[245,-100],[228,-100],[232,-125],[266,-114],[206,-108],[208,-105]])assert(!pointInFootprint(p,IRBY_ASHLEY_FOOTPRINT),'Marked recess and removed yellow section must remain open: '+p);
const bounds=new THREE.Box3().setFromObject(building);
assert(bounds.min.x>203+offset.x&&bounds.max.x<264+offset.x&&bounds.min.z>-133+offset.z&&bounds.min.z<-131+offset.z&&Math.abs(bounds.max.z-IRBY_CONNECTION_FRONT)<.44,'Rear edge moves ten units in total while the front corridor contact stays fixed');
const ray=new THREE.Raycaster();
function down(x,z){ray.set(new THREE.Vector3(x+offset.x,25,z+offset.z),new THREE.Vector3(0,-1,0));return ray.intersectObject(building,true)[0];}
for(const p of [[255,-106],[239,-104],[215,-105],[216,-96],[231,-110],[256,-123],[216,-119]])assert(down(...p)?.point.y>=8.3,'Every main wing needs an upward-facing roof: '+p);
for(const p of [[245,-100],[228,-100],[232,-125]])assert(!down(...p),'Roof must not bridge a courtyard: '+p);
assert(down(242,-119)?.object.name.includes('Glazed'),'The photographed low glazed lean-to must occupy the left court');
building.traverse(o=>{
  if(!o.isMesh)return;
  for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite),'All geometry must be finite');
  if(o.name.endsWith('roof')){const n=o.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(n.getY(i)>0,'Roof triangles must face upwards: '+o.name);}
});
for(const o of building.userData.openings){
  // The corner's low lights sit inside the conservatory; upper sashes remain exposed.
  if(o.y<3.8&&o.x+building.position.x-offset.x>236&&o.x+building.position.x-offset.x<248&&o.z+building.position.z-offset.z<-112)continue;
  const n=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r));
  const p=new THREE.Vector3(o.x,o.y,o.z).add(building.position);
  ray.set(p.clone().addScaledVector(n,.6),n.negate());
  assert(ray.intersectObject(building,true)[0]?.object.isInstancedMesh,'Sash must be visible on its external wall: '+JSON.stringify(o));
}
// Rear corrections from the marked img4 photo: longer glazing, separate
// corner and bay, two intervening windows, and a widely spaced wing pair.
const {conservatory,corner,bays,openings}=building.userData;
assert.deepEqual(IRBY_ASHLEY_FOOTPRINT.filter(p=>p[1]===-98.6),[[260.6,-98.6],[250.4,-98.6],[241.7,-98.6],[235.4,-98.6]],'Both yellow front faces keep their positions and widths');
const frontSashes=openings.filter(o=>Math.abs(o.z+building.position.z-offset.z+98.565)<.001);
assert.equal(frontSashes.length,5,'Both fixed yellow faces retain their sashes');
assert.deepEqual(frontSashes.map(o=>[Number((o.x+building.position.x-offset.x).toFixed(3)),o.y]),[[258.05,2.05],[258.05,5.9],[252.95,5.9],[238.55,2.05],[238.55,5.9]],'Yellow-face sash positions stay fixed');
assert(conservatory.z0-offset.z<-127.5-3,'Conservatory must project visibly past the west wing');
assert(down(242,-130)?.object.name.includes('Glazed'),'Extended front must have a glazed roof');
assert(down(246,-115)?.object.name.includes('Quarter-octagonal'),'Corner must have its own hip roof');
// The marked corner peak must meet the west ridge without the former dip.
for(const t of [.25,.5,.75]){
  const hit=down(255.45-8.2*t,-114.02+.87*t);
  assert(hit&&Math.abs(hit.point.y-(11.4-.85*t))<.12,'Yellow-marked roof ridge must stay continuous: '+t);
}
assert(!building.getObjectByName('West wing roof junction'),'Obsolete low roof patch must be removed');
assert(pointInFootprint(placed([246,-115]),corner.footprint),'Quarter-octagonal corner must fill the old internal corner');
assert(!pointInFootprint(placed([244.2,-116]),corner.footprint),'Corner must retain its diagonal octagonal face');
const adjacentBay=bays.reduce((a,b)=>a.x>b.x?a:b);
const bayRight=Math.max(...adjacentBay.footprint.map(p=>p[0]));
assert(bayRight<conservatory.x0-.5,'Half-octagonal bay must clear the conservatory, including its eaves');
assert(down(adjacentBay.x-offset.x,-114)?.object.name.includes('bay slate roof'),'Separate bay must retain its slate roof');
const cornerLeft=Math.min(...corner.footprint.map(p=>p[0]));
const intervening=openings.filter(o=>o.y>5&&Math.abs(o.z+building.position.z-offset.z+112.735)<.01&&o.x+building.position.x>bayRight&&o.x+building.position.x<cornerLeft);
assert.equal(intervening.length,2,'Exactly two exposed upper sashes must separate the half bay and quarter corner');
const wingPair=openings.filter(o=>o.y>5&&Math.abs(o.x+building.position.x-offset.x-247.665)<.01&&o.z+building.position.z-offset.z<-116.3);
assert.equal(wingPair.length,2,'West return must retain the purple-marked sash pair');
assert(Math.abs(wingPair[0].z-wingPair[1].z)>7.4,'Purple-marked sashes must be spaced across the exposed return');
const near=new THREE.Vector3(242,15,-130),far=new THREE.Vector3(247,15,-130);
near.add(new THREE.Vector3(offset.x,0,offset.z));far.add(new THREE.Vector3(offset.x,0,offset.z));
ray.set(near,new THREE.Vector3(0,-1,0));const lowRoof=ray.intersectObject(building,true)[0].point.y;
ray.set(far,new THREE.Vector3(0,-1,0));const highRoof=ray.intersectObject(building,true)[0].point.y;
assert(highRoof>lowRoof,'Extended conservatory must retain the corrected slope towards the west wing');
const obstacles=exteriorObstacles(THREE,exterior.model);
for(const p of [[246,-115],[242,-132],[247.7,-130]])assert(obstacles.some(o=>obstacleContains(o,...placed(p))),'New corner and exposed conservatory walls must block walking: '+p);
assert(!obstacles.some(o=>obstacleContains(o,...placed([235.8,-118]))),'Access alongside the separate bay and conservatory must remain open');
for(const p of [[255,-104],[239,-104],[216,-107],[230,-110],[256,-123],[216,-119]])assert(obstacles.some(o=>obstacleContains(o,...placed(p))),'Walking must respect every wing');
for(const p of [[255,-132],[216,-127],[230,-117],[242,-139]]){
 assert(!down(...p),'Former rear position must be clear of geometry: '+p);
 assert(!obstacles.some(o=>obstacleContains(o,...placed(p))),'Former rear position must be walkable: '+p);
}
for(const p of [...[[245,-100],[228,-100],[232,-132]].map(placed),IRBY_ASHLEY_VIEWS['irby-ashley-1'].position.filter((_,i)=>i!==1),IRBY_ASHLEY_VIEWS['irby-ashley-3'].position.filter((_,i)=>i!==1)])assert(!obstacles.some(o=>obstacleContains(o,...p)),'Courts and camera starts must remain accessible: '+p);
// Retire only the selected range, retaining the long OS connection to its north.
const os=OS_FOOTPRINTS[0].loops[0].map(p=>historicOSPoint(...p));
const remaining=layouts.historicRoads.userData.missingFootprints.segments;
assert(remaining.some(s=>s.points.some(p=>Math.abs(p[0]-os[189][0])<.01&&p[1]>-100)),'Adjoining unmodelled OS corridor must remain');
assert(!remaining.some(s=>s.points.some(p=>p[0]>211&&p[0]<262&&p[1]<-123&&p[1]>-138)),'Superseded OS outline must not reappear outside the refined garden wings');
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const historic of [false,true])for(const modern of [false,true]){
  layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
  assert.equal(visible(building),historic);
  assert.equal(exteriorObstacles(THREE,exterior.model).some(o=>obstacleContains(o,...placed([255,-123]))),historic,'Hidden Historic building must not leave walking collisions');
}
console.log('PASS: shifted rear range, fixed front contact, open courts, roof coverage/normals, exposed sashes, conservatory, octagonal hip, separated bays, window pairs, cleared former footprint, walking clearances and Historic visibility.');
