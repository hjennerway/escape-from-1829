import {readFile,writeFile} from 'node:fs/promises';
import {buildAsylumLayout,segmentDistance} from '../../dist/asylum-layout.mjs';
const plan=JSON.parse(await readFile(new URL('before-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors;
const result=[];
for(const floor of floors){
 const windows=[];
 for(const wall of floor.walls){
  const {a,b}=wall,length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(!wall.exterior||length<3.5||floor.id>1)continue;
  const count=Math.floor(length/4.2),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
  for(let i=0;i<count;i++){
   const t=length*(i+.5)/count,x=a[0]+dx*t,z=a[1]+dz*t;
   const conflicts=floor.walls.filter(w=>w!==wall).filter(w=>{
    for(let u=-.65;u<=.651;u+=.025)if(segmentDistance(x+dx*u,z+dz*u,w.a,w.b)<.35)return true;
    return false;
   });
   windows.push({x,z,dx,dz,t,length,wall,conflicts});
  }
 }
 result.push({floor:floor.id,count:windows.length,clashes:windows.filter(w=>w.conflicts.length)});
}
await writeFile(new URL('baseline.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.map(f=>({...f,clashes:f.clashes.map(w=>({x:w.x,z:w.z,walls:w.conflicts.map(p=>[p.a,p.b])}))})),null,2));
