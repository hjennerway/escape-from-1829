import {writeFileSync} from 'node:fs';
const world=[[101.7,4.43,27.7],[116.9,4.43,27.7],[116.9,4.43,57.1],[101.7,4.43,57.1],[102,0,56.8],[116.6,0,56.8],[183.8,.34,52.5],[212.2,.34,52.5],[198,.34,63.6]];
const pixels=[[217,482],[252,456],[372,514],[335,545],[331,558],[367,531],[485,408],[537,372],[551,409]];
const marks=[[497,523],[539,500],[575,479],[606,463],[595,433],[640,443],[679,403],[702,387],[689,327],[747,351],[784,341]];
function solve(a,b){a=a.map((r,i)=>[...r,b[i]]);for(let k=0;k<b.length;k++){let p=k;for(let i=k+1;i<b.length;i++)if(Math.abs(a[i][k])>Math.abs(a[p][k]))p=i;[a[k],a[p]]=[a[p],a[k]];const d=a[k][k];for(let j=k;j<=b.length;j++)a[k][j]/=d;for(let i=0;i<b.length;i++)if(i!==k){const t=a[i][k];for(let j=k;j<=b.length;j++)a[i][j]-=t*a[k][j];}}return a.map(r=>r[b.length]);}
function axes(p){const a=p[3],b=p[4],sa=Math.sin(a),ca=Math.cos(a),sb=Math.sin(b),cb=Math.cos(b);return [[ca,0,-sa],[-sa*sb,cb,-ca*sb],[-sa*cb,-sb,-ca*cb]];}
function project(p,q){const [right,up,forward]=axes(p),d=q.map((v,i)=>v-p[i]),dot=v=>v.reduce((s,n,i)=>s+n*d[i],0),z=dot(forward);return [p[6]+p[5]*dot(right)/z,p[7]-p[5]*dot(up)/z];}
const residual=p=>world.flatMap((q,i)=>project(p,q).map((v,j)=>v-pixels[i][j]));
let p=[-110,200,165,-1.05,.52,1100,557,383],lambda=.01;
for(let n=0;n<500;n++){
 const r=residual(p),score=r.reduce((s,v)=>s+v*v,0),eps=p.map((v,i)=>i===3||i===4?1e-6:.001),cols=p.map((_,i)=>{let q=[...p];q[i]+=eps[i];return residual(q).map((v,j)=>(v-r[j])/eps[i]);});
 const a=p.map((_,i)=>p.map((_,j)=>cols[i].reduce((s,v,k)=>s+v*cols[j][k],0))),b=p.map((_,i)=>-cols[i].reduce((s,v,k)=>s+v*r[k],0));
 for(let i=0;i<p.length;i++)a[i][i]+=lambda*Math.max(1,a[i][i]);
 const step=solve(a,b),q=p.map((v,i)=>v+step[i]),next=residual(q).reduce((s,v)=>s+v*v,0);
 if(next<score){p=q;lambda=Math.max(1e-10,lambda/2);}else lambda*=5;
}
const [r,u,f]=axes(p);
const ground=([x,y])=>{const d=f.map((v,i)=>v+r[i]*(x-p[6])/p[5]-u[i]*(y-p[7])/p[5]),t=-p[1]/d[1];return [p[0]+t*d[0],p[2]+t*d[2]];};
const fit={parameters:p,worldPoints:world,imagePoints:pixels,residuals:world.map((q,i)=>project(p,q).map((v,j)=>v-pixels[i][j])),marks:Object.fromEntries(marks.map((q,i)=>['pine'+(i+1),ground(q)])),pixels:marks};
writeFileSync('Research/admin-pine-trees/placement-fit.json',JSON.stringify(fit,null,2));console.log(fit);

