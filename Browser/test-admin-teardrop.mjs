import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from './dist/vendor/three.module.js';
import {createHistoricRoads,ADMIN_TEARDROP,HISTORIC_PAVING} from './dist/historic-roads.mjs';
const terrain={material:new THREE.MeshStandardMaterial()};
const roads=createHistoricRoads(THREE,{terrain,model:new THREE.Group()});roads.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
const surface=p=>{ray.set(new THREE.Vector3(p[0],2,p[1]),new THREE.Vector3(0,-1,0));return ray.intersectObject(roads,true)[0]?.object.userData.surface;};
const normalized=ADMIN_TEARDROP.map(p=>p.map((v,i)=>Math.round((v-ADMIN_TEARDROP[0][i])*1e7)/1e7));
assert.equal(createHash('sha256').update(JSON.stringify(normalized)).digest('hex'),'bd760d9cd0f943e41c075d4ab0a7dee21b4b8db4c440ead466439f2d298700da');
assert.deepEqual(ADMIN_TEARDROP[0],[254,13],'The fixed island does not move');
for(const name of ['Admin teardrop tree-side sweep','Admin teardrop outer lawn sweep']){
 const points=HISTORIC_PAVING.find(a=>a.name===name).points.slice(0,65);
 for(let i=4;i<61;i++){
  const a=points[i-1],b=points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),n=[-dz/length,dx/length];
  for(const [offset,expected] of [[-.15,'black road'],[.3,'stone kerb'],[.85,undefined]])assert.equal(surface(points[i].map((v,k)=>v+n[k]*offset)),expected,name+' continuous asphalt/kerb/lawn at '+i+'/'+offset);
 }
}
for(const [x,start,end] of [[232.6,22.7,40],[235.6,19.5,22.5],[241.6,13,19.3]])
 for(let z=start;z<=end;z+=.2)assert.equal(surface([x,z]),'black road','Paving reaches the actual stepped wall at '+[x,z]);
for(const p of [[246,9],[248,7],[251,30],[253,35]])assert.equal(surface(p),p[1]>20?'grass':'black road','Retain island and fill rear grass wedge');
console.log('PASS: exact island outline and position; both smooth verges; asphalt to stepped walls; no rear grass wedge.');
