import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {annexeGroundPoint} from './dist/annexe-ground-placement.mjs';
import {annexePoint} from './dist/annexe.mjs';
import {ANNEXE_FRONT_AVENUE,ANNEXE_GRAVEL_PATH,shiftAnnexeTeardrop} from './dist/annexe-front-roads.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {ANNEXE_ACCESS,ANNEXE_REAR_JUNCTIONS} from './dist/annexe-access.mjs';
import {HISTORIC_ROADS,HISTORIC_ROAD_TRACES,ADMIN_TEARDROP} from './dist/historic-roads.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
import {SHARED_HISTORIC_LANES} from './dist/historic-road-clearance.mjs';
import {VIVIENNE_LANE} from './dist/modern-entrance.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),l=createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),surface=(x,z)=>{ray.set(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(l.historicRoads,true)[0]?.object.userData.surface;};
const world=(x,z)=>{const p=annexePoint(x,0,z);return [p[0],p[2]];};
const at=(x,z)=>surface(...world(x,z));
assert(Math.abs(ANNEXE_ACCESS.entranceWidth/ANNEXE_ACCESS.forecourtWidth-.16)<1e-12,'The yellow-outlined neck is 16% of the protected apron width');
assert(!l.historicRoads.getObjectByName('Annexe entrance gate'),'Remove the complete gate, including piers and leaves');
for(const name of ['Annexe paved forecourt','Annexe central door walk'])assert(!l.historicRoads.getObjectByName(name),'Remove the pale paving sections');
l.historicRoads.traverse(o=>assert.notEqual(o.userData.surface,'stone paving','No pale frontage paving remains'));
const forecourt=l.historicRoads.getObjectByName('Annexe central asphalt forecourt');
const sweep=l.historicRoads.getObjectByName('Annexe sweeping entrance');
const localXs=[];for(let i=0;i<sweep.geometry.attributes.position.count;i++){
 const p=new THREE.Vector3().fromBufferAttribute(sweep.geometry.attributes.position,i).applyMatrix4(sweep.matrixWorld);localXs.push(e.annexe.worldToLocal(p).x);
}
assert(Math.abs(Math.max(...localXs)-Math.min(...localXs)-ANNEXE_ACCESS.entranceMouthWidth)<.0001,'The narrow neck flares smoothly to the specified road mouth');
for(const x of [-25,-15,0,15,25])for(const z of [29,36,51,63])assert.equal(at(x,z),'black road','The red-selected central apron must use road asphalt');
for(const x of [-70,-40,40,70])for(const z of [57,62])assert(!['black road','stone kerb','stone paving'].includes(at(x,z)),'The removed frontage strips must expose grass');
const obstacles=exteriorObstacles(THREE,e.model);
for(let z=28;z<=ANNEXE_ACCESS.avenueZ;z+=.4){
 assert.equal(at(0,z),'black road','The central entrance meets the relocated red-line avenue');
 assert(!obstacles.some(o=>obstacleContains(o,...world(0,z))),'The central entrance is clear for walking');
}
for(const name of ['Annexe west side access','Annexe east side access','Annexe east roadside hardstanding','Annexe roadside hardstanding exposed kerb'])
 for(const suffix of ['',' border'])assert(!l.historicRoads.getObjectByName(name+suffix),'Removed side access must leave no road or kerb');
assert.equal(ANNEXE_REAR_JUNCTIONS.length,0,'Remove both yellow-circled rear junction mouths');
for(const name of ['Annexe rear north access','Annexe rear east access','Annexe rear ward approach','Annexe rear east return','Annexe rear hardstanding','Annexe rear hardstanding exposed kerb','Annexe rear north access open junction','Annexe rear east access open junction'])
 for(const suffix of ['',' border'])assert(!l.historicRoads.getObjectByName(name+suffix),'Remove the whole yellow-circled rear group: '+name);
for(const p of [[12,-88],[56,-93],[72,-75],[86,-61]]){
 const q=annexeGroundPoint(p[0],0,p[1]);assert(!['black road','stone kerb'].includes(surface(q[0],q[2])),'Former rear roads and hardstanding return to grass');
}
// Join the exact red-circled western and four-way junctions, including old caps.
for(const [name,index] of [['Historic lane continuation',8],['Admin east crossing drive',11],['Southern estate drive',11],['Annexe inner east road',11]]){
 const road=HISTORIC_ROADS.find(r=>r.name===name),end=name==='Admin east crossing drive',p=end?road.points.at(-1):road.points[0],a=VIVIENNE_LANE[index];
 for(let i=0;i<=32;i++){const t=i/32;assert.equal(surface(a[0]+(p[0]-a[0])*t,a[1]+(p[1]-a[1])*t),'black road','Red-circled gap must be joined: '+name);}
}
// The two newly circled northern road ends connect around the annexe.
const northern=HISTORIC_ROADS.find(r=>r.name==='Northern Parsons Lane connection');
assert.deepEqual(northern.points[0],[270,-117]);
const savedEnd=SHARED_HISTORIC_LANES.find(p=>p.name==='Parsons Lane (North)').points.at(-1),joinedEnd=northern.points.at(-1);
for(let i=0;i<=32;i++){const t=i/32;assert.equal(surface(savedEnd[0]+(joinedEnd[0]-savedEnd[0])*t,savedEnd[1]+(joinedEnd[1]-savedEnd[1])*t),'black road','The northern Parsons ends must form one continuous road');}
assert(northern.points.every(p=>p[1]<-84),'The retraced lane must stay north of the annexe');
// A single smooth grass edge covers the former segmented inner teardrop kerb.
const center=shiftAnnexeTeardrop([267.5,44]);
for(const p of ADMIN_TEARDROP){
 const inner=p.map((v,i)=>v*.88+center[i]*.12),outer=p.map((v,i)=>v*1.07-center[i]*.07);
 assert.equal(surface(...inner),'grass','No asphalt blips may intrude inside the smooth teardrop lawn');
 assert.notEqual(surface(...outer),'grass','The island must not hide the surrounding carriageway');
}
// Translation-normalised vertex snapshots from before the user's road edit.
// These protect every bend, not just the teardrop's overall dimensions.
const shapeHash=points=>createHash('sha256').update(JSON.stringify(points.map(p=>p.map((v,i)=>Math.round((v-points[0][i])*1e7)/1e7)))).digest('hex');
const tear=HISTORIC_ROAD_TRACES.find(r=>r.name==='Admin teardrop circulation');
assert.equal(shapeHash(tear.points),'6c6b9a92340631ff33d6ebf44603f601c8b74c2dcd70529f274d9c2907f79034');
assert.equal(shapeHash(ADMIN_TEARDROP),'bd760d9cd0f943e41c075d4ab0a7dee21b4b8db4c440ead466439f2d298700da');
assert.equal(tear.width,5,'The teardrop carriageway is not resized');
assert.deepEqual(tear.points[0],shiftAnnexeTeardrop([270,18]));
const occupied=l.historicRoads.userData.missingFootprints.occupied;
for(const name of ['Annexe front avenue','Admin teardrop circulation','Admin east crossing drive','Historic lane continuation']){
 const road=HISTORIC_ROADS.find(r=>r.name===name);
 for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),steps=Math.max(1,Math.ceil(length/.4));
  if(length<1e-8)continue;
  for(let n=0;n<=steps;n++)for(const offset of [-road.width/2-.6,0,road.width/2+.6]){
   const p=[a[0]+dx*n/steps-dz/length*offset,a[1]+dz*n/steps+dx/length*offset];
   assert(!occupied.some(poly=>pointInFootprint(p,poly)),name+' must clear all buildings across its full width');
  }
 }
}
// Both ends of the red line connect to their roads, with an open gravel mouth.
for(const p of HISTORIC_ROAD_TRACES.find(r=>r.name==='Annexe front avenue').points)assert.equal(surface(...p),'black road');
const [start,end]=ANNEXE_GRAVEL_PATH.centerline;
for(let t=.05;t<.94;t+=.03){const p=start.map((v,i)=>v+(end[i]-v)*t);
 assert.equal(surface(...p),'gravel','The yellow line is a continuous gravel path');
 assert(!obstacles.some(o=>obstacleContains(o,...p)),'The gravel path clears all buildings');
}
assert.equal(surface(...start),'black road','Gravel starts on the existing service court');
assert.equal(surface(...end),'black road','Gravel meets the frontage asphalt without a kerb across its mouth');
for(const historic of [true,false])for(const modern of [true,false]){
 l.setVisible('historic',historic);l.setVisible('modern',modern);
 for(const object of [sweep,forecourt]){let visible=true;for(let o=object;o;o=o.parent)visible&&=o.visible;assert.equal(visible,historic,'Annexe access belongs to Historic');}
}
console.log('PASS: red-line avenue, clear central sweep, yellow gravel link, removed rear and side roads, protected lane junctions and teardrop, and Historic visibility.');
