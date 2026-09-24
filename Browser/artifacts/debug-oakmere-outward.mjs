import assert from 'node:assert/strict';
import * as THREE from 'file:///C:/Users/Harry/Documents/_escape-from-1829/Browser/dist/vendor/three.module.js';
import {createEscapeExterior} from 'file:///C:/Users/Harry/Documents/_escape-from-1829/Browser/dist/escape-exterior.mjs';
import {createAerialLayouts} from 'file:///C:/Users/Harry/Documents/_escape-from-1829/Browser/dist/aerial-layouts.mjs';
import {ANNEXE_VIEWS} from 'file:///C:/Users/Harry/Documents/_escape-from-1829/Browser/dist/annexe.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from 'file:///C:/Users/Harry/Documents/_escape-from-1829/Browser/dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},strokeText(){},fillText(){},measureText(t){return {width:t.length*16}}})})};
console.log("const e=");
const e=createEscapeExterior(THREE,16/9),detail=e.annexe.userData.oakmereElevation;
console.log("e.scene.update");
e.scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),outward=new THREE.Vector3(0,0,1).transformDirection(detail.matrixWorld);
// A window count cannot detect a window buried in an adjoining older range.
// Cast against the entire annexe to check every new light, including end rooms.
console.log("for(const o of detail");
for(const o of detail.userData.openings){
 console.log("const p=detail");
const p=detail.localToWorld(new THREE.Vector3(o.x,o.y+.22,o.z+.7));
 ray.set(p,outward.clone().negate());
 const h=ray.intersectObject(e.annexe,true)[0];
 assert(h&&h.object.parent===detail&&h.object.isInstancedMesh,'New opening must be visible outside existing masonry: '+JSON.stringify(o));
}
console.log("for(const name of");
for(const name of ['Oakmere raised spine slate roof','Oakmere low rear end room slate roof','Oakmere low hall link slate roof']){
 const roof=detail.getObjectByName(name),n=roof.geometry.getAttribute('normal');
 assert(roof,name);for(let i=0;i<n.count;i++)assert(n.getY(i)>0,name+' must have upward-facing slopes');
}
// The later Carden photo resolves the east slope as steeper. The west-facing
// slope remains continuous, with its original vertices protected by the
// independent Carden test against the saved pre-edit roof.
console.log("const cap=");
const cap=detail.getObjectByName('Oakmere raised spine slate roof');
for(const x of [-12,-6,0,6,12])for(const offset of [1.5,3.5,6,8]){
 ray.set(detail.localToWorld(new THREE.Vector3(x,30,cap.position.z+offset)),new THREE.Vector3(0,-1,0));
 assert.equal(ray.intersectObject(e.annexe,true)[0]?.object,cap,'West roof remains continuous');
}
console.log("const obstacles=");
const obstacles=exteriorObstacles(THREE,e.model),view=ANNEXE_VIEWS['oakmere-photo'];
assert(!obstacles.some(o=>obstacleContains(o,view.position[0],view.position[2])),'Photo viewpoint starts on open lawn');
console.log("const walker=");
const walker=createWalker(e.camera,obstacles);walker.setView(view);const start=e.camera.position.clone();walker.keys.add('KeyW');walker.update(.1);assert(e.camera.position.distanceTo(start)>.45,'Photo walk can move');
const p=detail.localToWorld(new THREE.Vector3(0,1.8,2.7)),t=detail.localToWorld(new THREE.Vector3(0,1.8,0));
walker.setView({position:p.toArray(),target:t.toArray()});walker.keys.add('KeyW');for(let i=0;i<15;i++)walker.update(.1);
assert(detail.worldToLocal(e.camera.position.clone()).z>1,'Raised facade blocks walking');
console.log("const layouts=");
const layouts=createAerialLayouts(THREE,e);
for(const historic of [false,true]){layouts.setVisible('historic',historic);let visible=true;for(let o=detail;o;o=o.parent)visible&&=o.visible;assert.equal(visible,historic);}
console.log('PASS: Oakmere glazing is exposed, the west spine slope remains continuous, walking approach and facade collisions work, and details follow Historic visibility.');
