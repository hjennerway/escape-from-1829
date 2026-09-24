import {ANNEXE_TRIANGLE_CORNERS,IRBY_ANNEXE_APPROACH} from '../dist/annexe-loop-road.mjs';
import {ANNEXE_FRONT_FAR_JOIN} from '../dist/annexe-front-roads.mjs';
const sub=(a,b)=>a.map((v,i)=>v-b[i]),unit=v=>v.map(n=>n/Math.hypot(...v)),add=(a,b,s=1)=>a.map((v,i)=>v+b[i]*s),right=([x,z])=>[z,-x];
const [,far,near]=ANNEXE_TRIANGLE_CORNERS,u=unit(sub(far,near)),ps=IRBY_ANNEXE_APPROACH.points,i=ps.findIndex(p=>p[0]>=309),v=unit(sub(ps[i-1],ps[i])),a=add(ANNEXE_FRONT_FAR_JOIN[0],right(u),3),d=add(ps[i],right(v),3),tree=[312.93895552677026,-84.26346643953582];
for(const h1 of [4,6,8,10,12])for(const h2 of [2,4,6,8]){const b=add(a,u,h1),c=add(d,v,-h2),points=Array.from({length:301},(_,i)=>{const t=i/300,q=1-t;return a.map((x,k)=>q*q*q*x+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]);});const dist=Math.min(...points.map(p=>Math.hypot(...sub(p,tree))));if(dist>2.4&&dist<3.5)console.log(h1,h2,dist);}
