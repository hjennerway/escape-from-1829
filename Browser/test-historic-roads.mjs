import {pointInFootprint,historicOSPoint,HISTORIC_OS_REGISTRATION} from './dist/historic-footprints.mjs';
import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {HISTORIC_ROADS,HISTORIC_GRAVEL,HISTORIC_PAVING,HISTORIC_ROAD_TRACES,ADMIN_ISLAND_CENTER,ADMIN_SEMICIRCLE_RADIUS} from './dist/historic-roads.mjs';
import {annexeGroundPoint} from './dist/annexe-ground-placement.mjs';
import {shiftAnnexeTeardrop} from './dist/annexe-front-roads.mjs';
import {VIVIENNE_LANE} from './dist/modern-entrance.mjs';
import {distanceToSharedLane} from './dist/historic-road-clearance.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16}},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
const effective=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
assert.deepEqual(HISTORIC_ROAD_TRACES.find(r=>r.name==='Historic lane continuation').points[0],VIVIENNE_LANE[8],'The reference trace must start at the saved lane before clipping its overlapping mouth');
exterior.model.updateMatrixWorld(true);
layouts.historicRoads.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,p=g.attributes.position;for(let i=0;i<p.count;i++)assert(Number.isFinite(p.getX(i))&&Number.isFinite(p.getY(i))&&Number.isFinite(p.getZ(i)));const n=g.attributes.normal,normal=new THREE.Vector3(),matrix=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);for(let i=0;i<n.count;i++){normal.fromBufferAttribute(n,i).applyMatrix3(matrix);assert(normal.y>.99,'All surface triangles must face up');}const bounds=new THREE.Box3().setFromObject(o);assert(bounds.min.y>.25&&bounds.max.y<.4,'Road surfaces must clear terrain and remain below walking collision height');});
// Compare rendered road materials and sample the visible pale border.
const modernRoad=layouts.roads.getObjectByName('Warren Lane');
for(const road of HISTORIC_ROADS){
 const surface=layouts.historicRoads.getObjectByName(road.name),border=layouts.historicRoads.getObjectByName(road.name+' border');
 assert.equal(Math.round((border.userData.width-road.width)*10)/10,1.2,'Historic roads need the same 0.6-unit border on each side');
 for(const [part,reference] of [[surface,modernRoad.children[1].children[0]],[border,modernRoad.children[0].children[0]]])part.traverse(mesh=>{
  if(!mesh.isMesh)return;
  assert(mesh.material.color.equals(reference.material.color),'Historic road and border colours must match Modern');
  assert.equal(mesh.material.roughness,reference.material.roughness);
  assert.equal(mesh.material.polygonOffsetFactor,reference.material.polygonOffsetFactor,'Joined roads must use the same drawing depth');
  assert.equal(mesh.material.polygonOffsetUnits,reference.material.polygonOffsetUnits);
 });
}
for(const name of ['Churton western green','Churton eastern green'])assert(!layouts.historicRoads.getObjectByName(name),'Obsolete grid lawns must not cover Parsons Lane');
const ba=[229,-45],bb=[229,-42],bl=3;
const borderRay=new THREE.Raycaster(new THREE.Vector3((ba[0]+bb[0])/2-(bb[1]-ba[1])/bl*3.3,2,(ba[1]+bb[1])/2+(bb[0]-ba[0])/bl*3.3),new THREE.Vector3(0,-1,0));
assert.equal(borderRay.intersectObject(layouts.historicRoads,true)[0].object.material.color.getHex(),0x555b5c,'The purple service-court fill must cover the former internal kerb');
// Registration is one similarity transform: no per-building stretching or rotation.
assert(Math.hypot(...historicOSPoint(249,286).map((v,i)=>v-[0,19.5][i]))<1e-9);
for(const name of ['chapel','churton']){const anchor=HISTORIC_OS_REGISTRATION[name],p=historicOSPoint(...anchor.pixel);assert(Math.hypot(p[0]-anchor.world[0],p[1]-anchor.world[1])<6,'Identified landmarks must agree within the reference-pick tolerance');}
const missing=layouts.historicRoads.userData.missingFootprints;
assert(missing.occupied.length>40,'Clipping must inspect the assembled existing estate, not an empty reparented model');
// The workshop row now replaces the remaining OS marks beside Irby's end.
// Its actual new walls must participate in clipping those archived outlines.
assert(missing.occupied.some(polygon=>pointInFootprint([217,-60],polygon)),
 'The moved workshop must replace the old adjoining outline beside Irby/Ashley');
let diagonalCount=0;
const corridorStart=historicOSPoint(86,300),corridorEnd=historicOSPoint(114,230);
function distanceToCorridor(p){const dx=corridorEnd[0]-corridorStart[0],dz=corridorEnd[1]-corridorStart[1],t=Math.max(0,Math.min(1,((p[0]-corridorStart[0])*dx+(p[1]-corridorStart[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(p[0]-corridorStart[0]-t*dx,p[1]-corridorStart[1]-t*dz);}
for(const segment of missing.segments){
 const [a,b]=segment.points;
 const dx=Math.abs(b[0]-a[0]),dz=Math.abs(b[1]-a[1]);
 if(Math.min(dx,dz)>1e-7){
  diagonalCount++;
  assert(Math.abs(dx-dz)<1e-7,'The marked corridor must retain its 45-degree angle');
  assert(distanceToCorridor(a)<10&&distanceToCorridor(b)<10,'Only the orange-marked connecting corridor may have diagonal edges');
 }
 for(const t of [.01,.25,.5,.75,.99]){const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];assert(pointInFootprint(p,missing.region),'Every marked wall must be inside the blue source region');assert(!missing.occupied.some(polygon=>pointInFootprint(p,polygon)),'No missing-building mark may run through an existing building');}
}
assert.equal(diagonalCount,0,'The new diagonal corridor replaces the old diagonal ground markers');
assert(missing.segments.some(s=>s.sourceLoop>0),'Internal court edges must survive, not just an enclosing site outline');
for(const name of ['Central service area · provisional','Northern service range · provisional','West detached block · provisional','Annexe rear service area · provisional','Annexe end service area · provisional'])assert(!layouts.historicRoads.getObjectByName(name),'The earlier incorrect broad outlines must be removed');
// Ray checks distinguish a real grass island from a painted disk covered by road.
const ray=new THREE.Raycaster();
function surfaceAt(x,z){ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(layouts.historicRoads,true)[0]?.object.userData.surface;}
// Every rendered ribbon, including its border and rounded caps, clears BOTH
// saved lanes. Sample complete segments, so a crossing between vertices fails.
for(const road of HISTORIC_ROADS){
 for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
  if(length<1e-8)continue;
  const steps=Math.ceil(length/.4);
  for(let j=0;j<=steps;j++){
   const t=j/steps,p=[a[0]+dx*t,a[1]+dz*t];
   assert(distanceToSharedLane(p)>road.width/2+.6+3.6,road.name+' must not overlap either saved lane, including borders and end caps');
   for(const offset of [-road.width/2-.6,0,road.width/2+.6]){
    const edge=[p[0]-dz/length*offset,p[1]+dx/length*offset];
    assert(!missing.occupied.some(poly=>pointInFootprint(edge,poly)),road.name+' must clear all building walls across its full width '+JSON.stringify(edge));
   }
  }
 }
 for(const p of [road.points[0],road.points.at(-1)])for(let i=0;i<24;i++){
  const a=i*Math.PI/12,r=road.width/2+.6,q=[p[0]+r*Math.cos(a),p[1]+r*Math.sin(a)];
  assert(!missing.occupied.some(poly=>pointInFootprint(q,poly)),road.name+' rounded ends must clear buildings');
 }
}
const southern=HISTORIC_ROADS.filter(r=>r.name.startsWith('Southern estate drive'));
assert.equal(southern.length,2,'Clipping Parsons Lane must retain the marked southern continuation on its far side');
assert(southern[1].points.at(-1)[1]>330,'The long marked southern drive must not disappear at the saved lane');

// A D-shaped forecourt has one half-circle and a straight frontage drive.
const half=HISTORIC_ROADS.find(r=>r.name==='Admin forecourt semicircle');
assert(half&&half.points.length>30);
for(const [x,z] of half.points){
 assert(z>=ADMIN_ISLAND_CENTER[1]-1e-8,'No northern half of the former full roundabout may remain');
 assert(Math.abs(Math.hypot(x-ADMIN_ISLAND_CENTER[0],z-ADMIN_ISLAND_CENTER[1])-ADMIN_SEMICIRCLE_RADIUS)<1e-8);
 assert.equal(surfaceAt(x,z),'black road','The semicircular carriageway must remain continuous');
}
for(const x of [180,190,198,207,216])assert.equal(surfaceAt(x,49),'black road','The diameter must be the straight frontage road');
for(const [x,z] of [[192,57],[198,60],[204,57]])assert.equal(surfaceAt(x,z),'grass','The half-disc must retain its grass lawn');
assert.notEqual(surfaceAt(198,31),'black road','The removed northern half must leave no asphalt');
for(const [x,z] of [[267,42],[269,47]].map(shiftAnnexeTeardrop))assert.equal(surfaceAt(x,z),'grass','The slender teardrop must retain visible grass');
const tear=HISTORIC_ROADS.find(r=>r.name==='Admin teardrop circulation');
assert.deepEqual(tear.points[0],tear.points.at(-1),'The pointed teardrop road must close at its northern tip');
for(const p of tear.points)assert.equal(surfaceAt(...p),'black road','Teardrop circulation must remain unbroken');
assert(Math.max(...tear.points.map(p=>p[1]))-Math.min(...tear.points.map(p=>p[1]))>1.5*(Math.max(...tear.points.map(p=>p[0]))-Math.min(...tear.points.map(p=>p[0]))),'Teardrop must be narrow and point north, not lie sideways');

assert.deepEqual(HISTORIC_GRAVEL.map(p=>p.name),['Annexe service court gravel path'],'Only the yellow-marked gravel link is added');
for(const name of ['Tower service court','Annexe sweeping entrance','Annexe central asphalt forecourt','Admin west lane junction','Admin east four-way junction'])assert(HISTORIC_PAVING.some(p=>p.name===name),'Retain each explicitly marked approach or junction: '+name);
for(const area of HISTORIC_PAVING){
 const mesh=layouts.historicRoads.getObjectByName(area.name);
 assert.equal(mesh.userData.surface,area.surface==='junction edge'?'stone kerb':'black road');
 if(area.surface!=='junction edge')assert.equal(mesh.material.color.getHex(),0x555b5c);
 if(!['junction','junction edge'].includes(area.surface))for(const p of area.points)assert(distanceToSharedLane(p)>3.6,'Filled courts must also clear the shared lanes');
}
for(const name of ['Admin roundabout','Admin roundabout to annexe','Annexe outer east road','Northern diagonal road','Annexe east cross-drive','Annexe east court circuit','Annexe end lawn circuit','Annexe front black apron','Annexe central entrance black approach','Annexe rectangular garden circuit','Annexe garden black margin','Annexe inset parking surface','Annexe parking entrance','Annexe perimeter road','Annexe rear service spur','Eastern entrance road']){
 assert(!layouts.historicRoads.getObjectByName(name),name+' is not in the latest marked network');
 assert(!layouts.historicRoads.getObjectByName(name+' border'),'Unmarked roads must not leave borders');
}
for(const local of [[110,51],[146,39],[120,51],[75,121]]){
 const p=annexeGroundPoint(local[0],0,local[1]);
 assert(!['black road','stone kerb'].includes(surfaceAt(p[0],p[2])),'Unmarked annexe approaches and loops must expose their grounds: '+local);
}
// The later Irby revision removes the old court beneath the relocated ward.
for(const p of [[224,-66],[224,-40],[250,-68],[248,-74],[267,-87],[263.25,-108]])
 assert.equal(surfaceAt(...p),'black road','Retain front court and flush Irby side access: '+p);
for(const p of [[226,-106],[245,-106],[229,-93],[248,-94],[238,-35],[264,-54],[248,-30],[270,-60],[270,-30],[273.3,-54],[255,-27]])
 assert(!['black road','stone kerb'].includes(surfaceAt(...p)),'Removed paving must expose grass: '+p);
for(const name of ['Tower east court cross-lane','Tower east court return']){
 assert(!layouts.historicRoads.getObjectByName(name),'Remove the outer road geometry');
 assert(!layouts.historicRoads.getObjectByName(name+' border'),'Remove the outer kerb geometry');
}
const court=layouts.historicRoads.getObjectByName('Irby Estates continuous service court');
for(const p of [[248,-94],[229,-94],[244,-49.5],[250,-45],[264,-54],[248,-30]]){
 ray.set(new THREE.Vector3(p[0],2,p[1]),new THREE.Vector3(0,-1,0));
 assert.equal(ray.intersectObject(court).length,0,'The asphalt must exclude the enlarged lawn, outer grass and Estates courtyard');
}
assert.equal(surfaceAt(229,-48),'black road','Tower-side north/south service lane must stay open');
assert.equal(surfaceAt(246,-72),'black road','Marked upper court cross-lane must remain');
assert(!['black road','stone kerb'].includes(surfaceAt(244,-49.5)),'The court road must not run through the new Estates building');

for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(effective(layouts.historicRoads),historic);
 assert.equal(effective(layouts.entrance),historic||modern,'The sweeping Reception driveway is shared by Historic and Modern');
 assert.equal(effective(layouts.roads.getObjectByName('Vivienne Smith Lane eastern continuation')),modern,'Blue eastern lane continuation belongs only to Modern');
 assert.equal(effective(exterior.legacyAccess),!historic&&modern,'Legacy tracks must disappear in Historic and return in Modern');
 const lane=layouts.roads.getObjectByName('Vivienne Smith Lane');assert.equal(lane.children[1].children[0].material.color.getHex(),0x555b5c);
 const other=layouts.roads.getObjectByName('Warren Lane');assert.equal(other.children[1].children[0].material.color.getHex(),0x555b5c,'Road colours must remain consistent in every layout');
}
console.log('PASS: source-selected road network, semicircular forecourt, north-pointing teardrop, full-width building clearance, no Parsons/Vivienne overlaps, retained southern continuation, registered OS contours and all layout combinations.');
