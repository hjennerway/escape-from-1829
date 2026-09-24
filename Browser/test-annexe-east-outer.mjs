import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE_MAP_SCALE as S} from './dist/annexe.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {eastOuterProtected} from './artifacts/east-outer-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,1.5),a=e.annexe,g=a.userData.eastFrontWing,v=a.userData.eastVeranda;
e.model.updateMatrixWorld(true);
assert.deepEqual(eastOuterProtected(THREE,a),JSON.parse(readFileSync(new URL('../Research/annexe-east-outer/protected-before.json',import.meta.url))),'Retained east-wing geometry stays exact outside the marked works');
assert(!a.userData.ranges.some(b=>['East end inner return','East end middle rooms'].includes(b.name)));
const obs=exteriorObstacles(THREE,e.model),ray=new THREE.Raycaster();
const point=(x,y,z)=>g.localToWorld(new THREE.Vector3(x*S,y,z*S));
const down=(x,z)=>{const p=point(x,40,z);ray.set(p,new THREE.Vector3(0,-1,0));return ray.intersectObject(g,true)};
for(const [x,z] of [[80,-13],[83,-7],[83,0],[89,-8],[92,-6]]){
 const p=point(x,1,z);
 assert(!obs.some(o=>obstacleContains(o,p.x,p.z,.1)),'Removed red area is walkable');
 assert.equal(down(x,z).filter(h=>h.point.y>.5).length,0,'Removed red area is open to the sky');
}
for(const z of [-13,-10,-6,-2]){
 const hits=down(97,z),roof=hits.find(h=>h.object.name==='East rear link slate roof');
 assert(roof,'Yellow area retains continuous low link coverage');
 assert(hits[0].point.y<=5.61*a.scale.y,'Yellow roof is lowered to the existing single-storey link');
}
assert.equal(v.parent,g);
const {wall,front,start,end,posts}=v.userData;
for(const x of [wall+.4,(wall+front)/2,front-.2])for(const z of [start+.4,(start+end)/2,end-.4]){
 const p=v.localToWorld(new THREE.Vector3(x,40,z));ray.set(p,new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(v,true)[0];assert.equal(hit?.object.name,'East veranda slate canopy');
 assert(hit.face.normal.clone().transformDirection(hit.object.matrixWorld).y>0,'Canopy faces upwards');
}
const middleZ=(posts[3][1]+posts[4][1])/2;
for(const x of [wall+1.5,(wall+front)/2,front,front+1]){
 const p=v.localToWorld(new THREE.Vector3(x,1,middleZ));assert(!obs.some(o=>obstacleContains(o,p.x,p.z,.2)),'Sheltered walkway and open front remain accessible');
}
for(const [x,z] of posts.slice(1,-1)){
 const p=v.localToWorld(new THREE.Vector3(x,1,z));assert(obs.some(o=>obstacleContains(o,p.x,p.z,.05)),'Veranda post bases participate in collisions');
}
const walker=createWalker(e.camera,obs);
walker.setView({position:v.localToWorld(new THREE.Vector3(front+2,2.5,middleZ)).toArray(),target:v.localToWorld(new THREE.Vector3(wall,2.5,middleZ)).toArray()});
walker.keys.add('KeyW');for(let i=0;i<8;i++)walker.update(.1);
assert(v.worldToLocal(e.camera.position.clone()).x<front,'Walker can enter between veranda posts');
const layouts=createAerialLayouts(THREE,e),visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true};
layouts.setVisible('historic',false);assert(!visible(v));layouts.setVisible('historic',true);assert(visible(v));
console.log('PASS: removed red wing, lowered continuous yellow link, veranda roof and walking access, retained east geometry and historic visibility.');
