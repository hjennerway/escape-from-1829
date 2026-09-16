import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('annexe-fit-data.json',import.meta.url))),c=Math.cos(d.original.rotation),s=Math.sin(d.original.rotation);
const polygons=d.ranges.map(r=>r.points);
function inside(p,poly){let h=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])h=!h;}return h;}
const samples=d.roads.flatMap(r=>r.points.slice(1).flatMap((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),steps=Math.ceil(length/.7),half=(r.width??6)/2+.6,out=[];for(let j=0;j<=steps;j++)for(const offset of [-half,0,half])out.push({name:r.name,p:[a[0]+dx*j/steps-dz/length*offset,a[1]+dz*j/steps+dx/length*offset]});return out;}));
const results=[];
for(let x=392;x<=416;x+=3)for(let z=-18;z<=0;z+=3){const scale=.64,hits={};for(const {name,p} of samples){const dx=p[0]-x,dz=p[1]-z,q=[(c*dx-s*dz)/scale,(s*dx+c*dz)/scale];if(polygons.some(poly=>inside(q,poly)))hits[name]=(hits[name]??0)+1;}results.push({x,z,scale,hits,count:Object.values(hits).reduce((a,b)=>a+b,0)});}
results.sort((a,b)=>a.count-b.count||Math.hypot(a.x-398,a.z+3)-Math.hypot(b.x-398,b.z+3));console.log(results.slice(0,15));
