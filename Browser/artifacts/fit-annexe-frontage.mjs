import {readFileSync,writeFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('annexe-fit-data.json',import.meta.url))),fixed=JSON.parse(readFileSync(new URL('../../Research/annexe-photo-placement/fixed-roads.json',import.meta.url))),loop=fixed.loop;
const c=Math.cos(d.original.rotation),s=Math.sin(d.original.rotation),scale=.72,polys=d.ranges.map(r=>r.points);
const rotated=polys.flat().map(([x,z])=>[c*x+s*z,-s*x+c*z]);
const inside=(p,poly)=>{let h=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])h=!h;}return h;};
const dist=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
const samples=fixed.roads.filter(r=>!/^Annexe rear /.test(r.name)).flatMap(r=>r.points.slice(1).flatMap((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1e-6)return [];const steps=Math.ceil(length/.7),half=(r.width??6)/2+1.2,out=[];for(let j=0;j<=steps;j++)for(const offset of [-half,0,half])out.push({name:r.name,p:[a[0]+dx*j/steps-dz/length*offset,a[1]+dz*j/steps+dx/length*offset]});return out;}));
const results=[];
for(let x=362;x<=410;x+=2)for(let z=-74;z<=-8;z+=2){
 let gap=Infinity,valid=true;
 for(const p of rotated){const q=[x+p[0]*scale,z+p[1]*scale];if(!inside(q,loop)){valid=false;break;}for(let i=0;i<loop.length;i++)gap=Math.min(gap,dist(q,loop[i],loop[(i+1)%loop.length]));if(gap<6){valid=false;break;}}
 if(!valid)continue;
 const hits={};for(const {name,p} of samples){const dx=p[0]-x,dz=p[1]-z,q=[(c*dx-s*dz)/scale,(s*dx+c*dz)/scale];if(polys.some(poly=>inside(q,poly)))hits[name]=(hits[name]??0)+1;}
 const front=[x+s*27.55*scale,z+c*27.55*scale],frontGap=dist(front,[251.45,3.47],[428.5,-186.86848406675448]);
 results.push({x,z,scale,gap,frontGap,hits,count:Object.values(hits).reduce((a,b)=>a+b,0)});
}
results.sort((a,b)=>a.count-b.count||a.frontGap-b.frontGap);
console.log(results.slice(0,15));writeFileSync(new URL('annexe-frontage-fit.json',import.meta.url),JSON.stringify(results,null,2));

