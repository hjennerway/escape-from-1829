import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {ANNEXE_VIEWS} from './dist/annexe.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},strokeText(){},fillText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,16/9),detail=e.annexe.userData.oakmereElevation;
e.scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),outward=new THREE.Vector3(0,0,1).transformDirection(detail.matrixWorld);
// A window count cannot detect a window buried in an adjoining older range.
// Cast against the entire annexe to check every new light, including end rooms.
for(const o of detail.userData.openings){
 const p=detail.localToWorld(new THREE.Vector3(o.x,o.y+.22,o.z+.7));
 ray.set(p,outward.clone().negate());
 const h=ray.intersectObject(e.annexe,true)[0];
 assert(h&&h.object.parent===detail&&h.object.isInstancedMesh,'New opening must be visible outside existing masonry: '+JSON.stringify(o));
}
for(const name of ['Oakmere raised spine slate roof','Oakmere low rear end room slate roof','Oakmere low hall link slate roof']){
 const roof=detail.getObjectByName(name),n=roof.geometry.getAttribute('normal');
 assert(roof,name);for(let i=0;i<n.count;i++)assert(n.getY(i)>0,name+' must have upward-facing slopes');
}
// The latest Carden correction lowers the spine beneath adjoining roofs. Its
// west slope remains continuous; overlap by neighbouring roofs is expected.
// The Carden check separately verifies the new maximum height.
const cap=detail.getObjectByName('Oakmere raised spine slate roof');
for(const x of [-12,-6,0,6,12])for(const offset of [1.5,3.5,6,8]){
 ray.set(detail.localToWorld(new THREE.Vector3(x,30,cap.position.z+offset)),new THREE.Vector3(0,-1,0));
 assert(ray.intersectObject(cap,true).length>0,'Lowered roof remains continuous beneath adjoining roof overlaps');
}
const obstacles=exteriorObstacles(THREE,e.model),view=ANNEXE_VIEWS['oakmere-photo'];
assert(!obstacles.some(o=>obstacleContains(o,view.position[0],view.position[2])),'Photo viewpoint starts on open lawn');
const walker=createWalker(e.camera,obstacles);walker.setView(view);const start=e.camera.position.clone();walker.keys.add('KeyW');walker.update(.1);assert(e.camera.position.distanceTo(start)>.45,'Photo walk can move');
const p=detail.localToWorld(new THREE.Vector3(0,1.8,2.7)),t=detail.localToWorld(new THREE.Vector3(0,1.8,0));
walker.setView({position:p.toArray(),target:t.toArray()});walker.keys.add('KeyW');for(let i=0;i<15;i++)walker.update(.1);
assert(detail.worldToLocal(e.camera.position.clone()).z>1,'Raised facade blocks walking');
const layouts=createAerialLayouts(THREE,e);
for(const historic of [false,true]){layouts.setVisible('historic',historic);let visible=true;for(let o=detail;o;o=o.parent)visible&&=o.visible;assert.equal(visible,historic);}
console.log('PASS: Oakmere glazing is exposed, the west spine slope remains continuous, walking approach and facade collisions work, and details follow Historic visibility.');
