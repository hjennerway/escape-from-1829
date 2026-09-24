import {LARKTON_SHIFT} from './dist/annexe-larkton-recess.mjs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {ANNEXE_MAP_SCALE,annexePoint} from './dist/annexe.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {HISTORIC_ROAD_TRACES} from './dist/historic-road-layout.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),a=e.annexe,l=createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
// Normalize only the independently requested entrance depth in an isolated
// process; the original fingerprint remains immutable and live geometry is
// used for every paving, roof, collision and timeline assertion below.
execFileSync(process.execPath,['--import',new URL('./artifacts/larkton-original-entrance-loader.mjs',import.meta.url).href,fileURLToPath(new URL('./artifacts/check-larkton-original.mjs',import.meta.url))],{windowsHide:true});
assert(!a.getObjectByName('West rear link brick walls'));assert(!a.getObjectByName('West rear link slate roof'));
const pavilion=a.userData.ranges.find(r=>r.name==='West rear pavilion');
assert(Math.abs((pavilion.x+pavilion.w/2)/ANNEXE_MAP_SCALE+86-LARKTON_SHIFT)<1e-9);
const obstacles=exteriorObstacles(THREE,e.model),ray=new THREE.Raycaster();
const world=(x,z)=>{const p=annexePoint((x+LARKTON_SHIFT)*ANNEXE_MAP_SCALE,0,z*ANNEXE_MAP_SCALE);return [p[0],p[2]];};
const surface=p=>{ray.set(new THREE.Vector3(p[0],1,p[1]),new THREE.Vector3(0,-1,0));return ray.intersectObject(l.historicRoads,true)[0]?.object.userData.surface;};
for(const [x,z] of [[-81,-44],[-81,-35],[-81,-20],[-81,-10]]){
 const p=world(x,z);assert(!obstacles.some(o=>obstacleContains(o,...p,0)),'Removed wing is walkable');assert.equal(surface(p),'black road');
 ray.set(new THREE.Vector3(p[0],40,p[1]),new THREE.Vector3(0,-1,0));assert(!ray.intersectObject(a,true).some(h=>/roof|walls/.test(h.object.name)),'No retained roof or wall in removed section');
}
for(const [x,z] of [[-96,-36],[-89,-31],[-96,-14],[-89,-10]])assert.equal(surface(world(x,z)),undefined,'Small courtyard remains green');
for(const [x,z] of [[-107,-40.1],[-101.1,-45],[-95,-49.1],[-85.9,-44],[-80,-8.1],[-75,-60]])assert.equal(surface(world(x,z)),'black road','Paving contacts each building edge');
const road=HISTORIC_ROAD_TRACES.find(r=>r.name==='Annexe Larkton Parsons approach'),parsons=HISTORIC_ROAD_TRACES.find(r=>r.name==='Northern Parsons Lane connection');
assert(parsons.points.some(p=>p[0]===road.points[0][0]&&p[1]===road.points[0][1]),'Road begins on the preserved Parsons bend');
for(let i=1;i<road.points.length;i++){
 const p=road.points[i-1],q=road.points[i],dx=q[0]-p[0],dz=q[1]-p[1],len=Math.hypot(dx,dz);
 for(let j=0;j<=5;j++)for(const offset of [-2,0,2]){
  const v=[p[0]+dx*j/5-dz/len*offset,p[1]+dz*j/5+dx/len*offset];
  assert.equal(surface(v),'black road','Continuous full-width road and open junction');assert(!obstacles.some(o=>obstacleContains(o,...v,.3)),'Road clears buildings');
 }
}
const timeline=prepareEstateTimeline(THREE,e,l),visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
for(const year of [1912,1915,1938,2010]){
 timeline.setPeriod(year);
 for(const name of ['Annexe Larkton paved court','Annexe Larkton Parsons approach','Annexe Larkton Parsons open junction'])assert.equal(visible(l.historicRoads.getObjectByName(name)),year===1915||year===1938,'New surfaces follow annexe dates');
}
console.log('PASS: Larkton removal, paving contact, green courtyard, open full-width Parsons connection, walking clearance, timeline and 18,942 protected primitives.');

