import {readFile,writeFile} from 'node:fs/promises';
import {buildAsylumLayout,segmentDistance} from '../../dist/asylum-layout.mjs';
const plan=JSON.parse(await readFile(new URL('./plan-before.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
const result=[];
for(const f of floors)for(const r of f.rooms){
 if(!r.doorSide||r.corridorClipping===false)continue;
 const changed=[];
 for(let i=0;i<r.points.length;i++){
  if(r.openEdges?.includes(i)||r.solidEdges?.includes(i))continue;
  const a=r.points[i],b=r.points[(i+1)%r.points.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const spans=f.walls.filter(w=>!w.exterior&&[w.a,w.b].every(p=>segmentDistance(...p,a,b)<.301)&&Math.abs((w.b[0]-w.a[0])*(b[1]-a[1])-(w.b[1]-w.a[1])*(b[0]-a[0]))<1e-5);
  const covered=spans.reduce((s,w)=>s+Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),0);
  const gaps=[];
  for(let n=0;n<100;n++){
   const t=(n+.5)/100,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
   const inCorridor=f.corridors.some(c=>c.points.slice(1).some((p,j)=>segmentDistance(x,z,c.points[j],p)<c.width/2-.1));
   if(inCorridor&&!f.walls.some(w=>segmentDistance(x,z,w.a,w.b)<.02))gaps.push([x,z]);
  }
  if(gaps.length&&len-covered>.35)changed.push({edge:i,a,b,length:+len.toFixed(2),covered:+covered.toFixed(2),walls:spans.map(w=>[w.a,w.b])});
 }
 if(changed.length)result.push({floor:f.id,room:r.id,changed});
}
await writeFile(new URL('./audit-before.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
for(const r of result)console.log(JSON.stringify(r));
