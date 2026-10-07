import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {avoidWindowDownpipes,collectDownpipeWindows,markDownpipeInstances} from './dist/downpipe-clearance.mjs';

// Independent rectangle projection check, including frames/sills and pipe width.
function assertClear(root){
 const {windows,pipes}=collectDownpipeWindows(THREE,root);
 for(const pipe of pipes)for(const window of windows){
  const bounds=new THREE.Box3().setFromPoints(pipe.corners);
  if(bounds.max.y<window.centre.y-window.halfHeight-.12||bounds.min.y>window.centre.y+window.halfHeight+.12)continue;
  const tangent=pipe.corners.map(p=>p.clone().sub(window.centre).dot(window.tangent));
  const normal=pipe.corners.map(p=>p.clone().sub(window.centre).dot(window.normal));
  assert(Math.min(...normal)>=.4||Math.max(...normal)<=-.4||Math.min(...tangent)>=window.halfWidth+.19999||Math.max(...tangent)<=-window.halfWidth-.19999,
   `Downpipe ${pipe.mesh.name} ${pipe.index} must clear ${window.mesh.name} ${window.index}`);
 }
 return {windows:windows.length,pipes:pipes.length};
}

// Staggered rows and an adjacent sash force placement beside the complete bank,
// rather than clearing just the first opening.
for(const [angle,scale] of [[0,[1,1,1]],[Math.PI/4,[1.6,.9,1.6]],[.71,[-1.2,1.1,1.2]]]){
 const root=new THREE.Group();root.rotation.y=angle;root.scale.set(...scale);root.position.set(25,0,-12);
 const glass=new THREE.MeshStandardMaterial({color:0x587887,metalness:.15,roughness:.45});glass.userData.windowGlass=true;
 for(const [x,y,width] of [[0,2,1.4],[.4,6,1.4],[-1.8,2,1.2]]){
  const pane=new THREE.Mesh(new THREE.BoxGeometry(width,2,.06),glass);pane.position.set(x,y,.06);root.add(pane);
 }
 const pipe=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial(),3);
 const dummy=new THREE.Object3D();
 for(const [i,x,y,h] of [[0,0,4,8],[1,0,1,.06],[2,5,4,8]]){dummy.position.set(x,y,.18);dummy.scale.set(.1,h,.1);dummy.updateMatrix();pipe.setMatrixAt(i,dummy.matrix);}
 markDownpipeInstances(pipe,[{downpipe:{pipe:true,assembly:'a'}},{downpipe:{assembly:'a'}},{downpipe:true}]);root.add(pipe);
 const initial=new THREE.Matrix4();pipe.getMatrixAt(2,initial);
 const report=avoidWindowDownpipes(THREE,root);assert.equal(report.moved.length,1);assertClear(root);
 const body=new THREE.Matrix4(),bracket=new THREE.Matrix4(),clear=new THREE.Matrix4();pipe.getMatrixAt(0,body);pipe.getMatrixAt(1,bracket);pipe.getMatrixAt(2,clear);
 assert.equal(body.elements[12],bracket.elements[12],'Brackets follow their pipe');assert.deepEqual(clear,initial,'Already clear pipes stay exact');
 const margin=.2/Math.abs(scale[0]);
 const expected=margin>=.2?.4+.7+.05+margin:-(.7+.05+margin);
 assert(Math.abs(body.elements[12]-expected)<.0001,'Nearest clear pier is beside the upper staggered sash');
 assert.equal(avoidWindowDownpipes(THREE,root).moved.length,0,'Placement is idempotent');
}

// The nearer right-side gap would cross a sash on the perpendicular return.
{
 const root=new THREE.Group(),glass=new THREE.MeshStandardMaterial();glass.userData.windowGlass=true;
 for(const [x,z,r] of [[0,.06,0],[1.1,.2,Math.PI/2]]){
  const pane=new THREE.Mesh(new THREE.BoxGeometry(1.4,2,.06),glass);pane.position.set(x,2,z);pane.rotation.y=r;root.add(pane);
 }
 const pipe=new THREE.Mesh(new THREE.BoxGeometry(.1,4,.1),new THREE.MeshStandardMaterial());pipe.name='Corner downpipe';pipe.position.set(0,2,.18);root.add(pipe);
 avoidWindowDownpipes(THREE,root);assertClear(root);
 assert(pipe.position.x<-.94&&pipe.position.x>-.96,'Corner pipe moves left to clear both wall faces');
}

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},clearRect(){},measureText(t){return {width:t.length*16};}})})};
const exterior=createEscapeExterior(THREE,16/9);
assert(exterior.model.userData.downpipeClearance.moved.length>=25,'Existing overlaps are repaired across the estate');
const gameplay=assertClear(exterior.model);assert(gameplay.pipes>=246&&gameplay.windows>=3000);
const ray=new THREE.Raycaster();
for(const [origin,direction] of [[[28.95,1.23,-37],[0,0,1]],[[-43,6.63,29.03], [1,0,0]]]){
 ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));
 const hit=ray.intersectObject(exterior.model,true)[0];
 assert(hit&&hit.object.material.metalness>=.08,'The formerly obstructed basement and west side panes are exposed');
}
createAerialLayouts(THREE,exterior);const assembled=assertClear(exterior.model);
assert(assembled.pipes>gameplay.pipes,'Late service-building downpipes are included');
assert.equal(avoidWindowDownpipes(THREE,exterior.model).moved.length,0);
console.log(`PASS: ${assembled.pipes} downpipes clear ${assembled.windows} windows; staggered rows, rotated/mirrored parents, brackets, unchanged clear pipes and exposed former overlaps.`);
