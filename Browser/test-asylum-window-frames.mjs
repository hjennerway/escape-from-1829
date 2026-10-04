import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture as currentArchitecture} from './dist/asylum-architecture.mjs';

const destination=new URL('./artifacts/window-frames/',import.meta.url);
let buildAsylumArchitecture=currentArchitecture;
if(process.argv.includes('--baseline')||process.argv.includes('--baseline-rails')){
 let source=await readFile(process.argv.includes('--baseline')?new URL('before-architecture.mjs.txt',destination):new URL('./dist/asylum-architecture.mjs',import.meta.url),'utf8');
 if(process.argv.includes('--baseline-rails')){
  const finisher=(await readFile(new URL('before-room-finishes.mjs.txt',destination),'utf8')).replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,new URL('./dist/',import.meta.url)).href}'`);
  source=source.replace("'./asylum-room-finishes.mjs'",`'data:text/javascript;base64,${Buffer.from(finisher).toString('base64')}'`);
 }
 source=source.replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,new URL('./dist/',import.meta.url)).href}'`);
 ({buildAsylumArchitecture}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')));
}
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
const ray=new THREE.Raycaster(),matrix=new THREE.Matrix4(),report=[];
let windows=0,frameRays=0,railTriangles=0,retainedRails=0;
for(const floor of floors){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const glass=scene.getObjectByName('Asylum Glass'),sash=scene.getObjectByName('Asylum Sash'),dado=scene.getObjectByName('Asylum Dado');
 const timber=[];
 for(let i=0;i<sash.count;i++){
  sash.getMatrixAt(i,matrix);
  timber.push({centre:new THREE.Vector3().setFromMatrixPosition(matrix),corners:Array.from({length:8},(_,j)=>new THREE.Vector3(j&1?.5:-.5,j&2?.5:-.5,j&4?.5:-.5).applyMatrix4(matrix))});
 }
 const p=dado.geometry.attributes.position,triangles=[];
 for(let i=0;i<p.count;i+=3){
  const tri=new THREE.Triangle(...Array.from({length:3},(_,j)=>new THREE.Vector3().fromBufferAttribute(p,i+j)));
  triangles.push({tri,bounds:new THREE.Box3().setFromPoints([tri.a,tri.b,tri.c])});
 }
 const samples=[];
 for(let i=0;i<glass.count;i++){
  glass.getMatrixAt(i,matrix);
  const centre=new THREE.Vector3().setFromMatrixPosition(matrix),size=new THREE.Vector3().setFromMatrixScale(matrix);
  if(floor.id===0&&centre.y>3)continue; // Entrance transom has its own complete surround.
  const tangent=new THREE.Vector3(1,0,0).transformDirection(matrix),normal=new THREE.Vector3(0,0,1).transformDirection(matrix),scheduled=floor.id>1;
  const low=centre.y-size.y/2,high=centre.y+size.y/2;
  const at=(u,y,v)=>centre.clone().addScaledVector(tangent,u).addScaledVector(normal,v).setY(y);
  const check=(u,y,name)=>{
   for(const side of [-1,1]){
    ray.set(at(u,y,side*.4),normal.clone().multiplyScalar(-side));ray.far=.8;
    assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,name,`Floor ${floor.id} window ${i}: complete frame at ${u},${y} on face ${side}`);frameRays++;
   }
  };
  for(const fraction of [-.4,-.2,0,.2,.4])check(size.x*fraction,scheduled?high-.015:high+.02,'Asylum Sash');
  for(const side of [-1,1])for(const fraction of [.1,.5,.9])check(side*(size.x/2-(scheduled?.035:0)),low+size.y*fraction,'Asylum Sash');
  for(const fraction of [-.4,0,.4])check(size.x*fraction,scheduled?low-.05:low-.015,'Asylum Stone');
  const railHeight=dado.geometry.userData.height,walls=['Asylum Brick','Asylum Plaster'].map(name=>scene.getObjectByName(name));
  for(const edge of [-1,1])for(const side of [-1,1]){
   ray.set(at(edge*(size.x/2+.10),railHeight,side*.4),normal.clone().multiplyScalar(-side));ray.far=.8;
   const hit=ray.intersectObjects(walls,false)[0];
   if(!hit||hit.object.geometry.attributes.roomFinish.getX(hit.face.a)<.5)continue;
   assert(ray.intersectObject(dado,false).length,`Floor ${floor.id} window ${i}: retain the decorated wall's rail beside the frame`);retainedRails++;
  }

  // Inspect the actual timber instance bounds, independently of the rail's
  // exclusion schedule. A triangle/box intersection also catches side-on
  // reveal mouldings and contact missed by a ray through the glass centre.
  const local=v=>{const q=v.clone().sub(centre);return new THREE.Vector3(q.dot(tangent),v.y,q.dot(normal));};
  const frame=timber.filter(t=>{const q=local(t.centre);return Math.abs(q.x)<=size.x/2+.05&&Math.abs(q.z)<.01&&q.y>=low-.05&&q.y<=high+.05;});
  const frameBounds=frame.map(t=>new THREE.Box3().setFromPoints(t.corners.map(local)));
  const worldBounds=new THREE.Box3().setFromPoints(frame.flatMap(t=>t.corners));
  let checked=0;
  for(const {tri,bounds} of triangles){
   if(!bounds.intersectsBox(worldBounds))continue;
   const transformed=new THREE.Triangle(local(tri.a),local(tri.b),local(tri.c));
   for(const box of frameBounds)assert(!box.intersectsTriangle(transformed),`Floor ${floor.id} window ${i}: dado intersects timber frame at ${centre.toArray()}`);
   checked++;railTriangles++;
  }
  samples.push({window:i,centre:centre.toArray(),timberPieces:frame.length,nearbyRailTriangles:checked});windows++;
 }
 report.push({floor:floor.id,windows:samples});
}
assert.equal(windows,274,'Audit every scheduled and generated sash');
await mkdir(destination,{recursive:true});
await writeFile(new URL('geometry.json',destination),JSON.stringify({windows,frameRays,railTriangles,retainedRails,floors:report},null,2)+'\n');
console.log(`PASS: all ${windows} interior windows have complete heads/jambs/sills (${frameRays} rays on both faces), with no dado/timber intersections (${railTriangles} nearby triangles checked) and ${retainedRails} retained neighbouring rails.`);
