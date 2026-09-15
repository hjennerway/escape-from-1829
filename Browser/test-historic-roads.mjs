import {pointInFootprint,historicOSPoint,HISTORIC_OS_REGISTRATION} from './dist/historic-footprints.mjs';
import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {HISTORIC_ROADS,HISTORIC_GRAVEL,HISTORIC_PAVING,ADMIN_ISLAND_CENTER} from './dist/historic-roads.mjs';
import {annexePoint} from './dist/annexe.mjs';
import {VIVIENNE_LANE} from './dist/modern-entrance.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16}},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
const effective=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
assert.deepEqual(HISTORIC_ROADS.find(r=>r.name==='Historic lane continuation').points.slice(0,2),VIVIENNE_LANE.slice(7,9),'Historic continuation must meet the saved lane exactly');
exterior.model.updateMatrixWorld(true);
layouts.historicRoads.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,p=g.attributes.position;for(let i=0;i<p.count;i++)assert(Number.isFinite(p.getX(i))&&Number.isFinite(p.getY(i))&&Number.isFinite(p.getZ(i)));const n=g.attributes.normal,normal=new THREE.Vector3(),matrix=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);for(let i=0;i<n.count;i++){normal.fromBufferAttribute(n,i).applyMatrix3(matrix);assert(normal.y>.99,'All surface triangles must face up');}const bounds=new THREE.Box3().setFromObject(o);assert(bounds.min.y>.25&&bounds.max.y<.4,'Road surfaces must clear terrain and remain below walking collision height');});
// Registration is one similarity transform: no per-building stretching or rotation.
assert(Math.hypot(...historicOSPoint(249,286).map((v,i)=>v-[0,19.5][i]))<1e-9);
for(const name of ['chapel','churton']){const anchor=HISTORIC_OS_REGISTRATION[name],p=historicOSPoint(...anchor.pixel);assert(Math.hypot(p[0]-anchor.world[0],p[1]-anchor.world[1])<6,'Identified landmarks must agree within the reference-pick tolerance');}
const missing=layouts.historicRoads.userData.missingFootprints;
assert(missing.occupied.length>40,'Clipping must inspect the assembled existing estate, not an empty reparented model');
assert(missing.segments.length>100,'Missing outlines must retain individual stepped walls and court edges');
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
assert(diagonalCount>=2,'Both sides of the orange-marked corridor must remain diagonal');
assert(missing.segments.some(s=>s.sourceLoop>0),'Internal court edges must survive, not just an enclosing site outline');
for(const name of ['Central service area · provisional','Northern service range · provisional','West detached block · provisional','Annexe rear service area · provisional','Annexe end service area · provisional'])assert(!layouts.historicRoads.getObjectByName(name),'The earlier incorrect broad outlines must be removed');
// Check the requested church clearance against the actual model, including trim.
const churchBounds=new THREE.Box3().setFromObject(exterior.chapel);
for(const name of ['Churton north cross-road','North ward road']){
 const road=HISTORIC_ROADS.find(r=>r.name===name);
 assert(road.points[0][1]-road.width/2>churchBounds.max.z+2,'Church-front road needs a clear verge beyond the chapel footprint');
}
// Ray checks distinguish a real grass island from a painted disk covered by road.
const ray=new THREE.Raycaster();
function surfaceAt(x,z){ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(layouts.historicRoads,true)[0]?.object.userData.surface;}
assert.equal(surfaceAt(...ADMIN_ISLAND_CENTER),'grass','Roundabout centre must remain grass');
for(let i=0;i<16;i++){const a=i*Math.PI/8;assert.equal(surfaceAt(ADMIN_ISLAND_CENTER[0]+9*Math.cos(a),ADMIN_ISLAND_CENTER[1]+9*Math.sin(a)),'black road','Roundabout must provide an unbroken circulating road');}
assert.equal(surfaceAt(245,46),'grass','Relocated teardrop must remain exposed inside its black surround');
assert.equal(surfaceAt(239,53),'black road','The relocated teardrop must have a black circulating route');
assert.notEqual(surfaceAt(261,14),'grass','The old teardrop position must be cleared');
assert(!HISTORIC_GRAVEL.some(area=>area.name.startsWith('Annexe')),'No annexe gravel surfaces may remain in Historic');
for(const area of HISTORIC_PAVING){
 const mesh=layouts.historicRoads.getObjectByName(area.name);
 assert.equal(mesh.userData.surface,'black road');
 assert.equal(mesh.material.color.getHex(),0x17191a);
}
const endIsland=annexePoint(125,0,65);
assert.equal(surfaceAt(endIsland[0],endIsland[2]),'grass','New end-lawn circuit must retain its grass island');
const crossDrive=annexePoint(96,0,64);
assert.equal(surfaceAt(crossDrive[0],crossDrive[2]),'black road','New cross-drive must cut through the former continuous lawn');
// Sample both road edges as well as centre lines against the assembled buildings.
const extensions=['Admin north service road','Annexe east cross-drive','Annexe east court circuit','Annexe end lawn circuit','Annexe end lawn avenue link','Annexe end lawn cross-drive link'];
for(const name of extensions){
 const road=HISTORIC_ROADS.find(road=>road.name===name);assert(road);
 for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),steps=Math.ceil(length);
  for(let j=0;j<=steps;j++)for(const offset of [-road.width/2,0,road.width/2]){
   const t=j/steps,p=[a[0]+dx*t-dz/length*offset,a[1]+dz*t+dx/length*offset];
   assert(!missing.occupied.some(polygon=>pointInFootprint(p,polygon)),name+' must clear existing buildings across its full width');
  }
 }
}
const garden=annexePoint(75,0,110);assert.equal(surfaceAt(garden[0],garden[2]),'grass','Near annexe garden must have a grass interior');
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(effective(layouts.historicRoads),historic);
 assert.equal(effective(exterior.legacyAccess),!historic&&modern,'Legacy tracks must disappear in Historic and return in Modern');
 const lane=layouts.roads.getObjectByName('Vivienne Smith Lane');assert.equal(lane.children[1].children[0].material.color.getHex(),historic?0x17191a:0x555b5c);
 const other=layouts.roads.getObjectByName('Warren Lane');assert.equal(other.children[1].children[0].material.color.getHex(),0x555b5c,'Changing shared-lane colour must not recolour other Modern roads');
}
console.log('PASS: historic surface normals/heights, finite geometry, registered OS wall contours, existing-building exclusions, church clearance, circular island circulation, teardrop and annexe lawn surfaces, saved-lane junction, isolated materials and replacement visibility in all four layout combinations.');
