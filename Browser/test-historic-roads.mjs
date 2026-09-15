import {pointInFootprint,historicOSPoint,HISTORIC_OS_REGISTRATION} from './dist/historic-footprints.mjs';
import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {HISTORIC_ROADS,ADMIN_ISLAND_CENTER} from './dist/historic-roads.mjs';
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
for(const segment of missing.segments){
 const [a,b]=segment.points;
 const dx=Math.abs(b[0]-a[0]),dz=Math.abs(b[1]-a[1]);
 assert(Math.min(dx,dz,Math.abs(dx-dz))<1e-7,'Marked walls must remain horizontal, vertical or 45-degree diagonals after clipping');
 for(const t of [.01,.25,.5,.75,.99]){const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];assert(pointInFootprint(p,missing.region),'Every marked wall must be inside the blue source region');assert(!missing.occupied.some(polygon=>pointInFootprint(p,polygon)),'No missing-building mark may run through an existing building');}
}
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
for(let i=0;i<16;i++){const a=i*Math.PI/8;assert.equal(surfaceAt(237+9*Math.cos(a),62+9*Math.sin(a)),'black road','Roundabout must provide an unbroken circulating road');}
assert.equal(surfaceAt(261,14),'grass','Teardrop island must remain exposed');
assert.equal(surfaceAt(250,16),'gravel','A separate gravel walk must skirt the teardrop');
const garden=annexePoint(75,0,110);assert.equal(surfaceAt(garden[0],garden[2]),'grass','Near annexe garden must have a grass interior');
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(effective(layouts.historicRoads),historic);
 assert.equal(effective(exterior.legacyAccess),!historic&&modern,'Legacy tracks must disappear in Historic and return in Modern');
 const lane=layouts.roads.getObjectByName('Vivienne Smith Lane');assert.equal(lane.children[1].children[0].material.color.getHex(),historic?0x17191a:0x555b5c);
 const other=layouts.roads.getObjectByName('Warren Lane');assert.equal(other.children[1].children[0].material.color.getHex(),0x555b5c,'Changing shared-lane colour must not recolour other Modern roads');
}
console.log('PASS: historic surface normals/heights, finite geometry, registered OS wall contours, existing-building exclusions, church clearance, circular island circulation, teardrop and annexe lawn surfaces, saved-lane junction, isolated materials and replacement visibility in all four layout combinations.');
