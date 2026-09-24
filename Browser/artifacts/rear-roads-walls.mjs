import {readFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
const rows=JSON.parse(readFileSync('Browser/artifacts/rear-roads-geometry.json'));
for(const name of ['Oakmere joined extension brick walls','Oakmere court projecting bay brick walls','Oakmere widened head brick walls','Oakmere blue-face projecting bay brick walls']){
const r=rows.find(r=>r.name===name),m=new THREE.Matrix4().fromArray(r.matrix),p=r.positions,points=[];for(let i=0;i<p.length;i+=3){const q=new THREE.Vector3(...p.slice(i,i+3)).applyMatrix4(m);if(q.y<.1&&!points.some(v=>Math.hypot(v[0]-q.x,v[1]-q.z)<.01))points.push([q.x,q.z]);}console.log(name,JSON.stringify(points));}
