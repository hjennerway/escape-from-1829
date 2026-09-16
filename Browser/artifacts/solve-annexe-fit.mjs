import {readFileSync,writeFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('annexe-fit-data.json',import.meta.url))),roads=data.roads;
const road=name=>roads.find(r=>r.name===name).points;
const north=road('Northern Parsons Lane connection'),lane=road('Parsons Lane (North)'),east=road('Annexe inner east road'),admin=road('Admin east crossing drive'),tear=road('Admin teardrop circulation'),front=road('Annexe front avenue');
const loop=[...north.slice(32),...lane.slice(13).reverse(),...east.slice().reverse(),...admin.slice().reverse(),...tear.slice(32),...front];
function inside(p,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
const distance=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
const c=Math.cos(data.original.rotation),s=Math.sin(data.original.rotation),samples=data.ranges.flatMap(r=>r.points.map(([x,z])=>[c*x+s*z,-s*x+c*z]));
const found=[];
for(const scale of [.6,.62,.64,.66,.68,.7])for(let x=377;x<=434;x+=3)for(let z=-24;z<=24;z+=3){
 let clearance=1e9,valid=true;
 for(const p of samples){const q=[x+p[0]*scale,z+p[1]*scale];if(!inside(q,loop)){valid=false;break;}let d=1e9;for(let i=0;i<loop.length;i++)d=Math.min(d,distance(q,loop[i],loop[(i+1)%loop.length]));clearance=Math.min(clearance,d);if(clearance<6){valid=false;break;}}
 if(valid)found.push({x,z,scale,clearance,score:Math.hypot(x-389,z-6)+Math.abs(scale-.66)*100});
}
found.sort((a,b)=>a.score-b.score);console.log(found.slice(0,16));
writeFileSync(new URL('annexe-loop-fit.json',import.meta.url),JSON.stringify({loop,candidates:found},null,2));

