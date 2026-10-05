import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,insidePolygon,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture as currentArchitecture} from './dist/asylum-architecture.mjs';

const destination=new URL('./artifacts/window-clearance/',import.meta.url),before=process.argv.includes('--before');
let buildAsylumArchitecture=currentArchitecture;
if(before){
 const source=(await readFile(new URL('before-architecture.mjs.txt',destination),'utf8')).replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,new URL('./dist/',import.meta.url)).href}'`);
 ({buildAsylumArchitecture}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')));
}
const plan=JSON.parse(await readFile(before?new URL('before-plan.json',destination):new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors,ray=new THREE.Raycaster(),matrix=new THREE.Matrix4(),report=[];
let panes=0,clearanceSamples=0;
for(const floor of floors){
 const scene=new THREE.Scene(),snapshot=JSON.stringify(floor.walls);buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const glass=scene.getObjectByName('Asylum Glass');assert.equal(glass.count,[128,130,12,31][floor.id],'Retain lower windows and the Reception transom; include the Library upper sashes');
 const windows=[];
 for(let i=0;i<glass.count;i++){
  glass.getMatrixAt(i,matrix);
  const e=matrix.elements,x=e[12],y=e[13],z=e[14],width=Math.hypot(e[0],e[2]),height=e[5],dx=e[0]/width,dz=e[2]/width;
  if(floor.id===0&&y>3)continue; // D1 transom belongs to its deep entrance surround.
  const scheduled=floor.id>1,nx=-dz,nz=dx;
  const inward=floor.outline.loops.some(loop=>insidePolygon(x+nx*.5,z+nz*.5,loop))?1:-1;
  // Independently inspect the whole sill perimeter, including its depth,
  // against every other wall. Collinear runs form the hosting window wall.
  for(const wall of floor.walls){
   // Explicit basement/upper schedules use existing exterior reveals; audit
   // their internal partitions without treating facade returns as partitions.
   if(scheduled&&wall.exterior)continue;
   if([wall.a,wall.b].every(p=>Math.abs((p[0]-x)*nx+(p[1]-z)*nz)<1e-5))continue;
   for(let j=0;j<=28;j++)for(const depth of [-.16,0,.16]){
    const u=(width+.2)*(j/28-.5),gap=segmentDistance(x+dx*u+nx*depth,z+dz*u+nz*depth,wall.a,wall.b)-.09;
    assert(gap>=.15-1e-5,`Floor ${floor.id}, window ${i} at ${x},${z}: sill/partition gap ${gap.toFixed(4)} is below 0.15 (${JSON.stringify(wall)})`);clearanceSamples++;
   }
  }
  const us=scheduled?[-width/3,0,width/3]:[-width*.25,width*.25];
  const ys=scheduled?Array.from({length:6},(_,row)=>y-height/2+height*(row+.5)/6):[y-height*.25,y+height*.25];
  for(const u of us)for(const py of ys){
   ray.set(new THREE.Vector3(x+dx*u+nx*inward*.6,py,z+dz*u+nz*inward*.6),new THREE.Vector3(-nx*inward,0,-nz*inward));ray.far=.8;
   assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Asylum Glass',`Floor ${floor.id} window ${i}: every pane remains visible from the room`);panes++;
  }
  assert(!flatWalkable(floor,x,z),'Glazing retains solid walking collision');
  windows.push({x,z,width,height,dx,dz,inward});
 }
 assert.equal(JSON.stringify(floor.walls),snapshot,'Window fitting leaves wall and navigation data intact');
 report.push({floor:floor.id,windows});
}
await mkdir(destination,{recursive:true});
await writeFile(new URL('clearance.json',destination),JSON.stringify({panes,clearanceSamples,floors:report},null,2)+'\n');
console.log(`PASS: 300 windows and the Reception transom across four floors, ${panes} unobstructed panes, ${clearanceSamples} sill-to-wall clearance samples, retained lower window counts and collision.`);
