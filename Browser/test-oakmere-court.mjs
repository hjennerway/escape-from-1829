import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {oakmereCourtProtected} from './artifacts/oakmere-court-scope.mjs';
import {BUILDING_CATALOG} from './dist/building-catalog.mjs';
import {ANNEXE_MAP_SCALE as S} from './dist/annexe.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),a=e.annexe,g=a.userData.oakmereCourt;
a.updateMatrixWorld(true);
assert.deepEqual(oakmereCourtProtected(THREE,a),JSON.parse(readFileSync(new URL('../Research/oakmere/court-protected-before.json',import.meta.url))),'Every pre-existing annexe primitive remains unchanged');
assert.equal(g.parent,a.userData.wards.oakmere);
const obstacles=exteriorObstacles(THREE,e.model),ray=new THREE.Raycaster();
// Sample both edges and the middle across the whole formerly open blue/green gap.
for(const x of [-5.7,0,5.7])for(let z=14.9;z<=27.5;z+=.6){
 const p=g.localToWorld(new THREE.Vector3(x*S,1.8,z*S));
 assert(obstacles.some(o=>obstacleContains(o,p.x,p.z,0)),'Continuous full-width masonry and walking collision');
 ray.set(new THREE.Vector3(p.x,40,p.z),new THREE.Vector3(0,-1,0));
 assert(ray.intersectObject(a,true).some(h=>h.object.name.endsWith('slate roof')),'Roof covers the whole join');
}
for(const x of [-6,6]){
 const p=a.worldToLocal(g.localToWorld(new THREE.Vector3(x*S,1,27.5*S)));
 assert(p.z>=-54.35*S&&p.z<=-47.19*S&&p.x>=-28*S&&p.x<=-3*S,'Both blue-edge corners enter the green rear wall');
}
const head=g.userData.head;
assert.equal(head.extension,14,'Blue cross-head face receives the requested outward length');
for(const u of [11,14,18,22,24.8])for(const n of [-4.8,0,4.8]){
 const p=g.localToWorld(new THREE.Vector3((head.x+u)*S,1.8,(head.z+n)*S));
 assert(obstacles.some(o=>obstacleContains(o,p.x,p.z,0)),'Widened head has continuous collision');
 ray.set(new THREE.Vector3(p.x,40,p.z),new THREE.Vector3(0,-1,0));assert(ray.intersectObject(a,true).some(h=>h.object.name.endsWith('slate roof')),'Widened head roof is continuous');
}
assert(Math.abs(g.userData.annex.x-3.5-(head.x+head.end)+.05)<1e-9,'Low annex follows the outward head end');
const annex=g.getObjectByName('Oakmere square annex brick walls');
assert.equal(annex.geometry.parameters.width,annex.geometry.parameters.depth);
assert(annex.position.x>(head.x+head.end)*S,'Square annex projects visibly beyond the head end');
const p=annex.getWorldPosition(new THREE.Vector3());assert(obstacles.some(o=>obstacleContains(o,p.x,p.z,0)));
g.traverse(o=>{if(!o.name.endsWith('slate roof'))return;const n=o.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(n.getY(i)>0,o.name+' faces upward');});
const photoCamera=a.localToWorld(new THREE.Vector3(14,8.64,-116));
const annexRoof=g.localToWorld(new THREE.Vector3(annex.position.x,5.9,annex.position.z));
ray.set(photoCamera,annexRoof.clone().sub(photoCamera).normalize());
assert(ray.intersectObject(a,true)[0]?.object.name.includes('annex'),'Low annex is visible from the courtyard photo direction');
const layouts=createAerialLayouts(THREE,e);for(const visible of [false,true]){layouts.setVisible('historic',visible);let shown=true;for(let o=g;o;o=o.parent)shown&&=o.visible;assert.equal(shown,visible);}
assert(BUILDING_CATALOG.find(b=>b.id==='oakmere').photos.some(p=>p.src.endsWith('oakmere-rear-court.webp')));
console.log('PASS: full-width Oakmere wall/roof join, square attached annex, collision, Historic visibility, gallery ownership and all original annexe primitives unchanged.');
