import {pointInFootprint,historicOSPoint,HISTORIC_OS_REGISTRATION} from './dist/historic-footprints.mjs';
import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {HISTORIC_ROADS,HISTORIC_GRAVEL,HISTORIC_PAVING,ADMIN_ISLAND_CENTER} from './dist/historic-roads.mjs';
import {annexePoint} from './dist/annexe.mjs';
import {VIVIENNE_LANE} from './dist/modern-entrance.mjs';
import {MODERN_ROAD_PATHS} from './dist/modern-road-data.mjs';
import {earthToScene} from './dist/earth-registration.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16}},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
const effective=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
assert.deepEqual(HISTORIC_ROADS.find(r=>r.name==='Historic lane continuation').points[0],VIVIENNE_LANE[8],'Historic continuation must begin at the junction without duplicating the shared lane');
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
const serviceRoad=HISTORIC_ROADS.find(r=>r.name==='Admin north service road');
const ba=serviceRoad.points[30],bb=serviceRoad.points[31],bl=Math.hypot(bb[0]-ba[0],bb[1]-ba[1]);
const borderRay=new THREE.Raycaster(new THREE.Vector3((ba[0]+bb[0])/2-(bb[1]-ba[1])/bl*3.3,2,(ba[1]+bb[1])/2+(bb[0]-ba[0])/bl*3.3),new THREE.Vector3(0,-1,0));
assert.equal(borderRay.intersectObject(layouts.historicRoads,true)[0].object.material.color.getHex(),0xb8b9af,'Pale border must be exposed beyond the asphalt');
// Registration is one similarity transform: no per-building stretching or rotation.
assert(Math.hypot(...historicOSPoint(249,286).map((v,i)=>v-[0,19.5][i]))<1e-9);
for(const name of ['chapel','churton']){const anchor=HISTORIC_OS_REGISTRATION[name],p=historicOSPoint(...anchor.pixel);assert(Math.hypot(p[0]-anchor.world[0],p[1]-anchor.world[1])<6,'Identified landmarks must agree within the reference-pick tolerance');}
const missing=layouts.historicRoads.userData.missingFootprints;
assert(missing.occupied.length>40,'Clipping must inspect the assembled existing estate, not an empty reparented model');
// Twenty Witby Ward edges now have a model; the remaining ranges retain their detailed traces.
assert(missing.segments.length>80,'Missing outlines must retain individual stepped walls and court edges');
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
// Ray checks distinguish a real grass island from a painted disk covered by road.
const ray=new THREE.Raycaster();
function surfaceAt(x,z){ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(layouts.historicRoads,true)[0]?.object.userData.surface;}
// Inferred eastern extensions must stop before every saved Parsons Lane edge.
const savedParsons=MODERN_ROAD_PATHS.filter(p=>p.name.startsWith('Parsons Lane')).map(p=>p.coordinates.map(c=>earthToScene(...c)));
function pointSegmentDistance(p,a,b){
 const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));
 return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);
}
function segmentDistance(a,b,c,d){
 const cross=(u,v)=>u[0]*v[1]-u[1]*v[0],r=b.map((v,k)=>v-a[k]),s=d.map((v,k)=>v-c[k]),q=c.map((v,k)=>v-a[k]),den=cross(r,s);
 if(Math.abs(den)>1e-9){const t=cross(q,s)/den,u=cross(q,r)/den;if(t>=0&&t<=1&&u>=0&&u<=1)return 0;}
 return Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));
}
for(const name of ['Annexe inner east road','Annexe outer east road']){
 const road=HISTORIC_ROADS.find(r=>r.name===name);let nearest=Infinity;
 for(let i=1;i<road.points.length;i++)for(const points of savedParsons)for(let j=1;j<points.length;j++)
  nearest=Math.min(nearest,segmentDistance(road.points[i-1],road.points[i],points[j-1],points[j]));
 assert(nearest>road.width/2+.6+3.6,name+' asphalt, rounded caps and borders must clear Parsons Lane');
 assert.equal(surfaceAt(...road.points[0]),'black road','The existing estate-side approach must remain');
}
for(const p of [[442.71559648559054,108.65503009896166],[353.56228338991866,157.9269650357649],[551,39],[600,120]])
 assert(!['black road','stone kerb'].includes(surfaceAt(...p)),'Removed crossings and outer stubs must leave no inferred asphalt or kerbs');
for(const name of ['Churton west road','Churton north cross-road','Churton estate cross-road','North ward road','Northern cross-road']){
 assert(!layouts.historicRoads.getObjectByName(name),'Circled historic roads must be removed');
 assert(!layouts.historicRoads.getObjectByName(name+' border'),'Removed roads must not leave pale borders');
}
for(const [x,z] of [[-77,-130],[-100,-99],[-100,-41],[28,-110],[100,-130.7741935483871],[220,-159.34]])assert(!['black road','stone kerb'].includes(surfaceAt(x,z)),'The cleared grid must expose its grounds');
assert.equal(surfaceAt(...ADMIN_ISLAND_CENTER),'grass','Roundabout centre must remain grass');
for(let i=0;i<16;i++){const a=i*Math.PI/8;assert.equal(surfaceAt(ADMIN_ISLAND_CENTER[0]+9*Math.cos(a),ADMIN_ISLAND_CENTER[1]+9*Math.sin(a)),'black road','Roundabout must provide an unbroken circulating road');}
assert.equal(surfaceAt(245,46),'grass','Relocated teardrop must remain exposed inside its black surround');
assert.equal(surfaceAt(239,53),'black road','The relocated teardrop must have a black circulating route');
assert.notEqual(surfaceAt(261,14),'grass','The old teardrop position must be cleared');
assert(!HISTORIC_GRAVEL.some(area=>area.name.startsWith('Annexe')),'No annexe gravel surfaces may remain in Historic');
for(const area of HISTORIC_PAVING){
 const mesh=layouts.historicRoads.getObjectByName(area.name);
 assert.equal(mesh.userData.surface,'black road');
 assert.equal(mesh.material.color.getHex(),0x555b5c);
}
const endIsland=annexePoint(125,0,65);
assert.equal(surfaceAt(endIsland[0],endIsland[2]),'grass','New end-lawn circuit must retain its grass island');
const crossDrive=annexePoint(96,0,64);
assert.equal(surfaceAt(crossDrive[0],crossDrive[2]),'black road','New cross-drive must cut through the former continuous lawn');
// The selected gap now has two exposed elongated lawns and a connected lane.
const annexeSurface=(x,z)=>{const p=annexePoint(x,0,z);return surfaceAt(p[0],p[2]);};
for(const x of [104,115,125,138]){
 assert.equal(annexeSurface(x,39),'grass','Court lawn must stay exposed along its length');
 assert.equal(annexeSurface(x,66),'grass','End lawn must not be swallowed by the former apron');
 assert.equal(annexeSurface(x,51),'black road','The shared drive must remain continuous between both lawns');
}
for(const p of [[96,25],[96,51],[96,84],[146,39],[153,66]])
 assert.equal(annexeSurface(...p),'black road','Court and avenue connections must remain open');
// The blue selection must expose terrain across the old road, pad and kerbs.
for(const name of ['Annexe rectangular garden circuit','Annexe rectangular garden circuit border','Annexe garden black margin','Annexe inset parking surface','Annexe parking entrance','Annexe parking-side kerb','Annexe junction inner kerb'])
 assert(!layouts.historicRoads.getObjectByName(name),'Removed garden geometry must leave no paving or kerbs');
for(const [x,z] of [[45,110],[75,136],[119,104],[119,123],[75,121],[111,101]]){
 const p=annexePoint(x,0,z);ray.set(new THREE.Vector3(p[0],2,p[2]),new THREE.Vector3(0,-1,0));
 const visibleMeshes=[];exterior.model.traverseVisible(o=>{if(o.isMesh)visibleMeshes.push(o);});
 const hits=ray.intersectObjects(visibleMeshes,false);
 assert.equal(hits[0]?.object,exterior.terrain,'The whole cleared garden and parking must expose terrain grass');
}
// Sample the full avenue width, including the strip previously paved twice.
for(const x of [-120,-80,-40,40,60,80]){
 for(const z of [75,78,80])assert.equal(annexeSurface(x,z),'grass','Lawns must reach the avenue border');
 for(const z of [81.2,84,86.8])assert.equal(annexeSurface(x,z),'black road','Avenue must retain its six-unit carriageway');
 for(const z of [80.7,87.3])assert.equal(annexeSurface(x,z),'stone kerb','Both avenue edges must have exposed borders');
 assert.notEqual(annexeSurface(x,88),'black road','No second road width may remain beyond the avenue');
}
// Both turns must be open, symmetric and curve progressively into the approach.
for(const side of [-1,1]){
 for(const p of [[6,55],[7,68],[10,75],[19,80],[25,83]])assert.equal(annexeSurface(side*p[0],p[1]),'black road','Each sweeping turn must be continuously paved');
 for(const p of [[9,62],[12,68],[18,75],[28,79]])assert.equal(annexeSurface(side*p[0],p[1]),'grass','Grass must follow both rounded entrance corners');
}
for(const z of [30,45,60,75,84])assert.equal(annexeSurface(0,z),'black road','Entrance centre must stay open without a crossing kerb');
// Sample both road edges as well as centre lines against the assembled buildings.
const extensions=['Historic lane continuation','Admin east crossing drive','Annexe inner east road','Annexe outer east road','Admin north service road','Annexe east cross-drive','Annexe east court circuit','Annexe end lawn circuit'];
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
// The red frontage lies on the apron; the old purple and blue sections are grass.
assert.equal(surfaceAt(195,46),'black road');
assert.notEqual(surfaceAt(210,63),'black road');
for(const p of [[323.85,127.5],[425.99,105.17],[273,151],[255,97]])
 assert.notEqual(surfaceAt(...p),'black road','Removed blue road must expose the ground');
for(const name of ['Annexe perimeter road','Annexe rear service spur','Eastern entrance road'])
 assert(!layouts.historicRoads.getObjectByName(name));
for(const p of [VIVIENNE_LANE[11],[216,131]])assert.equal(surfaceAt(...p),'black road','New roads must meet at the marked crossings');

for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(effective(layouts.historicRoads),historic);
 assert.equal(effective(layouts.roads.getObjectByName('Vivienne Smith Lane eastern continuation')),modern,'Blue eastern lane continuation belongs only to Modern');
 assert.equal(effective(exterior.legacyAccess),!historic&&modern,'Legacy tracks must disappear in Historic and return in Modern');
 const lane=layouts.roads.getObjectByName('Vivienne Smith Lane');assert.equal(lane.children[1].children[0].material.color.getHex(),0x555b5c);
 const other=layouts.roads.getObjectByName('Warren Lane');assert.equal(other.children[1].children[0].material.color.getHex(),0x555b5c,'Road colours must remain consistent in every layout');
}
console.log('PASS: historic surface normals/heights, finite geometry, registered OS wall contours, existing-building exclusions, church clearance, circular island circulation, teardrop and annexe lawn surfaces, saved-lane junction, isolated materials and replacement visibility in all four layout combinations.');
