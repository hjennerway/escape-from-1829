import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {annexeGroundPoint,annexeGroundLocal} from './dist/annexe-ground-placement.mjs';
import {ANNEXE_ACCESS,ANNEXE_REAR_JUNCTIONS} from './dist/annexe-access.mjs';
import {HISTORIC_ROADS,ADMIN_TEARDROP} from './dist/historic-roads.mjs';
import {distanceToSharedLane,SHARED_HISTORIC_LANES} from './dist/historic-road-clearance.mjs';
import {VIVIENNE_LANE} from './dist/modern-entrance.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),l=createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),surface=(x,z)=>{ray.set(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(l.historicRoads,true)[0]?.object.userData.surface;};
// The building-only placement correction leaves these access surfaces fixed.
const world=(x,z)=>{const p=annexeGroundPoint(x,0,z);return [p[0],p[2]];};
const at=(x,z)=>surface(...world(x,z));
assert(Math.abs(ANNEXE_ACCESS.entranceWidth/(ANNEXE_ACCESS.frontage*.2)-.6)<1e-12,'Sweep neck must be 60% of the previous opening');
assert(!l.historicRoads.getObjectByName('Annexe entrance gate'),'Remove the complete gate, including piers and leaves');
for(const name of ['Annexe paved forecourt','Annexe central door walk'])assert(!l.historicRoads.getObjectByName(name),'Remove the pale paving sections');
l.historicRoads.traverse(o=>assert.notEqual(o.userData.surface,'stone paving','No pale frontage paving remains'));
const forecourt=l.historicRoads.getObjectByName('Annexe central asphalt forecourt');
const sweep=l.historicRoads.getObjectByName('Annexe sweeping entrance');
const localXs=[];for(let i=0;i<sweep.geometry.attributes.position.count;i++){
 const p=new THREE.Vector3().fromBufferAttribute(sweep.geometry.attributes.position,i).applyMatrix4(sweep.matrixWorld);localXs.push(annexeGroundLocal([p.x,p.z])[0]);
}
assert(Math.abs(Math.max(...localXs)-Math.min(...localXs)-94*.6)<.0001,'The entire flared mouth must also be 60% of its former width');
for(const x of [-25,-15,0,15,25])for(const z of [29,36,51,63])assert.equal(at(x,z),'black road','The red-selected central apron must use road asphalt');
for(const x of [-70,-40,40,70])for(const z of [57,62])assert(!['black road','stone kerb','stone paving'].includes(at(x,z)),'The removed frontage strips must expose grass');
for(const z of [28,32,34,46,60,63,65,70,78,80.6,82,84])assert.equal(at(0,z),'black road','Existing asphalt must remain continuous at ground-frame z='+z);
// The later annexe-only move supersedes the assumption that this fixed drive
// still reaches the entrance or clears its wings. Keep road surface checks;
// test-historic-roads.mjs continues to report site-wide building overlaps.
for(const side of [-1,1]){
 for(const q of side<0?[[-92,81],[-92,62],[-78,53]]:[[96,81],[96,62],[96,41],[118,31]])assert.equal(at(...q),'black road','Both marked side approaches must connect to the front avenue');
}
for(const junction of ANNEXE_REAR_JUNCTIONS){
 for(const p of junction.paving.points)assert(distanceToSharedLane(p)>=3-1e-7,'Rear junctions meet the saved asphalt edge without duplicating lane asphalt');
 const road=HISTORIC_ROADS.find(r=>r.name===junction.name);assert(road);
 const start=road.points[0],origin=junction.origin,dx=start[0]-origin[0],dz=start[1]-origin[1],length=Math.hypot(dx,dz);
 for(let distance=3.1;distance<length+2;distance+=.3)assert.equal(surface(origin[0]+dx/length*distance,origin[1]+dz/length*distance),'black road','No grass gap or crossing kerb at '+junction.name);
}
for(const p of [[12,-88],[105,73]])assert.equal(at(...p),'black road','Both marked hardstandings must be paved');
// Join the exact red-circled western and four-way junctions, including old caps.
for(const [name,index] of [['Historic lane continuation',8],['Admin east crossing drive',11],['Southern estate drive',11],['Annexe inner east road',11]]){
 const road=HISTORIC_ROADS.find(r=>r.name===name),end=name==='Admin east crossing drive',p=end?road.points.at(-1):road.points[0],a=VIVIENNE_LANE[index];
 for(let i=0;i<=32;i++){const t=i/32;assert.equal(surface(a[0]+(p[0]-a[0])*t,a[1]+(p[1]-a[1])*t),'black road','Red-circled gap must be joined: '+name);}
}
// The two newly circled northern road ends connect around the annexe.
const northern=HISTORIC_ROADS.find(r=>r.name==='Northern Parsons Lane connection');
assert.deepEqual(northern.points[0],[625,-183]);
const savedEnd=SHARED_HISTORIC_LANES.find(p=>p.name==='Parsons Lane (North)').points.at(-1),joinedEnd=northern.points.at(-1);
for(let i=0;i<=32;i++){const t=i/32;assert.equal(surface(savedEnd[0]+(joinedEnd[0]-savedEnd[0])*t,savedEnd[1]+(joinedEnd[1]-savedEnd[1])*t),'black road','The northern Parsons ends must form one continuous road');}
assert(northern.points.every(p=>p[0]>565),'The new curve must stay outside the annexe');
// A single smooth grass edge covers the former segmented inner teardrop kerb.
const center=[267.5,44];
for(const p of ADMIN_TEARDROP){
 const inner=p.map((v,i)=>v*.88+center[i]*.12),outer=p.map((v,i)=>v*1.07-center[i]*.07);
 assert.equal(surface(...inner),'grass','No asphalt blips may intrude inside the smooth teardrop lawn');
 assert.notEqual(surface(...outer),'grass','The island must not hide the surrounding carriageway');
}
for(const historic of [true,false])for(const modern of [true,false]){
 l.setVisible('historic',historic);l.setVisible('modern',modern);
 for(const object of [sweep,forecourt]){let visible=true;for(let o=object;o;o=o.parent)visible&&=o.visible;assert.equal(visible,historic,'Annexe access belongs to Historic');}
}
console.log('PASS: fixed access surfaces, 60% sweep width, central asphalt apron, removed pale strips and gates, side roads, two connected Parsons junctions, hardstandings, joined admin roads, smooth teardrop and Historic visibility.');
