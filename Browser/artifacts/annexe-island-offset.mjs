import {readFileSync,writeFileSync} from 'node:fs';
const p='Browser/dist/irby-junction-rounding.mjs';let s=readFileSync(p,'utf8');
const start=s.indexOf('// Inset each road edge'),end=s.indexOf('const island=[],arcs=[];',start);
s=s.slice(0,start)+`// Offset the curved lane on its island side, then clip to the two straight
// road verges. This retains the concave sweep without extending its tangents.
const forkNormals=ANNEXE_TRIANGLE_FORK.map((p,i)=>left(unit(sub(ANNEXE_TRIANGLE_FORK[Math.min(i+1,ANNEXE_TRIANGLE_FORK.length-1)],ANNEXE_TRIANGLE_FORK[Math.max(0,i-1)]))));
const offset=ANNEXE_TRIANGLE_FORK.map((p,i)=>add(p,forkNormals[i],3+ROAD_STYLE.edgeWidth));
const incoming=unit(sub(far,apex)),outgoing=unit(sub(near,far));
const a=add(far,left(incoming),3+ROAD_STYLE.edgeWidth),b=add(far,left(outgoing),3+ROAD_STYLE.edgeWidth);
const farInset=add(a,incoming,cross(sub(b,a),outgoing)/cross(incoming,outgoing));
let sharp=[offset.at(-1),farInset,...offset.slice(0,-1)];
for(const [a,b] of [[apex,far],[far,near]]){
 const normal=left(unit(sub(b,a))),distance=p=>sub(p,a).reduce((s,v,k)=>s+v*normal[k],0)-(3+ROAD_STYLE.edgeWidth);
 const clipped=[];
 for(let j=0;j<sharp.length;j++){
  const p=sharp[j],q=sharp[(j+1)%sharp.length],dp=distance(p),dq=distance(q);
  if(dp>=-1e-8)clipped.push(p);
  if((dp>=0)!==(dq>=0))clipped.push(add(p,sub(q,p),dp/(dp-dq)));
 }
 sharp=clipped.filter((p,i)=>Math.hypot(...sub(p,clipped[(i+1)%clipped.length]))>1e-6);
}
`+s.slice(end);
// Small concave samples follow the offset curve directly; round its three tips.
s=s.replace('const angle=Math.acos',"if(cross(sub(corner,prev),sub(next,corner))<0){island.push(corner);continue;}\n const angle=Math.acos");writeFileSync(p,s);
