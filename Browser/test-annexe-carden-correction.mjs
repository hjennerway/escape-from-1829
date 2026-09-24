import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {ANNEXE_VIEWS} from './dist/annexe.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {cardenCorrectionSnapshot} from './artifacts/annexe-carden-correction-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,16/9),a=e.annexe,d=a.userData.cardenElevation;
e.scene.updateMatrixWorld(true);
const snapshot=cardenCorrectionSnapshot(THREE,a,{excludeConcurrentJarman:true});
assert.deepEqual(snapshot,JSON.parse(readFileSync(new URL('../Research/carden-picton/outward-protected-geometry.json',import.meta.url))),'Everything outside the annotated side work and necessary spine join remains exact, including the front and roof landmarks');
assert(!a.getObjectByName('East low canted bay walls'));assert(!a.getObjectByName('East canted bay slate roof'));
assert(a.getObjectByName('West low canted bay walls'),'The unmarked opposite bay is retained');
assert(!a.userData.annexeOpenings.some(o=>o.name==='East low canted bay'),'Removed bay leaves no floating sash instances');
const tower=d.userData.openings.filter(o=>o.name==='Carden tower high rear sash');
assert.equal(tower.length,2);assert(tower.every(o=>o.y-o.h/2>17*.85),'Only two small high tower windows');
const ray=new THREE.Raycaster(),inside=o=>{for(let p=o;p;p=p.parent)if(p===d)return true;return false;};
for(const o of d.userData.openings){
 const outward=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r)),start=new THREE.Vector3(o.x,o.y+.12,o.z).addScaledVector(outward,.7);
 a.localToWorld(start);outward.transformDirection(a.matrixWorld);ray.set(start,outward.negate());const hit=ray.intersectObject(a,true)[0];
 assert(hit&&inside(hit.object)&&(hit.object.isInstancedMesh||/glazing/.test(hit.object.name)),'Exposed glazing against the complete annexe: '+JSON.stringify(o)+'; hit '+hit?.object.name);
}
const towerHost=a.userData.ranges.find(b=>b.name==='East square tower');
for(const y of [2,6,10,13]){
 ray.set(a.localToWorld(new THREE.Vector3(towerHost.x,y,towerHost.z-towerHost.d/2-1)),new THREE.Vector3(0,0,1).transformDirection(a.matrixWorld));
 assert.equal(ray.intersectObject(a,true)[0]?.object.name,'East square tower brick walls','The yellow-marked face has brick instead of long glazing');
}
const hall=a.userData.ranges.find(b=>b.name==='Central hall'),front=a.userData.annexeOpenings.filter(o=>o.name==='Hall dormer'),rear=d.userData.openings.filter(o=>o.name==='Rear hall dormer');
assert.equal(rear.length,3);
for(let i=0;i<3;i++)for(const key of ['x','y','w','h'])assert.equal(rear[i][key],front[i][key],'Rear projections match front '+key);
for(let i=0;i<3;i++)assert(Math.abs(rear[i].z+front[i].z-2*hall.z)<1e-10,'Three projections lie on the reflected rear hall face');
const fronts=a.children.filter(o=>o.name==='Hall dormer brick gable'),backs=d.userData.rearDormers.children.filter(o=>o.name==='Rear hall dormer brick gable');
assert.equal(backs.length,3);for(let i=0;i<3;i++)assert.equal(backs[i].geometry,fronts[i].geometry,'Rear pediments reuse the exact accepted front shape');
for(const name of d.userData.roofNames){const n=d.getObjectByName(name).geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(n.getY(i)>0,name+' faces upward');}
const points=d.userData.conservatoryFootprint;
const oldBay=[[29,-17],[37,-17],[40,-14],[40,-8],[37,-5],[29,-5]];
assert.equal(points.length,6);
for(let i=0;i<6;i++){assert(Math.abs(points[i][0]-oldBay[i][0]-.17)<1e-8);assert.equal(points[i][1]-oldBay[i][1],-13);}
const spine=a.userData.ranges.find(b=>b.name==='Central rear spine');
assert.equal(spine.h,4.7);assert.equal(spine.h+spine.rise,6.6,'Yellow roof matches the low adjoining roofs');
const lowered=a.userData.oakmereElevation.getObjectByName('Oakmere raised spine slate roof');
const loweredBounds=new THREE.Box3().setFromObject(lowered);
assert(Math.abs(loweredBounds.max.y-6.6*a.scale.y)<1e-5,'No old high roof remains');
const wing=d.userData.towerRange,wingWindows=d.userData.openings.filter(o=>o.name==='Carden tower range sash');
assert.equal(wingWindows.length,3);assert.equal(wing.x1,points[0][0],'Conservatory rear edge meets the gabled range');
assert(wing.z0<points[4][1]&&wing.z0>points[0][1],'Gabled section overlaps the conservatory join');assert.equal(wing.z1,towerHost.z-towerHost.d/2,'New gabled range joins the tower');
assert(wingWindows.every(o=>o.z>points[4][1]&&o.y-o.h/2>4.7),'All three sashes face the open side above the low link');
for(const z of [-19,-24,-29]){ray.set(a.localToWorld(new THREE.Vector3(29.17,30,z)),new THREE.Vector3(0,-1,0));assert(ray.intersectObject(d,true).some(h=>/roof/.test(h.object.name)),'Joined roofs have no open seam');}
const obstacles=exteriorObstacles(THREE,e.model),blocked=([x,z])=>{const p=a.localToWorld(new THREE.Vector3(x,1,z));return obstacles.some(o=>obstacleContains(o,p.x,p.z,0));};
for(const p of [[42,-11],[42,-15],[40,-29.5],[30,-34]])assert(!blocked(p),'Removed bay, clipped corners and purple recess remain open: '+p);
for(const p of [[35,-24],[39,-24],[27,-12],[15,-31],[25,-34]])assert(blocked(p),'New footprint stops walking: '+p);
for(const [x,z] of [[42,-11],[42,-29.5],[30,-34]]){
 ray.set(a.localToWorld(new THREE.Vector3(x,35,z)),new THREE.Vector3(0,-1,0));assert(!ray.intersectObject(a,true).some(h=>/roof/.test(h.object.name)),'No stale roof above removed bay or clipped lawn: '+[x,z]);
}
const view=ANNEXE_VIEWS['annexe-carden-photo'];assert(!obstacles.some(o=>obstacleContains(o,view.position[0],view.position[2])));
const walker=createWalker(e.camera,obstacles);walker.setView({position:a.localToWorld(new THREE.Vector3(46,1.8,-24)).toArray(),target:a.localToWorld(new THREE.Vector3(25,1.8,-24)).toArray()});walker.keys.add('KeyW');for(let i=0;i<30;i++)walker.update(.1);assert(a.worldToLocal(e.camera.position.clone()).x>40.17,'Walking stops at the canted conservatory');
const layouts=createAerialLayouts(THREE,e);for(const visible of [false,true]){layouts.setVisible('historic',visible);let shown=true;for(let p=d;p;p=p.parent)shown&&=p.visible;assert.equal(shown,visible);}
console.log('PASS: '+snapshot.primitives+' untouched primitives; two high tower sashes, removed bay, exact canted conservatory shape, stepped footprint, three reflected hall dormers, exposed glazing, roof normals, collisions and Historic visibility.');
