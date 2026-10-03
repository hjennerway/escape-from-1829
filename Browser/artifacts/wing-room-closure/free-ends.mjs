import {readFile,writeFile} from 'node:fs/promises';
import {buildAsylumLayout,segmentDistance} from '../../dist/asylum-layout.mjs';
const plan=JSON.parse(await readFile(new URL(process.argv[2]??'../../dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors,output=[];
for(const f of floors){
 const endpoints=[];
 for(const [i,w] of f.walls.entries())if(!w.exterior)for(const end of ['a','b']){
  const p=w[end];
  if(f.walls.some((v,j)=>j!==i&&segmentDistance(...p,v.a,v.b)<.001))continue;
  if(f.doorways.some(d=>Math.abs((p[0]-d.x)*-d.dz+(p[1]-d.z)*d.dx)<.001&&Math.abs(Math.abs((p[0]-d.x)*d.dx+(p[1]-d.z)*d.dz)-d.width/2)<.001))continue;
  if(f.exits.some(e=>Math.hypot(p[0]-e.worldX,p[1]-e.worldZ)<1.3))continue;
  if(f.stairs.some(s=>p[0]>Math.min(...s.points.map(v=>v[0]))-.4&&p[0]<Math.max(...s.points.map(v=>v[0]))+.4&&p[1]>Math.min(...s.points.map(v=>v[1]))-.4&&p[1]<Math.max(...s.points.map(v=>v[1]))+.4))continue;
  const rooms=f.rooms.filter(r=>r.points.some((a,j)=>segmentDistance(...p,a,r.points[(j+1)%r.points.length])<.01)).map(r=>r.id);
  endpoints.push({point:p,wall:[w.a,w.b],rooms});
 }
 output.push({floor:f.id,endpoints});
}
await writeFile(new URL(`./free-ends-${process.argv[2]?'before':'after'}.json`,import.meta.url),JSON.stringify(output,null,2)+'\n');
for(const f of output)console.log(JSON.stringify(f));
