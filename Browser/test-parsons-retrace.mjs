import assert from 'node:assert/strict';
import {KML_TREES} from './dist/kml-tree-data.mjs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {HISTORIC_ROADS,HISTORIC_ROAD_TRACES} from './dist/historic-road-layout.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
import {SHARED_HISTORIC_LANES} from './dist/historic-road-clearance.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16}},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
exterior.model.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),occupied=layouts.historicRoads.userData.missingFootprints.occupied;
function surface(x,z){ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(layouts.historicRoads,true)[0]?.object.userData.surface;}
for(const p of [[325,-176],[428.5,-186.87],[625,-183],[270,-132],[391,-148]])assert(!['black road','stone kerb'].includes(surface(...p)),'Removed road remains: '+p);
for(const road of HISTORIC_ROADS.filter(r=>['Northern Parsons Lane connection','Parsons Lane southern fork','Northern estate boundary','Irby Ashley tree-gap approach'].includes(r.name))){
 for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1e-8)continue;
  const steps=Math.ceil(length/.5);
  for(let j=0;j<=steps;j++){
   const t=j/steps,p=[a[0]+dx*t,a[1]+dz*t];
   assert.equal(surface(...p),'black road','Lane must remain continuous: '+road.name+' '+p);
   for(const offset of [-3.6,0,3.6]){
    const q=[p[0]-dz/length*offset,p[1]+dx/length*offset];
    assert(!occupied.some(poly=>pointInFootprint(q,poly)),'Lane must clear buildings: '+road.name+' '+q);
   }
  }
 }
}
const {PARSONS_NORTH_BEND}=await import('./dist/parsons-north-bend.mjs');
for(const p of PARSONS_NORTH_BEND.points)assert.equal(surface(...p),'black road','Rounded historic bend remains continuous');
for(const p of HISTORIC_ROAD_TRACES.find(r=>r.name==='Annexe front avenue').points)assert.equal(surface(...p),'black road');
console.log('PASS: retraced Parsons Lane and fork have continuous asphalt, full-width building clearance, an open saved-lane junction, and grass at removed blue sections.');

// The blue-circle relocation passes beneath a mature canopy. Keep the full
// carriageway and pale border clear of the mapped trunks.
for(const fork of HISTORIC_ROAD_TRACES.filter(r=>['Parsons Lane southern fork','Irby Ashley tree-gap approach'].includes(r.name))){
for(let i=1;i<fork.points.length;i++){
 const a=fork.points[i-1],b=fork.points[i],dx=b[0]-a[0],dz=b[1]-a[1],len2=dx*dx+dz*dz;
 for(const tree of KML_TREES){
  const t=Math.max(0,Math.min(1,((tree.x-a[0])*dx+(tree.z-a[1])*dz)/len2));
  assert(Math.hypot(tree.x-a[0]-t*dx,tree.z-a[1]-t*dz)>1+fork.width/2+.6,'Relocated fork clears the trunk of '+tree.name);
 }
}
}
for(const p of [[310,-103],[319,-100]])assert(!['black road','stone kerb'].includes(surface(...p)),'Former double-width fork returns to grass');

// The new yellow boundary is a straight, fully open road from the old fork
// frontage corner to the saved lane endpoint. The old red detour is grass.
const {ANNEXE_LOOP_ROAD}=await import('./dist/annexe-loop-road.mjs');
const {ANNEXE_TRIANGLE_CORNERS}=await import('./dist/historic-road-layout.mjs');
const {start}=ANNEXE_LOOP_ROAD,outerEnd=PARSONS_NORTH_BEND.start;
for(let i=0;i<=240;i++)assert.equal(surface(...start.map((v,k)=>v+(outerEnd[k]-v)*i/240)),'black road','Yellow outer road is continuous');
for(const p of [[410,-120],[470,-134],[510,-145],[533,-135]])assert(!['black road','stone kerb'].includes(surface(...p)),'Removed red outer detour returns to grass');
// The latest blue outline replaces the earlier rigid triangle relocation.
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
for(const [x,z] of ANNEXE_TRIANGLE_CORNERS)assert(x>=333&&x<=359&&z>=-86&&z<=-70,'Triangle lies in the blue outer-road area');
for(let i=0;i<3;i++)for(let step=0;step<=60;step++){
 const a=ANNEXE_TRIANGLE_CORNERS[i],b=ANNEXE_TRIANGLE_CORNERS[(i+1)%3];
 assert.equal(surface(...a.map((v,k)=>v+(b[k]-v)*step/60)),'black road','All three arms of the blue triangle connect');
}
const island=[344,-80];
for(const offset of [[0,0],[-.5,0],[.5,0],[0,-.5],[0,.5]])assert(!['black road','stone kerb'].includes(surface(...island.map((v,i)=>v+offset[i]))),'The triangle retains a visible grass centre');
const {ANNEXE_ROAD_TREES}=await import('./dist/annexe-road-trees.mjs');
for(const tree of ANNEXE_ROAD_TREES.slice(0,2))assert(tree.z>-79,'The two trees stay inside the new road, away from its triangular island');
console.log('PASS: straight outer road, continuous blue triangular junction and visible grass island.');

// The pink arm and former purple triangle are completely removed.
for(const p of [[310,-111],[325,-108],[340,-106],[350.4,-90.5]])assert(!['black road','stone kerb'].includes(surface(...p)),'Pink road / old purple island approach is removed');

for(const p of [[314,-72],[325,-68],[324,-62.5]])assert(!['black road','stone kerb'].includes(surface(...p)),'Old triangle and upward loop return to grass: '+p);
for(const p of [[291,-73.47],[299,-73.72]])assert.notEqual(surface(...p),'gravel','Former gravel alignment is grass');

// Latest frontage request: a majority straight parallel to the actual annexe,
// exactly one six-metre carriageway closer at the central doorway axis.
const {readFileSync}=await import('node:fs');
const {ANNEXE,ANNEXE_SITE,annexeSiteLocal,annexePoint}=await import('./dist/annexe.mjs');
const before=JSON.parse(readFileSync(new URL('../Research/historic-roads/annexe-parallel-before.json',import.meta.url)));
assert.deepEqual(ANNEXE,before.annexe,'Road realignment leaves the complete annexe fixed');
const avenue=HISTORIC_ROAD_TRACES.find(r=>r.name==='Annexe front avenue'),local=avenue.points.map(annexeSiteLocal);
const straight=local.slice(-3,-1),oldBase=[before.triangle[2],before.triangle[1]].map(annexeSiteLocal);
const door=annexePoint(0,0,0),doorX=annexeSiteLocal([door[0],door[2]])[0];
const oldZ=oldBase[0][1]+(doorX-oldBase[0][0])*(oldBase[1][1]-oldBase[0][1])/(oldBase[1][0]-oldBase[0][0]);
assert(Math.abs((oldZ-straight[0][1])*ANNEXE_SITE.scale-6)<1e-8,'Frontage moves one road width toward the doorway');
let parallelLength=0,totalLength=0;
for(let i=1;i<local.length;i++){
 const a=local[i-1],b=local[i],length=distance(a,b);totalLength+=length;
 if(Math.abs(b[1]-a[1])<1e-8)parallelLength+=length;
}
assert(parallelLength/totalLength>.7,'More than 70% of the road is exactly parallel to the annexe frontage');
assert.equal(avenue.width,6,'Keep the carriageway width');
const approach=HISTORIC_ROAD_TRACES.find(r=>r.name==='Irby Ashley tree-gap approach');
assert.equal(approach.width,6,'The red route keeps the existing carriageway width');
assert.equal(surface(267,-78),'black road','Red route meets the Irby side court');
for(const p of [[277,-87],[289,-99],[307,-95],[324,-87]])assert.equal(surface(...p),'black road','Red marked route is present through the tree gap');
const {ANNEXE_GRAVEL_PATH}=await import('./dist/annexe-front-roads.mjs');
const [gravelStart,gravelEnd]=ANNEXE_GRAVEL_PATH.centerline;
assert.equal(ANNEXE_GRAVEL_PATH.width,2.4,'The yellow path keeps its narrow gravel width');
assert(gravelEnd[1]>gravelStart[1]+8,'The yellow diagonal moves away from the trees');
assert.equal(surface(292,-59.1),'gravel','The path follows the yellow guide across the lawn');
assert.notEqual(surface(292,-61.5),'gravel','The old straight gravel alignment returns to grass');
console.log('PASS: unchanged parallel frontage and annexe, red tree-gap access, blue triangle and yellow gravel diagonal.');

// Rounding must replace the exposed angular borders without covering lanes.
const {IRBY_ROUNDED_BEND,IRBY_TRIANGLE_ROUNDING}=await import('./dist/irby-junction-rounding.mjs');
for(let i=5;i<IRBY_ROUNDED_BEND.points.length-5;i++){
 const p=IRBY_ROUNDED_BEND.points[i],normal=IRBY_ROUNDED_BEND.normals[i];
 const sample=offset=>surface(...p.map((v,k)=>v+normal[k]*offset));
 assert.equal(sample(-.3),'black road','Rounded bend has uninterrupted asphalt');
 assert.equal(sample(.3),'stone kerb','The pale edge follows the new curve');
 assert(!['black road','stone kerb'].includes(sample(1)),'No old angular road protrudes beyond the rounded edge');
}
for(const arc of IRBY_TRIANGLE_ROUNDING.arcs){
 assert.equal(surface(...arc.oldCorner),'black road','Every former sharp island tip is resurfaced');
 for(const p of arc.points.slice(1,-1)){
  const outward=p.map((v,k)=>(v-arc.center[k])/arc.radius);
  assert.equal(surface(...p),'stone kerb','The rounded inner kerb remains visible above resurfacing');
  assert.equal(surface(...p.map((v,k)=>v-outward[k]*.6)),'grass','Rounded corners retain the island lawn');
  assert.equal(surface(...p.map((v,k)=>v+outward[k]*.6)),'black road','Rounded corners join the carriageway without old kerb fragments');
 }
}
console.log('PASS: smooth continuous bend edging, three rounded island corners and clear carriageways.');

// The annotated pre-2010 elbow leaves the fixed lamp and old point on grass.
const {LAMP_POSTS}=await import('./dist/kml-11-data.mjs');
const lamp=LAMP_POSTS[1];
for(const p of [[lamp.x,lamp.z],ANNEXE_LOOP_ROAD.end,[507.5,-90]])
 assert(!['black road','stone kerb'].includes(surface(...p)),'Old corner and side-road nub return to grass: '+p);
for(const p of PARSONS_NORTH_BEND.points.slice(2,-2)){
 const normal=p.map((v,k)=>(v-PARSONS_NORTH_BEND.center[k])/PARSONS_NORTH_BEND.radius);
 for(const side of [-1,1]){
  assert.equal(surface(...p.map((v,k)=>v+normal[k]*side*2.7)),'black road','Full width of rounded bend stays paved');
  assert.equal(surface(...p.map((v,k)=>v+normal[k]*side*3.3)),'stone kerb','Both borders follow the bend');
  assert(!['black road','stone kerb'].includes(surface(...p.map((v,k)=>v+normal[k]*side*4))),'Outside the bend remains grass');
 }
}
const {LARKTON_APPROACH}=await import('./dist/annexe-access.mjs');
const {annexeOuterRoadZ}=await import('./dist/annexe-loop-road.mjs');
assert(LARKTON_APPROACH.points.every(p=>p[1]>=annexeOuterRoadZ(p[0])-1e-8),'The side road no longer doubles back beyond the outer road');
const tail=layouts.roads.getObjectByName('Parsons Lane northern modern endpoint');
assert(!tail.visible,'Historic layout hides the original pointed endpoint');
layouts.setVisible('modern',true);assert(tail.visible,'Modern layout retains the saved endpoint');
layouts.setVisible('modern',false);assert(!tail.visible,'Returning to Historic restores the rounded end');
console.log('PASS: lamp clearance, full bend width and kerbs, removed junction nub, and period-specific saved endpoint.');
