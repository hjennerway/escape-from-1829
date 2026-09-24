import {stretchAnnexeRearZ} from './dist/annexe-rear-stretch.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {ANNEXE_MAP_SCALE,ANNEXE_VIEWS,annexePoint} from './dist/annexe.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {protectedKitchenGeometry} from './artifacts/annexe-kitchen-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,16/9),annexe=e.annexe,detail=annexe.userData.rearKitchen;
e.scene.updateMatrixWorld(true);
assert.deepEqual(protectedKitchenGeometry(THREE,annexe),JSON.parse(readFileSync(new URL('../Research/annexe-kitchen/protected-geometry.json',import.meta.url))),'Every protected annexe primitive, including the front and both Oakmere elevations, stays unchanged');
const obstacles=exteriorObstacles(THREE,e.model),ray=new THREE.Raycaster();
const point=(x,y,z)=>annexePoint(x*ANNEXE_MAP_SCALE,y,stretchAnnexeRearZ(z)*ANNEXE_MAP_SCALE);
// Test the full pavement on a grid, including its edges, and reject floating
// roofs, window details or collision boxes left across the new road opening.
for(let z=-54.5;z<=-30;z+=.5)for(const x of [-2.4,-1,0.4]){
 const p=point(x,1.8,z);
 assert(!obstacles.some(o=>obstacleContains(o,p[0],p[2],.4)),'Access lane is clear at '+[x,z]);
 ray.set(new THREE.Vector3(...point(x,40,z)),new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(annexe,true)[0];
 assert(hit&&/paving|access road/.test(hit.object.name),'Open sky and continuous paving at '+[x,z]);
}
for(let z=-38.7;z<=-29.5;z+=.65)for(let x=-7.7;x<=4.7;x+=.65){
 ray.set(new THREE.Vector3(...point(x,1,z)),new THREE.Vector3(0,-1,0));
 assert(ray.intersectObject(detail,true).some(h=>/paving/.test(h.object.name)),'Whole court paved at '+[x,z]);
}
const walker=createWalker(e.camera,obstacles);
walker.setView({position:point(-1,1.8,-54),target:point(-1,1.8,-30)});walker.keys.add('KeyW');
const travel=Math.hypot(...point(-1,1.8,-32).map((n,i)=>n-point(-1,1.8,-54)[i]));
for(let i=0;i<Math.ceil(travel/.5);i++)walker.update(.1);
assert(annexe.worldToLocal(e.camera.position.clone()).z>stretchAnnexeRearZ(-35)*ANNEXE_MAP_SCALE,'Walk from outside through the opening into the court');
for(let i=0;i<20;i++)walker.update(.1);
assert(annexe.worldToLocal(e.camera.position.clone()).z<stretchAnnexeRearZ(-29)*ANNEXE_MAP_SCALE,'The kitchen wall still blocks walking');
for(const name of ['Rear court front range slate roof','Annexe kitchen ventilator slate roof']){
 const normal=detail.getObjectByName(name).geometry.getAttribute('normal');
 for(let i=0;i<normal.count;i++)assert(normal.getY(i)>0,name+' faces upward');
}
assert.equal(detail.userData.openings.length,4);
for(const opening of detail.userData.openings){
 const start=annexe.localToWorld(new THREE.Vector3(opening.x,opening.y,opening.z-1));
 const direction=new THREE.Vector3(0,0,1).transformDirection(annexe.matrixWorld);
 ray.set(start,direction);const hit=ray.intersectObject(annexe,true)[0];
 assert(hit?.object.parent===detail&&hit.object.isInstancedMesh,'The four kitchen openings are exposed');
}
const view=ANNEXE_VIEWS['annexe-kitchen'];
assert(!obstacles.some(o=>obstacleContains(o,view.position[0],view.position[2])),'Photo camera is inside the open courtyard');
const layouts=createAerialLayouts(THREE,e);
for(const visible of [false,true]){layouts.setVisible('historic',visible);let shown=true;for(let o=detail;o;o=o.parent)shown&&=o.visible;assert.equal(shown,visible,'Kitchen and paving follow Historic visibility');}
console.log('PASS: protected annexe geometry, kitchen openings, full courtyard paving, clear access road, actual walking route and Historic visibility.');
