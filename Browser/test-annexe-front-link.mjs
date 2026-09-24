import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE_MAP_SCALE,annexePoint} from './dist/annexe.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {frontLinkSnapshot} from './artifacts/annexe-front-link-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const exterior=createEscapeExterior(THREE,1.5),annexe=exterior.annexe;
const before=JSON.parse(readFileSync(new URL('../Research/annexe-frontage-adjustment/front-link-before.json',import.meta.url))),after=frontLinkSnapshot(THREE,annexe);
assert.equal(after.primitives,before.primitives);assert.equal(after.sha256,before.sha256,'Every original primitive is unchanged apart from the two rigid translations');
assert.deepEqual(after.root.map(n=>n||0),before.root,'Central entrance and whole-building placement stay fixed');
const moved=['East court inner return','East court front range','East court outer return','East court corner infill','East court back range','East front connecting ward','East end ward','East rear pavilion','East rear link','East end projecting rooms','East end inner return','East end middle rooms','East end front rooms'];
for(const b of before.ranges){
 const a=after.ranges.find(a=>a.name===b.name),shift=moved.includes(b.name)?7*ANNEXE_MAP_SCALE:0;
 assert(a,b.name);assert(Math.abs(a.x-b.x-shift)<1e-9,b.name+' sideways displacement');
 for(const key of ['z','w','d','h','r'])assert.equal(a[key],b[key],b.name+' '+key);
}
assert.equal(after.ranges.length,before.ranges.length+1);
const {west,east}=annexe.userData.frontLinks;
assert.equal(east.scale.x,-1);assert.equal(east.children.length,west.children.length);
for(let i=0;i<west.children.length;i++){
 const a=west.children[i],b=east.children[i];
 assert.equal(a.geometry,b.geometry);assert.equal(a.material,b.material);
 assert.deepEqual(a.matrix.elements,b.matrix.elements);
 if(a.isInstancedMesh)assert.deepEqual(a.instanceMatrix.array,b.instanceMatrix.array);
}
const range=name=>annexe.userData.ranges.find(b=>b.name===name);
for(const side of ['West','East']){
 const link=range(side+' court entrance link'),pavilion=range(side+' front pavilion'),wing=range(side+' court inner return');
 const left=side==='West';
 assert(Math.abs((left?link.x+link.w/2:link.x-link.w/2)-(left?pavilion.x-pavilion.w/2:pavilion.x+pavilion.w/2))<1e-8,'Link joins central pavilion');
 assert((left?link.x-link.w/2:wing.x-wing.w/2)<(left?wing.x+wing.w/2:link.x+link.w/2),'Link overlaps its courtyard wing');
}
assert(Math.abs(range('West court inner return').x+range('West court inner return').w/2+range('East court inner return').x-range('East court inner return').w/2)<1e-9,'Inner courtyard faces mirror about the central entrance');
const obstacles=exteriorObstacles(THREE,exterior.model),ray=new THREE.Raycaster();
for(const side of [-1,1])for(const x of [21,23,25,27]){
 const p=annexePoint(side*x*ANNEXE_MAP_SCALE,1.8,8*ANNEXE_MAP_SCALE);
 assert(obstacles.some(o=>obstacleContains(o,p[0],p[2],0)),'Both corridor walls have walking collisions');
 ray.set(new THREE.Vector3(p[0],40,p[2]),new THREE.Vector3(0,-1,0));
 assert(ray.intersectObject(annexe,true).some(h=>h.object.name===(side<0?'West':'East')+' court entrance link slate roof'),'Both links have continuous roofs');
}
for(const o of annexe.userData.annexeOpenings.filter(o=>o.name==='East court entrance link'&&Math.abs(o.rotation)<.01)){
 const start=annexe.localToWorld(new THREE.Vector3(o.x,o.y,o.z+1));
 ray.set(start,new THREE.Vector3(0,0,-1).transformDirection(annexe.matrixWorld));
 assert(ray.intersectObject(annexe,true)[0]?.object.isInstancedMesh,'Copied corridor front windows remain exposed');
}
const layouts=createAerialLayouts(THREE,exterior);
for(const visible of [false,true]){
 layouts.setVisible('historic',visible);
 for(const root of [west,east,annexe.userData.eastFrontWing,annexe.userData.wards['picton-carden']]){
  let shown=true;for(let p=root;p;p=p.parent)shown&&=p.visible;assert.equal(shown,visible);
 }
}
console.log('PASS: reflected entrance corridor, joined symmetric inner faces, rigid movement of all 13 right-hand ranges, '+after.primitives+' preserved primitives, fixed root, exposed glazing, collisions and Historic visibility.');
