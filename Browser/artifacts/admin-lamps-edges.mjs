import {ADMIN_TEARDROP,HISTORIC_PAVING} from '../dist/historic-road-layout.mjs';
const targets=[[250.9,26.6,2.617623979416721],[252.1,36.3,-1.5518178464663839],[267.9,22,-2.770636843350241]];
const outer=HISTORIC_PAVING.find(p=>p.name==='Admin teardrop outer lawn sweep border').points.slice(0,65);
function closest(points,x,z){let best;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz))),p=[a[0]+t*dx,a[1]+t*dz],d=Math.hypot(x-p[0],z-p[1]);if(!best||d<best.d)best={p,d};}return best;}
for(const [i,[x,z,angle]] of targets.entries()){const {p,d}=closest(i===2?outer:ADMIN_TEARDROP,x,z),nx=(x-p[0])/d,nz=(z-p[1])/d;const half=.17*(Math.abs(nx*Math.cos(angle)-nz*Math.sin(angle))+Math.abs(nx*Math.sin(angle)+nz*Math.cos(angle)));const offset=(i===2?0:.16)+half+.08;console.log({index:i,x:p[0]+nx*offset,z:p[1]+nz*offset,edge:p,clearance:.08});}
